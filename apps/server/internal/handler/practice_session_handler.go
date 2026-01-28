package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// PracticeSessionHandler handles practice session requests
type PracticeSessionHandler struct {
	service *service.PracticeSessionService
}

// NewPracticeSessionHandler creates a new PracticeSessionHandler
func NewPracticeSessionHandler(s *service.PracticeSessionService) *PracticeSessionHandler {
	return &PracticeSessionHandler{service: s}
}

// RegisterRoutes registers routes for practice sessions
func (h *PracticeSessionHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	g := e.Group("/api/v1/practice/session")
	g.Use(authMiddleware)

	// Session CRUD
	g.POST("", h.CreateSession)              // Create new session
	g.GET("/:id", h.GetSession)              // Get session detail
	g.POST("/:id/start", h.StartSession)     // Start session
	g.POST("/:id/answer", h.SubmitAnswer)    // Submit answer
	g.POST("/:id/abandon", h.AbandonSession) // Abandon session

	// 断点续做 (Resume interrupted sessions)
	g.POST("/:id/save", h.SaveProgress)              // Auto-save progress
	g.POST("/:id/interrupt", h.InterruptSession)     // Interrupt session
	g.POST("/:id/resume", h.ResumeSession)           // Resume session
	g.GET("/resumable", h.GetResumableSessions)      // Get resumable sessions
	g.GET("/resumable/latest", h.GetLatestResumable) // Get latest resumable

	// List and stats
	g.GET("/list", h.GetUserSessions)        // Get user's sessions
	g.GET("/active", h.GetActiveSessions)    // Get active sessions
	g.GET("/stats", h.GetPracticeStats)      // Get practice stats
	g.GET("/templates", h.GetQuickTemplates) // Get quick templates
}

// CreateSession godoc
// @Summary Create a new practice session
// @Description Create a new practice session with specified configuration
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body model.CreatePracticeSessionRequest true "Session configuration"
// @Success 200 {object} model.PracticeSessionDetailResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/practice/session [post]
func (h *PracticeSessionHandler) CreateSession(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	var req model.CreatePracticeSessionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "请求参数错误"})
	}

	// Validate
	if req.QuestionCount <= 0 {
		req.QuestionCount = 10
	}
	if req.QuestionCount > 100 {
		req.QuestionCount = 100
	}

	if req.SessionType == "" {
		req.SessionType = model.PracticeSessionTypeRandom
	}

	session, err := h.service.CreateSession(userID, &req)
	if err != nil {
		switch err {
		case service.ErrNoQuestionsForSession:
			return c.JSON(http.StatusNotFound, map[string]string{"error": "没有符合条件的题目"})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}

	return c.JSON(http.StatusOK, session)
}

// GetSession godoc
// @Summary Get a practice session
// @Description Get practice session details by ID
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Session ID"
// @Success 200 {object} model.PracticeSessionDetailResponse
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/v1/practice/session/{id} [get]
func (h *PracticeSessionHandler) GetSession(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的会话ID"})
	}

	session, err := h.service.GetSession(uint(sessionID), userID)
	if err != nil {
		if err == service.ErrSessionNotFound {
			return c.JSON(http.StatusNotFound, map[string]string{"error": "练习会话不存在"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, session)
}

// StartSession godoc
// @Summary Start a practice session
// @Description Start a pending practice session
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Session ID"
// @Success 200 {object} model.PracticeSessionDetailResponse
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/v1/practice/session/{id}/start [post]
func (h *PracticeSessionHandler) StartSession(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的会话ID"})
	}

	session, err := h.service.StartSession(uint(sessionID), userID)
	if err != nil {
		switch err {
		case service.ErrSessionNotFound:
			return c.JSON(http.StatusNotFound, map[string]string{"error": "练习会话不存在"})
		case service.ErrSessionCompleted:
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "练习会话已完成"})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}

	return c.JSON(http.StatusOK, session)
}

// SubmitAnswer godoc
// @Summary Submit an answer for a session question
// @Description Submit an answer for a question in the practice session
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Session ID"
// @Param body body model.SubmitSessionAnswerRequest true "Answer submission"
// @Success 200 {object} model.QuestionDetailResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/v1/practice/session/{id}/answer [post]
func (h *PracticeSessionHandler) SubmitAnswer(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的会话ID"})
	}

	var req model.SubmitSessionAnswerRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "请求参数错误"})
	}

	if req.QuestionID == 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "题目ID不能为空"})
	}

	result, err := h.service.SubmitAnswer(uint(sessionID), userID, &req)
	if err != nil {
		switch err {
		case service.ErrSessionNotFound:
			return c.JSON(http.StatusNotFound, map[string]string{"error": "练习会话不存在"})
		case service.ErrSessionNotActive:
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "练习会话未开始或已结束"})
		case service.ErrQuestionNotInSession:
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "题目不在当前练习会话中"})
		case service.ErrSessionQuestionAnswered:
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "该题目已回答"})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}

	return c.JSON(http.StatusOK, result)
}

// AbandonSession godoc
// @Summary Abandon a practice session
// @Description Abandon an active or pending practice session
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Session ID"
// @Success 200 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Router /api/v1/practice/session/{id}/abandon [post]
func (h *PracticeSessionHandler) AbandonSession(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的会话ID"})
	}

	err = h.service.AbandonSession(uint(sessionID), userID)
	if err != nil {
		switch err {
		case service.ErrSessionNotFound:
			return c.JSON(http.StatusNotFound, map[string]string{"error": "练习会话不存在"})
		case service.ErrSessionCompleted:
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "练习会话已完成，无法放弃"})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "已放弃练习"})
}

// GetUserSessions godoc
// @Summary Get user's practice sessions
// @Description Get a list of user's practice sessions with pagination
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]string
// @Router /api/v1/practice/session/list [get]
func (h *PracticeSessionHandler) GetUserSessions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	sessions, total, err := h.service.GetUserSessions(userID, page, pageSize)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"data":      sessions,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// GetActiveSessions godoc
// @Summary Get user's active practice sessions
// @Description Get a list of user's active (pending or in-progress) practice sessions
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} model.PracticeSessionResponse
// @Failure 401 {object} map[string]string
// @Router /api/v1/practice/session/active [get]
func (h *PracticeSessionHandler) GetActiveSessions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	sessions, err := h.service.GetActiveSessions(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, sessions)
}

// GetPracticeStats godoc
// @Summary Get user's practice statistics
// @Description Get user's overall practice statistics
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} repository.PracticeStats
// @Failure 401 {object} map[string]string
// @Router /api/v1/practice/session/stats [get]
func (h *PracticeSessionHandler) GetPracticeStats(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	stats, err := h.service.GetPracticeStats(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stats)
}

// GetQuickTemplates godoc
// @Summary Get quick practice templates
// @Description Get predefined quick practice templates
// @Tags Practice Session
// @Accept json
// @Produce json
// @Success 200 {array} model.PracticeTemplate
// @Router /api/v1/practice/session/templates [get]
func (h *PracticeSessionHandler) GetQuickTemplates(c echo.Context) error {
	templates := h.service.GetQuickTemplates()
	return c.JSON(http.StatusOK, templates)
}

// =====================================================
// 断点续做功能
// =====================================================

// SaveProgress godoc
// @Summary Save session progress (auto-save)
// @Description Auto-save the current progress of a practice session
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Session ID"
// @Param body body model.SaveSessionProgressRequest true "Progress data"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/v1/practice/session/{id}/save [post]
func (h *PracticeSessionHandler) SaveProgress(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的会话ID"})
	}

	var req model.SaveSessionProgressRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "请求参数错误"})
	}

	err = h.service.SaveProgress(uint(sessionID), userID, &req)
	if err != nil {
		switch err {
		case service.ErrSessionNotFound:
			return c.JSON(http.StatusNotFound, map[string]string{"error": "练习会话不存在"})
		case service.ErrSessionNotActive:
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "练习会话未开始或已结束"})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "进度已保存"})
}

// InterruptSession godoc
// @Summary Interrupt a practice session
// @Description Mark a session as interrupted (e.g., user closed the page)
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Session ID"
// @Param body body model.InterruptSessionRequest true "Interrupt data"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/v1/practice/session/{id}/interrupt [post]
func (h *PracticeSessionHandler) InterruptSession(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的会话ID"})
	}

	var req model.InterruptSessionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "请求参数错误"})
	}

	err = h.service.InterruptSession(uint(sessionID), userID, &req)
	if err != nil {
		switch err {
		case service.ErrSessionNotFound:
			return c.JSON(http.StatusNotFound, map[string]string{"error": "练习会话不存在"})
		case service.ErrSessionNotActive:
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "练习会话未开始或已结束"})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "会话已中断"})
}

// ResumeSession godoc
// @Summary Resume an interrupted session
// @Description Resume a previously interrupted practice session
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Session ID"
// @Success 200 {object} model.PracticeSessionDetailResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/v1/practice/session/{id}/resume [post]
func (h *PracticeSessionHandler) ResumeSession(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	sessionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "无效的会话ID"})
	}

	session, err := h.service.ResumeSession(uint(sessionID), userID)
	if err != nil {
		switch err {
		case service.ErrSessionNotFound:
			return c.JSON(http.StatusNotFound, map[string]string{"error": "练习会话不存在"})
		case service.ErrSessionNotActive:
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "该会话无法恢复"})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
		}
	}

	return c.JSON(http.StatusOK, session)
}

// GetResumableSessions godoc
// @Summary Get all resumable sessions
// @Description Get a list of all sessions that can be resumed
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {array} model.PracticeSessionResponse
// @Failure 401 {object} map[string]string
// @Router /api/v1/practice/session/resumable [get]
func (h *PracticeSessionHandler) GetResumableSessions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	sessions, err := h.service.GetResumableSessions(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, sessions)
}

// GetLatestResumable godoc
// @Summary Get the latest resumable session
// @Description Get the most recent session that can be resumed (for auto-prompt)
// @Tags Practice Session
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} model.PracticeSessionDetailResponse
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /api/v1/practice/session/resumable/latest [get]
func (h *PracticeSessionHandler) GetLatestResumable(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未授权"})
	}

	session, err := h.service.GetLatestResumable(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if session == nil {
		return c.JSON(http.StatusOK, nil)
	}

	return c.JSON(http.StatusOK, session)
}
