package service

import (
	"errors"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrPositionNotFound = errors.New("position not found")
)

type PositionService struct {
	positionRepo *repository.PositionRepository
	favoriteRepo *repository.FavoriteRepository
}

func NewPositionService(positionRepo *repository.PositionRepository, favoriteRepo *repository.FavoriteRepository) *PositionService {
	return &PositionService{
		positionRepo: positionRepo,
		favoriteRepo: favoriteRepo,
	}
}

// =====================================================
// 请求和响应结构体
// =====================================================

// PositionListRequest 兼容旧版请求
type PositionListRequest struct {
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
	SortField       string `query:"sort_field"`
	SortOrder       string `query:"sort_order"`
	Page            int    `query:"page"`
	PageSize        int    `query:"page_size"`
}

// PositionListResponse 职位列表响应
type PositionListResponse struct {
	Positions []model.Position `json:"positions"`
	Total     int64            `json:"total"`
	Page      int              `json:"page"`
	PageSize  int              `json:"page_size"`
}

// PositionBriefListResponse 简要职位列表响应
type PositionBriefListResponse struct {
	Positions []*model.PositionBriefResponse `json:"positions"`
	Total     int64                          `json:"total"`
	Page      int                            `json:"page"`
	PageSize  int                            `json:"page_size"`
}

// PositionStatsResponse 统计响应
type PositionStatsResponse struct {
	TotalCount        int64   `json:"total_count"`
	PublishedCount    int64   `json:"published_count"`
	TodayNewCount     int64   `json:"today_new_count"`
	RegisteringCount  int64   `json:"registering_count"`
	ExpiringCount     int64   `json:"expiring_count"`
	TotalRecruitCount int64   `json:"total_recruit_count"`
	AvgCompetition    float64 `json:"avg_competition"`
}

// PositionTrendsResponse 趋势响应
type PositionTrendsResponse struct {
	Trends []repository.TrendItem `json:"trends"`
}

// FilterOptionsResponse 筛选选项响应
type FilterOptionsResponse struct {
	Provinces        []string `json:"provinces"`
	ExamTypes        []string `json:"exam_types"`
	ExamCategories   []string `json:"exam_categories"`
	MajorCategories  []string `json:"major_categories"`
	DepartmentLevels []string `json:"department_levels"`
	Educations       []string `json:"educations"`
	PoliticalStatus  []string `json:"political_status"`
	Genders          []string `json:"genders"`
}

// CascadeRegion 级联地区
type CascadeRegion struct {
	Province string   `json:"province"`
	Cities   []string `json:"cities"`
}

// CascadeRegionsResponse 级联地区响应
type CascadeRegionsResponse struct {
	Regions []CascadeRegion `json:"regions"`
}

func (s *PositionService) ListPositions(req *PositionListRequest) (*PositionListResponse, error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 20
	}

	filter := &repository.PositionFilter{
		ExamType:        req.ExamType,
		Province:        req.Province,
		City:            req.City,
		EducationMin:    req.EducationMin,
		MajorUnlimited:  req.MajorUnlimited,
		PoliticalStatus: req.PoliticalStatus,
		DepartmentLevel: req.DepartmentLevel,
		GenderRequired:  req.GenderRequired,
		RecruitCountMin: req.RecruitCountMin,
		AgeMax:          req.AgeMax,
		Keyword:         req.Keyword,
	}

	sort := &repository.PositionSort{
		Field: req.SortField,
		Order: req.SortOrder,
	}

	positions, total, err := s.positionRepo.List(filter, sort, req.Page, req.PageSize)
	if err != nil {
		return nil, err
	}

	return &PositionListResponse{
		Positions: positions,
		Total:     total,
		Page:      req.Page,
		PageSize:  req.PageSize,
	}, nil
}

func (s *PositionService) GetPositionDetail(id uint) (*model.Position, error) {
	position, err := s.positionRepo.FindWithAnnouncements(id)
	if err != nil {
		return nil, ErrPositionNotFound
	}
	return position, nil
}

func (s *PositionService) GetPositionByPositionID(positionID string) (*model.Position, error) {
	position, err := s.positionRepo.FindByPositionID(positionID)
	if err != nil {
		return nil, ErrPositionNotFound
	}
	return position, nil
}

type ComparePositionsResponse struct {
	Positions []model.Position `json:"positions"`
}

func (s *PositionService) ComparePositions(ids []uint) (*ComparePositionsResponse, error) {
	var positions []model.Position
	for _, id := range ids {
		pos, err := s.positionRepo.FindByID(id)
		if err != nil {
			continue
		}
		positions = append(positions, *pos)
	}

	return &ComparePositionsResponse{
		Positions: positions,
	}, nil
}

func (s *PositionService) GetPositionStats() (map[string]interface{}, error) {
	byExamType, err := s.positionRepo.GetStatsByExamType()
	if err != nil {
		return nil, err
	}

	byProvince, err := s.positionRepo.GetStatsByProvince()
	if err != nil {
		return nil, err
	}

	return map[string]interface{}{
		"by_exam_type": byExamType,
		"by_province":  byProvince,
	}, nil
}

// Favorite management
// positionID is the database primary key (uint)
func (s *PositionService) AddFavorite(userID, positionID uint) error {
	// Check if position exists and get the string position_id
	position, err := s.positionRepo.FindByID(positionID)
	if err != nil {
		return ErrPositionNotFound
	}

	return s.favoriteRepo.AddFavorite(userID, position.PositionID)
}

func (s *PositionService) RemoveFavorite(userID, positionID uint) error {
	// Get the string position_id from the database ID
	position, err := s.positionRepo.FindByID(positionID)
	if err != nil {
		return ErrPositionNotFound
	}
	return s.favoriteRepo.RemoveFavorite(userID, position.PositionID)
}

func (s *PositionService) GetUserFavorites(userID uint, page, pageSize int) ([]model.Position, int64, error) {
	return s.favoriteRepo.GetUserFavorites(userID, page, pageSize)
}

func (s *PositionService) IsFavorite(userID, positionID uint) bool {
	// Get the string position_id from the database ID
	position, err := s.positionRepo.FindByID(positionID)
	if err != nil {
		return false
	}
	return s.favoriteRepo.IsFavorite(userID, position.PositionID)
}

// =====================================================
// 扩展方法
// =====================================================

// ListPositionsWithParams 使用新查询参数查询职位
func (s *PositionService) ListPositionsWithParams(params *repository.PositionQueryParams) (*PositionBriefListResponse, error) {
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}

	positions, total, err := s.positionRepo.ListWithParams(params)
	if err != nil {
		return nil, err
	}

	// 转换为简要响应
	briefPositions := make([]*model.PositionBriefResponse, len(positions))
	for i, p := range positions {
		briefPositions[i] = p.ToBriefResponse()
	}

	return &PositionBriefListResponse{
		Positions: briefPositions,
		Total:     total,
		Page:      params.Page,
		PageSize:  params.PageSize,
	}, nil
}

// SearchPositions 搜索职位
func (s *PositionService) SearchPositions(keyword string, params *repository.PositionQueryParams) (*PositionBriefListResponse, error) {
	params.Keyword = keyword
	return s.ListPositionsWithParams(params)
}

// GetPositionDetailWithFavorite 获取职位详情（含收藏状态）
func (s *PositionService) GetPositionDetailWithFavorite(id uint, userID uint) (*model.PositionDetailResponse, error) {
	position, err := s.positionRepo.FindWithAnnouncements(id)
	if err != nil {
		return nil, ErrPositionNotFound
	}

	isFavorite := false
	if userID > 0 {
		isFavorite = s.favoriteRepo.IsFavorite(userID, position.PositionID)
	}

	return position.ToDetailResponse(isFavorite), nil
}

// GetSimilarPositions 获取相似职位
func (s *PositionService) GetSimilarPositions(id uint, limit int) ([]*model.PositionBriefResponse, error) {
	if limit <= 0 {
		limit = 5
	}
	if limit > 20 {
		limit = 20
	}

	// 先获取当前职位
	position, err := s.positionRepo.FindByID(id)
	if err != nil {
		return nil, ErrPositionNotFound
	}

	// 获取相似职位
	similarPositions, err := s.positionRepo.GetSimilarPositions(position, limit)
	if err != nil {
		return nil, err
	}

	// 转换为简要响应
	briefPositions := make([]*model.PositionBriefResponse, len(similarPositions))
	for i, pos := range similarPositions {
		briefPositions[i] = pos.ToBriefResponse()
	}

	return briefPositions, nil
}

// GetPositionStats 获取职位统计
func (s *PositionService) GetPositionStatsV2() (*PositionStatsResponse, error) {
	stats, err := s.positionRepo.GetStats()
	if err != nil {
		return nil, err
	}

	return &PositionStatsResponse{
		TotalCount:        stats.TotalCount,
		PublishedCount:    stats.PublishedCount,
		TodayNewCount:     stats.TodayNewCount,
		RegisteringCount:  stats.RegisteringCount,
		ExpiringCount:     stats.ExpiringCount,
		TotalRecruitCount: stats.TotalRecruitCount,
		AvgCompetition:    stats.AvgCompetition,
	}, nil
}

// GetStatsByProvince 按省份统计
func (s *PositionService) GetStatsByProvince() ([]repository.ProvinceStats, error) {
	return s.positionRepo.GetStatsByProvinceList()
}

// GetStatsByExamType 按考试类型统计
func (s *PositionService) GetStatsByExamTypeV2() ([]repository.ExamTypeStats, error) {
	return s.positionRepo.GetStatsByExamTypeList()
}

// GetStatsByEducation 按学历统计
func (s *PositionService) GetStatsByEducation() ([]repository.EducationStats, error) {
	return s.positionRepo.GetStatsByEducation()
}

// GetPositionTrends 获取职位趋势
func (s *PositionService) GetPositionTrends(days int) (*PositionTrendsResponse, error) {
	if days <= 0 {
		days = 30
	}
	if days > 365 {
		days = 365
	}

	trends, err := s.positionRepo.GetTrends(days)
	if err != nil {
		return nil, err
	}

	return &PositionTrendsResponse{
		Trends: trends,
	}, nil
}

// GetFilterOptions 获取筛选选项
func (s *PositionService) GetFilterOptions() (*FilterOptionsResponse, error) {
	provinces, _ := s.positionRepo.GetProvinces()
	examTypes, _ := s.positionRepo.GetExamTypes()
	examCategories, _ := s.positionRepo.GetExamCategories()
	majorCategories, _ := s.positionRepo.GetMajorCategories()
	deptLevels, _ := s.positionRepo.GetDepartmentLevels()

	return &FilterOptionsResponse{
		Provinces:        provinces,
		ExamTypes:        examTypes,
		ExamCategories:   examCategories,
		MajorCategories:  majorCategories,
		DepartmentLevels: deptLevels,
		Educations:       model.EducationList,
		PoliticalStatus:  model.PoliticalStatusList,
		Genders:          model.GenderList,
	}, nil
}

// GetDistricts 获取指定省市的区县
func (s *PositionService) GetDistricts(province, city string) ([]string, error) {
	return s.positionRepo.GetDistricts(province, city)
}

// GetCascadeRegions 获取级联地区数据
func (s *PositionService) GetCascadeRegions() (*CascadeRegionsResponse, error) {
	provinces, err := s.positionRepo.GetProvinces()
	if err != nil {
		return nil, err
	}

	regions := make([]CascadeRegion, 0, len(provinces))
	for _, province := range provinces {
		cities, _ := s.positionRepo.GetCities(province)
		regions = append(regions, CascadeRegion{
			Province: province,
			Cities:   cities,
		})
	}

	return &CascadeRegionsResponse{
		Regions: regions,
	}, nil
}

// GetHotPositions 获取热门职位
func (s *PositionService) GetHotPositions(limit int) ([]*model.PositionBriefResponse, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	positions, err := s.positionRepo.GetHotPositions(limit)
	if err != nil {
		return nil, err
	}

	briefPositions := make([]*model.PositionBriefResponse, len(positions))
	for i, p := range positions {
		briefPositions[i] = p.ToBriefResponse()
	}

	return briefPositions, nil
}

// GetExpiringPositions 获取即将截止的职位
func (s *PositionService) GetExpiringPositions(days, limit int) ([]*model.PositionBriefResponse, error) {
	if days <= 0 {
		days = 3
	}
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	positions, err := s.positionRepo.GetExpiringPositions(days, limit)
	if err != nil {
		return nil, err
	}

	briefPositions := make([]*model.PositionBriefResponse, len(positions))
	for i, p := range positions {
		briefPositions[i] = p.ToBriefResponse()
	}

	return briefPositions, nil
}

// GetLatestPositions 获取最新职位
func (s *PositionService) GetLatestPositions(limit int) ([]*model.PositionBriefResponse, error) {
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	positions, err := s.positionRepo.GetLatestPositions(limit)
	if err != nil {
		return nil, err
	}

	briefPositions := make([]*model.PositionBriefResponse, len(positions))
	for i, p := range positions {
		briefPositions[i] = p.ToBriefResponse()
	}

	return briefPositions, nil
}

// =====================================================
// 管理端方法
// =====================================================

// DeletePosition 删除职位
func (s *PositionService) DeletePosition(id uint) error {
	return s.positionRepo.SoftDelete(id)
}

// BatchDeletePositions 批量删除职位
func (s *PositionService) BatchDeletePositions(ids []uint) error {
	for _, id := range ids {
		if err := s.positionRepo.SoftDelete(id); err != nil {
			return err
		}
	}
	return nil
}

// UpdatePositionStatus 更新职位状态
func (s *PositionService) UpdatePositionStatus(id uint, status int) error {
	return s.positionRepo.UpdateStatus(id, status)
}

// BatchUpdateStatus 批量更新状态
func (s *PositionService) BatchUpdateStatus(ids []uint, status int) error {
	return s.positionRepo.BatchUpdate(ids, map[string]interface{}{"status": status})
}
