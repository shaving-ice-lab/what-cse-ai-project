package scheduler

import (
	"context"
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"go.uber.org/zap"

	"github.com/what-cse/server/internal/crawler"
)

// TaskHandlers holds all task handlers and their dependencies
type TaskHandlers struct {
	Logger          *zap.Logger
	SpiderConfig    *crawler.SpiderConfig
	ListPageRepo    ListPageRepository
	AnnouncementRepo AnnouncementRepository
	CrawlTaskRepo   CrawlTaskRepository
}

// ListPageRepository interface for list page operations
type ListPageRepository interface {
	GetByID(id uint) (*crawler.ListPage, error)
	GetActive() ([]crawler.ListPage, error)
	GetByFrequency(frequency string) ([]crawler.ListPage, error)
	UpdateLastCrawl(id uint, crawledAt time.Time, articleCount int) error
}

// AnnouncementRepository interface for announcement operations
type AnnouncementRepository interface {
	Create(announcement *crawler.Announcement) (uint, error)
	GetByID(id uint) (*crawler.Announcement, error)
	GetByURL(url string) (*crawler.Announcement, error)
}

// CrawlTaskRepository interface for crawl task operations
type CrawlTaskRepository interface {
	Create(task *CrawlTaskRecord) error
	UpdateStatus(taskID string, status string, result interface{}, errorMsg string) error
	UpdateProgress(taskID string, progress float64) error
}

// CrawlTaskRecord represents a crawl task database record
type CrawlTaskRecord struct {
	TaskID       string      `json:"task_id"`
	TaskType     string      `json:"task_type"`
	TaskName     string      `json:"task_name"`
	TaskParams   interface{} `json:"task_params"`
	Status       string      `json:"status"`
	Progress     float64     `json:"progress"`
	Result       interface{} `json:"result"`
	ErrorMessage string      `json:"error_message"`
	StartedAt    time.Time   `json:"started_at"`
	CompletedAt  *time.Time  `json:"completed_at"`
}

// NewTaskHandlers creates a new task handlers instance
func NewTaskHandlers(
	logger *zap.Logger,
	spiderConfig *crawler.SpiderConfig,
	listPageRepo ListPageRepository,
	announcementRepo AnnouncementRepository,
	crawlTaskRepo CrawlTaskRepository,
) *TaskHandlers {
	return &TaskHandlers{
		Logger:          logger,
		SpiderConfig:    spiderConfig,
		ListPageRepo:    listPageRepo,
		AnnouncementRepo: announcementRepo,
		CrawlTaskRepo:   crawlTaskRepo,
	}
}

// HandleListMonitor handles the list monitor task
func (h *TaskHandlers) HandleListMonitor(ctx context.Context, task *asynq.Task) error {
	payload, err := ParseListMonitorPayload(task)
	if err != nil {
		return fmt.Errorf("failed to parse payload: %w", err)
	}

	taskID := task.ResultWriter().TaskID()
	h.Logger.Info("Starting list monitor task",
		zap.String("task_id", taskID),
		zap.Ints("list_page_ids", intsFromUints(payload.ListPageIDs)),
	)

	// Record task start
	if h.CrawlTaskRepo != nil {
		h.CrawlTaskRepo.Create(&CrawlTaskRecord{
			TaskID:     taskID,
			TaskType:   TypeListMonitor,
			TaskName:   "列表页监控",
			TaskParams: payload,
			Status:     "running",
			StartedAt:  time.Now(),
		})
	}

	// Get list pages to monitor
	var listPages []crawler.ListPage
	if len(payload.ListPageIDs) > 0 {
		for _, id := range payload.ListPageIDs {
			page, err := h.ListPageRepo.GetByID(id)
			if err != nil {
				h.Logger.Warn("Failed to get list page",
					zap.Uint("id", id),
					zap.Error(err),
				)
				continue
			}
			listPages = append(listPages, *page)
		}
	} else {
		listPages, err = h.ListPageRepo.GetActive()
		if err != nil {
			return fmt.Errorf("failed to get active list pages: %w", err)
		}
	}

	if len(listPages) == 0 {
		h.Logger.Info("No list pages to monitor")
		return nil
	}

	// Create and run spider
	spider := crawler.NewListMonitorSpider(h.SpiderConfig, h.Logger)
	spider.SetListPages(listPages)

	result, err := spider.Run()
	if err != nil {
		if h.CrawlTaskRepo != nil {
			h.CrawlTaskRepo.UpdateStatus(taskID, "failed", nil, err.Error())
		}
		return fmt.Errorf("spider run failed: %w", err)
	}

	// Update task status
	if h.CrawlTaskRepo != nil {
		h.CrawlTaskRepo.UpdateStatus(taskID, "completed", result, "")
	}

	h.Logger.Info("List monitor task completed",
		zap.String("task_id", taskID),
		zap.Int("total_found", result.TotalFound),
		zap.Int("new_articles", result.NewArticles),
	)

	return nil
}

// HandleAnnouncementCrawl handles the announcement crawl task
func (h *TaskHandlers) HandleAnnouncementCrawl(ctx context.Context, task *asynq.Task) error {
	payload, err := ParseAnnouncementCrawlPayload(task)
	if err != nil {
		return fmt.Errorf("failed to parse payload: %w", err)
	}

	taskID := task.ResultWriter().TaskID()
	h.Logger.Info("Starting announcement crawl task",
		zap.String("task_id", taskID),
		zap.String("url", payload.URL),
	)

	// Check if already crawled
	existing, _ := h.AnnouncementRepo.GetByURL(payload.URL)
	if existing != nil {
		h.Logger.Info("Announcement already exists",
			zap.String("url", payload.URL),
		)
		return nil
	}

	// Create article from payload
	article := crawler.Article{
		URL:          payload.URL,
		Title:        payload.Title,
		SourceListID: payload.SourceListID,
		SourceName:   payload.SourceName,
		Category:     payload.Category,
	}

	// Create and run spider
	spider := crawler.NewAnnouncementSpider(h.SpiderConfig, h.Logger)
	spider.SetArticles([]crawler.Article{article})

	result, err := spider.Run()
	if err != nil {
		return fmt.Errorf("spider run failed: %w", err)
	}

	// Save announcements
	for _, announcement := range result.Announcements {
		announcementID, err := h.AnnouncementRepo.Create(&announcement)
		if err != nil {
			h.Logger.Error("Failed to save announcement",
				zap.String("url", announcement.URL),
				zap.Error(err),
			)
			continue
		}

		h.Logger.Info("Announcement saved",
			zap.Uint("id", announcementID),
			zap.String("title", announcement.Title),
		)
	}

	return nil
}

// HandlePositionExtract handles the position extract task
func (h *TaskHandlers) HandlePositionExtract(ctx context.Context, task *asynq.Task) error {
	payload, err := ParsePositionExtractPayload(task)
	if err != nil {
		return fmt.Errorf("failed to parse payload: %w", err)
	}

	taskID := task.ResultWriter().TaskID()
	h.Logger.Info("Starting position extract task",
		zap.String("task_id", taskID),
		zap.Uint("announcement_id", payload.AnnouncementID),
	)

	// Get announcement
	announcement, err := h.AnnouncementRepo.GetByID(payload.AnnouncementID)
	if err != nil {
		return fmt.Errorf("announcement not found: %w", err)
	}

	// Create position spider and extract
	spider := crawler.NewPositionSpider(h.Logger)
	result, err := spider.ExtractFromAnnouncement(announcement)
	if err != nil {
		return fmt.Errorf("extraction failed: %w", err)
	}

	h.Logger.Info("Position extraction completed",
		zap.Uint("announcement_id", payload.AnnouncementID),
		zap.Int("positions_count", len(result.Positions)),
		zap.Int("confidence", result.Confidence),
	)

	return nil
}

// HandleScheduledMonitor handles scheduled monitoring tasks
func (h *TaskHandlers) HandleScheduledMonitor(ctx context.Context, task *asynq.Task) error {
	payload, err := ParseScheduledMonitorPayload(task)
	if err != nil {
		return fmt.Errorf("failed to parse payload: %w", err)
	}

	h.Logger.Info("Starting scheduled monitor task",
		zap.String("frequency", payload.Frequency),
	)

	// Get list pages by frequency
	listPages, err := h.ListPageRepo.GetByFrequency(payload.Frequency)
	if err != nil {
		return fmt.Errorf("failed to get list pages: %w", err)
	}

	if len(listPages) == 0 {
		h.Logger.Info("No list pages for frequency",
			zap.String("frequency", payload.Frequency),
		)
		return nil
	}

	// Get IDs
	var ids []uint
	for _, page := range listPages {
		ids = append(ids, page.ID)
	}

	// Create list monitor task with these IDs
	monitorTask, err := NewListMonitorTask(ids)
	if err != nil {
		return err
	}

	// This would need access to the scheduler to enqueue
	// For now, just run directly
	return h.HandleListMonitor(ctx, monitorTask)
}

// RegisterHandlers registers all task handlers with the scheduler
func (h *TaskHandlers) RegisterHandlers(scheduler *Scheduler) {
	scheduler.RegisterHandler(TypeListMonitor, asynq.HandlerFunc(h.HandleListMonitor))
	scheduler.RegisterHandler(TypeAnnouncementCrawl, asynq.HandlerFunc(h.HandleAnnouncementCrawl))
	scheduler.RegisterHandler(TypePositionExtract, asynq.HandlerFunc(h.HandlePositionExtract))
	scheduler.RegisterHandler(TypeScheduledMonitor, asynq.HandlerFunc(h.HandleScheduledMonitor))

	h.Logger.Info("Task handlers registered",
		zap.Strings("types", []string{
			TypeListMonitor,
			TypeAnnouncementCrawl,
			TypePositionExtract,
			TypeScheduledMonitor,
		}),
	)
}

// Helper function to convert []uint to []int for logging
func intsFromUints(uints []uint) []int {
	ints := make([]int, len(uints))
	for i, u := range uints {
		ints[i] = int(u)
	}
	return ints
}
