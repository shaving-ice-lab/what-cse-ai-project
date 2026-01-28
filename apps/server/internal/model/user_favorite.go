package model

import (
	"time"

	"gorm.io/gorm"
)

// FavoriteType 收藏类型
type FavoriteType string

const (
	FavoriteTypePosition     FavoriteType = "position"
	FavoriteTypeAnnouncement FavoriteType = "announcement"
)

// FavoriteTypeList 收藏类型列表
var FavoriteTypeList = []string{
	string(FavoriteTypePosition),
	string(FavoriteTypeAnnouncement),
}

type UserFavorite struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	UserID       uint           `gorm:"index;not null" json:"user_id"`
	FavoriteType FavoriteType   `gorm:"type:varchar(20);index;not null;default:'position'" json:"favorite_type"`
	TargetID     string         `gorm:"type:varchar(50);index;not null" json:"target_id"` // position_id or announcement_id
	PositionID   string         `gorm:"type:varchar(50);index" json:"position_id"`        // Legacy support, will be deprecated
	Note         string         `gorm:"type:varchar(500)" json:"note,omitempty"`          // 收藏备注
	FolderID     *uint          `gorm:"index" json:"folder_id,omitempty"`                 // 收藏夹ID（可选）
	CreatedAt    time.Time      `json:"created_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`

	// Relations loaded dynamically
	Position     *Position     `gorm:"-" json:"position,omitempty"`
	Announcement *Announcement `gorm:"-" json:"announcement,omitempty"`
}

func (UserFavorite) TableName() string {
	return "what_user_favorites"
}

// UserFavoriteFolder 收藏夹
type UserFavoriteFolder struct {
	ID          uint           `gorm:"primaryKey" json:"id"`
	UserID      uint           `gorm:"index;not null" json:"user_id"`
	Name        string         `gorm:"type:varchar(100);not null" json:"name"`
	Description string         `gorm:"type:varchar(500)" json:"description,omitempty"`
	Color       string         `gorm:"type:varchar(20);default:'#f59e0b'" json:"color"`
	SortOrder   int            `gorm:"default:0" json:"sort_order"`
	CreatedAt   time.Time      `json:"created_at"`
	UpdatedAt   time.Time      `json:"updated_at"`
	DeletedAt   gorm.DeletedAt `gorm:"index" json:"-"`
}

func (UserFavoriteFolder) TableName() string {
	return "what_user_favorite_folders"
}

// FavoriteResponse 收藏响应
type FavoriteResponse struct {
	ID           uint         `json:"id"`
	FavoriteType FavoriteType `json:"favorite_type"`
	TargetID     string       `json:"target_id"`
	Note         string       `json:"note,omitempty"`
	FolderID     *uint        `json:"folder_id,omitempty"`
	CreatedAt    time.Time    `json:"created_at"`
	Position     interface{}  `json:"position,omitempty"`
	Announcement interface{}  `json:"announcement,omitempty"`
}

// ToResponse converts UserFavorite to FavoriteResponse
func (f *UserFavorite) ToResponse() *FavoriteResponse {
	resp := &FavoriteResponse{
		ID:           f.ID,
		FavoriteType: f.FavoriteType,
		TargetID:     f.TargetID,
		Note:         f.Note,
		FolderID:     f.FolderID,
		CreatedAt:    f.CreatedAt,
	}
	if f.Position != nil {
		resp.Position = f.Position.ToBriefResponse()
	}
	if f.Announcement != nil {
		resp.Announcement = f.Announcement
	}
	return resp
}

type UserView struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `gorm:"index;not null" json:"user_id"`
	PositionID string         `gorm:"type:varchar(50);index;not null" json:"position_id"`
	ViewCount  int            `gorm:"default:1" json:"view_count"`
	ViewTime   time.Time      `gorm:"type:datetime(3)" json:"view_time"`
	CreatedAt  time.Time      `json:"created_at"`
	UpdatedAt  time.Time      `json:"updated_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`

	// Position is loaded via PositionID (varchar) matching Position.PositionID
	Position *Position `gorm:"-" json:"position,omitempty"`
}

func (UserView) TableName() string {
	return "what_user_views"
}

type UserNotification struct {
	ID         uint           `gorm:"primaryKey" json:"id"`
	UserID     uint           `gorm:"index;not null" json:"user_id"`
	Type       string         `gorm:"type:varchar(50);not null" json:"type"` // announcement, position, system, calendar, subscription
	Title      string         `gorm:"type:varchar(200);not null" json:"title"`
	Content    string         `gorm:"type:text" json:"content"`
	Link       string         `gorm:"type:varchar(500)" json:"link,omitempty"` // 跳转链接
	IsRead     bool           `gorm:"default:false;index" json:"is_read"`
	ReadAt     *time.Time     `json:"read_at,omitempty"`                             // 阅读时间
	SourceType string         `gorm:"type:varchar(50)" json:"source_type,omitempty"` // 来源类型：position, announcement, calendar_event, subscription
	SourceID   string         `gorm:"type:varchar(100)" json:"source_id,omitempty"`  // 来源ID
	CreatedAt  time.Time      `gorm:"index" json:"created_at"`
	DeletedAt  gorm.DeletedAt `gorm:"index" json:"-"`
}

func (UserNotification) TableName() string {
	return "what_user_notifications"
}

// NotificationResponse 通知响应结构
type NotificationResponse struct {
	ID         uint       `json:"id"`
	UserID     uint       `json:"user_id"`
	Type       string     `json:"type"`
	Title      string     `json:"title"`
	Content    string     `json:"content"`
	Link       string     `json:"link,omitempty"`
	IsRead     bool       `json:"is_read"`
	ReadAt     *time.Time `json:"read_at,omitempty"`
	SourceType string     `json:"source_type,omitempty"`
	SourceID   string     `json:"source_id,omitempty"`
	CreatedAt  time.Time  `json:"created_at"`
}

// ToResponse 转换为响应结构
func (n *UserNotification) ToResponse() *NotificationResponse {
	return &NotificationResponse{
		ID:         n.ID,
		UserID:     n.UserID,
		Type:       n.Type,
		Title:      n.Title,
		Content:    n.Content,
		Link:       n.Link,
		IsRead:     n.IsRead,
		ReadAt:     n.ReadAt,
		SourceType: n.SourceType,
		SourceID:   n.SourceID,
		CreatedAt:  n.CreatedAt,
	}
}

type NotificationType string

const (
	NotificationTypeAnnouncement NotificationType = "announcement"
	NotificationTypePosition     NotificationType = "position"
	NotificationTypeSystem       NotificationType = "system"
	NotificationTypeCalendar     NotificationType = "calendar"     // 日历提醒
	NotificationTypeSubscription NotificationType = "subscription" // 订阅推送
	NotificationTypeRegistration NotificationType = "registration" // 报名提醒
)

// NotificationSourceType 通知来源类型
type NotificationSourceType string

const (
	NotificationSourcePosition     NotificationSourceType = "position"
	NotificationSourceAnnouncement NotificationSourceType = "announcement"
	NotificationSourceCalendar     NotificationSourceType = "calendar_event"
	NotificationSourceSubscription NotificationSourceType = "subscription"
)

// =====================================================
// 订阅功能模型
// =====================================================

// SubscribeType 订阅类型
type SubscribeType string

const (
	SubscribeTypeExamType   SubscribeType = "exam_type"  // 考试类型订阅
	SubscribeTypeProvince   SubscribeType = "province"   // 省份订阅
	SubscribeTypeCity       SubscribeType = "city"       // 城市订阅
	SubscribeTypeKeyword    SubscribeType = "keyword"    // 关键词订阅
	SubscribeTypeDepartment SubscribeType = "department" // 部门订阅
	SubscribeTypeEducation  SubscribeType = "education"  // 学历订阅
	SubscribeTypeMajor      SubscribeType = "major"      // 专业订阅
)

// SubscribeTypeList 订阅类型列表
var SubscribeTypeList = []string{
	string(SubscribeTypeExamType),
	string(SubscribeTypeProvince),
	string(SubscribeTypeCity),
	string(SubscribeTypeKeyword),
	string(SubscribeTypeDepartment),
	string(SubscribeTypeEducation),
	string(SubscribeTypeMajor),
}

// NotifyChannel 通知渠道
type NotifyChannel string

const (
	NotifyChannelEmail  NotifyChannel = "email"  // 邮件通知
	NotifyChannelSMS    NotifyChannel = "sms"    // 短信通知
	NotifyChannelPush   NotifyChannel = "push"   // 站内推送
	NotifyChannelWechat NotifyChannel = "wechat" // 微信通知
)

// NotifyChannelList 通知渠道列表
var NotifyChannelList = []string{
	string(NotifyChannelEmail),
	string(NotifyChannelSMS),
	string(NotifyChannelPush),
	string(NotifyChannelWechat),
}

// UserSubscription 用户订阅
type UserSubscription struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	UserID         uint           `gorm:"index;not null" json:"user_id"`
	SubscribeType  SubscribeType  `gorm:"type:varchar(30);index;not null" json:"subscribe_type"`
	SubscribeValue string         `gorm:"type:varchar(200);not null" json:"subscribe_value"`
	SubscribeName  string         `gorm:"type:varchar(100);not null" json:"subscribe_name"`              // 显示名称
	NotifyOnNew    bool           `gorm:"default:true" json:"notify_on_new"`                             // 新公告通知
	NotifyChannels string         `gorm:"type:varchar(200);default:'[\"push\"]'" json:"notify_channels"` // JSON数组
	IsEnabled      bool           `gorm:"default:true;index" json:"is_enabled"`
	LastNotifyAt   *time.Time     `json:"last_notify_at,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (UserSubscription) TableName() string {
	return "what_user_subscriptions"
}

// SubscriptionResponse 订阅响应
type SubscriptionResponse struct {
	ID             uint          `json:"id"`
	SubscribeType  SubscribeType `json:"subscribe_type"`
	SubscribeValue string        `json:"subscribe_value"`
	SubscribeName  string        `json:"subscribe_name"`
	NotifyOnNew    bool          `json:"notify_on_new"`
	NotifyChannels []string      `json:"notify_channels"`
	IsEnabled      bool          `json:"is_enabled"`
	LastNotifyAt   *time.Time    `json:"last_notify_at,omitempty"`
	CreatedAt      time.Time     `json:"created_at"`
}
