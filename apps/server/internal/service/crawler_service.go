package service

import (
	"context"
	"errors"
	"time"

	"github.com/hibiken/asynq"
	"go.uber.org/zap"

	"github.com/what-cse/server/internal/crawler"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/scheduler"
)

var (
	ErrListPageNotFound = errors.New("list page not found")
	ErrListPageExists   = errors.New("list page with this URL already exists")
	ErrTaskNotFound     = errors.New("task not found")
)

type CrawlerService struct {
	listPageRepo  *repository.ListPageRepository
	crawlTaskRepo *repository.CrawlTaskRepository
	crawlLogRepo  *repository.CrawlLogRepository
	scheduler     *scheduler.Scheduler
	spiderConfig  *crawler.SpiderConfig
	logger        *zap.Logger
}

func NewCrawlerService(
	listPageRepo *repository.ListPageRepository,
	crawlTaskRepo *repository.CrawlTaskRepository,
	crawlLogRepo *repository.CrawlLogRepository,
	sched *scheduler.Scheduler,
	spiderConfig *crawler.SpiderConfig,
	logger *zap.Logger,
) *CrawlerService {
	return &CrawlerService{
		listPageRepo:  listPageRepo,
		crawlTaskRepo: crawlTaskRepo,
		crawlLogRepo:  crawlLogRepo,
		scheduler:     sched,
		spiderConfig:  spiderConfig,
		logger:        logger,
	}
}

// NewCrawlerServiceSimple creates a simple crawler service (for backwards compatibility)
func NewCrawlerServiceSimple(listPageRepo *repository.ListPageRepository) *CrawlerService {
	return &CrawlerService{
		listPageRepo: listPageRepo,
	}
}

type CrawlerTaskStatus struct {
	TaskID    string     `json:"task_id"`
	Status    string     `json:"status"` // pending, running, completed, failed
	StartTime time.Time  `json:"start_time"`
	EndTime   *time.Time `json:"end_time,omitempty"`
	Message   string     `json:"message,omitempty"`
}

type CrawlerStats struct {
	TotalListPages    int64            `json:"total_list_pages"`
	ActiveListPages   int64            `json:"active_list_pages"`
	ListPagesByStatus map[string]int64 `json:"list_pages_by_status"`
	LastCrawlTime     *time.Time       `json:"last_crawl_time,omitempty"`
}

type CreateListPageRequest struct {
	URL               string `json:"url" validate:"required"`
	SourceName        string `json:"source_name"`
	Category          string `json:"category"`
	CrawlFrequency    string `json:"crawl_frequency"`
	ArticleSelector   string `json:"article_selector"`
	PaginationPattern string `json:"pagination_pattern"`
}

type UpdateListPageRequest struct {
	SourceName        *string `json:"source_name,omitempty"`
	Category          *string `json:"category,omitempty"`
	CrawlFrequency    *string `json:"crawl_frequency,omitempty"`
	ArticleSelector   *string `json:"article_selector,omitempty"`
	PaginationPattern *string `json:"pagination_pattern,omitempty"`
	Status            *string `json:"status,omitempty"`
}

type TriggerCrawlerRequest struct {
	ListPageID *uint  `json:"list_page_id,omitempty"`
	SpiderType string `json:"spider_type"` // list_monitor, announcement, position
}

func (s *CrawlerService) ListListPages(status string, page, pageSize int) ([]model.ListPage, int64, error) {
	return s.listPageRepo.List(status, page, pageSize)
}

func (s *CrawlerService) GetListPage(id uint) (*model.ListPage, error) {
	return s.listPageRepo.FindByID(id)
}

func (s *CrawlerService) CreateListPage(req *CreateListPageRequest) (*model.ListPage, error) {
	existing, _ := s.listPageRepo.FindByURL(req.URL)
	if existing != nil {
		return nil, ErrListPageExists
	}

	listPage := &model.ListPage{
		URL:               req.URL,
		SourceName:        req.SourceName,
		Category:          req.Category,
		CrawlFrequency:    req.CrawlFrequency,
		ArticleSelector:   req.ArticleSelector,
		PaginationPattern: req.PaginationPattern,
		Status:            string(model.ListPageStatusActive),
	}

	if listPage.CrawlFrequency == "" {
		listPage.CrawlFrequency = string(model.CrawlFrequencyDaily)
	}

	if err := s.listPageRepo.Create(listPage); err != nil {
		return nil, err
	}

	return listPage, nil
}

func (s *CrawlerService) UpdateListPage(id uint, req *UpdateListPageRequest) (*model.ListPage, error) {
	listPage, err := s.listPageRepo.FindByID(id)
	if err != nil {
		return nil, ErrListPageNotFound
	}

	if req.SourceName != nil {
		listPage.SourceName = *req.SourceName
	}
	if req.Category != nil {
		listPage.Category = *req.Category
	}
	if req.CrawlFrequency != nil {
		listPage.CrawlFrequency = *req.CrawlFrequency
	}
	if req.ArticleSelector != nil {
		listPage.ArticleSelector = *req.ArticleSelector
	}
	if req.PaginationPattern != nil {
		listPage.PaginationPattern = *req.PaginationPattern
	}
	if req.Status != nil {
		listPage.Status = *req.Status
	}

	if err := s.listPageRepo.Update(listPage); err != nil {
		return nil, err
	}

	return listPage, nil
}

func (s *CrawlerService) DeleteListPage(id uint) error {
	_, err := s.listPageRepo.FindByID(id)
	if err != nil {
		return ErrListPageNotFound
	}
	return s.listPageRepo.Delete(id)
}

func (s *CrawlerService) GetCrawlerStats() (*CrawlerStats, error) {
	stats := &CrawlerStats{}

	total, err := s.listPageRepo.GetTotalCount()
	if err != nil {
		return nil, err
	}
	stats.TotalListPages = total

	byStatus, err := s.listPageRepo.GetStatsByStatus()
	if err != nil {
		return nil, err
	}
	stats.ListPagesByStatus = byStatus
	stats.ActiveListPages = byStatus["active"]

	return stats, nil
}

func (s *CrawlerService) TriggerCrawler(req *TriggerCrawlerRequest) (*CrawlerTaskStatus, error) {
	taskID := generateTaskID()
	taskStatus := &CrawlerTaskStatus{
		TaskID:    taskID,
		Status:    "pending",
		StartTime: time.Now(),
		Message:   "Crawler task queued",
	}

	// Create task in database
	if s.crawlTaskRepo != nil {
		task := &model.CrawlTask{
			TaskID:   taskID,
			TaskType: req.SpiderType,
			TaskName: getTaskName(req.SpiderType),
			Status:   string(model.CrawlTaskStatusPending),
		}
		if err := s.crawlTaskRepo.Create(task); err != nil {
			return nil, err
		}
	}

	// Enqueue task if scheduler is available
	if s.scheduler != nil {
		var asynqTask *asynq.Task
		var err error

		switch req.SpiderType {
		case "list_monitor":
			var ids []uint
			if req.ListPageID != nil {
				ids = []uint{*req.ListPageID}
			}
			asynqTask, err = scheduler.NewListMonitorTask(ids)
		case "announcement":
			// Would need more params
			return taskStatus, nil
		case "positions":
			// Would need announcement ID
			return taskStatus, nil
		default:
			return taskStatus, nil
		}

		if err != nil {
			return nil, err
		}

		_, err = s.scheduler.EnqueueTask(context.Background(), asynqTask)
		if err != nil {
			return nil, err
		}
	}

	return taskStatus, nil
}

func (s *CrawlerService) GetCrawlerTaskStatus(taskID string) (*CrawlerTaskStatus, error) {
	if s.crawlTaskRepo != nil {
		task, err := s.crawlTaskRepo.FindByTaskID(taskID)
		if err != nil {
			return nil, ErrTaskNotFound
		}
		return &CrawlerTaskStatus{
			TaskID:    task.TaskID,
			Status:    task.Status,
			StartTime: *task.StartedAt,
			EndTime:   task.CompletedAt,
			Message:   task.ErrorMessage,
		}, nil
	}

	return &CrawlerTaskStatus{
		TaskID:  taskID,
		Status:  "completed",
		Message: "Task completed successfully",
	}, nil
}

// ListCrawlTasks returns paginated list of crawl tasks
func (s *CrawlerService) ListCrawlTasks(taskType, status string, page, pageSize int) ([]model.CrawlTask, int64, error) {
	if s.crawlTaskRepo == nil {
		return nil, 0, nil
	}
	return s.crawlTaskRepo.List(taskType, status, page, pageSize)
}

// GetCrawlTask returns a specific crawl task
func (s *CrawlerService) GetCrawlTask(taskID string) (*model.CrawlTask, error) {
	if s.crawlTaskRepo == nil {
		return nil, ErrTaskNotFound
	}
	return s.crawlTaskRepo.FindByTaskID(taskID)
}

// CancelCrawlTask cancels a crawl task
func (s *CrawlerService) CancelCrawlTask(taskID string) error {
	if s.scheduler != nil {
		if err := s.scheduler.CancelTask(taskID); err != nil {
			// Log but don't fail if scheduler cancel fails
			if s.logger != nil {
				s.logger.Warn("Failed to cancel task in scheduler", zap.Error(err))
			}
		}
	}

	if s.crawlTaskRepo != nil {
		return s.crawlTaskRepo.UpdateStatus(taskID, string(model.CrawlTaskStatusCancelled), nil, "Cancelled by user")
	}

	return nil
}

// GetCrawlerLogs returns crawler logs
func (s *CrawlerService) GetCrawlerLogs(taskID string, limit int) ([]model.CrawlLog, error) {
	if s.crawlLogRepo == nil {
		return nil, nil
	}

	if taskID != "" {
		return s.crawlLogRepo.GetByTaskID(taskID, limit)
	}
	return s.crawlLogRepo.GetRecent(limit)
}

// TestListPageCrawl tests crawling a list page
func (s *CrawlerService) TestListPageCrawl(listPageID uint) (map[string]interface{}, error) {
	listPage, err := s.listPageRepo.FindByID(listPageID)
	if err != nil {
		return nil, ErrListPageNotFound
	}

	// Create spider and do a test crawl
	spider := crawler.NewListMonitorSpider(s.spiderConfig, s.logger)
	spider.SetListPages([]crawler.ListPage{
		{
			ID:              listPage.ID,
			URL:             listPage.URL,
			SourceName:      listPage.SourceName,
			Category:        listPage.Category,
			ArticleSelector: listPage.ArticleSelector,
			PaginationPattern: listPage.PaginationPattern,
			Status:          listPage.Status,
		},
	})

	result, err := spider.Run()
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"success":       true,
		"total_found":   result.TotalFound,
		"new_articles":  result.NewArticles,
		"request_count": result.RequestCount,
		"duration_ms":   result.Duration.Milliseconds(),
		"sample_articles": func() []map[string]string {
			samples := make([]map[string]string, 0)
			for i, article := range result.Articles {
				if i >= 5 {
					break
				}
				samples = append(samples, map[string]string{
					"title": article.Title,
					"url":   article.URL,
				})
			}
			return samples
		}(),
	}, nil
}

// GetCrawlerStatistics returns comprehensive crawler statistics
func (s *CrawlerService) GetCrawlerStatistics() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// List page stats
	listPageTotal, _ := s.listPageRepo.GetTotalCount()
	listPageByStatus, _ := s.listPageRepo.GetStatsByStatus()

	stats["list_pages"] = map[string]interface{}{
		"total":     listPageTotal,
		"by_status": listPageByStatus,
	}

	// Task stats
	if s.crawlTaskRepo != nil {
		taskTotal, _ := s.crawlTaskRepo.GetTotalCount()
		taskByStatus, _ := s.crawlTaskRepo.GetStatsByStatus()
		taskByType, _ := s.crawlTaskRepo.GetStatsByType()
		runningTasks, _ := s.crawlTaskRepo.GetRunning()

		stats["tasks"] = map[string]interface{}{
			"total":         taskTotal,
			"by_status":     taskByStatus,
			"by_type":       taskByType,
			"running_count": len(runningTasks),
		}
	}

	return stats, nil
}

func generateTaskID() string {
	return time.Now().Format("20060102150405") + "-" + randomString(8)
}

func randomString(n int) string {
	const letters = "abcdefghijklmnopqrstuvwxyz0123456789"
	b := make([]byte, n)
	for i := range b {
		b[i] = letters[time.Now().UnixNano()%int64(len(letters))]
	}
	return string(b)
}

func getTaskName(taskType string) string {
	names := map[string]string{
		"list_monitor":  "列表页监控",
		"list_discovery": "列表页发现",
		"announcement":  "公告爬取",
		"positions":     "职位提取",
	}
	if name, ok := names[taskType]; ok {
		return name
	}
	return taskType
}
