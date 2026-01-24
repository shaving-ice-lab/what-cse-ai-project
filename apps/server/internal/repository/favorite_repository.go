package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type FavoriteRepository struct {
	db *gorm.DB
}

func NewFavoriteRepository(db *gorm.DB) *FavoriteRepository {
	return &FavoriteRepository{db: db}
}

// AddFavorite adds a position to user's favorites
// positionID is the string position_id from positions table
func (r *FavoriteRepository) AddFavorite(userID uint, positionID string) error {
	favorite := &model.UserFavorite{
		UserID:     userID,
		PositionID: positionID,
	}
	return r.db.Create(favorite).Error
}

func (r *FavoriteRepository) RemoveFavorite(userID uint, positionID string) error {
	return r.db.Where("user_id = ? AND position_id = ?", userID, positionID).
		Delete(&model.UserFavorite{}).Error
}

func (r *FavoriteRepository) IsFavorite(userID uint, positionID string) bool {
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
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&favorites).Error

	if err != nil {
		return nil, 0, err
	}

	if len(favorites) == 0 {
		return []model.Position{}, total, nil
	}

	// Collect position IDs
	positionIDs := make([]string, len(favorites))
	for i, f := range favorites {
		positionIDs[i] = f.PositionID
	}

	// Load positions by position_id (string)
	var positions []model.Position
	err = r.db.Where("position_id IN ?", positionIDs).Find(&positions).Error
	if err != nil {
		return nil, 0, err
	}

	// Create a map for quick lookup
	positionMap := make(map[string]model.Position)
	for _, p := range positions {
		positionMap[p.PositionID] = p
	}

	// Maintain order from favorites
	var result []model.Position
	for _, f := range favorites {
		if p, ok := positionMap[f.PositionID]; ok {
			result = append(result, p)
		}
	}

	return result, total, nil
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

// AddView records a user viewing a position
// If the user has already viewed this position, update the view_time and increment view_count
func (r *ViewRepository) AddView(userID uint, positionID string) error {
	view := &model.UserView{
		UserID:     userID,
		PositionID: positionID,
		ViewTime:   time.Now(),
		ViewCount:  1,
	}
	// Use upsert to update view_time and view_count if record exists
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "position_id"}},
		DoUpdates: clause.Assignments(map[string]interface{}{"view_time": time.Now(), "view_count": gorm.Expr("view_count + 1")}),
	}).Create(view).Error
}

func (r *ViewRepository) GetUserViews(userID uint, page, pageSize int) ([]model.Position, int64, error) {
	var views []model.UserView
	var total int64

	r.db.Model(&model.UserView{}).Where("user_id = ?", userID).Count(&total)

	offset := (page - 1) * pageSize
	err := r.db.Where("user_id = ?", userID).
		Order("view_time DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&views).Error

	if err != nil {
		return nil, 0, err
	}

	if len(views) == 0 {
		return []model.Position{}, total, nil
	}

	// Collect position IDs
	positionIDs := make([]string, len(views))
	for i, v := range views {
		positionIDs[i] = v.PositionID
	}

	// Load positions by position_id (string)
	var positions []model.Position
	err = r.db.Where("position_id IN ?", positionIDs).Find(&positions).Error
	if err != nil {
		return nil, 0, err
	}

	// Create a map for quick lookup
	positionMap := make(map[string]model.Position)
	for _, p := range positions {
		positionMap[p.PositionID] = p
	}

	// Maintain order from views
	var result []model.Position
	for _, v := range views {
		if p, ok := positionMap[v.PositionID]; ok {
			result = append(result, p)
		}
	}

	return result, total, nil
}

func (r *ViewRepository) ClearHistory(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&model.UserView{}).Error
}
