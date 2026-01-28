package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrMembershipNotFound  = errors.New("membership not found")
	ErrPlanNotFound        = errors.New("plan not found")
	ErrOrderNotFound       = errors.New("order not found")
	ErrFeatureLimitReached = errors.New("feature usage limit reached")
	ErrInvalidMembership   = errors.New("invalid membership")
)

type MembershipService struct {
	membershipRepo *repository.MembershipRepository
}

func NewMembershipService(membershipRepo *repository.MembershipRepository) *MembershipService {
	return &MembershipService{
		membershipRepo: membershipRepo,
	}
}

// ============================================
// User Membership Methods
// ============================================

// GetUserMembership 获取用户会员信息
func (s *MembershipService) GetUserMembership(userID uint) (*model.UserMembership, error) {
	membership, err := s.membershipRepo.GetByUserID(userID)
	if err != nil {
		// 如果不存在，返回默认普通用户会员信息
		return &model.UserMembership{
			UserID: userID,
			Level:  model.MembershipLevelNormal,
			Status: model.MembershipStatusInactive,
		}, nil
	}
	return membership, nil
}

// CheckVIP 检查用户是否是VIP
func (s *MembershipService) CheckVIP(userID uint) (bool, error) {
	membership, err := s.membershipRepo.GetByUserID(userID)
	if err != nil {
		return false, nil
	}
	return membership.IsVIP(), nil
}

// GetUserMembershipDetail 获取用户会员详情(包含权益信息)
func (s *MembershipService) GetUserMembershipDetail(userID uint) (*MembershipDetailResponse, error) {
	membership, err := s.GetUserMembership(userID)
	if err != nil {
		return nil, err
	}

	features := s.GetAvailableFeatures(membership.IsVIP())

	return &MembershipDetailResponse{
		Membership:    membership,
		IsVIP:         membership.IsVIP(),
		DaysRemaining: membership.DaysRemaining(),
		Features:      features,
	}, nil
}

// ActivateVIP 激活VIP会员
func (s *MembershipService) ActivateVIP(userID uint, days int, source string) (*model.UserMembership, error) {
	membership, _ := s.membershipRepo.GetByUserID(userID)

	now := time.Now()
	if membership == nil {
		// 创建新会员记录
		membership = &model.UserMembership{
			UserID:    userID,
			Level:     model.MembershipLevelVIP,
			Status:    model.MembershipStatusActive,
			StartAt:   &now,
			ExpireAt:  timePtr(now.AddDate(0, 0, days)),
			TotalDays: days,
			Source:    source,
		}
		if err := s.membershipRepo.Create(membership); err != nil {
			return nil, err
		}
	} else {
		// 更新现有记录
		if membership.IsVIP() {
			// 已有VIP，续期
			newExpire := membership.ExpireAt.AddDate(0, 0, days)
			membership.ExpireAt = &newExpire
			membership.TotalDays += days
			membership.LastRenewalAt = &now
		} else {
			// 首次开通或过期后重新开通
			membership.Level = model.MembershipLevelVIP
			membership.Status = model.MembershipStatusActive
			membership.StartAt = &now
			membership.ExpireAt = timePtr(now.AddDate(0, 0, days))
			membership.TotalDays += days
			membership.Source = source
		}
		if err := s.membershipRepo.Update(membership); err != nil {
			return nil, err
		}
	}

	return membership, nil
}

// DeactivateVIP 取消VIP会员
func (s *MembershipService) DeactivateVIP(userID uint) error {
	membership, err := s.membershipRepo.GetByUserID(userID)
	if err != nil {
		return ErrMembershipNotFound
	}

	membership.Level = model.MembershipLevelNormal
	membership.Status = model.MembershipStatusInactive
	membership.AutoRenewal = false

	return s.membershipRepo.Update(membership)
}

// ListMemberships 获取会员列表
func (s *MembershipService) ListMemberships(params *repository.MembershipListParams) (*MembershipListResponse, error) {
	memberships, total, err := s.membershipRepo.List(params)
	if err != nil {
		return nil, err
	}

	return &MembershipListResponse{
		Memberships: memberships,
		Total:       total,
		Page:        params.Page,
		PageSize:    params.PageSize,
	}, nil
}

// GetMembershipStats 获取会员统计
func (s *MembershipService) GetMembershipStats() (*repository.MembershipStats, error) {
	return s.membershipRepo.GetStats()
}

// UpdateExpiredMemberships 更新过期会员状态
func (s *MembershipService) UpdateExpiredMemberships() (int64, error) {
	return s.membershipRepo.UpdateExpiredMemberships()
}

// ============================================
// Membership Plan Methods
// ============================================

// GetPlans 获取套餐列表
func (s *MembershipService) GetPlans(enabledOnly bool) ([]model.MembershipPlan, error) {
	return s.membershipRepo.GetPlans(enabledOnly)
}

// GetPlanByID 获取套餐详情
func (s *MembershipService) GetPlanByID(id uint) (*model.MembershipPlan, error) {
	return s.membershipRepo.GetPlanByID(id)
}

// CreatePlan 创建套餐
func (s *MembershipService) CreatePlan(req *CreatePlanRequest) (*model.MembershipPlan, error) {
	featuresJSON, _ := json.Marshal(req.Features)

	plan := &model.MembershipPlan{
		Name:          req.Name,
		Code:          req.Code,
		Level:         model.MembershipLevelVIP,
		Duration:      req.Duration,
		OriginalPrice: req.OriginalPrice,
		Price:         req.Price,
		Discount:      req.Discount,
		Description:   req.Description,
		Features:      string(featuresJSON),
		SortOrder:     req.SortOrder,
		IsRecommended: req.IsRecommended,
		IsEnabled:     true,
	}

	if err := s.membershipRepo.CreatePlan(plan); err != nil {
		return nil, err
	}

	return plan, nil
}

// UpdatePlan 更新套餐
func (s *MembershipService) UpdatePlan(id uint, req *UpdatePlanRequest) (*model.MembershipPlan, error) {
	plan, err := s.membershipRepo.GetPlanByID(id)
	if err != nil {
		return nil, ErrPlanNotFound
	}

	if req.Name != "" {
		plan.Name = req.Name
	}
	if req.Duration > 0 {
		plan.Duration = req.Duration
	}
	if req.OriginalPrice > 0 {
		plan.OriginalPrice = req.OriginalPrice
	}
	if req.Price > 0 {
		plan.Price = req.Price
	}
	if req.Discount > 0 {
		plan.Discount = req.Discount
	}
	if req.Description != "" {
		plan.Description = req.Description
	}
	if len(req.Features) > 0 {
		featuresJSON, _ := json.Marshal(req.Features)
		plan.Features = string(featuresJSON)
	}
	if req.SortOrder != nil {
		plan.SortOrder = *req.SortOrder
	}
	if req.IsRecommended != nil {
		plan.IsRecommended = *req.IsRecommended
	}
	if req.IsEnabled != nil {
		plan.IsEnabled = *req.IsEnabled
	}

	if err := s.membershipRepo.UpdatePlan(plan); err != nil {
		return nil, err
	}

	return plan, nil
}

// DeletePlan 删除套餐
func (s *MembershipService) DeletePlan(id uint) error {
	return s.membershipRepo.DeletePlan(id)
}

// ============================================
// Feature Access Control Methods
// ============================================

// CheckFeatureAccess 检查用户是否可以访问某功能
func (s *MembershipService) CheckFeatureAccess(userID uint, featureCode string) (*FeatureAccessResult, error) {
	// 获取功能定义
	feature := model.GetVIPFeatureByCode(featureCode)
	if feature == nil {
		return &FeatureAccessResult{
			Allowed: true,
			Message: "未知功能，默认允许访问",
		}, nil
	}

	// 检查用户是否是VIP
	isVIP, _ := s.CheckVIP(userID)

	if isVIP {
		// VIP用户
		if feature.VIPLimit == -1 {
			return &FeatureAccessResult{
				Allowed: true,
				IsVIP:   true,
				Message: "VIP用户无限制",
			}, nil
		}
		// TODO: 检查VIP用户的使用次数限制
		return &FeatureAccessResult{
			Allowed:   true,
			IsVIP:     true,
			Remaining: feature.VIPLimit,
			Message:   "VIP用户",
		}, nil
	}

	// 普通用户
	if feature.IsVIPOnly {
		return &FeatureAccessResult{
			Allowed: false,
			IsVIP:   false,
			Message: fmt.Sprintf("「%s」是VIP专属功能，请开通VIP后使用", feature.Name),
		}, nil
	}

	if feature.FreeLimit == -1 {
		return &FeatureAccessResult{
			Allowed: true,
			IsVIP:   false,
			Message: "免费用户无限制",
		}, nil
	}

	if feature.FreeLimit == 0 {
		return &FeatureAccessResult{
			Allowed: false,
			IsVIP:   false,
			Message: fmt.Sprintf("「%s」需要开通VIP后使用", feature.Name),
		}, nil
	}

	// 检查使用次数
	usage, _ := s.membershipRepo.GetFeatureUsage(userID, featureCode)
	usedCount := 0
	if usage != nil {
		usedCount = usage.UsageCount
	}

	remaining := feature.FreeLimit - usedCount
	if remaining <= 0 {
		return &FeatureAccessResult{
			Allowed:   false,
			IsVIP:     false,
			Remaining: 0,
			Limit:     feature.FreeLimit,
			Message:   fmt.Sprintf("今日「%s」使用次数已用完，开通VIP可无限使用", feature.Name),
		}, nil
	}

	return &FeatureAccessResult{
		Allowed:   true,
		IsVIP:     false,
		Remaining: remaining,
		Limit:     feature.FreeLimit,
		Message:   fmt.Sprintf("今日剩余 %d 次", remaining),
	}, nil
}

// RecordFeatureUsage 记录功能使用
func (s *MembershipService) RecordFeatureUsage(userID uint, featureCode string) error {
	// VIP用户不记录使用次数
	isVIP, _ := s.CheckVIP(userID)
	if isVIP {
		return nil
	}

	return s.membershipRepo.IncrementFeatureUsage(userID, featureCode)
}

// GetAvailableFeatures 获取用户可用功能列表
func (s *MembershipService) GetAvailableFeatures(isVIP bool) []FeatureInfo {
	features := make([]FeatureInfo, len(model.VIPFeatureList))
	for i, f := range model.VIPFeatureList {
		available := !f.IsVIPOnly || isVIP
		limit := f.FreeLimit
		if isVIP {
			limit = f.VIPLimit
		}
		features[i] = FeatureInfo{
			Code:        f.Code,
			Name:        f.Name,
			Description: f.Description,
			IsVIPOnly:   f.IsVIPOnly,
			Available:   available,
			Limit:       limit,
		}
	}
	return features
}

// GetVIPComparison 获取VIP权益对比
func (s *MembershipService) GetVIPComparison() *VIPComparisonResponse {
	normalFeatures := make([]FeatureCompareItem, len(model.VIPFeatureList))
	vipFeatures := make([]FeatureCompareItem, len(model.VIPFeatureList))

	for i, f := range model.VIPFeatureList {
		normalFeatures[i] = FeatureCompareItem{
			Code:        f.Code,
			Name:        f.Name,
			Description: f.Description,
			Available:   !f.IsVIPOnly && f.FreeLimit != 0,
			Limit:       formatLimit(f.FreeLimit),
		}
		vipFeatures[i] = FeatureCompareItem{
			Code:        f.Code,
			Name:        f.Name,
			Description: f.Description,
			Available:   true,
			Limit:       formatLimit(f.VIPLimit),
		}
	}

	return &VIPComparisonResponse{
		NormalFeatures: normalFeatures,
		VIPFeatures:    vipFeatures,
	}
}

// ============================================
// Order Methods
// ============================================

// CreateOrder 创建订单
func (s *MembershipService) CreateOrder(userID uint, planID uint) (*model.MembershipOrder, error) {
	plan, err := s.membershipRepo.GetPlanByID(planID)
	if err != nil {
		return nil, ErrPlanNotFound
	}

	// 获取当前会员信息计算到期时间
	membership, _ := s.GetUserMembership(userID)
	var expireAt time.Time
	if membership != nil && membership.IsVIP() && membership.ExpireAt != nil {
		expireAt = membership.ExpireAt.AddDate(0, 0, plan.Duration)
	} else {
		expireAt = time.Now().AddDate(0, 0, plan.Duration)
	}

	order := &model.MembershipOrder{
		OrderNo:        generateOrderNo(),
		UserID:         userID,
		PlanID:         planID,
		PlanName:       plan.Name,
		Amount:         plan.Price,
		OriginalAmount: plan.OriginalPrice,
		Duration:       plan.Duration,
		PaymentStatus:  model.OrderStatusPending,
		ExpireAt:       &expireAt,
	}

	if err := s.membershipRepo.CreateOrder(order); err != nil {
		return nil, err
	}

	return order, nil
}

// PayOrder 支付订单(模拟)
func (s *MembershipService) PayOrder(orderNo string, paymentMethod string) (*model.MembershipOrder, error) {
	order, err := s.membershipRepo.GetOrderByNo(orderNo)
	if err != nil {
		return nil, ErrOrderNotFound
	}

	if order.PaymentStatus != model.OrderStatusPending {
		return nil, errors.New("order is not in pending status")
	}

	// 更新订单状态
	now := time.Now()
	order.PaymentStatus = model.OrderStatusPaid
	order.PaymentMethod = paymentMethod
	order.PaidAt = &now

	if err := s.membershipRepo.UpdateOrder(order); err != nil {
		return nil, err
	}

	// 激活VIP
	_, err = s.ActivateVIP(order.UserID, order.Duration, "purchase")
	if err != nil {
		return nil, err
	}

	return order, nil
}

// GetUserOrders 获取用户订单列表
func (s *MembershipService) GetUserOrders(userID uint, page, pageSize int) (*OrderListResponse, error) {
	orders, total, err := s.membershipRepo.GetUserOrders(userID, page, pageSize)
	if err != nil {
		return nil, err
	}

	return &OrderListResponse{
		Orders:   orders,
		Total:    total,
		Page:     page,
		PageSize: pageSize,
	}, nil
}

// GetOrderStats 获取订单统计
func (s *MembershipService) GetOrderStats() (*repository.OrderStats, error) {
	return s.membershipRepo.GetOrderStats()
}

// AdminListOrders 管理端获取订单列表
func (s *MembershipService) AdminListOrders(params *repository.OrderListParams) (*OrderListResponse, error) {
	orders, total, err := s.membershipRepo.ListOrders(params)
	if err != nil {
		return nil, err
	}

	return &OrderListResponse{
		Orders:   orders,
		Total:    total,
		Page:     params.Page,
		PageSize: params.PageSize,
	}, nil
}

// ============================================
// Helper Functions
// ============================================

func timePtr(t time.Time) *time.Time {
	return &t
}

func generateOrderNo() string {
	return fmt.Sprintf("VIP%d", time.Now().UnixNano())
}

func formatLimit(limit int) string {
	if limit == -1 {
		return "无限制"
	}
	if limit == 0 {
		return "不可用"
	}
	return fmt.Sprintf("%d次/天", limit)
}

// ============================================
// Response Types
// ============================================

type MembershipDetailResponse struct {
	Membership    *model.UserMembership `json:"membership"`
	IsVIP         bool                  `json:"is_vip"`
	DaysRemaining int                   `json:"days_remaining"`
	Features      []FeatureInfo         `json:"features"`
}

type MembershipListResponse struct {
	Memberships []model.UserMembership `json:"memberships"`
	Total       int64                  `json:"total"`
	Page        int                    `json:"page"`
	PageSize    int                    `json:"page_size"`
}

type FeatureInfo struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
	IsVIPOnly   bool   `json:"is_vip_only"`
	Available   bool   `json:"available"`
	Limit       int    `json:"limit"` // -1 表示无限制
}

type FeatureAccessResult struct {
	Allowed   bool   `json:"allowed"`
	IsVIP     bool   `json:"is_vip"`
	Remaining int    `json:"remaining,omitempty"`
	Limit     int    `json:"limit,omitempty"`
	Message   string `json:"message"`
}

type FeatureCompareItem struct {
	Code        string `json:"code"`
	Name        string `json:"name"`
	Description string `json:"description"`
	Available   bool   `json:"available"`
	Limit       string `json:"limit"`
}

type VIPComparisonResponse struct {
	NormalFeatures []FeatureCompareItem `json:"normal_features"`
	VIPFeatures    []FeatureCompareItem `json:"vip_features"`
}

type CreatePlanRequest struct {
	Name          string   `json:"name" validate:"required"`
	Code          string   `json:"code" validate:"required"`
	Duration      int      `json:"duration" validate:"required,min=1"`
	OriginalPrice float64  `json:"original_price" validate:"required,min=0"`
	Price         float64  `json:"price" validate:"required,min=0"`
	Discount      float64  `json:"discount"`
	Description   string   `json:"description"`
	Features      []string `json:"features"`
	SortOrder     int      `json:"sort_order"`
	IsRecommended bool     `json:"is_recommended"`
}

type UpdatePlanRequest struct {
	Name          string   `json:"name"`
	Duration      int      `json:"duration"`
	OriginalPrice float64  `json:"original_price"`
	Price         float64  `json:"price"`
	Discount      float64  `json:"discount"`
	Description   string   `json:"description"`
	Features      []string `json:"features"`
	SortOrder     *int     `json:"sort_order"`
	IsRecommended *bool    `json:"is_recommended"`
	IsEnabled     *bool    `json:"is_enabled"`
}

type OrderListResponse struct {
	Orders   []model.MembershipOrder `json:"orders"`
	Total    int64                   `json:"total"`
	Page     int                     `json:"page"`
	PageSize int                     `json:"page_size"`
}
