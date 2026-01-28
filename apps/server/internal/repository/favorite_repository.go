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

// =====================================================
// 收藏相关方法
// =====================================================

// AddFavorite adds a position to user's favorites (legacy support)
// positionID is the string position_id from positions table
func (r *FavoriteRepository) AddFavorite(userID uint, positionID string) error {
	favorite := &model.UserFavorite{
		UserID:       userID,
		FavoriteType: model.FavoriteTypePosition,
		TargetID:     positionID,
		PositionID:   positionID, // Legacy support
	}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "favorite_type"}, {Name: "target_id"}},
		DoNothing: true,
	}).Create(favorite).Error
}

// AddFavoriteV2 adds a favorite with type
func (r *FavoriteRepository) AddFavoriteV2(userID uint, favoriteType model.FavoriteType, targetID string, note string, folderID *uint) error {
	favorite := &model.UserFavorite{
		UserID:       userID,
		FavoriteType: favoriteType,
		TargetID:     targetID,
		Note:         note,
		FolderID:     folderID,
	}
	// Also set legacy PositionID for backwards compatibility
	if favoriteType == model.FavoriteTypePosition {
		favorite.PositionID = targetID
	}
	return r.db.Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "user_id"}, {Name: "favorite_type"}, {Name: "target_id"}},
		DoNothing: true,
	}).Create(favorite).Error
}

func (r *FavoriteRepository) RemoveFavorite(userID uint, positionID string) error {
	return r.db.Where("user_id = ? AND target_id = ? AND favorite_type = ?", userID, positionID, model.FavoriteTypePosition).
		Delete(&model.UserFavorite{}).Error
}

// RemoveFavoriteV2 removes a favorite by type and target ID
func (r *FavoriteRepository) RemoveFavoriteV2(userID uint, favoriteType model.FavoriteType, targetID string) error {
	return r.db.Where("user_id = ? AND favorite_type = ? AND target_id = ?", userID, favoriteType, targetID).
		Delete(&model.UserFavorite{}).Error
}

// RemoveFavoriteByID removes a favorite by ID
func (r *FavoriteRepository) RemoveFavoriteByID(userID, favoriteID uint) error {
	return r.db.Where("id = ? AND user_id = ?", favoriteID, userID).
		Delete(&model.UserFavorite{}).Error
}

// BatchRemoveFavorites removes multiple favorites
func (r *FavoriteRepository) BatchRemoveFavorites(userID uint, favoriteIDs []uint) error {
	return r.db.Where("id IN ? AND user_id = ?", favoriteIDs, userID).
		Delete(&model.UserFavorite{}).Error
}

func (r *FavoriteRepository) IsFavorite(userID uint, positionID string) bool {
	var count int64
	r.db.Model(&model.UserFavorite{}).
		Where("user_id = ? AND target_id = ? AND favorite_type = ?", userID, positionID, model.FavoriteTypePosition).
		Count(&count)
	return count > 0
}

// IsFavoriteV2 checks if target is favorited
func (r *FavoriteRepository) IsFavoriteV2(userID uint, favoriteType model.FavoriteType, targetID string) bool {
	var count int64
	r.db.Model(&model.UserFavorite{}).
		Where("user_id = ? AND favorite_type = ? AND target_id = ?", userID, favoriteType, targetID).
		Count(&count)
	return count > 0
}

// BatchCheckFavorites checks multiple targets' favorite status
func (r *FavoriteRepository) BatchCheckFavorites(userID uint, favoriteType model.FavoriteType, targetIDs []string) (map[string]bool, error) {
	var favorites []model.UserFavorite
	err := r.db.Where("user_id = ? AND favorite_type = ? AND target_id IN ?", userID, favoriteType, targetIDs).
		Select("target_id").
		Find(&favorites).Error
	if err != nil {
		return nil, err
	}

	result := make(map[string]bool)
	for _, targetID := range targetIDs {
		result[targetID] = false
	}
	for _, f := range favorites {
		result[f.TargetID] = true
	}
	return result, nil
}

func (r *FavoriteRepository) GetUserFavorites(userID uint, page, pageSize int) ([]model.Position, int64, error) {
	var favorites []model.UserFavorite
	var total int64

	r.db.Model(&model.UserFavorite{}).
		Where("user_id = ? AND favorite_type = ?", userID, model.FavoriteTypePosition).
		Count(&total)

	offset := (page - 1) * pageSize
	err := r.db.Where("user_id = ? AND favorite_type = ?", userID, model.FavoriteTypePosition).
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
		positionIDs[i] = f.TargetID
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
		if p, ok := positionMap[f.TargetID]; ok {
			result = append(result, p)
		}
	}

	return result, total, nil
}

// FavoriteQueryParams 收藏查询参数
type FavoriteQueryParams struct {
	FavoriteType model.FavoriteType `query:"favorite_type"`
	FolderID     *uint              `query:"folder_id"`
	Keyword      string             `query:"keyword"`
	Page         int                `query:"page"`
	PageSize     int                `query:"page_size"`
}

// GetUserFavoritesV2 gets user favorites with full information
func (r *FavoriteRepository) GetUserFavoritesV2(userID uint, params *FavoriteQueryParams) ([]model.UserFavorite, int64, error) {
	var favorites []model.UserFavorite
	var total int64

	query := r.db.Model(&model.UserFavorite{}).Where("user_id = ?", userID)

	// Apply filters
	if params.FavoriteType != "" {
		query = query.Where("favorite_type = ?", params.FavoriteType)
	}
	if params.FolderID != nil {
		query = query.Where("folder_id = ?", *params.FolderID)
	}

	// Count total
	query.Count(&total)

	// Pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&favorites).Error

	if err != nil {
		return nil, 0, err
	}

	// Load related data
	if len(favorites) > 0 {
		r.loadFavoriteRelations(&favorites)
	}

	return favorites, total, nil
}

// loadFavoriteRelations loads positions and announcements for favorites
func (r *FavoriteRepository) loadFavoriteRelations(favorites *[]model.UserFavorite) {
	positionIDs := []string{}
	announcementIDs := []string{}

	for _, f := range *favorites {
		switch f.FavoriteType {
		case model.FavoriteTypePosition:
			positionIDs = append(positionIDs, f.TargetID)
		case model.FavoriteTypeAnnouncement:
			announcementIDs = append(announcementIDs, f.TargetID)
		}
	}

	// Load positions
	positionMap := make(map[string]*model.Position)
	if len(positionIDs) > 0 {
		var positions []model.Position
		r.db.Where("position_id IN ?", positionIDs).Find(&positions)
		for i := range positions {
			positionMap[positions[i].PositionID] = &positions[i]
		}
	}

	// Load announcements
	announcementMap := make(map[string]*model.Announcement)
	if len(announcementIDs) > 0 {
		var announcements []model.Announcement
		r.db.Where("id IN ?", announcementIDs).Find(&announcements)
		for i := range announcements {
			announcementMap[string(rune(announcements[i].ID))] = &announcements[i]
		}
	}

	// Associate
	for i := range *favorites {
		switch (*favorites)[i].FavoriteType {
		case model.FavoriteTypePosition:
			(*favorites)[i].Position = positionMap[(*favorites)[i].TargetID]
		case model.FavoriteTypeAnnouncement:
			(*favorites)[i].Announcement = announcementMap[(*favorites)[i].TargetID]
		}
	}
}

func (r *FavoriteRepository) GetFavoriteCount(userID uint) int64 {
	var count int64
	r.db.Model(&model.UserFavorite{}).Where("user_id = ?", userID).Count(&count)
	return count
}

// GetFavoriteCountByType gets count by favorite type
func (r *FavoriteRepository) GetFavoriteCountByType(userID uint, favoriteType model.FavoriteType) int64 {
	var count int64
	r.db.Model(&model.UserFavorite{}).
		Where("user_id = ? AND favorite_type = ?", userID, favoriteType).
		Count(&count)
	return count
}

// GetFavoriteStats gets statistics of user's favorites
func (r *FavoriteRepository) GetFavoriteStats(userID uint) (map[string]int64, error) {
	type Result struct {
		FavoriteType string
		Count        int64
	}
	var results []Result

	err := r.db.Model(&model.UserFavorite{}).
		Select("favorite_type, count(*) as count").
		Where("user_id = ?", userID).
		Group("favorite_type").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	for _, r := range results {
		stats[r.FavoriteType] = r.Count
	}
	return stats, nil
}

// UpdateFavoriteNote updates the note of a favorite
func (r *FavoriteRepository) UpdateFavoriteNote(userID, favoriteID uint, note string) error {
	return r.db.Model(&model.UserFavorite{}).
		Where("id = ? AND user_id = ?", favoriteID, userID).
		Update("note", note).Error
}

// UpdateFavoriteFolder moves favorite to another folder
func (r *FavoriteRepository) UpdateFavoriteFolder(userID, favoriteID uint, folderID *uint) error {
	return r.db.Model(&model.UserFavorite{}).
		Where("id = ? AND user_id = ?", favoriteID, userID).
		Update("folder_id", folderID).Error
}

// GetAllFavoritesForExport gets all favorites for export
func (r *FavoriteRepository) GetAllFavoritesForExport(userID uint, favoriteType model.FavoriteType) ([]model.UserFavorite, error) {
	var favorites []model.UserFavorite
	query := r.db.Where("user_id = ?", userID)
	if favoriteType != "" {
		query = query.Where("favorite_type = ?", favoriteType)
	}
	err := query.Order("created_at DESC").Find(&favorites).Error
	if err != nil {
		return nil, err
	}

	if len(favorites) > 0 {
		r.loadFavoriteRelations(&favorites)
	}
	return favorites, nil
}

// =====================================================
// 收藏夹相关方法
// =====================================================

// CreateFolder creates a new favorite folder
func (r *FavoriteRepository) CreateFolder(userID uint, name, description, color string) (*model.UserFavoriteFolder, error) {
	folder := &model.UserFavoriteFolder{
		UserID:      userID,
		Name:        name,
		Description: description,
		Color:       color,
	}
	err := r.db.Create(folder).Error
	return folder, err
}

// GetFolders gets all folders for a user
func (r *FavoriteRepository) GetFolders(userID uint) ([]model.UserFavoriteFolder, error) {
	var folders []model.UserFavoriteFolder
	err := r.db.Where("user_id = ?", userID).
		Order("sort_order ASC, created_at ASC").
		Find(&folders).Error
	return folders, err
}

// UpdateFolder updates a folder
func (r *FavoriteRepository) UpdateFolder(userID, folderID uint, updates map[string]interface{}) error {
	return r.db.Model(&model.UserFavoriteFolder{}).
		Where("id = ? AND user_id = ?", folderID, userID).
		Updates(updates).Error
}

// DeleteFolder deletes a folder (moves favorites to no folder)
func (r *FavoriteRepository) DeleteFolder(userID, folderID uint) error {
	// First move all favorites in this folder to no folder
	r.db.Model(&model.UserFavorite{}).
		Where("user_id = ? AND folder_id = ?", userID, folderID).
		Update("folder_id", nil)

	// Then delete the folder
	return r.db.Where("id = ? AND user_id = ?", folderID, userID).
		Delete(&model.UserFavoriteFolder{}).Error
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

// =====================================================
// 订阅 Repository
// =====================================================

type SubscriptionRepository struct {
	db *gorm.DB
}

func NewSubscriptionRepository(db *gorm.DB) *SubscriptionRepository {
	return &SubscriptionRepository{db: db}
}

// Create creates a new subscription
func (r *SubscriptionRepository) Create(subscription *model.UserSubscription) error {
	return r.db.Create(subscription).Error
}

// GetByID gets subscription by ID
func (r *SubscriptionRepository) GetByID(userID, subscriptionID uint) (*model.UserSubscription, error) {
	var subscription model.UserSubscription
	err := r.db.Where("id = ? AND user_id = ?", subscriptionID, userID).First(&subscription).Error
	if err != nil {
		return nil, err
	}
	return &subscription, nil
}

// GetByUserID gets all subscriptions for a user
func (r *SubscriptionRepository) GetByUserID(userID uint, page, pageSize int) ([]model.UserSubscription, int64, error) {
	var subscriptions []model.UserSubscription
	var total int64

	r.db.Model(&model.UserSubscription{}).Where("user_id = ?", userID).Count(&total)

	offset := (page - 1) * pageSize
	err := r.db.Where("user_id = ?", userID).
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&subscriptions).Error

	return subscriptions, total, err
}

// GetByType gets subscriptions by type
func (r *SubscriptionRepository) GetByType(userID uint, subscribeType model.SubscribeType) ([]model.UserSubscription, error) {
	var subscriptions []model.UserSubscription
	err := r.db.Where("user_id = ? AND subscribe_type = ?", userID, subscribeType).
		Find(&subscriptions).Error
	return subscriptions, err
}

// GetEnabledSubscriptions gets all enabled subscriptions for a user
func (r *SubscriptionRepository) GetEnabledSubscriptions(userID uint) ([]model.UserSubscription, error) {
	var subscriptions []model.UserSubscription
	err := r.db.Where("user_id = ? AND is_enabled = ?", userID, true).
		Find(&subscriptions).Error
	return subscriptions, err
}

// Update updates a subscription
func (r *SubscriptionRepository) Update(userID, subscriptionID uint, updates map[string]interface{}) error {
	return r.db.Model(&model.UserSubscription{}).
		Where("id = ? AND user_id = ?", subscriptionID, userID).
		Updates(updates).Error
}

// Toggle toggles subscription enabled status
func (r *SubscriptionRepository) Toggle(userID, subscriptionID uint) error {
	return r.db.Exec(`
		UPDATE what_user_subscriptions 
		SET is_enabled = NOT is_enabled, updated_at = NOW() 
		WHERE id = ? AND user_id = ?
	`, subscriptionID, userID).Error
}

// Delete deletes a subscription
func (r *SubscriptionRepository) Delete(userID, subscriptionID uint) error {
	return r.db.Where("id = ? AND user_id = ?", subscriptionID, userID).
		Delete(&model.UserSubscription{}).Error
}

// Exists checks if a subscription already exists
func (r *SubscriptionRepository) Exists(userID uint, subscribeType model.SubscribeType, subscribeValue string) bool {
	var count int64
	r.db.Model(&model.UserSubscription{}).
		Where("user_id = ? AND subscribe_type = ? AND subscribe_value = ?", userID, subscribeType, subscribeValue).
		Count(&count)
	return count > 0
}

// GetSubscriptionCount gets total subscription count for a user
func (r *SubscriptionRepository) GetSubscriptionCount(userID uint) int64 {
	var count int64
	r.db.Model(&model.UserSubscription{}).Where("user_id = ?", userID).Count(&count)
	return count
}

// GetAllSubscriptionsForMatching gets all enabled subscriptions for matching new positions/announcements
func (r *SubscriptionRepository) GetAllSubscriptionsForMatching() ([]model.UserSubscription, error) {
	var subscriptions []model.UserSubscription
	err := r.db.Where("is_enabled = ? AND notify_on_new = ?", true, true).
		Find(&subscriptions).Error
	return subscriptions, err
}

// UpdateLastNotifyTime updates the last notification time
func (r *SubscriptionRepository) UpdateLastNotifyTime(subscriptionID uint) error {
	now := time.Now()
	return r.db.Model(&model.UserSubscription{}).
		Where("id = ?", subscriptionID).
		Update("last_notify_at", now).Error
}
