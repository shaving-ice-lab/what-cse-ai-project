package model

import (
	"time"

	"gorm.io/gorm"
)

type Admin struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Username     string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"username"`
	PasswordHash string         `gorm:"type:varchar(255);not null" json:"-"`
	Nickname     string         `gorm:"type:varchar(50)" json:"nickname"`
	Role         string         `gorm:"type:varchar(20);default:'admin';index" json:"role"` // super_admin, admin, operator
	Status       int            `gorm:"type:tinyint;default:1" json:"status"`               // 1: normal, 0: disabled
	LastLoginAt  *time.Time     `gorm:"type:datetime(3)" json:"last_login_at,omitempty"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (Admin) TableName() string {
	return "what_admins"
}

type AdminRole string

const (
	AdminRoleSuper AdminRole = "super_admin"
	AdminRoleAdmin AdminRole = "admin"
)
