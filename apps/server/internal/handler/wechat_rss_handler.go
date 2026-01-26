package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// WechatRSSHandler handles WeChat article subscription API requests
type WechatRSSHandler struct {
	wechatRSSService *service.WechatRSSService
}

// NewWechatRSSHandler creates a new WeChat RSS handler
func NewWechatRSSHandler(wechatRSSService *service.WechatRSSService) *WechatRSSHandler {
	return &WechatRSSHandler{wechatRSSService: wechatRSSService}
}

// ListSources returns all sources
// @Summary List Sources (Admin)
// @Description Get all WeChat subscription sources
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param status query string false "Filter by status: active/paused/error"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/sources [get]
func (h *WechatRSSHandler) ListSources(c echo.Context) error {
	var status *model.WechatRSSSourceStatus
	if statusStr := c.QueryParam("status"); statusStr != "" {
		s := model.WechatRSSSourceStatus(statusStr)
		status = &s
	}

	sources, err := h.wechatRSSService.ListSources(status)
	if err != nil {
		return fail(c, 500, "获取订阅源列表失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"sources": sources,
		"total":   len(sources),
	})
}

// GetSource returns a single source
// @Summary Get Source (Admin)
// @Description Get a specific source by ID
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Source ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/sources/{id} [get]
func (h *WechatRSSHandler) GetSource(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的源ID")
	}

	source, err := h.wechatRSSService.GetSource(uint(id))
	if err != nil {
		if err == service.ErrWechatRSSSourceNotFound {
			return fail(c, 404, "订阅源不存在")
		}
		return fail(c, 500, "获取订阅源失败: "+err.Error())
	}

	return success(c, source)
}

// UpdateSource updates a source
// @Summary Update Source (Admin)
// @Description Update an existing source
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Source ID"
// @Param request body model.UpdateWechatRSSSourceRequest true "Source data"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/sources/{id} [put]
func (h *WechatRSSHandler) UpdateSource(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的源ID")
	}

	var req model.UpdateWechatRSSSourceRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "无效的请求参数")
	}

	source, err := h.wechatRSSService.UpdateSource(uint(id), &req)
	if err != nil {
		if err == service.ErrWechatRSSSourceNotFound {
			return fail(c, 404, "订阅源不存在")
		}
		return fail(c, 500, "更新订阅源失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "订阅源更新成功",
		"source":  source,
	})
}

// DeleteSource deletes a source
// @Summary Delete Source (Admin)
// @Description Delete a source and all its articles
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Source ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/sources/{id} [delete]
func (h *WechatRSSHandler) DeleteSource(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的源ID")
	}

	if err := h.wechatRSSService.DeleteSource(uint(id)); err != nil {
		return fail(c, 500, "删除订阅源失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "订阅源已删除",
	})
}

// CrawlSource triggers a crawl for a specific source
// @Summary Crawl Source (Admin)
// @Description Manually trigger a crawl for a specific source
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Source ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/sources/{id}/crawl [post]
func (h *WechatRSSHandler) CrawlSource(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的源ID")
	}

	result, err := h.wechatRSSService.CrawlSource(uint(id))
	if err != nil {
		if err == service.ErrWechatRSSSourceNotFound {
			return fail(c, 404, "订阅源不存在")
		}
		if err == service.ErrWechatMPAuthRequired {
			return fail(c, 401, "需要先进行微信公众平台授权")
		}
		return fail(c, 500, "抓取失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "抓取完成",
		"result":  result,
	})
}

// ListArticles returns articles with filtering and pagination
// @Summary List Articles (Admin)
// @Description Get articles with filtering and pagination
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param source_id query int false "Filter by source ID"
// @Param read_status query string false "Filter by read status: unread/read/starred"
// @Param keyword query string false "Search keyword"
// @Param page query int false "Page number (default: 1)"
// @Param page_size query int false "Page size (default: 20)"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/articles [get]
func (h *WechatRSSHandler) ListArticles(c echo.Context) error {
	params := &model.WechatRSSArticleListParams{
		Page:     1,
		PageSize: 20,
	}

	if sourceID := c.QueryParam("source_id"); sourceID != "" {
		if id, err := strconv.ParseUint(sourceID, 10, 32); err == nil {
			params.SourceID = uint(id)
		}
	}

	if readStatus := c.QueryParam("read_status"); readStatus != "" {
		status := model.WechatRSSReadStatus(readStatus)
		params.ReadStatus = &status
	}

	if keyword := c.QueryParam("keyword"); keyword != "" {
		params.Keyword = keyword
	}

	if page := c.QueryParam("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			params.Page = p
		}
	}

	if pageSize := c.QueryParam("page_size"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil && ps > 0 {
			params.PageSize = ps
		}
	}

	articles, total, err := h.wechatRSSService.ListArticles(params)
	if err != nil {
		return fail(c, 500, "获取文章列表失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"articles":  articles,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// GetArticle returns a single article
// @Summary Get Article (Admin)
// @Description Get a specific article by ID
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Article ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/articles/{id} [get]
func (h *WechatRSSHandler) GetArticle(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的文章ID")
	}

	article, err := h.wechatRSSService.GetArticle(uint(id))
	if err != nil {
		if err == service.ErrWechatRSSArticleNotFound {
			return fail(c, 404, "文章不存在")
		}
		return fail(c, 500, "获取文章失败: "+err.Error())
	}

	return success(c, article)
}

// MarkArticleRead marks an article as read
// @Summary Mark Article as Read (Admin)
// @Description Mark a specific article as read
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Article ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/articles/{id}/read [put]
func (h *WechatRSSHandler) MarkArticleRead(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的文章ID")
	}

	if err := h.wechatRSSService.MarkArticleRead(uint(id)); err != nil {
		if err == service.ErrWechatRSSArticleNotFound {
			return fail(c, 404, "文章不存在")
		}
		return fail(c, 500, "标记已读失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "已标记为已读",
	})
}

// ToggleArticleStar toggles the starred status of an article
// @Summary Toggle Article Star (Admin)
// @Description Toggle the starred status of an article
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Article ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/articles/{id}/star [put]
func (h *WechatRSSHandler) ToggleArticleStar(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "无效的文章ID")
	}

	article, err := h.wechatRSSService.ToggleArticleStar(uint(id))
	if err != nil {
		if err == service.ErrWechatRSSArticleNotFound {
			return fail(c, 404, "文章不存在")
		}
		return fail(c, 500, "操作失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "操作成功",
		"article": article,
	})
}

// MarkAllAsRead marks all articles as read
// @Summary Mark All Articles as Read (Admin)
// @Description Mark all articles as read, optionally for a specific source
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param source_id query int false "Source ID (optional)"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/articles/read-all [put]
func (h *WechatRSSHandler) MarkAllAsRead(c echo.Context) error {
	var sourceID uint
	if sourceIDStr := c.QueryParam("source_id"); sourceIDStr != "" {
		if id, err := strconv.ParseUint(sourceIDStr, 10, 32); err == nil {
			sourceID = uint(id)
		}
	}

	if err := h.wechatRSSService.MarkAllAsRead(sourceID); err != nil {
		return fail(c, 500, "操作失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "已全部标记为已读",
	})
}

// BatchMarkAsRead marks multiple articles as read
// @Summary Batch Mark Articles as Read (Admin)
// @Description Mark multiple articles as read
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body BatchReadRequest true "Article IDs"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/articles/batch-read [put]
func (h *WechatRSSHandler) BatchMarkAsRead(c echo.Context) error {
	var req BatchReadRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "无效的请求参数")
	}

	if len(req.IDs) == 0 {
		return fail(c, 400, "文章ID列表不能为空")
	}

	if err := h.wechatRSSService.BatchMarkAsRead(req.IDs); err != nil {
		return fail(c, 500, "操作失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "已批量标记为已读",
		"count":   len(req.IDs),
	})
}

// BatchReadRequest represents the request for batch read operations
type BatchReadRequest struct {
	IDs []uint `json:"ids"`
}

// GetStats returns statistics
// @Summary Get Stats (Admin)
// @Description Get statistics for WeChat subscriptions
// @Tags Admin - WeChat Subscription
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/stats [get]
func (h *WechatRSSHandler) GetStats(c echo.Context) error {
	stats, err := h.wechatRSSService.GetStats()
	if err != nil {
		return fail(c, 500, "获取统计信息失败: "+err.Error())
	}

	return success(c, stats)
}

// RegisterRoutes registers all WeChat subscription API routes
func (h *WechatRSSHandler) RegisterRoutes(g *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	// Admin routes (protected)
	wechatRSS := g.Group("/wechat-rss", adminAuthMiddleware)

	// Source management (no create - use wechat-mp/create-source instead)
	wechatRSS.GET("/sources", h.ListSources)
	wechatRSS.GET("/sources/:id", h.GetSource)
	wechatRSS.PUT("/sources/:id", h.UpdateSource)
	wechatRSS.DELETE("/sources/:id", h.DeleteSource)
	wechatRSS.POST("/sources/:id/crawl", h.CrawlSource)

	// Article management
	wechatRSS.GET("/articles", h.ListArticles)
	wechatRSS.GET("/articles/:id", h.GetArticle)
	wechatRSS.PUT("/articles/:id/read", h.MarkArticleRead)
	wechatRSS.PUT("/articles/:id/star", h.ToggleArticleStar)
	wechatRSS.PUT("/articles/read-all", h.MarkAllAsRead)
	wechatRSS.PUT("/articles/batch-read", h.BatchMarkAsRead)

	// Stats
	wechatRSS.GET("/stats", h.GetStats)
}
