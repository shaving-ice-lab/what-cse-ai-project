package service

import (
	"errors"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrListPageNotFound = errors.New("list page not found")
	ErrListPageExists   = errors.New("list page with this URL already exists")
)

type CrawlerService struct {
	listPageRepo *repository.ListPageRepository
}

func NewCrawlerService(listPageRepo *repository.ListPageRepository) *CrawlerService {
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
	taskStatus := &CrawlerTaskStatus{
		TaskID:    generateTaskID(),
		Status:    "pending",
		StartTime: time.Now(),
		Message:   "Crawler task queued",
	}

	return taskStatus, nil
}

func (s *CrawlerService) GetCrawlerTaskStatus(taskID string) (*CrawlerTaskStatus, error) {
	return &CrawlerTaskStatus{
		TaskID:  taskID,
		Status:  "completed",
		Message: "Task completed successfully",
	}, nil
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
