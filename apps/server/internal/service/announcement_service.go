package service

import (
	"errors"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrAnnouncementNotFound = errors.New("announcement not found")
)

type AnnouncementService struct {
	announcementRepo *repository.AnnouncementRepository
}

func NewAnnouncementService(announcementRepo *repository.AnnouncementRepository) *AnnouncementService {
	return &AnnouncementService{
		announcementRepo: announcementRepo,
	}
}

type AnnouncementListRequest struct {
	AnnouncementType string `query:"announcement_type"`
	ExamType         string `query:"exam_type"`
	Province         string `query:"province"`
	City             string `query:"city"`
	Keyword          string `query:"keyword"`
	Page             int    `query:"page"`
	PageSize         int    `query:"page_size"`
}

type AnnouncementListResponse struct {
	Announcements []model.Announcement `json:"announcements"`
	Total         int64                `json:"total"`
	Page          int                  `json:"page"`
	PageSize      int                  `json:"page_size"`
}

func (s *AnnouncementService) ListAnnouncements(req *AnnouncementListRequest) (*AnnouncementListResponse, error) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 20
	}

	filter := &repository.AnnouncementFilter{
		AnnouncementType: req.AnnouncementType,
		ExamType:         req.ExamType,
		Province:         req.Province,
		City:             req.City,
		Keyword:          req.Keyword,
	}

	announcements, total, err := s.announcementRepo.List(filter, req.Page, req.PageSize)
	if err != nil {
		return nil, err
	}

	return &AnnouncementListResponse{
		Announcements: announcements,
		Total:         total,
		Page:          req.Page,
		PageSize:      req.PageSize,
	}, nil
}

func (s *AnnouncementService) GetAnnouncementDetail(id uint) (*model.Announcement, error) {
	announcement, err := s.announcementRepo.FindWithPositions(id)
	if err != nil {
		return nil, ErrAnnouncementNotFound
	}
	return announcement, nil
}

func (s *AnnouncementService) SearchAnnouncements(keyword string, page, pageSize int) (*AnnouncementListResponse, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	announcements, total, err := s.announcementRepo.Search(keyword, page, pageSize)
	if err != nil {
		return nil, err
	}

	return &AnnouncementListResponse{
		Announcements: announcements,
		Total:         total,
		Page:          page,
		PageSize:      pageSize,
	}, nil
}

func (s *AnnouncementService) GetLatestAnnouncements(limit int) ([]model.Announcement, error) {
	if limit <= 0 || limit > 20 {
		limit = 10
	}
	return s.announcementRepo.GetLatest(limit)
}
