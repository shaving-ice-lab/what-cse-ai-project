package model

import (
	"time"

	"gorm.io/gorm"
)

type MajorDictionary struct {
	ID         uint            `gorm:"primaryKey" json:"id"`
	Code       string          `gorm:"type:varchar(20);uniqueIndex;not null" json:"code"`
	Name       string          `gorm:"type:varchar(100);not null" json:"name"`
	Category   string          `gorm:"type:varchar(50);index" json:"category"`
	ParentCode string          `gorm:"type:varchar(20);index" json:"parent_code"`
	Level      int             `gorm:"default:1;index" json:"level"` // 1-门类, 2-类, 3-专业
	Synonyms   JSONStringArray `gorm:"type:json" json:"synonyms"`
	CreatedAt  time.Time       `json:"created_at"`
	UpdatedAt  time.Time       `json:"updated_at"`
	DeletedAt  gorm.DeletedAt  `gorm:"index" json:"-"`
}

func (MajorDictionary) TableName() string {
	return "what_major_dictionaries"
}

type RegionDictionary struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	Code       string         `gorm:"type:varchar(20);uniqueIndex;not null" json:"code"`
	Name       string         `gorm:"type:varchar(100);not null" json:"name"`
	ParentCode string         `gorm:"type:varchar(20);index" json:"parent_code"`
	Level      int            `gorm:"default:1;index" json:"level"` // 1-省, 2-市, 3-区县
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

func (RegionDictionary) TableName() string {
	return "what_region_dictionaries"
}
