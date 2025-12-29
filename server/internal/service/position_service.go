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

type PositionListResponse struct {
	Positions []model.Position `json:"positions"`
	Total     int64            `json:"total"`
	Page      int              `json:"page"`
	PageSize  int              `json:"page_size"`
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
func (s *PositionService) AddFavorite(userID, positionID uint) error {
	// Check if position exists
	_, err := s.positionRepo.FindByID(positionID)
	if err != nil {
		return ErrPositionNotFound
	}

	return s.favoriteRepo.AddFavorite(userID, positionID)
}

func (s *PositionService) RemoveFavorite(userID, positionID uint) error {
	return s.favoriteRepo.RemoveFavorite(userID, positionID)
}

func (s *PositionService) GetUserFavorites(userID uint, page, pageSize int) ([]model.Position, int64, error) {
	return s.favoriteRepo.GetUserFavorites(userID, page, pageSize)
}

func (s *PositionService) IsFavorite(userID, positionID uint) bool {
	return s.favoriteRepo.IsFavorite(userID, positionID)
}
