package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// =====================================================
// Learning Content Handler
// 学习内容通用 API 处理器
// =====================================================

type LearningContentHandler struct {
	contentService *service.LearningContentService
}

func NewLearningContentHandler(contentService *service.LearningContentService) *LearningContentHandler {
	return &LearningContentHandler{
		contentService: contentService,
	}
}

// =====================================================
// Public APIs
// =====================================================

// GetByType gets learning contents by content type
// @Summary Get Learning Contents by Type
// @Description Get learning contents filtered by content type (tips/formulas/guides/hot_topics/patterns)
// @Tags LearningContent
// @Produce json
// @Param type path string true "Content type (tips/formulas/guides/hot_topics/patterns/methods/strategies/quick_facts)"
// @Param subject query string false "Subject (xingce/shenlun/mianshi/gongji)"
// @Param module query string false "Module (yanyu/shuliang/panduan/ziliao/changshi/liyi/qingjing/renji/zonghefenxi)"
// @Param category_id query int false "Category ID"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/learning-content/{type} [get]
func (h *LearningContentHandler) GetByType(c echo.Context) error {
	contentType := c.Param("type")
	if contentType == "" {
		return fail(c, 400, "Content type is required")
	}

	var params model.LearningContentQueryParams
	if err := c.Bind(&params); err != nil {
		return fail(c, 400, "Invalid query parameters")
	}

	contents, total, err := h.contentService.GetByType(contentType, &params)
	if err != nil {
		if err == service.ErrInvalidContentType {
			return fail(c, 400, err.Error())
		}
		return fail(c, 500, "Failed to get learning contents: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"contents":  contents,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// GetByID gets a single learning content by ID
// @Summary Get Learning Content
// @Description Get a single learning content by ID
// @Tags LearningContent
// @Produce json
// @Param id path int true "Content ID"
// @Success 200 {object} Response
// @Router /api/v1/learning-content/detail/{id} [get]
func (h *LearningContentHandler) GetByID(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid content ID")
	}

	content, err := h.contentService.GetByID(uint(id))
	if err != nil {
		if err == service.ErrLearningContentNotFound {
			return fail(c, 404, err.Error())
		}
		return fail(c, 500, "Failed to get learning content: "+err.Error())
	}

	return success(c, content)
}

// GetAll gets all learning contents with filters
// @Summary Get All Learning Contents
// @Description Get all learning contents with optional filters
// @Tags LearningContent
// @Produce json
// @Param content_type query string false "Content type"
// @Param subject query string false "Subject"
// @Param module query string false "Module"
// @Param category_id query int false "Category ID"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/learning-content [get]
func (h *LearningContentHandler) GetAll(c echo.Context) error {
	var params model.LearningContentQueryParams
	if err := c.Bind(&params); err != nil {
		return fail(c, 400, "Invalid query parameters")
	}

	contents, total, err := h.contentService.GetAll(&params)
	if err != nil {
		return fail(c, 500, "Failed to get learning contents: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"contents":  contents,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// GetBySubjectAndModule gets learning contents by subject and module
// @Summary Get Learning Contents by Subject and Module
// @Description Get learning contents filtered by subject and module
// @Tags LearningContent
// @Produce json
// @Param subject path string true "Subject (xingce/shenlun/mianshi/gongji)"
// @Param module query string false "Module"
// @Success 200 {object} Response
// @Router /api/v1/learning-content/subject/{subject} [get]
func (h *LearningContentHandler) GetBySubjectAndModule(c echo.Context) error {
	subject := c.Param("subject")
	module := c.QueryParam("module")

	contents, err := h.contentService.GetBySubjectAndModule(subject, module)
	if err != nil {
		return fail(c, 500, "Failed to get learning contents: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"contents": contents,
	})
}

// GetFilters gets available filter options
// @Summary Get Available Filters
// @Description Get available filter options (subjects, content types)
// @Tags LearningContent
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/learning-content/filters [get]
func (h *LearningContentHandler) GetFilters(c echo.Context) error {
	filters, err := h.contentService.GetAvailableFilters()
	if err != nil {
		return fail(c, 500, "Failed to get filters: "+err.Error())
	}

	return success(c, filters)
}

// GetModules gets available modules for a subject
// @Summary Get Modules for Subject
// @Description Get available modules for a specific subject
// @Tags LearningContent
// @Produce json
// @Param subject path string true "Subject"
// @Success 200 {object} Response
// @Router /api/v1/learning-content/modules/{subject} [get]
func (h *LearningContentHandler) GetModules(c echo.Context) error {
	subject := c.Param("subject")

	modules, err := h.contentService.GetModulesForSubject(subject)
	if err != nil {
		return fail(c, 500, "Failed to get modules: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"modules": modules,
	})
}

// =====================================================
// Admin APIs
// =====================================================

// AdminCreate creates a new learning content
// @Summary Create Learning Content (Admin)
// @Description Create a new learning content
// @Tags LearningContent
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body CreateLearningContentRequest true "Content data"
// @Success 200 {object} Response
// @Router /api/v1/admin/learning-content [post]
func (h *LearningContentHandler) AdminCreate(c echo.Context) error {
	var req CreateLearningContentRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	content := &model.LearningContent{
		ContentType: model.LearningContentType(req.ContentType),
		Subject:     req.Subject,
		Module:      req.Module,
		CategoryID:  req.CategoryID,
		Title:       req.Title,
		Subtitle:    req.Subtitle,
		Icon:        req.Icon,
		Color:       req.Color,
		ContentJSON: req.ContentJSON,
		ContentText: req.ContentText,
		SortOrder:   req.SortOrder,
		IsActive:    true,
	}

	if err := h.contentService.Create(content); err != nil {
		if err == service.ErrInvalidContentType {
			return fail(c, 400, err.Error())
		}
		return fail(c, 500, "Failed to create learning content: "+err.Error())
	}

	return success(c, content.ToResponse())
}

// AdminUpdate updates a learning content
// @Summary Update Learning Content (Admin)
// @Description Update an existing learning content
// @Tags LearningContent
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Content ID"
// @Param request body CreateLearningContentRequest true "Content data"
// @Success 200 {object} Response
// @Router /api/v1/admin/learning-content/{id} [put]
func (h *LearningContentHandler) AdminUpdate(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid content ID")
	}

	var req CreateLearningContentRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	updates := map[string]interface{}{
		"content_type": req.ContentType,
		"subject":      req.Subject,
		"module":       req.Module,
		"category_id":  req.CategoryID,
		"title":        req.Title,
		"subtitle":     req.Subtitle,
		"icon":         req.Icon,
		"color":        req.Color,
		"content_json": req.ContentJSON,
		"content_text": req.ContentText,
		"sort_order":   req.SortOrder,
	}

	if err := h.contentService.Update(uint(id), updates); err != nil {
		if err == service.ErrLearningContentNotFound {
			return fail(c, 404, err.Error())
		}
		if err == service.ErrInvalidContentType {
			return fail(c, 400, err.Error())
		}
		return fail(c, 500, "Failed to update learning content: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "学习内容更新成功",
	})
}

// AdminDelete deletes a learning content
// @Summary Delete Learning Content (Admin)
// @Description Delete a learning content
// @Tags LearningContent
// @Produce json
// @Security BearerAuth
// @Param id path int true "Content ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/learning-content/{id} [delete]
func (h *LearningContentHandler) AdminDelete(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid content ID")
	}

	if err := h.contentService.Delete(uint(id)); err != nil {
		if err == service.ErrLearningContentNotFound {
			return fail(c, 404, err.Error())
		}
		return fail(c, 500, "Failed to delete learning content: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "学习内容删除成功",
	})
}

// AdminBatchCreate creates multiple learning contents
// @Summary Batch Create Learning Contents (Admin)
// @Description Create multiple learning contents at once
// @Tags LearningContent
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body BatchCreateLearningContentRequest true "Contents data"
// @Success 200 {object} Response
// @Router /api/v1/admin/learning-content/batch [post]
func (h *LearningContentHandler) AdminBatchCreate(c echo.Context) error {
	var req BatchCreateLearningContentRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	contents := make([]model.LearningContent, len(req.Contents))
	for i, r := range req.Contents {
		contents[i] = model.LearningContent{
			ContentType: model.LearningContentType(r.ContentType),
			Subject:     r.Subject,
			Module:      r.Module,
			CategoryID:  r.CategoryID,
			Title:       r.Title,
			Subtitle:    r.Subtitle,
			Icon:        r.Icon,
			Color:       r.Color,
			ContentJSON: r.ContentJSON,
			ContentText: r.ContentText,
			SortOrder:   r.SortOrder,
			IsActive:    true,
		}
	}

	if err := h.contentService.BatchCreate(contents); err != nil {
		if err == service.ErrInvalidContentType {
			return fail(c, 400, err.Error())
		}
		return fail(c, 500, "Failed to batch create learning contents: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "批量创建成功",
		"count":   len(contents),
	})
}

// AdminGetAll gets all learning contents (admin view, including inactive)
// @Summary Get All Learning Contents (Admin)
// @Description Get all learning contents including inactive ones
// @Tags LearningContent
// @Produce json
// @Security BearerAuth
// @Param content_type query string false "Content type"
// @Param subject query string false "Subject"
// @Param module query string false "Module"
// @Param is_active query bool false "Is active filter"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/admin/learning-content [get]
func (h *LearningContentHandler) AdminGetAll(c echo.Context) error {
	var params model.LearningContentQueryParams
	if err := c.Bind(&params); err != nil {
		return fail(c, 400, "Invalid query parameters")
	}

	// For admin, don't filter by is_active by default
	contents, total, err := h.contentService.GetAll(&params)
	if err != nil {
		return fail(c, 500, "Failed to get learning contents: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"contents":  contents,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// =====================================================
// Request Types
// =====================================================

// CreateLearningContentRequest 创建学习内容请求
type CreateLearningContentRequest struct {
	ContentType string             `json:"content_type" validate:"required"`
	Subject     string             `json:"subject"`
	Module      string             `json:"module"`
	CategoryID  *uint              `json:"category_id"`
	Title       string             `json:"title" validate:"required"`
	Subtitle    string             `json:"subtitle"`
	Icon        string             `json:"icon"`
	Color       string             `json:"color"`
	ContentJSON model.JSONRawMessage `json:"content_json"`
	ContentText string             `json:"content_text"`
	SortOrder   int                `json:"sort_order"`
}

// BatchCreateLearningContentRequest 批量创建学习内容请求
type BatchCreateLearningContentRequest struct {
	Contents []CreateLearningContentRequest `json:"contents" validate:"required,min=1"`
}

// =====================================================
// Route Registration
// =====================================================

// RegisterRoutes registers all learning content routes
func (h *LearningContentHandler) RegisterRoutes(e *echo.Echo) {
	content := e.Group("/api/v1/learning-content")

	// Public routes
	content.GET("", h.GetAll)
	content.GET("/filters", h.GetFilters)
	content.GET("/modules/:subject", h.GetModules)
	content.GET("/subject/:subject", h.GetBySubjectAndModule)
	content.GET("/detail/:id", h.GetByID)
	content.GET("/:type", h.GetByType)
}

// RegisterAdminRoutes registers admin learning content routes
func (h *LearningContentHandler) RegisterAdminRoutes(adminGroup *echo.Group) {
	content := adminGroup.Group("/learning-content")

	content.GET("", h.AdminGetAll)
	content.POST("", h.AdminCreate)
	content.POST("/batch", h.AdminBatchCreate)
	content.PUT("/:id", h.AdminUpdate)
	content.DELETE("/:id", h.AdminDelete)
}
