package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type FenbiHandler struct {
	fenbiService *service.FenbiService
}

func NewFenbiHandler(fenbiService *service.FenbiService) *FenbiHandler {
	return &FenbiHandler{fenbiService: fenbiService}
}

// GetCredential returns the current Fenbi credential status
// @Summary Get Fenbi Credential (Admin)
// @Description Get the current Fenbi login credential status
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/credentials [get]
func (h *FenbiHandler) GetCredential(c echo.Context) error {
	credential, err := h.fenbiService.GetCredential()
	if err != nil {
		if err == service.ErrCredentialNotFound {
			return success(c, map[string]interface{}{
				"has_credential": false,
				"message":        "未配置粉笔账号",
			})
		}
		return fail(c, 500, "Failed to get credential: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"has_credential": true,
		"credential":     credential,
	})
}

// SaveCredential saves or updates Fenbi credential
// @Summary Save Fenbi Credential (Admin)
// @Description Save or update Fenbi login credential
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body service.SaveCredentialRequest true "Credential data"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/credentials [post]
func (h *FenbiHandler) SaveCredential(c echo.Context) error {
	var req service.SaveCredentialRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.Phone == "" || req.Password == "" {
		return fail(c, 400, "手机号和密码不能为空")
	}

	credential, err := h.fenbiService.SaveCredential(&req)
	if err != nil {
		return fail(c, 500, "保存凭证失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message":    "凭证已保存",
		"credential": credential,
	})
}

// Login performs Fenbi login
// @Summary Fenbi Login (Admin)
// @Description Login to Fenbi using saved credentials
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/login [post]
func (h *FenbiHandler) Login(c echo.Context) error {
	result, err := h.fenbiService.Login()
	if err != nil {
		if err == service.ErrCredentialNotFound {
			return fail(c, 400, "请先配置粉笔账号")
		}
		// Handle case where result might be nil or have empty message
		errMsg := "登录失败"
		if result != nil && result.StatusText != "" {
			errMsg = "登录失败: " + result.StatusText
		} else if err.Error() != "" {
			errMsg = "登录失败: " + err.Error()
		}
		return fail(c, 500, errMsg)
	}

	return success(c, result)
}

// CheckLoginStatus checks the current Fenbi login status
// @Summary Check Fenbi Login Status (Admin)
// @Description Check if the current Fenbi session is valid
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/login-status [get]
func (h *FenbiHandler) CheckLoginStatus(c echo.Context) error {
	status, err := h.fenbiService.CheckLoginStatus()
	if err != nil {
		return fail(c, 500, "检查登录状态失败: "+err.Error())
	}

	return success(c, status)
}

// ImportCookies imports cookies directly from browser or HAR file
// @Summary Import Fenbi Cookies (Admin)
// @Description Import cookies directly to enable crawling without login
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body service.ImportCookiesRequest true "Cookie data"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/import-cookies [post]
func (h *FenbiHandler) ImportCookies(c echo.Context) error {
	var req service.ImportCookiesRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.Cookies == "" {
		return fail(c, 400, "Cookie不能为空")
	}

	result, err := h.fenbiService.ImportCookies(&req)
	if err != nil {
		return fail(c, 400, "导入Cookie失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message":      "Cookie导入成功",
		"login_status": result,
	})
}

// GetCategories returns Fenbi filter categories
// @Summary Get Fenbi Categories (Admin)
// @Description Get filter categories (regions, exam types, years)
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param type query string false "Category type: region/exam_type/year"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/categories [get]
func (h *FenbiHandler) GetCategories(c echo.Context) error {
	categoryType := c.QueryParam("type")

	if categoryType != "" {
		categories, err := h.fenbiService.GetCategories(categoryType)
		if err != nil {
			return fail(c, 500, "获取分类失败: "+err.Error())
		}
		return success(c, map[string]interface{}{
			"categories": categories,
		})
	}

	// Return all categories grouped by type
	allCategories, err := h.fenbiService.GetAllCategories()
	if err != nil {
		return fail(c, 500, "获取分类失败: "+err.Error())
	}

	return success(c, allCategories)
}

// TriggerCrawl triggers a Fenbi crawl task
// @Summary Trigger Fenbi Crawl (Admin)
// @Description Start a Fenbi announcement crawl task
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body service.TriggerCrawlRequest true "Crawl parameters"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/crawl [post]
func (h *FenbiHandler) TriggerCrawl(c echo.Context) error {
	var req service.TriggerCrawlRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	progress, err := h.fenbiService.TriggerCrawl(&req)
	if err != nil {
		if err == service.ErrCredentialNotFound {
			return fail(c, 400, "请先配置粉笔账号")
		}
		if err == service.ErrNotLoggedIn {
			return fail(c, 401, "请先登录粉笔账号")
		}
		return fail(c, 500, "爬取失败: "+err.Error())
	}

	return success(c, progress)
}

// StopCrawl stops the running Fenbi crawl task
// @Summary Stop Fenbi Crawl (Admin)
// @Description Stop the currently running Fenbi crawl task
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/crawl/stop [post]
func (h *FenbiHandler) StopCrawl(c echo.Context) error {
	err := h.fenbiService.StopCrawl()
	if err != nil {
		return fail(c, 400, err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "爬取已停止",
	})
}

// GetCrawlStatus returns current crawl running state and progress
// @Summary Get Fenbi Crawl Status (Admin)
// @Description Get current crawl running state and latest progress snapshot
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/crawl/status [get]
func (h *FenbiHandler) GetCrawlStatus(c echo.Context) error {
	running, progress, updatedAt := h.fenbiService.GetCrawlStatus()
	resp := map[string]interface{}{
		"running":  running,
		"progress": progress,
	}
	if updatedAt != nil {
		resp["updated_at"] = updatedAt
	}
	return success(c, resp)
}

// ListAnnouncements returns Fenbi announcements
// @Summary List Fenbi Announcements (Admin)
// @Description Get paginated list of Fenbi announcements
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param region query string false "Region code filter"
// @Param exam_type query string false "Exam type code filter"
// @Param year query int false "Year filter"
// @Param crawl_status query int false "Crawl status filter"
// @Param keyword query string false "Search keyword"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/announcements [get]
func (h *FenbiHandler) ListAnnouncements(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	year, _ := strconv.Atoi(c.QueryParam("year"))

	var crawlStatus *int
	if crawlStatusStr := c.QueryParam("crawl_status"); crawlStatusStr != "" {
		status, _ := strconv.Atoi(crawlStatusStr)
		crawlStatus = &status
	}

	req := &service.ListAnnouncementsRequest{
		RegionCode:   c.QueryParam("region"),
		ExamTypeCode: c.QueryParam("exam_type"),
		Year:         year,
		CrawlStatus:  crawlStatus,
		Keyword:      c.QueryParam("keyword"),
		Page:         page,
		PageSize:     pageSize,
	}

	result, err := h.fenbiService.ListAnnouncements(req)
	if err != nil {
		return fail(c, 500, "获取公告列表失败: "+err.Error())
	}

	return success(c, result)
}

// GetAnnouncementStats returns Fenbi announcement statistics
// @Summary Get Fenbi Announcement Stats (Admin)
// @Description Get statistics of Fenbi announcements
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/stats [get]
func (h *FenbiHandler) GetAnnouncementStats(c echo.Context) error {
	stats, err := h.fenbiService.GetAnnouncementStats()
	if err != nil {
		return fail(c, 500, "获取统计数据失败: "+err.Error())
	}

	return success(c, stats)
}

// CrawlAnnouncementDetail crawls a single announcement detail
// @Summary Crawl Fenbi Announcement Detail (Admin)
// @Description Crawl detail page to get original URL for a single announcement
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Announcement ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/announcements/{id}/crawl-detail [post]
func (h *FenbiHandler) CrawlAnnouncementDetail(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid announcement ID")
	}

	announcement, err := h.fenbiService.CrawlAnnouncementDetail(uint(id))
	if err != nil {
		if err == service.ErrFenbiAnnouncementNotFound {
			return fail(c, 404, "公告不存在")
		}
		if err == service.ErrCredentialNotFound {
			return fail(c, 400, "请先配置粉笔账号")
		}
		if err == service.ErrNotLoggedIn {
			return fail(c, 401, "请先登录粉笔账号")
		}
		return fail(c, 500, "爬取详情失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message":      "详情爬取成功",
		"announcement": announcement,
	})
}

// BatchCrawlDetails crawls multiple announcement details
// @Summary Batch Crawl Fenbi Announcement Details (Admin)
// @Description Batch crawl detail pages to get original URLs
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param limit query int false "Limit" default(50)
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/crawl-details [post]
func (h *FenbiHandler) BatchCrawlDetails(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 || limit > 100 {
		limit = 50
	}

	crawled, err := h.fenbiService.BatchCrawlDetails(limit)
	if err != nil {
		if err == service.ErrCredentialNotFound {
			return fail(c, 400, "请先配置粉笔账号")
		}
		if err == service.ErrNotLoggedIn {
			return fail(c, 401, "请先登录粉笔账号")
		}
		return fail(c, 500, "批量爬取详情失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "批量爬取完成",
		"crawled": crawled,
	})
}

// TestCrawl tests the cookie-based crawling functionality
// @Summary Test Fenbi Cookie Crawl (Admin)
// @Description Test if the current cookie can successfully crawl announcement data
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/test-crawl [post]
func (h *FenbiHandler) TestCrawl(c echo.Context) error {
	result, err := h.fenbiService.TestCrawl()
	if err != nil {
		// Even if there's an error, return the result if available
		if result != nil {
			return success(c, result)
		}
		if err == service.ErrCredentialNotFound {
			return fail(c, 400, "请先配置粉笔账号")
		}
		if err == service.ErrNotLoggedIn {
			return fail(c, 401, "请先登录粉笔账号")
		}
		return fail(c, 500, "测试爬取失败: "+err.Error())
	}

	return success(c, result)
}

// ParseURLRequest is the request body for parsing a URL
type ParseURLRequest struct {
	URL         string `json:"url"`
	LLMConfigID uint   `json:"llm_config_id"` // Optional: 0 means use default config
}

// ParseURL parses a specific Fenbi URL and returns detailed results
// @Summary Parse Fenbi URL (Admin)
// @Description Parse a specific Fenbi URL and return detailed analysis
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body ParseURLRequest true "URL to parse"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/parse-url [post]
func (h *FenbiHandler) ParseURL(c echo.Context) error {
	var req ParseURLRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.URL == "" {
		return fail(c, 400, "URL不能为空")
	}

	result, err := h.fenbiService.ParseURL(req.URL, req.LLMConfigID)
	if err != nil {
		if err == service.ErrCredentialNotFound {
			return fail(c, 400, "请先配置粉笔账号")
		}
		if err == service.ErrNotLoggedIn {
			return fail(c, 401, "请先登录粉笔账号")
		}
		return fail(c, 500, "解析URL失败: "+err.Error())
	}

	return success(c, result)
}

// === Parse Task APIs ===

// CreateParseTasks creates multiple parse tasks
// @Summary Create Parse Tasks (Admin)
// @Description Create multiple parse tasks for batch processing
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body service.CreateParseTaskRequest true "Tasks to create"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/parse-tasks [post]
func (h *FenbiHandler) CreateParseTasks(c echo.Context) error {
	var req service.CreateParseTaskRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if len(req.Tasks) == 0 {
		return fail(c, 400, "没有要创建的任务")
	}

	tasks, err := h.fenbiService.CreateParseTasks(&req)
	if err != nil {
		return fail(c, 500, "创建任务失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "任务创建成功",
		"tasks":   tasks,
		"count":   len(tasks),
	})
}

// ListParseTasks returns a list of parse tasks
// @Summary List Parse Tasks (Admin)
// @Description Get a list of parse tasks with optional filters
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param status query string false "Filter by status"
// @Param keyword query string false "Filter by keyword"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/parse-tasks [get]
func (h *FenbiHandler) ListParseTasks(c echo.Context) error {
	status := c.QueryParam("status")
	keyword := c.QueryParam("keyword")
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 {
		pageSize = 200
	}

	req := &service.ListParseTasksRequest{
		Status:   status,
		Keyword:  keyword,
		Page:     page,
		PageSize: pageSize,
	}

	tasks, total, err := h.fenbiService.ListParseTasks(req)
	if err != nil {
		return fail(c, 500, "获取任务列表失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"tasks":     tasks,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetParseTask returns a single parse task
// @Summary Get Parse Task (Admin)
// @Description Get a single parse task by ID
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Task ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/parse-tasks/{id} [get]
func (h *FenbiHandler) GetParseTask(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的任务ID")
	}

	task, err := h.fenbiService.GetParseTask(uint(id))
	if err != nil {
		return fail(c, 404, "任务不存在")
	}

	return success(c, task)
}

// UpdateParseTask updates a parse task
// @Summary Update Parse Task (Admin)
// @Description Update a parse task's status and data
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Task ID"
// @Param request body service.UpdateParseTaskRequest true "Update data"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/parse-tasks/{id} [put]
func (h *FenbiHandler) UpdateParseTask(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的任务ID")
	}

	var req service.UpdateParseTaskRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	task, err := h.fenbiService.UpdateParseTask(uint(id), &req)
	if err != nil {
		return fail(c, 500, "更新任务失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "任务更新成功",
		"task":    task,
	})
}

// DeleteParseTask deletes a parse task
// @Summary Delete Parse Task (Admin)
// @Description Delete a single parse task by ID
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Task ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/parse-tasks/{id} [delete]
func (h *FenbiHandler) DeleteParseTask(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的任务ID")
	}

	err = h.fenbiService.DeleteParseTask(uint(id))
	if err != nil {
		return fail(c, 500, "删除任务失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "任务已删除",
	})
}

// DeleteAllParseTasks deletes all parse tasks
// @Summary Delete All Parse Tasks (Admin)
// @Description Delete all parse tasks
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/parse-tasks [delete]
func (h *FenbiHandler) DeleteAllParseTasks(c echo.Context) error {
	err := h.fenbiService.DeleteAllParseTasks()
	if err != nil {
		return fail(c, 500, "清空任务失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "所有任务已清空",
	})
}

// GetParseTaskStats returns parse task statistics
// @Summary Get Parse Task Stats (Admin)
// @Description Get parse task statistics
// @Tags Admin - Fenbi
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/fenbi/parse-tasks/stats [get]
func (h *FenbiHandler) GetParseTaskStats(c echo.Context) error {
	stats, err := h.fenbiService.GetParseTaskStats()
	if err != nil {
		return fail(c, 500, "获取统计失败: "+err.Error())
	}

	return success(c, stats)
}

// RegisterRoutes registers all Fenbi API routes
func (h *FenbiHandler) RegisterRoutes(g *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	fenbi := g.Group("/fenbi", adminAuthMiddleware)

	// Credential management
	fenbi.GET("/credentials", h.GetCredential)
	fenbi.POST("/credentials", h.SaveCredential)

	// Login management
	fenbi.POST("/login", h.Login)
	fenbi.GET("/login-status", h.CheckLoginStatus)
	fenbi.POST("/import-cookies", h.ImportCookies)

	// Categories
	fenbi.GET("/categories", h.GetCategories)

	// Crawler operations
	fenbi.POST("/crawl", h.TriggerCrawl)
	fenbi.GET("/crawl/status", h.GetCrawlStatus)
	fenbi.POST("/crawl/stop", h.StopCrawl)
	fenbi.POST("/crawl-details", h.BatchCrawlDetails)
	fenbi.POST("/test-crawl", h.TestCrawl)
	fenbi.POST("/parse-url", h.ParseURL)

	// Announcements
	fenbi.GET("/announcements", h.ListAnnouncements)
	fenbi.POST("/announcements/:id/crawl-detail", h.CrawlAnnouncementDetail)

	// Stats
	fenbi.GET("/stats", h.GetAnnouncementStats)

	// Parse Tasks
	fenbi.POST("/parse-tasks", h.CreateParseTasks)
	fenbi.GET("/parse-tasks", h.ListParseTasks)
	fenbi.GET("/parse-tasks/stats", h.GetParseTaskStats)
	fenbi.GET("/parse-tasks/:id", h.GetParseTask)
	fenbi.PUT("/parse-tasks/:id", h.UpdateParseTask)
	fenbi.DELETE("/parse-tasks/:id", h.DeleteParseTask)
	fenbi.DELETE("/parse-tasks", h.DeleteAllParseTasks)
}
