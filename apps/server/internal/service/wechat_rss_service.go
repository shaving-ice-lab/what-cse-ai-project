package service

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"go.uber.org/zap"

	"github.com/what-cse/server/internal/crawler"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrWechatRSSSourceNotFound  = errors.New("wechat RSS source not found")
	ErrWechatRSSArticleNotFound = errors.New("wechat RSS article not found")
	ErrWechatRSSSourceExists    = errors.New("wechat RSS source already exists")
	ErrWechatRSSCrawlFailed     = errors.New("wechat RSS crawl failed")
	ErrWechatMPAuthRequired     = errors.New("wechat MP authentication required")
)

// WechatRSSService handles WeChat article subscription business logic
type WechatRSSService struct {
	sourceRepo    *repository.WechatRSSSourceRepository
	articleRepo   *repository.WechatRSSArticleRepository
	articleParser *crawler.WechatArticleParser
	mpAuthService *WechatMPAuthService
	logger        *zap.Logger

	// Crawl control
	crawlMutex   sync.Mutex
	crawlRunning map[uint]bool
}

// NewWechatRSSService creates a new WeChat RSS service
func NewWechatRSSService(
	sourceRepo *repository.WechatRSSSourceRepository,
	articleRepo *repository.WechatRSSArticleRepository,
	logger *zap.Logger,
) *WechatRSSService {
	return &WechatRSSService{
		sourceRepo:    sourceRepo,
		articleRepo:   articleRepo,
		articleParser: crawler.NewWechatArticleParser(logger),
		logger:        logger,
		crawlRunning:  make(map[uint]bool),
	}
}

// SetMPAuthService sets the MP auth service (required for crawling)
func (s *WechatRSSService) SetMPAuthService(mpAuthService *WechatMPAuthService) {
	s.mpAuthService = mpAuthService
}

// === Source Management ===

// GetSource gets a single source
func (s *WechatRSSService) GetSource(id uint) (*model.WechatRSSSourceResponse, error) {
	source, err := s.sourceRepo.FindByID(id)
	if err != nil {
		return nil, ErrWechatRSSSourceNotFound
	}

	resp := source.ToResponse()

	// Get unread count
	unreadCount, _ := s.articleRepo.GetUnreadCount(id)
	resp.UnreadCount = int(unreadCount)

	return resp, nil
}

// ListSources lists all sources
func (s *WechatRSSService) ListSources(status *model.WechatRSSSourceStatus) ([]*model.WechatRSSSourceResponse, error) {
	sources, err := s.sourceRepo.List(status)
	if err != nil {
		return nil, err
	}

	// Get unread counts
	unreadCounts, _ := s.articleRepo.GetUnreadCountBySource()

	responses := make([]*model.WechatRSSSourceResponse, len(sources))
	for i, source := range sources {
		resp := source.ToResponse()
		if count, ok := unreadCounts[source.ID]; ok {
			resp.UnreadCount = int(count)
		}
		responses[i] = resp
	}

	return responses, nil
}

// UpdateSource updates an existing source
func (s *WechatRSSService) UpdateSource(id uint, req *model.UpdateWechatRSSSourceRequest) (*model.WechatRSSSourceResponse, error) {
	source, err := s.sourceRepo.FindByID(id)
	if err != nil {
		return nil, ErrWechatRSSSourceNotFound
	}

	if req.Name != nil {
		source.Name = *req.Name
	}
	if req.WechatID != nil {
		source.WechatID = *req.WechatID
	}
	if req.CrawlFrequency != nil {
		source.CrawlFrequency = *req.CrawlFrequency
	}
	if req.Status != nil {
		source.Status = *req.Status
		if *req.Status == model.WechatRSSSourceStatusActive {
			source.ErrorMessage = ""
			source.ErrorCount = 0
		}
	}
	if req.Description != nil {
		source.Description = *req.Description
	}

	if err := s.sourceRepo.Update(source); err != nil {
		return nil, err
	}

	return source.ToResponse(), nil
}

// DeleteSource deletes a source and its articles
func (s *WechatRSSService) DeleteSource(id uint) error {
	// Delete all articles first
	if err := s.articleRepo.DeleteBySourceID(id); err != nil {
		return err
	}

	// Delete source
	return s.sourceRepo.Delete(id)
}

// === Crawl Operations ===

// CrawlSource crawls a single source using WeChat API
func (s *WechatRSSService) CrawlSource(sourceID uint) (*CrawlSourceResult, error) {
	source, err := s.sourceRepo.FindByID(sourceID)
	if err != nil {
		return nil, ErrWechatRSSSourceNotFound
	}

	// Check if already crawling
	s.crawlMutex.Lock()
	if s.crawlRunning[sourceID] {
		s.crawlMutex.Unlock()
		return nil, fmt.Errorf("crawl already running for source %d", sourceID)
	}
	s.crawlRunning[sourceID] = true
	s.crawlMutex.Unlock()

	defer func() {
		s.crawlMutex.Lock()
		delete(s.crawlRunning, sourceID)
		s.crawlMutex.Unlock()
	}()

	return s.crawlSourceViaWechatAPI(source)
}

// crawlSourceViaWechatAPI crawls a source using WeChat MP platform API
func (s *WechatRSSService) crawlSourceViaWechatAPI(source *model.WechatRSSSource) (*CrawlSourceResult, error) {
	s.logger.Info("Starting WeChat API crawl", zap.Uint("source_id", source.ID), zap.String("fake_id", source.FakeID))

	if s.mpAuthService == nil {
		return nil, ErrWechatMPAuthRequired
	}

	if source.FakeID == "" {
		s.logger.Error("FakeID is empty for source", zap.Uint("source_id", source.ID))
		s.sourceRepo.UpdateStatus(source.ID, model.WechatRSSSourceStatusError, "FakeID is empty")
		return nil, fmt.Errorf("fakeid is required for source")
	}

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Get articles from WeChat API
	articleResp, err := s.mpAuthService.GetArticleList(ctx, source.FakeID, 0, 10)
	if err != nil {
		s.logger.Error("Failed to get articles from WeChat API", zap.Error(err))
		s.sourceRepo.UpdateStatus(source.ID, model.WechatRSSSourceStatusError, err.Error())
		return nil, err
	}

	// Process articles
	newCount := 0
	for _, item := range articleResp.Articles {
		// Use link as GUID
		guid := item.Link
		if guid == "" {
			guid = item.AID
		}

		// Check if article already exists
		exists, _ := s.articleRepo.ExistsByGUID(guid)
		if exists {
			continue
		}

		// Convert timestamp to time
		var pubDate *time.Time
		if item.CreateTime > 0 {
			t := time.Unix(item.CreateTime, 0)
			pubDate = &t
		}

		article := &model.WechatRSSArticle{
			SourceID:    source.ID,
			GUID:        guid,
			Title:       item.Title,
			Link:        item.Link,
			Description: item.Digest,
			ImageURL:    item.Cover,
			PubDate:     pubDate,
			ReadStatus:  model.WechatRSSReadStatusUnread,
			Author:      source.Name,
		}

		if err := s.articleRepo.Create(article); err != nil {
			s.logger.Warn("Failed to create article", zap.Error(err))
			continue
		}
		newCount++
	}

	// Update source
	now := time.Now()
	nextCrawl := now.Add(time.Duration(source.CrawlFrequency) * time.Minute)
	s.sourceRepo.UpdateCrawlTime(source.ID, now, nextCrawl)
	s.sourceRepo.UpdateStatus(source.ID, model.WechatRSSSourceStatusActive, "")
	s.sourceRepo.IncrementArticleCount(source.ID, newCount)

	s.logger.Info("WeChat API crawl completed",
		zap.Uint("source_id", source.ID),
		zap.Int("total_items", len(articleResp.Articles)),
		zap.Int("new_items", newCount),
	)

	return &CrawlSourceResult{
		SourceID:    source.ID,
		TotalItems:  len(articleResp.Articles),
		NewItems:    newCount,
		CrawlTime:   now,
		NextCrawlAt: nextCrawl,
	}, nil
}

// CrawlSourceResult represents the result of crawling a source
type CrawlSourceResult struct {
	SourceID    uint      `json:"source_id"`
	TotalItems  int       `json:"total_items"`
	NewItems    int       `json:"new_items"`
	CrawlTime   time.Time `json:"crawl_time"`
	NextCrawlAt time.Time `json:"next_crawl_at"`
}

// CrawlAllDueSources crawls all sources that are due
func (s *WechatRSSService) CrawlAllDueSources() ([]*CrawlSourceResult, error) {
	sources, err := s.sourceRepo.ListDueToCrawl()
	if err != nil {
		return nil, err
	}

	results := make([]*CrawlSourceResult, 0)
	for _, source := range sources {
		result, err := s.CrawlSource(source.ID)
		if err != nil {
			s.logger.Warn("Failed to crawl source", zap.Uint("source_id", source.ID), zap.Error(err))
			continue
		}
		results = append(results, result)
	}

	return results, nil
}

// === Article Management ===

// ListArticles lists articles with filtering and pagination
func (s *WechatRSSService) ListArticles(params *model.WechatRSSArticleListParams) ([]*model.WechatRSSArticleResponse, int64, error) {
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}

	articles, total, err := s.articleRepo.List(params)
	if err != nil {
		return nil, 0, err
	}

	responses := make([]*model.WechatRSSArticleResponse, len(articles))
	for i, article := range articles {
		responses[i] = article.ToResponse()
	}

	return responses, total, nil
}

// GetArticle gets a single article
func (s *WechatRSSService) GetArticle(id uint) (*model.WechatRSSArticleResponse, error) {
	article, err := s.articleRepo.FindByID(id)
	if err != nil {
		return nil, ErrWechatRSSArticleNotFound
	}

	return article.ToResponse(), nil
}

// MarkArticleRead marks an article as read
func (s *WechatRSSService) MarkArticleRead(id uint) error {
	exists, err := s.articleRepo.FindByID(id)
	if err != nil || exists == nil {
		return ErrWechatRSSArticleNotFound
	}

	// Only mark as read if currently unread
	if exists.ReadStatus == model.WechatRSSReadStatusUnread {
		return s.articleRepo.UpdateReadStatus(id, model.WechatRSSReadStatusRead)
	}

	return nil
}

// ToggleArticleStar toggles the starred status of an article
func (s *WechatRSSService) ToggleArticleStar(id uint) (*model.WechatRSSArticleResponse, error) {
	article, err := s.articleRepo.FindByID(id)
	if err != nil {
		return nil, ErrWechatRSSArticleNotFound
	}

	newStatus := model.WechatRSSReadStatusStarred
	if article.ReadStatus == model.WechatRSSReadStatusStarred {
		newStatus = model.WechatRSSReadStatusRead
	}

	if err := s.articleRepo.UpdateReadStatus(id, newStatus); err != nil {
		return nil, err
	}

	article.ReadStatus = newStatus
	return article.ToResponse(), nil
}

// MarkAllAsRead marks all articles as read, optionally for a specific source
func (s *WechatRSSService) MarkAllAsRead(sourceID uint) error {
	return s.articleRepo.MarkAllAsRead(sourceID)
}

// BatchMarkAsRead marks multiple articles as read
func (s *WechatRSSService) BatchMarkAsRead(ids []uint) error {
	return s.articleRepo.BatchUpdateReadStatus(ids, model.WechatRSSReadStatusRead)
}

// === Statistics ===

// GetStats returns statistics
func (s *WechatRSSService) GetStats() (*model.WechatRSSStats, error) {
	stats := &model.WechatRSSStats{}

	// Source counts
	totalSources, _ := s.sourceRepo.GetTotalCount()
	stats.TotalSources = totalSources

	activeSources, _ := s.sourceRepo.GetCountByStatus(model.WechatRSSSourceStatusActive)
	stats.ActiveSources = activeSources

	pausedSources, _ := s.sourceRepo.GetCountByStatus(model.WechatRSSSourceStatusPaused)
	stats.PausedSources = pausedSources

	errorSources, _ := s.sourceRepo.GetCountByStatus(model.WechatRSSSourceStatusError)
	stats.ErrorSources = errorSources

	// Article counts
	totalArticles, _ := s.articleRepo.GetTotalCount()
	stats.TotalArticles = totalArticles

	unreadArticles, _ := s.articleRepo.GetUnreadCount(0)
	stats.UnreadArticles = unreadArticles

	starredArticles, _ := s.articleRepo.GetStarredCount()
	stats.StarredArticles = starredArticles

	todayArticles, _ := s.articleRepo.GetTodayCount()
	stats.TodayArticles = todayArticles

	return stats, nil
}

// === Helper Functions ===

// ParseWechatArticleURL parses a WeChat article URL and extracts biz info
func (s *WechatRSSService) ParseWechatArticleURL(articleURL string) (*crawler.WechatArticleInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	return s.articleParser.FetchWechatArticleInfo(ctx, articleURL)
}

// CreateSourceViaWechatAPI creates a source using WeChat MP platform API
// This requires valid WeChat MP authentication
func (s *WechatRSSService) CreateSourceViaWechatAPI(articleURL string) (*model.WechatRSSSourceResponse, error) {
	s.logger.Info("=== 通过微信API创建订阅 ===", zap.String("article_url", articleURL))

	if s.mpAuthService == nil {
		return nil, ErrWechatMPAuthRequired
	}

	// Step 1: Parse article URL to get biz
	s.logger.Info("[步骤1] 解析文章URL获取biz参数...")
	info, err := s.ParseWechatArticleURL(articleURL)
	if err != nil {
		s.logger.Error("解析文章URL失败", zap.Error(err))
		return nil, fmt.Errorf("failed to parse article URL: %w", err)
	}
	s.logger.Info("解析成功",
		zap.String("biz", info.Biz),
		zap.String("author", info.Author),
		zap.String("title", info.Title),
	)

	// Step 2: Get fakeid from WeChat API
	s.logger.Info("[步骤2] 通过微信API获取fakeid...")
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	account, err := s.mpAuthService.GetFakeIDFromBiz(ctx, info.Biz)
	if err != nil {
		s.logger.Error("获取fakeid失败", zap.Error(err))
		return nil, fmt.Errorf("failed to get fakeid: %w", err)
	}
	s.logger.Info("获取fakeid成功",
		zap.String("fakeid", account.FakeID),
		zap.String("nickname", account.Nickname),
	)

	// Step 3: Check if source already exists
	exists, _ := s.sourceRepo.ExistsByFakeID(account.FakeID)
	if exists {
		s.logger.Warn("订阅源已存在", zap.String("fakeid", account.FakeID))
		return nil, ErrWechatRSSSourceExists
	}

	// Step 4: Create the source
	s.logger.Info("[步骤3] 创建订阅源记录...")

	name := account.Nickname
	if name == "" {
		name = info.Author
	}
	if name == "" {
		name = "微信公众号"
	}

	nextCrawl := time.Now().Add(60 * time.Minute)
	source := &model.WechatRSSSource{
		Name:           name,
		WechatID:       info.Biz,
		FakeID:         account.FakeID,
		SourceType:     model.WechatRSSSourceTypeWechatAPI,
		CrawlFrequency: 60,
		NextCrawlAt:    &nextCrawl,
		Status:         model.WechatRSSSourceStatusActive,
		IconURL:        account.RoundHeadImg,
	}

	if err := s.sourceRepo.Create(source); err != nil {
		s.logger.Error("创建订阅源失败", zap.Error(err))
		return nil, err
	}

	s.logger.Info("=== 订阅创建成功 (微信API) ===",
		zap.Uint("source_id", source.ID),
		zap.String("name", source.Name),
		zap.String("fakeid", source.FakeID),
	)

	// Trigger initial crawl asynchronously
	go s.CrawlSource(source.ID)

	return source.ToResponse(), nil
}

// CreateSourceViaAccountInfo creates a source using account info from search results
// This allows subscribing directly from search results without needing an article URL
func (s *WechatRSSService) CreateSourceViaAccountInfo(fakeID, nickname, alias, headImg string) (*model.WechatRSSSourceResponse, error) {
	s.logger.Info("=== 通过账号信息创建订阅 ===",
		zap.String("fakeid", fakeID),
		zap.String("nickname", nickname),
	)

	if fakeID == "" {
		return nil, fmt.Errorf("fakeid is required")
	}

	// Check if source already exists
	exists, _ := s.sourceRepo.ExistsByFakeID(fakeID)
	if exists {
		s.logger.Warn("订阅源已存在", zap.String("fakeid", fakeID))
		return nil, ErrWechatRSSSourceExists
	}

	// Create the source
	name := nickname
	if name == "" {
		name = "微信公众号"
	}

	nextCrawl := time.Now().Add(60 * time.Minute)
	source := &model.WechatRSSSource{
		Name:           name,
		WechatID:       alias, // Use alias as wechat_id if available
		FakeID:         fakeID,
		SourceType:     model.WechatRSSSourceTypeWechatAPI,
		CrawlFrequency: 60,
		NextCrawlAt:    &nextCrawl,
		Status:         model.WechatRSSSourceStatusActive,
		IconURL:        headImg,
	}

	if err := s.sourceRepo.Create(source); err != nil {
		s.logger.Error("创建订阅源失败", zap.Error(err))
		return nil, err
	}

	s.logger.Info("=== 订阅创建成功 (账号搜索) ===",
		zap.Uint("source_id", source.ID),
		zap.String("name", source.Name),
		zap.String("fakeid", source.FakeID),
	)

	// Trigger initial crawl asynchronously
	go s.CrawlSource(source.ID)

	return source.ToResponse(), nil
}
