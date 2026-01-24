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

// ListCrawlTasks returns list of crawl tasks
// @Summary List Crawl Tasks (Admin)
// @Description Get paginated list of crawl tasks
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param task_type query string false "Task type filter"
// @Param status query string false "Status filter"
// @Success 200 {object} Response
// @Router /api/v1/admin/crawlers/tasks [get]
func (h *CrawlerHandler) ListCrawlTasks(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	taskType := c.QueryParam("task_type")
	status := c.QueryParam("status")

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	tasks, total, err := h.crawlerService.ListCrawlTasks(taskType, status, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to fetch tasks: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"tasks":     tasks,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetCrawlTask returns a specific crawl task
// @Summary Get Crawl Task (Admin)
// @Description Get a specific crawl task by ID
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path string true "Task ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/crawlers/tasks/{id} [get]
func (h *CrawlerHandler) GetCrawlTask(c echo.Context) error {
	taskID := c.Param("id")
	if taskID == "" {
		return fail(c, 400, "Task ID is required")
	}

	task, err := h.crawlerService.GetCrawlTask(taskID)
	if err != nil {
		return fail(c, 404, "Task not found")
	}

	return success(c, task)
}

// CancelCrawlTask cancels a crawl task
// @Summary Cancel Crawl Task (Admin)
// @Description Cancel a running or pending crawl task
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path string true "Task ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/crawlers/tasks/{id}/cancel [post]
func (h *CrawlerHandler) CancelCrawlTask(c echo.Context) error {
	taskID := c.Param("id")
	if taskID == "" {
		return fail(c, 400, "Task ID is required")
	}

	if err := h.crawlerService.CancelCrawlTask(taskID); err != nil {
		return fail(c, 500, "Failed to cancel task: "+err.Error())
	}

	return success(c, map[string]string{"message": "Task cancelled"})
}

// GetCrawlerLogs returns crawler logs
// @Summary Get Crawler Logs (Admin)
// @Description Get recent crawler logs
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param task_id query string false "Filter by task ID"
// @Param limit query int false "Limit" default(100)
// @Success 200 {object} Response
// @Router /api/v1/admin/crawlers/logs [get]
func (h *CrawlerHandler) GetCrawlerLogs(c echo.Context) error {
	taskID := c.QueryParam("task_id")
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 || limit > 1000 {
		limit = 100
	}

	logs, err := h.crawlerService.GetCrawlerLogs(taskID, limit)
	if err != nil {
		return fail(c, 500, "Failed to fetch logs: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"logs": logs,
	})
}

// TestListPageCrawl tests crawling a list page
// @Summary Test List Page Crawl (Admin)
// @Description Test crawl a list page without saving results
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "List Page ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/list-pages/{id}/test [post]
func (h *CrawlerHandler) TestListPageCrawl(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid list page ID")
	}

	result, err := h.crawlerService.TestListPageCrawl(uint(id))
	if err != nil {
		return fail(c, 500, "Test crawl failed: "+err.Error())
	}

	return success(c, result)
}

// GetCrawlerStatistics returns crawler statistics
// @Summary Get Crawler Statistics (Admin)
// @Description Get comprehensive crawler statistics
// @Tags Admin - Crawler
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/crawlers/stats [get]
func (h *CrawlerHandler) GetCrawlerStatistics(c echo.Context) error {
	stats, err := h.crawlerService.GetCrawlerStatistics()
	if err != nil {
		return fail(c, 500, "Failed to fetch statistics: "+err.Error())
	}

	return success(c, stats)
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
	
	// Crawler stats and trigger
	crawler.GET("/crawlers", h.ListCrawlerTasks)
	crawler.POST("/crawlers/trigger", h.TriggerCrawler)
	crawler.GET("/crawlers/stats", h.GetCrawlerStatistics)
	
	// Crawl tasks
	crawler.GET("/crawlers/tasks", h.ListCrawlTasks)
	crawler.GET("/crawlers/tasks/:id", h.GetCrawlTask)
	crawler.POST("/crawlers/tasks/:id/cancel", h.CancelCrawlTask)
	
	// Logs
	crawler.GET("/crawlers/logs", h.GetCrawlerLogs)
	
	// List pages
	crawler.GET("/list-pages", h.ListListPages)
	crawler.POST("/list-pages", h.CreateListPage)
	crawler.GET("/list-pages/:id", h.GetListPage)
	crawler.PUT("/list-pages/:id", h.UpdateListPage)
	crawler.DELETE("/list-pages/:id", h.DeleteListPage)
	crawler.POST("/list-pages/:id/test", h.TestListPageCrawl)
}
