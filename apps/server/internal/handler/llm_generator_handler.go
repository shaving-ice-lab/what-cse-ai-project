package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"go.uber.org/zap"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// LLMGeneratorHandler LLM 生成器处理器
type LLMGeneratorHandler struct {
	generatorService *service.LLMGeneratorService
	logger           *zap.Logger
}

// NewLLMGeneratorHandler 创建 LLM 生成器处理器
func NewLLMGeneratorHandler(generatorService *service.LLMGeneratorService, logger *zap.Logger) *LLMGeneratorHandler {
	return &LLMGeneratorHandler{
		generatorService: generatorService,
		logger:           logger,
	}
}

// RegisterRoutes 注册路由
func (h *LLMGeneratorHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	// Admin 生成器路由（需要管理员认证）
	admin := e.Group("/api/v1/admin/generator", authMiddleware)

	// 分类描述生成
	admin.POST("/categories/:id/description", h.GenerateCategoryDescription)

	// 课程内容生成
	admin.POST("/courses/:id/content", h.GenerateCourseContent)

	// 题目批次生成
	admin.POST("/questions/batch", h.GenerateQuestionBatch)

	// 素材批次生成
	admin.POST("/materials/batch", h.GenerateMaterialBatch)

	// 任务管理
	admin.GET("/tasks", h.ListTasks)
	admin.GET("/tasks/:id", h.GetTask)
	admin.DELETE("/tasks/:id", h.CancelTask)
}

// =====================================================
// 分类描述生成
// =====================================================

// GenerateCategoryDescriptionRequest 生成分类描述请求
type GenerateCategoryDescriptionRequest struct {
	Force bool `json:"force"` // 是否强制重新生成
}

// GenerateCategoryDescription 生成分类描述
// @Summary 为分类生成 AI 描述
// @Tags LLM Generator
// @Accept json
// @Produce json
// @Param id path int true "分类ID"
// @Param body body GenerateCategoryDescriptionRequest false "请求参数"
// @Success 200 {object} service.CategoryDescriptionResult
// @Router /api/v1/admin/generator/categories/{id}/description [post]
func (h *LLMGeneratorHandler) GenerateCategoryDescription(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的分类ID"})
	}

	var req GenerateCategoryDescriptionRequest
	if err := c.Bind(&req); err != nil {
		// 允许不传 body
		req = GenerateCategoryDescriptionRequest{}
	}

	result, err := h.generatorService.GenerateCategoryDescription(c.Request().Context(), service.GenerateCategoryDescriptionRequest{
		CategoryID: uint(id),
		Force:      req.Force,
	})
	if err != nil {
		h.logger.Error("生成分类描述失败", zap.Error(err), zap.Uint("category_id", uint(id)))
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

// =====================================================
// 课程内容生成
// =====================================================

// GenerateCourseContentRequest 生成课程内容请求
type GenerateCourseContentRequest struct {
	ChapterTitle   string `json:"chapter_title,omitempty"`
	Subject        string `json:"subject,omitempty"`
	KnowledgePoint string `json:"knowledge_point,omitempty"`
	Force          bool   `json:"force,omitempty"`
}

// GenerateCourseContent 生成课程内容
// @Summary 为课程章节生成 AI 内容
// @Tags LLM Generator
// @Accept json
// @Produce json
// @Param id path int true "章节ID"
// @Param body body GenerateCourseContentRequest false "请求参数"
// @Success 200 {object} model.GenerationTaskResponse
// @Router /api/v1/admin/generator/courses/{id}/content [post]
func (h *LLMGeneratorHandler) GenerateCourseContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的章节ID"})
	}

	var req GenerateCourseContentRequest
	if err := c.Bind(&req); err != nil {
		req = GenerateCourseContentRequest{}
	}

	task, err := h.generatorService.GenerateCourseContent(c.Request().Context(), service.LLMCourseContentRequest{
		ChapterID:      uint(id),
		ChapterTitle:   req.ChapterTitle,
		Subject:        req.Subject,
		KnowledgePoint: req.KnowledgePoint,
		Force:          req.Force,
	})
	if err != nil {
		h.logger.Error("创建课程生成任务失败", zap.Error(err), zap.Uint("chapter_id", uint(id)))
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "生成任务已创建",
		"task":    task.ToResponse(),
	})
}

// =====================================================
// 题目批次生成
// =====================================================

// GenerateQuestionBatchRequest 生成题目批次请求
type GenerateQuestionBatchRequest struct {
	Category string `json:"category" validate:"required"` // 大类
	Topic    string `json:"topic" validate:"required"`    // 题型
	SubTopic string `json:"sub_topic,omitempty"`          // 子题型
	Subject  string `json:"subject,omitempty"`            // 科目
}

// GenerateQuestionBatch 生成题目批次
// @Summary 生成一批练习题目
// @Tags LLM Generator
// @Accept json
// @Produce json
// @Param body body GenerateQuestionBatchRequest true "请求参数"
// @Success 200 {object} model.GenerationTaskResponse
// @Router /api/v1/admin/generator/questions/batch [post]
func (h *LLMGeneratorHandler) GenerateQuestionBatch(c echo.Context) error {
	var req GenerateQuestionBatchRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的请求参数"})
	}

	if req.Category == "" || req.Topic == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "category 和 topic 是必填项"})
	}

	task, err := h.generatorService.GenerateQuestionBatch(c.Request().Context(), service.GenerateQuestionBatchRequest{
		Category: req.Category,
		Topic:    req.Topic,
		SubTopic: req.SubTopic,
		Subject:  req.Subject,
	})
	if err != nil {
		h.logger.Error("创建题目生成任务失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "生成任务已创建",
		"task":    task.ToResponse(),
	})
}

// =====================================================
// 素材批次生成
// =====================================================

// GenerateMaterialBatchRequest 生成素材批次请求
type GenerateMaterialBatchRequest struct {
	Category     string `json:"category" validate:"required"` // 素材大类
	Topic        string `json:"topic" validate:"required"`    // 素材主题
	SubTopic     string `json:"sub_topic,omitempty"`          // 子主题
	MaterialType string `json:"material_type,omitempty"`      // 素材类型
}

// GenerateMaterialBatch 生成素材批次
// @Summary 生成一批学习素材
// @Tags LLM Generator
// @Accept json
// @Produce json
// @Param body body GenerateMaterialBatchRequest true "请求参数"
// @Success 200 {object} model.GenerationTaskResponse
// @Router /api/v1/admin/generator/materials/batch [post]
func (h *LLMGeneratorHandler) GenerateMaterialBatch(c echo.Context) error {
	var req GenerateMaterialBatchRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的请求参数"})
	}

	if req.Category == "" || req.Topic == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "category 和 topic 是必填项"})
	}

	task, err := h.generatorService.GenerateMaterialBatch(c.Request().Context(), service.GenerateMaterialBatchRequest{
		Category:     req.Category,
		Topic:        req.Topic,
		SubTopic:     req.SubTopic,
		MaterialType: req.MaterialType,
	})
	if err != nil {
		h.logger.Error("创建素材生成任务失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"message": "生成任务已创建",
		"task":    task.ToResponse(),
	})
}

// =====================================================
// 任务管理
// =====================================================

// ListTasks 列出生成任务
// @Summary 列出生成任务
// @Tags LLM Generator
// @Produce json
// @Param task_type query string false "任务类型" Enums(course, question, material, description)
// @Param status query string false "任务状态" Enums(pending, generating, completed, failed, cancelled)
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/generator/tasks [get]
func (h *LLMGeneratorHandler) ListTasks(c echo.Context) error {
	taskType := c.QueryParam("task_type")
	status := c.QueryParam("status")
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	tasks, total, err := h.generatorService.ListTasks(taskType, status, page, pageSize)
	if err != nil {
		h.logger.Error("获取任务列表失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// 转换为响应格式
	taskResponses := make([]*model.GenerationTaskResponse, len(tasks))
	for i, task := range tasks {
		taskResponses[i] = task.ToResponse()
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"tasks":     taskResponses,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetTask 获取任务详情
// @Summary 获取生成任务详情
// @Tags LLM Generator
// @Produce json
// @Param id path int true "任务ID"
// @Success 200 {object} model.GenerationTaskResponse
// @Router /api/v1/admin/generator/tasks/{id} [get]
func (h *LLMGeneratorHandler) GetTask(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的任务ID"})
	}

	task, err := h.generatorService.GetTask(uint(id))
	if err != nil {
		h.logger.Error("获取任务失败", zap.Error(err), zap.Uint("task_id", uint(id)))
		return c.JSON(http.StatusNotFound, map[string]string{"error": "任务不存在"})
	}

	return c.JSON(http.StatusOK, task.ToResponse())
}

// CancelTask 取消任务
// @Summary 取消生成任务
// @Tags LLM Generator
// @Param id path int true "任务ID"
// @Success 200 {object} map[string]string
// @Router /api/v1/admin/generator/tasks/{id} [delete]
func (h *LLMGeneratorHandler) CancelTask(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的任务ID"})
	}

	if err := h.generatorService.CancelTask(uint(id)); err != nil {
		h.logger.Error("取消任务失败", zap.Error(err), zap.Uint("task_id", uint(id)))
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "任务已取消"})
}
