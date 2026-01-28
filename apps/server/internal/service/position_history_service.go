package service

import (
	"errors"
	"math"
	"sort"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrHistoryNotFound     = errors.New("history record not found")
	ErrInsufficientData    = errors.New("insufficient data for prediction")
	ErrInvalidPositionCode = errors.New("invalid position code")
	ErrInvalidDepartment   = errors.New("invalid department")
)

type PositionHistoryService struct {
	historyRepo  *repository.PositionHistoryRepository
	positionRepo *repository.PositionRepository
}

func NewPositionHistoryService(historyRepo *repository.PositionHistoryRepository, positionRepo *repository.PositionRepository) *PositionHistoryService {
	return &PositionHistoryService{
		historyRepo:  historyRepo,
		positionRepo: positionRepo,
	}
}

// =====================================================
// 请求和响应结构体
// =====================================================

// HistoryListResponse 历年数据列表响应
type HistoryListResponse struct {
	Histories []*model.PositionHistoryBriefResponse `json:"histories"`
	Total     int64                                 `json:"total"`
	Page      int                                   `json:"page"`
	PageSize  int                                   `json:"page_size"`
}

// YearlyTrendResponse 年度趋势响应
type YearlyTrendResponse struct {
	Trends []model.YearlyTrendItem `json:"trends"`
}

// ScoreLineResponse 分数线响应
type ScoreLineResponse struct {
	AvgInterviewScore float64 `json:"avg_interview_score"`
	AvgWrittenScore   float64 `json:"avg_written_score"`
	ExamType          string  `json:"exam_type"`
	Province          string  `json:"province"`
	Years             int     `json:"years"`
}

// HistoryStatsResponse 历史统计响应
type HistoryStatsResponse struct {
	TotalRecords      int64   `json:"total_records"`
	AvgRecruitCount   float64 `json:"avg_recruit_count"`
	AvgCompetition    float64 `json:"avg_competition"`
	AvgInterviewScore float64 `json:"avg_interview_score"`
	AvgWrittenScore   float64 `json:"avg_written_score"`
	MinYear           int     `json:"min_year"`
	MaxYear           int     `json:"max_year"`
}

// HistoryFilterOptionsResponse 历史数据筛选选项响应
type HistoryFilterOptionsResponse struct {
	Years     []int    `json:"years"`
	Provinces []string `json:"provinces"`
	ExamTypes []string `json:"exam_types"`
}

// ImportHistoryRequest 导入历史数据请求
type ImportHistoryRequest struct {
	Histories []*model.PositionHistory `json:"histories"`
}

// CreateHistoryRequest 创建历史记录请求
type CreateHistoryRequest struct {
	PositionCode     string  `json:"position_code" validate:"required"`
	PositionName     string  `json:"position_name" validate:"required"`
	DepartmentCode   string  `json:"department_code"`
	DepartmentName   string  `json:"department_name" validate:"required"`
	Year             int     `json:"year" validate:"required,min=1990,max=2100"`
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
	District         string  `json:"district"`
	DepartmentLevel  string  `json:"department_level"`
	Education        string  `json:"education"`
	Source           string  `json:"source"`
	SourceURL        string  `json:"source_url"`
	Remark           string  `json:"remark"`
}

// =====================================================
// 查询方法
// =====================================================

// GetPositionHistory 获取职位历年数据
func (s *PositionHistoryService) GetPositionHistory(positionCode string) ([]*model.PositionHistoryResponse, error) {
	if positionCode == "" {
		return nil, ErrInvalidPositionCode
	}

	histories, err := s.historyRepo.GetByPositionCode(positionCode)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.PositionHistoryResponse, len(histories))
	for i, h := range histories {
		responses[i] = h.ToResponse()
	}

	return responses, nil
}

// GetDepartmentHistory 获取单位历年数据
func (s *PositionHistoryService) GetDepartmentHistory(deptName string) ([]*model.PositionHistoryResponse, error) {
	if deptName == "" {
		return nil, ErrInvalidDepartment
	}

	histories, err := s.historyRepo.GetByDepartment(deptName)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.PositionHistoryResponse, len(histories))
	for i, h := range histories {
		responses[i] = h.ToResponse()
	}

	return responses, nil
}

// ListHistories 列表查询历年数据
func (s *PositionHistoryService) ListHistories(params *repository.PositionHistoryQueryParams) (*HistoryListResponse, error) {
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}

	histories, total, err := s.historyRepo.List(params)
	if err != nil {
		return nil, err
	}

	briefHistories := make([]*model.PositionHistoryBriefResponse, len(histories))
	for i, h := range histories {
		briefHistories[i] = h.ToBriefResponse()
	}

	return &HistoryListResponse{
		Histories: briefHistories,
		Total:     total,
		Page:      params.Page,
		PageSize:  params.PageSize,
	}, nil
}

// GetHistoryByID 根据ID获取历史记录详情
func (s *PositionHistoryService) GetHistoryByID(id uint) (*model.PositionHistoryResponse, error) {
	history, err := s.historyRepo.GetByID(id)
	if err != nil {
		return nil, ErrHistoryNotFound
	}
	return history.ToResponse(), nil
}

// =====================================================
// 趋势分析方法
// =====================================================

// GetYearlyTrend 获取年度趋势
func (s *PositionHistoryService) GetYearlyTrend(positionCode string) (*YearlyTrendResponse, error) {
	trends, err := s.historyRepo.GetYearlyTrend(positionCode)
	if err != nil {
		return nil, err
	}

	return &YearlyTrendResponse{
		Trends: trends,
	}, nil
}

// GetDepartmentYearlyTrend 获取单位年度趋势
func (s *PositionHistoryService) GetDepartmentYearlyTrend(departmentCode string) (*YearlyTrendResponse, error) {
	trends, err := s.historyRepo.GetDepartmentYearlyTrend(departmentCode)
	if err != nil {
		return nil, err
	}

	return &YearlyTrendResponse{
		Trends: trends,
	}, nil
}

// GetRegionYearlyTrend 获取地区年度趋势
func (s *PositionHistoryService) GetRegionYearlyTrend(examType, province string) (*YearlyTrendResponse, error) {
	trends, err := s.historyRepo.GetRegionYearlyTrend(examType, province)
	if err != nil {
		return nil, err
	}

	return &YearlyTrendResponse{
		Trends: trends,
	}, nil
}

// =====================================================
// 分数线分析方法
// =====================================================

// GetAverageScoreLine 获取平均分数线
func (s *PositionHistoryService) GetAverageScoreLine(examType, province string, years int) (*ScoreLineResponse, error) {
	if years <= 0 {
		years = 3 // 默认近3年
	}

	avgInterview, avgWritten, err := s.historyRepo.GetAverageScoreLine(examType, province, years)
	if err != nil {
		return nil, err
	}

	return &ScoreLineResponse{
		AvgInterviewScore: avgInterview,
		AvgWrittenScore:   avgWritten,
		ExamType:          examType,
		Province:          province,
		Years:             years,
	}, nil
}

// PredictScoreLine 预测分数线
// 使用简单线性回归预测
func (s *PositionHistoryService) PredictScoreLine(positionCode string) (*model.ScoreLinePrediction, error) {
	scores, years, err := s.historyRepo.GetHistoricalScores(positionCode, 10)
	if err != nil {
		return nil, err
	}

	if len(scores) < 2 {
		return nil, ErrInsufficientData
	}

	// 反转数据（因为数据库返回是降序）
	for i, j := 0, len(scores)-1; i < j; i, j = i+1, j-1 {
		scores[i], scores[j] = scores[j], scores[i]
		years[i], years[j] = years[j], years[i]
	}

	// 计算线性回归
	n := float64(len(scores))
	var sumX, sumY, sumXY, sumX2 float64

	for i := 0; i < len(scores); i++ {
		x := float64(years[i])
		y := scores[i]
		sumX += x
		sumY += y
		sumXY += x * y
		sumX2 += x * x
	}

	// 斜率和截距
	slope := (n*sumXY - sumX*sumY) / (n*sumX2 - sumX*sumX)
	intercept := (sumY - slope*sumX) / n

	// 预测下一年
	nextYear := years[len(years)-1] + 1
	predictedScore := slope*float64(nextYear) + intercept

	// 计算标准差用于置信区间
	var sumSquaredDiff float64
	for i := 0; i < len(scores); i++ {
		predicted := slope*float64(years[i]) + intercept
		diff := scores[i] - predicted
		sumSquaredDiff += diff * diff
	}
	stdDev := math.Sqrt(sumSquaredDiff / n)

	// 95%置信区间
	confidenceMargin := 1.96 * stdDev

	// 计算置信度（基于R²）
	var ssTotal, ssResidual float64
	avgScore := sumY / n
	for i := 0; i < len(scores); i++ {
		ssTotal += (scores[i] - avgScore) * (scores[i] - avgScore)
		predicted := slope*float64(years[i]) + intercept
		ssResidual += (scores[i] - predicted) * (scores[i] - predicted)
	}
	rSquared := 1 - ssResidual/ssTotal
	if rSquared < 0 {
		rSquared = 0
	}

	// 生成预测依据
	basis := "基于历年数据的线性回归分析"
	if len(scores) >= 5 {
		basis = "基于近" + string(rune('0'+len(scores))) + "年数据的线性回归分析，数据较为充足"
	} else {
		basis = "基于近" + string(rune('0'+len(scores))) + "年数据的线性回归分析，数据量较少，预测可能存在偏差"
	}

	return &model.ScoreLinePrediction{
		PredictedScore:   math.Round(predictedScore*100) / 100,
		ConfidenceLow:    math.Round((predictedScore-confidenceMargin)*100) / 100,
		ConfidenceHigh:   math.Round((predictedScore+confidenceMargin)*100) / 100,
		ConfidenceLevel:  math.Round(rSquared*100) / 100,
		HistoricalScores: scores,
		HistoricalYears:  years,
		Basis:            basis,
	}, nil
}

// PredictScoreLineByPosition 根据当前职位信息预测分数线
func (s *PositionHistoryService) PredictScoreLineByPosition(position *model.Position) (*model.ScoreLinePrediction, error) {
	// 首先尝试根据职位代码预测
	if position.PositionCode != "" {
		prediction, err := s.PredictScoreLine(position.PositionCode)
		if err == nil {
			return prediction, nil
		}
	}

	// 如果没有历史数据，使用同类型职位的平均值
	avgInterview, avgWritten, err := s.historyRepo.GetAverageScoreLine(position.ExamType, position.Province, 3)
	if err != nil {
		return nil, err
	}

	if avgInterview == 0 && avgWritten == 0 {
		return nil, ErrInsufficientData
	}

	return &model.ScoreLinePrediction{
		PredictedScore:   avgInterview,
		ConfidenceLow:    avgInterview * 0.9,
		ConfidenceHigh:   avgInterview * 1.1,
		ConfidenceLevel:  0.5, // 低置信度
		HistoricalScores: nil,
		HistoricalYears:  nil,
		Basis:            "基于同地区同类型职位的历史平均分数线预测",
	}, nil
}

// =====================================================
// 统计方法
// =====================================================

// GetHistoryStats 获取历史数据统计
func (s *PositionHistoryService) GetHistoryStats(examType, province string) (*HistoryStatsResponse, error) {
	stats, err := s.historyRepo.GetAggregatedStats(examType, province)
	if err != nil {
		return nil, err
	}

	return &HistoryStatsResponse{
		TotalRecords:      stats.TotalRecords,
		AvgRecruitCount:   stats.AvgRecruitCount,
		AvgCompetition:    stats.AvgCompetition,
		AvgInterviewScore: stats.AvgInterviewScore,
		AvgWrittenScore:   stats.AvgWrittenScore,
		MinYear:           stats.MinYear,
		MaxYear:           stats.MaxYear,
	}, nil
}

// GetStatsByYear 按年份统计
func (s *PositionHistoryService) GetStatsByYear() ([]repository.YearStats, error) {
	return s.historyRepo.GetStatsByYear()
}

// GetStatsByProvince 按省份统计
func (s *PositionHistoryService) GetStatsByProvince() ([]repository.ProvinceHistoryStats, error) {
	return s.historyRepo.GetStatsByProvince()
}

// GetStatsByExamType 按考试类型统计
func (s *PositionHistoryService) GetStatsByExamType() ([]repository.ExamTypeHistoryStats, error) {
	return s.historyRepo.GetStatsByExamType()
}

// =====================================================
// 筛选选项方法
// =====================================================

// GetFilterOptions 获取筛选选项
func (s *PositionHistoryService) GetFilterOptions() (*HistoryFilterOptionsResponse, error) {
	years, _ := s.historyRepo.GetYears()
	provinces, _ := s.historyRepo.GetProvinces()
	examTypes, _ := s.historyRepo.GetExamTypes()

	// 按年份降序排序
	sort.Sort(sort.Reverse(sort.IntSlice(years)))

	return &HistoryFilterOptionsResponse{
		Years:     years,
		Provinces: provinces,
		ExamTypes: examTypes,
	}, nil
}

// =====================================================
// 数据管理方法
// =====================================================

// CreateHistory 创建历史记录
func (s *PositionHistoryService) CreateHistory(req *CreateHistoryRequest) (*model.PositionHistoryResponse, error) {
	history := &model.PositionHistory{
		PositionCode:     req.PositionCode,
		PositionName:     req.PositionName,
		DepartmentCode:   req.DepartmentCode,
		DepartmentName:   req.DepartmentName,
		Year:             req.Year,
		RecruitCount:     req.RecruitCount,
		ApplyCount:       req.ApplyCount,
		PassCount:        req.PassCount,
		CompetitionRatio: req.CompetitionRatio,
		InterviewScore:   req.InterviewScore,
		WrittenScore:     req.WrittenScore,
		FinalScore:       req.FinalScore,
		ExamType:         req.ExamType,
		ExamCategory:     req.ExamCategory,
		Province:         req.Province,
		City:             req.City,
		District:         req.District,
		DepartmentLevel:  req.DepartmentLevel,
		Education:        req.Education,
		Source:           req.Source,
		SourceURL:        req.SourceURL,
		Remark:           req.Remark,
	}

	// 自动计算竞争比
	if history.CompetitionRatio == 0 && history.RecruitCount > 0 && history.ApplyCount > 0 {
		history.CompetitionRatio = float64(history.ApplyCount) / float64(history.RecruitCount)
	}

	if err := s.historyRepo.Create(history); err != nil {
		return nil, err
	}

	return history.ToResponse(), nil
}

// UpdateHistory 更新历史记录
func (s *PositionHistoryService) UpdateHistory(id uint, req *CreateHistoryRequest) (*model.PositionHistoryResponse, error) {
	history, err := s.historyRepo.GetByID(id)
	if err != nil {
		return nil, ErrHistoryNotFound
	}

	// 更新字段
	history.PositionCode = req.PositionCode
	history.PositionName = req.PositionName
	history.DepartmentCode = req.DepartmentCode
	history.DepartmentName = req.DepartmentName
	history.Year = req.Year
	history.RecruitCount = req.RecruitCount
	history.ApplyCount = req.ApplyCount
	history.PassCount = req.PassCount
	history.CompetitionRatio = req.CompetitionRatio
	history.InterviewScore = req.InterviewScore
	history.WrittenScore = req.WrittenScore
	history.FinalScore = req.FinalScore
	history.ExamType = req.ExamType
	history.ExamCategory = req.ExamCategory
	history.Province = req.Province
	history.City = req.City
	history.District = req.District
	history.DepartmentLevel = req.DepartmentLevel
	history.Education = req.Education
	history.Source = req.Source
	history.SourceURL = req.SourceURL
	history.Remark = req.Remark

	// 自动计算竞争比
	if history.CompetitionRatio == 0 && history.RecruitCount > 0 && history.ApplyCount > 0 {
		history.CompetitionRatio = float64(history.ApplyCount) / float64(history.RecruitCount)
	}

	if err := s.historyRepo.Update(history); err != nil {
		return nil, err
	}

	return history.ToResponse(), nil
}

// DeleteHistory 删除历史记录
func (s *PositionHistoryService) DeleteHistory(id uint) error {
	return s.historyRepo.Delete(id)
}

// ImportHistoryData 导入历史数据
func (s *PositionHistoryService) ImportHistoryData(data []*model.PositionHistory) error {
	// 自动计算竞争比
	for _, h := range data {
		if h.CompetitionRatio == 0 && h.RecruitCount > 0 && h.ApplyCount > 0 {
			h.CompetitionRatio = float64(h.ApplyCount) / float64(h.RecruitCount)
		}
	}

	return s.historyRepo.BatchUpsert(data)
}

// BatchDeleteHistories 批量删除历史记录
func (s *PositionHistoryService) BatchDeleteHistories(ids []uint) error {
	for _, id := range ids {
		if err := s.historyRepo.Delete(id); err != nil {
			return err
		}
	}
	return nil
}
