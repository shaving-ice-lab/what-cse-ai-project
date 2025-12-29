package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type ListPageRepository struct {
	db *gorm.DB
}

func NewListPageRepository(db *gorm.DB) *ListPageRepository {
	return &ListPageRepository{db: db}
}

func (r *ListPageRepository) Create(listPage *model.ListPage) error {
	return r.db.Create(listPage).Error
}

func (r *ListPageRepository) FindByID(id uint) (*model.ListPage, error) {
	var listPage model.ListPage
	err := r.db.First(&listPage, id).Error
	if err != nil {
		return nil, err
	}
	return &listPage, nil
}

func (r *ListPageRepository) FindByURL(url string) (*model.ListPage, error) {
	var listPage model.ListPage
	err := r.db.Where("url = ?", url).First(&listPage).Error
	if err != nil {
		return nil, err
	}
	return &listPage, nil
}

func (r *ListPageRepository) List(status string, page, pageSize int) ([]model.ListPage, int64, error) {
	var listPages []model.ListPage
	var total int64

	query := r.db.Model(&model.ListPage{})
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&listPages).Error; err != nil {
		return nil, 0, err
	}

	return listPages, total, nil
}

func (r *ListPageRepository) Update(listPage *model.ListPage) error {
	return r.db.Save(listPage).Error
}

func (r *ListPageRepository) UpdateStatus(id uint, status string) error {
	return r.db.Model(&model.ListPage{}).Where("id = ?", id).Update("status", status).Error
}

func (r *ListPageRepository) Delete(id uint) error {
	return r.db.Delete(&model.ListPage{}, id).Error
}

func (r *ListPageRepository) GetStatsByStatus() (map[string]int64, error) {
	var results []struct {
		Status string
		Count  int64
	}

	err := r.db.Model(&model.ListPage{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	for _, r := range results {
		stats[r.Status] = r.Count
	}
	return stats, nil
}

func (r *ListPageRepository) GetTotalCount() (int64, error) {
	var count int64
	err := r.db.Model(&model.ListPage{}).Count(&count).Error
	return count, err
}
