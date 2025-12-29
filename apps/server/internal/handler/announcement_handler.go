package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type AnnouncementHandler struct {
	announcementService *service.AnnouncementService
}

func NewAnnouncementHandler(announcementService *service.AnnouncementService) *AnnouncementHandler {
	return &AnnouncementHandler{announcementService: announcementService}
}

// ListAnnouncements returns a paginated list of announcements
// @Summary List Announcements
// @Description Get a paginated list of announcements with filters
// @Tags Announcement
// @Accept json
// @Produce json
// @Param announcement_type query string false "Announcement type filter"
// @Param exam_type query string false "Exam type filter"
// @Param province query string false "Province filter"
// @Param keyword query string false "Keyword search"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/announcements [get]
func (h *AnnouncementHandler) ListAnnouncements(c echo.Context) error {
	var req service.AnnouncementListRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.announcementService.ListAnnouncements(&req)
	if err != nil {
		return fail(c, 500, "Failed to fetch announcements: "+err.Error())
	}

	return success(c, result)
}

// GetAnnouncement returns announcement details
// @Summary Get Announcement Detail
// @Description Get detailed information for a specific announcement
// @Tags Announcement
// @Accept json
// @Produce json
// @Param id path int true "Announcement ID"
// @Success 200 {object} Response
// @Router /api/v1/announcements/{id} [get]
func (h *AnnouncementHandler) GetAnnouncement(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid announcement ID")
	}

	announcement, err := h.announcementService.GetAnnouncementDetail(uint(id))
	if err != nil {
		if err == service.ErrAnnouncementNotFound {
			return fail(c, 404, "Announcement not found")
		}
		return fail(c, 500, "Failed to fetch announcement: "+err.Error())
	}

	return success(c, announcement)
}

// SearchAnnouncements searches announcements by keyword
// @Summary Search Announcements
// @Description Search announcements by keyword
// @Tags Announcement
// @Accept json
// @Produce json
// @Param keyword query string true "Search keyword"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/announcements/search [get]
func (h *AnnouncementHandler) SearchAnnouncements(c echo.Context) error {
	keyword := c.QueryParam("keyword")
	if keyword == "" {
		return fail(c, 400, "Keyword is required")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	result, err := h.announcementService.SearchAnnouncements(keyword, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to search announcements: "+err.Error())
	}

	return success(c, result)
}

// GetLatestAnnouncements returns latest announcements
// @Summary Get Latest Announcements
// @Description Get latest announcements for homepage
// @Tags Announcement
// @Accept json
// @Produce json
// @Param limit query int false "Number of announcements" default(10)
// @Success 200 {object} Response
// @Router /api/v1/announcements/latest [get]
func (h *AnnouncementHandler) GetLatestAnnouncements(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))

	announcements, err := h.announcementService.GetLatestAnnouncements(limit)
	if err != nil {
		return fail(c, 500, "Failed to fetch announcements: "+err.Error())
	}

	return success(c, announcements)
}

func (h *AnnouncementHandler) RegisterRoutes(g *echo.Group) {
	g.GET("", h.ListAnnouncements)
	g.GET("/latest", h.GetLatestAnnouncements)
	g.GET("/search", h.SearchAnnouncements)
	g.GET("/:id", h.GetAnnouncement)
}
