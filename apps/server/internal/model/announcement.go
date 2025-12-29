package model

import (
	"time"

	"gorm.io/gorm"
)

type Announcement struct {
	ID               uint            `gorm:"primaryKey" json:"id"`
	Title            string          `gorm:"type:varchar(255);not null;index" json:"title"`
	SourceURL        string          `gorm:"type:varchar(500)" json:"source_url"`
	SourceName       string          `gorm:"type:varchar(100)" json:"source_name"`
	PublishDate      *time.Time      `gorm:"type:date;index" json:"publish_date"`
	Content          string          `gorm:"type:longtext" json:"content"`
	AnnouncementType string          `gorm:"type:varchar(50);index" json:"announcement_type"` // 招录公告, 报名统计, 笔试公告, 面试公告
	ExamType         string          `gorm:"type:varchar(20);index" json:"exam_type"`
	Province         string          `gorm:"type:varchar(50);index" json:"province"`
	City             string          `gorm:"type:varchar(50)" json:"city"`
	AttachmentURLs   JSONStringArray `gorm:"type:json" json:"attachment_urls"`
	Status           int             `gorm:"type:tinyint;default:1;index" json:"status"` // 0: draft, 1: published, 2: archived
	CreatedAt        time.Time       `json:"created_at"`
	UpdatedAt        time.Time       `json:"updated_at"`
	DeletedAt        gorm.DeletedAt  `gorm:"index" json:"-"`

	Positions []Position `gorm:"many2many:position_announcements;" json:"positions,omitempty"`
}

func (Announcement) TableName() string {
	return "announcements"
}

type AnnouncementType string

const (
	AnnouncementTypeRecruitment  AnnouncementType = "招录公告"
	AnnouncementTypeRegistration AnnouncementType = "报名统计"
	AnnouncementTypeWrittenExam  AnnouncementType = "笔试公告"
	AnnouncementTypeInterview    AnnouncementType = "面试公告"
	AnnouncementTypeResult       AnnouncementType = "成绩公告"
	AnnouncementTypeHiring       AnnouncementType = "拟录用公示"
)

type AnnouncementStatus int

const (
	AnnouncementStatusDraft     AnnouncementStatus = 0
	AnnouncementStatusPublished AnnouncementStatus = 1
	AnnouncementStatusArchived  AnnouncementStatus = 2
)
