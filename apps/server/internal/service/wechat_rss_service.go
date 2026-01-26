package service

import (
	"context"
	"errors"
	"fmt"
	"strings"
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
	ErrWechatRSSInvalidURL      = errors.New("invalid RSS URL")
)

// WechatRSSService handles WeChat RSS business logic
type WechatRSSService struct {
	sourceRepo  *repository.WechatRSSSourceRepository
	articleRepo *repository.WechatRSSArticleRepository
	rssCrawler  *crawler.RSSCrawler
	logger      *zap.Logger

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
		sourceRepo:   sourceRepo,
		articleRepo:  articleRepo,
		rssCrawler:   crawler.NewRSSCrawler(logger),
		logger:       logger,
		crawlRunning: make(map[uint]bool),
	}
}

// === Source Management ===

// CreateSource creates a new RSS source
func (s *WechatRSSService) CreateSource(req *model.CreateWechatRSSSourceRequest) (*model.WechatRSSSourceResponse, error) {
	// Check if URL already exists
	exists, err := s.sourceRepo.ExistsByRSSURL(req.RSSURL)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, ErrWechatRSSSourceExists
	}

	// Validate RSS URL
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	feed, err := s.rssCrawler.ValidateRSSURL(ctx, req.RSSURL)
	if err != nil {
		s.logger.Warn("Failed to validate RSS URL", zap.String("url", req.RSSURL), zap.Error(err))
		// Still allow creation, but log warning
	}

	// Set default values
	sourceType := req.SourceType
	if sourceType == "" {
		sourceType = model.WechatRSSSourceTypeCustom
	}

	crawlFrequency := req.CrawlFrequency
	if crawlFrequency == 0 {
		crawlFrequency = 60 // Default 60 minutes
	}

	name := req.Name
	if name == "" && feed != nil {
		name = feed.Title
	}

	// Calculate next crawl time
	nextCrawl := time.Now().Add(time.Duration(crawlFrequency) * time.Minute)

	source := &model.WechatRSSSource{
		Name:           name,
		WechatID:       req.WechatID,
		RSSURL:         req.RSSURL,
		SourceType:     sourceType,
		CrawlFrequency: crawlFrequency,
		NextCrawlAt:    &nextCrawl,
		Status:         model.WechatRSSSourceStatusActive,
		Description:    req.Description,
	}

	// Set icon URL from feed if available
	if feed != nil && feed.IconURL != "" {
		source.IconURL = feed.IconURL
	}

	if err := s.sourceRepo.Create(source); err != nil {
		return nil, err
	}

	// Trigger initial crawl asynchronously
	go s.CrawlSource(source.ID)

	return source.ToResponse(), nil
}

// UpdateSource updates an RSS source
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
	if req.RSSURL != nil {
		source.RSSURL = *req.RSSURL
	}
	if req.SourceType != nil {
		source.SourceType = *req.SourceType
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

// GetSource gets a single RSS source
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

// ListSources lists all RSS sources
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

// DeleteSource deletes an RSS source and its articles
func (s *WechatRSSService) DeleteSource(id uint) error {
	// Delete all articles first
	if err := s.articleRepo.DeleteBySourceID(id); err != nil {
		return err
	}

	// Delete source
	return s.sourceRepo.Delete(id)
}

// === Crawl Operations ===

// CrawlSource crawls a single RSS source
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

	s.logger.Info("Starting RSS crawl", zap.Uint("source_id", sourceID), zap.String("url", source.RSSURL))

	ctx, cancel := context.WithTimeout(context.Background(), 60*time.Second)
	defer cancel()

	// Fetch and parse feed
	feed, err := s.rssCrawler.FetchAndParse(ctx, source.RSSURL)
	if err != nil {
		s.logger.Error("Failed to fetch RSS feed", zap.Error(err))
		s.sourceRepo.UpdateStatus(sourceID, model.WechatRSSSourceStatusError, err.Error())
		return nil, err
	}

	// Process articles
	newCount := 0
	for _, item := range feed.Items {
		// Check if article already exists
		exists, _ := s.articleRepo.ExistsByGUID(item.GUID)
		if exists {
			continue
		}

		article := &model.WechatRSSArticle{
			SourceID:    sourceID,
			GUID:        item.GUID,
			Title:       item.Title,
			Link:        item.Link,
			Description: item.Description,
			Content:     item.Content,
			Author:      item.Author,
			ImageURL:    item.ImageURL,
			PubDate:     item.PubDate,
			ReadStatus:  model.WechatRSSReadStatusUnread,
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
	s.sourceRepo.UpdateCrawlTime(sourceID, now, nextCrawl)
	s.sourceRepo.UpdateStatus(sourceID, model.WechatRSSSourceStatusActive, "")
	s.sourceRepo.IncrementArticleCount(sourceID, newCount)

	s.logger.Info("RSS crawl completed",
		zap.Uint("source_id", sourceID),
		zap.Int("total_items", len(feed.Items)),
		zap.Int("new_items", newCount),
	)

	return &CrawlSourceResult{
		SourceID:    sourceID,
		TotalItems:  len(feed.Items),
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

// GetStats returns statistics for WeChat RSS
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

// === RSS Output ===

// GenerateRSSFeed generates an RSS feed XML for a source
func (s *WechatRSSService) GenerateRSSFeed(sourceID uint, limit int) (string, error) {
	source, err := s.sourceRepo.FindByID(sourceID)
	if err != nil {
		return "", ErrWechatRSSSourceNotFound
	}

	if limit <= 0 {
		limit = 50
	}

	articles, err := s.articleRepo.ListBySourceID(sourceID, limit)
	if err != nil {
		return "", err
	}

	// Generate RSS XML
	rss := fmt.Sprintf(`<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>%s</title>
<link>%s</link>
<description>%s - 微信公众号RSS订阅</description>
<language>zh-cn</language>
<lastBuildDate>%s</lastBuildDate>
`, escapeXML(source.Name), escapeXML(source.RSSURL), escapeXML(source.Name), time.Now().Format(time.RFC1123Z))

	for _, article := range articles {
		pubDate := ""
		if article.PubDate != nil {
			pubDate = article.PubDate.Format(time.RFC1123Z)
		}

		rss += fmt.Sprintf(`<item>
<title>%s</title>
<link>%s</link>
<guid>%s</guid>
<pubDate>%s</pubDate>
<description><![CDATA[%s]]></description>
</item>
`, escapeXML(article.Title), escapeXML(article.Link), escapeXML(article.GUID), pubDate, article.Description)
	}

	rss += `</channel>
</rss>`

	return rss, nil
}

// escapeXML escapes special characters for XML
func escapeXML(s string) string {
	// Order matters: & must be replaced first
	s = replaceAll(s, "&", "&amp;")
	s = replaceAll(s, "<", "&lt;")
	s = replaceAll(s, ">", "&gt;")
	s = replaceAll(s, "'", "&apos;")
	s = replaceAll(s, "\"", "&quot;")
	return s
}

func replaceAll(s, old, new string) string {
	if old == "" || old == new {
		return s
	}
	result := ""
	for {
		i := indexOf(s, old)
		if i < 0 {
			return result + s
		}
		result += s[:i] + new
		s = s[i+len(old):]
	}
}

func indexOf(s, substr string) int {
	if len(substr) > len(s) {
		return -1
	}
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}

// === Helper Functions ===

// ValidateRSSURL validates if a URL is a valid RSS feed
func (s *WechatRSSService) ValidateRSSURL(url string) (*crawler.ParsedFeed, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	return s.rssCrawler.ValidateRSSURL(ctx, url)
}

// ParseWechatArticleURL parses a WeChat article URL and extracts RSS info
func (s *WechatRSSService) ParseWechatArticleURL(articleURL string) (*crawler.WechatArticleInfo, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	return s.rssCrawler.FetchWechatArticleInfo(ctx, articleURL)
}

// CreateSourceFromArticleURL creates a new RSS source from a WeChat article URL
func (s *WechatRSSService) CreateSourceFromArticleURL(articleURL string) (*model.WechatRSSSourceResponse, error) {
	s.logger.Info("=== 开始创建订阅 ===", zap.String("article_url", articleURL))

	// Step 1: Parse article URL
	s.logger.Info("[步骤1] 解析文章URL获取公众号信息...")
	info, err := s.ParseWechatArticleURL(articleURL)
	if err != nil {
		s.logger.Error("解析文章URL失败", zap.Error(err))
		return nil, fmt.Errorf("failed to parse article URL: %w", err)
	}
	s.logger.Info("解析成功",
		zap.String("biz", info.Biz),
		zap.String("author", info.Author),
		zap.Strings("rss_urls", info.RSSURLs),
	)

	if len(info.RSSURLs) == 0 {
		return nil, fmt.Errorf("could not generate RSS URL")
	}

	// Step 2: Try each RSS URL until one works
	s.logger.Info("[步骤2] 验证RSS源可用性...")
	var lastErr error
	var validatedFeed *crawler.ParsedFeed
	var validRSSURL string

	for i, rssURL := range info.RSSURLs {
		s.logger.Info(fmt.Sprintf("  尝试RSS源 %d/%d: %s", i+1, len(info.RSSURLs), rssURL))

		// Validate the RSS URL
		ctx, cancel := context.WithTimeout(context.Background(), 15*time.Second)
		feed, err := s.rssCrawler.ValidateRSSURL(ctx, rssURL)
		cancel()

		if err != nil {
			lastErr = err
			s.logger.Warn("  ✗ RSS源验证失败",
				zap.String("url", rssURL),
				zap.Error(err))
			continue
		}

		s.logger.Info("  ✓ RSS源验证成功",
			zap.String("url", rssURL),
			zap.String("feed_title", feed.Title),
			zap.Int("item_count", len(feed.Items)),
		)
		validatedFeed = feed
		validRSSURL = rssURL
		break
	}

	if validRSSURL == "" {
		s.logger.Error("所有RSS源都不可用", zap.Error(lastErr))
		if lastErr != nil {
			return nil, fmt.Errorf("all RSS URLs failed, last error: %w", lastErr)
		}
		return nil, fmt.Errorf("no valid RSS URL found")
	}

	// Step 3: Create the source
	s.logger.Info("[步骤3] 创建订阅源记录...")

	name := info.Author
	if name == "" && validatedFeed != nil {
		name = validatedFeed.Title
	}
	if name == "" {
		name = "微信公众号"
	}

	// Determine source type from URL
	sourceType := model.WechatRSSSourceTypeCustom
	if strings.Contains(validRSSURL, "rsshub.app") {
		sourceType = model.WechatRSSSourceTypeRSSHub
	} else if strings.Contains(validRSSURL, "feeddd.org") {
		sourceType = model.WechatRSSSourceTypeFeeddd
	} else if strings.Contains(validRSSURL, "werss.app") {
		sourceType = model.WechatRSSSourceTypeWeRSS
	}

	req := &model.CreateWechatRSSSourceRequest{
		Name:           name,
		WechatID:       info.Biz,
		RSSURL:         validRSSURL,
		SourceType:     sourceType,
		CrawlFrequency: 60,
	}

	s.logger.Info("订阅源信息",
		zap.String("name", name),
		zap.String("wechat_id", info.Biz),
		zap.String("rss_url", validRSSURL),
		zap.String("source_type", string(sourceType)),
	)

	result, err := s.CreateSource(req)
	if err != nil {
		s.logger.Error("创建订阅源失败", zap.Error(err))
		return nil, err
	}

	s.logger.Info("=== 订阅创建成功 ===",
		zap.Uint("source_id", result.ID),
		zap.String("name", result.Name),
	)

	return result, nil
}
