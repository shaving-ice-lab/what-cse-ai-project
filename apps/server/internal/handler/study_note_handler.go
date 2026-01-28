package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

// StudyNoteHandler handles study note and wrong question related requests
type StudyNoteHandler struct {
	studyNoteService *service.StudyNoteService
}

// NewStudyNoteHandler creates a new study note handler
func NewStudyNoteHandler(studyNoteService *service.StudyNoteService) *StudyNoteHandler {
	return &StudyNoteHandler{
		studyNoteService: studyNoteService,
	}
}

// RegisterRoutes registers study note routes
func (h *StudyNoteHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	// Wrong questions routes (protected)
	wrongGroup := e.Group("/api/v1/wrong-questions")
	wrongGroup.Use(authMiddleware)
	wrongGroup.GET("", h.GetWrongQuestions)
	wrongGroup.GET("/stats", h.GetWrongQuestionStats)
	wrongGroup.GET("/need-review", h.GetNeedReviewQuestions)
	wrongGroup.GET("/ids", h.GetWrongQuestionIDs)
	wrongGroup.GET("/:id", h.GetWrongQuestionByID)
	wrongGroup.POST("/:questionId/add", h.AddWrongQuestion)
	wrongGroup.PUT("/:id/note", h.UpdateWrongQuestionNote)
	wrongGroup.PUT("/:id/reason", h.UpdateWrongQuestionErrorReason)
	wrongGroup.PUT("/:id/review", h.RecordReview)
	wrongGroup.PUT("/:id/mastered", h.MarkAsMastered)
	wrongGroup.DELETE("/:id", h.RemoveWrongQuestion)
	wrongGroup.PUT("/:id/restore", h.RestoreWrongQuestion)
	wrongGroup.POST("/batch-mastered", h.BatchMarkAsMastered)
	wrongGroup.POST("/export", h.ExportWrongQuestions)

	// Study notes routes
	noteGroup := e.Group("/api/v1/notes")
	// Public routes
	noteGroup.GET("/public", h.GetPublicNotes)
	noteGroup.GET("/search", h.SearchNotes)
	noteGroup.GET("/:id", h.GetNoteByID)
	noteGroup.GET("/related/:noteType/:relatedId", h.GetNotesByRelated)
	noteGroup.GET("/video/:relatedId", h.GetVideoNotes)

	// Protected routes
	noteGroup.POST("", h.CreateNote, authMiddleware)
	noteGroup.PUT("/:id", h.UpdateNote, authMiddleware)
	noteGroup.DELETE("/:id", h.DeleteNote, authMiddleware)
	noteGroup.GET("/my", h.GetMyNotes, authMiddleware)
	noteGroup.GET("/my/stats", h.GetMyNoteStats, authMiddleware)
	noteGroup.POST("/:id/like", h.LikeNote, authMiddleware)
	noteGroup.DELETE("/:id/like", h.UnlikeNote, authMiddleware)
}

// =====================================================
// Wrong Question Handlers
// =====================================================

// GetWrongQuestions godoc
// @Summary Get user's wrong questions
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param category_id query int false "Category ID"
// @Param status query string false "Status (active/mastered/removed)"
// @Param error_reason query string false "Error reason"
// @Param need_review query bool false "Only need review"
// @Param keyword query string false "Search keyword"
// @Param start_date query string false "Start date"
// @Param end_date query string false "End date"
// @Param sort_by query string false "Sort by (wrong_count/last_wrong_at/created_at)"
// @Param sort_order query string false "Sort order (asc/desc)"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/wrong-questions [get]
func (h *StudyNoteHandler) GetWrongQuestions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	params := &repository.WrongQuestionQueryParams{}
	if err := c.Bind(params); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	// Parse additional params
	if categoryID, _ := strconv.ParseUint(c.QueryParam("category_id"), 10, 32); categoryID > 0 {
		params.CategoryID = uint(categoryID)
	}
	if page, _ := strconv.Atoi(c.QueryParam("page")); page > 0 {
		params.Page = page
	}
	if pageSize, _ := strconv.Atoi(c.QueryParam("page_size")); pageSize > 0 {
		params.PageSize = pageSize
	}
	params.Status = c.QueryParam("status")
	params.ErrorReason = c.QueryParam("error_reason")
	params.NeedReview = c.QueryParam("need_review") == "true"
	params.Keyword = c.QueryParam("keyword")
	params.StartDate = c.QueryParam("start_date")
	params.EndDate = c.QueryParam("end_date")
	params.SortBy = c.QueryParam("sort_by")
	params.SortOrder = c.QueryParam("sort_order")

	wrongs, total, err := h.studyNoteService.GetWrongQuestions(userID, params)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"items": wrongs,
		"total": total,
		"page":  params.Page,
	})
}

// GetWrongQuestionByID godoc
// @Summary Get wrong question by ID
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param id path int true "Wrong question ID"
// @Success 200 {object} model.WrongQuestionResponse
// @Router /api/v1/wrong-questions/{id} [get]
func (h *StudyNoteHandler) GetWrongQuestionByID(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	wrong, err := h.studyNoteService.GetWrongQuestionByID(uint(id), userID)
	if err != nil {
		if err == service.ErrWrongQuestionNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, wrong)
}

// GetWrongQuestionStats godoc
// @Summary Get wrong question statistics
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Success 200 {object} model.WrongQuestionStats
// @Router /api/v1/wrong-questions/stats [get]
func (h *StudyNoteHandler) GetWrongQuestionStats(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	stats, err := h.studyNoteService.GetWrongQuestionStats(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stats)
}

// GetNeedReviewQuestions godoc
// @Summary Get questions that need review
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param limit query int false "Limit"
// @Success 200 {array} model.WrongQuestionResponse
// @Router /api/v1/wrong-questions/need-review [get]
func (h *StudyNoteHandler) GetNeedReviewQuestions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 20
	}

	wrongs, err := h.studyNoteService.GetNeedReviewQuestions(userID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, wrongs)
}

// GetWrongQuestionIDs godoc
// @Summary Get wrong question IDs
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param status query string false "Status filter"
// @Success 200 {array} uint
// @Router /api/v1/wrong-questions/ids [get]
func (h *StudyNoteHandler) GetWrongQuestionIDs(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	status := c.QueryParam("status")
	ids, err := h.studyNoteService.GetWrongQuestionIDs(userID, status)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, ids)
}

// AddWrongQuestion godoc
// @Summary Add question to wrong question book
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param questionId path int true "Question ID"
// @Success 200 {object} model.WrongQuestionResponse
// @Router /api/v1/wrong-questions/{questionId}/add [post]
func (h *StudyNoteHandler) AddWrongQuestion(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	questionID, err := strconv.ParseUint(c.Param("questionId"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的题目ID"})
	}

	wrong, err := h.studyNoteService.AddWrongQuestion(userID, uint(questionID))
	if err != nil {
		if err == service.ErrQuestionNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, wrong.ToResponse())
}

// UpdateWrongQuestionNote godoc
// @Summary Update wrong question note
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param id path int true "Wrong question ID"
// @Param body body object{note=string} true "Note content"
// @Success 200 {object} map[string]string
// @Router /api/v1/wrong-questions/{id}/note [put]
func (h *StudyNoteHandler) UpdateWrongQuestionNote(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	var req struct {
		Note string `json:"note"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	if err := h.studyNoteService.UpdateWrongQuestionNote(uint(id), userID, req.Note); err != nil {
		if err == service.ErrWrongQuestionNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "更新成功"})
}

// UpdateWrongQuestionErrorReason godoc
// @Summary Update wrong question error reason
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param id path int true "Wrong question ID"
// @Param body body object{error_reason=string} true "Error reason"
// @Success 200 {object} map[string]string
// @Router /api/v1/wrong-questions/{id}/reason [put]
func (h *StudyNoteHandler) UpdateWrongQuestionErrorReason(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	var req struct {
		ErrorReason string `json:"error_reason"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	if err := h.studyNoteService.UpdateWrongQuestionErrorReason(uint(id), userID, req.ErrorReason); err != nil {
		if err == service.ErrWrongQuestionNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "更新成功"})
}

// RecordReview godoc
// @Summary Record wrong question review
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param id path int true "Wrong question ID"
// @Param body body object{is_correct=bool} true "Review result"
// @Success 200 {object} map[string]string
// @Router /api/v1/wrong-questions/{id}/review [put]
func (h *StudyNoteHandler) RecordReview(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	var req service.RecordReviewRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	if err := h.studyNoteService.RecordReview(uint(id), userID, req.IsCorrect); err != nil {
		if err == service.ErrWrongQuestionNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "记录成功"})
}

// MarkAsMastered godoc
// @Summary Mark wrong question as mastered
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param id path int true "Wrong question ID"
// @Success 200 {object} map[string]string
// @Router /api/v1/wrong-questions/{id}/mastered [put]
func (h *StudyNoteHandler) MarkAsMastered(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	if err := h.studyNoteService.MarkAsMastered(uint(id), userID); err != nil {
		if err == service.ErrWrongQuestionNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "标记成功"})
}

// RemoveWrongQuestion godoc
// @Summary Remove wrong question
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param id path int true "Wrong question ID"
// @Success 200 {object} map[string]string
// @Router /api/v1/wrong-questions/{id} [delete]
func (h *StudyNoteHandler) RemoveWrongQuestion(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	if err := h.studyNoteService.RemoveWrongQuestion(uint(id), userID); err != nil {
		if err == service.ErrWrongQuestionNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "移除成功"})
}

// RestoreWrongQuestion godoc
// @Summary Restore removed wrong question
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param id path int true "Wrong question ID"
// @Success 200 {object} map[string]string
// @Router /api/v1/wrong-questions/{id}/restore [put]
func (h *StudyNoteHandler) RestoreWrongQuestion(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	if err := h.studyNoteService.RestoreWrongQuestion(uint(id), userID); err != nil {
		if err == service.ErrWrongQuestionNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "恢复成功"})
}

// BatchMarkAsMastered godoc
// @Summary Batch mark wrong questions as mastered
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param body body object{ids=[]uint} true "Wrong question IDs"
// @Success 200 {object} map[string]string
// @Router /api/v1/wrong-questions/batch-mastered [post]
func (h *StudyNoteHandler) BatchMarkAsMastered(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	var req struct {
		IDs []uint `json:"ids"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	if len(req.IDs) == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "请选择要标记的错题"})
	}

	if err := h.studyNoteService.BatchMarkAsMastered(req.IDs, userID); err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "批量标记成功"})
}

// ExportWrongQuestions godoc
// @Summary Export wrong questions
// @Tags WrongQuestions
// @Accept json
// @Produce json
// @Param body body model.WrongQuestionExportRequest true "Export options"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/wrong-questions/export [post]
func (h *StudyNoteHandler) ExportWrongQuestions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	var req struct {
		Format       string `json:"format"`
		CategoryID   uint   `json:"category_id"`
		Status       string `json:"status"`
		IncludeNote  bool   `json:"include_note"`
		IncludeStats bool   `json:"include_stats"`
		StartDate    string `json:"start_date"`
		EndDate      string `json:"end_date"`
		IDs          []uint `json:"ids"`
	}
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	// Default format is JSON
	if req.Format == "" {
		req.Format = "json"
	}

	// Build export request
	exportReq := &service.WrongQuestionExportRequest{
		Format:       req.Format,
		CategoryID:   req.CategoryID,
		Status:       req.Status,
		IncludeNote:  req.IncludeNote,
		IncludeStats: req.IncludeStats,
		StartDate:    req.StartDate,
		EndDate:      req.EndDate,
		IDs:          req.IDs,
	}

	// Get export data
	data, err := h.studyNoteService.ExportWrongQuestions(userID, exportReq)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// Format based on requested format
	switch req.Format {
	case "csv":
		content := h.studyNoteService.FormatExportAsCSV(data)
		c.Response().Header().Set("Content-Type", "text/csv; charset=utf-8")
		c.Response().Header().Set("Content-Disposition", "attachment; filename=wrong_questions.csv")
		return c.String(http.StatusOK, "\xEF\xBB\xBF"+content) // UTF-8 BOM for Excel

	case "markdown", "md":
		content := h.studyNoteService.FormatExportAsMarkdown(data)
		c.Response().Header().Set("Content-Type", "text/markdown; charset=utf-8")
		c.Response().Header().Set("Content-Disposition", "attachment; filename=wrong_questions.md")
		return c.String(http.StatusOK, content)

	case "html":
		content := h.studyNoteService.FormatExportAsHTML(data)
		c.Response().Header().Set("Content-Type", "text/html; charset=utf-8")
		c.Response().Header().Set("Content-Disposition", "attachment; filename=wrong_questions.html")
		return c.String(http.StatusOK, content)

	default: // json
		return c.JSON(http.StatusOK, map[string]interface{}{
			"data": data,
		})
	}
}

// =====================================================
// Study Note Handlers
// =====================================================

// CreateNote godoc
// @Summary Create a study note
// @Tags Notes
// @Accept json
// @Produce json
// @Param body body service.CreateNoteRequest true "Note content"
// @Success 200 {object} model.StudyNoteResponse
// @Router /api/v1/notes [post]
func (h *StudyNoteHandler) CreateNote(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	var req service.CreateNoteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	if req.Title == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "标题不能为空"})
	}
	if req.NoteType == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "笔记类型不能为空"})
	}

	note, err := h.studyNoteService.CreateNote(userID, &req)
	if err != nil {
		if err == service.ErrInvalidNoteType {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, note)
}

// UpdateNote godoc
// @Summary Update a study note
// @Tags Notes
// @Accept json
// @Produce json
// @Param id path int true "Note ID"
// @Param body body service.UpdateNoteRequest true "Update content"
// @Success 200 {object} model.StudyNoteResponse
// @Router /api/v1/notes/{id} [put]
func (h *StudyNoteHandler) UpdateNote(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	var req service.UpdateNoteRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	note, err := h.studyNoteService.UpdateNote(uint(id), userID, &req)
	if err != nil {
		if err == service.ErrNoteNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrNoteNotOwner {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, note)
}

// DeleteNote godoc
// @Summary Delete a study note
// @Tags Notes
// @Accept json
// @Produce json
// @Param id path int true "Note ID"
// @Success 200 {object} map[string]string
// @Router /api/v1/notes/{id} [delete]
func (h *StudyNoteHandler) DeleteNote(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	if err := h.studyNoteService.DeleteNote(uint(id), userID); err != nil {
		if err == service.ErrNoteNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrNoteNotOwner {
			return c.JSON(http.StatusForbidden, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "删除成功"})
}

// GetNoteByID godoc
// @Summary Get note by ID
// @Tags Notes
// @Accept json
// @Produce json
// @Param id path int true "Note ID"
// @Success 200 {object} model.StudyNoteResponse
// @Router /api/v1/notes/{id} [get]
func (h *StudyNoteHandler) GetNoteByID(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	userID := getUserIDFromContext(c)

	note, err := h.studyNoteService.GetNoteByID(uint(id), userID)
	if err != nil {
		if err == service.ErrNoteNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, note)
}

// GetMyNotes godoc
// @Summary Get my notes
// @Tags Notes
// @Accept json
// @Produce json
// @Param note_type query string false "Note type"
// @Param keyword query string false "Search keyword"
// @Param sort_by query string false "Sort by"
// @Param sort_order query string false "Sort order"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/notes/my [get]
func (h *StudyNoteHandler) GetMyNotes(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	params := &repository.NoteQueryParams{}
	params.NoteType = c.QueryParam("note_type")
	params.Keyword = c.QueryParam("keyword")
	params.SortBy = c.QueryParam("sort_by")
	params.SortOrder = c.QueryParam("sort_order")
	if page, _ := strconv.Atoi(c.QueryParam("page")); page > 0 {
		params.Page = page
	}
	if pageSize, _ := strconv.Atoi(c.QueryParam("page_size")); pageSize > 0 {
		params.PageSize = pageSize
	}

	notes, total, err := h.studyNoteService.GetUserNotes(userID, params)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"items": notes,
		"total": total,
		"page":  params.Page,
	})
}

// GetPublicNotes godoc
// @Summary Get public notes
// @Tags Notes
// @Accept json
// @Produce json
// @Param note_type query string false "Note type"
// @Param keyword query string false "Search keyword"
// @Param sort_by query string false "Sort by"
// @Param sort_order query string false "Sort order"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/notes/public [get]
func (h *StudyNoteHandler) GetPublicNotes(c echo.Context) error {
	params := &repository.NoteQueryParams{}
	params.NoteType = c.QueryParam("note_type")
	params.Keyword = c.QueryParam("keyword")
	params.SortBy = c.QueryParam("sort_by")
	params.SortOrder = c.QueryParam("sort_order")
	if page, _ := strconv.Atoi(c.QueryParam("page")); page > 0 {
		params.Page = page
	}
	if pageSize, _ := strconv.Atoi(c.QueryParam("page_size")); pageSize > 0 {
		params.PageSize = pageSize
	}

	userID := getUserIDFromContext(c)

	notes, total, err := h.studyNoteService.GetPublicNotes(params, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"items": notes,
		"total": total,
		"page":  params.Page,
	})
}

// SearchNotes godoc
// @Summary Search notes
// @Tags Notes
// @Accept json
// @Produce json
// @Param keyword query string true "Search keyword"
// @Param note_type query string false "Note type"
// @Param sort_by query string false "Sort by"
// @Param sort_order query string false "Sort order"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/notes/search [get]
func (h *StudyNoteHandler) SearchNotes(c echo.Context) error {
	keyword := c.QueryParam("keyword")
	if keyword == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "请输入搜索关键词"})
	}

	params := &repository.NoteQueryParams{}
	params.NoteType = c.QueryParam("note_type")
	params.SortBy = c.QueryParam("sort_by")
	params.SortOrder = c.QueryParam("sort_order")
	if page, _ := strconv.Atoi(c.QueryParam("page")); page > 0 {
		params.Page = page
	}
	if pageSize, _ := strconv.Atoi(c.QueryParam("page_size")); pageSize > 0 {
		params.PageSize = pageSize
	}

	userID := getUserIDFromContext(c)

	notes, total, err := h.studyNoteService.SearchNotes(keyword, params, userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"items": notes,
		"total": total,
		"page":  params.Page,
	})
}

// GetNotesByRelated godoc
// @Summary Get notes by related entity
// @Tags Notes
// @Accept json
// @Produce json
// @Param noteType path string true "Note type"
// @Param relatedId path int true "Related ID"
// @Success 200 {array} model.StudyNoteResponse
// @Router /api/v1/notes/related/{noteType}/{relatedId} [get]
func (h *StudyNoteHandler) GetNotesByRelated(c echo.Context) error {
	noteType := c.Param("noteType")
	relatedID, err := strconv.ParseUint(c.Param("relatedId"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的关联ID"})
	}

	userID := getUserIDFromContext(c)

	notes, err := h.studyNoteService.GetNotesByRelated(noteType, uint(relatedID), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, notes)
}

// GetVideoNotes godoc
// @Summary Get video notes with timeline markers
// @Tags Notes
// @Accept json
// @Produce json
// @Param relatedId path int true "Video/Chapter ID"
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/notes/video/{relatedId} [get]
func (h *StudyNoteHandler) GetVideoNotes(c echo.Context) error {
	relatedID, err := strconv.ParseUint(c.Param("relatedId"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的视频ID"})
	}

	userID := getUserIDFromContext(c)

	notes, markers, err := h.studyNoteService.GetVideoNotes(uint(relatedID), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"notes":   notes,
		"markers": markers,
	})
}

// GetMyNoteStats godoc
// @Summary Get my note statistics
// @Tags Notes
// @Accept json
// @Produce json
// @Success 200 {object} model.UserNoteStats
// @Router /api/v1/notes/my/stats [get]
func (h *StudyNoteHandler) GetMyNoteStats(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	stats, err := h.studyNoteService.GetUserNoteStats(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stats)
}

// LikeNote godoc
// @Summary Like a note
// @Tags Notes
// @Accept json
// @Produce json
// @Param id path int true "Note ID"
// @Success 200 {object} map[string]string
// @Router /api/v1/notes/{id}/like [post]
func (h *StudyNoteHandler) LikeNote(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	if err := h.studyNoteService.LikeNote(uint(id), userID); err != nil {
		if err == service.ErrNoteNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": err.Error()})
		}
		if err == service.ErrNoteAlreadyLiked {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "点赞成功"})
}

// UnlikeNote godoc
// @Summary Unlike a note
// @Tags Notes
// @Accept json
// @Produce json
// @Param id path int true "Note ID"
// @Success 200 {object} map[string]string
// @Router /api/v1/notes/{id}/like [delete]
func (h *StudyNoteHandler) UnlikeNote(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的ID"})
	}

	if err := h.studyNoteService.UnlikeNote(uint(id), userID); err != nil {
		if err == service.ErrNoteNotLiked {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "取消点赞成功"})
}
