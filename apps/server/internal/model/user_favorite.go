package model

import (
	"time"

	"gorm.io/gorm"
)

type UserFavorite struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `gorm:"index;not null" json:"user_id"`
	PositionID string         `gorm:"type:varchar(50);index;not null" json:"position_id"`
	CreatedAt  time.Time      `json:"created_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	// Position is loaded via PositionID (varchar) matching Position.PositionID
	Position *Position `gorm:"-" json:"position,omitempty"`
}

func (UserFavorite) TableName() string {
	return "what_user_favorites"
}

type UserView struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `gorm:"index;not null" json:"user_id"`
	PositionID string         `gorm:"type:varchar(50);index;not null" json:"position_id"`
	ViewCount  int            `gorm:"default:1" json:"view_count"`
	ViewTime   time.Time      `gorm:"type:datetime(3)" json:"view_time"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	// Position is loaded via PositionID (varchar) matching Position.PositionID
	Position *Position `gorm:"-" json:"position,omitempty"`
}

func (UserView) TableName() string {
	return "what_user_views"
}

type UserNotification struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"index;not null" json:"user_id"`
	Type      string         `gorm:"type:varchar(50);not null" json:"type"` // announcement, position, system
	Title     string         `gorm:"type:varchar(200);not null" json:"title"`
	Content   string         `gorm:"type:text" json:"content"`
	IsRead    bool           `gorm:"default:false;index" json:"is_read"`
	CreatedAt time.Time      `gorm:"index" json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (UserNotification) TableName() string {
	return "what_user_notifications"
}

type NotificationType string

const (
	NotificationTypeAnnouncement NotificationType = "announcement"
	NotificationTypePosition     NotificationType = "position"
	NotificationTypeSystem       NotificationType = "system"
)
