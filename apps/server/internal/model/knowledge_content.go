package model

import (
	"database/sql/driver"
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// =====================================================
// §25.3 知识点内容生成相关模型
// =====================================================

// JSONMap JSON对象类型
type JSONMap map[string]interface{}

func (j JSONMap) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

func (j *JSONMap) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, j)
}

// JSONStrArray JSON字符串数组类型
type JSONStrArray []string

func (j JSONStrArray) Value() (driver.Value, error) {
	if j == nil {
		return nil, nil
	}
	return json.Marshal(j)
}

func (j *JSONStrArray) Scan(value interface{}) error {
	if value == nil {
		*j = nil
		return nil
	}
	bytes, ok := value.([]byte)
	if !ok {
		return nil
	}
	return json.Unmarshal(bytes, j)
}

// KnowledgeDetailContentType 知识点详情内容类型
type KnowledgeDetailContentType string

const (
	KnowledgeDetailTypeDefinition    KnowledgeDetailContentType = "definition"     // 概念定义
	KnowledgeDetailTypeKeyPoints     KnowledgeDetailContentType = "key_points"     // 核心要点
	KnowledgeDetailTypeQuestionTypes KnowledgeDetailContentType = "question_types" // 常见题型
	KnowledgeDetailTypeSolvingMethod KnowledgeDetailContentType = "solving_method" // 解题方法
	KnowledgeDetailTypeExamples      KnowledgeDetailContentType = "examples"       // 典型例题
	KnowledgeDetailTypeErrorProne    KnowledgeDetailContentType = "error_prone"    // 易错点提醒
	KnowledgeDetailTypeRelated       KnowledgeDetailContentType = "related"        // 关联知识点
)

// KnowledgeDetail 知识点详情内容
// 表名: what_knowledge_details
type KnowledgeDetail struct {
	ID               uint                       `gorm:"primaryKey" json:"id"`
	KnowledgePointID uint                       `gorm:"index;not null" json:"knowledge_point_id"`
	ContentType      KnowledgeDetailContentType `gorm:"type:varchar(30);not null;index" json:"content_type"`
	Title            string                     `gorm:"type:varchar(200)" json:"title,omitempty"` // 内容标题
	Content          string                     `gorm:"type:text;not null" json:"content"`        // 内容（富文本/JSON）
	SortOrder        int                        `gorm:"default:0" json:"sort_order"`              // 排序
	IsActive         bool                       `gorm:"default:true" json:"is_active"`            // 是否启用
	Metadata         JSONMap                    `gorm:"type:json" json:"metadata,omitempty"`      // 元数据（如例题ID列表、关联ID等）
	ViewCount        int                        `gorm:"default:0" json:"view_count"`              // 查看次数
	LikeCount        int                        `gorm:"default:0" json:"like_count"`              // 点赞数
	CreatedAt        time.Time                  `json:"created_at"`
	UpdatedAt        time.Time                  `json:"updated_at"`
	DeletedAt        gorm.DeletedAt             `gorm:"index" json:"-"`

	// 关联
	KnowledgePoint *KnowledgePoint `gorm:"foreignKey:KnowledgePointID" json:"knowledge_point,omitempty"`
}

func (KnowledgeDetail) TableName() string {
	return "what_knowledge_details"
}

// KnowledgeDetailResponse 知识点详情响应
type KnowledgeDetailResponse struct {
	ID               uint                       `json:"id"`
	KnowledgePointID uint                       `json:"knowledge_point_id"`
	ContentType      KnowledgeDetailContentType `json:"content_type"`
	Title            string                     `json:"title,omitempty"`
	Content          string                     `json:"content"`
	SortOrder        int                        `json:"sort_order"`
	IsActive         bool                       `json:"is_active"`
	Metadata         map[string]interface{}     `json:"metadata,omitempty"`
	ViewCount        int                        `json:"view_count"`
	LikeCount        int                        `json:"like_count"`
	CreatedAt        time.Time                  `json:"created_at"`
}

func (k *KnowledgeDetail) ToResponse() *KnowledgeDetailResponse {
	return &KnowledgeDetailResponse{
		ID:               k.ID,
		KnowledgePointID: k.KnowledgePointID,
		ContentType:      k.ContentType,
		Title:            k.Title,
		Content:          k.Content,
		SortOrder:        k.SortOrder,
		IsActive:         k.IsActive,
		Metadata:         k.Metadata,
		ViewCount:        k.ViewCount,
		LikeCount:        k.LikeCount,
		CreatedAt:        k.CreatedAt,
	}
}

// =====================================================
// §25.3.2 知识速记卡片
// =====================================================

// FlashCardType 速记卡片类型
type FlashCardType string

const (
	FlashCardTypeIdiom       FlashCardType = "idiom"     // 成语
	FlashCardTypeWord        FlashCardType = "word"      // 实词辨析
	FlashCardTypeFormula     FlashCardType = "formula"   // 数学公式
	FlashCardTypeLogic       FlashCardType = "logic"     // 逻辑公式
	FlashCardTypeFigure      FlashCardType = "figure"    // 图推规律
	FlashCardTypeLaw         FlashCardType = "law"       // 法律常识
	FlashCardTypeHistory     FlashCardType = "history"   // 历史常识
	FlashCardTypeGeography   FlashCardType = "geography" // 地理常识
	FlashCardTypeTech        FlashCardType = "tech"      // 科技常识
	FlashCardTypeWriting     FlashCardType = "writing"   // 申论写作
	FlashCardTypeInterview   FlashCardType = "interview" // 面试技巧
	FlashCardTypeDocument    FlashCardType = "document"  // 公文格式
	FlashCardTypeDataAnalsis FlashCardType = "data"      // 资料分析
	FlashCardTypeOther       FlashCardType = "other"     // 其他
)

// KnowledgeFlashCard 知识速记卡片
// 表名: what_knowledge_flash_cards
type KnowledgeFlashCard struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	KnowledgePointID *uint          `gorm:"index" json:"knowledge_point_id,omitempty"` // 关联知识点（可选）
	CategoryID       *uint          `gorm:"index" json:"category_id,omitempty"`        // 所属分类（可选）
	CardType         FlashCardType  `gorm:"type:varchar(30);not null;index" json:"card_type"`
	Title            string         `gorm:"type:varchar(200);not null" json:"title"` // 卡片标题
	FrontContent     string         `gorm:"type:text;not null" json:"front_content"` // 正面内容（问题/词汇/公式名）
	BackContent      string         `gorm:"type:text;not null" json:"back_content"`  // 背面内容（答案/解释/推导）
	Example          string         `gorm:"type:text" json:"example,omitempty"`      // 示例/例句
	Mnemonic         string         `gorm:"type:text" json:"mnemonic,omitempty"`     // 记忆技巧/口诀
	Tags             JSONStrArray   `gorm:"type:json" json:"tags,omitempty"`         // 标签
	Difficulty       int            `gorm:"default:3" json:"difficulty"`             // 难度 1-5
	Importance       int            `gorm:"default:3" json:"importance"`             // 重要度 1-5
	SortOrder        int            `gorm:"default:0" json:"sort_order"`             // 排序
	IsActive         bool           `gorm:"default:true" json:"is_active"`           // 是否启用
	ViewCount        int            `gorm:"default:0" json:"view_count"`             // 查看次数
	CollectCount     int            `gorm:"default:0" json:"collect_count"`          // 收藏次数
	MasterCount      int            `gorm:"default:0" json:"master_count"`           // 掌握人数
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	KnowledgePoint *KnowledgePoint `gorm:"foreignKey:KnowledgePointID" json:"knowledge_point,omitempty"`
	Category       *CourseCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (KnowledgeFlashCard) TableName() string {
	return "what_knowledge_flash_cards"
}

// KnowledgeFlashCardResponse 速记卡片响应
type KnowledgeFlashCardResponse struct {
	ID               uint          `json:"id"`
	KnowledgePointID *uint         `json:"knowledge_point_id,omitempty"`
	CategoryID       *uint         `json:"category_id,omitempty"`
	CardType         FlashCardType `json:"card_type"`
	Title            string        `json:"title"`
	FrontContent     string        `json:"front_content"`
	BackContent      string        `json:"back_content"`
	Example          string        `json:"example,omitempty"`
	Mnemonic         string        `json:"mnemonic,omitempty"`
	Tags             []string      `json:"tags,omitempty"`
	Difficulty       int           `json:"difficulty"`
	Importance       int           `json:"importance"`
	SortOrder        int           `json:"sort_order"`
	IsActive         bool          `json:"is_active"`
	ViewCount        int           `json:"view_count"`
	CollectCount     int           `json:"collect_count"`
	MasterCount      int           `json:"master_count"`
	CreatedAt        time.Time     `json:"created_at"`
}

func (c *KnowledgeFlashCard) ToResponse() *KnowledgeFlashCardResponse {
	return &KnowledgeFlashCardResponse{
		ID:               c.ID,
		KnowledgePointID: c.KnowledgePointID,
		CategoryID:       c.CategoryID,
		CardType:         c.CardType,
		Title:            c.Title,
		FrontContent:     c.FrontContent,
		BackContent:      c.BackContent,
		Example:          c.Example,
		Mnemonic:         c.Mnemonic,
		Tags:             c.Tags,
		Difficulty:       c.Difficulty,
		Importance:       c.Importance,
		SortOrder:        c.SortOrder,
		IsActive:         c.IsActive,
		ViewCount:        c.ViewCount,
		CollectCount:     c.CollectCount,
		MasterCount:      c.MasterCount,
		CreatedAt:        c.CreatedAt,
	}
}

// =====================================================
// §25.3.3 思维导图
// =====================================================

// MindMapType 思维导图类型
type MindMapType string

const (
	MindMapTypeKnowledge MindMapType = "knowledge" // 知识点导图
	MindMapTypeCourse    MindMapType = "course"    // 课程导图
	MindMapTypeSubject   MindMapType = "subject"   // 科目导图
	MindMapTypeChapter   MindMapType = "chapter"   // 章节导图
	MindMapTypeCustom    MindMapType = "custom"    // 自定义导图
)

// KnowledgeMindMap 知识点思维导图
// 表名: what_knowledge_mind_maps
type KnowledgeMindMap struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	KnowledgePointID *uint          `gorm:"index" json:"knowledge_point_id,omitempty"` // 关联知识点
	CategoryID       *uint          `gorm:"index" json:"category_id,omitempty"`        // 关联分类
	MapType          MindMapType    `gorm:"type:varchar(30);not null;index" json:"map_type"`
	Title            string         `gorm:"type:varchar(200);not null" json:"title"`          // 导图标题
	Description      string         `gorm:"type:text" json:"description,omitempty"`           // 导图描述
	MapData          string         `gorm:"type:longtext;not null" json:"map_data"`           // 导图数据（JSON格式）
	ThumbnailURL     string         `gorm:"type:varchar(500)" json:"thumbnail_url,omitempty"` // 缩略图URL
	Tags             JSONStrArray   `gorm:"type:json" json:"tags,omitempty"`                  // 标签
	IsActive         bool           `gorm:"default:true" json:"is_active"`                    // 是否启用
	IsPublic         bool           `gorm:"default:true" json:"is_public"`                    // 是否公开
	ViewCount        int            `gorm:"default:0" json:"view_count"`                      // 查看次数
	CollectCount     int            `gorm:"default:0" json:"collect_count"`                   // 收藏次数
	DownloadCount    int            `gorm:"default:0" json:"download_count"`                  // 下载次数
	CreatedBy        uint           `gorm:"index" json:"created_by"`                          // 创建者ID
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`
	DeletedAt        gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	KnowledgePoint *KnowledgePoint `gorm:"foreignKey:KnowledgePointID" json:"knowledge_point,omitempty"`
	Category       *CourseCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (KnowledgeMindMap) TableName() string {
	return "what_knowledge_mind_maps"
}

// MindMapNode 思维导图节点结构
type MindMapNode struct {
	ID       string         `json:"id"`
	Text     string         `json:"text"`
	Note     string         `json:"note,omitempty"`
	Link     string         `json:"link,omitempty"`
	Color    string         `json:"color,omitempty"`
	Icon     string         `json:"icon,omitempty"`
	Expanded bool           `json:"expanded"`
	Children []*MindMapNode `json:"children,omitempty"`
}

// MindMapData 思维导图数据结构
type MindMapData struct {
	Root   *MindMapNode `json:"root"`
	Theme  string       `json:"theme,omitempty"`  // 主题样式
	Layout string       `json:"layout,omitempty"` // 布局方式
}

// KnowledgeMindMapResponse 思维导图响应
type KnowledgeMindMapResponse struct {
	ID               uint        `json:"id"`
	KnowledgePointID *uint       `json:"knowledge_point_id,omitempty"`
	CategoryID       *uint       `json:"category_id,omitempty"`
	MapType          MindMapType `json:"map_type"`
	Title            string      `json:"title"`
	Description      string      `json:"description,omitempty"`
	MapData          string      `json:"map_data"`
	ThumbnailURL     string      `json:"thumbnail_url,omitempty"`
	Tags             []string    `json:"tags,omitempty"`
	IsActive         bool        `json:"is_active"`
	IsPublic         bool        `json:"is_public"`
	ViewCount        int         `json:"view_count"`
	CollectCount     int         `json:"collect_count"`
	DownloadCount    int         `json:"download_count"`
	CreatedBy        uint        `json:"created_by"`
	CreatedAt        time.Time   `json:"created_at"`
}

func (m *KnowledgeMindMap) ToResponse() *KnowledgeMindMapResponse {
	return &KnowledgeMindMapResponse{
		ID:               m.ID,
		KnowledgePointID: m.KnowledgePointID,
		CategoryID:       m.CategoryID,
		MapType:          m.MapType,
		Title:            m.Title,
		Description:      m.Description,
		MapData:          m.MapData,
		ThumbnailURL:     m.ThumbnailURL,
		Tags:             m.Tags,
		IsActive:         m.IsActive,
		IsPublic:         m.IsPublic,
		ViewCount:        m.ViewCount,
		CollectCount:     m.CollectCount,
		DownloadCount:    m.DownloadCount,
		CreatedBy:        m.CreatedBy,
		CreatedAt:        m.CreatedAt,
	}
}

// =====================================================
// 用户卡片学习记录
// =====================================================

// UserFlashCardStatus 用户卡片学习状态
type UserFlashCardStatus string

const (
	UserFlashCardStatusNew      UserFlashCardStatus = "new"      // 新卡片
	UserFlashCardStatusLearning UserFlashCardStatus = "learning" // 学习中
	UserFlashCardStatusReview   UserFlashCardStatus = "review"   // 复习中
	UserFlashCardStatusMastered UserFlashCardStatus = "mastered" // 已掌握
)

// UserFlashCardRecord 用户卡片学习记录
// 表名: what_user_flash_card_records
type UserFlashCardRecord struct {
	ID           uint                `gorm:"primaryKey" json:"id"`
	UserID       uint                `gorm:"index;not null" json:"user_id"`
	CardID       uint                `gorm:"index;not null" json:"card_id"`
	Status       UserFlashCardStatus `gorm:"type:varchar(20);default:'new'" json:"status"`
	ReviewCount  int                 `gorm:"default:0" json:"review_count"`     // 复习次数
	CorrectCount int                 `gorm:"default:0" json:"correct_count"`    // 正确次数
	WrongCount   int                 `gorm:"default:0" json:"wrong_count"`      // 错误次数
	EaseFactor   float64             `gorm:"default:2.5" json:"ease_factor"`    // 难度系数
	Interval     int                 `gorm:"default:0" json:"interval"`         // 复习间隔（天）
	NextReviewAt *time.Time          `json:"next_review_at,omitempty"`          // 下次复习时间
	LastReviewAt *time.Time          `json:"last_review_at,omitempty"`          // 上次复习时间
	IsCollected  bool                `gorm:"default:false" json:"is_collected"` // 是否收藏
	CreatedAt    time.Time           `json:"created_at"`
	UpdatedAt    time.Time           `json:"updated_at"`

	// 关联
	Card *KnowledgeFlashCard `gorm:"foreignKey:CardID" json:"card,omitempty"`
}

func (UserFlashCardRecord) TableName() string {
	return "what_user_flash_card_records"
}

// =====================================================
// 统计相关
// =====================================================

// KnowledgeContentStats 知识点内容统计
type KnowledgeContentStats struct {
	TotalDetails      int64 `json:"total_details"`       // 知识点详情总数
	TotalFlashCards   int64 `json:"total_flash_cards"`   // 速记卡片总数
	TotalMindMaps     int64 `json:"total_mind_maps"`     // 思维导图总数
	ActiveDetails     int64 `json:"active_details"`      // 启用的详情数
	ActiveFlashCards  int64 `json:"active_flash_cards"`  // 启用的卡片数
	ActiveMindMaps    int64 `json:"active_mind_maps"`    // 启用的导图数
	TotalViewCount    int64 `json:"total_view_count"`    // 总查看次数
	TotalCollectCount int64 `json:"total_collect_count"` // 总收藏次数
}

// FlashCardTypeStats 卡片类型统计
type FlashCardTypeStats struct {
	CardType FlashCardType `json:"card_type"`
	Count    int64         `json:"count"`
	ViewSum  int64         `json:"view_sum"`
}

// MindMapTypeStats 导图类型统计
type MindMapTypeStats struct {
	MapType MindMapType `json:"map_type"`
	Count   int64       `json:"count"`
	ViewSum int64       `json:"view_sum"`
}
