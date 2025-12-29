package model

import (
	"time"
)

type PositionAnnouncement struct {
	PositionID     uint      `gorm:"primaryKey" json:"position_id"`
	AnnouncementID uint      `gorm:"primaryKey" json:"announcement_id"`
	Stage          string    `gorm:"type:varchar(50)" json:"stage"` // 招聘, 报名, 笔试, 面试, 录用
	CreatedAt      time.Time `json:"created_at"`
}

func (PositionAnnouncement) TableName() string {
	return "position_announcements"
}

type LifecycleStage string

const (
	StageRecruitment  LifecycleStage = "招聘"
	StageRegistration LifecycleStage = "报名"
	StageWrittenExam  LifecycleStage = "笔试"
	StageInterview    LifecycleStage = "面试"
	StageHiring       LifecycleStage = "录用"
)
