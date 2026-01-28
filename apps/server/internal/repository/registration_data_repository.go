package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type RegistrationDataRepository struct {
	db *gorm.DB
}

func NewRegistrationDataRepository(db *gorm.DB) *RegistrationDataRepository {
	return &RegistrationDataRepository{db: db}
}

// Create 创建报名数据快照
func (r *RegistrationDataRepository) Create(data *model.PositionRegistrationData) error {
	return r.db.Create(data).Error
}

// BatchCreate 批量创建报名数据快照
func (r *RegistrationDataRepository) BatchCreate(data []model.PositionRegistrationData) error {
	return r.db.CreateInBatches(data, 100).Error
}

// GetByPositionID 根据职位ID获取报名数据历史
func (r *RegistrationDataRepository) GetByPositionID(positionID string, limit int) ([]model.PositionRegistrationData, error) {
	var data []model.PositionRegistrationData
	query := r.db.Where("position_id = ?", positionID).Order("snapshot_date DESC")
	if limit > 0 {
		query = query.Limit(limit)
	}
	err := query.Find(&data).Error
	return data, err
}

// GetByDateRange 获取日期范围内的报名数据
func (r *RegistrationDataRepository) GetByDateRange(startDate, endDate time.Time) ([]model.PositionRegistrationData, error) {
	var data []model.PositionRegistrationData
	err := r.db.Where("snapshot_date >= ? AND snapshot_date <= ?", startDate, endDate).
		Order("snapshot_date DESC").
		Find(&data).Error
	return data, err
}

// GetLatestByPositionID 获取职位最新的报名数据
func (r *RegistrationDataRepository) GetLatestByPositionID(positionID string) (*model.PositionRegistrationData, error) {
	var data model.PositionRegistrationData
	err := r.db.Where("position_id = ?", positionID).
		Order("snapshot_date DESC, snapshot_time DESC").
		First(&data).Error
	if err != nil {
		return nil, err
	}
	return &data, nil
}

// GetOverview 获取报名数据总览
func (r *RegistrationDataRepository) GetOverview() (*model.RegistrationOverview, error) {
	var overview model.RegistrationOverview

	// 从职位表获取最新统计数据
	r.db.Model(&model.Position{}).
		Where("status = ?", model.PositionStatusPublished).
		Select("COALESCE(SUM(applicant_count), 0) as total_applicants, COALESCE(SUM(pass_count), 0) as total_pass_count").
		Scan(&overview)

	// 平均竞争比
	r.db.Model(&model.Position{}).
		Where("status = ? AND competition_ratio > 0", model.PositionStatusPublished).
		Select("COALESCE(AVG(competition_ratio), 0) as avg_competition_ratio").
		Scan(&overview)

	// 最高竞争比
	r.db.Model(&model.Position{}).
		Where("status = ?", model.PositionStatusPublished).
		Select("COALESCE(MAX(competition_ratio), 0) as max_competition_ratio").
		Scan(&overview)

	// 无人报考职位数
	r.db.Model(&model.Position{}).
		Where("status = ? AND applicant_count = 0", model.PositionStatusPublished).
		Count(&overview.NoApplicantCount)

	// 低竞争比职位数（<10:1）
	r.db.Model(&model.Position{}).
		Where("status = ? AND competition_ratio > 0 AND competition_ratio < 10", model.PositionStatusPublished).
		Count(&overview.LowCompetitionCount)

	// 高竞争比职位数（>100:1）
	r.db.Model(&model.Position{}).
		Where("status = ? AND competition_ratio > 100", model.PositionStatusPublished).
		Count(&overview.HighCompetitionCount)

	return &overview, nil
}

// GetHotPositionsByApplyCount 获取报名人数TOP N职位
func (r *RegistrationDataRepository) GetHotPositionsByApplyCount(limit int) ([]model.PositionHotRank, error) {
	var results []model.PositionHotRank

	err := r.db.Model(&model.Position{}).
		Select("position_id, position_name, department_name, applicant_count as apply_count, pass_count, competition_ratio, recruit_count, province, city").
		Where("status = ? AND applicant_count > 0", model.PositionStatusPublished).
		Order("applicant_count DESC").
		Limit(limit).
		Find(&results).Error

	return results, err
}

// GetHotPositionsByCompetitionRatio 获取竞争比TOP N职位
func (r *RegistrationDataRepository) GetHotPositionsByCompetitionRatio(limit int) ([]model.PositionHotRank, error) {
	var results []model.PositionHotRank

	err := r.db.Model(&model.Position{}).
		Select("position_id, position_name, department_name, applicant_count as apply_count, pass_count, competition_ratio, recruit_count, province, city").
		Where("status = ? AND competition_ratio > 0", model.PositionStatusPublished).
		Order("competition_ratio DESC").
		Limit(limit).
		Find(&results).Error

	return results, err
}

// GetNoApplicantPositions 获取无人报考职位
func (r *RegistrationDataRepository) GetNoApplicantPositions(page, pageSize int) ([]model.ColdPosition, int64, error) {
	var results []model.ColdPosition
	var total int64

	query := r.db.Model(&model.Position{}).
		Where("status = ? AND applicant_count = 0", model.PositionStatusPublished)

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.
		Select("position_id, position_name, department_name, applicant_count as apply_count, pass_count, competition_ratio, recruit_count, province, city, education, is_unlimited_major").
		Order("recruit_count DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&results).Error

	return results, total, err
}

// GetLowCompetitionPositions 获取低竞争比职位（<10:1）
func (r *RegistrationDataRepository) GetLowCompetitionPositions(maxRatio float64, page, pageSize int) ([]model.ColdPosition, int64, error) {
	var results []model.ColdPosition
	var total int64

	query := r.db.Model(&model.Position{}).
		Where("status = ? AND competition_ratio > 0 AND competition_ratio < ?", model.PositionStatusPublished, maxRatio)

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.
		Select("position_id, position_name, department_name, applicant_count as apply_count, pass_count, competition_ratio, recruit_count, province, city, education, is_unlimited_major").
		Order("competition_ratio ASC").
		Offset(offset).
		Limit(pageSize).
		Find(&results).Error

	return results, total, err
}

// GetRegistrationTrends 获取报名趋势（按日期聚合）
func (r *RegistrationDataRepository) GetRegistrationTrends(days int) ([]model.RegistrationTrend, error) {
	var results []model.RegistrationTrend

	startDate := time.Now().AddDate(0, 0, -days)

	err := r.db.Model(&model.PositionRegistrationData{}).
		Select(`
			DATE(snapshot_date) as date,
			SUM(apply_count) as total_apply,
			AVG(competition_ratio) as avg_competition
		`).
		Where("snapshot_date >= ?", startDate).
		Group("DATE(snapshot_date)").
		Order("date ASC").
		Find(&results).Error

	// 计算每日增量
	for i := 1; i < len(results); i++ {
		results[i].DailyIncrement = results[i].TotalApply - results[i-1].TotalApply
	}

	return results, err
}

// GetPositionTrends 获取单个职位的报名趋势
func (r *RegistrationDataRepository) GetPositionTrends(positionID string, days int) ([]model.PositionRegistrationTrend, error) {
	var results []model.PositionRegistrationTrend

	startDate := time.Now().AddDate(0, 0, -days)

	err := r.db.Model(&model.PositionRegistrationData{}).
		Select("DATE(snapshot_date) as date, apply_count, pass_count, competition_ratio").
		Where("position_id = ? AND snapshot_date >= ?", positionID, startDate).
		Order("date ASC").
		Find(&results).Error

	// 计算每日增量
	for i := 1; i < len(results); i++ {
		results[i].DailyIncrement = results[i].ApplyCount - results[i-1].ApplyCount
	}

	return results, err
}

// GetStatsByProvince 按省份统计报名数据
func (r *RegistrationDataRepository) GetStatsByProvince() ([]ProvinceRegistrationStats, error) {
	var results []ProvinceRegistrationStats

	err := r.db.Model(&model.Position{}).
		Select(`
			province,
			COUNT(*) as position_count,
			COALESCE(SUM(recruit_count), 0) as total_recruit,
			COALESCE(SUM(applicant_count), 0) as total_applicants,
			COALESCE(AVG(competition_ratio), 0) as avg_competition
		`).
		Where("status = ? AND province != ''", model.PositionStatusPublished).
		Group("province").
		Order("total_applicants DESC").
		Find(&results).Error

	return results, err
}

// GetStatsByExamType 按考试类型统计报名数据
func (r *RegistrationDataRepository) GetStatsByExamType() ([]ExamTypeRegistrationStats, error) {
	var results []ExamTypeRegistrationStats

	err := r.db.Model(&model.Position{}).
		Select(`
			exam_type,
			COUNT(*) as position_count,
			COALESCE(SUM(recruit_count), 0) as total_recruit,
			COALESCE(SUM(applicant_count), 0) as total_applicants,
			COALESCE(AVG(competition_ratio), 0) as avg_competition
		`).
		Where("status = ? AND exam_type != ''", model.PositionStatusPublished).
		Group("exam_type").
		Order("total_applicants DESC").
		Find(&results).Error

	return results, err
}

// DeleteByDate 删除指定日期前的数据
func (r *RegistrationDataRepository) DeleteByDate(beforeDate time.Time) error {
	return r.db.Where("snapshot_date < ?", beforeDate).Delete(&model.PositionRegistrationData{}).Error
}

// ProvinceRegistrationStats 按省份的报名统计
type ProvinceRegistrationStats struct {
	Province        string  `json:"province"`
	PositionCount   int64   `json:"position_count"`
	TotalRecruit    int64   `json:"total_recruit"`
	TotalApplicants int64   `json:"total_applicants"`
	AvgCompetition  float64 `json:"avg_competition"`
}

// ExamTypeRegistrationStats 按考试类型的报名统计
type ExamTypeRegistrationStats struct {
	ExamType        string  `json:"exam_type"`
	PositionCount   int64   `json:"position_count"`
	TotalRecruit    int64   `json:"total_recruit"`
	TotalApplicants int64   `json:"total_applicants"`
	AvgCompetition  float64 `json:"avg_competition"`
}
