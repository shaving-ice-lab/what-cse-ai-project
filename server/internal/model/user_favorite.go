package model

import (
	"time"

	"gorm.io/gorm"
)

type UserFavorite struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `gorm:"index;not null" json:"user_id"`
	PositionID uint           `gorm:"index;not null" json:"position_id"`
	CreatedAt  time.Time      `json:"created_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	Position *Position `gorm:"foreignKey:PositionID" json:"position,omitempty"`
}

func (UserFavorite) TableName() string {
	return "user_favorites"
}

type UserView struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"index;not null" json:"user_id"`
	PositionID uint      `gorm:"index;not null" json:"position_id"`
	ViewTime   time.Time `gorm:"type:datetime;not null" json:"view_time"`

	Position *Position `gorm:"foreignKey:PositionID" json:"position,omitempty"`
}

func (UserView) TableName() string {
	return "user_views"
}

type UserNotification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"index;not null" json:"user_id"`
	Type      string    `gorm:"type:varchar(50);not null" json:"type"` // announcement, position, system
	Title     string    `gorm:"type:varchar(255);not null" json:"title"`
	Content   string    `gorm:"type:text" json:"content"`
	IsRead    bool      `gorm:"default:false" json:"is_read"`
	CreatedAt time.Time `json:"created_at"`
}

func (UserNotification) TableName() string {
	return "user_notifications"
}

type NotificationType string

const (
	NotificationTypeAnnouncement NotificationType = "announcement"
	NotificationTypePosition     NotificationType = "position"
	NotificationTypeSystem       NotificationType = "system"
)
