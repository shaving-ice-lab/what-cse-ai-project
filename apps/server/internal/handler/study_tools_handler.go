package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

// StudyToolsHandler 学习工具处理器
type StudyToolsHandler struct {
	planService     *service.StudyPlanService
	timeService     *service.StudyTimeService
	favoriteService *service.LearningFavoriteService
	masteryService  *service.KnowledgeMasteryService
}

// NewStudyToolsHandler 创建学习工具处理器
func NewStudyToolsHandler(
	planService *service.StudyPlanService,
	timeService *service.StudyTimeService,
	favoriteService *service.LearningFavoriteService,
	masteryService *service.KnowledgeMasteryService,
) *StudyToolsHandler {
	return &StudyToolsHandler{
		planService:     planService,
		timeService:     timeService,
		favoriteService: favoriteService,
		masteryService:  masteryService,
	}
}

// RegisterRoutes 注册路由
func (h *StudyToolsHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	// 学习计划路由
	planGroup := e.Group("/api/v1/study/plans")
	planGroup.Use(authMiddleware)
	planGroup.POST("", h.CreatePlan)
	planGroup.POST("/from-template", h.CreatePlanFromTemplate)
	planGroup.GET("", h.ListPlans)
	planGroup.GET("/active", h.GetActivePlan)
	planGroup.GET("/templates", h.GetPlanTemplates)
	planGroup.GET("/:id", h.GetPlan)
	planGroup.PUT("/:id", h.UpdatePlan)
	planGroup.PUT("/:id/status", h.UpdatePlanStatus)
	planGroup.DELETE("/:id", h.DeletePlan)

	// 每日任务路由
	taskGroup := e.Group("/api/v1/study/tasks")
	taskGroup.Use(authMiddleware)
	taskGroup.GET("", h.GetDailyTasks)
	taskGroup.GET("/stats", h.GetDailyTaskStats)
	taskGroup.PUT("/:id/complete", h.CompleteDailyTask)
	taskGroup.PUT("/:id/progress", h.UpdateTaskProgress)

	// 学习时长路由
	timeGroup := e.Group("/api/v1/study/time")
	timeGroup.Use(authMiddleware)
	timeGroup.POST("/start", h.StartStudySession)
	timeGroup.POST("/end/:id", h.EndStudySession)
	timeGroup.POST("/record", h.RecordStudyTime)
	timeGroup.GET("/active", h.GetActiveSession)
	timeGroup.GET("/records", h.GetStudyRecords)
	timeGroup.GET("/statistics/daily", h.GetDailyStatistics)
	timeGroup.GET("/statistics/weekly", h.GetWeeklyStatistics)
	timeGroup.GET("/statistics/monthly", h.GetMonthlyStatistics)

	// 学习收藏路由
	favoriteGroup := e.Group("/api/v1/study/favorites")
	favoriteGroup.Use(authMiddleware)
	favoriteGroup.POST("", h.AddLearningFavorite)
	favoriteGroup.GET("", h.ListLearningFavorites)
	favoriteGroup.GET("/stats", h.GetLearningFavoriteStats)
	favoriteGroup.GET("/check", h.CheckLearningFavorite)
	favoriteGroup.POST("/batch-check", h.BatchCheckLearningFavorites)
	favoriteGroup.DELETE("/:id", h.RemoveLearningFavorite)
	favoriteGroup.PUT("/:id/note", h.UpdateLearningFavoriteNote)
	favoriteGroup.PUT("/:id/folder", h.MoveLearningFavoriteToFolder)

	// 收藏夹路由
	folderGroup := e.Group("/api/v1/study/folders")
	folderGroup.Use(authMiddleware)
	folderGroup.POST("", h.CreateLearningFolder)
	folderGroup.GET("", h.ListLearningFolders)
	folderGroup.PUT("/:id", h.UpdateLearningFolder)
	folderGroup.DELETE("/:id", h.DeleteLearningFolder)

	// 知识图谱/掌握度路由
	masteryGroup := e.Group("/api/v1/study/mastery")
	masteryGroup.Use(authMiddleware)
	masteryGroup.GET("", h.GetKnowledgeMastery)
	masteryGroup.GET("/weak-points", h.GetWeakPoints)
	masteryGroup.GET("/stats", h.GetMasteryStats)
	masteryGroup.POST("/update", h.UpdateKnowledgeMastery)
}

// =====================================================
// Study Plan Handlers
// =====================================================

// CreatePlan 创建学习计划
func (h *StudyToolsHandler) CreatePlan(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req service.CreateStudyPlanRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	plan, err := h.planService.Create(userID, &req)
	if err != nil {
		if err == service.ErrStudyPlanAlreadyActive {
			return c.JSON(http.StatusConflict, map[string]string{"error": "Already has an active study plan"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, plan.ToResponse())
}

// CreatePlanFromTemplate 从模板创建计划
func (h *StudyToolsHandler) CreatePlanFromTemplate(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req struct {
		TemplateID     uint       `json:"template_id"`
		StartDate      time.Time  `json:"start_date"`
		TargetExamDate *time.Time `json:"target_exam_date"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	plan, err := h.planService.CreateFromTemplate(userID, req.TemplateID, req.StartDate, req.TargetExamDate)
	if err != nil {
		if err == service.ErrTemplateNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "Template not found"})
		}
		if err == service.ErrStudyPlanAlreadyActive {
			return c.JSON(http.StatusConflict, map[string]string{"error": "Already has an active study plan"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, plan.ToResponse())
}

// GetPlan 获取计划详情
func (h *StudyToolsHandler) GetPlan(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	planID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid plan ID"})
	}

	plan, err := h.planService.GetByID(userID, uint(planID))
	if err != nil {
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Plan not found"})
	}

	return c.JSON(http.StatusOK, plan)
}

// GetActivePlan 获取当前进行中的计划
func (h *StudyToolsHandler) GetActivePlan(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	plan, err := h.planService.GetActive(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if plan == nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"plan": nil})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"plan": plan})
}

// ListPlans 获取计划列表
func (h *StudyToolsHandler) ListPlans(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	params := &repository.StudyPlanQueryParams{
		Status:   model.StudyPlanStatus(c.QueryParam("status")),
		ExamType: c.QueryParam("exam_type"),
		Page:     page,
		PageSize: pageSize,
	}

	result, err := h.planService.List(userID, params)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

// GetPlanTemplates 获取计划模板
func (h *StudyToolsHandler) GetPlanTemplates(c echo.Context) error {
	examType := c.QueryParam("exam_type")

	templates, err := h.planService.GetTemplates(examType)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"templates": templates})
}

// UpdatePlan 更新计划
func (h *StudyToolsHandler) UpdatePlan(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	planID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid plan ID"})
	}

	var req service.UpdateStudyPlanRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	err = h.planService.Update(userID, uint(planID), &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Plan updated successfully"})
}

// UpdatePlanStatus 更新计划状态
func (h *StudyToolsHandler) UpdatePlanStatus(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	planID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid plan ID"})
	}

	var req struct {
		Status model.StudyPlanStatus `json:"status"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	err = h.planService.UpdateStatus(userID, uint(planID), req.Status)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Status updated successfully"})
}

// DeletePlan 删除计划
func (h *StudyToolsHandler) DeletePlan(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	planID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid plan ID"})
	}

	err = h.planService.Delete(userID, uint(planID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Plan deleted successfully"})
}

// =====================================================
// Daily Task Handlers
// =====================================================

// GetDailyTasks 获取今日任务
func (h *StudyToolsHandler) GetDailyTasks(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	dateStr := c.QueryParam("date")
	var date time.Time
	if dateStr != "" {
		var err error
		date, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid date format"})
		}
	} else {
		date = time.Now()
	}

	tasks, err := h.planService.GetDailyTasks(userID, date)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"tasks": tasks})
}

// GetDailyTaskStats 获取今日任务统计
func (h *StudyToolsHandler) GetDailyTaskStats(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	planIDStr := c.QueryParam("plan_id")
	var planID uint
	if planIDStr != "" {
		id, _ := strconv.ParseUint(planIDStr, 10, 64)
		planID = uint(id)
	}

	dateStr := c.QueryParam("date")
	var date time.Time
	if dateStr != "" {
		var err error
		date, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid date format"})
		}
	} else {
		date = time.Now()
	}

	stats, err := h.planService.GetDailyTaskStats(userID, planID, date)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stats)
}

// CompleteDailyTask 完成每日任务
func (h *StudyToolsHandler) CompleteDailyTask(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	taskID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid task ID"})
	}

	err = h.planService.CompleteDailyTask(userID, uint(taskID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Task completed successfully"})
}

// UpdateTaskProgress 更新任务进度
func (h *StudyToolsHandler) UpdateTaskProgress(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	taskID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid task ID"})
	}

	var req struct {
		ActualTime  int `json:"actual_time"`
		ActualCount int `json:"actual_count"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	err = h.planService.UpdateDailyTaskProgress(userID, uint(taskID), req.ActualTime, req.ActualCount)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Progress updated successfully"})
}

// =====================================================
// Study Time Handlers
// =====================================================

// StartStudySession 开始学习会话
func (h *StudyToolsHandler) StartStudySession(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req service.StartSessionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	record, err := h.timeService.StartSession(userID, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, record.ToResponse())
}

// EndStudySession 结束学习会话
func (h *StudyToolsHandler) EndStudySession(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	recordID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid record ID"})
	}

	err = h.timeService.EndSession(userID, uint(recordID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Session ended successfully"})
}

// RecordStudyTime 直接记录学习时长
func (h *StudyToolsHandler) RecordStudyTime(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req struct {
		service.StartSessionRequest
		Duration int `json:"duration"` // 时长（秒）
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	record, err := h.timeService.RecordStudyTime(userID, &req.StartSessionRequest, req.Duration)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, record.ToResponse())
}

// GetActiveSession 获取当前进行中的会话
func (h *StudyToolsHandler) GetActiveSession(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	session, err := h.timeService.GetActiveSession(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"session": session})
}

// GetStudyRecords 获取学习记录
func (h *StudyToolsHandler) GetStudyRecords(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	params := &repository.StudyTimeQueryParams{
		StudyType: model.StudyType(c.QueryParam("study_type")),
		Subject:   c.QueryParam("subject"),
		Page:      page,
		PageSize:  pageSize,
	}

	// 解析日期范围
	if startDate := c.QueryParam("start_date"); startDate != "" {
		if t, err := time.Parse("2006-01-02", startDate); err == nil {
			params.StartDate = t
		}
	}
	if endDate := c.QueryParam("end_date"); endDate != "" {
		if t, err := time.Parse("2006-01-02", endDate); err == nil {
			params.EndDate = t
		}
	}

	result, err := h.timeService.GetRecords(userID, params)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

// GetDailyStatistics 获取日统计
func (h *StudyToolsHandler) GetDailyStatistics(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	dateStr := c.QueryParam("date")
	var date time.Time
	if dateStr != "" {
		var err error
		date, err = time.Parse("2006-01-02", dateStr)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid date format"})
		}
	} else {
		date = time.Now()
	}

	stats, err := h.timeService.GetDailyStatistics(userID, date)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stats)
}

// GetWeeklyStatistics 获取周统计
func (h *StudyToolsHandler) GetWeeklyStatistics(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	stats, err := h.timeService.GetWeeklyStatistics(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stats)
}

// GetMonthlyStatistics 获取月统计
func (h *StudyToolsHandler) GetMonthlyStatistics(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	stats, err := h.timeService.GetMonthlyStatistics(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stats)
}

// =====================================================
// Learning Favorite Handlers
// =====================================================

// AddLearningFavorite 添加学习收藏
func (h *StudyToolsHandler) AddLearningFavorite(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req service.AddLearningFavoriteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	favorite, err := h.favoriteService.Add(userID, &req)
	if err != nil {
		if err == service.ErrLearningFavoriteExists {
			return c.JSON(http.StatusConflict, map[string]string{"error": "Already favorited"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, favorite.ToResponse())
}

// ListLearningFavorites 获取收藏列表
func (h *StudyToolsHandler) ListLearningFavorites(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	params := &repository.LearningFavoriteQueryParams{
		ContentType: model.LearningContentType(c.QueryParam("content_type")),
		Page:        page,
		PageSize:    pageSize,
	}

	// 处理 folder_id
	if folderIDStr := c.QueryParam("folder_id"); folderIDStr != "" {
		folderID, err := strconv.ParseUint(folderIDStr, 10, 64)
		if err == nil {
			fid := uint(folderID)
			params.FolderID = &fid
		}
	}

	result, err := h.favoriteService.List(userID, params)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

// GetLearningFavoriteStats 获取收藏统计
func (h *StudyToolsHandler) GetLearningFavoriteStats(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	stats, err := h.favoriteService.GetStats(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"stats": stats})
}

// CheckLearningFavorite 检查是否已收藏
func (h *StudyToolsHandler) CheckLearningFavorite(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	contentType := model.LearningContentType(c.QueryParam("content_type"))
	contentID, _ := strconv.ParseUint(c.QueryParam("content_id"), 10, 64)

	isFavorite := h.favoriteService.IsFavorite(userID, contentType, uint(contentID))

	return c.JSON(http.StatusOK, map[string]bool{"is_favorite": isFavorite})
}

// BatchCheckLearningFavorites 批量检查是否已收藏
func (h *StudyToolsHandler) BatchCheckLearningFavorites(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req struct {
		ContentType model.LearningContentType `json:"content_type"`
		ContentIDs  []uint                    `json:"content_ids"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	result, err := h.favoriteService.BatchCheck(userID, req.ContentType, req.ContentIDs)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"favorites": result})
}

// RemoveLearningFavorite 取消收藏
func (h *StudyToolsHandler) RemoveLearningFavorite(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	favoriteID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid favorite ID"})
	}

	err = h.favoriteService.RemoveByID(userID, uint(favoriteID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Favorite removed successfully"})
}

// UpdateLearningFavoriteNote 更新收藏备注
func (h *StudyToolsHandler) UpdateLearningFavoriteNote(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	favoriteID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid favorite ID"})
	}

	var req struct {
		Note string `json:"note"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	err = h.favoriteService.UpdateNote(userID, uint(favoriteID), req.Note)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Note updated successfully"})
}

// MoveLearningFavoriteToFolder 移动收藏到文件夹
func (h *StudyToolsHandler) MoveLearningFavoriteToFolder(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	favoriteID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid favorite ID"})
	}

	var req struct {
		FolderID *uint `json:"folder_id"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	err = h.favoriteService.MoveToFolder(userID, uint(favoriteID), req.FolderID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Favorite moved successfully"})
}

// =====================================================
// Learning Folder Handlers
// =====================================================

// CreateLearningFolder 创建收藏夹
func (h *StudyToolsHandler) CreateLearningFolder(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req service.CreateLearningFolderRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	folder, err := h.favoriteService.CreateFolder(userID, &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusCreated, folder.ToResponse())
}

// ListLearningFolders 获取收藏夹列表
func (h *StudyToolsHandler) ListLearningFolders(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	folders, err := h.favoriteService.GetFolders(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"folders": folders})
}

// UpdateLearningFolder 更新收藏夹
func (h *StudyToolsHandler) UpdateLearningFolder(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	folderID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid folder ID"})
	}

	var req service.UpdateLearningFolderRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	err = h.favoriteService.UpdateFolder(userID, uint(folderID), &req)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Folder updated successfully"})
}

// DeleteLearningFolder 删除收藏夹
func (h *StudyToolsHandler) DeleteLearningFolder(c echo.Context) error {
	userID := c.Get("user_id").(uint)
	folderID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid folder ID"})
	}

	err = h.favoriteService.DeleteFolder(userID, uint(folderID))
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Folder deleted successfully"})
}

// =====================================================
// Knowledge Mastery Handlers
// =====================================================

// GetKnowledgeMastery 获取知识点掌握情况
func (h *StudyToolsHandler) GetKnowledgeMastery(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var categoryID *uint
	if catIDStr := c.QueryParam("category_id"); catIDStr != "" {
		if id, err := strconv.ParseUint(catIDStr, 10, 64); err == nil {
			cid := uint(id)
			categoryID = &cid
		}
	}

	masteries, err := h.masteryService.GetMasteryList(userID, categoryID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"masteries": masteries})
}

// GetWeakPoints 获取薄弱知识点
func (h *StudyToolsHandler) GetWeakPoints(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 10
	}

	weakPoints, err := h.masteryService.GetWeakPoints(userID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"weak_points": weakPoints})
}

// GetMasteryStats 获取掌握度统计
func (h *StudyToolsHandler) GetMasteryStats(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	stats, err := h.masteryService.GetStats(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stats)
}

// UpdateKnowledgeMastery 更新知识点掌握度
func (h *StudyToolsHandler) UpdateKnowledgeMastery(c echo.Context) error {
	userID := c.Get("user_id").(uint)

	var req struct {
		KnowledgePointID uint `json:"knowledge_point_id"`
		IsCorrect        bool `json:"is_correct"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	err := h.masteryService.UpdateMastery(userID, req.KnowledgePointID, req.IsCorrect)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "Mastery updated successfully"})
}
