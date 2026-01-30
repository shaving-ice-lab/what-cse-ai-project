package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"go.uber.org/zap"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// AIContentV2Handler AI 内容生成处理器（V2增强版，支持批量生成和自动导入）
type AIContentV2Handler struct {
	llmGeneratorService  *service.LLMGeneratorService
	contentImportService *service.ContentImportService
	logger               *zap.Logger
}

// NewAIContentV2Handler 创建 AI 内容 V2 处理器
func NewAIContentV2Handler(
	llmGeneratorService *service.LLMGeneratorService,
	contentImportService *service.ContentImportService,
	logger *zap.Logger,
) *AIContentV2Handler {
	return &AIContentV2Handler{
		llmGeneratorService:  llmGeneratorService,
		contentImportService: contentImportService,
		logger:               logger,
	}
}

// RegisterRoutes 注册路由
func (h *AIContentV2Handler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	admin := e.Group("/api/v1/admin/ai-content", authMiddleware)

	// 章节教学内容生成
	admin.POST("/generate/chapter-lesson", h.GenerateChapterLesson)
	admin.POST("/generate/course-lessons", h.GenerateCourseLessons)
	admin.POST("/generate/category-lessons", h.GenerateCategoryLessons)

	// 题目批次生成
	admin.POST("/generate/questions", h.GenerateQuestions)

	// 素材批次生成
	admin.POST("/generate/materials", h.GenerateMaterials)

	// 分类描述生成
	admin.POST("/generate/category-description/:id", h.GenerateCategoryDescription)

	// 生成内容管理
	admin.GET("/contents", h.ListContents)
	admin.GET("/contents/:id", h.GetContent)
	admin.POST("/contents/:id/approve", h.ApproveContent)
	admin.POST("/contents/:id/reject", h.RejectContent)
	admin.POST("/contents/:id/import", h.ImportContent)

	// 任务管理（复用 LLM Generator 的任务）
	admin.GET("/tasks", h.ListTasks)
	admin.GET("/tasks/:id", h.GetTask)
	admin.DELETE("/tasks/:id", h.CancelTask)
}

// =====================================================
// 章节教学内容生成
// =====================================================

// GenerateChapterLessonRequest 生成章节课程请求
type GenerateChapterLessonRequest struct {
	ChapterID          uint   `json:"chapter_id" validate:"required"`
	ChapterTitle       string `json:"chapter_title,omitempty"`
	Subject            string `json:"subject,omitempty"`
	KnowledgePoint     string `json:"knowledge_point,omitempty"`
	AutoApprove        bool   `json:"auto_approve,omitempty"`
	AutoImport         bool   `json:"auto_import,omitempty"`
	// 从前端传入的 prompt（可选，如果不传则使用后端默认）
	SystemPrompt       string `json:"system_prompt,omitempty"`
	UserPromptTemplate string `json:"user_prompt_template,omitempty"`
}

// GenerateChapterLesson 生成单个章节的教学内容
// @Summary 生成章节教学内容
// @Tags AI Content
// @Accept json
// @Produce json
// @Param body body GenerateChapterLessonRequest true "请求参数"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/generate/chapter-lesson [post]
func (h *AIContentV2Handler) GenerateChapterLesson(c echo.Context) error {
	var req GenerateChapterLessonRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
	}

	if req.ChapterID == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "chapter_id 是必填项",
		})
	}

	task, err := h.llmGeneratorService.GenerateCourseContentV2(c.Request().Context(), service.GenerateCourseContentV2Request{
		ChapterID:          req.ChapterID,
		ChapterTitle:       req.ChapterTitle,
		Subject:            req.Subject,
		KnowledgePoint:     req.KnowledgePoint,
		AutoApprove:        req.AutoApprove,
		AutoImport:         req.AutoImport,
		SystemPrompt:       req.SystemPrompt,
		UserPromptTemplate: req.UserPromptTemplate,
	})
	if err != nil {
		h.logger.Error("创建生成任务失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建任务失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "生成任务已创建",
		"data": map[string]interface{}{
			"task": task.ToResponse(),
		},
	})
}

// =====================================================
// 批量生成课程章节
// =====================================================

// GenerateCourseLessonsRequest 批量生成课程章节请求
type GenerateCourseLessonsRequest struct {
	CourseID           uint   `json:"course_id" validate:"required"`
	Subject            string `json:"subject,omitempty"`
	AutoApprove        bool   `json:"auto_approve,omitempty"`
	AutoImport         bool   `json:"auto_import,omitempty"`
	SkipExisting       bool   `json:"skip_existing,omitempty"`
	SystemPrompt       string `json:"system_prompt,omitempty"`
	UserPromptTemplate string `json:"user_prompt_template,omitempty"`
}

// GenerateCourseLessons 批量生成课程下所有章节
// @Summary 批量生成课程章节内容
// @Tags AI Content
// @Accept json
// @Produce json
// @Param body body GenerateCourseLessonsRequest true "请求参数"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/generate/course-lessons [post]
func (h *AIContentV2Handler) GenerateCourseLessons(c echo.Context) error {
	var req GenerateCourseLessonsRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
	}

	if req.CourseID == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "course_id 是必填项",
		})
	}

	result, err := h.llmGeneratorService.BatchGenerateCourseLessons(c.Request().Context(), model.BatchGenerateCourseLessonsRequest{
		CourseID:           req.CourseID,
		Subject:            req.Subject,
		AutoApprove:        req.AutoApprove,
		AutoImport:         req.AutoImport,
		SkipExisting:       req.SkipExisting,
		SystemPrompt:       req.SystemPrompt,
		UserPromptTemplate: req.UserPromptTemplate,
	})
	if err != nil {
		h.logger.Error("批量生成失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "批量生成失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "批量生成任务已创建",
		"data":    result,
	})
}

// =====================================================
// 批量生成分类章节
// =====================================================

// GenerateCategoryLessonsRequest 批量生成分类章节请求
type GenerateCategoryLessonsRequest struct {
	CategoryID           uint   `json:"category_id" validate:"required"`
	Subject              string `json:"subject,omitempty"`
	AutoApprove          bool   `json:"auto_approve,omitempty"`
	AutoImport           bool   `json:"auto_import,omitempty"`
	SkipExisting         bool   `json:"skip_existing,omitempty"`
	IncludeSubCategories bool   `json:"include_sub_categories,omitempty"`
	SystemPrompt         string `json:"system_prompt,omitempty"`
	UserPromptTemplate   string `json:"user_prompt_template,omitempty"`
}

// GenerateCategoryLessons 批量生成分类下所有章节
// @Summary 批量生成分类章节内容
// @Tags AI Content
// @Accept json
// @Produce json
// @Param body body GenerateCategoryLessonsRequest true "请求参数"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/generate/category-lessons [post]
func (h *AIContentV2Handler) GenerateCategoryLessons(c echo.Context) error {
	var req GenerateCategoryLessonsRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
	}

	if req.CategoryID == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "category_id 是必填项",
		})
	}

	result, err := h.llmGeneratorService.BatchGenerateCategoryLessons(c.Request().Context(), model.BatchGenerateCategoryLessonsRequest{
		CategoryID:           req.CategoryID,
		Subject:              req.Subject,
		AutoApprove:          req.AutoApprove,
		AutoImport:           req.AutoImport,
		SkipExisting:         req.SkipExisting,
		IncludeSubCategories: req.IncludeSubCategories,
		SystemPrompt:         req.SystemPrompt,
		UserPromptTemplate:   req.UserPromptTemplate,
	})
	if err != nil {
		h.logger.Error("批量生成失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "批量生成失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "批量生成任务已创建",
		"data":    result,
	})
}

// =====================================================
// 题目批次生成
// =====================================================

// GenerateQuestionsRequest 生成题目请求
type GenerateQuestionsRequest struct {
	Category    string `json:"category" validate:"required"`
	Topic       string `json:"topic" validate:"required"`
	SubTopic    string `json:"sub_topic,omitempty"`
	Subject     string `json:"subject,omitempty"`
	BatchCount  int    `json:"batch_count,omitempty"`
	AutoApprove bool   `json:"auto_approve,omitempty"`
	AutoImport  bool   `json:"auto_import,omitempty"`
}

// GenerateQuestions 生成题目批次
// @Summary 生成题目批次
// @Tags AI Content
// @Accept json
// @Produce json
// @Param body body GenerateQuestionsRequest true "请求参数"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/generate/questions [post]
func (h *AIContentV2Handler) GenerateQuestions(c echo.Context) error {
	var req GenerateQuestionsRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
	}

	if req.Category == "" || req.Topic == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "category 和 topic 是必填项",
		})
	}

	task, err := h.llmGeneratorService.GenerateQuestionBatchV2(c.Request().Context(), model.BatchGenerateQuestionsRequest{
		Category:    req.Category,
		Topic:       req.Topic,
		SubTopic:    req.SubTopic,
		Subject:     req.Subject,
		BatchCount:  req.BatchCount,
		AutoApprove: req.AutoApprove,
		AutoImport:  req.AutoImport,
	})
	if err != nil {
		h.logger.Error("创建题目生成任务失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建任务失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "题目生成任务已创建",
		"data": map[string]interface{}{
			"task": task.ToResponse(),
		},
	})
}

// =====================================================
// 素材批次生成
// =====================================================

// GenerateMaterialsRequest 生成素材请求
type GenerateMaterialsRequest struct {
	Category     string `json:"category" validate:"required"`
	Topic        string `json:"topic" validate:"required"`
	SubTopic     string `json:"sub_topic,omitempty"`
	MaterialType string `json:"material_type,omitempty"`
	BatchCount   int    `json:"batch_count,omitempty"`
	AutoApprove  bool   `json:"auto_approve,omitempty"`
	AutoImport   bool   `json:"auto_import,omitempty"`
}

// GenerateMaterials 生成素材批次
// @Summary 生成素材批次
// @Tags AI Content
// @Accept json
// @Produce json
// @Param body body GenerateMaterialsRequest true "请求参数"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/generate/materials [post]
func (h *AIContentV2Handler) GenerateMaterials(c echo.Context) error {
	var req GenerateMaterialsRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误: " + err.Error(),
		})
	}

	if req.Category == "" || req.Topic == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "category 和 topic 是必填项",
		})
	}

	task, err := h.llmGeneratorService.GenerateMaterialBatchV2(c.Request().Context(), model.BatchGenerateMaterialsRequest{
		Category:     req.Category,
		Topic:        req.Topic,
		SubTopic:     req.SubTopic,
		MaterialType: req.MaterialType,
		BatchCount:   req.BatchCount,
		AutoApprove:  req.AutoApprove,
		AutoImport:   req.AutoImport,
	})
	if err != nil {
		h.logger.Error("创建素材生成任务失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建任务失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "素材生成任务已创建",
		"data": map[string]interface{}{
			"task": task.ToResponse(),
		},
	})
}

// =====================================================
// 分类描述生成
// =====================================================

// GenerateCategoryDescription 生成分类描述
// @Summary 生成分类描述
// @Tags AI Content
// @Produce json
// @Param id path int true "分类ID"
// @Param force query bool false "强制重新生成"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/generate/category-description/{id} [post]
func (h *AIContentV2Handler) GenerateCategoryDescription(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的分类ID",
		})
	}

	force := c.QueryParam("force") == "true"

	result, err := h.llmGeneratorService.GenerateCategoryDescriptionV2(c.Request().Context(), uint(id), force)
	if err != nil {
		h.logger.Error("生成分类描述失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "生成失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "分类描述已生成",
		"data":    result,
	})
}

// =====================================================
// 生成内容管理
// =====================================================

// ListContents 获取生成内容列表
// @Summary 获取 AI 生成内容列表
// @Tags AI Content
// @Produce json
// @Param content_type query string false "内容类型" Enums(course, question, material, category)
// @Param status query string false "状态" Enums(pending, approved, rejected, imported)
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/contents [get]
func (h *AIContentV2Handler) ListContents(c echo.Context) error {
	contentType := c.QueryParam("content_type")
	status := c.QueryParam("status")
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	contents, total, err := h.contentImportService.GetAIContentList(c.Request().Context(), contentType, status, page, pageSize)
	if err != nil {
		h.logger.Error("获取内容列表失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "获取列表失败: " + err.Error(),
		})
	}

	// 转换为响应格式
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

// GetContent 获取生成内容详情
// @Summary 获取 AI 生成内容详情
// @Tags AI Content
// @Produce json
// @Param id path int true "内容ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/contents/{id} [get]
func (h *AIContentV2Handler) GetContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的内容ID",
		})
	}

	content, err := h.contentImportService.GetAIContentByID(c.Request().Context(), uint(id))
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

// ApproveContentRequest 审核通过请求
type ApproveContentRequest struct {
	AutoImport bool `json:"auto_import,omitempty"`
}

// ApproveContent 审核通过内容
// @Summary 审核通过 AI 生成内容
// @Tags AI Content
// @Accept json
// @Produce json
// @Param id path int true "内容ID"
// @Param body body ApproveContentRequest false "请求参数"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/contents/{id}/approve [post]
func (h *AIContentV2Handler) ApproveContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的内容ID",
		})
	}

	var req ApproveContentRequest
	c.Bind(&req) // 忽略绑定错误

	// 获取管理员ID
	adminID := getAdminIDFromContext(c)

	if err := h.contentImportService.ApproveAIContent(c.Request().Context(), uint(id), adminID); err != nil {
		h.logger.Error("审核通过失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "审核失败: " + err.Error(),
		})
	}

	// 如果需要自动导入
	if req.AutoImport {
		if err := h.contentImportService.ImportApprovedContent(c.Request().Context(), uint(id)); err != nil {
			h.logger.Warn("自动导入失败", zap.Error(err))
			return c.JSON(http.StatusOK, map[string]interface{}{
				"code":    0,
				"message": "审核通过，但自动导入失败: " + err.Error(),
			})
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "审核通过",
	})
}

// RejectContentRequest 拒绝请求
type RejectContentRequest struct {
	Reason string `json:"reason,omitempty"`
}

// RejectContent 拒绝内容
// @Summary 拒绝 AI 生成内容
// @Tags AI Content
// @Accept json
// @Produce json
// @Param id path int true "内容ID"
// @Param body body RejectContentRequest false "请求参数"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/contents/{id}/reject [post]
func (h *AIContentV2Handler) RejectContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的内容ID",
		})
	}

	var req RejectContentRequest
	c.Bind(&req)

	adminID := getAdminIDFromContext(c)

	if err := h.contentImportService.RejectAIContent(c.Request().Context(), uint(id), adminID, req.Reason); err != nil {
		h.logger.Error("拒绝失败", zap.Error(err))
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

// ImportContent 导入已审核的内容
// @Summary 导入已审核的 AI 内容
// @Tags AI Content
// @Produce json
// @Param id path int true "内容ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/contents/{id}/import [post]
func (h *AIContentV2Handler) ImportContent(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的内容ID",
		})
	}

	if err := h.contentImportService.ImportApprovedContent(c.Request().Context(), uint(id)); err != nil {
		h.logger.Error("导入失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "导入失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "导入成功",
	})
}

// =====================================================
// 任务管理
// =====================================================

// ListTasks 获取任务列表
// @Summary 获取生成任务列表
// @Tags AI Content
// @Produce json
// @Param task_type query string false "任务类型"
// @Param status query string false "状态"
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/tasks [get]
func (h *AIContentV2Handler) ListTasks(c echo.Context) error {
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

	tasks, total, err := h.llmGeneratorService.ListTasks(taskType, status, page, pageSize)
	if err != nil {
		h.logger.Error("获取任务列表失败", zap.Error(err))
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "获取列表失败: " + err.Error(),
		})
	}

	var responses []*model.GenerationTaskResponse
	for _, task := range tasks {
		responses = append(responses, task.ToResponse())
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"tasks":     responses,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// GetTask 获取任务详情
// @Summary 获取生成任务详情
// @Tags AI Content
// @Produce json
// @Param id path int true "任务ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/tasks/{id} [get]
func (h *AIContentV2Handler) GetTask(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的任务ID",
		})
	}

	task, err := h.llmGeneratorService.GetTask(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    404,
			"message": "任务不存在",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data":    task.ToResponse(),
	})
}

// CancelTask 取消任务
// @Summary 取消生成任务
// @Tags AI Content
// @Param id path int true "任务ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/ai-content/tasks/{id} [delete]
func (h *AIContentV2Handler) CancelTask(c echo.Context) error {
	idStr := c.Param("id")
	id, err := strconv.ParseUint(idStr, 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的任务ID",
		})
	}

	if err := h.llmGeneratorService.CancelTask(uint(id)); err != nil {
		h.logger.Error("取消任务失败", zap.Error(err))
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

// =====================================================
// 辅助函数
// =====================================================

// getAdminIDFromContext 从上下文获取管理员ID
func getAdminIDFromContext(c echo.Context) uint {
	if adminID, ok := c.Get("admin_id").(uint); ok {
		return adminID
	}
	return 0
}
