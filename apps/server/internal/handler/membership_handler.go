package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

type MembershipHandler struct {
	membershipService *service.MembershipService
}

func NewMembershipHandler(membershipService *service.MembershipService) *MembershipHandler {
	return &MembershipHandler{membershipService: membershipService}
}

// ============================================
// User APIs (需要登录)
// ============================================

// GetMyMembership 获取当前用户会员信息
// @Summary Get My Membership
// @Description Get current user's membership information
// @Tags Membership
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/membership [get]
func (h *MembershipHandler) GetMyMembership(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	detail, err := h.membershipService.GetUserMembershipDetail(userID)
	if err != nil {
		return fail(c, 500, "Failed to get membership: "+err.Error())
	}

	return success(c, detail)
}

// CheckVIPStatus 检查VIP状态
// @Summary Check VIP Status
// @Description Check if current user is VIP
// @Tags Membership
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/membership/vip-status [get]
func (h *MembershipHandler) CheckVIPStatus(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	isVIP, _ := h.membershipService.CheckVIP(userID)
	membership, _ := h.membershipService.GetUserMembership(userID)

	return success(c, map[string]interface{}{
		"is_vip":         isVIP,
		"level":          membership.Level,
		"level_name":     membership.Level.String(),
		"status":         membership.Status,
		"status_name":    membership.Status.String(),
		"days_remaining": membership.DaysRemaining(),
		"expire_at":      membership.ExpireAt,
	})
}

// CheckFeatureAccess 检查功能访问权限
// @Summary Check Feature Access
// @Description Check if user can access a specific feature
// @Tags Membership
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param code query string true "Feature code"
// @Success 200 {object} Response
// @Router /api/v1/membership/feature-access [get]
func (h *MembershipHandler) CheckFeatureAccess(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	featureCode := c.QueryParam("code")
	if featureCode == "" {
		return fail(c, 400, "Feature code is required")
	}

	result, err := h.membershipService.CheckFeatureAccess(userID, featureCode)
	if err != nil {
		return fail(c, 500, "Failed to check feature access: "+err.Error())
	}

	return success(c, result)
}

// RecordFeatureUsage 记录功能使用
// @Summary Record Feature Usage
// @Description Record feature usage for the current user
// @Tags Membership
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param code query string true "Feature code"
// @Success 200 {object} Response
// @Router /api/v1/membership/feature-usage [post]
func (h *MembershipHandler) RecordFeatureUsage(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req struct {
		FeatureCode string `json:"feature_code"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request")
	}

	if req.FeatureCode == "" {
		return fail(c, 400, "Feature code is required")
	}

	if err := h.membershipService.RecordFeatureUsage(userID, req.FeatureCode); err != nil {
		return fail(c, 500, "Failed to record feature usage: "+err.Error())
	}

	return success(c, map[string]string{"message": "Usage recorded"})
}

// GetVIPComparison 获取VIP权益对比
// @Summary Get VIP Comparison
// @Description Get VIP benefits comparison
// @Tags Membership
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/membership/comparison [get]
func (h *MembershipHandler) GetVIPComparison(c echo.Context) error {
	comparison := h.membershipService.GetVIPComparison()
	return success(c, comparison)
}

// GetPlans 获取套餐列表
// @Summary Get Membership Plans
// @Description Get all available membership plans
// @Tags Membership
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/membership/plans [get]
func (h *MembershipHandler) GetPlans(c echo.Context) error {
	plans, err := h.membershipService.GetPlans(true)
	if err != nil {
		return fail(c, 500, "Failed to get plans: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"plans": plans,
		"total": len(plans),
	})
}

// CreateOrder 创建订单
// @Summary Create Membership Order
// @Description Create a new membership order
// @Tags Membership
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body object true "Order request"
// @Success 200 {object} Response
// @Router /api/v1/membership/orders [post]
func (h *MembershipHandler) CreateOrder(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req struct {
		PlanID uint `json:"plan_id"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request")
	}

	if req.PlanID == 0 {
		return fail(c, 400, "Plan ID is required")
	}

	order, err := h.membershipService.CreateOrder(userID, req.PlanID)
	if err != nil {
		return fail(c, 500, "Failed to create order: "+err.Error())
	}

	return success(c, order)
}

// GetMyOrders 获取我的订单
// @Summary Get My Orders
// @Description Get current user's membership orders
// @Tags Membership
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/membership/orders [get]
func (h *MembershipHandler) GetMyOrders(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	result, err := h.membershipService.GetUserOrders(userID, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to get orders: "+err.Error())
	}

	return success(c, result)
}

// PayOrder 支付订单(模拟)
// @Summary Pay Order
// @Description Simulate payment for an order
// @Tags Membership
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param order_no path string true "Order number"
// @Success 200 {object} Response
// @Router /api/v1/membership/orders/{order_no}/pay [post]
func (h *MembershipHandler) PayOrder(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	orderNo := c.Param("order_no")
	if orderNo == "" {
		return fail(c, 400, "Order number is required")
	}

	var req struct {
		PaymentMethod string `json:"payment_method"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request")
	}

	if req.PaymentMethod == "" {
		req.PaymentMethod = "alipay"
	}

	order, err := h.membershipService.PayOrder(orderNo, req.PaymentMethod)
	if err != nil {
		return fail(c, 500, "Failed to pay order: "+err.Error())
	}

	return success(c, order)
}

// ============================================
// Admin APIs
// ============================================

// AdminGetMembershipStats 获取会员统计
// @Summary Get Membership Stats (Admin)
// @Description Get membership statistics
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships/stats [get]
func (h *MembershipHandler) AdminGetMembershipStats(c echo.Context) error {
	membershipStats, err := h.membershipService.GetMembershipStats()
	if err != nil {
		return fail(c, 500, "Failed to get membership stats: "+err.Error())
	}

	orderStats, err := h.membershipService.GetOrderStats()
	if err != nil {
		return fail(c, 500, "Failed to get order stats: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"membership": membershipStats,
		"order":      orderStats,
	})
}

// AdminListMemberships 获取会员列表
// @Summary List Memberships (Admin)
// @Description List all user memberships
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Param keyword query string false "Search keyword"
// @Param level query int false "Membership level"
// @Param status query int false "Membership status"
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships [get]
func (h *MembershipHandler) AdminListMemberships(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	keyword := c.QueryParam("keyword")

	params := &repository.MembershipListParams{
		Page:     page,
		PageSize: pageSize,
		Keyword:  keyword,
	}

	if levelStr := c.QueryParam("level"); levelStr != "" {
		level, _ := strconv.Atoi(levelStr)
		membershipLevel := model.MembershipLevel(level)
		params.Level = &membershipLevel
	}
	if statusStr := c.QueryParam("status"); statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		membershipStatus := model.MembershipStatus(status)
		params.Status = &membershipStatus
	}

	result, err := h.membershipService.ListMemberships(params)
	if err != nil {
		return fail(c, 500, "Failed to list memberships: "+err.Error())
	}

	return success(c, result)
}

// AdminGetUserMembership 获取用户会员详情
// @Summary Get User Membership (Admin)
// @Description Get a specific user's membership details
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param user_id path int true "User ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships/{user_id} [get]
func (h *MembershipHandler) AdminGetUserMembership(c echo.Context) error {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid user ID")
	}

	detail, err := h.membershipService.GetUserMembershipDetail(uint(userID))
	if err != nil {
		return fail(c, 500, "Failed to get membership: "+err.Error())
	}

	return success(c, detail)
}

// AdminActivateVIP 激活VIP
// @Summary Activate VIP (Admin)
// @Description Activate VIP membership for a user
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param user_id path int true "User ID"
// @Param request body object true "Activation request"
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships/{user_id}/activate [post]
func (h *MembershipHandler) AdminActivateVIP(c echo.Context) error {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid user ID")
	}

	var req struct {
		Days   int    `json:"days"`
		Source string `json:"source"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request")
	}

	if req.Days <= 0 {
		return fail(c, 400, "Days must be positive")
	}
	if req.Source == "" {
		req.Source = "gift"
	}

	membership, err := h.membershipService.ActivateVIP(uint(userID), req.Days, req.Source)
	if err != nil {
		return fail(c, 500, "Failed to activate VIP: "+err.Error())
	}

	return success(c, membership)
}

// AdminDeactivateVIP 取消VIP
// @Summary Deactivate VIP (Admin)
// @Description Deactivate VIP membership for a user
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param user_id path int true "User ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships/{user_id}/deactivate [post]
func (h *MembershipHandler) AdminDeactivateVIP(c echo.Context) error {
	userID, err := strconv.ParseUint(c.Param("user_id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid user ID")
	}

	if err := h.membershipService.DeactivateVIP(uint(userID)); err != nil {
		return fail(c, 500, "Failed to deactivate VIP: "+err.Error())
	}

	return success(c, map[string]string{"message": "VIP deactivated successfully"})
}

// AdminListPlans 获取套餐列表(管理端)
// @Summary List Plans (Admin)
// @Description List all membership plans
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships/plans [get]
func (h *MembershipHandler) AdminListPlans(c echo.Context) error {
	plans, err := h.membershipService.GetPlans(false)
	if err != nil {
		return fail(c, 500, "Failed to get plans: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"plans": plans,
		"total": len(plans),
	})
}

// AdminCreatePlan 创建套餐
// @Summary Create Plan (Admin)
// @Description Create a new membership plan
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.CreatePlanRequest true "Plan request"
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships/plans [post]
func (h *MembershipHandler) AdminCreatePlan(c echo.Context) error {
	var req service.CreatePlanRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request")
	}

	plan, err := h.membershipService.CreatePlan(&req)
	if err != nil {
		return fail(c, 500, "Failed to create plan: "+err.Error())
	}

	return success(c, plan)
}

// AdminUpdatePlan 更新套餐
// @Summary Update Plan (Admin)
// @Description Update a membership plan
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Plan ID"
// @Param request body service.UpdatePlanRequest true "Plan request"
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships/plans/{id} [put]
func (h *MembershipHandler) AdminUpdatePlan(c echo.Context) error {
	planID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid plan ID")
	}

	var req service.UpdatePlanRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request")
	}

	plan, err := h.membershipService.UpdatePlan(uint(planID), &req)
	if err != nil {
		return fail(c, 500, "Failed to update plan: "+err.Error())
	}

	return success(c, plan)
}

// AdminDeletePlan 删除套餐
// @Summary Delete Plan (Admin)
// @Description Delete a membership plan
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Plan ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships/plans/{id} [delete]
func (h *MembershipHandler) AdminDeletePlan(c echo.Context) error {
	planID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid plan ID")
	}

	if err := h.membershipService.DeletePlan(uint(planID)); err != nil {
		return fail(c, 500, "Failed to delete plan: "+err.Error())
	}

	return success(c, map[string]string{"message": "Plan deleted successfully"})
}

// AdminListOrders 获取订单列表
// @Summary List Orders (Admin)
// @Description List all membership orders
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Param user_id query int false "User ID"
// @Param payment_status query int false "Payment status"
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships/orders [get]
func (h *MembershipHandler) AdminListOrders(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	userID, _ := strconv.ParseUint(c.QueryParam("user_id"), 10, 32)

	params := &repository.OrderListParams{
		Page:     page,
		PageSize: pageSize,
		UserID:   uint(userID),
	}

	if statusStr := c.QueryParam("payment_status"); statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		params.PaymentStatus = &status
	}

	result, err := h.membershipService.AdminListOrders(params)
	if err != nil {
		return fail(c, 500, "Failed to list orders: "+err.Error())
	}

	return success(c, result)
}

// AdminGetFeatures 获取功能权益列表
// @Summary Get Features (Admin)
// @Description Get all VIP features
// @Tags Membership Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/memberships/features [get]
func (h *MembershipHandler) AdminGetFeatures(c echo.Context) error {
	return success(c, map[string]interface{}{
		"features": model.VIPFeatureList,
		"total":    len(model.VIPFeatureList),
	})
}

// ============================================
// Route Registration
// ============================================

// RegisterRoutes 注册用户端路由
func (h *MembershipHandler) RegisterRoutes(v1 *echo.Group, authMiddleware echo.MiddlewareFunc) {
	// 公开路由
	membership := v1.Group("/membership")
	membership.GET("/comparison", h.GetVIPComparison)
	membership.GET("/plans", h.GetPlans)

	// 需要登录的路由
	membershipAuth := membership.Group("")
	membershipAuth.Use(authMiddleware)
	membershipAuth.GET("", h.GetMyMembership)
	membershipAuth.GET("/vip-status", h.CheckVIPStatus)
	membershipAuth.GET("/feature-access", h.CheckFeatureAccess)
	membershipAuth.POST("/feature-usage", h.RecordFeatureUsage)
	membershipAuth.POST("/orders", h.CreateOrder)
	membershipAuth.GET("/orders", h.GetMyOrders)
	membershipAuth.POST("/orders/:order_no/pay", h.PayOrder)
}

// RegisterAdminRoutes 注册管理端路由
func (h *MembershipHandler) RegisterAdminRoutes(adminGroup *echo.Group, adminMiddleware echo.MiddlewareFunc) {
	memberships := adminGroup.Group("/memberships")
	memberships.Use(adminMiddleware)

	// 统计
	memberships.GET("/stats", h.AdminGetMembershipStats)

	// 会员管理
	memberships.GET("", h.AdminListMemberships)
	memberships.GET("/:user_id", h.AdminGetUserMembership)
	memberships.POST("/:user_id/activate", h.AdminActivateVIP)
	memberships.POST("/:user_id/deactivate", h.AdminDeactivateVIP)

	// 套餐管理
	memberships.GET("/plans", h.AdminListPlans)
	memberships.POST("/plans", h.AdminCreatePlan)
	memberships.PUT("/plans/:id", h.AdminUpdatePlan)
	memberships.DELETE("/plans/:id", h.AdminDeletePlan)

	// 订单管理
	memberships.GET("/orders", h.AdminListOrders)

	// 功能权益
	memberships.GET("/features", h.AdminGetFeatures)
}
