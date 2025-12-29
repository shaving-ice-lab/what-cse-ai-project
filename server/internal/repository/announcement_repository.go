package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type AnnouncementRepository struct {
	db *gorm.DB
}

func NewAnnouncementRepository(db *gorm.DB) *AnnouncementRepository {
	return &AnnouncementRepository{db: db}
}

type AnnouncementFilter struct {
	AnnouncementType string `query:"announcement_type"`
	ExamType         string `query:"exam_type"`
	Province         string `query:"province"`
	City             string `query:"city"`
	Keyword          string `query:"keyword"`
	Status           *int   `query:"status"`
}

func (r *AnnouncementRepository) Create(announcement *model.Announcement) error {
	return r.db.Create(announcement).Error
}

func (r *AnnouncementRepository) FindByID(id uint) (*model.Announcement, error) {
	var announcement model.Announcement
	err := r.db.First(&announcement, id).Error
	if err != nil {
		return nil, err
	}
	return &announcement, nil
}

func (r *AnnouncementRepository) Update(announcement *model.Announcement) error {
	return r.db.Save(announcement).Error
}

func (r *AnnouncementRepository) Delete(id uint) error {
	return r.db.Delete(&model.Announcement{}, id).Error
}

func (r *AnnouncementRepository) List(filter *AnnouncementFilter, page, pageSize int) ([]model.Announcement, int64, error) {
	var announcements []model.Announcement
	var total int64

	query := r.db.Model(&model.Announcement{})

	if filter != nil {
		if filter.AnnouncementType != "" {
			query = query.Where("announcement_type = ?", filter.AnnouncementType)
		}
		if filter.ExamType != "" {
			query = query.Where("exam_type = ?", filter.ExamType)
		}
		if filter.Province != "" {
			query = query.Where("province = ?", filter.Province)
		}
		if filter.City != "" {
			query = query.Where("city = ?", filter.City)
		}
		if filter.Keyword != "" {
			keyword := "%" + filter.Keyword + "%"
			query = query.Where("title LIKE ? OR content LIKE ?", keyword, keyword)
		}
		if filter.Status != nil {
			query = query.Where("status = ?", *filter.Status)
		} else {
			query = query.Where("status = ?", model.AnnouncementStatusPublished)
		}
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Order("publish_date DESC").Offset(offset).Limit(pageSize).Find(&announcements).Error
	if err != nil {
		return nil, 0, err
	}

	return announcements, total, nil
}

func (r *AnnouncementRepository) FindWithPositions(id uint) (*model.Announcement, error) {
	var announcement model.Announcement
	err := r.db.Preload("Positions").First(&announcement, id).Error
	if err != nil {
		return nil, err
	}
	return &announcement, nil
}

func (r *AnnouncementRepository) Search(keyword string, page, pageSize int) ([]model.Announcement, int64, error) {
	var announcements []model.Announcement
	var total int64

	query := r.db.Model(&model.Announcement{}).
		Where("status = ?", model.AnnouncementStatusPublished).
		Where("title LIKE ? OR content LIKE ?", "%"+keyword+"%", "%"+keyword+"%")

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Order("publish_date DESC").Offset(offset).Limit(pageSize).Find(&announcements).Error
	if err != nil {
		return nil, 0, err
	}

	return announcements, total, nil
}

func (r *AnnouncementRepository) GetLatest(limit int) ([]model.Announcement, error) {
	var announcements []model.Announcement
	err := r.db.Where("status = ?", model.AnnouncementStatusPublished).
		Order("publish_date DESC").
		Limit(limit).
		Find(&announcements).Error
	if err != nil {
		return nil, err
	}
	return announcements, nil
}
