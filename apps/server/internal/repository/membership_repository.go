package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type MembershipRepository struct {
	db *gorm.DB
}

func NewMembershipRepository(db *gorm.DB) *MembershipRepository {
	return &MembershipRepository{db: db}
}

// ============================================
// UserMembership Repository Methods
// ============================================

// GetByUserID 获取用户会员信息
func (r *MembershipRepository) GetByUserID(userID uint) (*model.UserMembership, error) {
	var membership model.UserMembership
	err := r.db.Where("user_id = ?", userID).First(&membership).Error
	if err != nil {
		return nil, err
	}
	return &membership, nil
}

// Create 创建会员记录
func (r *MembershipRepository) Create(membership *model.UserMembership) error {
	return r.db.Create(membership).Error
}

// Update 更新会员信息
func (r *MembershipRepository) Update(membership *model.UserMembership) error {
	return r.db.Save(membership).Error
}

// Upsert 创建或更新会员信息
func (r *MembershipRepository) Upsert(membership *model.UserMembership) error {
	var existing model.UserMembership
	err := r.db.Where("user_id = ?", membership.UserID).First(&existing).Error
	if err == gorm.ErrRecordNotFound {
		return r.db.Create(membership).Error
	}
	if err != nil {
		return err
	}
	membership.ID = existing.ID
	return r.db.Save(membership).Error
}

// List 获取会员列表
func (r *MembershipRepository) List(params *MembershipListParams) ([]model.UserMembership, int64, error) {
	var memberships []model.UserMembership
	var total int64

	query := r.db.Model(&model.UserMembership{})

	// 筛选条件
	if params.Level != nil {
		query = query.Where("level = ?", *params.Level)
	}
	if params.Status != nil {
		query = query.Where("status = ?", *params.Status)
	}
	if params.Keyword != "" {
		query = query.Preload("User").Joins("LEFT JOIN what_users ON what_users.id = what_user_memberships.user_id").
			Where("what_users.phone LIKE ? OR what_users.email LIKE ? OR what_users.nickname LIKE ?",
				"%"+params.Keyword+"%", "%"+params.Keyword+"%", "%"+params.Keyword+"%")
	}

	// 统计总数
	query.Count(&total)

	// 分页
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Preload("User").
		Order("created_at DESC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&memberships).Error

	return memberships, total, err
}

// GetExpiringMemberships 获取即将到期的会员列表
func (r *MembershipRepository) GetExpiringMemberships(days int) ([]model.UserMembership, error) {
	var memberships []model.UserMembership
	expireDate := time.Now().AddDate(0, 0, days)
	err := r.db.Preload("User").
		Where("status = ? AND level = ? AND expire_at <= ? AND expire_at > ?",
			model.MembershipStatusActive, model.MembershipLevelVIP, expireDate, time.Now()).
		Find(&memberships).Error
	return memberships, err
}

// GetExpiredMemberships 获取已过期的会员列表
func (r *MembershipRepository) GetExpiredMemberships() ([]model.UserMembership, error) {
	var memberships []model.UserMembership
	err := r.db.Where("status = ? AND level = ? AND expire_at < ?",
		model.MembershipStatusActive, model.MembershipLevelVIP, time.Now()).
		Find(&memberships).Error
	return memberships, err
}

// UpdateExpiredMemberships 批量更新过期会员状态
func (r *MembershipRepository) UpdateExpiredMemberships() (int64, error) {
	result := r.db.Model(&model.UserMembership{}).
		Where("status = ? AND level = ? AND expire_at < ?",
			model.MembershipStatusActive, model.MembershipLevelVIP, time.Now()).
		Updates(map[string]interface{}{
			"status":     model.MembershipStatusExpired,
			"updated_at": time.Now(),
		})
	return result.RowsAffected, result.Error
}

// GetStats 获取会员统计数据
func (r *MembershipRepository) GetStats() (*MembershipStats, error) {
	stats := &MembershipStats{}

	// 总会员数
	r.db.Model(&model.UserMembership{}).Count(&stats.TotalMembers)

	// VIP会员数
	r.db.Model(&model.UserMembership{}).
		Where("level = ? AND status = ?", model.MembershipLevelVIP, model.MembershipStatusActive).
		Count(&stats.ActiveVIPCount)

	// 过期VIP数
	r.db.Model(&model.UserMembership{}).
		Where("level = ? AND status = ?", model.MembershipLevelVIP, model.MembershipStatusExpired).
		Count(&stats.ExpiredVIPCount)

	// 今日新增VIP
	today := time.Now().Truncate(24 * time.Hour)
	r.db.Model(&model.UserMembership{}).
		Where("level = ? AND start_at >= ?", model.MembershipLevelVIP, today).
		Count(&stats.TodayNewVIP)

	// 本月新增VIP
	monthStart := time.Date(time.Now().Year(), time.Now().Month(), 1, 0, 0, 0, 0, time.Local)
	r.db.Model(&model.UserMembership{}).
		Where("level = ? AND start_at >= ?", model.MembershipLevelVIP, monthStart).
		Count(&stats.MonthNewVIP)

	// 即将到期(7天内)
	expireDate := time.Now().AddDate(0, 0, 7)
	r.db.Model(&model.UserMembership{}).
		Where("status = ? AND level = ? AND expire_at <= ? AND expire_at > ?",
			model.MembershipStatusActive, model.MembershipLevelVIP, expireDate, time.Now()).
		Count(&stats.ExpiringCount)

	return stats, nil
}

// ============================================
// MembershipPlan Repository Methods
// ============================================

// GetPlans 获取所有套餐
func (r *MembershipRepository) GetPlans(enabledOnly bool) ([]model.MembershipPlan, error) {
	var plans []model.MembershipPlan
	query := r.db.Model(&model.MembershipPlan{})
	if enabledOnly {
		query = query.Where("is_enabled = ?", true)
	}
	err := query.Order("sort_order ASC").Find(&plans).Error
	return plans, err
}

// GetPlanByID 根据ID获取套餐
func (r *MembershipRepository) GetPlanByID(id uint) (*model.MembershipPlan, error) {
	var plan model.MembershipPlan
	err := r.db.First(&plan, id).Error
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

// GetPlanByCode 根据编码获取套餐
func (r *MembershipRepository) GetPlanByCode(code string) (*model.MembershipPlan, error) {
	var plan model.MembershipPlan
	err := r.db.Where("code = ?", code).First(&plan).Error
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

// CreatePlan 创建套餐
func (r *MembershipRepository) CreatePlan(plan *model.MembershipPlan) error {
	return r.db.Create(plan).Error
}

// UpdatePlan 更新套餐
func (r *MembershipRepository) UpdatePlan(plan *model.MembershipPlan) error {
	return r.db.Save(plan).Error
}

// DeletePlan 删除套餐
func (r *MembershipRepository) DeletePlan(id uint) error {
	return r.db.Delete(&model.MembershipPlan{}, id).Error
}

// ============================================
// MembershipOrder Repository Methods
// ============================================

// CreateOrder 创建订单
func (r *MembershipRepository) CreateOrder(order *model.MembershipOrder) error {
	return r.db.Create(order).Error
}

// GetOrderByNo 根据订单号获取订单
func (r *MembershipRepository) GetOrderByNo(orderNo string) (*model.MembershipOrder, error) {
	var order model.MembershipOrder
	err := r.db.Where("order_no = ?", orderNo).First(&order).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

// GetOrderByID 根据ID获取订单
func (r *MembershipRepository) GetOrderByID(id uint) (*model.MembershipOrder, error) {
	var order model.MembershipOrder
	err := r.db.First(&order, id).Error
	if err != nil {
		return nil, err
	}
	return &order, nil
}

// UpdateOrder 更新订单
func (r *MembershipRepository) UpdateOrder(order *model.MembershipOrder) error {
	return r.db.Save(order).Error
}

// ListOrders 获取订单列表
func (r *MembershipRepository) ListOrders(params *OrderListParams) ([]model.MembershipOrder, int64, error) {
	var orders []model.MembershipOrder
	var total int64

	query := r.db.Model(&model.MembershipOrder{})

	if params.UserID > 0 {
		query = query.Where("user_id = ?", params.UserID)
	}
	if params.PaymentStatus != nil {
		query = query.Where("payment_status = ?", *params.PaymentStatus)
	}
	if params.StartDate != nil {
		query = query.Where("created_at >= ?", params.StartDate)
	}
	if params.EndDate != nil {
		query = query.Where("created_at <= ?", params.EndDate)
	}

	query.Count(&total)

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Preload("User").Preload("Plan").
		Order("created_at DESC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&orders).Error

	return orders, total, err
}

// GetUserOrders 获取用户订单列表
func (r *MembershipRepository) GetUserOrders(userID uint, page, pageSize int) ([]model.MembershipOrder, int64, error) {
	var orders []model.MembershipOrder
	var total int64

	query := r.db.Model(&model.MembershipOrder{}).Where("user_id = ?", userID)
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Preload("Plan").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&orders).Error

	return orders, total, err
}

// GetOrderStats 获取订单统计
func (r *MembershipRepository) GetOrderStats() (*OrderStats, error) {
	stats := &OrderStats{}

	// 今日订单数
	today := time.Now().Truncate(24 * time.Hour)
	r.db.Model(&model.MembershipOrder{}).
		Where("created_at >= ? AND payment_status = ?", today, model.OrderStatusPaid).
		Count(&stats.TodayOrders)

	// 今日收入
	var todayAmount float64
	r.db.Model(&model.MembershipOrder{}).
		Select("COALESCE(SUM(amount), 0)").
		Where("created_at >= ? AND payment_status = ?", today, model.OrderStatusPaid).
		Scan(&todayAmount)
	stats.TodayRevenue = todayAmount

	// 本月订单数
	monthStart := time.Date(time.Now().Year(), time.Now().Month(), 1, 0, 0, 0, 0, time.Local)
	r.db.Model(&model.MembershipOrder{}).
		Where("created_at >= ? AND payment_status = ?", monthStart, model.OrderStatusPaid).
		Count(&stats.MonthOrders)

	// 本月收入
	var monthAmount float64
	r.db.Model(&model.MembershipOrder{}).
		Select("COALESCE(SUM(amount), 0)").
		Where("created_at >= ? AND payment_status = ?", monthStart, model.OrderStatusPaid).
		Scan(&monthAmount)
	stats.MonthRevenue = monthAmount

	// 总订单数
	r.db.Model(&model.MembershipOrder{}).
		Where("payment_status = ?", model.OrderStatusPaid).
		Count(&stats.TotalOrders)

	// 总收入
	var totalAmount float64
	r.db.Model(&model.MembershipOrder{}).
		Select("COALESCE(SUM(amount), 0)").
		Where("payment_status = ?", model.OrderStatusPaid).
		Scan(&totalAmount)
	stats.TotalRevenue = totalAmount

	return stats, nil
}

// ============================================
// FeatureUsage Repository Methods
// ============================================

// GetFeatureUsage 获取用户功能使用记录
func (r *MembershipRepository) GetFeatureUsage(userID uint, featureCode string) (*model.MembershipFeatureUsage, error) {
	var usage model.MembershipFeatureUsage
	today := time.Now().Truncate(24 * time.Hour)
	err := r.db.Where("user_id = ? AND feature_code = ? AND reset_date = ?", userID, featureCode, today).First(&usage).Error
	if err != nil {
		return nil, err
	}
	return &usage, nil
}

// IncrementFeatureUsage 增加功能使用次数
func (r *MembershipRepository) IncrementFeatureUsage(userID uint, featureCode string) error {
	today := time.Now().Truncate(24 * time.Hour)

	result := r.db.Model(&model.MembershipFeatureUsage{}).
		Where("user_id = ? AND feature_code = ? AND reset_date = ?", userID, featureCode, today).
		Update("usage_count", gorm.Expr("usage_count + 1"))

	if result.RowsAffected == 0 {
		// 记录不存在，创建新记录
		usage := &model.MembershipFeatureUsage{
			UserID:      userID,
			FeatureCode: featureCode,
			UsageCount:  1,
			ResetDate:   today,
		}
		return r.db.Create(usage).Error
	}
	return result.Error
}

// ============================================
// Params and Stats Types
// ============================================

type MembershipListParams struct {
	Page     int
	PageSize int
	Keyword  string
	Level    *model.MembershipLevel
	Status   *model.MembershipStatus
}

type MembershipStats struct {
	TotalMembers    int64 `json:"total_members"`
	ActiveVIPCount  int64 `json:"active_vip_count"`
	ExpiredVIPCount int64 `json:"expired_vip_count"`
	TodayNewVIP     int64 `json:"today_new_vip"`
	MonthNewVIP     int64 `json:"month_new_vip"`
	ExpiringCount   int64 `json:"expiring_count"`
}

type OrderListParams struct {
	Page          int
	PageSize      int
	UserID        uint
	PaymentStatus *int
	StartDate     *time.Time
	EndDate       *time.Time
}

type OrderStats struct {
	TodayOrders  int64   `json:"today_orders"`
	TodayRevenue float64 `json:"today_revenue"`
	MonthOrders  int64   `json:"month_orders"`
	MonthRevenue float64 `json:"month_revenue"`
	TotalOrders  int64   `json:"total_orders"`
	TotalRevenue float64 `json:"total_revenue"`
}
