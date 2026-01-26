package model

import (
	"time"

	"gorm.io/gorm"
)

// WechatRSSSourceType represents the source type constants
type WechatRSSSourceType string

const (
	WechatRSSSourceTypeWechatAPI WechatRSSSourceType = "wechat_api" // 微信公众平台API
)

// WechatRSSSourceStatus represents the source status constants
type WechatRSSSourceStatus string

const (
	WechatRSSSourceStatusActive WechatRSSSourceStatus = "active"
	WechatRSSSourceStatusPaused WechatRSSSourceStatus = "paused"
	WechatRSSSourceStatusError  WechatRSSSourceStatus = "error"
)

// WechatRSSReadStatus represents the article read status constants
type WechatRSSReadStatus string

const (
	WechatRSSReadStatusUnread  WechatRSSReadStatus = "unread"
	WechatRSSReadStatusRead    WechatRSSReadStatus = "read"
	WechatRSSReadStatusStarred WechatRSSReadStatus = "starred"
)

// WechatRSSSource represents a WeChat subscription source
type WechatRSSSource struct {
	ID             uint                  `gorm:"primaryKey" json:"id"`
	Name           string                `gorm:"type:varchar(255);not null" json:"name"`
	WechatID       string                `gorm:"type:varchar(100);index:idx_wechat_rss_sources_wechat_id" json:"wechat_id,omitempty"` // biz参数
	FakeID         string                `gorm:"type:varchar(100);uniqueIndex:uk_wechat_rss_fake_id" json:"fake_id,omitempty"`        // 微信公众号fakeid
	RSSURL         string                `gorm:"type:varchar(500)" json:"rss_url,omitempty"`                                          // 保留字段兼容性，不再使用
	SourceType     WechatRSSSourceType   `gorm:"type:varchar(20);default:'wechat_api';index:idx_wechat_rss_sources_type" json:"source_type"`
	CrawlFrequency int                   `gorm:"default:60" json:"crawl_frequency"` // 抓取频率（分钟）
	LastCrawlAt    *time.Time            `gorm:"type:datetime" json:"last_crawl_at,omitempty"`
	NextCrawlAt    *time.Time            `gorm:"type:datetime;index:idx_wechat_rss_sources_next_crawl" json:"next_crawl_at,omitempty"`
	Status         WechatRSSSourceStatus `gorm:"type:varchar(20);default:'active';index:idx_wechat_rss_sources_status" json:"status"`
	ErrorMessage   string                `gorm:"type:text" json:"error_message,omitempty"`
	ErrorCount     int                   `gorm:"default:0" json:"error_count"`
	ArticleCount   int                   `gorm:"default:0" json:"article_count"`
	Description    string                `gorm:"type:text" json:"description,omitempty"`
	IconURL        string                `gorm:"type:varchar(500)" json:"icon_url,omitempty"`
	CreatedAt      time.Time             `json:"created_at"`
	UpdatedAt      time.Time             `json:"updated_at"`
	DeletedAt      gorm.DeletedAt        `gorm:"index:idx_wechat_rss_sources_deleted_at" json:"-"`
}

func (WechatRSSSource) TableName() string {
	return "what_wechat_rss_sources"
}

// WechatRSSArticle represents a WeChat article
type WechatRSSArticle struct {
	ID          uint                `gorm:"primaryKey" json:"id"`
	SourceID    uint                `gorm:"not null;index:idx_wechat_rss_articles_source" json:"source_id"`
	Source      *WechatRSSSource    `gorm:"foreignKey:SourceID" json:"source,omitempty"`
	GUID        string              `gorm:"type:varchar(500);not null;uniqueIndex:uk_wechat_rss_article_guid" json:"guid"`
	Title       string              `gorm:"type:varchar(500);not null" json:"title"`
	Link        string              `gorm:"type:varchar(1000);not null" json:"link"`
	Description string              `gorm:"type:text" json:"description,omitempty"`
	Content     string              `gorm:"type:longtext" json:"content,omitempty"`
	Author      string              `gorm:"type:varchar(255)" json:"author,omitempty"`
	ImageURL    string              `gorm:"type:varchar(1000)" json:"image_url,omitempty"`
	PubDate     *time.Time          `gorm:"type:datetime;index:idx_wechat_rss_articles_pub_date" json:"pub_date,omitempty"`
	ReadStatus  WechatRSSReadStatus `gorm:"type:varchar(20);default:'unread';index:idx_wechat_rss_articles_read_status" json:"read_status"`
	ReadAt      *time.Time          `gorm:"type:datetime" json:"read_at,omitempty"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	DeletedAt   gorm.DeletedAt      `gorm:"index:idx_wechat_rss_articles_deleted_at" json:"-"`
}

func (WechatRSSArticle) TableName() string {
	return "what_wechat_rss_articles"
}

// Request/Response DTOs

// UpdateWechatRSSSourceRequest is the request for updating a source
type UpdateWechatRSSSourceRequest struct {
	Name           *string                `json:"name,omitempty" validate:"omitempty,max=255"`
	WechatID       *string                `json:"wechat_id,omitempty" validate:"omitempty,max=100"`
	CrawlFrequency *int                   `json:"crawl_frequency,omitempty" validate:"omitempty,min=5,max=1440"`
	Status         *WechatRSSSourceStatus `json:"status,omitempty"`
	Description    *string                `json:"description,omitempty"`
}

// WechatRSSSourceResponse is the response for source API
type WechatRSSSourceResponse struct {
	ID             uint                  `json:"id"`
	Name           string                `json:"name"`
	WechatID       string                `json:"wechat_id,omitempty"`
	FakeID         string                `json:"fake_id,omitempty"`
	SourceType     WechatRSSSourceType   `json:"source_type"`
	SourceTypeText string                `json:"source_type_text"`
	CrawlFrequency int                   `json:"crawl_frequency"`
	LastCrawlAt    *time.Time            `json:"last_crawl_at,omitempty"`
	NextCrawlAt    *time.Time            `json:"next_crawl_at,omitempty"`
	Status         WechatRSSSourceStatus `json:"status"`
	StatusText     string                `json:"status_text"`
	ErrorMessage   string                `json:"error_message,omitempty"`
	ErrorCount     int                   `json:"error_count"`
	ArticleCount   int                   `json:"article_count"`
	UnreadCount    int                   `json:"unread_count"`
	Description    string                `json:"description,omitempty"`
	IconURL        string                `json:"icon_url,omitempty"`
	CreatedAt      time.Time             `json:"created_at"`
}

// ToResponse converts WechatRSSSource to WechatRSSSourceResponse
func (s *WechatRSSSource) ToResponse() *WechatRSSSourceResponse {
	sourceTypeText := "微信API"

	statusText := "未知"
	switch s.Status {
	case WechatRSSSourceStatusActive:
		statusText = "正常"
	case WechatRSSSourceStatusPaused:
		statusText = "已暂停"
	case WechatRSSSourceStatusError:
		statusText = "错误"
	}

	return &WechatRSSSourceResponse{
		ID:             s.ID,
		Name:           s.Name,
		WechatID:       s.WechatID,
		FakeID:         s.FakeID,
		SourceType:     s.SourceType,
		SourceTypeText: sourceTypeText,
		CrawlFrequency: s.CrawlFrequency,
		LastCrawlAt:    s.LastCrawlAt,
		NextCrawlAt:    s.NextCrawlAt,
		Status:         s.Status,
		StatusText:     statusText,
		ErrorMessage:   s.ErrorMessage,
		ErrorCount:     s.ErrorCount,
		ArticleCount:   s.ArticleCount,
		Description:    s.Description,
		IconURL:        s.IconURL,
		CreatedAt:      s.CreatedAt,
	}
}

// WechatRSSArticleResponse is the response for article API
type WechatRSSArticleResponse struct {
	ID             uint                `json:"id"`
	SourceID       uint                `json:"source_id"`
	SourceName     string              `json:"source_name,omitempty"`
	GUID           string              `json:"guid"`
	Title          string              `json:"title"`
	Link           string              `json:"link"`
	Description    string              `json:"description,omitempty"`
	Content        string              `json:"content,omitempty"`
	Author         string              `json:"author,omitempty"`
	ImageURL       string              `json:"image_url,omitempty"`
	PubDate        *time.Time          `json:"pub_date,omitempty"`
	ReadStatus     WechatRSSReadStatus `json:"read_status"`
	ReadStatusText string              `json:"read_status_text"`
	ReadAt         *time.Time          `json:"read_at,omitempty"`
	CreatedAt      time.Time           `json:"created_at"`
}

// ToResponse converts WechatRSSArticle to WechatRSSArticleResponse
func (a *WechatRSSArticle) ToResponse() *WechatRSSArticleResponse {
	statusText := "未读"
	switch a.ReadStatus {
	case WechatRSSReadStatusRead:
		statusText = "已读"
	case WechatRSSReadStatusStarred:
		statusText = "收藏"
	}

	sourceName := ""
	if a.Source != nil {
		sourceName = a.Source.Name
	}

	return &WechatRSSArticleResponse{
		ID:             a.ID,
		SourceID:       a.SourceID,
		SourceName:     sourceName,
		GUID:           a.GUID,
		Title:          a.Title,
		Link:           a.Link,
		Description:    a.Description,
		Content:        a.Content,
		Author:         a.Author,
		ImageURL:       a.ImageURL,
		PubDate:        a.PubDate,
		ReadStatus:     a.ReadStatus,
		ReadStatusText: statusText,
		ReadAt:         a.ReadAt,
		CreatedAt:      a.CreatedAt,
	}
}

// WechatRSSStats represents statistics
type WechatRSSStats struct {
	TotalSources    int64 `json:"total_sources"`
	ActiveSources   int64 `json:"active_sources"`
	PausedSources   int64 `json:"paused_sources"`
	ErrorSources    int64 `json:"error_sources"`
	TotalArticles   int64 `json:"total_articles"`
	UnreadArticles  int64 `json:"unread_articles"`
	StarredArticles int64 `json:"starred_articles"`
	TodayArticles   int64 `json:"today_articles"`
}

// WechatRSSArticleListParams represents the parameters for listing articles
type WechatRSSArticleListParams struct {
	SourceID   uint
	ReadStatus *WechatRSSReadStatus
	Keyword    string
	StartDate  *time.Time
	EndDate    *time.Time
	Page       int
	PageSize   int
}
