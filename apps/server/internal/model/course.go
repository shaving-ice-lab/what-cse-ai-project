package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// =====================================================
// 课程分类
// =====================================================

// CourseCategory 课程分类
type CourseCategory struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	ParentID    *uint          `gorm:"index" json:"parent_id,omitempty"` // 父分类ID（支持多级分类）
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	Code        string         `gorm:"type:varchar(50);not null;uniqueIndex" json:"code"` // 如 xc_yy 行测-言语
	ExamType    string         `gorm:"type:varchar(50);index" json:"exam_type,omitempty"` // 考试类型（公务员/事业单位/教师等）
	Subject     string         `gorm:"type:varchar(50);index" json:"subject,omitempty"`   // 科目（行测/申论/面试/公基/专业）
	Icon        string         `gorm:"type:varchar(200)" json:"icon,omitempty"`
	Color       string         `gorm:"type:varchar(100);default:'#6366f1'" json:"color"`
	Description string         `gorm:"type:varchar(500)" json:"description,omitempty"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	IsActive    bool           `gorm:"default:true;index" json:"is_active"`
	Level       int            `gorm:"default:1" json:"level"`                  // 层级深度
	Path        string         `gorm:"type:varchar(200)" json:"path,omitempty"` // 完整路径，如 "1/2/3"
	CourseCount int            `gorm:"default:0" json:"course_count"`

	// 新增：LLM生成的丰富描述信息
	LongDescription    string          `gorm:"type:text" json:"long_description,omitempty"`              // 详细描述（200-300字）
	Features           JSONStringArray `gorm:"type:json" json:"features,omitempty"`                      // 功能亮点列表
	LearningObjectives JSONStringArray `gorm:"type:json" json:"learning_objectives,omitempty"`           // 学习目标
	Keywords           JSONStringArray `gorm:"type:json" json:"keywords,omitempty"`                      // 关键词
	EstimatedDuration  string          `gorm:"type:varchar(50)" json:"estimated_duration,omitempty"`     // 预计学习时长，如 "45课时"
	Difficulty         string          `gorm:"type:varchar(20)" json:"difficulty,omitempty"`             // 难度等级：基础/进阶/提高/冲刺
	QuestionCount      int             `gorm:"default:0" json:"question_count"`                          // 题目数量
	AvgTime            int             `gorm:"default:0" json:"avg_time"`                                // 平均用时（秒）
	Weight             float64         `gorm:"default:0" json:"weight"`                                  // 考试权重
	KeyPoints          JSONStringArray `gorm:"type:json" json:"key_points,omitempty"`                    // 核心考点

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Parent   *CourseCategory  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []CourseCategory `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

func (CourseCategory) TableName() string {
	return "what_course_categories"
}

// CourseCategoryResponse 课程分类响应
type CourseCategoryResponse struct {
	ID          uint                      `json:"id"`
	ParentID    *uint                     `json:"parent_id,omitempty"`
	Name        string                    `json:"name"`
	Code        string                    `json:"code"`
	ExamType    string                    `json:"exam_type,omitempty"`
	Subject     string                    `json:"subject,omitempty"`
	Icon        string                    `json:"icon,omitempty"`
	Color       string                    `json:"color"`
	Description string                    `json:"description,omitempty"`
	SortOrder   int                       `json:"sort_order"`
	Level       int                       `json:"level"`
	CourseCount int                       `json:"course_count"`

	// 新增：丰富描述信息
	LongDescription    string   `json:"long_description,omitempty"`
	Features           []string `json:"features,omitempty"`
	LearningObjectives []string `json:"learning_objectives,omitempty"`
	Keywords           []string `json:"keywords,omitempty"`
	EstimatedDuration  string   `json:"estimated_duration,omitempty"`
	Difficulty         string   `json:"difficulty,omitempty"`
	QuestionCount      int      `json:"question_count,omitempty"`
	AvgTime            int      `json:"avg_time,omitempty"`
	Weight             float64  `json:"weight,omitempty"`
	KeyPoints          []string `json:"key_points,omitempty"`

	Children []*CourseCategoryResponse `json:"children,omitempty"`
}

// ToResponse 转换为响应结构
func (c *CourseCategory) ToResponse() *CourseCategoryResponse {
	resp := &CourseCategoryResponse{
		ID:          c.ID,
		ParentID:    c.ParentID,
		Name:        c.Name,
		Code:        c.Code,
		ExamType:    c.ExamType,
		Subject:     c.Subject,
		Icon:        c.Icon,
		Color:       c.Color,
		Description: c.Description,
		SortOrder:   c.SortOrder,
		Level:       c.Level,
		CourseCount: c.CourseCount,

		// 新增字段
		LongDescription:    c.LongDescription,
		Features:           c.Features,
		LearningObjectives: c.LearningObjectives,
		Keywords:           c.Keywords,
		EstimatedDuration:  c.EstimatedDuration,
		Difficulty:         c.Difficulty,
		QuestionCount:      c.QuestionCount,
		AvgTime:            c.AvgTime,
		Weight:             c.Weight,
		KeyPoints:          c.KeyPoints,
	}
	if len(c.Children) > 0 {
		resp.Children = make([]*CourseCategoryResponse, len(c.Children))
		for i, child := range c.Children {
			childCopy := child // 创建副本避免闭包问题
			resp.Children[i] = childCopy.ToResponse()
		}
	}
	return resp
}

// =====================================================
// 课程
// =====================================================

// CourseStatus 课程状态
type CourseStatus int

const (
	CourseStatusDraft     CourseStatus = 0 // 草稿
	CourseStatusPublished CourseStatus = 1 // 已发布
	CourseStatusArchived  CourseStatus = 2 // 已归档
)

// CourseContentType 课程内容类型
type CourseContentType string

const (
	CourseContentVideo   CourseContentType = "video"   // 视频
	CourseContentArticle CourseContentType = "article" // 图文
	CourseContentPDF     CourseContentType = "pdf"     // PDF
	CourseContentMindmap CourseContentType = "mindmap" // 思维导图
	CourseContentAudio   CourseContentType = "audio"   // 音频
)

// CourseDifficulty 课程难度
type CourseDifficulty string

const (
	CourseDifficultyBeginner     CourseDifficulty = "beginner"     // 入门
	CourseDifficultyBasic        CourseDifficulty = "basic"        // 基础
	CourseDifficultyIntermediate CourseDifficulty = "intermediate" // 进阶
	CourseDifficultyAdvanced     CourseDifficulty = "advanced"     // 高级
)

// Course 课程
type Course struct {
	ID            uint              `gorm:"primaryKey" json:"id"`
	CategoryID    uint              `gorm:"index;not null" json:"category_id"`
	Title         string            `gorm:"type:varchar(200);not null" json:"title"`
	Subtitle      string            `gorm:"type:varchar(300)" json:"subtitle,omitempty"`
	CoverImage    string            `gorm:"type:varchar(500)" json:"cover_image,omitempty"`
	Description   string            `gorm:"type:text" json:"description,omitempty"`
	ContentType   CourseContentType `gorm:"type:varchar(20);default:'article'" json:"content_type"`
	Difficulty    CourseDifficulty  `gorm:"type:varchar(20);default:'basic'" json:"difficulty"`
	Duration      int               `gorm:"default:0" json:"duration"` // 预计学习时长（分钟）
	ChapterCount  int               `gorm:"default:0" json:"chapter_count"`
	TeacherName   string            `gorm:"type:varchar(50)" json:"teacher_name,omitempty"`
	TeacherAvatar string            `gorm:"type:varchar(500)" json:"teacher_avatar,omitempty"`
	TeacherIntro  string            `gorm:"type:varchar(500)" json:"teacher_intro,omitempty"`

	// 权限与价格
	IsFree  bool    `gorm:"default:true;index" json:"is_free"`
	VIPOnly bool    `gorm:"default:false;index" json:"vip_only"`
	Price   float64 `gorm:"type:decimal(10,2);default:0" json:"price"`

	// 统计数据
	ViewCount    int `gorm:"default:0;index" json:"view_count"`
	LikeCount    int `gorm:"default:0" json:"like_count"`
	CollectCount int `gorm:"default:0" json:"collect_count"`
	StudyCount   int `gorm:"default:0" json:"study_count"` // 学习人数

	// 状态
	Status    CourseStatus `gorm:"type:tinyint;default:0;index" json:"status"`
	SortOrder int          `gorm:"default:0" json:"sort_order"`

	// 标签
	Tags JSONStringArray `gorm:"type:json" json:"tags,omitempty"`

	// 时间
	PublishedAt *time.Time     `gorm:"type:datetime" json:"published_at,omitempty"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Category *CourseCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Chapters []CourseChapter `gorm:"foreignKey:CourseID" json:"chapters,omitempty"`
}

func (Course) TableName() string {
	return "what_courses"
}

// CourseBriefResponse 课程简要信息（列表用）
type CourseBriefResponse struct {
	ID           uint              `json:"id"`
	CategoryID   uint              `json:"category_id"`
	Title        string            `json:"title"`
	Subtitle     string            `json:"subtitle,omitempty"`
	CoverImage   string            `json:"cover_image,omitempty"`
	ContentType  CourseContentType `json:"content_type"`
	Difficulty   CourseDifficulty  `json:"difficulty"`
	Duration     int               `json:"duration"`
	ChapterCount int               `json:"chapter_count"`
	TeacherName  string            `json:"teacher_name,omitempty"`
	IsFree       bool              `json:"is_free"`
	VIPOnly      bool              `json:"vip_only"`
	Price        float64           `json:"price"`
	ViewCount    int               `json:"view_count"`
	LikeCount    int               `json:"like_count"`
	StudyCount   int               `json:"study_count"`
	Tags         []string          `json:"tags,omitempty"`
	Status       CourseStatus      `json:"status"`
	PublishedAt  *time.Time        `json:"published_at,omitempty"`
	CategoryName string            `json:"category_name,omitempty"`
}

// ToBriefResponse 转换为简要响应
func (c *Course) ToBriefResponse() *CourseBriefResponse {
	resp := &CourseBriefResponse{
		ID:           c.ID,
		CategoryID:   c.CategoryID,
		Title:        c.Title,
		Subtitle:     c.Subtitle,
		CoverImage:   c.CoverImage,
		ContentType:  c.ContentType,
		Difficulty:   c.Difficulty,
		Duration:     c.Duration,
		ChapterCount: c.ChapterCount,
		TeacherName:  c.TeacherName,
		IsFree:       c.IsFree,
		VIPOnly:      c.VIPOnly,
		Price:        c.Price,
		ViewCount:    c.ViewCount,
		LikeCount:    c.LikeCount,
		StudyCount:   c.StudyCount,
		Tags:         c.Tags,
		Status:       c.Status,
		PublishedAt:  c.PublishedAt,
	}
	if c.Category != nil {
		resp.CategoryName = c.Category.Name
	}
	return resp
}

// CourseDetailResponse 课程详情响应
type CourseDetailResponse struct {
	CourseBriefResponse
	Description   string                   `json:"description,omitempty"`
	TeacherAvatar string                   `json:"teacher_avatar,omitempty"`
	TeacherIntro  string                   `json:"teacher_intro,omitempty"`
	CollectCount  int                      `json:"collect_count"`
	Category      *CourseCategoryResponse  `json:"category,omitempty"`
	Chapters      []*CourseChapterResponse `json:"chapters,omitempty"`
	IsCollected   bool                     `json:"is_collected"`
	IsLiked       bool                     `json:"is_liked"`
	StudyProgress float64                  `json:"study_progress"` // 学习进度 0-100
}

// ToDetailResponse 转换为详情响应
func (c *Course) ToDetailResponse() *CourseDetailResponse {
	resp := &CourseDetailResponse{
		CourseBriefResponse: *c.ToBriefResponse(),
		Description:         c.Description,
		TeacherAvatar:       c.TeacherAvatar,
		TeacherIntro:        c.TeacherIntro,
		CollectCount:        c.CollectCount,
	}
	if c.Category != nil {
		resp.Category = c.Category.ToResponse()
	}
	if len(c.Chapters) > 0 {
		resp.Chapters = make([]*CourseChapterResponse, len(c.Chapters))
		for i, chapter := range c.Chapters {
			resp.Chapters[i] = chapter.ToResponse()
		}
	}
	return resp
}

// =====================================================
// 课程章节
// =====================================================

// CourseChapter 课程章节
type CourseChapter struct {
	ID            uint              `gorm:"primaryKey" json:"id"`
	CourseID      uint              `gorm:"index;not null" json:"course_id"`
	ParentID      *uint             `gorm:"index" json:"parent_id,omitempty"` // 父章节ID（支持章-节结构）
	Title         string            `gorm:"type:varchar(200);not null" json:"title"`
	ContentType   CourseContentType `gorm:"type:varchar(20)" json:"content_type,omitempty"`
	ContentURL    string            `gorm:"type:varchar(500)" json:"content_url,omitempty"` // 视频/文档链接
	ContentText   string            `gorm:"type:mediumtext" json:"content_text,omitempty"`  // 文本内容（富文本）
	Duration      int               `gorm:"default:0" json:"duration"`                      // 时长（分钟）
	IsFreePreview bool              `gorm:"default:false" json:"is_free_preview"`           // 是否免费试看
	SortOrder     int               `gorm:"default:0" json:"sort_order"`
	Level         int               `gorm:"default:1" json:"level"` // 层级：1-章，2-节

	// 新增字段：支持 MCP 生成的结构化内容
	ContentJSON  JSONRawMessage `gorm:"type:json" json:"content_json,omitempty"`   // 结构化内容（MCP 生成的完整数据）
	ExamAnalysis string         `gorm:"type:text" json:"exam_analysis,omitempty"`  // 考情分析
	WordCount    int            `gorm:"default:0" json:"word_count"`               // 字数统计
	LessonOrder  int            `gorm:"default:0;index" json:"lesson_order"`       // 课程全局顺序

	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Course   *Course               `gorm:"foreignKey:CourseID" json:"-"`
	Parent   *CourseChapter        `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []CourseChapter       `gorm:"foreignKey:ParentID" json:"children,omitempty"`
	Modules  []CourseLessonModule  `gorm:"foreignKey:ChapterID" json:"modules,omitempty"` // 关联模块
}

func (CourseChapter) TableName() string {
	return "what_course_chapters"
}

// =====================================================
// 课程模块（存储 MCP 生成的 13 个必含模块）
// =====================================================

// LessonModuleType 课程模块类型
type LessonModuleType string

const (
	ModuleTypeExamAnalysis  LessonModuleType = "exam_analysis"  // 考情分析
	ModuleTypeIntroduction  LessonModuleType = "introduction"   // 课程导入
	ModuleTypeConcepts      LessonModuleType = "core_concepts"  // 核心概念
	ModuleTypeMethods       LessonModuleType = "method_steps"   // 方法步骤
	ModuleTypeFormulas      LessonModuleType = "formulas"       // 记忆口诀
	ModuleTypeExamples      LessonModuleType = "examples"       // 精讲例题
	ModuleTypeMistakes      LessonModuleType = "mistakes"       // 易错陷阱
	ModuleTypeDrills        LessonModuleType = "drills"         // 真题演练
	ModuleTypePractice      LessonModuleType = "practice"       // 练习题目
	ModuleTypeVocabulary    LessonModuleType = "vocabulary"     // 高频词汇
	ModuleTypeExtension     LessonModuleType = "extension"      // 拓展知识
	ModuleTypeSummary       LessonModuleType = "summary"        // 课程总结
	ModuleTypeHomework      LessonModuleType = "homework"       // 课后作业
	ModuleTypeMindMap       LessonModuleType = "mind_map"       // 思维导图 (Mermaid)
	ModuleTypeQuickNotes    LessonModuleType = "quick_notes"    // 快速笔记
)

// CourseLessonModule 课程模块表
type CourseLessonModule struct {
	ID          uint             `gorm:"primaryKey" json:"id"`
	ChapterID   uint             `gorm:"index;not null" json:"chapter_id"`    // 关联章节
	ModuleType  LessonModuleType `gorm:"type:varchar(30);index" json:"module_type"` // 模块类型
	Title       string           `gorm:"type:varchar(200)" json:"title"`      // 模块标题
	ContentJSON JSONRawMessage   `gorm:"type:json" json:"content_json"`       // 模块内容（JSON）
	ContentText string           `gorm:"type:mediumtext" json:"content_text,omitempty"` // 纯文本内容
	WordCount   int              `gorm:"default:0" json:"word_count"`         // 字数
	SortOrder   int              `gorm:"default:0" json:"sort_order"`         // 排序
	CreatedAt   time.Time        `json:"created_at"`
	UpdatedAt   time.Time        `json:"updated_at"`
	DeletedAt   gorm.DeletedAt   `gorm:"index" json:"-"`

	// 关联
	Chapter *CourseChapter `gorm:"foreignKey:ChapterID" json:"-"`
}

func (CourseLessonModule) TableName() string {
	return "what_course_lesson_modules"
}

// CourseLessonModuleResponse 课程模块响应
type CourseLessonModuleResponse struct {
	ID          uint             `json:"id"`
	ChapterID   uint             `json:"chapter_id"`
	ModuleType  LessonModuleType `json:"module_type"`
	Title       string           `json:"title"`
	ContentJSON json.RawMessage  `json:"content_json,omitempty"`
	ContentText string           `json:"content_text,omitempty"`
	WordCount   int              `json:"word_count"`
	SortOrder   int              `json:"sort_order"`
}

// ToResponse 转换为响应
func (m *CourseLessonModule) ToResponse() *CourseLessonModuleResponse {
	resp := &CourseLessonModuleResponse{
		ID:          m.ID,
		ChapterID:   m.ChapterID,
		ModuleType:  m.ModuleType,
		Title:       m.Title,
		ContentText: m.ContentText,
		WordCount:   m.WordCount,
		SortOrder:   m.SortOrder,
	}
	// Validate JSON before adding to response to prevent marshal errors
	if len(m.ContentJSON) > 0 && json.Valid([]byte(m.ContentJSON)) {
		resp.ContentJSON = json.RawMessage(m.ContentJSON)
	}
	return resp
}

// ModuleTypeNames 模块类型名称映射
var ModuleTypeNames = map[LessonModuleType]string{
	ModuleTypeExamAnalysis: "考情分析",
	ModuleTypeIntroduction: "课程导入",
	ModuleTypeConcepts:     "核心概念",
	ModuleTypeMethods:      "方法步骤",
	ModuleTypeFormulas:     "记忆口诀",
	ModuleTypeExamples:     "精讲例题",
	ModuleTypeMistakes:     "易错陷阱",
	ModuleTypeDrills:       "真题演练",
	ModuleTypePractice:     "练习题目",
	ModuleTypeVocabulary:   "高频词汇",
	ModuleTypeExtension:    "拓展知识",
	ModuleTypeSummary:      "课程总结",
	ModuleTypeHomework:     "课后作业",
	ModuleTypeMindMap:      "思维导图",
	ModuleTypeQuickNotes:   "快速笔记",
}

// ModuleTypeSortOrder 模块类型排序
var ModuleTypeSortOrder = map[LessonModuleType]int{
	ModuleTypeExamAnalysis: 1,
	ModuleTypeIntroduction: 2,
	ModuleTypeConcepts:     3,
	ModuleTypeMethods:      4,
	ModuleTypeFormulas:     5,
	ModuleTypeExamples:     6,
	ModuleTypeMistakes:     7,
	ModuleTypeDrills:       8,
	ModuleTypePractice:     9,
	ModuleTypeVocabulary:   10,
	ModuleTypeExtension:    11,
	ModuleTypeSummary:      12,
	ModuleTypeHomework:     13,
	ModuleTypeMindMap:      14,
	ModuleTypeQuickNotes:   15,
}

// CourseChapterResponse 章节响应
type CourseChapterResponse struct {
	ID            uint                     `json:"id"`
	CourseID      uint                     `json:"course_id"`
	ParentID      *uint                    `json:"parent_id,omitempty"`
	Title         string                   `json:"title"`
	ContentType   CourseContentType        `json:"content_type,omitempty"`
	Duration      int                      `json:"duration"`
	IsFreePreview bool                     `json:"is_free_preview"`
	SortOrder     int                      `json:"sort_order"`
	Level         int                      `json:"level"`
	WordCount     int                      `json:"word_count"`
	LessonOrder   int                      `json:"lesson_order"`
	Children      []*CourseChapterResponse `json:"children,omitempty"`
	IsCompleted   bool                     `json:"is_completed"` // 用户是否已学完
}

// ToResponse 转换为响应
func (c *CourseChapter) ToResponse() *CourseChapterResponse {
	resp := &CourseChapterResponse{
		ID:            c.ID,
		CourseID:      c.CourseID,
		ParentID:      c.ParentID,
		Title:         c.Title,
		ContentType:   c.ContentType,
		Duration:      c.Duration,
		IsFreePreview: c.IsFreePreview,
		SortOrder:     c.SortOrder,
		Level:         c.Level,
		WordCount:     c.WordCount,
		LessonOrder:   c.LessonOrder,
	}
	if len(c.Children) > 0 {
		resp.Children = make([]*CourseChapterResponse, len(c.Children))
		for i, child := range c.Children {
			resp.Children[i] = child.ToResponse()
		}
	}
	return resp
}

// CourseChapterContentResponse 章节内容详情响应（含完整内容）
type CourseChapterContentResponse struct {
	Chapter      *CourseChapterResponse        `json:"chapter"`
	Content      json.RawMessage               `json:"content,omitempty"`       // 结构化内容
	ExamAnalysis string                        `json:"exam_analysis,omitempty"` // 考情分析
	Modules      []*CourseLessonModuleResponse `json:"modules,omitempty"`       // 模块列表
	WordCount    *ChapterWordCount             `json:"word_count,omitempty"`    // 字数统计
}

// ChapterWordCount 章节字数统计
type ChapterWordCount struct {
	Total    int            `json:"total"`
	ByModule map[string]int `json:"by_module,omitempty"`
}

// =====================================================
// 知识点
// =====================================================

// KnowledgeFrequency 知识点考试频率
type KnowledgeFrequency string

const (
	KnowledgeFrequencyHigh   KnowledgeFrequency = "high"   // 高频
	KnowledgeFrequencyMedium KnowledgeFrequency = "medium" // 中频
	KnowledgeFrequencyLow    KnowledgeFrequency = "low"    // 低频
)

// KnowledgePoint 知识点
type KnowledgePoint struct {
	ID             uint               `gorm:"primaryKey" json:"id"`
	CategoryID     uint               `gorm:"index;not null" json:"category_id"`
	ParentID       *uint              `gorm:"index" json:"parent_id,omitempty"` // 父知识点
	Name           string             `gorm:"type:varchar(100);not null" json:"name"`
	Code           string             `gorm:"type:varchar(50);uniqueIndex" json:"code,omitempty"` // 知识点编码
	Description    string             `gorm:"type:text" json:"description,omitempty"`
	Importance     int                `gorm:"default:3" json:"importance"` // 重要程度 1-5星
	Frequency      KnowledgeFrequency `gorm:"type:varchar(20);default:'medium'" json:"frequency"`
	Tips           string             `gorm:"type:text" json:"tips,omitempty"`            // 学习技巧
	RelatedCourses JSONIntArray       `gorm:"type:json" json:"related_courses,omitempty"` // 关联课程ID
	SortOrder      int                `gorm:"default:0" json:"sort_order"`
	Level          int                `gorm:"default:1" json:"level"`                  // 层级深度
	Path           string             `gorm:"type:varchar(200)" json:"path,omitempty"` // 完整路径
	QuestionCount  int                `gorm:"default:0" json:"question_count"`         // 相关题目数
	CreatedAt      time.Time          `json:"created_at"`
	UpdatedAt      time.Time          `json:"updated_at"`
	DeletedAt      gorm.DeletedAt     `gorm:"index" json:"-"`

	// 关联
	Category *CourseCategory  `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Parent   *KnowledgePoint  `gorm:"foreignKey:ParentID" json:"parent,omitempty"`
	Children []KnowledgePoint `gorm:"foreignKey:ParentID" json:"children,omitempty"`
}

func (KnowledgePoint) TableName() string {
	return "what_knowledge_points"
}

// KnowledgePointResponse 知识点响应
type KnowledgePointResponse struct {
	ID             uint                      `json:"id"`
	CategoryID     uint                      `json:"category_id"`
	ParentID       *uint                     `json:"parent_id,omitempty"`
	Name           string                    `json:"name"`
	Code           string                    `json:"code,omitempty"`
	Description    string                    `json:"description,omitempty"`
	Importance     int                       `json:"importance"`
	Frequency      KnowledgeFrequency        `json:"frequency"`
	Tips           string                    `json:"tips,omitempty"`
	RelatedCourses []int                     `json:"related_courses,omitempty"`
	Level          int                       `json:"level"`
	QuestionCount  int                       `json:"question_count"`
	Children       []*KnowledgePointResponse `json:"children,omitempty"`
	MasteryLevel   float64                   `json:"mastery_level"` // 用户掌握程度 0-100
}

// ToResponse 转换为响应
func (k *KnowledgePoint) ToResponse() *KnowledgePointResponse {
	resp := &KnowledgePointResponse{
		ID:             k.ID,
		CategoryID:     k.CategoryID,
		ParentID:       k.ParentID,
		Name:           k.Name,
		Code:           k.Code,
		Description:    k.Description,
		Importance:     k.Importance,
		Frequency:      k.Frequency,
		Tips:           k.Tips,
		RelatedCourses: k.RelatedCourses,
		Level:          k.Level,
		QuestionCount:  k.QuestionCount,
	}
	if len(k.Children) > 0 {
		resp.Children = make([]*KnowledgePointResponse, len(k.Children))
		for i, child := range k.Children {
			resp.Children[i] = child.ToResponse()
		}
	}
	return resp
}

// =====================================================
// 用户学习记录
// =====================================================

// UserCourseProgress 用户课程学习进度
type UserCourseProgress struct {
	ID                uint       `gorm:"primaryKey" json:"id"`
	UserID            uint       `gorm:"uniqueIndex:uk_user_course;not null" json:"user_id"`
	CourseID          uint       `gorm:"uniqueIndex:uk_user_course;not null" json:"course_id"`
	Progress          float64    `gorm:"type:decimal(5,2);default:0" json:"progress"` // 学习进度 0-100
	LastChapterID     *uint      `gorm:"index" json:"last_chapter_id,omitempty"`      // 上次学习的章节
	LastStudyAt       *time.Time `gorm:"type:datetime" json:"last_study_at,omitempty"`
	TotalStudyMinutes int        `gorm:"default:0" json:"total_study_minutes"` // 总学习时长
	IsCompleted       bool       `gorm:"default:false;index" json:"is_completed"`
	CompletedAt       *time.Time `gorm:"type:datetime" json:"completed_at,omitempty"`
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`

	// 关联
	User   *User   `gorm:"foreignKey:UserID" json:"-"`
	Course *Course `gorm:"foreignKey:CourseID" json:"course,omitempty"`
}

func (UserCourseProgress) TableName() string {
	return "what_user_course_progress"
}

// UserChapterProgress 用户章节学习记录
type UserChapterProgress struct {
	ID           uint       `gorm:"primaryKey" json:"id"`
	UserID       uint       `gorm:"uniqueIndex:uk_user_chapter;not null" json:"user_id"`
	ChapterID    uint       `gorm:"uniqueIndex:uk_user_chapter;not null" json:"chapter_id"`
	CourseID     uint       `gorm:"index;not null" json:"course_id"`
	Progress     float64    `gorm:"type:decimal(5,2);default:0" json:"progress"` // 章节学习进度
	IsCompleted  bool       `gorm:"default:false;index" json:"is_completed"`
	StudyMinutes int        `gorm:"default:0" json:"study_minutes"`
	LastPosition int        `gorm:"default:0" json:"last_position"` // 视频播放位置（秒）
	CompletedAt  *time.Time `gorm:"type:datetime" json:"completed_at,omitempty"`
	CreatedAt    time.Time  `json:"created_at"`
	UpdatedAt    time.Time  `json:"updated_at"`

	// 关联
	User    *User          `gorm:"foreignKey:UserID" json:"-"`
	Chapter *CourseChapter `gorm:"foreignKey:ChapterID" json:"chapter,omitempty"`
}

func (UserChapterProgress) TableName() string {
	return "what_user_chapter_progress"
}

// =====================================================
// 课程收藏
// =====================================================

// UserCourseCollect 用户课程收藏
type UserCourseCollect struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `gorm:"uniqueIndex:uk_user_course_collect;not null" json:"user_id"`
	CourseID  uint      `gorm:"uniqueIndex:uk_user_course_collect;not null" json:"course_id"`
	CreatedAt time.Time `json:"created_at"`

	// 关联
	User   *User   `gorm:"foreignKey:UserID" json:"-"`
	Course *Course `gorm:"foreignKey:CourseID" json:"course,omitempty"`
}

func (UserCourseCollect) TableName() string {
	return "what_user_course_collects"
}

// =====================================================
// JSON 类型辅助
// =====================================================

// JSONIntArray JSON整数数组类型
type JSONIntArray []int

// Value 实现 driver.Valuer 接口
func (j JSONIntArray) Value() (driver.Value, error) {
	if j == nil {
		return "[]", nil
	}
	return json.Marshal(j)
}

// Scan 实现 sql.Scanner 接口
func (j *JSONIntArray) Scan(value interface{}) error {
	if value == nil {
		*j = []int{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for JSONIntArray")
	}

	return json.Unmarshal(bytes, j)
}

// JSONRawMessage JSON原始消息类型（用于存储任意JSON结构）
type JSONRawMessage json.RawMessage

// Value 实现 driver.Valuer 接口
func (j JSONRawMessage) Value() (driver.Value, error) {
	if len(j) == 0 {
		return "{}", nil
	}
	return []byte(j), nil
}

// Scan 实现 sql.Scanner 接口
func (j *JSONRawMessage) Scan(value interface{}) error {
	if value == nil {
		*j = JSONRawMessage("{}")
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for JSONRawMessage")
	}

	*j = JSONRawMessage(bytes)
	return nil
}

// MarshalJSON 实现 json.Marshaler 接口
func (j JSONRawMessage) MarshalJSON() ([]byte, error) {
	if len(j) == 0 {
		return []byte("{}"), nil
	}
	return []byte(j), nil
}

// UnmarshalJSON 实现 json.Unmarshaler 接口
func (j *JSONRawMessage) UnmarshalJSON(data []byte) error {
	if j == nil {
		return errors.New("JSONRawMessage: UnmarshalJSON on nil pointer")
	}
	*j = append((*j)[0:0], data...)
	return nil
}
