package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// WechatRSSHandler handles WeChat RSS API requests
type WechatRSSHandler struct {
	wechatRSSService *service.WechatRSSService
}

// NewWechatRSSHandler creates a new WeChat RSS handler
func NewWechatRSSHandler(wechatRSSService *service.WechatRSSService) *WechatRSSHandler {
	return &WechatRSSHandler{wechatRSSService: wechatRSSService}
}

// ListSources returns all RSS sources
// @Summary List RSS Sources (Admin)
// @Description Get all WeChat RSS sources
// @Tags Admin - WeChat RSS
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
		return fail(c, 500, "获取RSS源列表失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"sources": sources,
		"total":   len(sources),
	})
}

// GetSource returns a single RSS source
// @Summary Get RSS Source (Admin)
// @Description Get a specific RSS source by ID
// @Tags Admin - WeChat RSS
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
			return fail(c, 404, "RSS源不存在")
		}
		return fail(c, 500, "获取RSS源失败: "+err.Error())
	}

	return success(c, source)
}

// CreateSource creates a new RSS source
// @Summary Create RSS Source (Admin)
// @Description Create a new WeChat RSS source
// @Tags Admin - WeChat RSS
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body model.CreateWechatRSSSourceRequest true "Source data"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/sources [post]
func (h *WechatRSSHandler) CreateSource(c echo.Context) error {
	var req model.CreateWechatRSSSourceRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "无效的请求参数")
	}

	if req.RSSURL == "" {
		return fail(c, 400, "RSS地址不能为空")
	}

	source, err := h.wechatRSSService.CreateSource(&req)
	if err != nil {
		if err == service.ErrWechatRSSSourceExists {
			return fail(c, 400, "该RSS源已存在")
		}
		return fail(c, 500, "创建RSS源失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "RSS源创建成功",
		"source":  source,
	})
}

// UpdateSource updates an RSS source
// @Summary Update RSS Source (Admin)
// @Description Update an existing RSS source
// @Tags Admin - WeChat RSS
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
			return fail(c, 404, "RSS源不存在")
		}
		return fail(c, 500, "更新RSS源失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "RSS源更新成功",
		"source":  source,
	})
}

// DeleteSource deletes an RSS source
// @Summary Delete RSS Source (Admin)
// @Description Delete an RSS source and all its articles
// @Tags Admin - WeChat RSS
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
		return fail(c, 500, "删除RSS源失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "RSS源已删除",
	})
}

// CrawlSource triggers a crawl for a specific source
// @Summary Crawl RSS Source (Admin)
// @Description Manually trigger a crawl for a specific source
// @Tags Admin - WeChat RSS
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
			return fail(c, 404, "RSS源不存在")
		}
		return fail(c, 500, "抓取失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "抓取完成",
		"result":  result,
	})
}

// ListArticles returns articles with filtering and pagination
// @Summary List RSS Articles (Admin)
// @Description Get RSS articles with filtering and pagination
// @Tags Admin - WeChat RSS
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
// @Summary Get RSS Article (Admin)
// @Description Get a specific RSS article by ID
// @Tags Admin - WeChat RSS
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
// @Tags Admin - WeChat RSS
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
// @Tags Admin - WeChat RSS
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
// @Tags Admin - WeChat RSS
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
// @Tags Admin - WeChat RSS
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

// GetStats returns statistics for WeChat RSS
// @Summary Get RSS Stats (Admin)
// @Description Get statistics for WeChat RSS
// @Tags Admin - WeChat RSS
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

// ValidateRSSURL validates if a URL is a valid RSS feed
// @Summary Validate RSS URL (Admin)
// @Description Validate if a URL is a valid RSS feed
// @Tags Admin - WeChat RSS
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param url query string true "RSS URL to validate"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/validate [get]
func (h *WechatRSSHandler) ValidateRSSURL(c echo.Context) error {
	url := c.QueryParam("url")
	if url == "" {
		return fail(c, 400, "URL不能为空")
	}

	feed, err := h.wechatRSSService.ValidateRSSURL(url)
	if err != nil {
		return fail(c, 400, "无效的RSS地址: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"valid":       true,
		"title":       feed.Title,
		"description": feed.Description,
		"item_count":  len(feed.Items),
	})
}

// ParseArticleURL parses a WeChat article URL and extracts RSS info
// @Summary Parse WeChat Article URL (Admin)
// @Description Parse a WeChat article URL to extract public account info and generate RSS URLs
// @Tags Admin - WeChat RSS
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param url query string true "WeChat article URL"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/parse-article [get]
func (h *WechatRSSHandler) ParseArticleURL(c echo.Context) error {
	articleURL := c.QueryParam("url")
	if articleURL == "" {
		return fail(c, 400, "文章链接不能为空")
	}

	info, err := h.wechatRSSService.ParseWechatArticleURL(articleURL)
	if err != nil {
		return fail(c, 400, "解析文章链接失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"biz":         info.Biz,
		"title":       info.Title,
		"author":      info.Author,
		"article_url": info.ArticleURL,
		"rss_urls":    info.RSSURLs,
	})
}

// CreateSourceFromArticle creates a new RSS source from a WeChat article URL
// @Summary Create Source from Article URL (Admin)
// @Description Automatically create an RSS source by parsing a WeChat article URL
// @Tags Admin - WeChat RSS
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param request body CreateFromArticleRequest true "Article URL"
// @Success 200 {object} Response
// @Router /api/v1/admin/wechat-rss/create-from-article [post]
func (h *WechatRSSHandler) CreateSourceFromArticle(c echo.Context) error {
	var req CreateFromArticleRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "无效的请求参数")
	}

	if req.ArticleURL == "" {
		return fail(c, 400, "文章链接不能为空")
	}

	source, err := h.wechatRSSService.CreateSourceFromArticleURL(req.ArticleURL)
	if err != nil {
		if err == service.ErrWechatRSSSourceExists {
			return fail(c, 400, "该公众号已订阅")
		}
		return fail(c, 500, "创建订阅失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "订阅创建成功",
		"source":  source,
	})
}

// CreateFromArticleRequest represents the request to create source from article
type CreateFromArticleRequest struct {
	ArticleURL string `json:"article_url"`
}

// GetRSSFeed returns an RSS feed for a source (public endpoint)
// @Summary Get RSS Feed
// @Description Get RSS feed XML for a specific source
// @Tags WeChat RSS
// @Produce xml
// @Param id path int true "Source ID"
// @Param limit query int false "Number of items (default: 50)"
// @Success 200 {string} string "RSS XML"
// @Router /rss/wechat/{id} [get]
func (h *WechatRSSHandler) GetRSSFeed(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.String(http.StatusBadRequest, "Invalid source ID")
	}

	limit := 50
	if limitStr := c.QueryParam("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 && l <= 100 {
			limit = l
		}
	}

	rssXML, err := h.wechatRSSService.GenerateRSSFeed(uint(id), limit)
	if err != nil {
		if err == service.ErrWechatRSSSourceNotFound {
			return c.String(http.StatusNotFound, "Source not found")
		}
		return c.String(http.StatusInternalServerError, "Failed to generate RSS feed")
	}

	return c.Blob(http.StatusOK, "application/rss+xml; charset=utf-8", []byte(rssXML))
}

// RegisterRoutes registers all WeChat RSS API routes
func (h *WechatRSSHandler) RegisterRoutes(g *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	// Admin routes (protected)
	wechatRSS := g.Group("/wechat-rss", adminAuthMiddleware)

	// Source management
	wechatRSS.GET("/sources", h.ListSources)
	wechatRSS.GET("/sources/:id", h.GetSource)
	wechatRSS.POST("/sources", h.CreateSource)
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

	// Stats and validation
	wechatRSS.GET("/stats", h.GetStats)
	wechatRSS.GET("/validate", h.ValidateRSSURL)

	// Parse article URL and auto-create
	wechatRSS.GET("/parse-article", h.ParseArticleURL)
	wechatRSS.POST("/create-from-article", h.CreateSourceFromArticle)
}

// RegisterPublicRoutes registers public RSS feed routes
func (h *WechatRSSHandler) RegisterPublicRoutes(e *echo.Echo) {
	e.GET("/rss/wechat/:id", h.GetRSSFeed)
}
