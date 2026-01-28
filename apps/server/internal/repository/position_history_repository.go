package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type PositionHistoryRepository struct {
	db *gorm.DB
}

func NewPositionHistoryRepository(db *gorm.DB) *PositionHistoryRepository {
	return &PositionHistoryRepository{db: db}
}

// PositionHistoryQueryParams 历年数据查询参数
type PositionHistoryQueryParams struct {
	// 职位筛选
	PositionCode   string `form:"position_code"`
	PositionName   string `form:"position_name"`
	DepartmentCode string `form:"department_code"`
	DepartmentName string `form:"department_name"`

	// 地域筛选
	Province string `form:"province"`
	City     string `form:"city"`

	// 考试筛选
	ExamType     string `form:"exam_type"`
	ExamCategory string `form:"exam_category"`

	// 年份筛选
	Year     int `form:"year"`
	YearFrom int `form:"year_from"`
	YearTo   int `form:"year_to"`

	// 分页排序
	Page      int    `form:"page"`
	PageSize  int    `form:"page_size"`
	SortBy    string `form:"sort_by"`    // year/recruit_count/competition_ratio/interview_score
	SortOrder string `form:"sort_order"` // asc/desc
}

// =====================================================
// 基础 CRUD 操作
// =====================================================

// Create 创建历年数据记录
func (r *PositionHistoryRepository) Create(history *model.PositionHistory) error {
	return r.db.Create(history).Error
}

// BatchCreate 批量创建历年数据记录
func (r *PositionHistoryRepository) BatchCreate(histories []*model.PositionHistory) error {
	return r.db.CreateInBatches(histories, 100).Error
}

// GetByID 根据ID获取记录
func (r *PositionHistoryRepository) GetByID(id uint) (*model.PositionHistory, error) {
	var history model.PositionHistory
	err := r.db.First(&history, id).Error
	if err != nil {
		return nil, err
	}
	return &history, nil
}

// Update 更新记录
func (r *PositionHistoryRepository) Update(history *model.PositionHistory) error {
	return r.db.Save(history).Error
}

// Delete 删除记录
func (r *PositionHistoryRepository) Delete(id uint) error {
	return r.db.Delete(&model.PositionHistory{}, id).Error
}

// =====================================================
// 查询方法
// =====================================================

// GetByPositionCode 根据职位代码获取历年数据
func (r *PositionHistoryRepository) GetByPositionCode(code string) ([]*model.PositionHistory, error) {
	var histories []*model.PositionHistory
	err := r.db.Where("position_code = ?", code).Order("year DESC").Find(&histories).Error
	return histories, err
}

// GetByDepartment 根据单位名称获取历年数据
func (r *PositionHistoryRepository) GetByDepartment(departmentName string) ([]*model.PositionHistory, error) {
	var histories []*model.PositionHistory
	err := r.db.Where("department_name LIKE ?", "%"+departmentName+"%").Order("year DESC, position_name ASC").Find(&histories).Error
	return histories, err
}

// GetByDepartmentCode 根据单位代码获取历年数据
func (r *PositionHistoryRepository) GetByDepartmentCode(departmentCode string) ([]*model.PositionHistory, error) {
	var histories []*model.PositionHistory
	err := r.db.Where("department_code = ?", departmentCode).Order("year DESC, position_name ASC").Find(&histories).Error
	return histories, err
}

// List 列表查询
func (r *PositionHistoryRepository) List(params *PositionHistoryQueryParams) ([]*model.PositionHistory, int64, error) {
	var histories []*model.PositionHistory
	var total int64

	query := r.db.Model(&model.PositionHistory{})

	// 职位筛选
	if params.PositionCode != "" {
		query = query.Where("position_code = ?", params.PositionCode)
	}
	if params.PositionName != "" {
		query = query.Where("position_name LIKE ?", "%"+params.PositionName+"%")
	}
	if params.DepartmentCode != "" {
		query = query.Where("department_code = ?", params.DepartmentCode)
	}
	if params.DepartmentName != "" {
		query = query.Where("department_name LIKE ?", "%"+params.DepartmentName+"%")
	}

	// 地域筛选
	if params.Province != "" {
		query = query.Where("province = ?", params.Province)
	}
	if params.City != "" {
		query = query.Where("city = ?", params.City)
	}

	// 考试筛选
	if params.ExamType != "" {
		query = query.Where("exam_type = ?", params.ExamType)
	}
	if params.ExamCategory != "" {
		query = query.Where("exam_category = ?", params.ExamCategory)
	}

	// 年份筛选
	if params.Year > 0 {
		query = query.Where("year = ?", params.Year)
	}
	if params.YearFrom > 0 {
		query = query.Where("year >= ?", params.YearFrom)
	}
	if params.YearTo > 0 {
		query = query.Where("year <= ?", params.YearTo)
	}

	// 计数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 排序
	sortField := "year"
	sortOrder := "DESC"
	if params.SortBy != "" {
		switch params.SortBy {
		case "year", "recruit_count", "competition_ratio", "interview_score", "written_score", "apply_count":
			sortField = params.SortBy
		}
	}
	if params.SortOrder == "asc" {
		sortOrder = "ASC"
	}
	query = query.Order(sortField + " " + sortOrder)

	// 分页
	page := params.Page
	pageSize := params.PageSize
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	if err := query.Offset(offset).Limit(pageSize).Find(&histories).Error; err != nil {
		return nil, 0, err
	}

	return histories, total, nil
}

// =====================================================
// 趋势和统计方法
// =====================================================

// GetYearlyTrend 获取年度趋势数据
func (r *PositionHistoryRepository) GetYearlyTrend(positionCode string) ([]model.YearlyTrendItem, error) {
	var results []model.YearlyTrendItem

	query := r.db.Model(&model.PositionHistory{}).
		Select(`
			year,
			SUM(recruit_count) as recruit_count,
			SUM(apply_count) as apply_count,
			AVG(CASE WHEN competition_ratio > 0 THEN competition_ratio END) as competition_ratio,
			AVG(CASE WHEN interview_score > 0 THEN interview_score END) as avg_interview_score,
			AVG(CASE WHEN written_score > 0 THEN written_score END) as avg_written_score
		`).
		Group("year").
		Order("year ASC")

	if positionCode != "" {
		query = query.Where("position_code = ?", positionCode)
	}

	err := query.Find(&results).Error
	return results, err
}

// GetDepartmentYearlyTrend 获取单位年度趋势数据
func (r *PositionHistoryRepository) GetDepartmentYearlyTrend(departmentCode string) ([]model.YearlyTrendItem, error) {
	var results []model.YearlyTrendItem

	err := r.db.Model(&model.PositionHistory{}).
		Select(`
			year,
			SUM(recruit_count) as recruit_count,
			SUM(apply_count) as apply_count,
			AVG(CASE WHEN competition_ratio > 0 THEN competition_ratio END) as competition_ratio,
			AVG(CASE WHEN interview_score > 0 THEN interview_score END) as avg_interview_score,
			AVG(CASE WHEN written_score > 0 THEN written_score END) as avg_written_score
		`).
		Where("department_code = ?", departmentCode).
		Group("year").
		Order("year ASC").
		Find(&results).Error

	return results, err
}

// GetRegionYearlyTrend 获取地区年度趋势数据
func (r *PositionHistoryRepository) GetRegionYearlyTrend(examType, province string) ([]model.YearlyTrendItem, error) {
	var results []model.YearlyTrendItem

	query := r.db.Model(&model.PositionHistory{}).
		Select(`
			year,
			SUM(recruit_count) as recruit_count,
			SUM(apply_count) as apply_count,
			AVG(CASE WHEN competition_ratio > 0 THEN competition_ratio END) as competition_ratio,
			AVG(CASE WHEN interview_score > 0 THEN interview_score END) as avg_interview_score,
			AVG(CASE WHEN written_score > 0 THEN written_score END) as avg_written_score
		`).
		Group("year").
		Order("year ASC")

	if examType != "" {
		query = query.Where("exam_type = ?", examType)
	}
	if province != "" {
		query = query.Where("province = ?", province)
	}

	err := query.Find(&results).Error
	return results, err
}

// GetAverageScoreLine 获取平均分数线
func (r *PositionHistoryRepository) GetAverageScoreLine(examType, province string, years int) (float64, float64, error) {
	var result struct {
		AvgInterview float64
		AvgWritten   float64
	}

	query := r.db.Model(&model.PositionHistory{}).
		Select(`
			AVG(CASE WHEN interview_score > 0 THEN interview_score END) as avg_interview,
			AVG(CASE WHEN written_score > 0 THEN written_score END) as avg_written
		`)

	if examType != "" {
		query = query.Where("exam_type = ?", examType)
	}
	if province != "" {
		query = query.Where("province = ?", province)
	}
	if years > 0 {
		currentYear := time.Now().Year()
		query = query.Where("year >= ?", currentYear-years)
	}

	err := query.Scan(&result).Error
	return result.AvgInterview, result.AvgWritten, err
}

// GetHistoricalScores 获取历年分数线
func (r *PositionHistoryRepository) GetHistoricalScores(positionCode string, limit int) ([]float64, []int, error) {
	type ScoreYear struct {
		Score float64
		Year  int
	}
	var results []ScoreYear

	query := r.db.Model(&model.PositionHistory{}).
		Select("interview_score as score, year").
		Where("position_code = ? AND interview_score > 0", positionCode).
		Order("year DESC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	if err := query.Find(&results).Error; err != nil {
		return nil, nil, err
	}

	scores := make([]float64, len(results))
	years := make([]int, len(results))
	for i, r := range results {
		scores[i] = r.Score
		years[i] = r.Year
	}

	return scores, years, nil
}

// GetAggregatedStats 获取聚合统计
func (r *PositionHistoryRepository) GetAggregatedStats(examType, province string) (*model.AggregatedHistoryStats, error) {
	var stats model.AggregatedHistoryStats

	query := r.db.Model(&model.PositionHistory{}).
		Select(`
			COUNT(*) as total_records,
			AVG(recruit_count) as avg_recruit_count,
			AVG(CASE WHEN competition_ratio > 0 THEN competition_ratio END) as avg_competition,
			AVG(CASE WHEN interview_score > 0 THEN interview_score END) as avg_interview_score,
			AVG(CASE WHEN written_score > 0 THEN written_score END) as avg_written_score,
			MIN(year) as min_year,
			MAX(year) as max_year
		`)

	if examType != "" {
		query = query.Where("exam_type = ?", examType)
	}
	if province != "" {
		query = query.Where("province = ?", province)
	}

	err := query.Scan(&stats).Error
	return &stats, err
}

// =====================================================
// 筛选选项方法
// =====================================================

// GetYears 获取所有年份
func (r *PositionHistoryRepository) GetYears() ([]int, error) {
	var years []int
	err := r.db.Model(&model.PositionHistory{}).
		Distinct("year").
		Order("year DESC").
		Pluck("year", &years).Error
	return years, err
}

// GetProvinces 获取所有省份
func (r *PositionHistoryRepository) GetProvinces() ([]string, error) {
	var provinces []string
	err := r.db.Model(&model.PositionHistory{}).
		Distinct("province").
		Where("province != ''").
		Pluck("province", &provinces).Error
	return provinces, err
}

// GetExamTypes 获取所有考试类型
func (r *PositionHistoryRepository) GetExamTypes() ([]string, error) {
	var examTypes []string
	err := r.db.Model(&model.PositionHistory{}).
		Distinct("exam_type").
		Where("exam_type != ''").
		Pluck("exam_type", &examTypes).Error
	return examTypes, err
}

// =====================================================
// 统计方法
// =====================================================

// YearStats 年份统计
type YearStats struct {
	Year         int   `json:"year"`
	Count        int64 `json:"count"`
	RecruitCount int64 `json:"recruit_count"`
}

// GetStatsByYear 按年份统计
func (r *PositionHistoryRepository) GetStatsByYear() ([]YearStats, error) {
	var results []YearStats

	err := r.db.Model(&model.PositionHistory{}).
		Select("year, COUNT(*) as count, COALESCE(SUM(recruit_count), 0) as recruit_count").
		Group("year").
		Order("year DESC").
		Find(&results).Error

	return results, err
}

// ProvinceHistoryStats 省份历史统计
type ProvinceHistoryStats struct {
	Province       string  `json:"province"`
	TotalRecords   int64   `json:"total_records"`
	TotalRecruit   int64   `json:"total_recruit"`
	AvgCompetition float64 `json:"avg_competition"`
}

// GetStatsByProvince 按省份统计
func (r *PositionHistoryRepository) GetStatsByProvince() ([]ProvinceHistoryStats, error) {
	var results []ProvinceHistoryStats

	err := r.db.Model(&model.PositionHistory{}).
		Select(`
			province,
			COUNT(*) as total_records,
			COALESCE(SUM(recruit_count), 0) as total_recruit,
			AVG(CASE WHEN competition_ratio > 0 THEN competition_ratio END) as avg_competition
		`).
		Where("province != ''").
		Group("province").
		Order("total_records DESC").
		Find(&results).Error

	return results, err
}

// ExamTypeHistoryStats 考试类型历史统计
type ExamTypeHistoryStats struct {
	ExamType       string  `json:"exam_type"`
	TotalRecords   int64   `json:"total_records"`
	TotalRecruit   int64   `json:"total_recruit"`
	AvgCompetition float64 `json:"avg_competition"`
}

// GetStatsByExamType 按考试类型统计
func (r *PositionHistoryRepository) GetStatsByExamType() ([]ExamTypeHistoryStats, error) {
	var results []ExamTypeHistoryStats

	err := r.db.Model(&model.PositionHistory{}).
		Select(`
			exam_type,
			COUNT(*) as total_records,
			COALESCE(SUM(recruit_count), 0) as total_recruit,
			AVG(CASE WHEN competition_ratio > 0 THEN competition_ratio END) as avg_competition
		`).
		Where("exam_type != ''").
		Group("exam_type").
		Order("total_records DESC").
		Find(&results).Error

	return results, err
}

// =====================================================
// 存在性检查
// =====================================================

// Exists 检查记录是否存在
func (r *PositionHistoryRepository) Exists(positionCode string, year int) (bool, error) {
	var count int64
	err := r.db.Model(&model.PositionHistory{}).
		Where("position_code = ? AND year = ?", positionCode, year).
		Count(&count).Error
	return count > 0, err
}

// BatchUpsert 批量更新或插入
func (r *PositionHistoryRepository) BatchUpsert(histories []*model.PositionHistory) error {
	for _, h := range histories {
		exists, err := r.Exists(h.PositionCode, h.Year)
		if err != nil {
			return err
		}
		if exists {
			// 更新现有记录
			if err := r.db.Model(&model.PositionHistory{}).
				Where("position_code = ? AND year = ?", h.PositionCode, h.Year).
				Updates(h).Error; err != nil {
				return err
			}
		} else {
			// 创建新记录
			if err := r.db.Create(h).Error; err != nil {
				return err
			}
		}
	}
	return nil
}
