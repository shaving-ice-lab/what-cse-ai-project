package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// =====================================================
// 学习计划 - Study Plan
// =====================================================

// StudyPlanStatus 学习计划状态
type StudyPlanStatus string

const (
	StudyPlanStatusActive    StudyPlanStatus = "active"    // 进行中
	StudyPlanStatusCompleted StudyPlanStatus = "completed" // 已完成
	StudyPlanStatusAbandoned StudyPlanStatus = "abandoned" // 已放弃
	StudyPlanStatusPaused    StudyPlanStatus = "paused"    // 已暂停
)

// StudyPlan 学习计划
type StudyPlan struct {
	ID             uint            `gorm:"primaryKey" json:"id"`
	UserID         uint            `gorm:"index;not null" json:"user_id"`
	Title          string          `gorm:"type:varchar(200);not null" json:"title"`
	Description    string          `gorm:"type:text" json:"description,omitempty"`
	ExamType       string          `gorm:"type:varchar(50);index" json:"exam_type,omitempty"`     // 目标考试类型
	TargetExamDate *time.Time      `gorm:"type:date" json:"target_exam_date,omitempty"`           // 目标考试日期
	StartDate      time.Time       `gorm:"type:date;not null" json:"start_date"`                  // 计划开始日期
	EndDate        time.Time       `gorm:"type:date;not null" json:"end_date"`                    // 计划结束日期
	DailyStudyTime int             `gorm:"default:120" json:"daily_study_time"`                   // 每日学习时长目标（分钟）
	DailyQuestions int             `gorm:"default:50" json:"daily_questions"`                     // 每日做题数目标
	PlanDetails    JSONPlanDetails `gorm:"type:json" json:"plan_details,omitempty"`               // 计划详情（各阶段安排）
	Status         StudyPlanStatus `gorm:"type:varchar(20);default:'active';index" json:"status"` // 状态
	Progress       float64         `gorm:"type:decimal(5,2);default:0" json:"progress"`           // 完成进度 0-100
	TotalDays      int             `gorm:"default:0" json:"total_days"`                           // 总计划天数
	CompletedDays  int             `gorm:"default:0" json:"completed_days"`                       // 已完成天数
	CurrentPhase   int             `gorm:"default:1" json:"current_phase"`                        // 当前阶段
	TemplateID     *uint           `gorm:"index" json:"template_id,omitempty"`                    // 模板ID（如果是从模板创建）
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
	DeletedAt      gorm.DeletedAt  `gorm:"index" json:"-"`

	// 关联
	User       *User            `gorm:"foreignKey:UserID" json:"-"`
	DailyTasks []StudyDailyTask `gorm:"foreignKey:PlanID" json:"daily_tasks,omitempty"`
}

func (StudyPlan) TableName() string {
	return "what_study_plans"
}

// JSONPlanDetails 计划详情JSON类型
type JSONPlanDetails struct {
	Phases []StudyPhase `json:"phases,omitempty"` // 学习阶段
}

// StudyPhase 学习阶段
type StudyPhase struct {
	Name        string   `json:"name"`        // 阶段名称（基础、强化、冲刺）
	StartDay    int      `json:"start_day"`   // 开始天数
	EndDay      int      `json:"end_day"`     // 结束天数
	Focus       []string `json:"focus"`       // 重点内容
	DailyTime   int      `json:"daily_time"`  // 每日学习时长
	DailyTasks  int      `json:"daily_tasks"` // 每日任务数
	Description string   `json:"description"` // 阶段描述
}

// Value 实现 driver.Valuer 接口
func (j JSONPlanDetails) Value() (driver.Value, error) {
	return json.Marshal(j)
}

// Scan 实现 sql.Scanner 接口
func (j *JSONPlanDetails) Scan(value interface{}) error {
	if value == nil {
		*j = JSONPlanDetails{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for JSONPlanDetails")
	}

	return json.Unmarshal(bytes, j)
}

// StudyDailyTask 每日任务
type StudyDailyTask struct {
	ID            uint           `gorm:"primaryKey" json:"id"`
	PlanID        uint           `gorm:"index;not null" json:"plan_id"`
	UserID        uint           `gorm:"index;not null" json:"user_id"`
	TaskDate      time.Time      `gorm:"type:date;index;not null" json:"task_date"`
	TaskType      string         `gorm:"type:varchar(50)" json:"task_type"`       // 任务类型：course/practice/review
	TargetContent string         `gorm:"type:varchar(200)" json:"target_content"` // 目标内容
	TargetTime    int            `gorm:"default:0" json:"target_time"`            // 目标时长（分钟）
	TargetCount   int            `gorm:"default:0" json:"target_count"`           // 目标数量
	ActualTime    int            `gorm:"default:0" json:"actual_time"`            // 实际时长
	ActualCount   int            `gorm:"default:0" json:"actual_count"`           // 实际数量
	IsCompleted   bool           `gorm:"default:false;index" json:"is_completed"`
	CompletedAt   *time.Time     `gorm:"type:datetime" json:"completed_at,omitempty"`
	Note          string         `gorm:"type:varchar(500)" json:"note,omitempty"`
	CreatedAt     time.Time      `json:"created_at"`
	UpdatedAt     time.Time      `json:"updated_at"`
	DeletedAt     gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	Plan *StudyPlan `gorm:"foreignKey:PlanID" json:"-"`
}

func (StudyDailyTask) TableName() string {
	return "what_study_daily_tasks"
}

// StudyPlanTemplate 学习计划模板
type StudyPlanTemplate struct {
	ID             uint            `gorm:"primaryKey" json:"id"`
	Name           string          `gorm:"type:varchar(200);not null" json:"name"`
	Description    string          `gorm:"type:text" json:"description,omitempty"`
	ExamType       string          `gorm:"type:varchar(50);index" json:"exam_type"`             // 适用考试类型
	Duration       int             `gorm:"not null" json:"duration"`                            // 计划天数
	DailyStudyTime int             `gorm:"default:120" json:"daily_study_time"`                 // 建议每日学习时长
	DailyQuestions int             `gorm:"default:50" json:"daily_questions"`                   // 建议每日做题数
	PlanDetails    JSONPlanDetails `gorm:"type:json" json:"plan_details"`                       // 模板详情
	Difficulty     string          `gorm:"type:varchar(20);default:'medium'" json:"difficulty"` // 难度：easy/medium/hard
	IsPublic       bool            `gorm:"default:true;index" json:"is_public"`
	UseCount       int             `gorm:"default:0" json:"use_count"` // 使用次数
	SortOrder      int             `gorm:"default:0" json:"sort_order"`
	CreatedAt      time.Time       `json:"created_at"`
	UpdatedAt      time.Time       `json:"updated_at"`
	DeletedAt      gorm.DeletedAt  `gorm:"index" json:"-"`
}

func (StudyPlanTemplate) TableName() string {
	return "what_study_plan_templates"
}

// StudyPlanResponse 学习计划响应
type StudyPlanResponse struct {
	ID             uint            `json:"id"`
	Title          string          `json:"title"`
	Description    string          `json:"description,omitempty"`
	ExamType       string          `json:"exam_type,omitempty"`
	TargetExamDate *time.Time      `json:"target_exam_date,omitempty"`
	StartDate      time.Time       `json:"start_date"`
	EndDate        time.Time       `json:"end_date"`
	DailyStudyTime int             `json:"daily_study_time"`
	DailyQuestions int             `json:"daily_questions"`
	PlanDetails    JSONPlanDetails `json:"plan_details,omitempty"`
	Status         StudyPlanStatus `json:"status"`
	Progress       float64         `json:"progress"`
	TotalDays      int             `json:"total_days"`
	CompletedDays  int             `json:"completed_days"`
	CurrentPhase   int             `json:"current_phase"`
	RemainingDays  int             `json:"remaining_days"` // 剩余天数
	CreatedAt      time.Time       `json:"created_at"`
}

// ToResponse 转换为响应
func (p *StudyPlan) ToResponse() *StudyPlanResponse {
	remainingDays := int(time.Until(p.EndDate).Hours() / 24)
	if remainingDays < 0 {
		remainingDays = 0
	}

	return &StudyPlanResponse{
		ID:             p.ID,
		Title:          p.Title,
		Description:    p.Description,
		ExamType:       p.ExamType,
		TargetExamDate: p.TargetExamDate,
		StartDate:      p.StartDate,
		EndDate:        p.EndDate,
		DailyStudyTime: p.DailyStudyTime,
		DailyQuestions: p.DailyQuestions,
		PlanDetails:    p.PlanDetails,
		Status:         p.Status,
		Progress:       p.Progress,
		TotalDays:      p.TotalDays,
		CompletedDays:  p.CompletedDays,
		CurrentPhase:   p.CurrentPhase,
		RemainingDays:  remainingDays,
		CreatedAt:      p.CreatedAt,
	}
}

// =====================================================
// 学习时长追踪 - Study Time Tracking
// =====================================================

// StudyType 学习类型
type StudyType string

const (
	StudyTypeVideo    StudyType = "video"    // 视频学习
	StudyTypeArticle  StudyType = "article"  // 文章阅读
	StudyTypePractice StudyType = "practice" // 做题练习
	StudyTypeExam     StudyType = "exam"     // 模拟考试
	StudyTypeReview   StudyType = "review"   // 复习回顾
	StudyTypeNote     StudyType = "note"     // 笔记整理
)

// StudyTimeRecord 学习时长记录
type StudyTimeRecord struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	UserID      uint           `gorm:"index;not null" json:"user_id"`
	StudyType   StudyType      `gorm:"type:varchar(20);index;not null" json:"study_type"` // 学习类型
	Subject     string         `gorm:"type:varchar(50);index" json:"subject,omitempty"`   // 科目
	ContentType string         `gorm:"type:varchar(50)" json:"content_type,omitempty"`    // 内容类型
	ContentID   *uint          `gorm:"index" json:"content_id,omitempty"`                 // 内容ID（课程ID/试卷ID等）
	ContentName string         `gorm:"type:varchar(200)" json:"content_name,omitempty"`   // 内容名称
	Duration    int            `gorm:"not null;default:0" json:"duration"`                // 时长（秒）
	StudyDate   time.Time      `gorm:"type:date;index;not null" json:"study_date"`        // 学习日期
	StartTime   time.Time      `gorm:"type:datetime;not null" json:"start_time"`          // 开始时间
	EndTime     *time.Time     `gorm:"type:datetime" json:"end_time,omitempty"`           // 结束时间
	IsActive    bool           `gorm:"default:false" json:"is_active"`                    // 是否正在进行
	PauseCount  int            `gorm:"default:0" json:"pause_count"`                      // 暂停次数
	DeviceInfo  string         `gorm:"type:varchar(200)" json:"device_info,omitempty"`    // 设备信息
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

func (StudyTimeRecord) TableName() string {
	return "what_study_time_records"
}

// StudyTimeRecordResponse 学习时长记录响应
type StudyTimeRecordResponse struct {
	ID          uint       `json:"id"`
	StudyType   StudyType  `json:"study_type"`
	Subject     string     `json:"subject,omitempty"`
	ContentType string     `json:"content_type,omitempty"`
	ContentID   *uint      `json:"content_id,omitempty"`
	ContentName string     `json:"content_name,omitempty"`
	Duration    int        `json:"duration"`         // 秒
	DurationMin int        `json:"duration_minutes"` // 分钟
	StudyDate   time.Time  `json:"study_date"`
	StartTime   time.Time  `json:"start_time"`
	EndTime     *time.Time `json:"end_time,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

// ToResponse 转换为响应
func (r *StudyTimeRecord) ToResponse() *StudyTimeRecordResponse {
	return &StudyTimeRecordResponse{
		ID:          r.ID,
		StudyType:   r.StudyType,
		Subject:     r.Subject,
		ContentType: r.ContentType,
		ContentID:   r.ContentID,
		ContentName: r.ContentName,
		Duration:    r.Duration,
		DurationMin: r.Duration / 60,
		StudyDate:   r.StudyDate,
		StartTime:   r.StartTime,
		EndTime:     r.EndTime,
		CreatedAt:   r.CreatedAt,
	}
}

// StudyTimeDailySummary 每日学习统计
type StudyTimeDailySummary struct {
	ID              uint      `gorm:"primaryKey" json:"id"`
	UserID          uint      `gorm:"uniqueIndex:uk_user_date;not null" json:"user_id"`
	StudyDate       time.Time `gorm:"type:date;uniqueIndex:uk_user_date;not null" json:"study_date"`
	TotalSeconds    int       `gorm:"default:0" json:"total_seconds"`    // 总学习秒数
	VideoSeconds    int       `gorm:"default:0" json:"video_seconds"`    // 视频学习秒数
	PracticeSeconds int       `gorm:"default:0" json:"practice_seconds"` // 做题秒数
	ArticleSeconds  int       `gorm:"default:0" json:"article_seconds"`  // 文章阅读秒数
	OtherSeconds    int       `gorm:"default:0" json:"other_seconds"`    // 其他学习秒数
	SessionCount    int       `gorm:"default:0" json:"session_count"`    // 学习次数
	QuestionCount   int       `gorm:"default:0" json:"question_count"`   // 做题数量
	CorrectCount    int       `gorm:"default:0" json:"correct_count"`    // 正确数量
	CreatedAt       time.Time `json:"created_at"`
	UpdatedAt       time.Time `json:"updated_at"`

	// 关联
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

func (StudyTimeDailySummary) TableName() string {
	return "what_study_time_daily_summaries"
}

// StudyStatisticsResponse 学习统计响应
type StudyStatisticsResponse struct {
	Period          string            `json:"period"` // day/week/month
	TotalMinutes    int               `json:"total_minutes"`
	TotalHours      float64           `json:"total_hours"`
	VideoMinutes    int               `json:"video_minutes"`
	PracticeMinutes int               `json:"practice_minutes"`
	ArticleMinutes  int               `json:"article_minutes"`
	OtherMinutes    int               `json:"other_minutes"`
	SessionCount    int               `json:"session_count"`
	QuestionCount   int               `json:"question_count"`
	CorrectRate     float64           `json:"correct_rate"`
	DailyAverage    int               `json:"daily_average_minutes"`
	Trend           []DailyStudyTrend `json:"trend,omitempty"`
	BySubject       map[string]int    `json:"by_subject,omitempty"`
}

// DailyStudyTrend 每日学习趋势
type DailyStudyTrend struct {
	Date         string `json:"date"`
	TotalMinutes int    `json:"total_minutes"`
	SessionCount int    `json:"session_count"`
}

// =====================================================
// 学习内容收藏 - Learning Content Favorites
// =====================================================

// FavoriteContentType 收藏内容类型
type FavoriteContentType string

const (
	FavoriteContentCourse    FavoriteContentType = "course"    // 课程
	FavoriteContentChapter   FavoriteContentType = "chapter"   // 章节
	FavoriteContentQuestion  FavoriteContentType = "question"  // 题目
	FavoriteContentKnowledge FavoriteContentType = "knowledge" // 知识点
	FavoriteContentArticle   FavoriteContentType = "article"   // 文章
)

// LearningFavorite 学习内容收藏
type LearningFavorite struct {
	ID          uint                `gorm:"primaryKey" json:"id"`
	UserID      uint                `gorm:"uniqueIndex:uk_user_content;not null" json:"user_id"`
	ContentType FavoriteContentType `gorm:"type:varchar(20);uniqueIndex:uk_user_content;not null" json:"content_type"`
	ContentID   uint                `gorm:"uniqueIndex:uk_user_content;not null" json:"content_id"`
	FolderID    *uint               `gorm:"index" json:"folder_id,omitempty"` // 收藏夹ID
	Note        string              `gorm:"type:varchar(500)" json:"note,omitempty"`
	Tags        JSONStringArray     `gorm:"type:json" json:"tags,omitempty"`
	SortOrder   int                 `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	DeletedAt   gorm.DeletedAt      `gorm:"index" json:"-"`

	// 关联
	User   *User                   `gorm:"foreignKey:UserID" json:"-"`
	Folder *LearningFavoriteFolder `gorm:"foreignKey:FolderID" json:"folder,omitempty"`
}

func (LearningFavorite) TableName() string {
	return "what_learning_favorites"
}

// LearningFavoriteFolder 学习内容收藏夹
type LearningFavoriteFolder struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	UserID      uint           `gorm:"index;not null" json:"user_id"`
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	Description string         `gorm:"type:varchar(500)" json:"description,omitempty"`
	Icon        string         `gorm:"type:varchar(50)" json:"icon,omitempty"`
	Color       string         `gorm:"type:varchar(20);default:'#6366f1'" json:"color"`
	ItemCount   int            `gorm:"default:0" json:"item_count"` // 收藏数量
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`

	// 关联
	User      *User              `gorm:"foreignKey:UserID" json:"-"`
	Favorites []LearningFavorite `gorm:"foreignKey:FolderID" json:"favorites,omitempty"`
}

func (LearningFavoriteFolder) TableName() string {
	return "what_learning_favorite_folders"
}

// LearningFavoriteResponse 学习收藏响应
type LearningFavoriteResponse struct {
	ID          uint                `json:"id"`
	ContentType FavoriteContentType `json:"content_type"`
	ContentID   uint                `json:"content_id"`
	FolderID    *uint               `json:"folder_id,omitempty"`
	FolderName  string              `json:"folder_name,omitempty"`
	Note        string              `json:"note,omitempty"`
	Tags        []string            `json:"tags,omitempty"`
	CreatedAt   time.Time           `json:"created_at"`
	Content     interface{}         `json:"content,omitempty"` // 关联的内容详情
}

// ToResponse 转换为响应
func (f *LearningFavorite) ToResponse() *LearningFavoriteResponse {
	resp := &LearningFavoriteResponse{
		ID:          f.ID,
		ContentType: f.ContentType,
		ContentID:   f.ContentID,
		FolderID:    f.FolderID,
		Note:        f.Note,
		Tags:        f.Tags,
		CreatedAt:   f.CreatedAt,
	}
	if f.Folder != nil {
		resp.FolderName = f.Folder.Name
	}
	return resp
}

// LearningFavoriteFolderResponse 收藏夹响应
type LearningFavoriteFolderResponse struct {
	ID          uint      `json:"id"`
	Name        string    `json:"name"`
	Description string    `json:"description,omitempty"`
	Icon        string    `json:"icon,omitempty"`
	Color       string    `json:"color"`
	ItemCount   int       `json:"item_count"`
	CreatedAt   time.Time `json:"created_at"`
}

// ToResponse 转换为响应
func (f *LearningFavoriteFolder) ToResponse() *LearningFavoriteFolderResponse {
	return &LearningFavoriteFolderResponse{
		ID:          f.ID,
		Name:        f.Name,
		Description: f.Description,
		Icon:        f.Icon,
		Color:       f.Color,
		ItemCount:   f.ItemCount,
		CreatedAt:   f.CreatedAt,
	}
}

// =====================================================
// 知识图谱相关（简化版本）
// =====================================================

// UserKnowledgeMastery 用户知识点掌握度
type UserKnowledgeMastery struct {
	ID               uint       `gorm:"primaryKey" json:"id"`
	UserID           uint       `gorm:"uniqueIndex:uk_user_knowledge;not null" json:"user_id"`
	KnowledgePointID uint       `gorm:"uniqueIndex:uk_user_knowledge;not null" json:"knowledge_point_id"`
	MasteryLevel     float64    `gorm:"type:decimal(5,2);default:0" json:"mastery_level"` // 掌握度 0-100
	TotalQuestions   int        `gorm:"default:0" json:"total_questions"`                 // 总做题数
	CorrectQuestions int        `gorm:"default:0" json:"correct_questions"`               // 正确数
	LastPracticeAt   *time.Time `gorm:"type:datetime" json:"last_practice_at,omitempty"`
	LastCorrectAt    *time.Time `gorm:"type:datetime" json:"last_correct_at,omitempty"`
	StreakCount      int        `gorm:"default:0" json:"streak_count"` // 连续正确次数
	CreatedAt        time.Time  `json:"created_at"`
	UpdatedAt        time.Time  `json:"updated_at"`

	// 关联
	User           *User           `gorm:"foreignKey:UserID" json:"-"`
	KnowledgePoint *KnowledgePoint `gorm:"foreignKey:KnowledgePointID" json:"knowledge_point,omitempty"`
}

func (UserKnowledgeMastery) TableName() string {
	return "what_user_knowledge_mastery"
}

// KnowledgeMasteryResponse 知识点掌握度响应
type KnowledgeMasteryResponse struct {
	KnowledgePointID uint    `json:"knowledge_point_id"`
	KnowledgeName    string  `json:"knowledge_name"`
	MasteryLevel     float64 `json:"mastery_level"`
	TotalQuestions   int     `json:"total_questions"`
	CorrectRate      float64 `json:"correct_rate"`
	IsWeak           bool    `json:"is_weak"` // 是否为薄弱点
}

// ToResponse 转换为响应
func (m *UserKnowledgeMastery) ToResponse() *KnowledgeMasteryResponse {
	var correctRate float64
	if m.TotalQuestions > 0 {
		correctRate = float64(m.CorrectQuestions) / float64(m.TotalQuestions) * 100
	}

	resp := &KnowledgeMasteryResponse{
		KnowledgePointID: m.KnowledgePointID,
		MasteryLevel:     m.MasteryLevel,
		TotalQuestions:   m.TotalQuestions,
		CorrectRate:      correctRate,
		IsWeak:           m.MasteryLevel < 60, // 掌握度低于60%视为薄弱
	}
	if m.KnowledgePoint != nil {
		resp.KnowledgeName = m.KnowledgePoint.Name
	}
	return resp
}
