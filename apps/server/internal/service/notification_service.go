package service

import (
	"errors"
	"fmt"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrNotificationNotFound = errors.New("notification not found")
)

// NotificationChannel 通知渠道接口
type NotificationChannel interface {
	Send(notification *model.UserNotification, userContact string) error
	ChannelType() model.NotifyChannel
}

// EmailChannel 邮件通知渠道
type EmailChannel struct {
	smtpHost     string
	smtpPort     int
	smtpUser     string
	smtpPassword string
	fromAddress  string
}

// NewEmailChannel 创建邮件通知渠道
func NewEmailChannel(host string, port int, user, password, from string) *EmailChannel {
	return &EmailChannel{
		smtpHost:     host,
		smtpPort:     port,
		smtpUser:     user,
		smtpPassword: password,
		fromAddress:  from,
	}
}

func (c *EmailChannel) Send(notification *model.UserNotification, email string) error {
	// TODO: Implement actual email sending using SMTP
	// For now, just log the notification
	fmt.Printf("Email notification to %s: %s - %s\n", email, notification.Title, notification.Content)
	return nil
}

func (c *EmailChannel) ChannelType() model.NotifyChannel {
	return model.NotifyChannelEmail
}

// PushChannel 站内推送渠道（默认）
type PushChannel struct{}

func NewPushChannel() *PushChannel {
	return &PushChannel{}
}

func (c *PushChannel) Send(notification *model.UserNotification, _ string) error {
	// Push notifications are already saved to the database
	return nil
}

func (c *PushChannel) ChannelType() model.NotifyChannel {
	return model.NotifyChannelPush
}

// WechatChannel 微信通知渠道
type WechatChannel struct {
	appID     string
	appSecret string
}

func NewWechatChannel(appID, appSecret string) *WechatChannel {
	return &WechatChannel{
		appID:     appID,
		appSecret: appSecret,
	}
}

func (c *WechatChannel) Send(notification *model.UserNotification, openID string) error {
	// TODO: Implement WeChat template message sending
	fmt.Printf("WeChat notification to %s: %s - %s\n", openID, notification.Title, notification.Content)
	return nil
}

func (c *WechatChannel) ChannelType() model.NotifyChannel {
	return model.NotifyChannelWechat
}

// SMSChannel 短信通知渠道
type SMSChannel struct {
	accessKey    string
	accessSecret string
	signName     string
	templateCode string
}

func NewSMSChannel(accessKey, accessSecret, signName, templateCode string) *SMSChannel {
	return &SMSChannel{
		accessKey:    accessKey,
		accessSecret: accessSecret,
		signName:     signName,
		templateCode: templateCode,
	}
}

func (c *SMSChannel) Send(notification *model.UserNotification, phone string) error {
	// TODO: Implement SMS sending using Aliyun/Tencent SMS service
	fmt.Printf("SMS notification to %s: %s\n", phone, notification.Title)
	return nil
}

func (c *SMSChannel) ChannelType() model.NotifyChannel {
	return model.NotifyChannelSMS
}

type NotificationService struct {
	notificationRepo *repository.NotificationRepository
	channels         map[model.NotifyChannel]NotificationChannel
}

func NewNotificationService(notificationRepo *repository.NotificationRepository) *NotificationService {
	service := &NotificationService{
		notificationRepo: notificationRepo,
		channels:         make(map[model.NotifyChannel]NotificationChannel),
	}

	// Register default push channel
	service.RegisterChannel(NewPushChannel())

	return service
}

// RegisterChannel 注册通知渠道
func (s *NotificationService) RegisterChannel(channel NotificationChannel) {
	s.channels[channel.ChannelType()] = channel
}

// GetChannel 获取通知渠道
func (s *NotificationService) GetChannel(channelType model.NotifyChannel) (NotificationChannel, bool) {
	channel, ok := s.channels[channelType]
	return channel, ok
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

// GetUserNotificationsWithFilters 带筛选条件的通知列表查询
func (s *NotificationService) GetUserNotificationsWithFilters(userID uint, page, pageSize int, filters repository.NotificationFilters) (*NotificationListResponse, error) {
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	notifications, total, err := s.notificationRepo.ListByUserIDWithFilters(userID, page, pageSize, filters)
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

// CreateNotificationWithLink 创建带链接的通知
func (s *NotificationService) CreateNotificationWithLink(userID uint, notificationType, title, content, link, sourceType, sourceID string) error {
	notification := &model.UserNotification{
		UserID:     userID,
		Type:       notificationType,
		Title:      title,
		Content:    content,
		Link:       link,
		SourceType: sourceType,
		SourceID:   sourceID,
		IsRead:     false,
	}
	return s.notificationRepo.Create(notification)
}

// BroadcastNotificationWithLink 广播带链接的通知
func (s *NotificationService) BroadcastNotificationWithLink(userIDs []uint, notificationType, title, content, link, sourceType, sourceID string) error {
	var notifications []model.UserNotification
	for _, userID := range userIDs {
		notifications = append(notifications, model.UserNotification{
			UserID:     userID,
			Type:       notificationType,
			Title:      title,
			Content:    content,
			Link:       link,
			SourceType: sourceType,
			SourceID:   sourceID,
			IsRead:     false,
		})
	}
	return s.notificationRepo.BatchCreate(notifications)
}

// GetUnreadCountByType 按类型获取未读数量
func (s *NotificationService) GetUnreadCountByType(userID uint, notificationType string) int64 {
	return s.notificationRepo.GetUnreadCountByType(userID, notificationType)
}

// BatchDeleteNotifications 批量删除通知
func (s *NotificationService) BatchDeleteNotifications(userID uint, notificationIDs []uint) error {
	// Verify all notifications belong to the user
	for _, id := range notificationIDs {
		notification, err := s.notificationRepo.FindByID(id)
		if err != nil {
			continue
		}
		if notification.UserID != userID {
			return ErrNotificationNotFound
		}
	}
	return s.notificationRepo.BatchDelete(notificationIDs)
}

// DeleteAllNotifications 删除用户的所有通知
func (s *NotificationService) DeleteAllNotifications(userID uint) error {
	return s.notificationRepo.DeleteByUserID(userID)
}

// NotificationStats 通知统计
type NotificationStats struct {
	Total        int64            `json:"total"`
	Unread       int64            `json:"unread"`
	Read         int64            `json:"read"`
	ByType       map[string]int64 `json:"by_type"`
	UnreadByType map[string]int64 `json:"unread_by_type"`
}

// GetNotificationStats 获取用户通知统计
func (s *NotificationService) GetNotificationStats(userID uint) (*NotificationStats, error) {
	// Get total and unread
	_, total, err := s.notificationRepo.ListByUserID(userID, 1, 1, false)
	if err != nil {
		return nil, err
	}

	unread := s.notificationRepo.GetUnreadCount(userID)

	// Get counts by type
	types := []string{
		string(model.NotificationTypeAnnouncement),
		string(model.NotificationTypePosition),
		string(model.NotificationTypeSystem),
		string(model.NotificationTypeCalendar),
		string(model.NotificationTypeSubscription),
		string(model.NotificationTypeRegistration),
	}

	byType := make(map[string]int64)
	unreadByType := make(map[string]int64)

	for _, t := range types {
		// Count all of this type
		filters := repository.NotificationFilters{Type: t}
		_, count, _ := s.notificationRepo.ListByUserIDWithFilters(userID, 1, 1, filters)
		byType[t] = count

		// Count unread of this type
		unreadByType[t] = s.notificationRepo.GetUnreadCountByType(userID, t)
	}

	return &NotificationStats{
		Total:        total,
		Unread:       unread,
		Read:         total - unread,
		ByType:       byType,
		UnreadByType: unreadByType,
	}, nil
}

// SendNotificationViaChannels 通过多个渠道发送通知
func (s *NotificationService) SendNotificationViaChannels(notification *model.UserNotification, channels []model.NotifyChannel, contacts map[model.NotifyChannel]string) error {
	// First, always save to database (push channel)
	if err := s.notificationRepo.Create(notification); err != nil {
		return err
	}

	// Then send via other channels
	for _, channelType := range channels {
		if channelType == model.NotifyChannelPush {
			continue // Already saved to database
		}

		channel, ok := s.channels[channelType]
		if !ok {
			continue
		}

		contact, ok := contacts[channelType]
		if !ok {
			continue
		}

		// Send via channel (errors are logged but don't stop other channels)
		if err := channel.Send(notification, contact); err != nil {
			fmt.Printf("Failed to send notification via %s: %v\n", channelType, err)
		}
	}

	return nil
}
