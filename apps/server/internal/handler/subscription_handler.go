package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

type SubscriptionHandler struct {
	subscriptionService *service.SubscriptionService
}

func NewSubscriptionHandler(subscriptionService *service.SubscriptionService) *SubscriptionHandler {
	return &SubscriptionHandler{subscriptionService: subscriptionService}
}

// CreateSubscription creates a new subscription
// @Summary Create Subscription
// @Description Create a new subscription for notifications
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.CreateSubscriptionRequest true "Subscription request"
// @Success 200 {object} Response
// @Router /api/v1/subscriptions [post]
func (h *SubscriptionHandler) CreateSubscription(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.CreateSubscriptionRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.SubscribeType == "" || req.SubscribeValue == "" || req.SubscribeName == "" {
		return fail(c, 400, "subscribe_type, subscribe_value and subscribe_name are required")
	}

	subscription, err := h.subscriptionService.Create(userID, &req)
	if err != nil {
		if err == service.ErrSubscriptionExists {
			return fail(c, 409, "Subscription already exists")
		}
		if err == service.ErrInvalidSubscribeType {
			return fail(c, 400, "Invalid subscribe type")
		}
		return fail(c, 500, "Failed to create subscription: "+err.Error())
	}

	return success(c, subscription)
}

// GetSubscriptions gets all subscriptions
// @Summary Get Subscriptions
// @Description Get current user's subscriptions
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/subscriptions [get]
func (h *SubscriptionHandler) GetSubscriptions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	result, err := h.subscriptionService.List(userID, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to get subscriptions: "+err.Error())
	}

	return success(c, result)
}

// UpdateSubscription updates a subscription
// @Summary Update Subscription
// @Description Update an existing subscription
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Subscription ID"
// @Param request body service.UpdateSubscriptionRequest true "Update request"
// @Success 200 {object} Response
// @Router /api/v1/subscriptions/{id} [put]
func (h *SubscriptionHandler) UpdateSubscription(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	subscriptionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid subscription ID")
	}

	var req service.UpdateSubscriptionRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.subscriptionService.Update(userID, uint(subscriptionID), &req); err != nil {
		return fail(c, 500, "Failed to update subscription: "+err.Error())
	}

	return success(c, map[string]string{"message": "Subscription updated"})
}

// ToggleSubscription toggles subscription enabled status
// @Summary Toggle Subscription
// @Description Enable or disable a subscription
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Subscription ID"
// @Success 200 {object} Response
// @Router /api/v1/subscriptions/{id}/toggle [put]
func (h *SubscriptionHandler) ToggleSubscription(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	subscriptionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid subscription ID")
	}

	if err := h.subscriptionService.Toggle(userID, uint(subscriptionID)); err != nil {
		return fail(c, 500, "Failed to toggle subscription: "+err.Error())
	}

	return success(c, map[string]string{"message": "Subscription toggled"})
}

// DeleteSubscription deletes a subscription
// @Summary Delete Subscription
// @Description Delete a subscription
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Subscription ID"
// @Success 200 {object} Response
// @Router /api/v1/subscriptions/{id} [delete]
func (h *SubscriptionHandler) DeleteSubscription(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	subscriptionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid subscription ID")
	}

	if err := h.subscriptionService.Delete(userID, uint(subscriptionID)); err != nil {
		return fail(c, 500, "Failed to delete subscription: "+err.Error())
	}

	return success(c, map[string]string{"message": "Subscription deleted"})
}

// GetSubscriptionTypes returns available subscription types
// @Summary Get Subscription Types
// @Description Get list of available subscription types
// @Tags Subscriptions
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/subscriptions/types [get]
func (h *SubscriptionHandler) GetSubscriptionTypes(c echo.Context) error {
	types := []map[string]string{
		{"value": string(model.SubscribeTypeExamType), "label": "考试类型", "description": "订阅特定考试类型的职位公告"},
		{"value": string(model.SubscribeTypeProvince), "label": "省份", "description": "订阅特定省份的职位公告"},
		{"value": string(model.SubscribeTypeCity), "label": "城市", "description": "订阅特定城市的职位公告"},
		{"value": string(model.SubscribeTypeKeyword), "label": "关键词", "description": "订阅包含特定关键词的职位公告"},
		{"value": string(model.SubscribeTypeDepartment), "label": "部门", "description": "订阅特定部门的职位公告"},
		{"value": string(model.SubscribeTypeEducation), "label": "学历", "description": "订阅特定学历要求的职位公告"},
		{"value": string(model.SubscribeTypeMajor), "label": "专业", "description": "订阅特定专业要求的职位公告"},
	}

	channels := []map[string]string{
		{"value": string(model.NotifyChannelPush), "label": "站内推送", "description": "通过站内消息推送通知"},
		{"value": string(model.NotifyChannelEmail), "label": "邮件通知", "description": "通过邮件发送通知"},
		{"value": string(model.NotifyChannelSMS), "label": "短信通知", "description": "通过短信发送通知"},
		{"value": string(model.NotifyChannelWechat), "label": "微信通知", "description": "通过微信发送通知"},
	}

	return success(c, map[string]interface{}{
		"types":    types,
		"channels": channels,
	})
}

// RegisterRoutes registers all subscription routes
func (h *SubscriptionHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	subGroup := g.Group("/subscriptions")

	// 公开路由（获取订阅类型）
	subGroup.GET("/types", h.GetSubscriptionTypes)

	// 需要登录的路由
	subGroup.POST("", h.CreateSubscription, authMiddleware)
	subGroup.GET("", h.GetSubscriptions, authMiddleware)
	subGroup.PUT("/:id", h.UpdateSubscription, authMiddleware)
	subGroup.PUT("/:id/toggle", h.ToggleSubscription, authMiddleware)
	subGroup.DELETE("/:id", h.DeleteSubscription, authMiddleware)
}
