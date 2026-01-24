package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// CrawlTask represents a crawler task record
type CrawlTask struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	TaskID       string         `gorm:"type:varchar(100);uniqueIndex" json:"task_id"`
	TaskType     string         `gorm:"type:varchar(50);index" json:"task_type"`
	TaskName     string         `gorm:"type:varchar(200)" json:"task_name"`
	TaskParams   JSON           `gorm:"type:json" json:"task_params"`
	Status       string         `gorm:"type:varchar(20);default:'pending';index" json:"status"`
	Progress     float64        `gorm:"default:0" json:"progress"`
	Result       JSON           `gorm:"type:json" json:"result"`
	ErrorMessage string         `gorm:"type:text" json:"error_message,omitempty"`
	ItemsScraped int            `gorm:"default:0" json:"items_scraped"`
	ItemsSaved   int            `gorm:"default:0" json:"items_saved"`
	StartedAt    *time.Time     `gorm:"type:datetime" json:"started_at,omitempty"`
	CompletedAt  *time.Time     `gorm:"type:datetime" json:"completed_at,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (CrawlTask) TableName() string {
	return "crawl_tasks"
}

// CrawlTaskStatus represents task status constants
type CrawlTaskStatus string

const (
	CrawlTaskStatusPending   CrawlTaskStatus = "pending"
	CrawlTaskStatusRunning   CrawlTaskStatus = "running"
	CrawlTaskStatusCompleted CrawlTaskStatus = "completed"
	CrawlTaskStatusFailed    CrawlTaskStatus = "failed"
	CrawlTaskStatusCancelled CrawlTaskStatus = "cancelled"
)

// CrawlTaskType represents task type constants
type CrawlTaskType string

const (
	CrawlTaskTypeListMonitor       CrawlTaskType = "list_monitor"
	CrawlTaskTypeListDiscovery     CrawlTaskType = "list_discovery"
	CrawlTaskTypeAnnouncementCrawl CrawlTaskType = "announcement"
	CrawlTaskTypePositionExtract   CrawlTaskType = "positions"
)

// JSON type for GORM json fields
type JSON map[string]interface{}

// Value implements driver.Valuer interface
func (j JSON) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

// Scan implements sql.Scanner interface
func (j *JSON) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}

	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}

	return json.Unmarshal(bytes, j)
}

// CrawlLog represents a crawler log entry
type CrawlLog struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	TaskID    string         `gorm:"type:varchar(100);index" json:"task_id"`
	Level     string         `gorm:"type:varchar(20)" json:"level"`
	Message   string         `gorm:"type:text" json:"message"`
	Data      JSON           `gorm:"type:json" json:"data,omitempty"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (CrawlLog) TableName() string {
	return "crawl_logs"
}

// CrawlLogLevel represents log level constants
type CrawlLogLevel string

const (
	CrawlLogLevelDebug   CrawlLogLevel = "debug"
	CrawlLogLevelInfo    CrawlLogLevel = "info"
	CrawlLogLevelWarning CrawlLogLevel = "warning"
	CrawlLogLevelError   CrawlLogLevel = "error"
)
