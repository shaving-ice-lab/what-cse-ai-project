package model

import (
	"time"

	"gorm.io/gorm"
)

// FenbiCredential represents the Fenbi login credentials
type FenbiCredential struct {
	ID                uint           `gorm:"primaryKey" json:"id"`
	Phone             string         `gorm:"type:varchar(20);uniqueIndex:uk_fenbi_phone;not null" json:"phone"`
	PasswordEncrypted string         `gorm:"type:text;not null" json:"password_encrypted,omitempty"`
	Cookies           string         `gorm:"type:text" json:"cookies,omitempty"`
	CookieExpiresAt   *time.Time     `gorm:"type:datetime" json:"cookie_expires_at,omitempty"`
	LoginStatus       int            `gorm:"type:tinyint;default:0;index:idx_fenbi_credentials_login_status" json:"login_status"`
	LastLoginAt       *time.Time     `gorm:"type:datetime" json:"last_login_at,omitempty"`
	LastCheckAt       *time.Time     `gorm:"type:datetime" json:"last_check_at,omitempty"`
	IsDefault         bool           `gorm:"type:tinyint(1);default:0" json:"is_default"`
	CreatedAt         time.Time      `json:"created_at"`
	UpdatedAt         time.Time      `json:"updated_at"`
	DeletedAt         gorm.DeletedAt `gorm:"index:idx_fenbi_credentials_deleted_at" json:"-"`
}

func (FenbiCredential) TableName() string {
	return "what_fenbi_credentials"
}

// FenbiLoginStatus represents the login status constants
type FenbiLoginStatus int

const (
	FenbiLoginStatusNotLoggedIn FenbiLoginStatus = 0
	FenbiLoginStatusLoggedIn    FenbiLoginStatus = 1
	FenbiLoginStatusExpired     FenbiLoginStatus = 2
)

// FenbiCategory represents the Fenbi filter categories
type FenbiCategory struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	CategoryType string    `gorm:"type:varchar(20);not null;uniqueIndex:uk_fenbi_type_code,priority:1;index:idx_fenbi_categories_type" json:"category_type"`
	Code         string    `gorm:"type:varchar(50);not null;uniqueIndex:uk_fenbi_type_code,priority:2" json:"code"`
	Name         string    `gorm:"type:varchar(100);not null" json:"name"`
	FenbiParamID string    `gorm:"type:varchar(20)" json:"fenbi_param_id"` // 粉笔网站URL参数使用的ID
	SortOrder    int       `gorm:"default:0" json:"sort_order"`
	IsEnabled    bool      `gorm:"type:tinyint(1);default:1;index:idx_fenbi_categories_enabled" json:"is_enabled"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
}

func (FenbiCategory) TableName() string {
	return "what_fenbi_categories"
}

// FenbiCategoryType represents the category type constants
type FenbiCategoryType string

const (
	FenbiCategoryTypeRegion   FenbiCategoryType = "region"
	FenbiCategoryTypeExamType FenbiCategoryType = "exam_type"
	FenbiCategoryTypeYear     FenbiCategoryType = "year"
)

// FenbiAnnouncement represents a Fenbi announcement record
type FenbiAnnouncement struct {
	ID                 uint           `gorm:"primaryKey" json:"id"`
	FenbiID            string         `gorm:"type:varchar(50);uniqueIndex:uk_fenbi_id;not null" json:"fenbi_id"`
	Title              string         `gorm:"type:varchar(500);not null" json:"title"`
	FenbiURL           string         `gorm:"type:varchar(500);not null" json:"fenbi_url"`
	OriginalURL        string         `gorm:"type:varchar(500)" json:"original_url,omitempty"`  // 短链接 (t.fenbi.com)
	FinalURL           string         `gorm:"type:varchar(1000)" json:"final_url,omitempty"`    // 最终跳转URL
	ListPageURL        string         `gorm:"type:varchar(1000)" json:"list_page_url,omitempty"` // 列表页URL (用于监控)
	ListPageSource     string         `gorm:"type:varchar(50)" json:"list_page_source,omitempty"` // 列表页来源 (url_parse/html_extract/llm)
	RegionCode         string         `gorm:"type:varchar(50);index:idx_fenbi_announcements_region" json:"region_code,omitempty"`
	RegionName         string         `gorm:"type:varchar(100)" json:"region_name,omitempty"`
	ExamTypeCode       string         `gorm:"type:varchar(50);index:idx_fenbi_announcements_exam_type" json:"exam_type_code,omitempty"`
	ExamTypeName       string         `gorm:"type:varchar(100)" json:"exam_type_name,omitempty"`
	Year               int            `gorm:"index:idx_fenbi_announcements_year" json:"year,omitempty"`
	PublishDate        *time.Time     `gorm:"type:date" json:"publish_date,omitempty"`
	CrawlStatus        int            `gorm:"type:tinyint;default:0;index:idx_fenbi_announcements_crawl_status" json:"crawl_status"`
	SyncToAnnouncement bool           `gorm:"type:tinyint(1);default:0" json:"sync_to_announcement"`
	AnnouncementID     *uint          `gorm:"type:bigint unsigned" json:"announcement_id,omitempty"`
	CreatedAt          time.Time      `json:"created_at"`
	UpdatedAt          time.Time      `json:"updated_at"`
	DeletedAt          gorm.DeletedAt `gorm:"index:idx_fenbi_announcements_deleted_at" json:"-"`
}

func (FenbiAnnouncement) TableName() string {
	return "what_fenbi_announcements"
}

// FenbiCrawlStatus represents the crawl status constants
type FenbiCrawlStatus int

const (
	FenbiCrawlStatusPending       FenbiCrawlStatus = 0 // 待爬取
	FenbiCrawlStatusListCrawled   FenbiCrawlStatus = 1 // 已爬取列表
	FenbiCrawlStatusDetailCrawled FenbiCrawlStatus = 2 // 已爬取详情
)

// FenbiCredentialResponse is the response for credential API
type FenbiCredentialResponse struct {
	ID              uint       `json:"id"`
	Phone           string     `json:"phone"`
	PhoneMasked     string     `json:"phone_masked"`
	Password        string     `json:"password,omitempty"` // 明文密码，只允许单账号登录
	LoginStatus     int        `json:"login_status"`
	LoginStatusText string     `json:"login_status_text"`
	LastLoginAt     *time.Time `json:"last_login_at,omitempty"`
	LastCheckAt     *time.Time `json:"last_check_at,omitempty"`
	IsDefault       bool       `json:"is_default"`
	CreatedAt       time.Time  `json:"created_at"`
}

// ToResponse converts FenbiCredential to FenbiCredentialResponse
func (c *FenbiCredential) ToResponse() *FenbiCredentialResponse {
	phoneMasked := ""
	if len(c.Phone) >= 4 {
		phoneMasked = c.Phone[:3] + "****" + c.Phone[len(c.Phone)-4:]
	}

	statusText := "未登录"
	switch FenbiLoginStatus(c.LoginStatus) {
	case FenbiLoginStatusLoggedIn:
		statusText = "已登录"
	case FenbiLoginStatusExpired:
		statusText = "已过期"
	}

	return &FenbiCredentialResponse{
		ID:              c.ID,
		Phone:           c.Phone,
		PhoneMasked:     phoneMasked,
		LoginStatus:     c.LoginStatus,
		LoginStatusText: statusText,
		LastLoginAt:     c.LastLoginAt,
		LastCheckAt:     c.LastCheckAt,
		IsDefault:       c.IsDefault,
		CreatedAt:       c.CreatedAt,
	}
}

// ToResponseWithPassword converts FenbiCredential to FenbiCredentialResponse with decrypted password
func (c *FenbiCredential) ToResponseWithPassword(password string) *FenbiCredentialResponse {
	resp := c.ToResponse()
	resp.Password = password
	return resp
}

// FenbiParseTask represents a Fenbi announcement parse task
type FenbiParseTask struct {
	ID                   uint           `gorm:"primaryKey" json:"id"`
	FenbiAnnouncementID  *uint          `gorm:"type:bigint unsigned;index:idx_fenbi_parse_tasks_announcement_id" json:"fenbi_announcement_id,omitempty"`
	FenbiID              string         `gorm:"type:varchar(50);index:idx_fenbi_parse_tasks_fenbi_id" json:"fenbi_id,omitempty"`
	Title                string         `gorm:"type:varchar(500);not null" json:"title"`
	FenbiURL             string         `gorm:"type:varchar(500)" json:"fenbi_url,omitempty"`
	Status               string         `gorm:"type:varchar(20);default:'pending';index:idx_fenbi_parse_tasks_status" json:"status"`
	Message              string         `gorm:"type:text" json:"message,omitempty"`
	Steps                JSON           `gorm:"type:json" json:"steps,omitempty"`
	ParseResultSummary   JSON           `gorm:"type:json" json:"parse_result_summary,omitempty"`
	StartedAt            *time.Time     `gorm:"type:datetime(3)" json:"started_at,omitempty"`
	CompletedAt          *time.Time     `gorm:"type:datetime(3)" json:"completed_at,omitempty"`
	CreatedAt            time.Time      `gorm:"index:idx_fenbi_parse_tasks_created_at" json:"created_at"`
	UpdatedAt            time.Time      `json:"updated_at"`
	DeletedAt            gorm.DeletedAt `gorm:"index:idx_fenbi_parse_tasks_deleted_at" json:"-"`
}

func (FenbiParseTask) TableName() string {
	return "what_fenbi_parse_tasks"
}

// FenbiParseTaskStatus represents the parse task status constants
type FenbiParseTaskStatus string

const (
	FenbiParseTaskStatusPending   FenbiParseTaskStatus = "pending"
	FenbiParseTaskStatusRunning   FenbiParseTaskStatus = "running"
	FenbiParseTaskStatusParsing   FenbiParseTaskStatus = "parsing"
	FenbiParseTaskStatusCompleted FenbiParseTaskStatus = "completed"
	FenbiParseTaskStatusFailed    FenbiParseTaskStatus = "failed"
	FenbiParseTaskStatusSkipped   FenbiParseTaskStatus = "skipped"
)

// FenbiParseTaskResponse is the response for parse task API
type FenbiParseTaskResponse struct {
	ID                  uint                   `json:"id"`
	FenbiAnnouncementID *uint                  `json:"fenbi_announcement_id,omitempty"`
	FenbiID             string                 `json:"fenbi_id,omitempty"`
	Title               string                 `json:"title"`
	FenbiURL            string                 `json:"fenbi_url,omitempty"`
	Status              string                 `json:"status"`
	Message             string                 `json:"message,omitempty"`
	Steps               []map[string]any       `json:"steps,omitempty"`
	ParseResultSummary  map[string]any         `json:"parse_result_summary,omitempty"`
	StartedAt           *time.Time             `json:"started_at,omitempty"`
	CompletedAt         *time.Time             `json:"completed_at,omitempty"`
	CreatedAt           time.Time              `json:"created_at"`
	UpdatedAt           time.Time              `json:"updated_at"`
}

// ToResponse converts FenbiParseTask to FenbiParseTaskResponse
func (t *FenbiParseTask) ToResponse() *FenbiParseTaskResponse {
	var steps []map[string]any
	if t.Steps != nil {
		if stepsData, ok := t.Steps["steps"].([]interface{}); ok {
			for _, step := range stepsData {
				if stepMap, ok := step.(map[string]interface{}); ok {
					steps = append(steps, stepMap)
				}
			}
		}
	}

	var parseResultSummary map[string]any
	if t.ParseResultSummary != nil {
		parseResultSummary = t.ParseResultSummary
	}

	return &FenbiParseTaskResponse{
		ID:                  t.ID,
		FenbiAnnouncementID: t.FenbiAnnouncementID,
		FenbiID:             t.FenbiID,
		Title:               t.Title,
		FenbiURL:            t.FenbiURL,
		Status:              t.Status,
		Message:             t.Message,
		Steps:               steps,
		ParseResultSummary:  parseResultSummary,
		StartedAt:           t.StartedAt,
		CompletedAt:         t.CompletedAt,
		CreatedAt:           t.CreatedAt,
		UpdatedAt:           t.UpdatedAt,
	}
}
