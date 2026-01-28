package model

import (
	"time"

	"gorm.io/gorm"
)

// ExamLocation 考点信息
type ExamLocation struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Name         string         `gorm:"type:varchar(200);not null;index" json:"name"` // 考点名称
	Address      string         `gorm:"type:varchar(500)" json:"address"`             // 详细地址
	Province     string         `gorm:"type:varchar(50);index" json:"province"`       // 省份
	City         string         `gorm:"type:varchar(50);index" json:"city"`           // 城市
	District     string         `gorm:"type:varchar(50)" json:"district"`             // 区县
	Longitude    float64        `gorm:"type:decimal(10,7)" json:"longitude"`          // 经度
	Latitude     float64        `gorm:"type:decimal(10,7)" json:"latitude"`           // 纬度
	ExamType     string         `gorm:"type:varchar(50);index" json:"exam_type"`      // 考试类型（国考/省考/事业单位等）
	ContactPhone string         `gorm:"type:varchar(50)" json:"contact_phone"`        // 联系电话
	Description  string         `gorm:"type:text" json:"description"`                 // 考点说明
	Facilities   string         `gorm:"type:text" json:"facilities"`                  // 设施说明（停车场、交通等）
	Capacity     int            `gorm:"default:0" json:"capacity"`                    // 可容纳人数
	IsActive     bool           `gorm:"default:true;index" json:"is_active"`          // 是否启用
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ExamLocation) TableName() string {
	return "what_exam_locations"
}

// ExamLocationResponse 考点响应
type ExamLocationResponse struct {
	ID           uint    `json:"id"`
	Name         string  `json:"name"`
	Address      string  `json:"address"`
	Province     string  `json:"province"`
	City         string  `json:"city"`
	District     string  `json:"district"`
	Longitude    float64 `json:"longitude"`
	Latitude     float64 `json:"latitude"`
	ExamType     string  `json:"exam_type"`
	ContactPhone string  `json:"contact_phone,omitempty"`
	Description  string  `json:"description,omitempty"`
	Facilities   string  `json:"facilities,omitempty"`
	Capacity     int     `json:"capacity,omitempty"`
}

func (e *ExamLocation) ToResponse() *ExamLocationResponse {
	return &ExamLocationResponse{
		ID:           e.ID,
		Name:         e.Name,
		Address:      e.Address,
		Province:     e.Province,
		City:         e.City,
		District:     e.District,
		Longitude:    e.Longitude,
		Latitude:     e.Latitude,
		ExamType:     e.ExamType,
		ContactPhone: e.ContactPhone,
		Description:  e.Description,
		Facilities:   e.Facilities,
		Capacity:     e.Capacity,
	}
}

// ScoreEstimate 估分数据
type ScoreEstimate struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	UserID         *uint          `gorm:"index" json:"user_id"`                             // 用户ID（可选，匿名用户为空）
	ExamType       string         `gorm:"type:varchar(50);not null;index" json:"exam_type"` // 考试类型
	ExamYear       int            `gorm:"index" json:"exam_year"`                           // 考试年份
	ExamSubject    string         `gorm:"type:varchar(50)" json:"exam_subject"`             // 科目（行测/申论等）
	CorrectCount   int            `gorm:"default:0" json:"correct_count"`                   // 答对题数
	TotalCount     int            `gorm:"default:0" json:"total_count"`                     // 总题数
	EstimatedScore float64        `gorm:"type:decimal(5,2)" json:"estimated_score"`         // 估计分数
	ActualScore    *float64       `gorm:"type:decimal(5,2)" json:"actual_score"`            // 实际分数（后续可填）
	Answers        string         `gorm:"type:text" json:"answers"`                         // 答案JSON
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ScoreEstimate) TableName() string {
	return "what_score_estimates"
}

// ScoreShare 成绩晒分
type ScoreShare struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	UserID       *uint          `gorm:"index" json:"user_id"`                             // 用户ID
	ExamType     string         `gorm:"type:varchar(50);not null;index" json:"exam_type"` // 考试类型
	ExamYear     int            `gorm:"index" json:"exam_year"`                           // 考试年份
	ExamProvince string         `gorm:"type:varchar(50);index" json:"exam_province"`      // 考试省份
	XingceScore  *float64       `gorm:"type:decimal(5,2)" json:"xingce_score"`            // 行测分数
	ShenlunScore *float64       `gorm:"type:decimal(5,2)" json:"shenlun_score"`           // 申论分数
	TotalScore   *float64       `gorm:"type:decimal(5,2)" json:"total_score"`             // 总分
	Rank         *int           `json:"rank"`                                             // 排名（如有）
	PassStatus   string         `gorm:"type:varchar(20)" json:"pass_status"`              // 进面状态（待定/进面/未进）
	PositionName string         `gorm:"type:varchar(200)" json:"position_name"`           // 报考职位
	IsAnonymous  bool           `gorm:"default:true" json:"is_anonymous"`                 // 是否匿名
	Nickname     string         `gorm:"type:varchar(50)" json:"nickname"`                 // 展示昵称
	Comment      string         `gorm:"type:text" json:"comment"`                         // 心得评论
	LikeCount    int            `gorm:"default:0" json:"like_count"`                      // 点赞数
	IsVerified   bool           `gorm:"default:false" json:"is_verified"`                 // 是否验证
	Status       int            `gorm:"type:tinyint;default:1;index" json:"status"`       // 状态：0-隐藏 1-公开 2-审核中
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ScoreShare) TableName() string {
	return "what_score_shares"
}

// ScoreShareStatus 晒分状态常量
const (
	ScoreShareStatusHidden  = 0
	ScoreShareStatusPublic  = 1
	ScoreShareStatusPending = 2
)

// ScoreShareResponse 晒分响应
type ScoreShareResponse struct {
	ID           uint      `json:"id"`
	ExamType     string    `json:"exam_type"`
	ExamYear     int       `json:"exam_year"`
	ExamProvince string    `json:"exam_province"`
	XingceScore  *float64  `json:"xingce_score,omitempty"`
	ShenlunScore *float64  `json:"shenlun_score,omitempty"`
	TotalScore   *float64  `json:"total_score,omitempty"`
	Rank         *int      `json:"rank,omitempty"`
	PassStatus   string    `json:"pass_status,omitempty"`
	PositionName string    `json:"position_name,omitempty"`
	Nickname     string    `json:"nickname"`
	Comment      string    `json:"comment,omitempty"`
	LikeCount    int       `json:"like_count"`
	IsVerified   bool      `json:"is_verified"`
	CreatedAt    time.Time `json:"created_at"`
}

func (s *ScoreShare) ToResponse() *ScoreShareResponse {
	nickname := s.Nickname
	if s.IsAnonymous && nickname == "" {
		nickname = "匿名用户"
	}
	return &ScoreShareResponse{
		ID:           s.ID,
		ExamType:     s.ExamType,
		ExamYear:     s.ExamYear,
		ExamProvince: s.ExamProvince,
		XingceScore:  s.XingceScore,
		ShenlunScore: s.ShenlunScore,
		TotalScore:   s.TotalScore,
		Rank:         s.Rank,
		PassStatus:   s.PassStatus,
		PositionName: s.PositionName,
		Nickname:     nickname,
		Comment:      s.Comment,
		LikeCount:    s.LikeCount,
		IsVerified:   s.IsVerified,
		CreatedAt:    s.CreatedAt,
	}
}

// ScoreStatistics 分数统计
type ScoreStatistics struct {
	ExamType     string              `json:"exam_type"`
	ExamYear     int                 `json:"exam_year"`
	ExamProvince string              `json:"exam_province,omitempty"`
	TotalCount   int                 `json:"total_count"`            // 晒分人数
	AvgXingce    float64             `json:"avg_xingce"`             // 行测平均分
	AvgShenlun   float64             `json:"avg_shenlun"`            // 申论平均分
	AvgTotal     float64             `json:"avg_total"`              // 总分平均分
	MaxXingce    float64             `json:"max_xingce"`             // 行测最高分
	MaxShenlun   float64             `json:"max_shenlun"`            // 申论最高分
	MaxTotal     float64             `json:"max_total"`              // 总分最高分
	PassRate     float64             `json:"pass_rate"`              // 进面率
	Distribution []ScoreDistribution `json:"distribution,omitempty"` // 分数分布
}

// ScoreDistribution 分数分布
type ScoreDistribution struct {
	Range   string  `json:"range"`   // 分数区间
	Count   int     `json:"count"`   // 人数
	Percent float64 `json:"percent"` // 百分比
}
