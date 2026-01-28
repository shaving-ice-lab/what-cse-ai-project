package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type PositionRepository struct {
	db *gorm.DB
}

func NewPositionRepository(db *gorm.DB) *PositionRepository {
	return &PositionRepository{db: db}
}

// PositionQueryParams 查询参数
type PositionQueryParams struct {
	// 地域筛选
	Province  string   `form:"province"`
	City      string   `form:"city"`
	District  string   `form:"district"`
	Provinces []string `form:"provinces"` // 多省份

	// 条件筛选
	Education       string   `form:"education"`
	Educations      []string `form:"educations"` // 多学历
	Major           string   `form:"major"`
	MajorCategory   string   `form:"major_category"`
	ExamType        string   `form:"exam_type"`
	ExamTypes       []string `form:"exam_types"` // 多考试类型
	DepartmentLevel string   `form:"department_level"`
	PoliticalStatus string   `form:"political_status"`
	Gender          string   `form:"gender"`

	// 快捷筛选
	IsUnlimitedMajor *bool `form:"unlimited_major"` // 不限专业
	IsForFreshGrad   *bool `form:"fresh_graduate"`  // 应届可报
	HasNoExperience  *bool `form:"no_experience"`   // 无经验要求
	MinRecruitCount  int   `form:"min_recruit"`     // 最低招录人数

	// 年龄和经验筛选
	AgeMax               int `form:"age_max"`                 // 最大年龄要求
	WorkExperienceYearsMin int `form:"work_experience_years_min"` // 最低工作经验年限

	// 时间筛选
	RegistrationStatus string `form:"reg_status"`    // registering/upcoming/ended
	ExpiringInDays     int    `form:"expiring_days"` // N天内截止
	UpdatedToday       bool   `form:"updated_today"` // 今日更新

	// 关键词
	Keyword           string `form:"keyword"`
	DepartmentKeyword string `form:"dept_keyword"`

	// 分页排序
	Page      int    `form:"page"`
	PageSize  int    `form:"page_size"`
	SortBy    string `form:"sort_by"`    // recruit_count/created_at/registration_end/match_score
	SortOrder string `form:"sort_order"` // asc/desc

	// 状态筛选
	Status *int `form:"status"`
}

// PositionFilter 保留旧版筛选器（兼容性）
type PositionFilter struct {
	ExamType        string `query:"exam_type"`
	Province        string `query:"province"`
	City            string `query:"city"`
	EducationMin    string `query:"education_min"`
	MajorUnlimited  *bool  `query:"major_unlimited"`
	PoliticalStatus string `query:"political_status"`
	DepartmentLevel string `query:"department_level"`
	GenderRequired  string `query:"gender_required"`
	RecruitCountMin int    `query:"recruit_count_min"`
	AgeMax          int    `query:"age_max"`
	Keyword         string `query:"keyword"`
	Status          *int   `query:"status"`
}

type PositionSort struct {
	Field string `query:"sort_field"` // created_at, recruit_count, competition_ratio
	Order string `query:"sort_order"` // asc, desc
}

// PositionStats 职位统计
type PositionStats struct {
	TotalCount        int64   `json:"total_count"`
	PublishedCount    int64   `json:"published_count"`
	TodayNewCount     int64   `json:"today_new_count"`
	RegisteringCount  int64   `json:"registering_count"`
	ExpiringCount     int64   `json:"expiring_count"`
	TotalRecruitCount int64   `json:"total_recruit_count"`
	AvgCompetition    float64 `json:"avg_competition"`
}

// ProvinceStats 按省份统计
type ProvinceStats struct {
	Province     string `json:"province"`
	Count        int64  `json:"count"`
	RecruitCount int64  `json:"recruit_count"`
}

// ExamTypeStats 按考试类型统计
type ExamTypeStats struct {
	ExamType     string `json:"exam_type"`
	Count        int64  `json:"count"`
	RecruitCount int64  `json:"recruit_count"`
}

// EducationStats 按学历统计
type EducationStats struct {
	Education string `json:"education"`
	Count     int64  `json:"count"`
}

// TrendItem 趋势数据项
type TrendItem struct {
	Date  string `json:"date"`
	Count int64  `json:"count"`
}

func (r *PositionRepository) Create(position *model.Position) error {
	return r.db.Create(position).Error
}

func (r *PositionRepository) FindByID(id uint) (*model.Position, error) {
	var position model.Position
	err := r.db.First(&position, id).Error
	if err != nil {
		return nil, err
	}
	return &position, nil
}

func (r *PositionRepository) FindByPositionID(positionID string) (*model.Position, error) {
	var position model.Position
	err := r.db.Where("position_id = ?", positionID).First(&position).Error
	if err != nil {
		return nil, err
	}
	return &position, nil
}

func (r *PositionRepository) Update(position *model.Position) error {
	return r.db.Save(position).Error
}

func (r *PositionRepository) Delete(id uint) error {
	return r.db.Delete(&model.Position{}, id).Error
}

func (r *PositionRepository) List(filter *PositionFilter, sort *PositionSort, page, pageSize int) ([]model.Position, int64, error) {
	var positions []model.Position
	var total int64

	query := r.db.Model(&model.Position{})

	// Apply filters
	if filter != nil {
		if filter.ExamType != "" {
			query = query.Where("exam_type = ?", filter.ExamType)
		}
		if filter.Province != "" {
			query = query.Where("work_location_province = ?", filter.Province)
		}
		if filter.City != "" {
			query = query.Where("work_location_city = ?", filter.City)
		}
		if filter.EducationMin != "" {
			query = query.Where("education_min = ?", filter.EducationMin)
		}
		if filter.MajorUnlimited != nil {
			query = query.Where("major_unlimited = ?", *filter.MajorUnlimited)
		}
		if filter.PoliticalStatus != "" {
			query = query.Where("political_status = ?", filter.PoliticalStatus)
		}
		if filter.DepartmentLevel != "" {
			query = query.Where("department_level = ?", filter.DepartmentLevel)
		}
		if filter.GenderRequired != "" {
			query = query.Where("gender_required = ?", filter.GenderRequired)
		}
		if filter.RecruitCountMin > 0 {
			query = query.Where("recruit_count >= ?", filter.RecruitCountMin)
		}
		if filter.AgeMax > 0 {
			query = query.Where("age_max >= ?", filter.AgeMax)
		}
		if filter.Keyword != "" {
			keyword := "%" + filter.Keyword + "%"
			query = query.Where("position_name LIKE ? OR department_name LIKE ?", keyword, keyword)
		}
		if filter.Status != nil {
			query = query.Where("status = ?", *filter.Status)
		} else {
			query = query.Where("status = ?", model.PositionStatusPublished)
		}
	}

	// Count total
	query.Count(&total)

	// Apply sorting
	if sort != nil && sort.Field != "" {
		order := "DESC"
		if sort.Order == "asc" {
			order = "ASC"
		}
		query = query.Order(sort.Field + " " + order)
	} else {
		query = query.Order("created_at DESC")
	}

	// Apply pagination
	offset := (page - 1) * pageSize
	err := query.Offset(offset).Limit(pageSize).Find(&positions).Error
	if err != nil {
		return nil, 0, err
	}

	return positions, total, nil
}

func (r *PositionRepository) FindWithAnnouncements(id uint) (*model.Position, error) {
	var position model.Position
	err := r.db.Preload("Announcements").First(&position, id).Error
	if err != nil {
		return nil, err
	}
	return &position, nil
}

func (r *PositionRepository) UpdateStatus(id uint, status int) error {
	return r.db.Model(&model.Position{}).Where("id = ?", id).Update("status", status).Error
}

func (r *PositionRepository) BatchCreate(positions []model.Position) error {
	return r.db.CreateInBatches(positions, 100).Error
}

func (r *PositionRepository) GetStatsByExamType() (map[string]int64, error) {
	var results []struct {
		ExamType string
		Count    int64
	}

	err := r.db.Model(&model.Position{}).
		Select("exam_type, COUNT(*) as count").
		Where("status = ?", model.PositionStatusPublished).
		Group("exam_type").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	for _, r := range results {
		stats[r.ExamType] = r.Count
	}
	return stats, nil
}

func (r *PositionRepository) GetStatsByProvince() (map[string]int64, error) {
	var results []struct {
		Province string
		Count    int64
	}

	err := r.db.Model(&model.Position{}).
		Select("work_location_province as province, COUNT(*) as count").
		Where("status = ?", model.PositionStatusPublished).
		Group("work_location_province").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	for _, r := range results {
		stats[r.Province] = r.Count
	}
	return stats, nil
}

func (r *PositionRepository) GetStatsByStatus() (map[string]int64, error) {
	var results []struct {
		Status int
		Count  int64
	}

	err := r.db.Model(&model.Position{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	statusNames := map[int]string{
		0: "pending",
		1: "published",
		2: "offline",
	}
	for _, r := range results {
		name := statusNames[r.Status]
		if name == "" {
			name = "unknown"
		}
		stats[name] = r.Count
	}
	return stats, nil
}

type RecruitStats struct {
	TotalRecruitCount   int64
	AvgCompetitionRatio float64
}

func (r *PositionRepository) GetRecruitStats() (*RecruitStats, error) {
	var stats RecruitStats

	err := r.db.Model(&model.Position{}).
		Select("COALESCE(SUM(recruit_count), 0) as total_recruit_count, COALESCE(AVG(competition_ratio), 0) as avg_competition_ratio").
		Where("status = ?", model.PositionStatusPublished).
		Scan(&stats).Error

	if err != nil {
		return nil, err
	}

	return &stats, nil
}

// =====================================================
// 扩展查询方法
// =====================================================

// ListWithParams 使用新查询参数查询
func (r *PositionRepository) ListWithParams(params *PositionQueryParams) ([]model.Position, int64, error) {
	var positions []model.Position
	var total int64

	query := r.db.Model(&model.Position{})

	// 地域筛选
	if params.Province != "" {
		query = query.Where("province = ?", params.Province)
	}
	if len(params.Provinces) > 0 {
		query = query.Where("province IN ?", params.Provinces)
	}
	if params.City != "" {
		query = query.Where("city = ?", params.City)
	}
	if params.District != "" {
		query = query.Where("district = ?", params.District)
	}

	// 条件筛选
	if params.Education != "" {
		query = query.Where("education = ?", params.Education)
	}
	if len(params.Educations) > 0 {
		query = query.Where("education IN ?", params.Educations)
	}
	if params.MajorCategory != "" {
		query = query.Where("major_category = ?", params.MajorCategory)
	}
	if params.Major != "" {
		query = query.Where("major_requirement LIKE ? OR JSON_CONTAINS(major_list, ?)", "%"+params.Major+"%", "\""+params.Major+"\"")
	}
	if params.ExamType != "" {
		query = query.Where("exam_type = ?", params.ExamType)
	}
	if len(params.ExamTypes) > 0 {
		query = query.Where("exam_type IN ?", params.ExamTypes)
	}
	if params.DepartmentLevel != "" {
		query = query.Where("department_level = ?", params.DepartmentLevel)
	}
	if params.PoliticalStatus != "" {
		query = query.Where("political_status = ? OR political_status = '不限'", params.PoliticalStatus)
	}
	if params.Gender != "" && params.Gender != "不限" {
		query = query.Where("gender = ? OR gender = '不限' OR gender = '' OR gender IS NULL", params.Gender)
	}

	// 快捷筛选
	if params.IsUnlimitedMajor != nil {
		query = query.Where("is_unlimited_major = ?", *params.IsUnlimitedMajor)
	}
	if params.IsForFreshGrad != nil {
		if *params.IsForFreshGrad {
			query = query.Where("is_for_fresh_graduate = ? OR is_for_fresh_graduate IS NULL", true)
		} else {
			query = query.Where("is_for_fresh_graduate = ?", false)
		}
	}
	if params.HasNoExperience != nil && *params.HasNoExperience {
		query = query.Where("work_experience_years = 0 OR work_experience_years IS NULL")
	}
	if params.MinRecruitCount > 0 {
		query = query.Where("recruit_count >= ?", params.MinRecruitCount)
	}

	// 年龄和经验筛选
	if params.AgeMax > 0 {
		// 筛选年龄上限不超过用户指定值的职位，或不限年龄的职位
		query = query.Where("(age_max <= ? AND age_max > 0) OR age_max = 0 OR age_max IS NULL", params.AgeMax)
	}
	if params.WorkExperienceYearsMin > 0 {
		// 筛选要求工作经验年限不超过用户指定值的职位
		query = query.Where("work_experience_years <= ?", params.WorkExperienceYearsMin)
	}

	// 时间筛选
	now := time.Now()
	if params.RegistrationStatus != "" {
		switch params.RegistrationStatus {
		case "registering":
			query = query.Where("registration_start <= ? AND registration_end >= ?", now, now)
		case "upcoming":
			query = query.Where("registration_start > ?", now)
		case "ended":
			query = query.Where("registration_end < ?", now)
		}
	}
	if params.ExpiringInDays > 0 {
		expireDate := now.AddDate(0, 0, params.ExpiringInDays)
		query = query.Where("registration_end >= ? AND registration_end <= ?", now, expireDate)
	}
	if params.UpdatedToday {
		todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
		query = query.Where("created_at >= ?", todayStart)
	}

	// 关键词搜索
	if params.Keyword != "" {
		keyword := "%" + params.Keyword + "%"
		query = query.Where("position_name LIKE ? OR department_name LIKE ?", keyword, keyword)
	}
	if params.DepartmentKeyword != "" {
		query = query.Where("department_name LIKE ?", "%"+params.DepartmentKeyword+"%")
	}

	// 状态筛选
	if params.Status != nil {
		query = query.Where("status = ?", *params.Status)
	} else {
		query = query.Where("status = ?", model.PositionStatusPublished)
	}

	// 计数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 排序
	sortField := "created_at"
	sortOrder := "DESC"
	if params.SortBy != "" {
		switch params.SortBy {
		case "recruit_count", "competition_ratio", "registration_end", "created_at":
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

	if err := query.Offset(offset).Limit(pageSize).Find(&positions).Error; err != nil {
		return nil, 0, err
	}

	return positions, total, nil
}

// GetByAnnouncementID 根据公告ID获取职位
func (r *PositionRepository) GetByAnnouncementID(announcementID uint) ([]model.Position, error) {
	var positions []model.Position
	err := r.db.Where("announcement_id = ?", announcementID).Find(&positions).Error
	return positions, err
}

// GetByFenbiAnnouncementID 根据粉笔公告ID获取职位
func (r *PositionRepository) GetByFenbiAnnouncementID(fenbiAnnouncementID uint) ([]model.Position, error) {
	var positions []model.Position
	err := r.db.Where("fenbi_announcement_id = ?", fenbiAnnouncementID).Find(&positions).Error
	return positions, err
}

// GetByPositionCode 根据职位代码获取职位
func (r *PositionRepository) GetByPositionCode(code string) ([]model.Position, error) {
	var positions []model.Position
	err := r.db.Where("position_code = ?", code).Find(&positions).Error
	return positions, err
}

// SoftDelete 软删除
func (r *PositionRepository) SoftDelete(id uint) error {
	return r.db.Delete(&model.Position{}, id).Error
}

// BatchUpdate 批量更新
func (r *PositionRepository) BatchUpdate(ids []uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Position{}).Where("id IN ?", ids).Updates(updates).Error
}

// DeleteByAnnouncementID 根据公告ID删除职位
func (r *PositionRepository) DeleteByAnnouncementID(announcementID uint) error {
	return r.db.Where("announcement_id = ?", announcementID).Delete(&model.Position{}).Error
}

// =====================================================
// 统计方法扩展
// =====================================================

// GetStats 获取综合统计
func (r *PositionRepository) GetStats() (*PositionStats, error) {
	var stats PositionStats
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	expireDate := now.AddDate(0, 0, 3) // 3天内截止

	// 总数
	r.db.Model(&model.Position{}).Count(&stats.TotalCount)

	// 已发布数
	r.db.Model(&model.Position{}).Where("status = ?", model.PositionStatusPublished).Count(&stats.PublishedCount)

	// 今日新增
	r.db.Model(&model.Position{}).Where("created_at >= ?", todayStart).Count(&stats.TodayNewCount)

	// 报名中
	r.db.Model(&model.Position{}).
		Where("status = ? AND registration_start <= ? AND registration_end >= ?", model.PositionStatusPublished, now, now).
		Count(&stats.RegisteringCount)

	// 即将截止
	r.db.Model(&model.Position{}).
		Where("status = ? AND registration_end >= ? AND registration_end <= ?", model.PositionStatusPublished, now, expireDate).
		Count(&stats.ExpiringCount)

	// 总招录人数和平均竞争比
	var recruitStats struct {
		TotalRecruitCount int64
		AvgCompetition    float64
	}
	r.db.Model(&model.Position{}).
		Select("COALESCE(SUM(recruit_count), 0) as total_recruit_count, COALESCE(AVG(competition_ratio), 0) as avg_competition").
		Where("status = ?", model.PositionStatusPublished).
		Scan(&recruitStats)
	stats.TotalRecruitCount = recruitStats.TotalRecruitCount
	stats.AvgCompetition = recruitStats.AvgCompetition

	return &stats, nil
}

// GetStatsByProvinceList 按省份统计列表
func (r *PositionRepository) GetStatsByProvinceList() ([]ProvinceStats, error) {
	var results []ProvinceStats

	err := r.db.Model(&model.Position{}).
		Select("province, COUNT(*) as count, COALESCE(SUM(recruit_count), 0) as recruit_count").
		Where("status = ? AND province != ''", model.PositionStatusPublished).
		Group("province").
		Order("count DESC").
		Find(&results).Error

	return results, err
}

// GetStatsByExamTypeList 按考试类型统计列表
func (r *PositionRepository) GetStatsByExamTypeList() ([]ExamTypeStats, error) {
	var results []ExamTypeStats

	err := r.db.Model(&model.Position{}).
		Select("exam_type, COUNT(*) as count, COALESCE(SUM(recruit_count), 0) as recruit_count").
		Where("status = ? AND exam_type != ''", model.PositionStatusPublished).
		Group("exam_type").
		Order("count DESC").
		Find(&results).Error

	return results, err
}

// GetStatsByEducation 按学历统计
func (r *PositionRepository) GetStatsByEducation() ([]EducationStats, error) {
	var results []EducationStats

	err := r.db.Model(&model.Position{}).
		Select("education, COUNT(*) as count").
		Where("status = ? AND education != ''", model.PositionStatusPublished).
		Group("education").
		Order("count DESC").
		Find(&results).Error

	return results, err
}

// CountByDateRange 统计日期范围内的职位数
func (r *PositionRepository) CountByDateRange(start, end time.Time) (int64, error) {
	var count int64
	err := r.db.Model(&model.Position{}).
		Where("created_at >= ? AND created_at <= ?", start, end).
		Count(&count).Error
	return count, err
}

// GetTodayNewCount 获取今日新增数
func (r *PositionRepository) GetTodayNewCount() (int64, error) {
	var count int64
	now := time.Now()
	todayStart := time.Date(now.Year(), now.Month(), now.Day(), 0, 0, 0, 0, now.Location())
	err := r.db.Model(&model.Position{}).
		Where("created_at >= ?", todayStart).
		Count(&count).Error
	return count, err
}

// GetExpiringCount 获取即将截止的职位数
func (r *PositionRepository) GetExpiringCount(days int) (int64, error) {
	var count int64
	now := time.Now()
	expireDate := now.AddDate(0, 0, days)
	err := r.db.Model(&model.Position{}).
		Where("status = ? AND registration_end >= ? AND registration_end <= ?", model.PositionStatusPublished, now, expireDate).
		Count(&count).Error
	return count, err
}

// GetTrends 获取趋势数据
func (r *PositionRepository) GetTrends(days int) ([]TrendItem, error) {
	var results []TrendItem
	now := time.Now()
	startDate := now.AddDate(0, 0, -days)

	err := r.db.Model(&model.Position{}).
		Select("DATE(created_at) as date, COUNT(*) as count").
		Where("created_at >= ?", startDate).
		Group("DATE(created_at)").
		Order("date ASC").
		Find(&results).Error

	return results, err
}

// =====================================================
// 筛选选项方法
// =====================================================

// GetProvinces 获取所有省份
func (r *PositionRepository) GetProvinces() ([]string, error) {
	var provinces []string
	err := r.db.Model(&model.Position{}).
		Distinct("province").
		Where("province != '' AND status = ?", model.PositionStatusPublished).
		Pluck("province", &provinces).Error
	return provinces, err
}

// GetCities 获取指定省份的城市
func (r *PositionRepository) GetCities(province string) ([]string, error) {
	var cities []string
	query := r.db.Model(&model.Position{}).
		Distinct("city").
		Where("city != '' AND status = ?", model.PositionStatusPublished)
	if province != "" {
		query = query.Where("province = ?", province)
	}
	err := query.Pluck("city", &cities).Error
	return cities, err
}

// GetDistricts 获取指定省市的区县
func (r *PositionRepository) GetDistricts(province, city string) ([]string, error) {
	var districts []string
	query := r.db.Model(&model.Position{}).
		Distinct("district").
		Where("district != '' AND status = ?", model.PositionStatusPublished)
	if province != "" {
		query = query.Where("province = ?", province)
	}
	if city != "" {
		query = query.Where("city = ?", city)
	}
	err := query.Pluck("district", &districts).Error
	return districts, err
}

// GetExamTypes 获取所有考试类型
func (r *PositionRepository) GetExamTypes() ([]string, error) {
	var examTypes []string
	err := r.db.Model(&model.Position{}).
		Distinct("exam_type").
		Where("exam_type != '' AND status = ?", model.PositionStatusPublished).
		Pluck("exam_type", &examTypes).Error
	return examTypes, err
}

// GetExamCategories 获取所有考试分类(A/B/C类)
func (r *PositionRepository) GetExamCategories() ([]string, error) {
	var categories []string
	err := r.db.Model(&model.Position{}).
		Distinct("exam_category").
		Where("exam_category != '' AND status = ?", model.PositionStatusPublished).
		Pluck("exam_category", &categories).Error
	return categories, err
}

// GetMajorCategories 获取所有专业大类
func (r *PositionRepository) GetMajorCategories() ([]string, error) {
	var categories []string
	err := r.db.Model(&model.Position{}).
		Distinct("major_category").
		Where("major_category != '' AND status = ?", model.PositionStatusPublished).
		Pluck("major_category", &categories).Error
	return categories, err
}

// GetDepartmentLevels 获取所有单位层级
func (r *PositionRepository) GetDepartmentLevels() ([]string, error) {
	var levels []string
	err := r.db.Model(&model.Position{}).
		Distinct("department_level").
		Where("department_level != '' AND status = ?", model.PositionStatusPublished).
		Pluck("department_level", &levels).Error
	return levels, err
}

// =====================================================
// 热门和推荐
// =====================================================

// GetHotPositions 获取热门职位
func (r *PositionRepository) GetHotPositions(limit int) ([]model.Position, error) {
	var positions []model.Position
	now := time.Now()

	err := r.db.Model(&model.Position{}).
		Where("status = ? AND registration_end >= ?", model.PositionStatusPublished, now).
		Order("recruit_count DESC, applicant_count DESC").
		Limit(limit).
		Find(&positions).Error

	return positions, err
}

// GetExpiringPositions 获取即将截止的职位
func (r *PositionRepository) GetExpiringPositions(days, limit int) ([]model.Position, error) {
	var positions []model.Position
	now := time.Now()
	expireDate := now.AddDate(0, 0, days)

	err := r.db.Model(&model.Position{}).
		Where("status = ? AND registration_end >= ? AND registration_end <= ?", model.PositionStatusPublished, now, expireDate).
		Order("registration_end ASC").
		Limit(limit).
		Find(&positions).Error

	return positions, err
}

// GetLatestPositions 获取最新职位
func (r *PositionRepository) GetLatestPositions(limit int) ([]model.Position, error) {
	var positions []model.Position

	err := r.db.Model(&model.Position{}).
		Where("status = ?", model.PositionStatusPublished).
		Order("created_at DESC").
		Limit(limit).
		Find(&positions).Error

	return positions, err
}

// GetAllPublished 获取所有已发布的职位（用于数据采集）
func (r *PositionRepository) GetAllPublished() ([]model.Position, error) {
	var positions []model.Position

	err := r.db.Model(&model.Position{}).
		Where("status = ?", model.PositionStatusPublished).
		Find(&positions).Error

	return positions, err
}

// GetSimilarPositions 获取相似职位
// 基于省份、考试类型、学历要求等维度查找相似职位
func (r *PositionRepository) GetSimilarPositions(position *model.Position, limit int) ([]model.Position, error) {
	var positions []model.Position

	query := r.db.Model(&model.Position{}).
		Where("id != ?", position.ID).
		Where("status = ?", model.PositionStatusPublished)

	// 优先同省份
	if position.Province != "" {
		query = query.Where("province = ?", position.Province)
	}

	// 同考试类型
	if position.ExamType != "" {
		query = query.Where("exam_type = ?", position.ExamType)
	}

	// 学历要求相同或更低
	if position.Education != "" {
		query = query.Where("education = ? OR education = '' OR education IS NULL", position.Education)
	}

	err := query.
		Order("recruit_count DESC, created_at DESC").
		Limit(limit).
		Find(&positions).Error

	// 如果没找到足够的相似职位，放宽条件重新查找
	if len(positions) < limit {
		var morePositions []model.Position
		excludeIDs := []uint{position.ID}
		for _, p := range positions {
			excludeIDs = append(excludeIDs, p.ID)
		}

		r.db.Model(&model.Position{}).
			Where("id NOT IN ?", excludeIDs).
			Where("status = ?", model.PositionStatusPublished).
			Where("province = ? OR exam_type = ?", position.Province, position.ExamType).
			Order("recruit_count DESC, created_at DESC").
			Limit(limit - len(positions)).
			Find(&morePositions)

		positions = append(positions, morePositions...)
	}

	return positions, err
}
