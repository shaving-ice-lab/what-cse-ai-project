package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type NotificationHandler struct {
	notificationService *service.NotificationService
}

func NewNotificationHandler(notificationService *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{notificationService: notificationService}
}

// GetNotifications returns user's notifications
// @Summary Get Notifications
// @Description Get current user's notifications
// @Tags Notification
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param unread_only query bool false "Only show unread notifications"
// @Success 200 {object} Response
// @Router /api/v1/notifications [get]
func (h *NotificationHandler) GetNotifications(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	unreadOnly := c.QueryParam("unread_only") == "true"

	result, err := h.notificationService.GetUserNotifications(userID, page, pageSize, unreadOnly)
	if err != nil {
		return fail(c, 500, "Failed to fetch notifications: "+err.Error())
	}

	return success(c, result)
}

// MarkAsRead marks a notification as read
// @Summary Mark Notification as Read
// @Description Mark a specific notification as read
// @Tags Notification
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Notification ID"
// @Success 200 {object} Response
// @Router /api/v1/notifications/{id}/read [put]
func (h *NotificationHandler) MarkAsRead(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	notificationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid notification ID")
	}

	if err := h.notificationService.MarkAsRead(userID, uint(notificationID)); err != nil {
		if err == service.ErrNotificationNotFound {
			return fail(c, 404, "Notification not found")
		}
		return fail(c, 500, "Failed to mark notification as read: "+err.Error())
	}

	return success(c, map[string]string{"message": "Notification marked as read"})
}

// MarkAllAsRead marks all notifications as read
// @Summary Mark All Notifications as Read
// @Description Mark all user's notifications as read
// @Tags Notification
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/notifications/read-all [put]
func (h *NotificationHandler) MarkAllAsRead(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	if err := h.notificationService.MarkAllAsRead(userID); err != nil {
		return fail(c, 500, "Failed to mark all notifications as read: "+err.Error())
	}

	return success(c, map[string]string{"message": "All notifications marked as read"})
}

// DeleteNotification deletes a notification
// @Summary Delete Notification
// @Description Delete a specific notification
// @Tags Notification
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Notification ID"
// @Success 200 {object} Response
// @Router /api/v1/notifications/{id} [delete]
func (h *NotificationHandler) DeleteNotification(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	notificationID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid notification ID")
	}

	if err := h.notificationService.DeleteNotification(userID, uint(notificationID)); err != nil {
		if err == service.ErrNotificationNotFound {
			return fail(c, 404, "Notification not found")
		}
		return fail(c, 500, "Failed to delete notification: "+err.Error())
	}

	return success(c, map[string]string{"message": "Notification deleted"})
}

func (h *NotificationHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	g.GET("", h.GetNotifications, authMiddleware)
	g.PUT("/:id/read", h.MarkAsRead, authMiddleware)
	g.PUT("/read-all", h.MarkAllAsRead, authMiddleware)
	g.DELETE("/:id", h.DeleteNotification, authMiddleware)
}
