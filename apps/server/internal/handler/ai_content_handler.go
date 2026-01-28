package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

// AIResponse 统一响应结构
type AIResponse struct {
	Code    int         `json:"code"`
	Message string      `json:"message,omitempty"`
	Data    interface{} `json:"data,omitempty"`
}

// SuccessResponse 成功响应
func SuccessResponse(c echo.Context, data interface{}) error {
	return c.JSON(http.StatusOK, AIResponse{
		Code: 0,
		Data: data,
	})
}

// ErrorResponse 错误响应
func ErrorResponse(c echo.Context, statusCode int, message string) error {
	return c.JSON(statusCode, AIResponse{
		Code:    statusCode,
		Message: message,
	})
}

// AIContentHandler AI内容处理器
type AIContentHandler struct {
	contentGen *service.AIContentGeneratorService
	batchGen   *service.AIBatchGeneratorService
}

// NewAIContentHandler 创建AI内容处理器实例
func NewAIContentHandler(
	contentGen *service.AIContentGeneratorService,
	batchGen *service.AIBatchGeneratorService,
) *AIContentHandler {
	return &AIContentHandler{
		contentGen: contentGen,
		batchGen:   batchGen,
	}
}

// RegisterRoutes 注册路由
func (h *AIContentHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc, adminMiddleware echo.MiddlewareFunc) {
	// 公开API - 获取AI生成内容（用于学习展示）
	public := e.Group("/api/v1/ai-content")
	public.Use(authMiddleware)
	{
		public.GET("/question/:questionId/:contentType", h.GetQuestionContent)
		public.GET("/knowledge/:knowledgePointId/:contentType", h.GetKnowledgeContent)
		public.GET("/chapter/:chapterId/:contentType", h.GetChapterContent)
		public.GET("/course/:courseId/:contentType", h.GetCourseContent)
		public.GET("/:id", h.GetContent)
	}

	// Admin API - 内容管理
	admin := e.Group("/api/v1/admin/ai-content")
	admin.Use(adminMiddleware)
	{
		// AI内容管理
		admin.GET("", h.ListContents)
		admin.POST("/generate/question-analysis", h.GenerateQuestionAnalysis)
		admin.POST("/generate/question-tips", h.GenerateQuestionTips)
		admin.POST("/generate/knowledge-summary", h.GenerateKnowledgeSummary)
		admin.POST("/generate/knowledge-mindmap", h.GenerateKnowledgeMindmap)
		admin.POST("/generate/chapter-summary", h.GenerateChapterSummary)
		admin.POST("/generate/course-preview", h.GenerateCoursePreview)
		admin.POST("/generate/course-review", h.GenerateCourseReview)
		admin.PUT("/:id/approve", h.ApproveContent)
		admin.PUT("/:id/reject", h.RejectContent)
		admin.GET("/pending", h.GetPendingContents)

		// 章节教学内容生成
		admin.POST("/generate/chapter-lesson", h.GenerateChapterLesson)
		admin.POST("/generate/course-lessons", h.GenerateCourseLessons)
		admin.POST("/generate/category-lessons", h.GenerateCategoryLessons)

		// 批量任务管理
		admin.GET("/tasks", h.ListBatchTasks)
		admin.POST("/tasks", h.CreateBatchTask)
		admin.GET("/tasks/:id", h.GetBatchTask)
		admin.GET("/tasks/:id/progress", h.GetBatchTaskProgress)
		admin.POST("/tasks/:id/cancel", h.CancelBatchTask)
		admin.POST("/tasks/processing/start", h.StartProcessing)
		admin.POST("/tasks/processing/stop", h.StopProcessing)
	}
}

// =====================================================
// 公开API - 获取AI内容
// =====================================================

// GetQuestionContent 获取题目AI内容
// @Summary 获取题目AI内容
// @Tags AI内容
// @Param questionId path int true "题目ID"
// @Param contentType path string true "内容类型"
// @Success 200 {object} Response
// @Router /api/v1/ai-content/question/{questionId}/{contentType} [get]
func (h *AIContentHandler) GetQuestionContent(c echo.Context) error {
	questionID, err := strconv.ParseUint(c.Param("questionId"), 10, 32)
	if err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "无效的题目ID")
	}

	contentType := model.AIContentType(c.Param("contentType"))

	content, err := h.contentGen.GetContentByRelated(model.AIRelatedTypeQuestion, uint(questionID), contentType)
	if err != nil {
		return ErrorResponse(c, http.StatusNotFound, "内容不存在")
	}

	return SuccessResponse(c, content.ToResponse())
}

// GetKnowledgeContent 获取知识点AI内容
func (h *AIContentHandler) GetKnowledgeContent(c echo.Context) error {
	knowledgePointID, err := strconv.ParseUint(c.Param("knowledgePointId"), 10, 32)
	if err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "无效的知识点ID")
	}

	contentType := model.AIContentType(c.Param("contentType"))

	content, err := h.contentGen.GetContentByRelated(model.AIRelatedTypeKnowledgePoint, uint(knowledgePointID), contentType)
	if err != nil {
		return ErrorResponse(c, http.StatusNotFound, "内容不存在")
	}

	return SuccessResponse(c, content.ToResponse())
}

// GetChapterContent 获取章节AI内容
func (h *AIContentHandler) GetChapterContent(c echo.Context) error {
	chapterID, err := strconv.ParseUint(c.Param("chapterId"), 10, 32)
	if err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "无效的章节ID")
	}

	contentType := model.AIContentType(c.Param("contentType"))

	content, err := h.contentGen.GetContentByRelated(model.AIRelatedTypeChapter, uint(chapterID), contentType)
	if err != nil {
		return ErrorResponse(c, http.StatusNotFound, "内容不存在")
	}

	return SuccessResponse(c, content.ToResponse())
}

// GetCourseContent 获取课程AI内容
func (h *AIContentHandler) GetCourseContent(c echo.Context) error {
	courseID, err := strconv.ParseUint(c.Param("courseId"), 10, 32)
	if err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "无效的课程ID")
	}

	contentType := model.AIContentType(c.Param("contentType"))

	content, err := h.contentGen.GetContentByRelated(model.AIRelatedTypeCourse, uint(courseID), contentType)
	if err != nil {
		return ErrorResponse(c, http.StatusNotFound, "内容不存在")
	}

	return SuccessResponse(c, content.ToResponse())
}

// GetContent 获取AI内容
func (h *AIContentHandler) GetContent(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "无效的ID")
	}

	content, err := h.contentGen.GetAIContent(uint(id))
	if err != nil {
		return ErrorResponse(c, http.StatusNotFound, "内容不存在")
	}

	return SuccessResponse(c, content.ToResponse())
}

// =====================================================
// Admin API - 内容生成
// =====================================================

// GenerateQuestionAnalysis 生成题目解析
func (h *AIContentHandler) GenerateQuestionAnalysis(c echo.Context) error {
	var req service.GenerateQuestionAnalysisRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	content, err := h.contentGen.GenerateQuestionAnalysis(c.Request().Context(), req)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, content.ToResponse())
}

// GenerateQuestionTips 生成解题技巧
func (h *AIContentHandler) GenerateQuestionTips(c echo.Context) error {
	var req service.GenerateQuestionAnalysisRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	content, err := h.contentGen.GenerateQuestionTips(c.Request().Context(), req)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, content.ToResponse())
}

// GenerateKnowledgeSummary 生成知识点总结
func (h *AIContentHandler) GenerateKnowledgeSummary(c echo.Context) error {
	var req service.GenerateKnowledgeContentRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	content, err := h.contentGen.GenerateKnowledgeSummary(c.Request().Context(), req)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, content.ToResponse())
}

// GenerateKnowledgeMindmap 生成知识点思维导图
func (h *AIContentHandler) GenerateKnowledgeMindmap(c echo.Context) error {
	var req service.GenerateKnowledgeContentRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	content, err := h.contentGen.GenerateKnowledgeMindmap(c.Request().Context(), req)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, content.ToResponse())
}

// GenerateChapterSummary 生成章节总结
func (h *AIContentHandler) GenerateChapterSummary(c echo.Context) error {
	var req service.GenerateChapterContentRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	content, err := h.contentGen.GenerateChapterSummary(c.Request().Context(), req)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, content.ToResponse())
}

// GenerateCoursePreview 生成课程预习要点
func (h *AIContentHandler) GenerateCoursePreview(c echo.Context) error {
	var req service.GenerateCourseContentRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	content, err := h.contentGen.GenerateCoursePreview(c.Request().Context(), req)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, content.ToResponse())
}

// GenerateCourseReview 生成课程复习要点
func (h *AIContentHandler) GenerateCourseReview(c echo.Context) error {
	var req service.GenerateCourseContentRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	content, err := h.contentGen.GenerateCourseReview(c.Request().Context(), req)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, content.ToResponse())
}

// =====================================================
// Admin API - 章节教学内容生成
// =====================================================

// GenerateChapterLesson 生成章节教学内容（完整图文教程）
// @Summary 生成章节教学内容
// @Tags AI内容
// @Param body body service.GenerateChapterLessonRequest true "请求参数"
// @Success 200 {object} Response
// @Router /api/v1/admin/ai-content/generate/chapter-lesson [post]
func (h *AIContentHandler) GenerateChapterLesson(c echo.Context) error {
	var req service.GenerateChapterLessonRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	content, err := h.contentGen.GenerateChapterLesson(c.Request().Context(), req)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, content.ToResponse())
}

// GenerateCourseLessonsRequest 为课程批量生成教学内容请求
type GenerateCourseLessonsRequest struct {
	CourseID    uint   `json:"course_id" validate:"required"`
	Subject     string `json:"subject,omitempty"`
	AutoApprove bool   `json:"auto_approve,omitempty"`
}

// GenerateCourseLessons 为课程生成所有章节教学内容
// @Summary 为课程生成所有章节教学内容
// @Tags AI内容
// @Param body body GenerateCourseLessonsRequest true "请求参数"
// @Success 200 {object} Response
// @Router /api/v1/admin/ai-content/generate/course-lessons [post]
func (h *AIContentHandler) GenerateCourseLessons(c echo.Context) error {
	var req GenerateCourseLessonsRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	adminID := getAdminIDFromContext(c)

	task, err := h.batchGen.GenerateCourseLessons(service.GenerateCourseLessonsRequest{
		CourseID:    req.CourseID,
		Subject:     req.Subject,
		AutoApprove: req.AutoApprove,
		CreatedBy:   adminID,
	})
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, map[string]interface{}{
		"message": "课程教学内容生成任务已创建",
		"task":    task.ToResponse(),
	})
}

// GenerateCategoryLessonsRequest 为分类批量生成教学内容请求
type GenerateCategoryLessonsRequest struct {
	CategoryID  uint   `json:"category_id" validate:"required"`
	Subject     string `json:"subject,omitempty"`
	AutoApprove bool   `json:"auto_approve,omitempty"`
}

// GenerateCategoryLessons 为分类下所有课程生成教学内容
// @Summary 为分类下所有课程生成教学内容
// @Tags AI内容
// @Param body body GenerateCategoryLessonsRequest true "请求参数"
// @Success 200 {object} Response
// @Router /api/v1/admin/ai-content/generate/category-lessons [post]
func (h *AIContentHandler) GenerateCategoryLessons(c echo.Context) error {
	var req GenerateCategoryLessonsRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	adminID := getAdminIDFromContext(c)

	tasks, err := h.batchGen.GenerateCategoryLessons(service.GenerateCategoryLessonsRequest{
		CategoryID:  req.CategoryID,
		Subject:     req.Subject,
		AutoApprove: req.AutoApprove,
		CreatedBy:   adminID,
	})
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	// 转换任务响应
	var taskResponses []model.AIBatchTaskResponse
	for _, task := range tasks {
		taskResponses = append(taskResponses, task.ToResponse())
	}

	return SuccessResponse(c, map[string]interface{}{
		"message":     "分类教学内容生成任务已创建",
		"task_count":  len(tasks),
		"tasks":       taskResponses,
	})
}

// =====================================================
// Admin API - 内容管理
// =====================================================

// ListContents 获取AI内容列表
func (h *AIContentHandler) ListContents(c echo.Context) error {
	params := repository.AIContentListParams{
		ContentType: model.AIContentType(c.QueryParam("content_type")),
		RelatedType: model.AIRelatedType(c.QueryParam("related_type")),
		Status:      model.AIContentStatus(c.QueryParam("status")),
		Page:        1,
		PageSize:    20,
	}

	if page, err := strconv.Atoi(c.QueryParam("page")); err == nil && page > 0 {
		params.Page = page
	}
	if pageSize, err := strconv.Atoi(c.QueryParam("page_size")); err == nil && pageSize > 0 {
		params.PageSize = pageSize
	}
	if relatedID, err := strconv.ParseUint(c.QueryParam("related_id"), 10, 32); err == nil {
		params.RelatedID = uint(relatedID)
	}

	contents, total, err := h.contentGen.ListContents(params)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	var responses []model.AIGeneratedContentResponse
	for _, content := range contents {
		responses = append(responses, content.ToResponse())
	}

	return SuccessResponse(c, map[string]interface{}{
		"contents":  responses,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// ApproveContent 审核通过内容
func (h *AIContentHandler) ApproveContent(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "无效的ID")
	}

	adminID := getAdminIDFromContext(c)
	if err := h.contentGen.ApproveContent(uint(id), adminID); err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, nil)
}

// RejectContent 拒绝内容
func (h *AIContentHandler) RejectContent(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "无效的ID")
	}

	adminID := getAdminIDFromContext(c)
	if err := h.contentGen.RejectContent(uint(id), adminID); err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, nil)
}

// GetPendingContents 获取待审核内容
func (h *AIContentHandler) GetPendingContents(c echo.Context) error {
	limit := 50
	if l, err := strconv.Atoi(c.QueryParam("limit")); err == nil && l > 0 {
		limit = l
	}

	contents, err := h.contentGen.GetPendingContents(limit)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	var responses []model.AIGeneratedContentResponse
	for _, content := range contents {
		responses = append(responses, content.ToResponse())
	}

	return SuccessResponse(c, map[string]interface{}{
		"contents": responses,
	})
}

// =====================================================
// Admin API - 批量任务管理
// =====================================================

// CreateBatchTaskRequest 创建批量任务请求
type CreateBatchTaskRequest struct {
	TaskName    string                `json:"task_name" validate:"required"`
	ContentType model.AIContentType   `json:"content_type" validate:"required"`
	RelatedType model.AIRelatedType   `json:"related_type" validate:"required"`
	TargetIDs   []uint                `json:"target_ids" validate:"required,min=1"`
	Priority    int                   `json:"priority,omitempty"`
	Config      model.JSONBatchConfig `json:"config,omitempty"`
}

// CreateBatchTask 创建批量任务
func (h *AIContentHandler) CreateBatchTask(c echo.Context) error {
	var req CreateBatchTaskRequest
	if err := c.Bind(&req); err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "请求参数错误")
	}

	adminID := getAdminIDFromContext(c)

	task, err := h.batchGen.CreateBatchTask(service.CreateBatchTaskRequest{
		TaskName:    req.TaskName,
		ContentType: req.ContentType,
		RelatedType: req.RelatedType,
		TargetIDs:   req.TargetIDs,
		Priority:    req.Priority,
		Config:      req.Config,
		CreatedBy:   adminID,
	})
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, task.ToResponse())
}

// ListBatchTasks 获取批量任务列表
func (h *AIContentHandler) ListBatchTasks(c echo.Context) error {
	params := repository.AIBatchTaskListParams{
		ContentType: model.AIContentType(c.QueryParam("content_type")),
		Status:      model.AIBatchTaskStatus(c.QueryParam("status")),
		Page:        1,
		PageSize:    20,
	}

	if page, err := strconv.Atoi(c.QueryParam("page")); err == nil && page > 0 {
		params.Page = page
	}
	if pageSize, err := strconv.Atoi(c.QueryParam("page_size")); err == nil && pageSize > 0 {
		params.PageSize = pageSize
	}

	tasks, total, err := h.batchGen.ListBatchTasks(params)
	if err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	var responses []model.AIBatchTaskResponse
	for _, task := range tasks {
		responses = append(responses, task.ToResponse())
	}

	return SuccessResponse(c, map[string]interface{}{
		"tasks":     responses,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// GetBatchTask 获取批量任务详情
func (h *AIContentHandler) GetBatchTask(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "无效的ID")
	}

	task, err := h.batchGen.GetBatchTask(uint(id))
	if err != nil {
		return ErrorResponse(c, http.StatusNotFound, "任务不存在")
	}

	return SuccessResponse(c, task.ToResponse())
}

// GetBatchTaskProgress 获取批量任务进度
func (h *AIContentHandler) GetBatchTaskProgress(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "无效的ID")
	}

	progress, err := h.batchGen.GetTaskProgress(uint(id))
	if err != nil {
		return ErrorResponse(c, http.StatusNotFound, "任务不存在")
	}

	return SuccessResponse(c, progress)
}

// CancelBatchTask 取消批量任务
func (h *AIContentHandler) CancelBatchTask(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return ErrorResponse(c, http.StatusBadRequest, "无效的ID")
	}

	if err := h.batchGen.CancelBatchTask(uint(id)); err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, nil)
}

// StartProcessing 开始处理任务
func (h *AIContentHandler) StartProcessing(c echo.Context) error {
	if err := h.batchGen.StartProcessing(); err != nil {
		return ErrorResponse(c, http.StatusInternalServerError, err.Error())
	}

	return SuccessResponse(c, map[string]interface{}{
		"message": "任务处理已启动",
	})
}

// StopProcessing 停止处理任务
func (h *AIContentHandler) StopProcessing(c echo.Context) error {
	h.batchGen.StopProcessing()

	return SuccessResponse(c, map[string]interface{}{
		"message": "任务处理已停止",
	})
}

// getAdminIDFromContext 从上下文获取管理员ID
func getAdminIDFromContext(c echo.Context) uint {
	if adminID, ok := c.Get("admin_id").(uint); ok {
		return adminID
	}
	return 0
}
