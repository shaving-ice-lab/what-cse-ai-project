package model

import (
	"time"
)

// PositionRegistrationData 职位报名数据快照
// 用于存储每日的报名人数、过审人数等数据变化
type PositionRegistrationData struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	PositionID       string    `gorm:"type:varchar(50);index;not null" json:"position_id"`    // 职位ID（业务标识）
	SnapshotDate     time.Time `gorm:"type:date;index;not null" json:"snapshot_date"`         // 快照日期
	SnapshotTime     string    `gorm:"type:varchar(8)" json:"snapshot_time"`                  // 快照时间 (HH:mm:ss)
	ApplyCount       int       `gorm:"default:0" json:"apply_count"`                          // 报名人数
	PassCount        int       `gorm:"default:0" json:"pass_count"`                           // 过审人数
	CompetitionRatio float64   `gorm:"type:decimal(10,2);default:0" json:"competition_ratio"` // 竞争比
	CreatedAt        time.Time `json:"created_at"`

	// 关联
	Position *Position `gorm:"foreignKey:PositionID;references:PositionID" json:"position,omitempty"`
}

func (PositionRegistrationData) TableName() string {
	return "what_position_registration_data"
}

// RegistrationOverview 报名数据总览
type RegistrationOverview struct {
	TotalApplicants      int64   `json:"total_applicants"`       // 总报名人数
	TotalPassCount       int64   `json:"total_pass_count"`       // 总过审人数
	AvgCompetitionRatio  float64 `json:"avg_competition_ratio"`  // 平均竞争比
	MaxCompetitionRatio  float64 `json:"max_competition_ratio"`  // 最高竞争比
	NoApplicantCount     int64   `json:"no_applicant_count"`     // 无人报考职位数
	LowCompetitionCount  int64   `json:"low_competition_count"`  // 低竞争比职位数（<10:1）
	HighCompetitionCount int64   `json:"high_competition_count"` // 高竞争比职位数（>100:1）
}

// PositionHotRank 职位热度榜
type PositionHotRank struct {
	PositionID       string  `json:"position_id"`
	PositionName     string  `json:"position_name"`
	DepartmentName   string  `json:"department_name"`
	ApplyCount       int     `json:"apply_count"`
	PassCount        int     `json:"pass_count"`
	CompetitionRatio float64 `json:"competition_ratio"`
	RecruitCount     int     `json:"recruit_count"`
	Province         string  `json:"province"`
	City             string  `json:"city"`
}

// ColdPosition 冷门职位
type ColdPosition struct {
	PositionID       string  `json:"position_id"`
	PositionName     string  `json:"position_name"`
	DepartmentName   string  `json:"department_name"`
	ApplyCount       int     `json:"apply_count"`
	PassCount        int     `json:"pass_count"`
	CompetitionRatio float64 `json:"competition_ratio"`
	RecruitCount     int     `json:"recruit_count"`
	Province         string  `json:"province"`
	City             string  `json:"city"`
	Education        string  `json:"education"`
	IsUnlimitedMajor bool    `json:"is_unlimited_major"`
}

// RegistrationTrend 报名趋势
type RegistrationTrend struct {
	Date           string  `json:"date"`
	TotalApply     int64   `json:"total_apply"`     // 当日总报名
	DailyIncrement int64   `json:"daily_increment"` // 当日增量
	AvgCompetition float64 `json:"avg_competition"` // 当日平均竞争比
}

// PositionRegistrationTrend 单个职位的报名趋势
type PositionRegistrationTrend struct {
	Date             string  `json:"date"`
	ApplyCount       int     `json:"apply_count"`
	PassCount        int     `json:"pass_count"`
	CompetitionRatio float64 `json:"competition_ratio"`
	DailyIncrement   int     `json:"daily_increment"`
}
