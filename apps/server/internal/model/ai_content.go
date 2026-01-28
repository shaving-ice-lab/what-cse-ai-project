package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// =====================================================
// AI 生成内容 - AI Generated Content
// =====================================================

// AIContentType AI内容类型
type AIContentType string

const (
	// 题目相关
	AIContentTypeQuestionAnalysis  AIContentType = "question_analysis"  // 题目深度解析
	AIContentTypeQuestionTips      AIContentType = "question_tips"      // 解题技巧
	AIContentTypeQuestionSimilar   AIContentType = "question_similar"   // 相似题目
	AIContentTypeQuestionExtension AIContentType = "question_extension" // 知识点延伸

	// 知识点相关
	AIContentTypeKnowledgeSummary   AIContentType = "knowledge_summary"   // 知识点总结
	AIContentTypeKnowledgeMindmap   AIContentType = "knowledge_mindmap"   // 知识点导图数据
	AIContentTypeKnowledgeKeypoints AIContentType = "knowledge_keypoints" // 核心要点提炼
	AIContentTypeKnowledgeExamples  AIContentType = "knowledge_examples"  // 经典例题解析

	// 章节相关
	AIContentTypeChapterSummary   AIContentType = "chapter_summary"   // 章节总结
	AIContentTypeChapterKeypoints AIContentType = "chapter_keypoints" // 章节重点
	AIContentTypeChapterExercises AIContentType = "chapter_exercises" // 章节配套练习
	AIContentTypeChapterLesson    AIContentType = "chapter_lesson"    // 章节教学内容（完整图文教程）

	// 课程相关
	AIContentTypeCourseOutline AIContentType = "course_outline" // 课程大纲
	AIContentTypeCoursePreview AIContentType = "course_preview" // 课程预习要点
	AIContentTypeCourseReview  AIContentType = "course_review"  // 课程复习要点

	// 学习路径相关
	AIContentTypeLearningPath       AIContentType = "learning_path"       // 学习路径建议
	AIContentTypeWeakPointAnalysis  AIContentType = "weak_point_analysis" // 薄弱点分析
	AIContentTypeErrorAnalysis      AIContentType = "error_analysis"      // 错题错因分析
	AIContentTypeProgressEvaluation AIContentType = "progress_evaluation" // 学习进度评估
	AIContentTypeAbilityReport      AIContentType = "ability_report"      // 能力分析报告
)

// AIRelatedType AI内容关联类型
type AIRelatedType string

const (
	AIRelatedTypeQuestion       AIRelatedType = "question"        // 题目
	AIRelatedTypeCourse         AIRelatedType = "course"          // 课程
	AIRelatedTypeChapter        AIRelatedType = "chapter"         // 章节
	AIRelatedTypeKnowledgePoint AIRelatedType = "knowledge_point" // 知识点
	AIRelatedTypeUser           AIRelatedType = "user"            // 用户（用于个性化内容）
)

// AIContentStatus AI内容状态
type AIContentStatus string

const (
	AIContentStatusPending  AIContentStatus = "pending"  // 待审核
	AIContentStatusApproved AIContentStatus = "approved" // 已审核通过
	AIContentStatusRejected AIContentStatus = "rejected" // 已拒绝
	AIContentStatusExpired  AIContentStatus = "expired"  // 已过期
)

// AIGeneratedContent AI生成内容
type AIGeneratedContent struct {
	ID           uint            `gorm:"primaryKey" json:"id"`
	ContentType  AIContentType   `gorm:"type:varchar(50);index;not null" json:"content_type"`    // 内容类型
	RelatedType  AIRelatedType   `gorm:"type:varchar(30);index;not null" json:"related_type"`    // 关联类型
	RelatedID    uint            `gorm:"index;not null" json:"related_id"`                       // 关联ID
	Title        string          `gorm:"type:varchar(500)" json:"title,omitempty"`               // 内容标题
	Content      JSONAIContent   `gorm:"type:json;not null" json:"content"`                      // AI生成的内容
	Metadata     JSONAIMetadata  `gorm:"type:json" json:"metadata,omitempty"`                    // 元数据
	QualityScore float64         `gorm:"type:decimal(3,2);default:0" json:"quality_score"`       // 质量评分 0-5
	Status       AIContentStatus `gorm:"type:varchar(20);default:'pending';index" json:"status"` // 状态
	Version      int             `gorm:"default:1" json:"version"`                               // 版本号
	GeneratedAt  time.Time       `gorm:"not null" json:"generated_at"`                           // 生成时间
	ApprovedAt   *time.Time      `json:"approved_at,omitempty"`                                  // 审核通过时间
	ApprovedBy   *uint           `json:"approved_by,omitempty"`                                  // 审核人ID
	CreatedAt    time.Time       `json:"created_at"`
	UpdatedAt    time.Time       `json:"updated_at"`
	DeletedAt    gorm.DeletedAt  `gorm:"index" json:"-"`

	// 复合索引用于快速查询
}

func (AIGeneratedContent) TableName() string {
	return "what_ai_generated_contents"
}

// JSONAIContent AI生成内容的JSON结构
type JSONAIContent struct {
	// 通用字段
	Summary    string   `json:"summary,omitempty"`     // 摘要
	MainPoints []string `json:"main_points,omitempty"` // 主要观点
	Details    string   `json:"details,omitempty"`     // 详细内容（富文本）

	// 题目解析相关
	Analysis          string            `json:"analysis,omitempty"`            // 题目解析
	KeyPoints         []string          `json:"key_points,omitempty"`          // 考点
	SolutionSteps     []string          `json:"solution_steps,omitempty"`      // 解题步骤
	OptionAnalysis    map[string]string `json:"option_analysis,omitempty"`     // 选项分析 A/B/C/D -> 分析
	CommonMistakes    []string          `json:"common_mistakes,omitempty"`     // 常见错误
	Tips              []string          `json:"tips,omitempty"`                // 解题技巧
	RelatedKnowledge  []uint            `json:"related_knowledge,omitempty"`   // 相关知识点ID
	SimilarQuestions  []uint            `json:"similar_questions,omitempty"`   // 相似题目ID
	QuickSolutionTips []string          `json:"quick_solution_tips,omitempty"` // 秒杀技巧

	// 知识点相关
	Definition    string            `json:"definition,omitempty"`     // 概念定义
	Mnemonics     string            `json:"mnemonics,omitempty"`      // 记忆口诀
	CommonTypes   []string          `json:"common_types,omitempty"`   // 常见题型
	MindmapData   *MindmapData      `json:"mindmap_data,omitempty"`   // 思维导图数据
	Examples      []ExampleQuestion `json:"examples,omitempty"`       // 例题
	KeyFormulas   []string          `json:"key_formulas,omitempty"`   // 关键公式
	MemoryMethods []string          `json:"memory_methods,omitempty"` // 记忆方法

	// 章节/课程相关
	Outline       []OutlineItem `json:"outline,omitempty"`        // 大纲
	PreviewPoints []string      `json:"preview_points,omitempty"` // 预习要点
	ReviewPoints  []string      `json:"review_points,omitempty"`  // 复习要点
	Exercises     []uint        `json:"exercises,omitempty"`      // 配套练习题目ID

	// 章节教学内容相关（完整图文教程）
	LessonContent    *LessonContent    `json:"lesson_content,omitempty"`    // 教学内容
	LessonSections   []LessonSection   `json:"lesson_sections,omitempty"`   // 教学分节
	PracticeProblems []PracticeProblem `json:"practice_problems,omitempty"` // 随堂练习

	// 学习路径相关
	LearningSteps   []LearningStep `json:"learning_steps,omitempty"`   // 学习步骤
	WeakPoints      []WeakPoint    `json:"weak_points,omitempty"`      // 薄弱点
	ErrorReasons    []string       `json:"error_reasons,omitempty"`    // 错误原因
	Recommendations []string       `json:"recommendations,omitempty"`  // 学习建议
	AbilityScores   map[string]int `json:"ability_scores,omitempty"`   // 能力评分
	ProgressPercent float64        `json:"progress_percent,omitempty"` // 进度百分比
	EstimatedTime   int            `json:"estimated_time,omitempty"`   // 预计学习时间（分钟）
}

// MindmapData 思维导图数据
type MindmapData struct {
	Root     MindmapNode   `json:"root"`               // 根节点
	Children []MindmapNode `json:"children,omitempty"` // 子节点
}

// MindmapNode 思维导图节点
type MindmapNode struct {
	ID       string        `json:"id"`                 // 节点ID
	Label    string        `json:"label"`              // 节点标签
	Color    string        `json:"color,omitempty"`    // 节点颜色
	Children []MindmapNode `json:"children,omitempty"` // 子节点
}

// ExampleQuestion 例题
type ExampleQuestion struct {
	QuestionID uint     `json:"question_id,omitempty"` // 关联题目ID（如果有）
	Question   string   `json:"question"`              // 题目内容
	Options    []string `json:"options,omitempty"`     // 选项
	Answer     string   `json:"answer"`                // 答案
	Analysis   string   `json:"analysis"`              // 解析
}

// OutlineItem 大纲项
type OutlineItem struct {
	Title    string        `json:"title"`              // 标题
	Duration int           `json:"duration,omitempty"` // 时长（分钟）
	Children []OutlineItem `json:"children,omitempty"` // 子项
}

// LearningStep 学习步骤
type LearningStep struct {
	Step        int    `json:"step"`                  // 步骤序号
	Title       string `json:"title"`                 // 标题
	Description string `json:"description"`           // 描述
	Duration    int    `json:"duration,omitempty"`    // 预计时长（分钟）
	ResourceID  uint   `json:"resource_id,omitempty"` // 资源ID（课程/知识点等）
}

// WeakPoint 薄弱点
type WeakPoint struct {
	KnowledgeID   uint    `json:"knowledge_id"`             // 知识点ID
	KnowledgeName string  `json:"knowledge_name"`           // 知识点名称
	MasteryLevel  float64 `json:"mastery_level"`            // 掌握程度 0-100
	Suggestion    string  `json:"suggestion,omitempty"`     // 改进建议
	RelatedCourse uint    `json:"related_course,omitempty"` // 推荐课程ID
}

// LessonContent 教学内容结构
type LessonContent struct {
	Introduction     string   `json:"introduction"`                // 课程导入
	LearningGoals    []string `json:"learning_goals"`              // 学习目标
	Prerequisites    []string `json:"prerequisites,omitempty"`     // 前置知识
	CoreConcepts     []string `json:"core_concepts"`               // 核心概念
	MainContent      string   `json:"main_content"`                // 主要内容（富文本/Markdown）
	Formulas         []string `json:"formulas,omitempty"`          // 重要公式
	MemoryTips       []string `json:"memory_tips,omitempty"`       // 记忆技巧
	CommonMistakes   []string `json:"common_mistakes,omitempty"`   // 常见错误
	SummaryPoints    []string `json:"summary_points"`              // 总结要点
	ExtendedReading  string   `json:"extended_reading,omitempty"`  // 延伸阅读
	EstimatedMinutes int      `json:"estimated_minutes,omitempty"` // 预计学习时间（分钟）
}

// LessonSection 教学分节
type LessonSection struct {
	Order       int              `json:"order"`                    // 序号
	Title       string           `json:"title"`                    // 标题
	Content     string           `json:"content"`                  // 内容（富文本/Markdown）
	SectionType LessonSectionType `json:"section_type"`            // 分节类型
	Duration    int              `json:"duration,omitempty"`       // 时长（分钟）
	KeyPoints   []string         `json:"key_points,omitempty"`     // 本节重点
	Examples    []LessonExample  `json:"examples,omitempty"`       // 示例/例题
}

// LessonSectionType 教学分节类型
type LessonSectionType string

const (
	LessonSectionTypeIntro      LessonSectionType = "intro"      // 导入
	LessonSectionTypeConcept    LessonSectionType = "concept"    // 概念讲解
	LessonSectionTypeMethod     LessonSectionType = "method"     // 方法技巧
	LessonSectionTypeExample    LessonSectionType = "example"    // 例题演示
	LessonSectionTypePractice   LessonSectionType = "practice"   // 随堂练习
	LessonSectionTypeSummary    LessonSectionType = "summary"    // 总结归纳
	LessonSectionTypeExtension  LessonSectionType = "extension"  // 拓展提高
)

// LessonExample 教学示例
type LessonExample struct {
	Title       string   `json:"title"`                 // 示例标题
	Problem     string   `json:"problem"`               // 问题/题目
	Analysis    string   `json:"analysis"`              // 分析思路
	Solution    string   `json:"solution"`              // 解答过程
	Answer      string   `json:"answer,omitempty"`      // 答案
	KeyInsight  string   `json:"key_insight,omitempty"` // 关键洞察
	Variations  []string `json:"variations,omitempty"`  // 变形考法
}

// PracticeProblem 随堂练习题
type PracticeProblem struct {
	Order      int      `json:"order"`                // 序号
	Problem    string   `json:"problem"`              // 题目
	Options    []string `json:"options,omitempty"`    // 选项（选择题）
	Answer     string   `json:"answer"`               // 答案
	Analysis   string   `json:"analysis"`             // 解析
	Difficulty int      `json:"difficulty,omitempty"` // 难度 1-5
	Type       string   `json:"type,omitempty"`       // 题型
}

// Value 实现 driver.Valuer 接口
func (j JSONAIContent) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// Scan 实现 sql.Scanner 接口
func (j *JSONAIContent) Scan(value interface{}) error {
	if value == nil {
		*j = JSONAIContent{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for JSONAIContent")
	}

	return json.Unmarshal(bytes, j)
}

// JSONAIMetadata AI生成内容的元数据
type JSONAIMetadata struct {
	ModelName    string            `json:"model_name,omitempty"`    // 使用的AI模型
	ModelVersion string            `json:"model_version,omitempty"` // 模型版本
	Prompt       string            `json:"prompt,omitempty"`        // 生成时使用的提示词
	Temperature  float64           `json:"temperature,omitempty"`   // 温度参数
	TokensUsed   int               `json:"tokens_used,omitempty"`   // 使用的token数
	GenerateTime int               `json:"generate_time,omitempty"` // 生成耗时（毫秒）
	Source       string            `json:"source,omitempty"`        // 来源（api/batch/manual）
	Tags         []string          `json:"tags,omitempty"`          // 标签
	Extra        map[string]string `json:"extra,omitempty"`         // 额外信息
}

// Value 实现 driver.Valuer 接口
func (j JSONAIMetadata) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// Scan 实现 sql.Scanner 接口
func (j *JSONAIMetadata) Scan(value interface{}) error {
	if value == nil {
		*j = JSONAIMetadata{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for JSONAIMetadata")
	}

	return json.Unmarshal(bytes, j)
}

// =====================================================
// AI 批量生成任务 - AI Batch Generation Task
// =====================================================

// AIBatchTaskStatus 批量任务状态
type AIBatchTaskStatus string

const (
	AIBatchTaskStatusPending    AIBatchTaskStatus = "pending"    // 等待处理
	AIBatchTaskStatusProcessing AIBatchTaskStatus = "processing" // 处理中
	AIBatchTaskStatusCompleted  AIBatchTaskStatus = "completed"  // 已完成
	AIBatchTaskStatusFailed     AIBatchTaskStatus = "failed"     // 失败
	AIBatchTaskStatusCancelled  AIBatchTaskStatus = "cancelled"  // 已取消
)

// AIBatchTask AI批量生成任务
type AIBatchTask struct {
	ID             uint              `gorm:"primaryKey" json:"id"`
	TaskName       string            `gorm:"type:varchar(200);not null" json:"task_name"`            // 任务名称
	ContentType    AIContentType     `gorm:"type:varchar(50);not null;index" json:"content_type"`    // 生成内容类型
	RelatedType    AIRelatedType     `gorm:"type:varchar(30);not null" json:"related_type"`          // 关联类型
	TargetIDs      JSONUintArray     `gorm:"type:json;not null" json:"target_ids"`                   // 目标ID列表
	TotalCount     int               `gorm:"not null" json:"total_count"`                            // 总数量
	ProcessedCount int               `gorm:"default:0" json:"processed_count"`                       // 已处理数量
	SuccessCount   int               `gorm:"default:0" json:"success_count"`                         // 成功数量
	FailedCount    int               `gorm:"default:0" json:"failed_count"`                          // 失败数量
	Status         AIBatchTaskStatus `gorm:"type:varchar(20);default:'pending';index" json:"status"` // 状态
	Priority       int               `gorm:"default:0;index" json:"priority"`                        // 优先级（越大越优先）
	Config         JSONBatchConfig   `gorm:"type:json" json:"config,omitempty"`                      // 任务配置
	ErrorLog       string            `gorm:"type:text" json:"error_log,omitempty"`                   // 错误日志
	StartedAt      *time.Time        `json:"started_at,omitempty"`                                   // 开始时间
	CompletedAt    *time.Time        `json:"completed_at,omitempty"`                                 // 完成时间
	CreatedBy      uint              `gorm:"index" json:"created_by"`                                // 创建人ID
	CreatedAt      time.Time         `json:"created_at"`
	UpdatedAt      time.Time         `json:"updated_at"`
	DeletedAt      gorm.DeletedAt    `gorm:"index" json:"-"`

	// 关联
	Creator *Admin `gorm:"foreignKey:CreatedBy" json:"creator,omitempty"`
}

func (AIBatchTask) TableName() string {
	return "what_ai_batch_tasks"
}

// JSONUintArray uint数组JSON类型
type JSONUintArray []uint

// Value 实现 driver.Valuer 接口
func (j JSONUintArray) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// Scan 实现 sql.Scanner 接口
func (j *JSONUintArray) Scan(value interface{}) error {
	if value == nil {
		*j = JSONUintArray{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for JSONUintArray")
	}

	return json.Unmarshal(bytes, j)
}

// JSONBatchConfig 批量任务配置
type JSONBatchConfig struct {
	Concurrency  int               `json:"concurrency,omitempty"`   // 并发数
	RetryCount   int               `json:"retry_count,omitempty"`   // 重试次数
	SkipExisting bool              `json:"skip_existing,omitempty"` // 是否跳过已存在的
	AutoApprove  bool              `json:"auto_approve,omitempty"`  // 是否自动审核通过
	ModelName    string            `json:"model_name,omitempty"`    // 使用的AI模型
	Temperature  float64           `json:"temperature,omitempty"`   // 温度参数
	Extra        map[string]string `json:"extra,omitempty"`         // 额外配置参数
}

// Value 实现 driver.Valuer 接口
func (j JSONBatchConfig) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// Scan 实现 sql.Scanner 接口
func (j *JSONBatchConfig) Scan(value interface{}) error {
	if value == nil {
		*j = JSONBatchConfig{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for JSONBatchConfig")
	}

	return json.Unmarshal(bytes, j)
}

// =====================================================
// Response 结构体
// =====================================================

// AIGeneratedContentResponse AI生成内容响应
type AIGeneratedContentResponse struct {
	ID           uint            `json:"id"`
	ContentType  AIContentType   `json:"content_type"`
	RelatedType  AIRelatedType   `json:"related_type"`
	RelatedID    uint            `json:"related_id"`
	Title        string          `json:"title,omitempty"`
	Content      JSONAIContent   `json:"content"`
	QualityScore float64         `json:"quality_score"`
	Status       AIContentStatus `json:"status"`
	Version      int             `json:"version"`
	GeneratedAt  time.Time       `json:"generated_at"`
}

// ToResponse 转换为响应结构
func (c *AIGeneratedContent) ToResponse() AIGeneratedContentResponse {
	return AIGeneratedContentResponse{
		ID:           c.ID,
		ContentType:  c.ContentType,
		RelatedType:  c.RelatedType,
		RelatedID:    c.RelatedID,
		Title:        c.Title,
		Content:      c.Content,
		QualityScore: c.QualityScore,
		Status:       c.Status,
		Version:      c.Version,
		GeneratedAt:  c.GeneratedAt,
	}
}

// AIBatchTaskResponse 批量任务响应
type AIBatchTaskResponse struct {
	ID             uint              `json:"id"`
	TaskName       string            `json:"task_name"`
	ContentType    AIContentType     `json:"content_type"`
	RelatedType    AIRelatedType     `json:"related_type"`
	TotalCount     int               `json:"total_count"`
	ProcessedCount int               `json:"processed_count"`
	SuccessCount   int               `json:"success_count"`
	FailedCount    int               `json:"failed_count"`
	Status         AIBatchTaskStatus `json:"status"`
	Progress       float64           `json:"progress"` // 进度百分比
	StartedAt      *time.Time        `json:"started_at,omitempty"`
	CompletedAt    *time.Time        `json:"completed_at,omitempty"`
	CreatedAt      time.Time         `json:"created_at"`
}

// ToResponse 转换为响应结构
func (t *AIBatchTask) ToResponse() AIBatchTaskResponse {
	var progress float64
	if t.TotalCount > 0 {
		progress = float64(t.ProcessedCount) / float64(t.TotalCount) * 100
	}

	return AIBatchTaskResponse{
		ID:             t.ID,
		TaskName:       t.TaskName,
		ContentType:    t.ContentType,
		RelatedType:    t.RelatedType,
		TotalCount:     t.TotalCount,
		ProcessedCount: t.ProcessedCount,
		SuccessCount:   t.SuccessCount,
		FailedCount:    t.FailedCount,
		Status:         t.Status,
		Progress:       progress,
		StartedAt:      t.StartedAt,
		CompletedAt:    t.CompletedAt,
		CreatedAt:      t.CreatedAt,
	}
}
