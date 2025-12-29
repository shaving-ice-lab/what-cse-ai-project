package model

import (
	"time"

	"gorm.io/gorm"
)

type MajorDictionary struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	MajorCode string         `gorm:"type:varchar(50);uniqueIndex;not null" json:"major_code"`
	MajorName string         `gorm:"type:varchar(100);not null;index" json:"major_name"`
	Category  string         `gorm:"type:varchar(100);index" json:"category"` // 大类名称
	Synonyms  JSONStringArray `gorm:"type:json" json:"synonyms"`               // 同义词列表
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (MajorDictionary) TableName() string {
	return "major_dictionary"
}

type RegionDictionary struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	RegionCode string         `gorm:"type:varchar(20);uniqueIndex;not null" json:"region_code"`
	Province   string         `gorm:"type:varchar(50);index" json:"province"`
	City       string         `gorm:"type:varchar(50);index" json:"city"`
	District   string         `gorm:"type:varchar(50)" json:"district"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

func (RegionDictionary) TableName() string {
	return "region_dictionary"
}
