package repository

import (
	"time"

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
	now := time.Now()
	return r.db.Model(&model.UserNotification{}).Where("id = ?", id).Updates(map[string]interface{}{
		"is_read": true,
		"read_at": now,
	}).Error
}

func (r *NotificationRepository) MarkAllAsRead(userID uint) error {
	now := time.Now()
	return r.db.Model(&model.UserNotification{}).Where("user_id = ? AND is_read = ?", userID, false).Updates(map[string]interface{}{
		"is_read": true,
		"read_at": now,
	}).Error
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

// ListByUserIDWithFilters 带筛选条件的通知列表查询
func (r *NotificationRepository) ListByUserIDWithFilters(userID uint, page, pageSize int, filters NotificationFilters) ([]model.UserNotification, int64, error) {
	var notifications []model.UserNotification
	var total int64

	query := r.db.Model(&model.UserNotification{}).Where("user_id = ?", userID)

	// 未读筛选
	if filters.UnreadOnly {
		query = query.Where("is_read = ?", false)
	}

	// 类型筛选
	if filters.Type != "" {
		query = query.Where("type = ?", filters.Type)
	}

	// 来源类型筛选
	if filters.SourceType != "" {
		query = query.Where("source_type = ?", filters.SourceType)
	}

	// 时间范围筛选
	if filters.StartTime != nil {
		query = query.Where("created_at >= ?", filters.StartTime)
	}
	if filters.EndTime != nil {
		query = query.Where("created_at <= ?", filters.EndTime)
	}

	// 关键词搜索
	if filters.Keyword != "" {
		query = query.Where("title LIKE ? OR content LIKE ?", "%"+filters.Keyword+"%", "%"+filters.Keyword+"%")
	}

	query.Count(&total)

	offset := (page - 1) * pageSize
	err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&notifications).Error
	if err != nil {
		return nil, 0, err
	}

	return notifications, total, nil
}

// NotificationFilters 通知筛选条件
type NotificationFilters struct {
	UnreadOnly bool
	Type       string
	SourceType string
	StartTime  *time.Time
	EndTime    *time.Time
	Keyword    string
}

// GetUnreadCountByType 按类型获取未读数量
func (r *NotificationRepository) GetUnreadCountByType(userID uint, notificationType string) int64 {
	var count int64
	query := r.db.Model(&model.UserNotification{}).Where("user_id = ? AND is_read = ?", userID, false)
	if notificationType != "" {
		query = query.Where("type = ?", notificationType)
	}
	query.Count(&count)
	return count
}

// DeleteByUserID 删除用户的所有通知
func (r *NotificationRepository) DeleteByUserID(userID uint) error {
	return r.db.Where("user_id = ?", userID).Delete(&model.UserNotification{}).Error
}

// BatchDelete 批量删除通知
func (r *NotificationRepository) BatchDelete(ids []uint) error {
	return r.db.Delete(&model.UserNotification{}, ids).Error
}

// FindBySourceID 根据来源查找通知
func (r *NotificationRepository) FindBySourceID(sourceType, sourceID string) ([]model.UserNotification, error) {
	var notifications []model.UserNotification
	err := r.db.Where("source_type = ? AND source_id = ?", sourceType, sourceID).Find(&notifications).Error
	return notifications, err
}

// GetAllUserIDs 获取所有用户ID（用于广播通知）
func (r *NotificationRepository) GetAllUserIDs() ([]uint, error) {
	var userIDs []uint
	err := r.db.Model(&model.UserNotification{}).Distinct("user_id").Pluck("user_id", &userIDs).Error
	return userIDs, err
}

// CreateWithLink 创建带链接的通知
func (r *NotificationRepository) CreateWithLink(notification *model.UserNotification) error {
	return r.db.Create(notification).Error
}
