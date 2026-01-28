package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// =====================================================
// 素材分类枚举
// =====================================================

// MaterialType 素材大类
type MaterialType string

const (
	MaterialTypeQuote      MaterialType = "quote"      // 名言警句
	MaterialTypeCase       MaterialType = "case"       // 案例素材
	MaterialTypeSentence   MaterialType = "sentence"   // 优美语句
	MaterialTypeHotTopic   MaterialType = "hot_topic"  // 热点专题
	MaterialTypeInterview  MaterialType = "interview"  // 面试素材
	MaterialTypeKnowledge  MaterialType = "knowledge"  // 常识素材
	MaterialTypeFormula    MaterialType = "formula"    // 公式速记
	MaterialTypeMnemonic   MaterialType = "mnemonic"   // 记忆口诀
	MaterialTypeTemplate   MaterialType = "template"   // 答题模板
	MaterialTypeVocabulary MaterialType = "vocabulary" // 词汇素材
)

// MaterialSubType 素材子类型
type MaterialSubType string

const (
	// 名言警句子类型
	SubTypeXiQuote        MaterialSubType = "xi_quote"        // 习近平讲话金句
	SubTypeAncientQuote   MaterialSubType = "ancient_quote"   // 古代名言警句
	SubTypeLeaderQuote    MaterialSubType = "leader_quote"    // 领导人论述
	SubTypeCelebrityQuote MaterialSubType = "celebrity_quote" // 名人名言

	// 案例素材子类型
	SubTypePositiveCase MaterialSubType = "positive_case" // 正面典型案例
	SubTypeNegativeCase MaterialSubType = "negative_case" // 反面警示案例
	SubTypeHotEventCase MaterialSubType = "hot_event"     // 热点事件分析

	// 优美语句子类型
	SubTypeOpeningSentence    MaterialSubType = "opening"    // 开头句式
	SubTypeTransitionSentence MaterialSubType = "transition" // 过渡句式
	SubTypeEndingSentence     MaterialSubType = "ending"     // 结尾句式
	SubTypeArgumentSentence   MaterialSubType = "argument"   // 论证句式

	// 热点专题子类型
	SubTypeAnnualHotTopic   MaterialSubType = "annual_hot"   // 年度热点
	SubTypeThemeHotTopic    MaterialSubType = "theme_hot"    // 主题热点
	SubTypeHotTopicAnalysis MaterialSubType = "hot_analysis" // 热点解读

	// 面试素材子类型
	SubTypePoliticsNews   MaterialSubType = "politics_news"   // 时政热点素材
	SubTypeInterviewCase  MaterialSubType = "interview_case"  // 答题案例库
	SubTypeInterviewQuote MaterialSubType = "interview_quote" // 面试金句库
	SubTypeOpeningGold    MaterialSubType = "opening_gold"    // 开场金句
	SubTypeClosingGold    MaterialSubType = "closing_gold"    // 结尾金句
	SubTypeComprehensive  MaterialSubType = "comprehensive"   // 综合分析题
	SubTypePlanning       MaterialSubType = "planning"        // 计划组织题
	SubTypeEmergency      MaterialSubType = "emergency"       // 应急应变题
	SubTypeInterpersonal  MaterialSubType = "interpersonal"   // 人际关系题

	// 常识素材子类型
	SubTypeCurrentAffairs MaterialSubType = "current_affairs" // 时事政治汇编
	SubTypeHistoryEvent   MaterialSubType = "history_event"   // 历史事件汇编
	SubTypeLawRegulation  MaterialSubType = "law_regulation"  // 法律法规汇编
)

// MaterialStatus 素材状态
type MaterialStatus string

const (
	MaterialStatusDraft     MaterialStatus = "draft"     // 草稿
	MaterialStatusPublished MaterialStatus = "published" // 已发布
	MaterialStatusArchived  MaterialStatus = "archived"  // 已归档
)

// =====================================================
// 素材分类表
// =====================================================

// MaterialCategory 素材分类
type MaterialCategory struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	ParentID      *uint          `gorm:"index" json:"parent_id,omitempty"`
	Name          string         `gorm:"type:varchar(100);not null" json:"name"`
	Code          string         `gorm:"type:varchar(50);not null;uniqueIndex" json:"code"`
	MaterialType  MaterialType   `gorm:"type:varchar(30);index" json:"material_type"`
	Subject       string         `gorm:"type:varchar(50);index" json:"subject,omitempty"` // 所属科目（申论/面试/常识）
	Icon          string         `gorm:"type:varchar(200)" json:"icon,omitempty"`
	Color         string         `gorm:"type:varchar(20);default:'#6366f1'" json:"color"`
	Description   string         `gorm:"type:varchar(500)" json:"description,omitempty"`
	SortOrder     int            `gorm:"default:0" json:"sort_order"`
	IsActive      bool           `gorm:"default:true;index" json:"is_active"`
	Level         int            `gorm:"default:1" json:"level"`
	Path          string         `gorm:"type:varchar(200)" json:"path,omitempty"`
	MaterialCount int            `gorm:"default:0" json:"material_count"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Parent   *MaterialCategory  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []MaterialCategory `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

func (MaterialCategory) TableName() string {
	return "what_material_categories"
}

// MaterialCategoryResponse 素材分类响应
type MaterialCategoryResponse struct {
	ID            uint                        `json:"id"`
	ParentID      *uint                       `json:"parent_id,omitempty"`
	Name          string                      `json:"name"`
	Code          string                      `json:"code"`
	MaterialType  MaterialType                `json:"material_type"`
	Subject       string                      `json:"subject,omitempty"`
	Icon          string                      `json:"icon,omitempty"`
	Color         string                      `json:"color"`
	Description   string                      `json:"description,omitempty"`
	SortOrder     int                         `json:"sort_order"`
	Level         int                         `json:"level"`
	MaterialCount int                         `json:"material_count"`
	Children      []*MaterialCategoryResponse `json:"children,omitempty"`
}

// ToResponse 转换为响应结构
func (c *MaterialCategory) ToResponse() *MaterialCategoryResponse {
	resp := &MaterialCategoryResponse{
		ID:            c.ID,
		ParentID:      c.ParentID,
		Name:          c.Name,
		Code:          c.Code,
		MaterialType:  c.MaterialType,
		Subject:       c.Subject,
		Icon:          c.Icon,
		Color:         c.Color,
		Description:   c.Description,
		SortOrder:     c.SortOrder,
		Level:         c.Level,
		MaterialCount: c.MaterialCount,
	}
	if len(c.Children) > 0 {
		resp.Children = make([]*MaterialCategoryResponse, len(c.Children))
		for i, child := range c.Children {
			childCopy := child
			resp.Children[i] = childCopy.ToResponse()
		}
	}
	return resp
}

// =====================================================
// 学习素材主表
// =====================================================

// LearningMaterial 学习素材
type LearningMaterial struct {
	ID          uint            `gorm:"primaryKey" json:"id"`
	CategoryID  uint            `gorm:"index;not null" json:"category_id"`
	Type        MaterialType    `gorm:"type:varchar(30);index;not null" json:"type"`
	SubType     MaterialSubType `gorm:"type:varchar(30);index" json:"sub_type,omitempty"`
	Title       string          `gorm:"type:varchar(300);not null" json:"title"`
	Content     string          `gorm:"type:mediumtext;not null" json:"content"`         // 素材主要内容
	Source      string          `gorm:"type:varchar(200)" json:"source,omitempty"`       // 来源（出处）
	Author      string          `gorm:"type:varchar(100)" json:"author,omitempty"`       // 作者/人物
	Year        *int            `gorm:"index" json:"year,omitempty"`                     // 年份
	Tags        JSONStringArray `gorm:"type:json" json:"tags,omitempty"`                 // 标签
	Keywords    JSONStringArray `gorm:"type:json" json:"keywords,omitempty"`             // 关键词
	ThemeTopics JSONStringArray `gorm:"type:json" json:"theme_topics,omitempty"`         // 主题分类（如：乡村振兴、生态文明等）
	Subject     string          `gorm:"type:varchar(50);index" json:"subject,omitempty"` // 适用科目

	// 扩展字段（用于不同类型素材）
	Analysis     string `gorm:"type:text" json:"analysis,omitempty"`     // 解读/分析
	Usage        string `gorm:"type:text" json:"usage,omitempty"`        // 使用场景/适用主题
	Example      string `gorm:"type:text" json:"example,omitempty"`      // 使用示例
	Translation  string `gorm:"type:text" json:"translation,omitempty"`  // 译文（古文翻译）
	Background   string `gorm:"type:text" json:"background,omitempty"`   // 背景信息
	Significance string `gorm:"type:text" json:"significance,omitempty"` // 意义/启示

	// 权限与访问
	IsFree     bool `gorm:"default:true;index" json:"is_free"`
	VIPOnly    bool `gorm:"default:false;index" json:"vip_only"`
	IsHot      bool `gorm:"default:false;index" json:"is_hot"`      // 热门素材
	IsFeatured bool `gorm:"default:false;index" json:"is_featured"` // 精选素材

	// 统计
	ViewCount    int `gorm:"default:0" json:"view_count"`
	CollectCount int `gorm:"default:0" json:"collect_count"`
	UseCount     int `gorm:"default:0" json:"use_count"` // 被使用/引用次数

	// 状态
	Status      MaterialStatus `gorm:"type:varchar(20);default:'published';index" json:"status"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	PublishedAt *time.Time     `gorm:"type:datetime" json:"published_at,omitempty"`

	// 时间戳
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Category *MaterialCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (LearningMaterial) TableName() string {
	return "what_learning_materials"
}

// LearningMaterialResponse 素材响应
type LearningMaterialResponse struct {
	ID           uint                      `json:"id"`
	CategoryID   uint                      `json:"category_id"`
	Type         MaterialType              `json:"type"`
	SubType      MaterialSubType           `json:"sub_type,omitempty"`
	Title        string                    `json:"title"`
	Content      string                    `json:"content"`
	Source       string                    `json:"source,omitempty"`
	Author       string                    `json:"author,omitempty"`
	Year         *int                      `json:"year,omitempty"`
	Tags         []string                  `json:"tags,omitempty"`
	Keywords     []string                  `json:"keywords,omitempty"`
	ThemeTopics  []string                  `json:"theme_topics,omitempty"`
	Subject      string                    `json:"subject,omitempty"`
	Analysis     string                    `json:"analysis,omitempty"`
	Usage        string                    `json:"usage,omitempty"`
	Example      string                    `json:"example,omitempty"`
	Translation  string                    `json:"translation,omitempty"`
	Background   string                    `json:"background,omitempty"`
	Significance string                    `json:"significance,omitempty"`
	IsFree       bool                      `json:"is_free"`
	VIPOnly      bool                      `json:"vip_only"`
	IsHot        bool                      `json:"is_hot"`
	IsFeatured   bool                      `json:"is_featured"`
	ViewCount    int                       `json:"view_count"`
	CollectCount int                       `json:"collect_count"`
	UseCount     int                       `json:"use_count"`
	Status       MaterialStatus            `json:"status"`
	PublishedAt  *time.Time                `json:"published_at,omitempty"`
	CreatedAt    time.Time                 `json:"created_at"`
	UpdatedAt    time.Time                 `json:"updated_at"`
	Category     *MaterialCategoryResponse `json:"category,omitempty"`
	IsCollected  bool                      `json:"is_collected"` // 当前用户是否已收藏
}

// ToResponse 转换为响应
func (m *LearningMaterial) ToResponse() *LearningMaterialResponse {
	resp := &LearningMaterialResponse{
		ID:           m.ID,
		CategoryID:   m.CategoryID,
		Type:         m.Type,
		SubType:      m.SubType,
		Title:        m.Title,
		Content:      m.Content,
		Source:       m.Source,
		Author:       m.Author,
		Year:         m.Year,
		Tags:         m.Tags,
		Keywords:     m.Keywords,
		ThemeTopics:  m.ThemeTopics,
		Subject:      m.Subject,
		Analysis:     m.Analysis,
		Usage:        m.Usage,
		Example:      m.Example,
		Translation:  m.Translation,
		Background:   m.Background,
		Significance: m.Significance,
		IsFree:       m.IsFree,
		VIPOnly:      m.VIPOnly,
		IsHot:        m.IsHot,
		IsFeatured:   m.IsFeatured,
		ViewCount:    m.ViewCount,
		CollectCount: m.CollectCount,
		UseCount:     m.UseCount,
		Status:       m.Status,
		PublishedAt:  m.PublishedAt,
		CreatedAt:    m.CreatedAt,
		UpdatedAt:    m.UpdatedAt,
	}
	if m.Category != nil {
		resp.Category = m.Category.ToResponse()
	}
	return resp
}

// LearningMaterialBriefResponse 素材简要响应（列表用）
type LearningMaterialBriefResponse struct {
	ID           uint            `json:"id"`
	CategoryID   uint            `json:"category_id"`
	Type         MaterialType    `json:"type"`
	SubType      MaterialSubType `json:"sub_type,omitempty"`
	Title        string          `json:"title"`
	Content      string          `json:"content"` // 列表显示时可能需要截断
	Source       string          `json:"source,omitempty"`
	Author       string          `json:"author,omitempty"`
	Year         *int            `json:"year,omitempty"`
	Tags         []string        `json:"tags,omitempty"`
	ThemeTopics  []string        `json:"theme_topics,omitempty"`
	Subject      string          `json:"subject,omitempty"`
	IsFree       bool            `json:"is_free"`
	VIPOnly      bool            `json:"vip_only"`
	IsHot        bool            `json:"is_hot"`
	IsFeatured   bool            `json:"is_featured"`
	ViewCount    int             `json:"view_count"`
	CollectCount int             `json:"collect_count"`
	Status       MaterialStatus  `json:"status"`
	CreatedAt    time.Time       `json:"created_at"`
	CategoryName string          `json:"category_name,omitempty"`
}

// ToBriefResponse 转换为简要响应
func (m *LearningMaterial) ToBriefResponse() *LearningMaterialBriefResponse {
	resp := &LearningMaterialBriefResponse{
		ID:           m.ID,
		CategoryID:   m.CategoryID,
		Type:         m.Type,
		SubType:      m.SubType,
		Title:        m.Title,
		Content:      m.Content,
		Source:       m.Source,
		Author:       m.Author,
		Year:         m.Year,
		Tags:         m.Tags,
		ThemeTopics:  m.ThemeTopics,
		Subject:      m.Subject,
		IsFree:       m.IsFree,
		VIPOnly:      m.VIPOnly,
		IsHot:        m.IsHot,
		IsFeatured:   m.IsFeatured,
		ViewCount:    m.ViewCount,
		CollectCount: m.CollectCount,
		Status:       m.Status,
		CreatedAt:    m.CreatedAt,
	}
	if m.Category != nil {
		resp.CategoryName = m.Category.Name
	}
	return resp
}

// =====================================================
// 素材收藏表
// =====================================================

// MaterialCollect 素材收藏
type MaterialCollect struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `gorm:"uniqueIndex:uk_user_material_collect;not null" json:"user_id"`
	MaterialID uint           `gorm:"uniqueIndex:uk_user_material_collect;not null" json:"material_id"`
	FolderID   *uint          `gorm:"index" json:"folder_id,omitempty"` // 收藏夹ID
	Note       string         `gorm:"type:varchar(500)" json:"note,omitempty"`
	CreatedAt  time.Time      `json:"created_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Material *LearningMaterial `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
}

func (MaterialCollect) TableName() string {
	return "what_material_collects"
}

// =====================================================
// 素材统计
// =====================================================

// MaterialStats 素材统计
type MaterialStats struct {
	TotalCount     int64                 `json:"total_count"`     // 总素材数
	PublishedCount int64                 `json:"published_count"` // 已发布数
	DraftCount     int64                 `json:"draft_count"`     // 草稿数
	QuoteCount     int64                 `json:"quote_count"`     // 名言警句数
	CaseCount      int64                 `json:"case_count"`      // 案例素材数
	SentenceCount  int64                 `json:"sentence_count"`  // 优美语句数
	HotTopicCount  int64                 `json:"hot_topic_count"` // 热点专题数
	InterviewCount int64                 `json:"interview_count"` // 面试素材数
	KnowledgeCount int64                 `json:"knowledge_count"` // 常识素材数
	HotCount       int64                 `json:"hot_count"`       // 热门素材数
	FeaturedCount  int64                 `json:"featured_count"`  // 精选素材数
	TodayNewCount  int64                 `json:"today_new_count"` // 今日新增
	TypeStats      []MaterialTypeStat    `json:"type_stats"`      // 按类型统计
	SubjectStats   []MaterialSubjectStat `json:"subject_stats"`   // 按科目统计
}

// MaterialTypeStat 类型统计
type MaterialTypeStat struct {
	Type  MaterialType `json:"type"`
	Name  string       `json:"name"`
	Count int          `json:"count"`
}

// MaterialSubjectStat 科目统计
type MaterialSubjectStat struct {
	Subject string `json:"subject"`
	Count   int    `json:"count"`
}

// =====================================================
// 查询参数
// =====================================================

// MaterialQueryParams 素材查询参数
type MaterialQueryParams struct {
	CategoryID  *uint           `form:"category_id"`
	Type        MaterialType    `form:"type"`
	SubType     MaterialSubType `form:"sub_type"`
	Subject     string          `form:"subject"`
	Status      MaterialStatus  `form:"status"`
	IsFree      *bool           `form:"is_free"`
	VIPOnly     *bool           `form:"vip_only"`
	IsHot       *bool           `form:"is_hot"`
	IsFeatured  *bool           `form:"is_featured"`
	Year        *int            `form:"year"`
	Keyword     string          `form:"keyword"`
	Tags        []string        `form:"tags"`
	ThemeTopics []string        `form:"theme_topics"`
	Page        int             `form:"page"`
	PageSize    int             `form:"page_size"`
	SortBy      string          `form:"sort_by"`    // view_count/collect_count/created_at/sort_order
	SortOrder   string          `form:"sort_order"` // asc/desc
}

// =====================================================
// 热点主题常量
// =====================================================

// HotTopicThemes 热点主题列表
var HotTopicThemes = []string{
	"乡村振兴",
	"生态文明",
	"科技创新",
	"社会治理",
	"民生保障",
	"文化建设",
	"依法治国",
	"共同富裕",
	"数字经济",
	"绿色发展",
	"高质量发展",
	"新质生产力",
	"教育公平",
	"医疗健康",
	"养老服务",
	"就业创业",
	"粮食安全",
	"能源安全",
	"国家安全",
	"对外开放",
}

// MaterialTypeNames 素材类型名称映射
var MaterialTypeNames = map[MaterialType]string{
	MaterialTypeQuote:      "名言警句",
	MaterialTypeCase:       "案例素材",
	MaterialTypeSentence:   "优美语句",
	MaterialTypeHotTopic:   "热点专题",
	MaterialTypeInterview:  "面试素材",
	MaterialTypeKnowledge:  "常识素材",
	MaterialTypeFormula:    "公式速记",
	MaterialTypeMnemonic:   "记忆口诀",
	MaterialTypeTemplate:   "答题模板",
	MaterialTypeVocabulary: "词汇素材",
}

// MaterialSubTypeNames 素材子类型名称映射
var MaterialSubTypeNames = map[MaterialSubType]string{
	SubTypeXiQuote:            "习近平讲话金句",
	SubTypeAncientQuote:       "古代名言警句",
	SubTypeLeaderQuote:        "领导人论述",
	SubTypeCelebrityQuote:     "名人名言",
	SubTypePositiveCase:       "正面典型案例",
	SubTypeNegativeCase:       "反面警示案例",
	SubTypeHotEventCase:       "热点事件分析",
	SubTypeOpeningSentence:    "开头句式",
	SubTypeTransitionSentence: "过渡句式",
	SubTypeEndingSentence:     "结尾句式",
	SubTypeArgumentSentence:   "论证句式",
	SubTypeAnnualHotTopic:     "年度热点",
	SubTypeThemeHotTopic:      "主题热点",
	SubTypeHotTopicAnalysis:   "热点解读",
	SubTypePoliticsNews:       "时政热点素材",
	SubTypeInterviewCase:      "答题案例库",
	SubTypeInterviewQuote:     "面试金句库",
	SubTypeOpeningGold:        "开场金句",
	SubTypeClosingGold:        "结尾金句",
	SubTypeComprehensive:      "综合分析题",
	SubTypePlanning:           "计划组织题",
	SubTypeEmergency:          "应急应变题",
	SubTypeInterpersonal:      "人际关系题",
	SubTypeCurrentAffairs:     "时事政治汇编",
	SubTypeHistoryEvent:       "历史事件汇编",
	SubTypeLawRegulation:      "法律法规汇编",
}

// =====================================================
// JSON 辅助类型（如果在其他文件中未定义）
// =====================================================

// 注意: JSONStringArray 应该在其他文件中已定义
// 如果没有，可以取消下面的注释

/*
// JSONStringArray JSON字符串数组
type JSONStringArray []string

// Value 实现 driver.Valuer 接口
func (a JSONStringArray) Value() (driver.Value, error) {
	if a == nil {
		return "[]", nil
	}
	return json.Marshal(a)
}

// Scan 实现 sql.Scanner 接口
func (a *JSONStringArray) Scan(value interface{}) error {
	if value == nil {
		*a = []string{}
		return nil
	}

	var bytes []byte
	switch val := value.(type) {
	case []byte:
		bytes = val
	case string:
		bytes = []byte(val)
	default:
		return errors.New("invalid type for JSONStringArray")
	}

	return json.Unmarshal(bytes, a)
}
*/

// 确保导入不被编译器删除
var (
	_ driver.Valuer = (*JSONStringArray)(nil)
	_               = json.Marshal
	_               = errors.New
)
