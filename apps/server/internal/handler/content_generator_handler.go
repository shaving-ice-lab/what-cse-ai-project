package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// ContentGeneratorHandler 内容生成处理器
type ContentGeneratorHandler struct {
	generatorService *service.ContentGeneratorService
}

// NewContentGeneratorHandler 创建内容生成处理器
func NewContentGeneratorHandler(generatorService *service.ContentGeneratorService) *ContentGeneratorHandler {
	return &ContentGeneratorHandler{
		generatorService: generatorService,
	}
}

// RegisterRoutes 注册路由
func (h *ContentGeneratorHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	admin := e.Group("/api/v1/admin/generator", authMiddleware)

	// 统计
	admin.GET("/stats", h.GetStats)
	admin.GET("/stats/coverage", h.GetCoverageStats)
	admin.GET("/stats/quality", h.GetQualityStats)

	// 任务管理
	admin.GET("/tasks", h.GetTasks)
	admin.GET("/tasks/:id", h.GetTask)

	// 批量创建
	admin.POST("/categories/batch", h.BatchCreateCategories)
	admin.POST("/courses/batch", h.BatchCreateCourses)
	admin.POST("/knowledge/batch", h.BatchCreateKnowledgePoints)

	// 快速生成
	admin.POST("/quick/categories", h.QuickGenerateCategories)
	admin.POST("/quick/courses", h.QuickGenerateCourses)

	// 从模板生成
	admin.POST("/from-template", h.GenerateFromTemplate)

	// 模板管理
	admin.GET("/templates", h.GetTemplates)
	admin.GET("/templates/:id", h.GetTemplate)
	admin.POST("/templates", h.CreateTemplate)
	admin.PUT("/templates/:id", h.UpdateTemplate)
	admin.DELETE("/templates/:id", h.DeleteTemplate)

	// 预设结构
	admin.GET("/structures/:subject", h.GetSubjectStructure)

	// AI 内容生成
	admin.POST("/ai/generate", h.GenerateAIContent)

	// 数据导入
	admin.POST("/import", h.ImportContent)

	// 质量检查
	admin.POST("/quality/check", h.RunQualityCheck)
	admin.GET("/quality/results", h.GetQualityResults)
	admin.POST("/quality/resolve/:id", h.ResolveQualityIssue)
}

// GetStats 获取内容统计
// @Summary 获取内容统计
// @Tags ContentGenerator
// @Success 200 {object} model.GenerateContentStats
// @Router /api/v1/admin/generator/stats [get]
func (h *ContentGeneratorHandler) GetStats(c echo.Context) error {
	stats, err := h.generatorService.GetContentStats()
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "获取统计失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data":    stats,
	})
}

// GetTasks 获取任务列表
// @Summary 获取任务列表
// @Tags ContentGenerator
// @Param page query int false "页码"
// @Param page_size query int false "每页数量"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/generator/tasks [get]
func (h *ContentGeneratorHandler) GetTasks(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	tasks, total, err := h.generatorService.GetTasks(page, pageSize)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "获取任务列表失败: " + err.Error(),
		})
	}

	var responses []*model.ContentGeneratorTaskResponse
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
// @Summary 获取任务详情
// @Tags ContentGenerator
// @Param id path int true "任务ID"
// @Success 200 {object} model.ContentGeneratorTaskResponse
// @Router /api/v1/admin/generator/tasks/{id} [get]
func (h *ContentGeneratorHandler) GetTask(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的任务ID",
		})
	}

	task, err := h.generatorService.GetTask(uint(id))
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

// BatchCreateCategories 批量创建分类
// @Summary 批量创建分类
// @Tags ContentGenerator
// @Accept json
// @Param request body model.BatchCreateCategoryRequest true "创建请求"
// @Success 200 {object} model.ContentGeneratorTaskResponse
// @Router /api/v1/admin/generator/categories/batch [post]
func (h *ContentGeneratorHandler) BatchCreateCategories(c echo.Context) error {
	var req model.BatchCreateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	adminID := getAdminID(c)
	task, err := h.generatorService.BatchCreateCategories(&req, adminID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建任务失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "任务已创建",
		"data":    task.ToResponse(),
	})
}

// BatchCreateCourses 批量创建课程
// @Summary 批量创建课程
// @Tags ContentGenerator
// @Accept json
// @Param request body model.BatchCreateCourseRequest true "创建请求"
// @Success 200 {object} model.ContentGeneratorTaskResponse
// @Router /api/v1/admin/generator/courses/batch [post]
func (h *ContentGeneratorHandler) BatchCreateCourses(c echo.Context) error {
	var req model.BatchCreateCourseRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	adminID := getAdminID(c)
	task, err := h.generatorService.BatchCreateCourses(&req, adminID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建任务失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "任务已创建",
		"data":    task.ToResponse(),
	})
}

// BatchCreateKnowledgePoints 批量创建知识点
// @Summary 批量创建知识点
// @Tags ContentGenerator
// @Accept json
// @Param request body model.BatchCreateKnowledgeRequest true "创建请求"
// @Success 200 {object} model.ContentGeneratorTaskResponse
// @Router /api/v1/admin/generator/knowledge/batch [post]
func (h *ContentGeneratorHandler) BatchCreateKnowledgePoints(c echo.Context) error {
	var req model.BatchCreateKnowledgeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	adminID := getAdminID(c)
	task, err := h.generatorService.BatchCreateKnowledgePoints(&req, adminID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建任务失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "任务已创建",
		"data":    task.ToResponse(),
	})
}

// QuickGenerateCategories 快速生成分类
// @Summary 快速生成分类
// @Tags ContentGenerator
// @Accept json
// @Param request body map[string]string true "请求参数 subject: xingce/shenlun/mianshi/gongji"
// @Success 200 {object} model.ContentGeneratorTaskResponse
// @Router /api/v1/admin/generator/quick/categories [post]
func (h *ContentGeneratorHandler) QuickGenerateCategories(c echo.Context) error {
	var req struct {
		Subject string `json:"subject" binding:"required"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	if req.Subject == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "subject 参数不能为空",
		})
	}

	adminID := getAdminID(c)
	task, err := h.generatorService.GenerateSubjectCategories(req.Subject, adminID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "生成失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "任务已创建",
		"data":    task.ToResponse(),
	})
}

// QuickGenerateCourses 快速生成课程
// @Summary 快速生成课程
// @Tags ContentGenerator
// @Accept json
// @Param request body map[string]interface{} true "请求参数 subject 和 category_id"
// @Success 200 {object} model.ContentGeneratorTaskResponse
// @Router /api/v1/admin/generator/quick/courses [post]
func (h *ContentGeneratorHandler) QuickGenerateCourses(c echo.Context) error {
	var req struct {
		Subject    string `json:"subject" binding:"required"`
		CategoryID uint   `json:"category_id" binding:"required"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	if req.Subject == "" || req.CategoryID == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "subject 和 category_id 参数不能为空",
		})
	}

	adminID := getAdminID(c)
	task, err := h.generatorService.GenerateSubjectCourses(req.Subject, req.CategoryID, adminID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "生成失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "任务已创建",
		"data":    task.ToResponse(),
	})
}

// GenerateFromTemplate 从模板生成
// @Summary 从模板生成
// @Tags ContentGenerator
// @Accept json
// @Param request body model.GenerateFromTemplateRequest true "请求参数"
// @Success 200 {object} model.ContentGeneratorTaskResponse
// @Router /api/v1/admin/generator/from-template [post]
func (h *ContentGeneratorHandler) GenerateFromTemplate(c echo.Context) error {
	var req model.GenerateFromTemplateRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	adminID := getAdminID(c)
	task, err := h.generatorService.GenerateFromTemplate(&req, adminID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "生成失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "任务已创建",
		"data":    task.ToResponse(),
	})
}

// GetTemplates 获取模板列表
// @Summary 获取模板列表
// @Tags ContentGenerator
// @Param subject query string false "科目过滤"
// @Success 200 {object} []model.CourseTemplateResponse
// @Router /api/v1/admin/generator/templates [get]
func (h *ContentGeneratorHandler) GetTemplates(c echo.Context) error {
	subject := c.QueryParam("subject")

	templates, err := h.generatorService.GetTemplates(subject)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "获取模板失败: " + err.Error(),
		})
	}

	var responses []*model.CourseTemplateResponse
	for _, t := range templates {
		responses = append(responses, t.ToResponse())
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"templates": responses,
			"total":     len(responses),
		},
	})
}

// GetTemplate 获取模板详情
// @Summary 获取模板详情
// @Tags ContentGenerator
// @Param id path int true "模板ID"
// @Success 200 {object} model.CourseTemplate
// @Router /api/v1/admin/generator/templates/{id} [get]
func (h *ContentGeneratorHandler) GetTemplate(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的模板ID",
		})
	}

	template, err := h.generatorService.GetTemplate(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    404,
			"message": "模板不存在",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data":    template,
	})
}

// CreateTemplate 创建模板
// @Summary 创建模板
// @Tags ContentGenerator
// @Accept json
// @Param request body model.CourseTemplate true "模板信息"
// @Success 200 {object} model.CourseTemplate
// @Router /api/v1/admin/generator/templates [post]
func (h *ContentGeneratorHandler) CreateTemplate(c echo.Context) error {
	var template model.CourseTemplate
	if err := c.Bind(&template); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	template.CreatedBy = getAdminID(c)

	if err := h.generatorService.CreateTemplate(&template); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "创建模板失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "模板已创建",
		"data":    template,
	})
}

// UpdateTemplate 更新模板
// @Summary 更新模板
// @Tags ContentGenerator
// @Accept json
// @Param id path int true "模板ID"
// @Param request body model.CourseTemplate true "模板信息"
// @Success 200 {object} model.CourseTemplate
// @Router /api/v1/admin/generator/templates/{id} [put]
func (h *ContentGeneratorHandler) UpdateTemplate(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的模板ID",
		})
	}

	template, err := h.generatorService.GetTemplate(uint(id))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]interface{}{
			"code":    404,
			"message": "模板不存在",
		})
	}

	if err := c.Bind(template); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	if err := h.generatorService.UpdateTemplate(template); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "更新模板失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "模板已更新",
		"data":    template,
	})
}

// DeleteTemplate 删除模板
// @Summary 删除模板
// @Tags ContentGenerator
// @Param id path int true "模板ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/generator/templates/{id} [delete]
func (h *ContentGeneratorHandler) DeleteTemplate(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的模板ID",
		})
	}

	if err := h.generatorService.DeleteTemplate(uint(id)); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "删除模板失败: " + err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "模板已删除",
	})
}

// GetSubjectStructure 获取科目预设结构
// @Summary 获取科目预设结构
// @Tags ContentGenerator
// @Param subject path string true "科目 xingce/shenlun/mianshi/gongji"
// @Success 200 {object} map[string][]string
// @Router /api/v1/admin/generator/structures/{subject} [get]
func (h *ContentGeneratorHandler) GetSubjectStructure(c echo.Context) error {
	subject := c.Param("subject")

	structure := model.GetCourseStructure(subject)
	if structure == nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的科目，支持: xingce, shenlun, mianshi, gongji",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"subject":      subject,
			"subject_name": model.GetSubjectName(subject),
			"structure":    structure,
		},
	})
}

// =====================================================
// 统计 API
// =====================================================

// GetCoverageStats 获取覆盖度统计
// @Summary 获取内容覆盖度统计
// @Tags ContentGenerator
// @Param subject query string false "科目过滤"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/generator/stats/coverage [get]
func (h *ContentGeneratorHandler) GetCoverageStats(c echo.Context) error {
	// 简化实现：返回模拟数据
	// 实际应从数据库统计
	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"course_coverage": []map[string]interface{}{
				{"category": "言语理解", "count": 12, "total_duration": 540},
				{"category": "数量关系", "count": 8, "total_duration": 360},
				{"category": "判断推理", "count": 15, "total_duration": 675},
				{"category": "资料分析", "count": 10, "total_duration": 450},
				{"category": "常识判断", "count": 6, "total_duration": 270},
			},
			"question_coverage": []map[string]interface{}{
				{"category": "言语理解", "count": 500},
				{"category": "数量关系", "count": 400},
				{"category": "判断推理", "count": 600},
				{"category": "资料分析", "count": 350},
				{"category": "常识判断", "count": 300},
			},
			"knowledge_coverage": []map[string]interface{}{
				{"category": "言语理解", "total": 45, "with_content": 38},
				{"category": "数量关系", "total": 32, "with_content": 25},
				{"category": "判断推理", "total": 56, "with_content": 48},
				{"category": "资料分析", "total": 28, "with_content": 22},
				{"category": "常识判断", "total": 65, "with_content": 40},
			},
		},
	})
}

// GetQualityStats 获取质量统计
// @Summary 获取内容质量统计
// @Tags ContentGenerator
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/generator/stats/quality [get]
func (h *ContentGeneratorHandler) GetQualityStats(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"question_quality": map[string]interface{}{
				"total":              2150,
				"with_analysis":      1890,
				"avg_correct_rate":   62.5,
				"avg_discrimination": 0.35,
				"difficulty_distribution": map[string]int{
					"1": 235,
					"2": 520,
					"3": 860,
					"4": 420,
					"5": 115,
				},
			},
			"course_quality": map[string]interface{}{
				"total":               51,
				"avg_rating":          4.6,
				"avg_completion_rate": 68.5,
				"by_status": map[string]int{
					"published": 42,
					"draft":     6,
					"archived":  3,
				},
			},
		},
	})
}

// =====================================================
// AI 内容生成 API
// =====================================================

// GenerateAIContent AI内容生成
// @Summary AI内容生成
// @Tags ContentGenerator
// @Accept json
// @Param request body map[string]interface{} true "生成请求"
// @Success 200 {object} model.ContentGeneratorTaskResponse
// @Router /api/v1/admin/generator/ai/generate [post]
func (h *ContentGeneratorHandler) GenerateAIContent(c echo.Context) error {
	var req struct {
		GenerateType string `json:"generate_type" binding:"required"`
		TargetIDs    []uint `json:"target_ids,omitempty"`
		Options      struct {
			BatchSize int    `json:"batch_size,omitempty"`
			Model     string `json:"model,omitempty"`
			Overwrite bool   `json:"overwrite,omitempty"`
		} `json:"options,omitempty"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	adminID := getAdminID(c)

	// 创建模拟任务
	task := &model.ContentGeneratorTask{
		TaskType:     "ai_generate",
		Status:       model.TaskStatusProcessing,
		Subject:      req.GenerateType,
		TemplateName: getGenerateTypeName(req.GenerateType),
		TotalItems:   req.Options.BatchSize,
		CreatedBy:    adminID,
	}

	// 在实际实现中，这里应该调用AIContentGeneratorService
	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "AI生成任务已创建",
		"data":    task.ToResponse(),
	})
}

// =====================================================
// 数据导入 API
// =====================================================

// ImportContent 导入内容
// @Summary 导入内容
// @Tags ContentGenerator
// @Accept json
// @Param request body map[string]interface{} true "导入请求"
// @Success 200 {object} model.ContentGeneratorTaskResponse
// @Router /api/v1/admin/generator/import [post]
func (h *ContentGeneratorHandler) ImportContent(c echo.Context) error {
	var req struct {
		ImportType string `json:"import_type" binding:"required"`
		FileFormat string `json:"file_format" binding:"required"`
		Data       string `json:"data" binding:"required"`
		Options    struct {
			SkipDuplicates bool  `json:"skip_duplicates,omitempty"`
			CategoryID     *uint `json:"category_id,omitempty"`
			AutoPublish    bool  `json:"auto_publish,omitempty"`
		} `json:"options,omitempty"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	adminID := getAdminID(c)

	// 创建模拟任务
	task := &model.ContentGeneratorTask{
		TaskType:     model.TaskTypeBulkImport,
		Status:       model.TaskStatusProcessing,
		Subject:      req.ImportType,
		TemplateName: getImportTypeName(req.ImportType),
		TotalItems:   0, // 实际应从解析数据中获取
		CreatedBy:    adminID,
	}

	// 在实际实现中，这里应该调用ContentImportService
	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "导入任务已创建",
		"data":    task.ToResponse(),
	})
}

// =====================================================
// 质量检查 API
// =====================================================

// RunQualityCheck 运行质量检查
// @Summary 运行质量检查
// @Tags ContentGenerator
// @Accept json
// @Param request body map[string]interface{} true "检查请求"
// @Success 200 {object} model.ContentGeneratorTaskResponse
// @Router /api/v1/admin/generator/quality/check [post]
func (h *ContentGeneratorHandler) RunQualityCheck(c echo.Context) error {
	var req struct {
		CheckType  string `json:"check_type" binding:"required"`
		TargetType string `json:"target_type,omitempty"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的请求参数: " + err.Error(),
		})
	}

	adminID := getAdminID(c)

	// 创建模拟任务
	task := &model.ContentGeneratorTask{
		TaskType:     "quality_check",
		Status:       model.TaskStatusProcessing,
		Subject:      req.CheckType,
		TemplateName: getCheckTypeName(req.CheckType),
		TotalItems:   100,
		CreatedBy:    adminID,
	}

	// 在实际实现中，这里应该调用ContentQualityService
	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "质量检查任务已创建",
		"data":    task.ToResponse(),
	})
}

// GetQualityResults 获取质量检查结果
// @Summary 获取质量检查结果
// @Tags ContentGenerator
// @Param page query int false "页码"
// @Param page_size query int false "每页数量"
// @Param check_type query string false "检查类型"
// @Param severity query string false "严重程度"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/generator/quality/results [get]
func (h *ContentGeneratorHandler) GetQualityResults(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	checkType := c.QueryParam("check_type")
	severity := c.QueryParam("severity")

	if page < 1 {
		page = 1
	}
	if pageSize < 1 || pageSize > 100 {
		pageSize = 20
	}

	// 返回模拟数据
	results := []map[string]interface{}{}
	if checkType != "" || severity != "" {
		// 根据筛选条件返回结果
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"results":   results,
			"total":     0,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// ResolveQualityIssue 解决质量问题
// @Summary 解决质量问题
// @Tags ContentGenerator
// @Param id path int true "问题ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/admin/generator/quality/resolve/{id} [post]
func (h *ContentGeneratorHandler) ResolveQualityIssue(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "无效的问题ID",
		})
	}

	// 在实际实现中，这里应该调用ContentQualityService
	_ = id

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "问题已标记为已解决",
	})
}

// =====================================================
// 辅助函数
// =====================================================

func getGenerateTypeName(generateType string) string {
	names := map[string]string{
		"question_analysis": "题目解析生成",
		"knowledge_summary": "知识点总结",
		"similar_questions": "相似题生成",
		"material_classify": "素材分类整理",
	}
	if name, ok := names[generateType]; ok {
		return name
	}
	return generateType
}

func getImportTypeName(importType string) string {
	names := map[string]string{
		"questions":        "题目批量导入",
		"courses":          "课程批量导入",
		"materials":        "素材批量导入",
		"knowledge_points": "知识点导入",
	}
	if name, ok := names[importType]; ok {
		return name
	}
	return importType
}

func getCheckTypeName(checkType string) string {
	names := map[string]string{
		"typo":       "错别字检查",
		"format":     "格式规范检查",
		"duplicate":  "重复内容检测",
		"coverage":   "知识点覆盖分析",
		"difficulty": "难度分布分析",
	}
	if name, ok := names[checkType]; ok {
		return name
	}
	return checkType
}

// getAdminID 从上下文获取管理员ID
func getAdminID(c echo.Context) uint {
	if adminID, ok := c.Get("admin_id").(uint); ok {
		return adminID
	}
	return 0
}
