package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// =====================================================
// 每日一练相关模型
// =====================================================

// DailyPracticeStatus 每日一练状态
type DailyPracticeStatus string

const (
	DailyPracticeStatusPending   DailyPracticeStatus = "pending"   // 待练习
	DailyPracticeStatusCompleted DailyPracticeStatus = "completed" // 已完成
	DailyPracticeStatusPartial   DailyPracticeStatus = "partial"   // 部分完成
)

// DailyPractice 每日一练记录
type DailyPractice struct {
	ID              uint                `gorm:"primaryKey" json:"id"`
	UserID          uint                `gorm:"index:idx_user_date,unique;not null" json:"user_id"`
	PracticeDate    string              `gorm:"type:date;index:idx_user_date,unique;not null" json:"practice_date"` // 日期 YYYY-MM-DD
	Questions       DailyQuestionList   `gorm:"type:json;not null" json:"questions"`                                // 今日题目列表
	TotalQuestions  int                 `gorm:"default:10" json:"total_questions"`                                  // 题目总数
	CompletedCount  int                 `gorm:"default:0" json:"completed_count"`                                   // 已完成数量
	CorrectCount    int                 `gorm:"default:0" json:"correct_count"`                                     // 正确数量
	WrongCount      int                 `gorm:"default:0" json:"wrong_count"`                                       // 错误数量
	TotalTimeSpent  int                 `gorm:"default:0" json:"total_time_spent"`                                  // 总用时（秒）
	Status          DailyPracticeStatus `gorm:"type:varchar(20);default:'pending';index" json:"status"`             // 状态
	CompletedAt     *time.Time          `gorm:"type:datetime" json:"completed_at,omitempty"`                        // 完成时间
	DifficultyLevel int                 `gorm:"default:3" json:"difficulty_level"`                                  // 难度等级 1-5
	CreatedAt       time.Time           `json:"created_at"`
	UpdatedAt       time.Time           `json:"updated_at"`

	// 关联
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

func (DailyPractice) TableName() string {
	return "what_daily_practices"
}

// DailyQuestion 每日题目项
type DailyQuestion struct {
	QuestionID uint   `json:"question_id"`
	Order      int    `json:"order"`
	UserAnswer string `json:"user_answer,omitempty"`
	IsCorrect  *bool  `json:"is_correct,omitempty"`
	TimeSpent  int    `json:"time_spent,omitempty"` // 用时（秒）
	AnsweredAt string `json:"answered_at,omitempty"`
}

// DailyQuestionList 每日题目列表
type DailyQuestionList []DailyQuestion

// Value 实现 driver.Valuer 接口
func (d DailyQuestionList) Value() (driver.Value, error) {
	if d == nil {
		return "[]", nil
	}
	return json.Marshal(d)
}

// Scan 实现 sql.Scanner 接口
func (d *DailyQuestionList) Scan(value interface{}) error {
	if value == nil {
		*d = []DailyQuestion{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for DailyQuestionList")
	}

	return json.Unmarshal(bytes, d)
}

// UserDailyStreak 用户连续打卡记录
type UserDailyStreak struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	UserID         uint       `gorm:"uniqueIndex;not null" json:"user_id"`
	CurrentStreak  int        `gorm:"default:0" json:"current_streak"`                     // 当前连续天数
	LongestStreak  int        `gorm:"default:0" json:"longest_streak"`                     // 最长连续天数
	TotalDays      int        `gorm:"default:0" json:"total_days"`                         // 累计打卡天数
	LastPracticeAt *time.Time `gorm:"type:date" json:"last_practice_at"`                   // 最后打卡日期
	ThisWeekDays   int        `gorm:"default:0" json:"this_week_days"`                     // 本周打卡天数
	ThisMonthDays  int        `gorm:"default:0" json:"this_month_days"`                    // 本月打卡天数
	TotalQuestions int        `gorm:"default:0" json:"total_questions"`                    // 累计做题数
	TotalCorrect   int        `gorm:"default:0" json:"total_correct"`                      // 累计正确数
	AvgCorrectRate float64    `gorm:"type:decimal(5,2);default:0" json:"avg_correct_rate"` // 平均正确率
	AvgTimePerQ    int        `gorm:"default:0" json:"avg_time_per_q"`                     // 平均每题用时（秒）
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	// 关联
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

func (UserDailyStreak) TableName() string {
	return "what_user_daily_streaks"
}

// UserWeakCategory 用户薄弱分类统计
type UserWeakCategory struct {
	ID             uint       `gorm:"primaryKey" json:"id"`
	UserID         uint       `gorm:"index:idx_user_category,unique;not null" json:"user_id"`
	CategoryID     uint       `gorm:"index:idx_user_category,unique;not null" json:"category_id"`
	TotalCount     int        `gorm:"default:0" json:"total_count"`                    // 该分类总做题数
	CorrectCount   int        `gorm:"default:0" json:"correct_count"`                  // 正确数
	WrongCount     int        `gorm:"default:0" json:"wrong_count"`                    // 错误数
	CorrectRate    float64    `gorm:"type:decimal(5,2);default:0" json:"correct_rate"` // 正确率
	LastPracticeAt *time.Time `gorm:"type:datetime" json:"last_practice_at"`           // 最后练习时间
	CreatedAt      time.Time  `json:"created_at"`
	UpdatedAt      time.Time  `json:"updated_at"`

	// 关联
	User     *User           `gorm:"foreignKey:UserID" json:"-"`
	Category *CourseCategory `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
}

func (UserWeakCategory) TableName() string {
	return "what_user_weak_categories"
}

// =====================================================
// 响应结构
// =====================================================

// DailyPracticeResponse 每日一练响应
type DailyPracticeResponse struct {
	ID              uint                `json:"id"`
	PracticeDate    string              `json:"practice_date"`
	TotalQuestions  int                 `json:"total_questions"`
	CompletedCount  int                 `json:"completed_count"`
	CorrectCount    int                 `json:"correct_count"`
	WrongCount      int                 `json:"wrong_count"`
	TotalTimeSpent  int                 `json:"total_time_spent"`
	Status          DailyPracticeStatus `json:"status"`
	CompletedAt     *time.Time          `json:"completed_at,omitempty"`
	DifficultyLevel int                 `json:"difficulty_level"`
	Progress        float64             `json:"progress"`     // 完成进度百分比
	CorrectRate     float64             `json:"correct_rate"` // 正确率
}

// ToResponse 转换为响应
func (d *DailyPractice) ToResponse() *DailyPracticeResponse {
	progress := 0.0
	if d.TotalQuestions > 0 {
		progress = float64(d.CompletedCount) / float64(d.TotalQuestions) * 100
	}
	correctRate := 0.0
	if d.CompletedCount > 0 {
		correctRate = float64(d.CorrectCount) / float64(d.CompletedCount) * 100
	}

	return &DailyPracticeResponse{
		ID:              d.ID,
		PracticeDate:    d.PracticeDate,
		TotalQuestions:  d.TotalQuestions,
		CompletedCount:  d.CompletedCount,
		CorrectCount:    d.CorrectCount,
		WrongCount:      d.WrongCount,
		TotalTimeSpent:  d.TotalTimeSpent,
		Status:          d.Status,
		CompletedAt:     d.CompletedAt,
		DifficultyLevel: d.DifficultyLevel,
		Progress:        progress,
		CorrectRate:     correctRate,
	}
}

// DailyPracticeDetailResponse 每日一练详情响应
type DailyPracticeDetailResponse struct {
	DailyPracticeResponse
	Questions []DailyQuestionWithDetail `json:"questions"`
}

// DailyQuestionWithDetail 带详情的每日题目
type DailyQuestionWithDetail struct {
	DailyQuestion
	Question *QuestionBriefResponse `json:"question,omitempty"`
}

// UserDailyStreakResponse 用户打卡记录响应
type UserDailyStreakResponse struct {
	CurrentStreak  int        `json:"current_streak"`
	LongestStreak  int        `json:"longest_streak"`
	TotalDays      int        `json:"total_days"`
	LastPracticeAt *time.Time `json:"last_practice_at,omitempty"`
	ThisWeekDays   int        `json:"this_week_days"`
	ThisMonthDays  int        `json:"this_month_days"`
	TotalQuestions int        `json:"total_questions"`
	TotalCorrect   int        `json:"total_correct"`
	AvgCorrectRate float64    `json:"avg_correct_rate"`
	AvgTimePerQ    int        `json:"avg_time_per_q"`
	TodayCompleted bool       `json:"today_completed"` // 今日是否已完成
}

// ToResponse 转换为响应
func (s *UserDailyStreak) ToResponse() *UserDailyStreakResponse {
	return &UserDailyStreakResponse{
		CurrentStreak:  s.CurrentStreak,
		LongestStreak:  s.LongestStreak,
		TotalDays:      s.TotalDays,
		LastPracticeAt: s.LastPracticeAt,
		ThisWeekDays:   s.ThisWeekDays,
		ThisMonthDays:  s.ThisMonthDays,
		TotalQuestions: s.TotalQuestions,
		TotalCorrect:   s.TotalCorrect,
		AvgCorrectRate: s.AvgCorrectRate,
		AvgTimePerQ:    s.AvgTimePerQ,
	}
}

// WeakCategoryResponse 薄弱分类响应
type WeakCategoryResponse struct {
	CategoryID   uint    `json:"category_id"`
	CategoryName string  `json:"category_name"`
	TotalCount   int     `json:"total_count"`
	CorrectCount int     `json:"correct_count"`
	WrongCount   int     `json:"wrong_count"`
	CorrectRate  float64 `json:"correct_rate"`
}

// DailyPracticeCalendarItem 日历项
type DailyPracticeCalendarItem struct {
	Date           string  `json:"date"`
	Completed      bool    `json:"completed"`
	CorrectRate    float64 `json:"correct_rate,omitempty"`
	TotalQuestions int     `json:"total_questions,omitempty"`
}

// =====================================================
// 请求结构
// =====================================================

// SubmitDailyAnswerRequest 提交每日答案请求
type SubmitDailyAnswerRequest struct {
	QuestionID uint   `json:"question_id" validate:"required"`
	UserAnswer string `json:"user_answer" validate:"required"`
	TimeSpent  int    `json:"time_spent"` // 用时（秒）
}

// DailyPracticeConfig 每日练习配置
type DailyPracticeConfig struct {
	QuestionCount   int  `json:"question_count"`   // 每日题目数量
	IncludeWeak     bool `json:"include_weak"`     // 是否包含薄弱项
	WeakRatio       int  `json:"weak_ratio"`       // 薄弱项占比（百分比）
	DifficultyLevel int  `json:"difficulty_level"` // 难度等级 1-5
}

// 默认配置
var DefaultDailyPracticeConfig = DailyPracticeConfig{
	QuestionCount:   10,
	IncludeWeak:     true,
	WeakRatio:       40, // 40%来自薄弱分类
	DifficultyLevel: 3,
}

// =====================================================
// GORM Hooks
// =====================================================

func (d *DailyPractice) BeforeCreate(tx *gorm.DB) error {
	if d.PracticeDate == "" {
		d.PracticeDate = time.Now().Format("2006-01-02")
	}
	return nil
}
