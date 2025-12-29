package model

import (
	"time"

	"gorm.io/gorm"
)

type ListPage struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	URL               string         `gorm:"type:varchar(500);uniqueIndex;not null" json:"url"`
	SourceName        string         `gorm:"type:varchar(100)" json:"source_name"`
	Category          string         `gorm:"type:varchar(50)" json:"category"`
	CrawlFrequency    string         `gorm:"type:varchar(20);default:'daily'" json:"crawl_frequency"` // hourly, daily, weekly
	LastCrawlTime     *time.Time     `gorm:"type:datetime" json:"last_crawl_time"`
	ArticleCount      int            `gorm:"default:0" json:"article_count"`
	ArticleSelector   string         `gorm:"type:varchar(255)" json:"article_selector"`
	PaginationPattern string         `gorm:"type:varchar(255)" json:"pagination_pattern"`
	Status            string         `gorm:"type:varchar(20);default:'active';index" json:"status"` // active, inactive, error
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ListPage) TableName() string {
	return "list_pages"
}

type ListPageStatus string

const (
	ListPageStatusActive   ListPageStatus = "active"
	ListPageStatusInactive ListPageStatus = "inactive"
	ListPageStatusError    ListPageStatus = "error"
)

type CrawlFrequency string

const (
	CrawlFrequencyHourly CrawlFrequency = "hourly"
	CrawlFrequencyDaily  CrawlFrequency = "daily"
	CrawlFrequencyWeekly CrawlFrequency = "weekly"
)
