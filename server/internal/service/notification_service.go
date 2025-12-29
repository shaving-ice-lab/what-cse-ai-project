package service

import (
	"errors"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrNotificationNotFound = errors.New("notification not found")
)

type NotificationService struct {
	notificationRepo *repository.NotificationRepository
}

func NewNotificationService(notificationRepo *repository.NotificationRepository) *NotificationService {
	return &NotificationService{
		notificationRepo: notificationRepo,
	}
}

type NotificationListResponse struct {
	Notifications []model.UserNotification `json:"notifications"`
	Total         int64                    `json:"total"`
	UnreadCount   int64                    `json:"unread_count"`
	Page          int                      `json:"page"`
	PageSize      int                      `json:"page_size"`
}

func (s *NotificationService) GetUserNotifications(userID uint, page, pageSize int, unreadOnly bool) (*NotificationListResponse, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	notifications, total, err := s.notificationRepo.ListByUserID(userID, page, pageSize, unreadOnly)
	if err != nil {
		return nil, err
	}

	unreadCount := s.notificationRepo.GetUnreadCount(userID)

	return &NotificationListResponse{
		Notifications: notifications,
		Total:         total,
		UnreadCount:   unreadCount,
		Page:          page,
		PageSize:      pageSize,
	}, nil
}

func (s *NotificationService) MarkAsRead(userID, notificationID uint) error {
	notification, err := s.notificationRepo.FindByID(notificationID)
	if err != nil {
		return ErrNotificationNotFound
	}

	if notification.UserID != userID {
		return ErrNotificationNotFound
	}

	return s.notificationRepo.MarkAsRead(notificationID)
}

func (s *NotificationService) MarkAllAsRead(userID uint) error {
	return s.notificationRepo.MarkAllAsRead(userID)
}

func (s *NotificationService) DeleteNotification(userID, notificationID uint) error {
	notification, err := s.notificationRepo.FindByID(notificationID)
	if err != nil {
		return ErrNotificationNotFound
	}

	if notification.UserID != userID {
		return ErrNotificationNotFound
	}

	return s.notificationRepo.Delete(notificationID)
}

func (s *NotificationService) CreateNotification(userID uint, notificationType, title, content string) error {
	notification := &model.UserNotification{
		UserID:  userID,
		Type:    notificationType,
		Title:   title,
		Content: content,
		IsRead:  false,
	}
	return s.notificationRepo.Create(notification)
}

func (s *NotificationService) BroadcastNotification(userIDs []uint, notificationType, title, content string) error {
	var notifications []model.UserNotification
	for _, userID := range userIDs {
		notifications = append(notifications, model.UserNotification{
			UserID:  userID,
			Type:    notificationType,
			Title:   title,
			Content: content,
			IsRead:  false,
		})
	}
	return s.notificationRepo.BatchCreate(notifications)
}

func (s *NotificationService) GetUnreadCount(userID uint) int64 {
	return s.notificationRepo.GetUnreadCount(userID)
}
