package model

import (
	"time"
)

// MajorCategory 专业大类
type MajorCategory struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	Code      string    `gorm:"type:varchar(10);uniqueIndex" json:"code"` // 专业大类代码
	Name      string    `gorm:"type:varchar(50);not null" json:"name"`    // 专业大类名称
	SortOrder int       `gorm:"default:0" json:"sort_order"`              // 排序
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`

	// 关联
	Majors []Major `gorm:"foreignKey:CategoryCode;references:Code" json:"majors,omitempty"`
}

func (MajorCategory) TableName() string {
	return "what_major_categories"
}

// Major 专业
type Major struct {
	ID             uint            `gorm:"primaryKey" json:"id"`
	Code           string          `gorm:"type:varchar(20);uniqueIndex" json:"code"`    // 专业代码
	Name           string          `gorm:"type:varchar(100);not null" json:"name"`      // 专业名称
	CategoryCode   string          `gorm:"type:varchar(10);index" json:"category_code"` // 所属大类代码
	Level          int             `gorm:"default:3" json:"level"`                      // 层级: 1-门类 2-类 3-专业
	ParentCode     string          `gorm:"type:varchar(20)" json:"parent_code"`         // 父级代码
	EducationLevel string          `gorm:"type:varchar(20)" json:"education_level"`     // 学历层次
	Synonyms       JSONStringArray `gorm:"type:json" json:"synonyms"`                   // 同义词
	SortOrder      int             `gorm:"default:0" json:"sort_order"`                 // 排序
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
}

func (Major) TableName() string {
	return "what_majors"
}

// MajorCategoryResponse 专业大类响应
type MajorCategoryResponse struct {
	Code string `json:"code"`
	Name string `json:"name"`
}

// MajorResponse 专业响应
type MajorResponse struct {
	Code           string `json:"code"`
	Name           string `json:"name"`
	CategoryCode   string `json:"category_code"`
	CategoryName   string `json:"category_name,omitempty"`
	Level          int    `json:"level"`
	ParentCode     string `json:"parent_code,omitempty"`
	EducationLevel string `json:"education_level,omitempty"`
}

// ToCategoryResponse 转换为响应
func (c *MajorCategory) ToResponse() *MajorCategoryResponse {
	return &MajorCategoryResponse{
		Code: c.Code,
		Name: c.Name,
	}
}

// ToResponse 转换为响应
func (m *Major) ToResponse() *MajorResponse {
	return &MajorResponse{
		Code:           m.Code,
		Name:           m.Name,
		CategoryCode:   m.CategoryCode,
		Level:          m.Level,
		ParentCode:     m.ParentCode,
		EducationLevel: m.EducationLevel,
	}
}

// MajorCascadeResponse 级联响应
type MajorCascadeResponse struct {
	Code     string                  `json:"code"`
	Name     string                  `json:"name"`
	Children []*MajorCascadeResponse `json:"children,omitempty"`
}
