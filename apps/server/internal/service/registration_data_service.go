package service

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

type RegistrationDataService struct {
	regDataRepo  *repository.RegistrationDataRepository
	positionRepo *repository.PositionRepository
}

func NewRegistrationDataService(regDataRepo *repository.RegistrationDataRepository, positionRepo *repository.PositionRepository) *RegistrationDataService {
	return &RegistrationDataService{
		regDataRepo:  regDataRepo,
		positionRepo: positionRepo,
	}
}

// =====================================================
// 响应结构体
// =====================================================

// RegistrationDataOverviewResponse 报名数据总览响应
type RegistrationDataOverviewResponse struct {
	Overview              *model.RegistrationOverview `json:"overview"`
	TopByApplyCount       []model.PositionHotRank     `json:"top_by_apply_count"`
	TopByCompetitionRatio []model.PositionHotRank     `json:"top_by_competition_ratio"`
}

// ColdPositionsResponse 冷门职位响应
type ColdPositionsResponse struct {
	Positions []model.ColdPosition `json:"positions"`
	Total     int64                `json:"total"`
	Page      int                  `json:"page"`
	PageSize  int                  `json:"page_size"`
}

// RegistrationTrendsResponse 报名趋势响应
type RegistrationTrendsResponse struct {
	Trends []model.RegistrationTrend `json:"trends"`
}

// RegistrationPositionTrendsResponse 职位报名趋势响应
type RegistrationPositionTrendsResponse struct {
	PositionID string                            `json:"position_id"`
	Trends     []model.PositionRegistrationTrend `json:"trends"`
}

// ProvinceStatsResponse 省份统计响应
type ProvinceRegistrationStatsResponse struct {
	Stats []repository.ProvinceRegistrationStats `json:"stats"`
}

// ExamTypeStatsResponse 考试类型统计响应
type ExamTypeRegistrationStatsResponse struct {
	Stats []repository.ExamTypeRegistrationStats `json:"stats"`
}

// =====================================================
// 服务方法
// =====================================================

// GetOverview 获取报名数据总览
func (s *RegistrationDataService) GetOverview() (*RegistrationDataOverviewResponse, error) {
	overview, err := s.regDataRepo.GetOverview()
	if err != nil {
		return nil, err
	}

	topByApply, err := s.regDataRepo.GetHotPositionsByApplyCount(10)
	if err != nil {
		return nil, err
	}

	topByRatio, err := s.regDataRepo.GetHotPositionsByCompetitionRatio(10)
	if err != nil {
		return nil, err
	}

	return &RegistrationDataOverviewResponse{
		Overview:              overview,
		TopByApplyCount:       topByApply,
		TopByCompetitionRatio: topByRatio,
	}, nil
}

// GetHotPositionsByApplyCount 获取报名人数TOP职位
func (s *RegistrationDataService) GetHotPositionsByApplyCount(limit int) ([]model.PositionHotRank, error) {
	if limit <= 0 {
		limit = 10
	}
	return s.regDataRepo.GetHotPositionsByApplyCount(limit)
}

// GetHotPositionsByCompetitionRatio 获取竞争比TOP职位
func (s *RegistrationDataService) GetHotPositionsByCompetitionRatio(limit int) ([]model.PositionHotRank, error) {
	if limit <= 0 {
		limit = 10
	}
	return s.regDataRepo.GetHotPositionsByCompetitionRatio(limit)
}

// GetNoApplicantPositions 获取无人报考职位
func (s *RegistrationDataService) GetNoApplicantPositions(page, pageSize int) (*ColdPositionsResponse, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	positions, total, err := s.regDataRepo.GetNoApplicantPositions(page, pageSize)
	if err != nil {
		return nil, err
	}

	return &ColdPositionsResponse{
		Positions: positions,
		Total:     total,
		Page:      page,
		PageSize:  pageSize,
	}, nil
}

// GetLowCompetitionPositions 获取低竞争比职位
func (s *RegistrationDataService) GetLowCompetitionPositions(maxRatio float64, page, pageSize int) (*ColdPositionsResponse, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	if maxRatio <= 0 {
		maxRatio = 10.0
	}

	positions, total, err := s.regDataRepo.GetLowCompetitionPositions(maxRatio, page, pageSize)
	if err != nil {
		return nil, err
	}

	return &ColdPositionsResponse{
		Positions: positions,
		Total:     total,
		Page:      page,
		PageSize:  pageSize,
	}, nil
}

// GetRegistrationTrends 获取报名趋势
func (s *RegistrationDataService) GetRegistrationTrends(days int) (*RegistrationTrendsResponse, error) {
	if days <= 0 {
		days = 30
	}

	trends, err := s.regDataRepo.GetRegistrationTrends(days)
	if err != nil {
		return nil, err
	}

	return &RegistrationTrendsResponse{
		Trends: trends,
	}, nil
}

// GetPositionTrends 获取单个职位的报名趋势
func (s *RegistrationDataService) GetPositionTrends(positionID string, days int) (*RegistrationPositionTrendsResponse, error) {
	if days <= 0 {
		days = 30
	}

	trends, err := s.regDataRepo.GetPositionTrends(positionID, days)
	if err != nil {
		return nil, err
	}

	return &RegistrationPositionTrendsResponse{
		PositionID: positionID,
		Trends:     trends,
	}, nil
}

// GetStatsByProvince 按省份统计报名数据
func (s *RegistrationDataService) GetStatsByProvince() (*ProvinceRegistrationStatsResponse, error) {
	stats, err := s.regDataRepo.GetStatsByProvince()
	if err != nil {
		return nil, err
	}

	return &ProvinceRegistrationStatsResponse{
		Stats: stats,
	}, nil
}

// GetStatsByExamType 按考试类型统计报名数据
func (s *RegistrationDataService) GetStatsByExamType() (*ExamTypeRegistrationStatsResponse, error) {
	stats, err := s.regDataRepo.GetStatsByExamType()
	if err != nil {
		return nil, err
	}

	return &ExamTypeRegistrationStatsResponse{
		Stats: stats,
	}, nil
}

// CollectSnapshot 采集报名数据快照
// 这个方法用于定时任务，从职位表采集当前报名数据并保存快照
func (s *RegistrationDataService) CollectSnapshot() error {
	// 获取所有已发布的职位
	positions, err := s.positionRepo.GetAllPublished()
	if err != nil {
		return err
	}

	now := time.Now()
	snapshotDate := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	snapshotTime := now.Format("15:04:05")

	// 创建快照数据
	var snapshots []model.PositionRegistrationData
	for _, pos := range positions {
		snapshot := model.PositionRegistrationData{
			PositionID:       pos.PositionID,
			SnapshotDate:     snapshotDate,
			SnapshotTime:     snapshotTime,
			ApplyCount:       pos.ApplicantCount,
			PassCount:        pos.PassCount,
			CompetitionRatio: pos.CompetitionRatio,
		}
		snapshots = append(snapshots, snapshot)
	}

	// 批量保存
	if len(snapshots) > 0 {
		return s.regDataRepo.BatchCreate(snapshots)
	}

	return nil
}

// CleanOldData 清理旧数据
// 保留最近N天的数据
func (s *RegistrationDataService) CleanOldData(keepDays int) error {
	if keepDays <= 0 {
		keepDays = 90 // 默认保留90天
	}

	cutoffDate := time.Now().AddDate(0, 0, -keepDays)
	return s.regDataRepo.DeleteByDate(cutoffDate)
}
