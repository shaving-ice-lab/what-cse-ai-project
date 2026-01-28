package handler

import (
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

// CalendarHandler 日历处理器
type CalendarHandler struct {
	calendarService *service.CalendarService
}

// NewCalendarHandler creates a new calendar handler
func NewCalendarHandler(calendarService *service.CalendarService) *CalendarHandler {
	return &CalendarHandler{calendarService: calendarService}
}

// GetEvents gets calendar events
// @Summary Get Calendar Events
// @Description Get calendar events with filters and pagination
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param start_date query string false "Start date (YYYY-MM-DD)"
// @Param end_date query string false "End date (YYYY-MM-DD)"
// @Param event_type query string false "Event type"
// @Param status query string false "Event status"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(50)
// @Success 200 {object} Response
// @Router /api/v1/calendar [get]
func (h *CalendarHandler) GetEvents(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	params := &repository.CalendarQueryParams{}

	// Parse date parameters
	if startDateStr := c.QueryParam("start_date"); startDateStr != "" {
		startDate, err := time.Parse("2006-01-02", startDateStr)
		if err == nil {
			params.StartDate = &startDate
		}
	}
	if endDateStr := c.QueryParam("end_date"); endDateStr != "" {
		endDate, err := time.Parse("2006-01-02", endDateStr)
		if err == nil {
			params.EndDate = &endDate
		}
	}

	// Parse other parameters
	if eventType := c.QueryParam("event_type"); eventType != "" {
		params.EventType = model.CalendarEventType(eventType)
	}
	if status := c.QueryParam("status"); status != "" {
		params.Status = model.CalendarEventStatus(status)
	}
	if positionID := c.QueryParam("position_id"); positionID != "" {
		params.PositionID = &positionID
	}

	// Parse pagination
	if page := c.QueryParam("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil {
			params.Page = p
		}
	}
	if pageSize := c.QueryParam("page_size"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil {
			params.PageSize = ps
		}
	}

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 50
	}

	result, err := h.calendarService.GetEvents(userID, params)
	if err != nil {
		return fail(c, 500, "Failed to get events: "+err.Error())
	}

	return success(c, result)
}

// GetEventsByMonth gets events for a specific month
// @Summary Get Events By Month
// @Description Get all calendar events for a specific month
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param year path int true "Year (e.g., 2026)"
// @Param month path int true "Month (1-12)"
// @Success 200 {object} Response
// @Router /api/v1/calendar/month/{year}/{month} [get]
func (h *CalendarHandler) GetEventsByMonth(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	year, err := strconv.Atoi(c.Param("year"))
	if err != nil || year < 2000 || year > 2100 {
		return fail(c, 400, "Invalid year")
	}

	month, err := strconv.Atoi(c.Param("month"))
	if err != nil || month < 1 || month > 12 {
		return fail(c, 400, "Invalid month")
	}

	result, err := h.calendarService.GetEventsByMonth(userID, year, month)
	if err != nil {
		return fail(c, 500, "Failed to get events: "+err.Error())
	}

	return success(c, result)
}

// GetUpcomingEvents gets upcoming events
// @Summary Get Upcoming Events
// @Description Get upcoming events within specified days
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param days query int false "Number of days to look ahead" default(7)
// @Success 200 {object} Response
// @Router /api/v1/calendar/upcoming [get]
func (h *CalendarHandler) GetUpcomingEvents(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	days := 7
	if daysStr := c.QueryParam("days"); daysStr != "" {
		if d, err := strconv.Atoi(daysStr); err == nil {
			days = d
		}
	}

	result, err := h.calendarService.GetUpcomingEvents(userID, days)
	if err != nil {
		return fail(c, 500, "Failed to get upcoming events: "+err.Error())
	}

	return success(c, result)
}

// CreateEvent creates a new calendar event
// @Summary Create Calendar Event
// @Description Create a new calendar event
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.CreateEventRequest true "Event details"
// @Success 200 {object} Response
// @Router /api/v1/calendar [post]
func (h *CalendarHandler) CreateEvent(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.CreateEventRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.EventType == "" || req.EventTitle == "" || req.EventDate == "" {
		return fail(c, 400, "event_type, event_title and event_date are required")
	}

	event, err := h.calendarService.CreateEvent(userID, &req)
	if err != nil {
		if err == service.ErrInvalidEventType {
			return fail(c, 400, "Invalid event type")
		}
		if err == service.ErrInvalidEventDate {
			return fail(c, 400, "Invalid event date format (use YYYY-MM-DD)")
		}
		if err == service.ErrPositionNotFound {
			return fail(c, 404, "Position not found")
		}
		return fail(c, 500, "Failed to create event: "+err.Error())
	}

	return success(c, event.ToResponse())
}

// UpdateEvent updates a calendar event
// @Summary Update Calendar Event
// @Description Update an existing calendar event
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Event ID"
// @Param request body service.UpdateEventRequest true "Updated event details"
// @Success 200 {object} Response
// @Router /api/v1/calendar/{id} [put]
func (h *CalendarHandler) UpdateEvent(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	eventID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid event ID")
	}

	var req service.UpdateEventRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.calendarService.UpdateEvent(userID, uint(eventID), &req); err != nil {
		if err == service.ErrCalendarEventNotFound {
			return fail(c, 404, "Event not found")
		}
		if err == service.ErrInvalidEventDate {
			return fail(c, 400, "Invalid event date format (use YYYY-MM-DD)")
		}
		return fail(c, 500, "Failed to update event: "+err.Error())
	}

	return success(c, map[string]string{"message": "Event updated"})
}

// DeleteEvent deletes a calendar event
// @Summary Delete Calendar Event
// @Description Delete a calendar event
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Event ID"
// @Success 200 {object} Response
// @Router /api/v1/calendar/{id} [delete]
func (h *CalendarHandler) DeleteEvent(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	eventID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid event ID")
	}

	if err := h.calendarService.DeleteEvent(userID, uint(eventID)); err != nil {
		return fail(c, 500, "Failed to delete event: "+err.Error())
	}

	return success(c, map[string]string{"message": "Event deleted"})
}

// AutoCreateEvents automatically creates events from position data
// @Summary Auto Create Events
// @Description Automatically create calendar events from position dates
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body object true "Position ID"
// @Success 200 {object} Response
// @Router /api/v1/calendar/auto-create [post]
func (h *CalendarHandler) AutoCreateEvents(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req struct {
		PositionID string `json:"position_id"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.PositionID == "" {
		return fail(c, 400, "position_id is required")
	}

	events, err := h.calendarService.AutoCreateEvents(userID, req.PositionID)
	if err != nil {
		if err == service.ErrPositionNotFound {
			return fail(c, 404, "Position not found")
		}
		return fail(c, 500, "Failed to create events: "+err.Error())
	}

	responses := make([]*model.CalendarEventResponse, len(events))
	for i, e := range events {
		responses[i] = e.ToResponse()
	}

	return success(c, map[string]interface{}{
		"message": "Events created",
		"count":   len(events),
		"events":  responses,
	})
}

// MarkCompleted marks an event as completed
// @Summary Mark Event Completed
// @Description Mark a calendar event as completed
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Event ID"
// @Success 200 {object} Response
// @Router /api/v1/calendar/{id}/complete [post]
func (h *CalendarHandler) MarkCompleted(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	eventID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid event ID")
	}

	if err := h.calendarService.MarkEventCompleted(userID, uint(eventID)); err != nil {
		return fail(c, 500, "Failed to mark event as completed: "+err.Error())
	}

	return success(c, map[string]string{"message": "Event marked as completed"})
}

// MarkCancelled marks an event as cancelled
// @Summary Mark Event Cancelled
// @Description Mark a calendar event as cancelled
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Event ID"
// @Success 200 {object} Response
// @Router /api/v1/calendar/{id}/cancel [post]
func (h *CalendarHandler) MarkCancelled(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	eventID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid event ID")
	}

	if err := h.calendarService.MarkEventCancelled(userID, uint(eventID)); err != nil {
		return fail(c, 500, "Failed to mark event as cancelled: "+err.Error())
	}

	return success(c, map[string]string{"message": "Event marked as cancelled"})
}

// GetStats gets calendar statistics
// @Summary Get Calendar Stats
// @Description Get statistics of calendar events
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/calendar/stats [get]
func (h *CalendarHandler) GetStats(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	stats, err := h.calendarService.GetEventStats(userID)
	if err != nil {
		return fail(c, 500, "Failed to get stats: "+err.Error())
	}

	return success(c, stats)
}

// GetEventTypes gets all event types
// @Summary Get Event Types
// @Description Get all available event types
// @Tags Calendar
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/calendar/types [get]
func (h *CalendarHandler) GetEventTypes(c echo.Context) error {
	types := []map[string]interface{}{}

	for _, t := range model.CalendarEventTypeList {
		eventType := model.CalendarEventType(t)
		types = append(types, map[string]interface{}{
			"type":  t,
			"name":  model.GetEventTypeName(eventType),
			"color": model.GetEventTypeColor(eventType),
		})
	}

	return success(c, map[string]interface{}{
		"types": types,
	})
}

// DeletePositionEvents deletes all auto-created events for a position
// @Summary Delete Position Events
// @Description Delete all auto-created calendar events for a position
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param position_id path string true "Position ID"
// @Success 200 {object} Response
// @Router /api/v1/calendar/position/{position_id} [delete]
func (h *CalendarHandler) DeletePositionEvents(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	positionID := c.Param("position_id")
	if positionID == "" {
		return fail(c, 400, "Position ID is required")
	}

	if err := h.calendarService.DeletePositionEvents(userID, positionID); err != nil {
		return fail(c, 500, "Failed to delete events: "+err.Error())
	}

	return success(c, map[string]string{"message": "Position events deleted"})
}

// SyncFromAnnouncement syncs calendar events from announcement
// @Summary Sync From Announcement
// @Description Create calendar events from all positions in an announcement
// @Tags Calendar
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param announcementId path int true "Announcement ID"
// @Success 200 {object} Response
// @Router /api/v1/calendar/sync/{announcementId} [post]
func (h *CalendarHandler) SyncFromAnnouncement(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	announcementID, err := strconv.ParseUint(c.Param("announcementId"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid announcement ID")
	}

	result, err := h.calendarService.SyncFromAnnouncement(userID, uint(announcementID))
	if err != nil {
		if err.Error() == "announcement not found" {
			return fail(c, 404, "公告不存在")
		}
		if err.Error() == "announcement repository not configured" {
			return fail(c, 500, "服务配置错误")
		}
		return fail(c, 500, "同步失败: "+err.Error())
	}

	// 构建响应
	responses := make([]*model.CalendarEventResponse, len(result.Events))
	for i, e := range result.Events {
		responses[i] = e.ToResponse()
	}

	return success(c, map[string]interface{}{
		"announcement_id":    result.AnnouncementID,
		"announcement_title": result.AnnouncementTitle,
		"positions_count":    result.PositionsCount,
		"events_created":     result.EventsCreated,
		"events":             responses,
		"message":            "同步成功",
	})
}

// RegisterRoutes registers all calendar routes
func (h *CalendarHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	calGroup := g.Group("/calendar")
	calGroup.Use(authMiddleware)

	// Event type metadata (public within authenticated routes)
	calGroup.GET("/types", h.GetEventTypes)

	// Get events
	calGroup.GET("", h.GetEvents)
	calGroup.GET("/month/:year/:month", h.GetEventsByMonth)
	calGroup.GET("/upcoming", h.GetUpcomingEvents)
	calGroup.GET("/stats", h.GetStats)

	// CRUD operations
	calGroup.POST("", h.CreateEvent)
	calGroup.PUT("/:id", h.UpdateEvent)
	calGroup.DELETE("/:id", h.DeleteEvent)

	// Status operations
	calGroup.POST("/:id/complete", h.MarkCompleted)
	calGroup.POST("/:id/cancel", h.MarkCancelled)

	// Auto-create from position
	calGroup.POST("/auto-create", h.AutoCreateEvents)

	// Sync from announcement
	calGroup.POST("/sync/:announcementId", h.SyncFromAnnouncement)

	// Delete position events
	calGroup.DELETE("/position/:position_id", h.DeletePositionEvents)
}
