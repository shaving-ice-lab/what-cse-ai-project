package model

import (
	"time"
)

// PositionHistory 历年招录数据模型
type PositionHistory struct {
	ID               uint      `gorm:"primaryKey" json:"id"`
	PositionCode     string    `gorm:"type:varchar(50);index" json:"position_code"`           // 职位代码（用于关联同一职位）
	PositionName     string    `gorm:"type:varchar(200);index" json:"position_name"`          // 岗位名称
	DepartmentCode   string    `gorm:"type:varchar(50);index" json:"department_code"`         // 单位代码
	DepartmentName   string    `gorm:"type:varchar(200);index" json:"department_name"`        // 招录单位
	Year             int       `gorm:"index" json:"year"`                                     // 招录年份
	RecruitCount     int       `gorm:"default:0" json:"recruit_count"`                        // 招录人数
	ApplyCount       int       `gorm:"default:0" json:"apply_count"`                          // 报名人数
	PassCount        int       `gorm:"default:0" json:"pass_count"`                           // 过审人数
	CompetitionRatio float64   `gorm:"type:decimal(10,2);default:0" json:"competition_ratio"` // 竞争比
	InterviewScore   float64   `gorm:"type:decimal(5,2);default:0" json:"interview_score"`    // 进面分数线
	WrittenScore     float64   `gorm:"type:decimal(5,2);default:0" json:"written_score"`      // 笔试分数线
	FinalScore       float64   `gorm:"type:decimal(5,2);default:0" json:"final_score"`        // 最终录取分数线
	ExamType         string    `gorm:"type:varchar(50);index" json:"exam_type"`               // 考试类型
	ExamCategory     string    `gorm:"type:varchar(50)" json:"exam_category"`                 // 考试分类(A/B/C类)
	Province         string    `gorm:"type:varchar(50);index" json:"province"`                // 省份
	City             string    `gorm:"type:varchar(50);index" json:"city"`                    // 城市
	District         string    `gorm:"type:varchar(50)" json:"district"`                      // 区县
	DepartmentLevel  string    `gorm:"type:varchar(50)" json:"department_level"`              // 单位层级
	Education        string    `gorm:"type:varchar(50)" json:"education"`                     // 学历要求
	Source           string    `gorm:"type:varchar(100)" json:"source"`                       // 数据来源
	SourceURL        string    `gorm:"type:varchar(500)" json:"source_url"`                   // 来源链接
	Remark           string    `gorm:"type:text" json:"remark"`                               // 备注
	CreatedAt        time.Time `json:"created_at"`
	UpdatedAt        time.Time `json:"updated_at"`
}

func (PositionHistory) TableName() string {
	return "what_position_history"
}

// PositionHistoryResponse 历年数据响应
type PositionHistoryResponse struct {
	ID               uint    `json:"id"`
	PositionCode     string  `json:"position_code"`
	PositionName     string  `json:"position_name"`
	DepartmentCode   string  `json:"department_code"`
	DepartmentName   string  `json:"department_name"`
	Year             int     `json:"year"`
	RecruitCount     int     `json:"recruit_count"`
	ApplyCount       int     `json:"apply_count"`
	PassCount        int     `json:"pass_count"`
	CompetitionRatio float64 `json:"competition_ratio"`
	InterviewScore   float64 `json:"interview_score"`
	WrittenScore     float64 `json:"written_score"`
	FinalScore       float64 `json:"final_score"`
	ExamType         string  `json:"exam_type"`
	ExamCategory     string  `json:"exam_category"`
	Province         string  `json:"province"`
	City             string  `json:"city"`
	DepartmentLevel  string  `json:"department_level"`
	Education        string  `json:"education"`
	Source           string  `json:"source"`
}

// ToResponse 转换为响应结构
func (h *PositionHistory) ToResponse() *PositionHistoryResponse {
	return &PositionHistoryResponse{
		ID:               h.ID,
		PositionCode:     h.PositionCode,
		PositionName:     h.PositionName,
		DepartmentCode:   h.DepartmentCode,
		DepartmentName:   h.DepartmentName,
		Year:             h.Year,
		RecruitCount:     h.RecruitCount,
		ApplyCount:       h.ApplyCount,
		PassCount:        h.PassCount,
		CompetitionRatio: h.CompetitionRatio,
		InterviewScore:   h.InterviewScore,
		WrittenScore:     h.WrittenScore,
		FinalScore:       h.FinalScore,
		ExamType:         h.ExamType,
		ExamCategory:     h.ExamCategory,
		Province:         h.Province,
		City:             h.City,
		DepartmentLevel:  h.DepartmentLevel,
		Education:        h.Education,
		Source:           h.Source,
	}
}

// PositionHistoryBriefResponse 历年数据简要响应（列表用）
type PositionHistoryBriefResponse struct {
	ID               uint    `json:"id"`
	PositionName     string  `json:"position_name"`
	DepartmentName   string  `json:"department_name"`
	Year             int     `json:"year"`
	RecruitCount     int     `json:"recruit_count"`
	ApplyCount       int     `json:"apply_count"`
	CompetitionRatio float64 `json:"competition_ratio"`
	InterviewScore   float64 `json:"interview_score"`
	Province         string  `json:"province"`
	ExamType         string  `json:"exam_type"`
}

// ToBriefResponse 转换为简要响应
func (h *PositionHistory) ToBriefResponse() *PositionHistoryBriefResponse {
	return &PositionHistoryBriefResponse{
		ID:               h.ID,
		PositionName:     h.PositionName,
		DepartmentName:   h.DepartmentName,
		Year:             h.Year,
		RecruitCount:     h.RecruitCount,
		ApplyCount:       h.ApplyCount,
		CompetitionRatio: h.CompetitionRatio,
		InterviewScore:   h.InterviewScore,
		Province:         h.Province,
		ExamType:         h.ExamType,
	}
}

// YearlyTrendItem 年度趋势数据项
type YearlyTrendItem struct {
	Year              int     `json:"year"`
	RecruitCount      int     `json:"recruit_count"`
	ApplyCount        int     `json:"apply_count"`
	CompetitionRatio  float64 `json:"competition_ratio"`
	AvgInterviewScore float64 `json:"avg_interview_score"`
	AvgWrittenScore   float64 `json:"avg_written_score"`
}

// ScoreLinePrediction 分数线预测结果
type ScoreLinePrediction struct {
	PredictedScore   float64   `json:"predicted_score"`   // 预测分数
	ConfidenceLow    float64   `json:"confidence_low"`    // 置信区间下限
	ConfidenceHigh   float64   `json:"confidence_high"`   // 置信区间上限
	ConfidenceLevel  float64   `json:"confidence_level"`  // 置信度 (0-1)
	HistoricalScores []float64 `json:"historical_scores"` // 历年分数
	HistoricalYears  []int     `json:"historical_years"`  // 历年年份
	Basis            string    `json:"basis"`             // 预测依据
}

// AggregatedHistoryStats 聚合历史统计
type AggregatedHistoryStats struct {
	TotalRecords      int64   `json:"total_records"`
	AvgRecruitCount   float64 `json:"avg_recruit_count"`
	AvgCompetition    float64 `json:"avg_competition"`
	AvgInterviewScore float64 `json:"avg_interview_score"`
	AvgWrittenScore   float64 `json:"avg_written_score"`
	MinYear           int     `json:"min_year"`
	MaxYear           int     `json:"max_year"`
}
