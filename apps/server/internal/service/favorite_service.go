package service

import (
	"encoding/json"
	"errors"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrFavoriteNotFound     = errors.New("favorite not found")
	ErrFavoriteAlreadyExist = errors.New("favorite already exists")
	ErrInvalidFavoriteType  = errors.New("invalid favorite type")
	ErrSubscriptionNotFound = errors.New("subscription not found")
	ErrSubscriptionExists   = errors.New("subscription already exists")
	ErrInvalidSubscribeType = errors.New("invalid subscribe type")
)

// =====================================================
// Favorite Service
// =====================================================

type FavoriteService struct {
	favoriteRepo *repository.FavoriteRepository
	positionRepo *repository.PositionRepository
}

func NewFavoriteService(favoriteRepo *repository.FavoriteRepository, positionRepo *repository.PositionRepository) *FavoriteService {
	return &FavoriteService{
		favoriteRepo: favoriteRepo,
		positionRepo: positionRepo,
	}
}

// AddFavoriteRequest 添加收藏请求
type AddFavoriteRequest struct {
	FavoriteType model.FavoriteType `json:"favorite_type" validate:"required,oneof=position announcement"`
	TargetID     string             `json:"target_id" validate:"required"`
	Note         string             `json:"note"`
	FolderID     *uint              `json:"folder_id"`
}

// AddFavorite adds a new favorite
func (s *FavoriteService) AddFavorite(userID uint, req *AddFavoriteRequest) error {
	// Validate favorite type
	if req.FavoriteType != model.FavoriteTypePosition && req.FavoriteType != model.FavoriteTypeAnnouncement {
		return ErrInvalidFavoriteType
	}

	// Check if already favorited
	if s.favoriteRepo.IsFavoriteV2(userID, req.FavoriteType, req.TargetID) {
		return ErrFavoriteAlreadyExist
	}

	// Verify target exists
	if req.FavoriteType == model.FavoriteTypePosition {
		_, err := s.positionRepo.FindByPositionID(req.TargetID)
		if err != nil {
			return ErrPositionNotFound
		}
	}
	// TODO: Add announcement validation when announcement repo is available

	return s.favoriteRepo.AddFavoriteV2(userID, req.FavoriteType, req.TargetID, req.Note, req.FolderID)
}

// RemoveFavorite removes a favorite by type and target ID
func (s *FavoriteService) RemoveFavorite(userID uint, favoriteType model.FavoriteType, targetID string) error {
	return s.favoriteRepo.RemoveFavoriteV2(userID, favoriteType, targetID)
}

// RemoveFavoriteByID removes a favorite by its ID
func (s *FavoriteService) RemoveFavoriteByID(userID, favoriteID uint) error {
	return s.favoriteRepo.RemoveFavoriteByID(userID, favoriteID)
}

// BatchRemoveFavorites removes multiple favorites
func (s *FavoriteService) BatchRemoveFavorites(userID uint, favoriteIDs []uint) error {
	return s.favoriteRepo.BatchRemoveFavorites(userID, favoriteIDs)
}

// IsFavorite checks if target is favorited
func (s *FavoriteService) IsFavorite(userID uint, favoriteType model.FavoriteType, targetID string) bool {
	return s.favoriteRepo.IsFavoriteV2(userID, favoriteType, targetID)
}

// BatchCheckFavorites checks multiple targets
func (s *FavoriteService) BatchCheckFavorites(userID uint, favoriteType model.FavoriteType, targetIDs []string) (map[string]bool, error) {
	return s.favoriteRepo.BatchCheckFavorites(userID, favoriteType, targetIDs)
}

// FavoriteListResponse 收藏列表响应
type FavoriteListResponse struct {
	Favorites []*model.FavoriteResponse `json:"favorites"`
	Total     int64                     `json:"total"`
	Page      int                       `json:"page"`
	PageSize  int                       `json:"page_size"`
	Stats     map[string]int64          `json:"stats,omitempty"`
}

// GetFavorites gets user's favorites with pagination
func (s *FavoriteService) GetFavorites(userID uint, params *repository.FavoriteQueryParams) (*FavoriteListResponse, error) {
	favorites, total, err := s.favoriteRepo.GetUserFavoritesV2(userID, params)
	if err != nil {
		return nil, err
	}

	// Convert to response
	responses := make([]*model.FavoriteResponse, len(favorites))
	for i, f := range favorites {
		responses[i] = f.ToResponse()
	}

	// Get stats
	stats, _ := s.favoriteRepo.GetFavoriteStats(userID)

	return &FavoriteListResponse{
		Favorites: responses,
		Total:     total,
		Page:      params.Page,
		PageSize:  params.PageSize,
		Stats:     stats,
	}, nil
}

// GetFavoriteStats gets favorites statistics
func (s *FavoriteService) GetFavoriteStats(userID uint) (map[string]int64, error) {
	return s.favoriteRepo.GetFavoriteStats(userID)
}

// UpdateFavoriteNote updates favorite note
func (s *FavoriteService) UpdateFavoriteNote(userID, favoriteID uint, note string) error {
	return s.favoriteRepo.UpdateFavoriteNote(userID, favoriteID, note)
}

// ExportFavoritesResponse 导出响应
type ExportFavoritesResponse struct {
	Favorites []*model.FavoriteResponse `json:"favorites"`
	ExportAt  string                    `json:"export_at"`
}

// ExportFavorites exports all favorites
func (s *FavoriteService) ExportFavorites(userID uint, favoriteType model.FavoriteType) (*ExportFavoritesResponse, error) {
	favorites, err := s.favoriteRepo.GetAllFavoritesForExport(userID, favoriteType)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.FavoriteResponse, len(favorites))
	for i, f := range favorites {
		responses[i] = f.ToResponse()
	}

	return &ExportFavoritesResponse{
		Favorites: responses,
	}, nil
}

// =====================================================
// Folder Management
// =====================================================

// CreateFolder creates a new folder
func (s *FavoriteService) CreateFolder(userID uint, name, description, color string) (*model.UserFavoriteFolder, error) {
	return s.favoriteRepo.CreateFolder(userID, name, description, color)
}

// GetFolders gets all folders
func (s *FavoriteService) GetFolders(userID uint) ([]model.UserFavoriteFolder, error) {
	return s.favoriteRepo.GetFolders(userID)
}

// UpdateFolder updates a folder
func (s *FavoriteService) UpdateFolder(userID, folderID uint, name, description, color string) error {
	updates := map[string]interface{}{
		"name": name,
	}
	if description != "" {
		updates["description"] = description
	}
	if color != "" {
		updates["color"] = color
	}
	return s.favoriteRepo.UpdateFolder(userID, folderID, updates)
}

// DeleteFolder deletes a folder
func (s *FavoriteService) DeleteFolder(userID, folderID uint) error {
	return s.favoriteRepo.DeleteFolder(userID, folderID)
}

// MoveFavoriteToFolder moves a favorite to a folder
func (s *FavoriteService) MoveFavoriteToFolder(userID, favoriteID uint, folderID *uint) error {
	return s.favoriteRepo.UpdateFavoriteFolder(userID, favoriteID, folderID)
}

// =====================================================
// Subscription Service
// =====================================================

type SubscriptionService struct {
	subscriptionRepo *repository.SubscriptionRepository
}

func NewSubscriptionService(subscriptionRepo *repository.SubscriptionRepository) *SubscriptionService {
	return &SubscriptionService{
		subscriptionRepo: subscriptionRepo,
	}
}

// CreateSubscriptionRequest 创建订阅请求
type CreateSubscriptionRequest struct {
	SubscribeType  model.SubscribeType `json:"subscribe_type" validate:"required"`
	SubscribeValue string              `json:"subscribe_value" validate:"required"`
	SubscribeName  string              `json:"subscribe_name" validate:"required"`
	NotifyOnNew    *bool               `json:"notify_on_new"`
	NotifyChannels []string            `json:"notify_channels"`
}

// Create creates a new subscription
func (s *SubscriptionService) Create(userID uint, req *CreateSubscriptionRequest) (*model.UserSubscription, error) {
	// Validate subscribe type
	validType := false
	for _, t := range model.SubscribeTypeList {
		if t == string(req.SubscribeType) {
			validType = true
			break
		}
	}
	if !validType {
		return nil, ErrInvalidSubscribeType
	}

	// Check if already subscribed
	if s.subscriptionRepo.Exists(userID, req.SubscribeType, req.SubscribeValue) {
		return nil, ErrSubscriptionExists
	}

	// Set defaults
	notifyOnNew := true
	if req.NotifyOnNew != nil {
		notifyOnNew = *req.NotifyOnNew
	}

	notifyChannels := []string{"push"}
	if len(req.NotifyChannels) > 0 {
		notifyChannels = req.NotifyChannels
	}
	channelsJSON, _ := json.Marshal(notifyChannels)

	subscription := &model.UserSubscription{
		UserID:         userID,
		SubscribeType:  req.SubscribeType,
		SubscribeValue: req.SubscribeValue,
		SubscribeName:  req.SubscribeName,
		NotifyOnNew:    notifyOnNew,
		NotifyChannels: string(channelsJSON),
		IsEnabled:      true,
	}

	err := s.subscriptionRepo.Create(subscription)
	if err != nil {
		return nil, err
	}

	return subscription, nil
}

// GetByID gets a subscription by ID
func (s *SubscriptionService) GetByID(userID, subscriptionID uint) (*model.UserSubscription, error) {
	return s.subscriptionRepo.GetByID(userID, subscriptionID)
}

// SubscriptionListResponse 订阅列表响应
type SubscriptionListResponse struct {
	Subscriptions []model.SubscriptionResponse `json:"subscriptions"`
	Total         int64                        `json:"total"`
	Page          int                          `json:"page"`
	PageSize      int                          `json:"page_size"`
}

// List gets all subscriptions for a user
func (s *SubscriptionService) List(userID uint, page, pageSize int) (*SubscriptionListResponse, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	subscriptions, total, err := s.subscriptionRepo.GetByUserID(userID, page, pageSize)
	if err != nil {
		return nil, err
	}

	// Convert to response
	responses := make([]model.SubscriptionResponse, len(subscriptions))
	for i, sub := range subscriptions {
		var channels []string
		json.Unmarshal([]byte(sub.NotifyChannels), &channels)

		responses[i] = model.SubscriptionResponse{
			ID:             sub.ID,
			SubscribeType:  sub.SubscribeType,
			SubscribeValue: sub.SubscribeValue,
			SubscribeName:  sub.SubscribeName,
			NotifyOnNew:    sub.NotifyOnNew,
			NotifyChannels: channels,
			IsEnabled:      sub.IsEnabled,
			LastNotifyAt:   sub.LastNotifyAt,
			CreatedAt:      sub.CreatedAt,
		}
	}

	return &SubscriptionListResponse{
		Subscriptions: responses,
		Total:         total,
		Page:          page,
		PageSize:      pageSize,
	}, nil
}

// UpdateSubscriptionRequest 更新订阅请求
type UpdateSubscriptionRequest struct {
	SubscribeName  string   `json:"subscribe_name"`
	NotifyOnNew    *bool    `json:"notify_on_new"`
	NotifyChannels []string `json:"notify_channels"`
}

// Update updates a subscription
func (s *SubscriptionService) Update(userID, subscriptionID uint, req *UpdateSubscriptionRequest) error {
	updates := make(map[string]interface{})

	if req.SubscribeName != "" {
		updates["subscribe_name"] = req.SubscribeName
	}
	if req.NotifyOnNew != nil {
		updates["notify_on_new"] = *req.NotifyOnNew
	}
	if len(req.NotifyChannels) > 0 {
		channelsJSON, _ := json.Marshal(req.NotifyChannels)
		updates["notify_channels"] = string(channelsJSON)
	}

	if len(updates) == 0 {
		return nil
	}

	return s.subscriptionRepo.Update(userID, subscriptionID, updates)
}

// Toggle toggles subscription enabled status
func (s *SubscriptionService) Toggle(userID, subscriptionID uint) error {
	return s.subscriptionRepo.Toggle(userID, subscriptionID)
}

// Delete deletes a subscription
func (s *SubscriptionService) Delete(userID, subscriptionID uint) error {
	return s.subscriptionRepo.Delete(userID, subscriptionID)
}

// GetSubscriptionCount gets total subscription count
func (s *SubscriptionService) GetSubscriptionCount(userID uint) int64 {
	return s.subscriptionRepo.GetSubscriptionCount(userID)
}
