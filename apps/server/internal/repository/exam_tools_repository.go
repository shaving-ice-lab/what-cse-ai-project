package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// ExamLocationRepository 考点仓储
type ExamLocationRepository struct {
	db *gorm.DB
}

func NewExamLocationRepository(db *gorm.DB) *ExamLocationRepository {
	return &ExamLocationRepository{db: db}
}

// ExamLocationFilter 考点筛选条件
type ExamLocationFilter struct {
	Province string `query:"province"`
	City     string `query:"city"`
	ExamType string `query:"exam_type"`
	Keyword  string `query:"keyword"`
}

func (r *ExamLocationRepository) Create(location *model.ExamLocation) error {
	return r.db.Create(location).Error
}

func (r *ExamLocationRepository) FindByID(id uint) (*model.ExamLocation, error) {
	var location model.ExamLocation
	err := r.db.First(&location, id).Error
	if err != nil {
		return nil, err
	}
	return &location, nil
}

func (r *ExamLocationRepository) Update(location *model.ExamLocation) error {
	return r.db.Save(location).Error
}

func (r *ExamLocationRepository) Delete(id uint) error {
	return r.db.Delete(&model.ExamLocation{}, id).Error
}

func (r *ExamLocationRepository) List(filter *ExamLocationFilter, page, pageSize int) ([]model.ExamLocation, int64, error) {
	var locations []model.ExamLocation
	var total int64

	query := r.db.Model(&model.ExamLocation{}).Where("is_active = ?", true)

	if filter != nil {
		if filter.Province != "" {
			query = query.Where("province = ?", filter.Province)
		}
		if filter.City != "" {
			query = query.Where("city = ?", filter.City)
		}
		if filter.ExamType != "" {
			query = query.Where("exam_type = ?", filter.ExamType)
		}
		if filter.Keyword != "" {
			keyword := "%" + filter.Keyword + "%"
			query = query.Where("name LIKE ? OR address LIKE ?", keyword, keyword)
		}
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Order("province, city, name").Offset(offset).Limit(pageSize).Find(&locations).Error
	if err != nil {
		return nil, 0, err
	}

	return locations, total, nil
}

func (r *ExamLocationRepository) ListByProvince(province string) ([]model.ExamLocation, error) {
	var locations []model.ExamLocation
	err := r.db.Where("province = ? AND is_active = ?", province, true).
		Order("city, name").
		Find(&locations).Error
	if err != nil {
		return nil, err
	}
	return locations, nil
}

func (r *ExamLocationRepository) ListByCity(province, city string) ([]model.ExamLocation, error) {
	var locations []model.ExamLocation
	err := r.db.Where("province = ? AND city = ? AND is_active = ?", province, city, true).
		Order("name").
		Find(&locations).Error
	if err != nil {
		return nil, err
	}
	return locations, nil
}

func (r *ExamLocationRepository) GetProvinces() ([]string, error) {
	var provinces []string
	err := r.db.Model(&model.ExamLocation{}).
		Where("is_active = ?", true).
		Distinct("province").
		Order("province").
		Pluck("province", &provinces).Error
	if err != nil {
		return nil, err
	}
	return provinces, nil
}

func (r *ExamLocationRepository) GetCities(province string) ([]string, error) {
	var cities []string
	err := r.db.Model(&model.ExamLocation{}).
		Where("province = ? AND is_active = ?", province, true).
		Distinct("city").
		Order("city").
		Pluck("city", &cities).Error
	if err != nil {
		return nil, err
	}
	return cities, nil
}

func (r *ExamLocationRepository) Search(keyword string, limit int) ([]model.ExamLocation, error) {
	var locations []model.ExamLocation
	err := r.db.Where("is_active = ?", true).
		Where("name LIKE ? OR address LIKE ?", "%"+keyword+"%", "%"+keyword+"%").
		Limit(limit).
		Find(&locations).Error
	if err != nil {
		return nil, err
	}
	return locations, nil
}

func (r *ExamLocationRepository) FindNearby(lat, lng float64, radiusKm float64, limit int) ([]model.ExamLocation, error) {
	var locations []model.ExamLocation
	// 使用 Haversine 公式计算距离
	err := r.db.Raw(`
		SELECT *, 
			(6371 * acos(cos(radians(?)) * cos(radians(latitude)) * cos(radians(longitude) - radians(?)) + sin(radians(?)) * sin(radians(latitude)))) AS distance 
		FROM what_exam_locations 
		WHERE is_active = 1 AND deleted_at IS NULL
		HAVING distance < ? 
		ORDER BY distance 
		LIMIT ?
	`, lat, lng, lat, radiusKm, limit).Scan(&locations).Error
	if err != nil {
		return nil, err
	}
	return locations, nil
}

// ScoreEstimateRepository 估分仓储
type ScoreEstimateRepository struct {
	db *gorm.DB
}

func NewScoreEstimateRepository(db *gorm.DB) *ScoreEstimateRepository {
	return &ScoreEstimateRepository{db: db}
}

func (r *ScoreEstimateRepository) Create(estimate *model.ScoreEstimate) error {
	return r.db.Create(estimate).Error
}

func (r *ScoreEstimateRepository) FindByID(id uint) (*model.ScoreEstimate, error) {
	var estimate model.ScoreEstimate
	err := r.db.First(&estimate, id).Error
	if err != nil {
		return nil, err
	}
	return &estimate, nil
}

func (r *ScoreEstimateRepository) FindByUserID(userID uint) ([]model.ScoreEstimate, error) {
	var estimates []model.ScoreEstimate
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&estimates).Error
	if err != nil {
		return nil, err
	}
	return estimates, nil
}

func (r *ScoreEstimateRepository) Update(estimate *model.ScoreEstimate) error {
	return r.db.Save(estimate).Error
}

func (r *ScoreEstimateRepository) Delete(id uint) error {
	return r.db.Delete(&model.ScoreEstimate{}, id).Error
}

// ScoreShareRepository 晒分仓储
type ScoreShareRepository struct {
	db *gorm.DB
}

func NewScoreShareRepository(db *gorm.DB) *ScoreShareRepository {
	return &ScoreShareRepository{db: db}
}

// ScoreShareFilter 晒分筛选条件
type ScoreShareFilter struct {
	ExamType     string `query:"exam_type"`
	ExamYear     int    `query:"exam_year"`
	ExamProvince string `query:"exam_province"`
	PassStatus   string `query:"pass_status"`
	UserID       *uint  `query:"-"`
}

func (r *ScoreShareRepository) Create(share *model.ScoreShare) error {
	return r.db.Create(share).Error
}

func (r *ScoreShareRepository) FindByID(id uint) (*model.ScoreShare, error) {
	var share model.ScoreShare
	err := r.db.First(&share, id).Error
	if err != nil {
		return nil, err
	}
	return &share, nil
}

func (r *ScoreShareRepository) Update(share *model.ScoreShare) error {
	return r.db.Save(share).Error
}

func (r *ScoreShareRepository) Delete(id uint) error {
	return r.db.Delete(&model.ScoreShare{}, id).Error
}

func (r *ScoreShareRepository) List(filter *ScoreShareFilter, page, pageSize int) ([]model.ScoreShare, int64, error) {
	var shares []model.ScoreShare
	var total int64

	query := r.db.Model(&model.ScoreShare{}).Where("status = ?", model.ScoreShareStatusPublic)

	if filter != nil {
		if filter.ExamType != "" {
			query = query.Where("exam_type = ?", filter.ExamType)
		}
		if filter.ExamYear > 0 {
			query = query.Where("exam_year = ?", filter.ExamYear)
		}
		if filter.ExamProvince != "" {
			query = query.Where("exam_province = ?", filter.ExamProvince)
		}
		if filter.PassStatus != "" {
			query = query.Where("pass_status = ?", filter.PassStatus)
		}
		if filter.UserID != nil {
			query = query.Where("user_id = ?", *filter.UserID)
		}
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&shares).Error
	if err != nil {
		return nil, 0, err
	}

	return shares, total, nil
}

func (r *ScoreShareRepository) FindByUserID(userID uint) ([]model.ScoreShare, error) {
	var shares []model.ScoreShare
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Find(&shares).Error
	if err != nil {
		return nil, err
	}
	return shares, nil
}

func (r *ScoreShareRepository) IncrementLike(id uint) error {
	return r.db.Model(&model.ScoreShare{}).Where("id = ?", id).
		UpdateColumn("like_count", gorm.Expr("like_count + ?", 1)).Error
}

func (r *ScoreShareRepository) GetStatistics(examType string, examYear int, examProvince string) (*model.ScoreStatistics, error) {
	var stats model.ScoreStatistics

	query := r.db.Model(&model.ScoreShare{}).
		Where("status = ?", model.ScoreShareStatusPublic)

	if examType != "" {
		query = query.Where("exam_type = ?", examType)
		stats.ExamType = examType
	}
	if examYear > 0 {
		query = query.Where("exam_year = ?", examYear)
		stats.ExamYear = examYear
	}
	if examProvince != "" {
		query = query.Where("exam_province = ?", examProvince)
		stats.ExamProvince = examProvince
	}

	// 统计基本数据
	var count int64
	query.Count(&count)
	stats.TotalCount = int(count)

	if count == 0 {
		return &stats, nil
	}

	// 计算平均分和最高分
	type avgResult struct {
		AvgXingce   float64
		AvgShenlun  float64
		AvgTotal    float64
		MaxXingce   float64
		MaxShenlun  float64
		MaxTotal    float64
		PassedCount int64
	}

	var result avgResult
	r.db.Model(&model.ScoreShare{}).
		Where("status = ?", model.ScoreShareStatusPublic).
		Where(func(db *gorm.DB) *gorm.DB {
			if examType != "" {
				db = db.Where("exam_type = ?", examType)
			}
			if examYear > 0 {
				db = db.Where("exam_year = ?", examYear)
			}
			if examProvince != "" {
				db = db.Where("exam_province = ?", examProvince)
			}
			return db
		}).
		Select(`
			AVG(xingce_score) as avg_xingce,
			AVG(shenlun_score) as avg_shenlun,
			AVG(total_score) as avg_total,
			MAX(xingce_score) as max_xingce,
			MAX(shenlun_score) as max_shenlun,
			MAX(total_score) as max_total,
			SUM(CASE WHEN pass_status = '进面' THEN 1 ELSE 0 END) as passed_count
		`).
		Scan(&result)

	stats.AvgXingce = result.AvgXingce
	stats.AvgShenlun = result.AvgShenlun
	stats.AvgTotal = result.AvgTotal
	stats.MaxXingce = result.MaxXingce
	stats.MaxShenlun = result.MaxShenlun
	stats.MaxTotal = result.MaxTotal

	if count > 0 {
		stats.PassRate = float64(result.PassedCount) / float64(count) * 100
	}

	return &stats, nil
}

func (r *ScoreShareRepository) GetScoreDistribution(examType string, examYear int, examProvince string) ([]model.ScoreDistribution, error) {
	var distributions []model.ScoreDistribution

	query := r.db.Model(&model.ScoreShare{}).
		Where("status = ? AND total_score IS NOT NULL", model.ScoreShareStatusPublic)

	if examType != "" {
		query = query.Where("exam_type = ?", examType)
	}
	if examYear > 0 {
		query = query.Where("exam_year = ?", examYear)
	}
	if examProvince != "" {
		query = query.Where("exam_province = ?", examProvince)
	}

	// 定义分数区间
	ranges := []struct {
		min   int
		max   int
		label string
	}{
		{0, 100, "100分以下"},
		{100, 120, "100-120分"},
		{120, 140, "120-140分"},
		{140, 160, "140-160分"},
		{160, 180, "160-180分"},
		{180, 200, "180-200分"},
		{200, 1000, "200分以上"},
	}

	var total int64
	query.Count(&total)

	for _, r := range ranges {
		var count int64
		query.Where("total_score >= ? AND total_score < ?", r.min, r.max).Count(&count)

		percent := float64(0)
		if total > 0 {
			percent = float64(count) / float64(total) * 100
		}

		distributions = append(distributions, model.ScoreDistribution{
			Range:   r.label,
			Count:   int(count),
			Percent: percent,
		})
	}

	return distributions, nil
}

func (r *ScoreShareRepository) GetRanking(examType string, examYear int, examProvince string, page, pageSize int) ([]model.ScoreShare, int64, error) {
	var shares []model.ScoreShare
	var total int64

	query := r.db.Model(&model.ScoreShare{}).
		Where("status = ? AND total_score IS NOT NULL", model.ScoreShareStatusPublic)

	if examType != "" {
		query = query.Where("exam_type = ?", examType)
	}
	if examYear > 0 {
		query = query.Where("exam_year = ?", examYear)
	}
	if examProvince != "" {
		query = query.Where("exam_province = ?", examProvince)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Order("total_score DESC, xingce_score DESC").
		Offset(offset).Limit(pageSize).
		Find(&shares).Error
	if err != nil {
		return nil, 0, err
	}

	return shares, total, nil
}
