package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type CrawlerHandler struct {
	crawlerService *service.CrawlerService
}

func NewCrawlerHandler(crawlerService *service.CrawlerService) *CrawlerHandler {
	return &CrawlerHandler{crawlerService: crawlerService}
}

// ListCrawlerTasks returns list of crawler tasks
// @Summary List Crawler Tasks (Admin)
// @Description Get list of crawler tasks and their status
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/crawlers [get]
func (h *CrawlerHandler) ListCrawlerTasks(c echo.Context) error {
	stats, err := h.crawlerService.GetCrawlerStats()
	if err != nil {
		return fail(c, 500, "Failed to fetch crawler stats: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"stats": stats,
	})
}

// TriggerCrawler triggers a crawler task
// @Summary Trigger Crawler (Admin)
// @Description Manually trigger a crawler task
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body service.TriggerCrawlerRequest true "Trigger request"
// @Success 200 {object} Response
// @Router /api/v1/admin/crawlers/trigger [post]
func (h *CrawlerHandler) TriggerCrawler(c echo.Context) error {
	var req service.TriggerCrawlerRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	taskStatus, err := h.crawlerService.TriggerCrawler(&req)
	if err != nil {
		return fail(c, 500, "Failed to trigger crawler: "+err.Error())
	}

	return success(c, taskStatus)
}

// ListListPages returns list of monitored list pages
// @Summary List List Pages (Admin)
// @Description Get list of monitored list pages
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param status query string false "Status filter"
// @Success 200 {object} Response
// @Router /api/v1/admin/list-pages [get]
func (h *CrawlerHandler) ListListPages(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	status := c.QueryParam("status")

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	listPages, total, err := h.crawlerService.ListListPages(status, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to fetch list pages: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"list_pages": listPages,
		"total":      total,
		"page":       page,
		"page_size":  pageSize,
	})
}

// CreateListPage adds a new list page to monitor
// @Summary Create List Page (Admin)
// @Description Add a new list page to monitor
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body service.CreateListPageRequest true "List page data"
// @Success 200 {object} Response
// @Router /api/v1/admin/list-pages [post]
func (h *CrawlerHandler) CreateListPage(c echo.Context) error {
	var req service.CreateListPageRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.URL == "" {
		return fail(c, 400, "URL is required")
	}

	listPage, err := h.crawlerService.CreateListPage(&req)
	if err != nil {
		if err == service.ErrListPageExists {
			return fail(c, 409, "List page with this URL already exists")
		}
		return fail(c, 500, "Failed to create list page: "+err.Error())
	}

	return success(c, listPage)
}

// GetListPage returns a specific list page
// @Summary Get List Page (Admin)
// @Description Get a specific list page by ID
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "List Page ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/list-pages/{id} [get]
func (h *CrawlerHandler) GetListPage(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid list page ID")
	}

	listPage, err := h.crawlerService.GetListPage(uint(id))
	if err != nil {
		return fail(c, 404, "List page not found")
	}

	return success(c, listPage)
}

// UpdateListPage updates a list page
// @Summary Update List Page (Admin)
// @Description Update a list page configuration
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "List Page ID"
// @Param request body service.UpdateListPageRequest true "Update data"
// @Success 200 {object} Response
// @Router /api/v1/admin/list-pages/{id} [put]
func (h *CrawlerHandler) UpdateListPage(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid list page ID")
	}

	var req service.UpdateListPageRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	listPage, err := h.crawlerService.UpdateListPage(uint(id), &req)
	if err != nil {
		if err == service.ErrListPageNotFound {
			return fail(c, 404, "List page not found")
		}
		return fail(c, 500, "Failed to update list page: "+err.Error())
	}

	return success(c, listPage)
}

// DeleteListPage deletes a list page
// @Summary Delete List Page (Admin)
// @Description Delete a list page from monitoring
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "List Page ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/list-pages/{id} [delete]
func (h *CrawlerHandler) DeleteListPage(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid list page ID")
	}

	if err := h.crawlerService.DeleteListPage(uint(id)); err != nil {
		if err == service.ErrListPageNotFound {
			return fail(c, 404, "List page not found")
		}
		return fail(c, 500, "Failed to delete list page: "+err.Error())
	}

	return success(c, map[string]string{"message": "List page deleted"})
}

func (h *CrawlerHandler) RegisterRoutes(g *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	crawler := g.Group("", adminAuthMiddleware)
	crawler.GET("/crawlers", h.ListCrawlerTasks)
	crawler.POST("/crawlers/trigger", h.TriggerCrawler)
	crawler.GET("/list-pages", h.ListListPages)
	crawler.POST("/list-pages", h.CreateListPage)
	crawler.GET("/list-pages/:id", h.GetListPage)
	crawler.PUT("/list-pages/:id", h.UpdateListPage)
	crawler.DELETE("/list-pages/:id", h.DeleteListPage)
}
