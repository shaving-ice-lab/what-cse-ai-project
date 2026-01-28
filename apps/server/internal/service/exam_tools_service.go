package service

import (
	"errors"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrExamLocationNotFound  = errors.New("exam location not found")
	ErrScoreEstimateNotFound = errors.New("score estimate not found")
	ErrScoreShareNotFound    = errors.New("score share not found")
)

// ExamLocationService 考点服务
type ExamLocationService struct {
	locationRepo *repository.ExamLocationRepository
}

func NewExamLocationService(locationRepo *repository.ExamLocationRepository) *ExamLocationService {
	return &ExamLocationService{
		locationRepo: locationRepo,
	}
}

// ExamLocationListRequest 考点列表请求
type ExamLocationListRequest struct {
	Province string `query:"province"`
	City     string `query:"city"`
	ExamType string `query:"exam_type"`
	Keyword  string `query:"keyword"`
	Page     int    `query:"page"`
	PageSize int    `query:"page_size"`
}

// ExamLocationListResponse 考点列表响应
type ExamLocationListResponse struct {
	Locations []model.ExamLocationResponse `json:"locations"`
	Total     int64                        `json:"total"`
	Page      int                          `json:"page"`
	PageSize  int                          `json:"page_size"`
}

func (s *ExamLocationService) ListLocations(req *ExamLocationListRequest) (*ExamLocationListResponse, error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 20
	}

	filter := &repository.ExamLocationFilter{
		Province: req.Province,
		City:     req.City,
		ExamType: req.ExamType,
		Keyword:  req.Keyword,
	}

	locations, total, err := s.locationRepo.List(filter, req.Page, req.PageSize)
	if err != nil {
		return nil, err
	}

	var responses []model.ExamLocationResponse
	for _, loc := range locations {
		responses = append(responses, *loc.ToResponse())
	}

	return &ExamLocationListResponse{
		Locations: responses,
		Total:     total,
		Page:      req.Page,
		PageSize:  req.PageSize,
	}, nil
}

func (s *ExamLocationService) GetLocationDetail(id uint) (*model.ExamLocation, error) {
	location, err := s.locationRepo.FindByID(id)
	if err != nil {
		return nil, ErrExamLocationNotFound
	}
	return location, nil
}

func (s *ExamLocationService) GetProvinces() ([]string, error) {
	return s.locationRepo.GetProvinces()
}

func (s *ExamLocationService) GetCities(province string) ([]string, error) {
	return s.locationRepo.GetCities(province)
}

func (s *ExamLocationService) SearchLocations(keyword string, limit int) ([]model.ExamLocationResponse, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}

	locations, err := s.locationRepo.Search(keyword, limit)
	if err != nil {
		return nil, err
	}

	var responses []model.ExamLocationResponse
	for _, loc := range locations {
		responses = append(responses, *loc.ToResponse())
	}

	return responses, nil
}

// NearbyLocationRequest 附近考点请求
type NearbyLocationRequest struct {
	Latitude  float64 `query:"lat"`
	Longitude float64 `query:"lng"`
	RadiusKm  float64 `query:"radius"`
	Limit     int     `query:"limit"`
}

func (s *ExamLocationService) FindNearbyLocations(req *NearbyLocationRequest) ([]model.ExamLocationResponse, error) {
	if req.RadiusKm <= 0 {
		req.RadiusKm = 10 // 默认10公里
	}
	if req.Limit <= 0 || req.Limit > 50 {
		req.Limit = 20
	}

	locations, err := s.locationRepo.FindNearby(req.Latitude, req.Longitude, req.RadiusKm, req.Limit)
	if err != nil {
		return nil, err
	}

	var responses []model.ExamLocationResponse
	for _, loc := range locations {
		responses = append(responses, *loc.ToResponse())
	}

	return responses, nil
}

// Admin methods
func (s *ExamLocationService) CreateLocation(location *model.ExamLocation) error {
	return s.locationRepo.Create(location)
}

func (s *ExamLocationService) UpdateLocation(location *model.ExamLocation) error {
	return s.locationRepo.Update(location)
}

func (s *ExamLocationService) DeleteLocation(id uint) error {
	return s.locationRepo.Delete(id)
}

// ScoreEstimateService 估分服务
type ScoreEstimateService struct {
	estimateRepo *repository.ScoreEstimateRepository
}

func NewScoreEstimateService(estimateRepo *repository.ScoreEstimateRepository) *ScoreEstimateService {
	return &ScoreEstimateService{
		estimateRepo: estimateRepo,
	}
}

// ScoreEstimateRequest 估分请求
type ScoreEstimateRequest struct {
	ExamType     string   `json:"exam_type" validate:"required"`
	ExamYear     int      `json:"exam_year" validate:"required"`
	ExamSubject  string   `json:"exam_subject"` // 行测/申论
	CorrectCount int      `json:"correct_count"`
	TotalCount   int      `json:"total_count"`
	Answers      []string `json:"answers,omitempty"`
}

// ScoreEstimateResponse 估分响应
type ScoreEstimateResponse struct {
	ID             uint    `json:"id"`
	ExamType       string  `json:"exam_type"`
	ExamYear       int     `json:"exam_year"`
	ExamSubject    string  `json:"exam_subject"`
	CorrectCount   int     `json:"correct_count"`
	TotalCount     int     `json:"total_count"`
	EstimatedScore float64 `json:"estimated_score"`
	Accuracy       float64 `json:"accuracy"` // 正确率
}

func (s *ScoreEstimateService) CalculateScore(req *ScoreEstimateRequest, userID *uint) (*ScoreEstimateResponse, error) {
	// 计算估计分数
	// 行测通常满分100分，申论满分100分
	var estimatedScore float64
	var accuracy float64

	if req.TotalCount > 0 {
		accuracy = float64(req.CorrectCount) / float64(req.TotalCount) * 100
	}

	// 根据考试类型和科目计算分数
	switch req.ExamSubject {
	case "行测":
		// 行测满分100分，按正确率计算
		estimatedScore = accuracy
	case "申论":
		// 申论计分较复杂，这里简化处理
		// 假设按平均每道题10分，总共10道题
		estimatedScore = float64(req.CorrectCount) * 10
		if estimatedScore > 100 {
			estimatedScore = 100
		}
	default:
		estimatedScore = accuracy
	}

	// 保存估分记录
	estimate := &model.ScoreEstimate{
		UserID:         userID,
		ExamType:       req.ExamType,
		ExamYear:       req.ExamYear,
		ExamSubject:    req.ExamSubject,
		CorrectCount:   req.CorrectCount,
		TotalCount:     req.TotalCount,
		EstimatedScore: estimatedScore,
	}

	if err := s.estimateRepo.Create(estimate); err != nil {
		return nil, err
	}

	return &ScoreEstimateResponse{
		ID:             estimate.ID,
		ExamType:       estimate.ExamType,
		ExamYear:       estimate.ExamYear,
		ExamSubject:    estimate.ExamSubject,
		CorrectCount:   estimate.CorrectCount,
		TotalCount:     estimate.TotalCount,
		EstimatedScore: estimatedScore,
		Accuracy:       accuracy,
	}, nil
}

func (s *ScoreEstimateService) GetUserEstimates(userID uint) ([]model.ScoreEstimate, error) {
	return s.estimateRepo.FindByUserID(userID)
}

func (s *ScoreEstimateService) UpdateActualScore(id uint, actualScore float64) error {
	estimate, err := s.estimateRepo.FindByID(id)
	if err != nil {
		return ErrScoreEstimateNotFound
	}
	estimate.ActualScore = &actualScore
	return s.estimateRepo.Update(estimate)
}

// ScoreShareService 晒分服务
type ScoreShareService struct {
	shareRepo *repository.ScoreShareRepository
}

func NewScoreShareService(shareRepo *repository.ScoreShareRepository) *ScoreShareService {
	return &ScoreShareService{
		shareRepo: shareRepo,
	}
}

// ScoreShareCreateRequest 创建晒分请求
type ScoreShareCreateRequest struct {
	ExamType     string   `json:"exam_type" validate:"required"`
	ExamYear     int      `json:"exam_year" validate:"required"`
	ExamProvince string   `json:"exam_province"`
	XingceScore  *float64 `json:"xingce_score"`
	ShenlunScore *float64 `json:"shenlun_score"`
	TotalScore   *float64 `json:"total_score"`
	Rank         *int     `json:"rank"`
	PassStatus   string   `json:"pass_status"`
	PositionName string   `json:"position_name"`
	IsAnonymous  bool     `json:"is_anonymous"`
	Nickname     string   `json:"nickname"`
	Comment      string   `json:"comment"`
}

// ScoreShareListRequest 晒分列表请求
type ScoreShareListRequest struct {
	ExamType     string `query:"exam_type"`
	ExamYear     int    `query:"exam_year"`
	ExamProvince string `query:"exam_province"`
	PassStatus   string `query:"pass_status"`
	Page         int    `query:"page"`
	PageSize     int    `query:"page_size"`
}

// ScoreShareListResponse 晒分列表响应
type ScoreShareListResponse struct {
	Shares   []model.ScoreShareResponse `json:"shares"`
	Total    int64                      `json:"total"`
	Page     int                        `json:"page"`
	PageSize int                        `json:"page_size"`
}

func (s *ScoreShareService) CreateShare(req *ScoreShareCreateRequest, userID *uint) (*model.ScoreShare, error) {
	share := &model.ScoreShare{
		UserID:       userID,
		ExamType:     req.ExamType,
		ExamYear:     req.ExamYear,
		ExamProvince: req.ExamProvince,
		XingceScore:  req.XingceScore,
		ShenlunScore: req.ShenlunScore,
		TotalScore:   req.TotalScore,
		Rank:         req.Rank,
		PassStatus:   req.PassStatus,
		PositionName: req.PositionName,
		IsAnonymous:  req.IsAnonymous,
		Nickname:     req.Nickname,
		Comment:      req.Comment,
		Status:       model.ScoreShareStatusPublic,
		CreatedAt:    time.Now(),
	}

	if err := s.shareRepo.Create(share); err != nil {
		return nil, err
	}

	return share, nil
}

func (s *ScoreShareService) ListShares(req *ScoreShareListRequest) (*ScoreShareListResponse, error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 20
	}

	filter := &repository.ScoreShareFilter{
		ExamType:     req.ExamType,
		ExamYear:     req.ExamYear,
		ExamProvince: req.ExamProvince,
		PassStatus:   req.PassStatus,
	}

	shares, total, err := s.shareRepo.List(filter, req.Page, req.PageSize)
	if err != nil {
		return nil, err
	}

	var responses []model.ScoreShareResponse
	for _, share := range shares {
		responses = append(responses, *share.ToResponse())
	}

	return &ScoreShareListResponse{
		Shares:   responses,
		Total:    total,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, nil
}

func (s *ScoreShareService) GetShareDetail(id uint) (*model.ScoreShare, error) {
	share, err := s.shareRepo.FindByID(id)
	if err != nil {
		return nil, ErrScoreShareNotFound
	}
	return share, nil
}

func (s *ScoreShareService) GetUserShares(userID uint) ([]model.ScoreShare, error) {
	return s.shareRepo.FindByUserID(userID)
}

func (s *ScoreShareService) LikeShare(id uint) error {
	// 先检查是否存在
	_, err := s.shareRepo.FindByID(id)
	if err != nil {
		return ErrScoreShareNotFound
	}
	return s.shareRepo.IncrementLike(id)
}

func (s *ScoreShareService) GetStatistics(examType string, examYear int, examProvince string) (*model.ScoreStatistics, error) {
	stats, err := s.shareRepo.GetStatistics(examType, examYear, examProvince)
	if err != nil {
		return nil, err
	}

	// 获取分数分布
	distribution, err := s.shareRepo.GetScoreDistribution(examType, examYear, examProvince)
	if err == nil {
		stats.Distribution = distribution
	}

	return stats, nil
}

// ScoreRankingResponse 排行榜响应
type ScoreRankingResponse struct {
	Rankings []model.ScoreShareResponse `json:"rankings"`
	Total    int64                      `json:"total"`
	Page     int                        `json:"page"`
	PageSize int                        `json:"page_size"`
}

func (s *ScoreShareService) GetRanking(examType string, examYear int, examProvince string, page, pageSize int) (*ScoreRankingResponse, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	shares, total, err := s.shareRepo.GetRanking(examType, examYear, examProvince, page, pageSize)
	if err != nil {
		return nil, err
	}

	var responses []model.ScoreShareResponse
	for _, share := range shares {
		responses = append(responses, *share.ToResponse())
	}

	return &ScoreRankingResponse{
		Rankings: responses,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

func (s *ScoreShareService) UpdateShare(id uint, userID uint, req *ScoreShareCreateRequest) error {
	share, err := s.shareRepo.FindByID(id)
	if err != nil {
		return ErrScoreShareNotFound
	}

	// 检查是否是所有者
	if share.UserID == nil || *share.UserID != userID {
		return errors.New("unauthorized")
	}

	share.ExamType = req.ExamType
	share.ExamYear = req.ExamYear
	share.ExamProvince = req.ExamProvince
	share.XingceScore = req.XingceScore
	share.ShenlunScore = req.ShenlunScore
	share.TotalScore = req.TotalScore
	share.Rank = req.Rank
	share.PassStatus = req.PassStatus
	share.PositionName = req.PositionName
	share.IsAnonymous = req.IsAnonymous
	share.Nickname = req.Nickname
	share.Comment = req.Comment

	return s.shareRepo.Update(share)
}

func (s *ScoreShareService) DeleteShare(id uint, userID uint) error {
	share, err := s.shareRepo.FindByID(id)
	if err != nil {
		return ErrScoreShareNotFound
	}

	// 检查是否是所有者
	if share.UserID == nil || *share.UserID != userID {
		return errors.New("unauthorized")
	}

	return s.shareRepo.Delete(id)
}
