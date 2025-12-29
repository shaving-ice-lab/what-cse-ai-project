package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type FavoriteRepository struct {
	db *gorm.DB
}

func NewFavoriteRepository(db *gorm.DB) *FavoriteRepository {
	return &FavoriteRepository{db: db}
}

func (r *FavoriteRepository) AddFavorite(userID, positionID uint) error {
	favorite := &model.UserFavorite{
		UserID:     userID,
		PositionID: positionID,
	}
	return r.db.Create(favorite).Error
}

func (r *FavoriteRepository) RemoveFavorite(userID, positionID uint) error {
	return r.db.Where("user_id = ? AND position_id = ?", userID, positionID).
		Delete(&model.UserFavorite{}).Error
}

func (r *FavoriteRepository) IsFavorite(userID, positionID uint) bool {
	var count int64
	r.db.Model(&model.UserFavorite{}).
		Where("user_id = ? AND position_id = ?", userID, positionID).
		Count(&count)
	return count > 0
}

func (r *FavoriteRepository) GetUserFavorites(userID uint, page, pageSize int) ([]model.Position, int64, error) {
	var favorites []model.UserFavorite
	var total int64

	r.db.Model(&model.UserFavorite{}).Where("user_id = ?", userID).Count(&total)

	offset := (page - 1) * pageSize
	err := r.db.Preload("Position").
		Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&favorites).Error

	if err != nil {
		return nil, 0, err
	}

	var positions []model.Position
	for _, f := range favorites {
		if f.Position != nil {
			positions = append(positions, *f.Position)
		}
	}

	return positions, total, nil
}

func (r *FavoriteRepository) GetFavoriteCount(userID uint) int64 {
	var count int64
	r.db.Model(&model.UserFavorite{}).Where("user_id = ?", userID).Count(&count)
	return count
}

// View history
type ViewRepository struct {
	db *gorm.DB
}

func NewViewRepository(db *gorm.DB) *ViewRepository {
	return &ViewRepository{db: db}
}

func (r *ViewRepository) AddView(userID, positionID uint) error {
	view := &model.UserView{
		UserID:     userID,
		PositionID: positionID,
	}
	return r.db.Create(view).Error
}

func (r *ViewRepository) GetUserViews(userID uint, page, pageSize int) ([]model.Position, int64, error) {
	var views []model.UserView
	var total int64

	r.db.Model(&model.UserView{}).Where("user_id = ?", userID).Count(&total)

	offset := (page - 1) * pageSize
	err := r.db.Preload("Position").
		Where("user_id = ?", userID).
		Order("view_time DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&views).Error

	if err != nil {
		return nil, 0, err
	}

	var positions []model.Position
	for _, v := range views {
		if v.Position != nil {
			positions = append(positions, *v.Position)
		}
	}

	return positions, total, nil
}

func (r *ViewRepository) ClearHistory(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&model.UserView{}).Error
}
