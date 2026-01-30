package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// DailyPracticeHandler handles daily practice requests
type DailyPracticeHandler struct {
	service *service.DailyPracticeService
}

// NewDailyPracticeHandler creates a new DailyPracticeHandler
func NewDailyPracticeHandler(s *service.DailyPracticeService) *DailyPracticeHandler {
	return &DailyPracticeHandler{service: s}
}

// RegisterRoutes registers routes for daily practice
func (h *DailyPracticeHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	g := e.Group("/api/v1/practice")
	g.Use(authMiddleware)

	// Daily practice endpoints
	g.GET("/daily", h.GetTodayPractice)     // Get today's practice
	g.POST("/daily/answer", h.SubmitAnswer) // Submit answer

	// Statistics endpoints
	g.GET("/streak", h.GetUserStreak)              // Get user streak
	g.GET("/history", h.GetUserHistory)            // Get practice history
	g.GET("/calendar", h.GetUserCalendar)          // Get practice calendar
	g.GET("/weak-categories", h.GetWeakCategories) // Get weak categories
}

// GetTodayPractice godoc
// @Summary Get today's daily practice
// @Description Get today's daily practice questions. Creates new practice if not exists.
// @Tags Practice
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} model.DailyPracticeDetailResponse
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/practice/daily [get]
func (h *DailyPracticeHandler) GetTodayPractice(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{"code": 401, "message": "未授权"})
	}

	practice, err := h.service.GetTodayPractice(userID)
	if err != nil {
		if err == service.ErrNoQuestionsAvailable {
			return c.JSON(http.StatusNotFound, map[string]interface{}{"code": 404, "message": "暂无可用题目，请稍后再试"})
		}
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"code": 500, "message": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": practice, "message": "success"})
}

// SubmitAnswer godoc
// @Summary Submit answer for daily practice
// @Description Submit an answer for a question in today's daily practice
// @Tags Practice
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body model.SubmitDailyAnswerRequest true "Answer submission"
// @Success 200 {object} model.QuestionDetailResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/practice/daily/answer [post]
func (h *DailyPracticeHandler) SubmitAnswer(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{"code": 401, "message": "未授权"})
	}

	var req model.SubmitDailyAnswerRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"code": 400, "message": "请求参数错误"})
	}

	if req.QuestionID == 0 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"code": 400, "message": "题目ID不能为空"})
	}

	result, err := h.service.SubmitAnswer(userID, &req)
	if err != nil {
		switch err {
		case service.ErrDailyPracticeNotFound:
			return c.JSON(http.StatusNotFound, map[string]interface{}{"code": 404, "message": "今日练习不存在，请先获取今日练习"})
		case service.ErrDailyPracticeCompleted:
			return c.JSON(http.StatusBadRequest, map[string]interface{}{"code": 400, "message": "今日练习已完成"})
		case service.ErrQuestionNotInPractice:
			return c.JSON(http.StatusBadRequest, map[string]interface{}{"code": 400, "message": "题目不在今日练习中"})
		case service.ErrQuestionAlreadyAnswered:
			return c.JSON(http.StatusBadRequest, map[string]interface{}{"code": 400, "message": "该题目已回答"})
		default:
			return c.JSON(http.StatusInternalServerError, map[string]interface{}{"code": 500, "message": err.Error()})
		}
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": result, "message": "success"})
}

// GetUserStreak godoc
// @Summary Get user's practice streak
// @Description Get user's consecutive practice days and statistics
// @Tags Practice
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} model.UserDailyStreakResponse
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/practice/streak [get]
func (h *DailyPracticeHandler) GetUserStreak(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{"code": 401, "message": "未授权"})
	}

	streak, err := h.service.GetUserStreak(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"code": 500, "message": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": streak, "message": "success"})
}

// GetUserHistory godoc
// @Summary Get user's practice history
// @Description Get user's daily practice history with pagination
// @Tags Practice
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} map[string]interface{}
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/practice/history [get]
func (h *DailyPracticeHandler) GetUserHistory(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{"code": 401, "message": "未授权"})
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	history, total, err := h.service.GetUserHistory(userID, page, pageSize)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"code": 500, "message": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"data":      history,
			"total":     total,
			"page":      page,
			"page_size": pageSize,
		},
	})
}

// GetUserCalendar godoc
// @Summary Get user's practice calendar
// @Description Get user's practice calendar for a specific month
// @Tags Practice
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param year query int false "Year" default(current year)
// @Param month query int false "Month (1-12)" default(current month)
// @Success 200 {array} model.DailyPracticeCalendarItem
// @Failure 401 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/practice/calendar [get]
func (h *DailyPracticeHandler) GetUserCalendar(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{"code": 401, "message": "未授权"})
	}

	// Default to current year and month
	now := time.Now()
	year, _ := strconv.Atoi(c.QueryParam("year"))
	month, _ := strconv.Atoi(c.QueryParam("month"))

	if year == 0 {
		year = now.Year()
	}
	if month == 0 {
		month = int(now.Month())
	}

	if month < 1 || month > 12 {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{"code": 400, "message": "月份无效"})
	}

	calendar, err := h.service.GetUserCalendar(userID, year, month)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"code": 500, "message": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"year":     year,
			"month":    month,
			"calendar": calendar,
		},
	})
}

// GetWeakCategories godoc
// @Summary Get user's weak categories
// @Description Get user's weak categories with low correct rate
// @Tags Practice
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Limit" default(10)
// @Success 200 {array} model.WeakCategoryResponse
// @Failure 401 {object} map[string]string
// @Failure 500 {object} map[string]string
// @Router /api/v1/practice/weak-categories [get]
func (h *DailyPracticeHandler) GetWeakCategories(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]interface{}{"code": 401, "message": "未授权"})
	}

	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 || limit > 50 {
		limit = 10
	}

	categories, err := h.service.GetWeakCategories(userID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{"code": 500, "message": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": categories, "message": "success"})
}

