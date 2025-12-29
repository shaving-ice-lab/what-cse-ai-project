package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type NotificationRepository struct {
	db *gorm.DB
}

func NewNotificationRepository(db *gorm.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) Create(notification *model.UserNotification) error {
	return r.db.Create(notification).Error
}

func (r *NotificationRepository) FindByID(id uint) (*model.UserNotification, error) {
	var notification model.UserNotification
	err := r.db.First(&notification, id).Error
	if err != nil {
		return nil, err
	}
	return &notification, nil
}

func (r *NotificationRepository) ListByUserID(userID uint, page, pageSize int, unreadOnly bool) ([]model.UserNotification, int64, error) {
	var notifications []model.UserNotification
	var total int64

	query := r.db.Model(&model.UserNotification{}).Where("user_id = ?", userID)
	if unreadOnly {
		query = query.Where("is_read = ?", false)
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&notifications).Error
	if err != nil {
		return nil, 0, err
	}

	return notifications, total, nil
}

func (r *NotificationRepository) MarkAsRead(id uint) error {
	return r.db.Model(&model.UserNotification{}).Where("id = ?", id).Update("is_read", true).Error
}

func (r *NotificationRepository) MarkAllAsRead(userID uint) error {
	return r.db.Model(&model.UserNotification{}).Where("user_id = ? AND is_read = ?", userID, false).Update("is_read", true).Error
}

func (r *NotificationRepository) Delete(id uint) error {
	return r.db.Delete(&model.UserNotification{}, id).Error
}

func (r *NotificationRepository) GetUnreadCount(userID uint) int64 {
	var count int64
	r.db.Model(&model.UserNotification{}).Where("user_id = ? AND is_read = ?", userID, false).Count(&count)
	return count
}

func (r *NotificationRepository) BatchCreate(notifications []model.UserNotification) error {
	return r.db.CreateInBatches(notifications, 100).Error
}
