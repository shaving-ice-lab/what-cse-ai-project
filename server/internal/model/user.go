package model

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Phone        string         `gorm:"type:varchar(20);uniqueIndex" json:"phone"`
	Email        string         `gorm:"type:varchar(100);uniqueIndex" json:"email"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	Nickname     string         `gorm:"type:varchar(50)" json:"nickname"`
	Avatar       string         `gorm:"type:varchar(255)" json:"avatar"`
	Status       int            `gorm:"type:tinyint;default:1" json:"status"` // 1: normal, 0: disabled
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	Profile      *UserProfile      `gorm:"foreignKey:UserID" json:"profile,omitempty"`
	Certificates []UserCertificate `gorm:"foreignKey:UserID" json:"certificates,omitempty"`
	Preferences  *UserPreference   `gorm:"foreignKey:UserID" json:"preferences,omitempty"`
}

func (User) TableName() string {
	return "users"
}

type UserStatus int

const (
	UserStatusDisabled UserStatus = 0
	UserStatusNormal   UserStatus = 1
)
