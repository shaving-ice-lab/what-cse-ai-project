package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

// AIContentHandler AI 内容预生成处理器（旧版，兼容 §26.1）
type AIContentHandler struct {
	aiContentGenService *service.AIContentGeneratorService
	aiBatchGenService   *service.AIBatchGeneratorService
}

// NewAIContentHandler 创建 AI 内容处理器
func NewAIContentHandler(
	aiContentGenService *service.AIContentGeneratorService,
	aiBatchGenService *service.AIBatchGeneratorService,
) *AIContentHandler {
	return &AIContentHandler{
		aiContentGenService: aiContentGenService,
		aiBatchGenService:   aiBatchGenService,
	}
}

// RegisterRoutes 注册路由
func (h *AIContentHandler) RegisterRoutes(e *echo.Echo, userAuthMiddleware, adminAuthMiddleware echo.MiddlewareFunc) {
	// 用户端 API
	userGroup := e.Group("/api/v1/ai-content", userAuthMiddleware)
	userGroup.GET("/course/:id", h.GetCourseAIContent)
	userGroup.GET("/question/:id", h.GetQuestionAIContent)
	userGroup.GET("/knowledge/:id", h.GetKnowledgeAIContent)
	userGroup.GET("/:id", h.GetAIContent)

	// 管理端 API
	adminGroup := e.Group("/api/v1/admin/ai-content-gen", adminAuthMiddleware)
	adminGroup.GET("/contents", h.ListContents)
	adminGroup.GET("/contents/:id", h.GetContentDetail)
	adminGroup.POST("/contents/:id/approve", h.ApproveContent)
	adminGroup.POST("/contents/:id/reject", h.RejectContent)
	adminGroup.POST("/batch", h.CreateBatchTask)
	adminGroup.GET("/batch", h.ListBatchTasks)
	adminGroup.GET("/batch/:id", h.GetBatchTask)
	adminGroup.POST("/batch/:id/cancel", h.CancelBatchTask)
}

// GetCourseAIContent 获取课程的AI生成内容
// @Summary 获取课程的AI生成内容
// @Tags AI Content
// @Produce json
// @Param id path int true "课程ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/ai-content/course/{id} [get]
func (h *AIContentHandler) GetCourseAIContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的课程ID",
		})
	}

	contents, err := h.aiContentGenService.GetAllContentsByRelated(model.AIRelatedTypeCourse, uint(id))
	if err != nil || len(contents) == 0 {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    404,
			"message": "未找到AI生成内容",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data":    contents,
	})
}

// GetQuestionAIContent 获取题目的AI生成内容
// @Summary 获取题目的AI生成内容
// @Tags AI Content
// @Produce json
// @Param id path int true "题目ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/ai-content/question/{id} [get]
func (h *AIContentHandler) GetQuestionAIContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的题目ID",
		})
	}

	contents, err := h.aiContentGenService.GetAllContentsByRelated(model.AIRelatedTypeQuestion, uint(id))
	if err != nil || len(contents) == 0 {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    404,
			"message": "未找到AI生成内容",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data":    contents,
	})
}

// GetKnowledgeAIContent 获取知识点的AI生成内容
// @Summary 获取知识点的AI生成内容
// @Tags AI Content
// @Produce json
// @Param id path int true "知识点ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/ai-content/knowledge/{id} [get]
func (h *AIContentHandler) GetKnowledgeAIContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的知识点ID",
		})
	}

	contents, err := h.aiContentGenService.GetAllContentsByRelated(model.AIRelatedTypeKnowledgePoint, uint(id))
	if err != nil || len(contents) == 0 {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    404,
			"message": "未找到AI生成内容",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data":    contents,
	})
}

// GetAIContent 获取单个AI内容
// @Summary 获取单个AI内容
// @Tags AI Content
// @Produce json
// @Param id path int true "内容ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/ai-content/{id} [get]
func (h *AIContentHandler) GetAIContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的内容ID",
		})
	}

	content, err := h.aiContentGenService.GetAIContent(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    404,
			"message": "未找到AI生成内容",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data":    content.ToResponse(),
	})
}

// ListContents 获取AI内容列表
// @Summary 获取AI内容列表
// @Tags AI Content Admin
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Param content_type query string false "内容类型"
// @Param status query string false "状态"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content-gen/contents [get]
func (h *AIContentHandler) ListContents(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	contentType := c.QueryParam("content_type")
	status := c.QueryParam("status")

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	params := repository.AIContentListParams{
		Page:     page,
		PageSize: pageSize,
	}
	if contentType != "" {
		params.ContentType = model.AIContentType(contentType)
	}
	if status != "" {
		params.Status = model.AIContentStatus(status)
	}

	contents, total, err := h.aiContentGenService.ListContents(params)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "获取列表失败: " + err.Error(),
		})
	}

	var responses []model.AIGeneratedContentResponse
	for _, content := range contents {
		responses = append(responses, content.ToResponse())
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"contents":  responses,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// GetContentDetail 获取AI内容详情
// @Summary 获取AI内容详情
// @Tags AI Content Admin
// @Produce json
// @Param id path int true "内容ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content-gen/contents/{id} [get]
func (h *AIContentHandler) GetContentDetail(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的内容ID",
		})
	}

	content, err := h.aiContentGenService.GetAIContent(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    404,
			"message": "内容不存在",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data":    content.ToResponse(),
	})
}

// ApproveContent 审核通过内容
// @Summary 审核通过内容
// @Tags AI Content Admin
// @Produce json
// @Param id path int true "内容ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content-gen/contents/{id}/approve [post]
func (h *AIContentHandler) ApproveContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的内容ID",
		})
	}

	adminID := uint(0)
	if aid, ok := c.Get("admin_id").(uint); ok {
		adminID = aid
	}

	if err := h.aiContentGenService.ApproveContent(uint(id), adminID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "审核失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "审核通过",
	})
}

// RejectContent 拒绝内容
// @Summary 拒绝内容
// @Tags AI Content Admin
// @Produce json
// @Param id path int true "内容ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content-gen/contents/{id}/reject [post]
func (h *AIContentHandler) RejectContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的内容ID",
		})
	}

	adminID := uint(0)
	if aid, ok := c.Get("admin_id").(uint); ok {
		adminID = aid
	}

	if err := h.aiContentGenService.RejectContent(uint(id), adminID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "拒绝失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "已拒绝",
	})
}

// CreateBatchTaskRequest 创建批量任务请求
type CreateBatchTaskRequest struct {
	Name        string `json:"name" validate:"required"`
	ContentType string `json:"content_type" validate:"required"` // question_analysis/knowledge_summary/chapter_lesson
	TargetIDs   []uint `json:"target_ids" validate:"required"`
	Subject     string `json:"subject,omitempty"`
	AutoApprove bool   `json:"auto_approve,omitempty"`
}

// CreateBatchTask 创建批量生成任务
// @Summary 创建批量生成任务
// @Tags AI Content Admin
// @Accept json
// @Produce json
// @Param body body CreateBatchTaskRequest true "请求参数"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content-gen/batch [post]
func (h *AIContentHandler) CreateBatchTask(c echo.Context) error {
	var req CreateBatchTaskRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
	}

	adminID := uint(0)
	if aid, ok := c.Get("admin_id").(uint); ok {
		adminID = aid
	}

	var task *model.AIBatchTask
	var err error

	switch req.ContentType {
	case "question_analysis":
		task, err = h.aiBatchGenService.CreateQuestionAnalysisBatchTask(req.Name, req.TargetIDs, adminID)
	case "knowledge_summary":
		task, err = h.aiBatchGenService.CreateKnowledgeSummaryBatchTask(req.Name, req.TargetIDs, adminID)
	case "chapter_lesson":
		task, err = h.aiBatchGenService.CreateChapterLessonBatchTask(req.Name, req.TargetIDs, req.Subject, adminID, req.AutoApprove)
	default:
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "不支持的内容类型: " + req.ContentType,
		})
	}

	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建任务失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "任务已创建",
		"data":    task,
	})
}

// ListBatchTasks 获取批量任务列表
// @Summary 获取批量任务列表
// @Tags AI Content Admin
// @Produce json
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Param status query string false "状态"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content-gen/batch [get]
func (h *AIContentHandler) ListBatchTasks(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	status := c.QueryParam("status")

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	params := repository.AIBatchTaskListParams{
		Page:     page,
		PageSize: pageSize,
	}
	if status != "" {
		params.Status = model.AIBatchTaskStatus(status)
	}

	tasks, total, err := h.aiBatchGenService.ListBatchTasks(params)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "获取列表失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"tasks":     tasks,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// GetBatchTask 获取批量任务详情
// @Summary 获取批量任务详情
// @Tags AI Content Admin
// @Produce json
// @Param id path int true "任务ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content-gen/batch/{id} [get]
func (h *AIContentHandler) GetBatchTask(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的任务ID",
		})
	}

	task, err := h.aiBatchGenService.GetBatchTask(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    404,
			"message": "任务不存在",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data":    task,
	})
}

// CancelBatchTask 取消批量任务
// @Summary 取消批量任务
// @Tags AI Content Admin
// @Produce json
// @Param id path int true "任务ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content-gen/batch/{id}/cancel [post]
func (h *AIContentHandler) CancelBatchTask(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的任务ID",
		})
	}

	if err := h.aiBatchGenService.CancelBatchTask(uint(id)); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "任务已取消",
	})
}
