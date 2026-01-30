package model

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// =====================================================
// §学习内容通用 API
// 用于存储和获取各类学习资料（技巧、公式、指南等）
// =====================================================

// LearningContentType 学习内容类型
type LearningContentType string

const (
	LearningContentTypeTips       LearningContentType = "tips"       // 学习技巧
	LearningContentTypeFormulas   LearningContentType = "formulas"   // 公式/口诀
	LearningContentTypeGuides     LearningContentType = "guides"     // 学习指南
	LearningContentTypeHotTopics  LearningContentType = "hot_topics" // 热点话题
	LearningContentTypePatterns   LearningContentType = "patterns"   // 图形规律
	LearningContentTypeMethods    LearningContentType = "methods"    // 学习方法
	LearningContentTypeStrategies LearningContentType = "strategies" // 答题策略
	LearningContentTypeQuickFacts LearningContentType = "quick_facts"// 速记知识点
)

// LearningContent 学习内容
// 表名: what_learning_contents
type LearningContent struct {
	ID          uint                `gorm:"primaryKey" json:"id"`
	ContentType LearningContentType `gorm:"type:varchar(30);not null;index" json:"content_type"`  // 内容类型
	Subject     string              `gorm:"type:varchar(50);index" json:"subject,omitempty"`      // 科目 (xingce/shenlun/mianshi/gongji)
	Module      string              `gorm:"type:varchar(50);index" json:"module,omitempty"`       // 模块 (yanyu/shuliang/panduan/ziliao/changshi/liyi/qingjing/renji/zonghefenxi)
	CategoryID  *uint               `gorm:"index" json:"category_id,omitempty"`                   // 关联分类ID
	Title       string              `gorm:"type:varchar(200);not null" json:"title"`              // 标题
	Subtitle    string              `gorm:"type:varchar(300)" json:"subtitle,omitempty"`          // 副标题
	Icon        string              `gorm:"type:varchar(100)" json:"icon,omitempty"`              // 图标名称 (Lucide icon name)
	Color       string              `gorm:"type:varchar(50)" json:"color,omitempty"`              // 颜色
	ContentJSON JSONRawMessage      `gorm:"type:json" json:"content_json,omitempty"`              // JSON格式的内容
	ContentText string              `gorm:"type:mediumtext" json:"content_text,omitempty"`        // 纯文本内容
	SortOrder   int                 `gorm:"default:0;index" json:"sort_order"`                    // 排序
	IsActive    bool                `gorm:"default:true;index" json:"is_active"`                  // 是否启用
	ViewCount   int                 `gorm:"default:0" json:"view_count"`                          // 查看次数
	Metadata    JSONRawMessage      `gorm:"type:json" json:"metadata,omitempty"`                  // 额外元数据
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	DeletedAt   gorm.DeletedAt      `gorm:"index" json:"-"`

	// 关联
	Category *CourseCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (LearningContent) TableName() string {
	return "what_learning_contents"
}

// LearningContentResponse 学习内容响应
type LearningContentResponse struct {
	ID          uint                `json:"id"`
	ContentType LearningContentType `json:"content_type"`
	Subject     string              `json:"subject,omitempty"`
	Module      string              `json:"module,omitempty"`
	CategoryID  *uint               `json:"category_id,omitempty"`
	Title       string              `json:"title"`
	Subtitle    string              `json:"subtitle,omitempty"`
	Icon        string              `json:"icon,omitempty"`
	Color       string              `json:"color,omitempty"`
	ContentJSON interface{}         `json:"content_json,omitempty"`
	ContentText string              `json:"content_text,omitempty"`
	SortOrder   int                 `json:"sort_order"`
	IsActive    bool                `json:"is_active"`
	ViewCount   int                 `json:"view_count"`
	Metadata    interface{}         `json:"metadata,omitempty"`
	CreatedAt   time.Time           `json:"created_at"`
}

// ToResponse 转换为响应
func (c *LearningContent) ToResponse() *LearningContentResponse {
	resp := &LearningContentResponse{
		ID:          c.ID,
		ContentType: c.ContentType,
		Subject:     c.Subject,
		Module:      c.Module,
		CategoryID:  c.CategoryID,
		Title:       c.Title,
		Subtitle:    c.Subtitle,
		Icon:        c.Icon,
		Color:       c.Color,
		ContentText: c.ContentText,
		SortOrder:   c.SortOrder,
		IsActive:    c.IsActive,
		ViewCount:   c.ViewCount,
		CreatedAt:   c.CreatedAt,
	}
	
	// Parse JSON fields - validate before adding to response
	if len(c.ContentJSON) > 0 && string(c.ContentJSON) != "{}" && json.Valid([]byte(c.ContentJSON)) {
		resp.ContentJSON = c.ContentJSON
	}
	if len(c.Metadata) > 0 && string(c.Metadata) != "{}" && json.Valid([]byte(c.Metadata)) {
		resp.Metadata = c.Metadata
	}
	
	return resp
}

// LearningContentQueryParams 查询参数
type LearningContentQueryParams struct {
	ContentType LearningContentType `query:"content_type"`
	Subject     string              `query:"subject"`
	Module      string              `query:"module"`
	CategoryID  *uint               `query:"category_id"`
	IsActive    *bool               `query:"is_active"`
	Page        int                 `query:"page"`
	PageSize    int                 `query:"page_size"`
}

// ContentTypeNames 内容类型名称映射
var ContentTypeNames = map[LearningContentType]string{
	LearningContentTypeTips:       "学习技巧",
	LearningContentTypeFormulas:   "公式口诀",
	LearningContentTypeGuides:     "学习指南",
	LearningContentTypeHotTopics:  "热点话题",
	LearningContentTypePatterns:   "图形规律",
	LearningContentTypeMethods:    "学习方法",
	LearningContentTypeStrategies: "答题策略",
	LearningContentTypeQuickFacts: "速记知识点",
}

// SubjectNames 科目名称映射
var SubjectNames = map[string]string{
	"xingce":  "行测",
	"shenlun": "申论",
	"mianshi": "面试",
	"gongji":  "公共基础知识",
}

// ModuleNames 模块名称映射
var ModuleNames = map[string]string{
	// 行测模块
	"yanyu":    "言语理解与表达",
	"shuliang": "数量关系",
	"panduan":  "判断推理",
	"ziliao":   "资料分析",
	"changshi": "常识判断",
	// 面试模块
	"liyi":         "面试礼仪",
	"qingjing":     "情景模拟",
	"renji":        "人际关系",
	"zonghefenxi":  "综合分析",
}
