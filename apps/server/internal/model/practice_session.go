package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// =====================================================
// 练习会话相关模型（专项练习、随机练习、计时练习）
// =====================================================

// PracticeSessionType 练习会话类型
type PracticeSessionType string

const (
	PracticeSessionTypeSpecialized PracticeSessionType = "specialized" // 专项练习
	PracticeSessionTypeRandom      PracticeSessionType = "random"      // 随机练习
	PracticeSessionTypeTimed       PracticeSessionType = "timed"       // 计时练习
	PracticeSessionTypeWrongRedo   PracticeSessionType = "wrong_redo"  // 错题重做
)

// PracticeSessionStatus 练习会话状态
type PracticeSessionStatus string

const (
	PracticeSessionStatusPending   PracticeSessionStatus = "pending"   // 待开始
	PracticeSessionStatusActive    PracticeSessionStatus = "active"    // 进行中
	PracticeSessionStatusCompleted PracticeSessionStatus = "completed" // 已完成
	PracticeSessionStatusAbandoned PracticeSessionStatus = "abandoned" // 已放弃
)

// PracticeSession 练习会话
type PracticeSession struct {
	ID             uint                  `gorm:"primaryKey" json:"id"`
	UserID         uint                  `gorm:"index;not null" json:"user_id"`
	SessionType    PracticeSessionType   `gorm:"type:varchar(20);not null;index" json:"session_type"`
	Title          string                `gorm:"type:varchar(200)" json:"title"`      // 会话标题
	Config         PracticeSessionConfig `gorm:"type:json" json:"config"`             // 练习配置
	Questions      SessionQuestionList   `gorm:"type:json;not null" json:"questions"` // 题目列表
	TotalQuestions int                   `gorm:"default:0" json:"total_questions"`    // 题目总数
	CompletedCount int                   `gorm:"default:0" json:"completed_count"`    // 已完成数量
	CorrectCount   int                   `gorm:"default:0" json:"correct_count"`      // 正确数量
	WrongCount     int                   `gorm:"default:0" json:"wrong_count"`        // 错误数量
	TotalTimeSpent int                   `gorm:"default:0" json:"total_time_spent"`   // 总用时（秒）
	TimeLimit      int                   `gorm:"default:0" json:"time_limit"`         // 时间限制（秒），0表示不限时
	Status         PracticeSessionStatus `gorm:"type:varchar(20);default:'pending';index" json:"status"`
	StartedAt      *time.Time            `gorm:"type:datetime" json:"started_at,omitempty"`
	CompletedAt    *time.Time            `gorm:"type:datetime" json:"completed_at,omitempty"`
	CreatedAt      time.Time             `json:"created_at"`
	UpdatedAt      time.Time             `json:"updated_at"`
	DeletedAt      gorm.DeletedAt        `gorm:"index" json:"-"`

	// 断点续做相关字段
	CurrentIndex    int        `gorm:"default:0" json:"current_index"`                     // 当前题目索引
	LastSavedAt     *time.Time `gorm:"type:datetime" json:"last_saved_at,omitempty"`       // 最后保存时间
	IsInterrupted   bool       `gorm:"default:false" json:"is_interrupted"`                // 是否被中断
	InterruptReason string     `gorm:"type:varchar(50)" json:"interrupt_reason,omitempty"` // 中断原因
	ElapsedAtSave   int        `gorm:"default:0" json:"elapsed_at_save"`                   // 保存时已用时间

	// 关联
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

func (PracticeSession) TableName() string {
	return "what_practice_sessions"
}

// PracticeSessionConfig 练习会话配置
type PracticeSessionConfig struct {
	// 通用配置
	QuestionCount int `json:"question_count"` // 题目数量

	// 专项练习配置
	CategoryIDs   []uint   `json:"category_ids,omitempty"`   // 分类/知识点ID列表
	QuestionTypes []string `json:"question_types,omitempty"` // 题型列表
	Difficulties  []int    `json:"difficulties,omitempty"`   // 难度列表

	// 随机练习配置
	SmartRandom bool `json:"smart_random,omitempty"` // 是否智能随机（根据薄弱点加权）

	// 计时练习配置
	TimeLimitPerQuestion int  `json:"time_limit_per_question,omitempty"` // 单题限时（秒）
	TotalTimeLimit       int  `json:"total_time_limit,omitempty"`        // 整体限时（秒）
	ShowCountdown        bool `json:"show_countdown,omitempty"`          // 是否显示倒计时

	// 错题重做配置
	WrongDateRange int  `json:"wrong_date_range,omitempty"` // 错题日期范围（天）
	OnlyRecent     bool `json:"only_recent,omitempty"`      // 只做最近错题
}

// Value 实现 driver.Valuer 接口
func (c PracticeSessionConfig) Value() (driver.Value, error) {
	return json.Marshal(c)
}

// Scan 实现 sql.Scanner 接口
func (c *PracticeSessionConfig) Scan(value interface{}) error {
	if value == nil {
		*c = PracticeSessionConfig{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for PracticeSessionConfig")
	}

	return json.Unmarshal(bytes, c)
}

// SessionQuestion 会话题目项
type SessionQuestion struct {
	QuestionID uint   `json:"question_id"`
	Order      int    `json:"order"`
	UserAnswer string `json:"user_answer,omitempty"`
	IsCorrect  *bool  `json:"is_correct,omitempty"`
	TimeSpent  int    `json:"time_spent,omitempty"` // 用时（秒）
	AnsweredAt string `json:"answered_at,omitempty"`
}

// SessionQuestionList 会话题目列表
type SessionQuestionList []SessionQuestion

// Value 实现 driver.Valuer 接口
func (s SessionQuestionList) Value() (driver.Value, error) {
	if s == nil {
		return "[]", nil
	}
	return json.Marshal(s)
}

// Scan 实现 sql.Scanner 接口
func (s *SessionQuestionList) Scan(value interface{}) error {
	if value == nil {
		*s = []SessionQuestion{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for SessionQuestionList")
	}

	return json.Unmarshal(bytes, s)
}

// =====================================================
// 请求结构
// =====================================================

// CreatePracticeSessionRequest 创建练习会话请求
type CreatePracticeSessionRequest struct {
	SessionType   PracticeSessionType `json:"session_type" validate:"required"`
	Title         string              `json:"title,omitempty"`
	QuestionCount int                 `json:"question_count" validate:"required,min=1,max=100"`

	// 专项练习参数
	CategoryIDs   []uint   `json:"category_ids,omitempty"`
	QuestionTypes []string `json:"question_types,omitempty"`
	Difficulties  []int    `json:"difficulties,omitempty"`

	// 随机练习参数
	SmartRandom bool `json:"smart_random,omitempty"`

	// 计时练习参数
	TimeLimitPerQuestion int  `json:"time_limit_per_question,omitempty"`
	TotalTimeLimit       int  `json:"total_time_limit,omitempty"`
	ShowCountdown        bool `json:"show_countdown,omitempty"`

	// 错题重做参数
	WrongDateRange int  `json:"wrong_date_range,omitempty"`
	OnlyRecent     bool `json:"only_recent,omitempty"`
}

// SubmitSessionAnswerRequest 提交会话答案请求
type SubmitSessionAnswerRequest struct {
	QuestionID uint   `json:"question_id" validate:"required"`
	UserAnswer string `json:"user_answer" validate:"required"`
	TimeSpent  int    `json:"time_spent"` // 用时（秒）
}

// =====================================================
// 断点续做相关请求
// =====================================================

// SaveSessionProgressRequest 保存会话进度请求
type SaveSessionProgressRequest struct {
	CurrentIndex   int                 `json:"current_index"`    // 当前题目索引
	TotalTimeSpent int                 `json:"total_time_spent"` // 已用时间（秒）
	Answers        []SessionAnswerItem `json:"answers"`          // 所有答案
}

// SessionAnswerItem 单个答案项
type SessionAnswerItem struct {
	QuestionID uint   `json:"question_id"`
	UserAnswer string `json:"user_answer"`
	TimeSpent  int    `json:"time_spent"`
}

// InterruptSessionRequest 中断会话请求
type InterruptSessionRequest struct {
	Reason         string              `json:"reason,omitempty"`  // 中断原因
	CurrentIndex   int                 `json:"current_index"`     // 当前题目索引
	TotalTimeSpent int                 `json:"total_time_spent"`  // 已用时间（秒）
	Answers        []SessionAnswerItem `json:"answers,omitempty"` // 所有答案
}

// =====================================================
// 响应结构
// =====================================================

// PracticeSessionResponse 练习会话响应
type PracticeSessionResponse struct {
	ID             uint                  `json:"id"`
	SessionType    PracticeSessionType   `json:"session_type"`
	Title          string                `json:"title"`
	TotalQuestions int                   `json:"total_questions"`
	CompletedCount int                   `json:"completed_count"`
	CorrectCount   int                   `json:"correct_count"`
	WrongCount     int                   `json:"wrong_count"`
	TotalTimeSpent int                   `json:"total_time_spent"`
	TimeLimit      int                   `json:"time_limit"`
	Status         PracticeSessionStatus `json:"status"`
	Progress       float64               `json:"progress"`
	CorrectRate    float64               `json:"correct_rate"`
	StartedAt      *time.Time            `json:"started_at,omitempty"`
	CompletedAt    *time.Time            `json:"completed_at,omitempty"`
	CreatedAt      time.Time             `json:"created_at"`
	// 断点续做相关
	CurrentIndex    int        `json:"current_index"`
	LastSavedAt     *time.Time `json:"last_saved_at,omitempty"`
	IsInterrupted   bool       `json:"is_interrupted"`
	InterruptReason string     `json:"interrupt_reason,omitempty"`
	CanResume       bool       `json:"can_resume"` // 是否可以恢复
}

// ToResponse 转换为响应
func (p *PracticeSession) ToResponse() *PracticeSessionResponse {
	progress := 0.0
	if p.TotalQuestions > 0 {
		progress = float64(p.CompletedCount) / float64(p.TotalQuestions) * 100
	}
	correctRate := 0.0
	if p.CompletedCount > 0 {
		correctRate = float64(p.CorrectCount) / float64(p.CompletedCount) * 100
	}

	// 判断是否可以恢复：进行中或被中断且未完成
	canResume := (p.Status == PracticeSessionStatusActive || p.IsInterrupted) &&
		p.CompletedCount < p.TotalQuestions

	return &PracticeSessionResponse{
		ID:              p.ID,
		SessionType:     p.SessionType,
		Title:           p.Title,
		TotalQuestions:  p.TotalQuestions,
		CompletedCount:  p.CompletedCount,
		CorrectCount:    p.CorrectCount,
		WrongCount:      p.WrongCount,
		TotalTimeSpent:  p.TotalTimeSpent,
		TimeLimit:       p.TimeLimit,
		Status:          p.Status,
		Progress:        progress,
		CorrectRate:     correctRate,
		StartedAt:       p.StartedAt,
		CompletedAt:     p.CompletedAt,
		CreatedAt:       p.CreatedAt,
		CurrentIndex:    p.CurrentIndex,
		LastSavedAt:     p.LastSavedAt,
		IsInterrupted:   p.IsInterrupted,
		InterruptReason: p.InterruptReason,
		CanResume:       canResume,
	}
}

// PracticeSessionDetailResponse 练习会话详情响应
type PracticeSessionDetailResponse struct {
	PracticeSessionResponse
	Config    PracticeSessionConfig       `json:"config"`
	Questions []SessionQuestionWithDetail `json:"questions"`
}

// SessionQuestionWithDetail 带详情的会话题目
type SessionQuestionWithDetail struct {
	SessionQuestion
	Question *QuestionBriefResponse `json:"question,omitempty"`
}

// =====================================================
// 预设练习模板
// =====================================================

// PracticeTemplate 练习模板
type PracticeTemplate struct {
	ID          string                `json:"id"`
	Name        string                `json:"name"`
	Description string                `json:"description"`
	SessionType PracticeSessionType   `json:"session_type"`
	Config      PracticeSessionConfig `json:"config"`
	Icon        string                `json:"icon"`
	Color       string                `json:"color"`
}

// GetQuickPracticeTemplates 获取快速练习模板
func GetQuickPracticeTemplates() []PracticeTemplate {
	return []PracticeTemplate{
		{
			ID:          "quick_10",
			Name:        "快速练习",
			Description: "10道随机题目，快速练手",
			SessionType: PracticeSessionTypeRandom,
			Config: PracticeSessionConfig{
				QuestionCount: 10,
				SmartRandom:   false,
			},
			Icon:  "zap",
			Color: "amber",
		},
		{
			ID:          "quick_20",
			Name:        "标准练习",
			Description: "20道随机题目，中等强度",
			SessionType: PracticeSessionTypeRandom,
			Config: PracticeSessionConfig{
				QuestionCount: 20,
				SmartRandom:   false,
			},
			Icon:  "target",
			Color: "blue",
		},
		{
			ID:          "quick_50",
			Name:        "强化练习",
			Description: "50道随机题目，全面训练",
			SessionType: PracticeSessionTypeRandom,
			Config: PracticeSessionConfig{
				QuestionCount: 50,
				SmartRandom:   false,
			},
			Icon:  "flame",
			Color: "orange",
		},
		{
			ID:          "smart_weak",
			Name:        "薄弱攻克",
			Description: "根据你的薄弱点智能推送",
			SessionType: PracticeSessionTypeRandom,
			Config: PracticeSessionConfig{
				QuestionCount: 20,
				SmartRandom:   true,
			},
			Icon:  "brain",
			Color: "purple",
		},
		{
			ID:          "timed_30",
			Name:        "限时挑战",
			Description: "30分钟限时练习，模拟考试",
			SessionType: PracticeSessionTypeTimed,
			Config: PracticeSessionConfig{
				QuestionCount:  30,
				TotalTimeLimit: 30 * 60, // 30分钟
				ShowCountdown:  true,
			},
			Icon:  "timer",
			Color: "red",
		},
	}
}
