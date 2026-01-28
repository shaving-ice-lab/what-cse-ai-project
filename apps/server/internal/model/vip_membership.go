package model

import (
	"time"

	"gorm.io/gorm"
)

// MembershipLevel 会员等级
type MembershipLevel int

const (
	MembershipLevelNormal MembershipLevel = 0 // 普通用户
	MembershipLevelVIP    MembershipLevel = 1 // VIP会员
)

func (l MembershipLevel) String() string {
	switch l {
	case MembershipLevelVIP:
		return "VIP会员"
	default:
		return "普通用户"
	}
}

// MembershipStatus 会员状态
type MembershipStatus int

const (
	MembershipStatusInactive MembershipStatus = 0 // 未开通
	MembershipStatusActive   MembershipStatus = 1 // 已开通
	MembershipStatusExpired  MembershipStatus = 2 // 已过期
)

func (s MembershipStatus) String() string {
	switch s {
	case MembershipStatusActive:
		return "已开通"
	case MembershipStatusExpired:
		return "已过期"
	default:
		return "未开通"
	}
}

// UserMembership 用户会员信息
type UserMembership struct {
	ID              uint             `gorm:"primaryKey" json:"id"`
	UserID          uint             `gorm:"uniqueIndex;not null" json:"user_id"`
	Level           MembershipLevel  `gorm:"type:tinyint;default:0" json:"level"`
	Status          MembershipStatus `gorm:"type:tinyint;default:0" json:"status"`
	StartAt         *time.Time       `json:"start_at,omitempty"`                   // 会员开始时间
	ExpireAt        *time.Time       `json:"expire_at,omitempty"`                  // 会员到期时间
	TotalDays       int              `gorm:"default:0" json:"total_days"`          // 累计会员天数
	Source          string           `gorm:"type:varchar(50)" json:"source"`       // 开通来源: purchase, gift, promotion
	LastRenewalAt   *time.Time       `json:"last_renewal_at,omitempty"`            // 最后续费时间
	AutoRenewal     bool             `gorm:"default:false" json:"auto_renewal"`    // 是否自动续费
	RenewalReminder bool             `gorm:"default:true" json:"renewal_reminder"` // 是否开启续费提醒
	CreatedAt       time.Time        `json:"created_at"`
	UpdatedAt       time.Time        `json:"updated_at"`
	DeletedAt       gorm.DeletedAt   `gorm:"index" json:"-"`

	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (UserMembership) TableName() string {
	return "what_user_memberships"
}

// IsVIP 检查是否是有效VIP
func (m *UserMembership) IsVIP() bool {
	if m.Level != MembershipLevelVIP {
		return false
	}
	if m.Status != MembershipStatusActive {
		return false
	}
	if m.ExpireAt != nil && m.ExpireAt.Before(time.Now()) {
		return false
	}
	return true
}

// DaysRemaining 剩余天数
func (m *UserMembership) DaysRemaining() int {
	if m.ExpireAt == nil || !m.IsVIP() {
		return 0
	}
	remaining := time.Until(*m.ExpireAt)
	if remaining <= 0 {
		return 0
	}
	return int(remaining.Hours() / 24)
}

// MembershipPlan 会员套餐
type MembershipPlan struct {
	ID            uint            `gorm:"primaryKey" json:"id"`
	Name          string          `gorm:"type:varchar(100);not null" json:"name"`         // 套餐名称
	Code          string          `gorm:"type:varchar(50);uniqueIndex" json:"code"`       // 套餐编码
	Level         MembershipLevel `gorm:"type:tinyint;default:1" json:"level"`            // 会员等级
	Duration      int             `gorm:"default:30" json:"duration"`                     // 时长(天)
	OriginalPrice float64         `gorm:"type:decimal(10,2)" json:"original_price"`       // 原价(分)
	Price         float64         `gorm:"type:decimal(10,2)" json:"price"`                // 现价(分)
	Discount      float64         `gorm:"type:decimal(3,2);default:1.00" json:"discount"` // 折扣
	Description   string          `gorm:"type:text" json:"description"`                   // 描述
	Features      string          `gorm:"type:text" json:"features"`                      // 权益列表(JSON)
	SortOrder     int             `gorm:"default:0" json:"sort_order"`
	IsRecommended bool            `gorm:"default:false" json:"is_recommended"` // 是否推荐
	IsEnabled     bool            `gorm:"default:true" json:"is_enabled"`
	CreatedAt     time.Time       `json:"created_at"`
	UpdatedAt     time.Time       `json:"updated_at"`
	DeletedAt     gorm.DeletedAt  `gorm:"index" json:"-"`
}

func (MembershipPlan) TableName() string {
	return "what_membership_plans"
}

// MembershipOrder 会员订单
type MembershipOrder struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	OrderNo        string         `gorm:"type:varchar(64);uniqueIndex" json:"order_no"` // 订单号
	UserID         uint           `gorm:"index;not null" json:"user_id"`
	PlanID         uint           `gorm:"index" json:"plan_id"`
	PlanName       string         `gorm:"type:varchar(100)" json:"plan_name"`
	Amount         float64        `gorm:"type:decimal(10,2)" json:"amount"`             // 支付金额(分)
	OriginalAmount float64        `gorm:"type:decimal(10,2)" json:"original_amount"`    // 原价(分)
	Duration       int            `gorm:"default:0" json:"duration"`                    // 购买时长(天)
	PaymentMethod  string         `gorm:"type:varchar(50)" json:"payment_method"`       // 支付方式
	PaymentStatus  int            `gorm:"type:tinyint;default:0" json:"payment_status"` // 0=待支付, 1=已支付, 2=已取消, 3=已退款
	PaidAt         *time.Time     `json:"paid_at,omitempty"`
	ExpireAt       *time.Time     `json:"expire_at,omitempty"` // 会员到期时间
	RefundedAt     *time.Time     `json:"refunded_at,omitempty"`
	RefundAmount   float64        `gorm:"type:decimal(10,2)" json:"refund_amount"`
	RefundReason   string         `gorm:"type:varchar(255)" json:"refund_reason"`
	Remark         string         `gorm:"type:varchar(255)" json:"remark"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`

	User *User           `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Plan *MembershipPlan `gorm:"foreignKey:PlanID" json:"plan,omitempty"`
}

func (MembershipOrder) TableName() string {
	return "what_membership_orders"
}

// OrderPaymentStatus 订单支付状态
const (
	OrderStatusPending   = 0 // 待支付
	OrderStatusPaid      = 1 // 已支付
	OrderStatusCancelled = 2 // 已取消
	OrderStatusRefunded  = 3 // 已退款
)

// VIPFeature VIP功能权益
type VIPFeature struct {
	Code        string `json:"code"`        // 功能编码
	Name        string `json:"name"`        // 功能名称
	Description string `json:"description"` // 功能描述
	IsVIPOnly   bool   `json:"is_vip_only"` // 是否VIP专属
	FreeLimit   int    `json:"free_limit"`  // 普通用户限制次数 (-1表示无限制, 0表示不可用)
	VIPLimit    int    `json:"vip_limit"`   // VIP用户限制次数 (-1表示无限制)
}

// VIPFeatureList 定义所有VIP功能权益
var VIPFeatureList = []VIPFeature{
	{Code: "position_compare", Name: "职位对比", Description: "多个职位同时对比分析", IsVIPOnly: true, FreeLimit: 0, VIPLimit: -1},
	{Code: "history_full_view", Name: "历年数据完整查看", Description: "查看往年完整的报名数据和分数线", IsVIPOnly: true, FreeLimit: 0, VIPLimit: -1},
	{Code: "score_prediction", Name: "分数线预测", Description: "AI智能预测进面分数线", IsVIPOnly: true, FreeLimit: 0, VIPLimit: -1},
	{Code: "registration_data", Name: "报名大数据", Description: "实时查看报名人数和竞争比", IsVIPOnly: true, FreeLimit: 0, VIPLimit: -1},
	{Code: "ad_free", Name: "无广告", Description: "无广告纯净浏览体验", IsVIPOnly: true, FreeLimit: 0, VIPLimit: -1},
	{Code: "export_data", Name: "数据导出", Description: "导出职位数据和收藏列表", IsVIPOnly: true, FreeLimit: 0, VIPLimit: -1},
	{Code: "premium_courses", Name: "高级课程", Description: "解锁学习包全部高级课程", IsVIPOnly: true, FreeLimit: 0, VIPLimit: -1},
	{Code: "question_bank", Name: "完整题库", Description: "访问完整题库和历年真题", IsVIPOnly: true, FreeLimit: 0, VIPLimit: -1},
	{Code: "smart_match", Name: "智能匹配", Description: "AI智能岗位推荐", IsVIPOnly: false, FreeLimit: 3, VIPLimit: -1},
	{Code: "favorites", Name: "收藏数量", Description: "职位收藏数量限制", IsVIPOnly: false, FreeLimit: 50, VIPLimit: -1},
	{Code: "subscriptions", Name: "订阅数量", Description: "公告订阅数量限制", IsVIPOnly: false, FreeLimit: 5, VIPLimit: -1},
}

// GetVIPFeatureByCode 根据编码获取功能
func GetVIPFeatureByCode(code string) *VIPFeature {
	for _, f := range VIPFeatureList {
		if f.Code == code {
			return &f
		}
	}
	return nil
}

// MembershipFeatureUsage 用户功能使用记录(用于限制普通用户使用次数)
type MembershipFeatureUsage struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	UserID      uint      `gorm:"index;not null" json:"user_id"`
	FeatureCode string    `gorm:"type:varchar(50);index" json:"feature_code"`
	UsageCount  int       `gorm:"default:0" json:"usage_count"`
	ResetDate   time.Time `gorm:"index" json:"reset_date"` // 每日/每月重置日期
	CreatedAt   time.Time `json:"created_at"`
	UpdatedAt   time.Time `json:"updated_at"`
}

func (MembershipFeatureUsage) TableName() string {
	return "what_membership_feature_usages"
}
