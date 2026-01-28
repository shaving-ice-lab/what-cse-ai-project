package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// LearningStatsHandler 学习统计处理器
type LearningStatsHandler struct {
	statsService *service.LearningStatsService
}

// NewLearningStatsHandler 创建学习统计处理器
func NewLearningStatsHandler(statsService *service.LearningStatsService) *LearningStatsHandler {
	return &LearningStatsHandler{statsService: statsService}
}

// RegisterRoutes 注册路由
func (h *LearningStatsHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	// 学习报告相关路由（需要登录）
	reports := e.Group("/api/v1/learning/reports")
	reports.Use(authMiddleware)

	// 每日报告
	reports.GET("/daily", h.GetDailyReport)
	reports.GET("/daily/:date", h.GetDailyReportByDate)

	// 每周报告
	reports.GET("/weekly", h.GetWeeklyReport)
	reports.GET("/weekly/:week_start", h.GetWeeklyReportByDate)

	// 能力分析
	reports.GET("/ability", h.GetAbilityReport)
	reports.GET("/ability/ai", h.GetAIAbilityReport) // AI增强版能力分析

	// 学习统计概览
	stats := e.Group("/api/v1/learning/stats")
	stats.Use(authMiddleware)
	stats.GET("", h.GetUserStats)
	stats.GET("/overview", h.GetUserStats)

	// 学习目标
	goals := e.Group("/api/v1/learning/goals")
	goals.Use(authMiddleware)
	goals.GET("", h.GetUserGoal)
	goals.PUT("", h.UpdateUserGoal)

	// 排行榜（公开）
	leaderboards := e.Group("/api/v1/learning/leaderboards")
	leaderboards.GET("/daily/:metric", h.GetDailyLeaderboard)
	leaderboards.GET("/weekly/:metric", h.GetWeeklyLeaderboard)
	leaderboards.GET("/consecutive", h.GetConsecutiveLeaderboard)
	// 需要登录的排行榜路由（获取用户排名）
	leaderboards.GET("/my-rank", h.GetMyRank, authMiddleware)

	// 成就
	achievements := e.Group("/api/v1/learning/achievements")
	achievements.Use(authMiddleware)
	achievements.GET("", h.GetUserAchievements)

	// 记录学习（内部使用）
	record := e.Group("/api/v1/learning/record")
	record.Use(authMiddleware)
	record.POST("/study", h.RecordStudy)
	record.POST("/question", h.RecordQuestion)
}

// GetDailyReport 获取今日学习报告
// @Summary 获取今日学习报告
// @Tags 学习报告
// @Accept json
// @Produce json
// @Success 200 {object} model.DailyLearningReportResponse
// @Router /api/v1/learning/reports/daily [get]
func (h *LearningStatsHandler) GetDailyReport(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	report, err := h.statsService.GetDailyReport(userID, time.Now())
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, report)
}

// GetDailyReportByDate 获取指定日期学习报告
// @Summary 获取指定日期学习报告
// @Tags 学习报告
// @Accept json
// @Produce json
// @Param date path string true "日期 (YYYY-MM-DD)"
// @Success 200 {object} model.DailyLearningReportResponse
// @Router /api/v1/learning/reports/daily/{date} [get]
func (h *LearningStatsHandler) GetDailyReportByDate(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	dateStr := c.Param("date")
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "日期格式错误，请使用 YYYY-MM-DD 格式"})
	}

	report, err := h.statsService.GetDailyReport(userID, date)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, report)
}

// GetWeeklyReport 获取本周学习报告
// @Summary 获取本周学习报告
// @Tags 学习报告
// @Accept json
// @Produce json
// @Success 200 {object} model.WeeklyLearningReportResponse
// @Router /api/v1/learning/reports/weekly [get]
func (h *LearningStatsHandler) GetWeeklyReport(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	// 计算本周开始日期（周一）
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	weekStart := now.AddDate(0, 0, -(weekday - 1))
	weekStart = time.Date(weekStart.Year(), weekStart.Month(), weekStart.Day(), 0, 0, 0, 0, now.Location())

	report, err := h.statsService.GetWeeklyReport(userID, weekStart)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, report)
}

// GetWeeklyReportByDate 获取指定周学习报告
// @Summary 获取指定周学习报告
// @Tags 学习报告
// @Accept json
// @Produce json
// @Param week_start path string true "周一日期 (YYYY-MM-DD)"
// @Success 200 {object} model.WeeklyLearningReportResponse
// @Router /api/v1/learning/reports/weekly/{week_start} [get]
func (h *LearningStatsHandler) GetWeeklyReportByDate(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	dateStr := c.Param("week_start")
	weekStart, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "日期格式错误，请使用 YYYY-MM-DD 格式"})
	}

	report, err := h.statsService.GetWeeklyReport(userID, weekStart)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, report)
}

// GetAbilityReport 获取能力分析报告
// @Summary 获取能力分析报告
// @Tags 学习报告
// @Accept json
// @Produce json
// @Success 200 {object} model.AbilityReportResponse
// @Router /api/v1/learning/reports/ability [get]
func (h *LearningStatsHandler) GetAbilityReport(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	report, err := h.statsService.GetAbilityReport(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, report)
}

// GetAIAbilityReport 获取AI增强版能力分析报告
// @Summary 获取AI增强版能力分析报告
// @Description 包含AI生成的雷达图解读、对标分析和提升建议
// @Tags 学习报告
// @Accept json
// @Produce json
// @Success 200 {object} model.AIAbilityReportResponse
// @Router /api/v1/learning/reports/ability/ai [get]
func (h *LearningStatsHandler) GetAIAbilityReport(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	report, err := h.statsService.GetAIAbilityReport(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, report)
}

// GetUserStats 获取用户学习统计概览
// @Summary 获取用户学习统计概览
// @Tags 学习报告
// @Accept json
// @Produce json
// @Success 200 {object} service.UserLearningOverview
// @Router /api/v1/learning/stats [get]
func (h *LearningStatsHandler) GetUserStats(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	stats, err := h.statsService.GetUserStats(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, stats)
}

// GetUserGoal 获取用户学习目标
// @Summary 获取用户学习目标
// @Tags 学习报告
// @Accept json
// @Produce json
// @Success 200 {object} model.UserLearningGoal
// @Router /api/v1/learning/goals [get]
func (h *LearningStatsHandler) GetUserGoal(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	goal, err := h.statsService.GetUserGoal(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, goal)
}

// UpdateUserGoalRequest 更新学习目标请求
type UpdateUserGoalRequest struct {
	DailyMinutes     int        `json:"daily_minutes"`
	DailyQuestions   int        `json:"daily_questions"`
	WeeklyCourseDays int        `json:"weekly_course_days"`
	TargetExamDate   *time.Time `json:"target_exam_date"`
	TargetScore      float64    `json:"target_score"`
}

// UpdateUserGoal 更新用户学习目标
// @Summary 更新用户学习目标
// @Tags 学习报告
// @Accept json
// @Produce json
// @Param body body UpdateUserGoalRequest true "学习目标"
// @Success 200 {object} map[string]string
// @Router /api/v1/learning/goals [put]
func (h *LearningStatsHandler) UpdateUserGoal(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	var req UpdateUserGoalRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	err := h.statsService.UpdateUserGoal(
		userID,
		req.DailyMinutes,
		req.DailyQuestions,
		req.WeeklyCourseDays,
		req.TargetExamDate,
		req.TargetScore,
	)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "更新成功"})
}

// GetDailyLeaderboard 获取每日排行榜
// @Summary 获取每日排行榜
// @Tags 学习报告
// @Accept json
// @Produce json
// @Param metric path string true "排行指标 (study_time/question_count)"
// @Success 200 {object} model.LeaderboardResponse
// @Router /api/v1/learning/leaderboards/daily/{metric} [get]
func (h *LearningStatsHandler) GetDailyLeaderboard(c echo.Context) error {
	metricStr := c.Param("metric")
	metric := model.LeaderboardMetric(metricStr)

	// 验证指标
	if metric != model.MetricStudyTime && metric != model.MetricQuestionCount {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "不支持的排行指标"})
	}

	userID := getUserIDOptional(c)
	leaderboard, err := h.statsService.GetLeaderboard(userID, model.LeaderboardDaily, metric)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, leaderboard)
}

// GetWeeklyLeaderboard 获取每周排行榜
// @Summary 获取每周排行榜
// @Tags 学习报告
// @Accept json
// @Produce json
// @Param metric path string true "排行指标 (study_time/question_count)"
// @Success 200 {object} model.LeaderboardResponse
// @Router /api/v1/learning/leaderboards/weekly/{metric} [get]
func (h *LearningStatsHandler) GetWeeklyLeaderboard(c echo.Context) error {
	metricStr := c.Param("metric")
	metric := model.LeaderboardMetric(metricStr)

	// 验证指标
	if metric != model.MetricStudyTime && metric != model.MetricQuestionCount {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "不支持的排行指标"})
	}

	userID := getUserIDOptional(c)
	leaderboard, err := h.statsService.GetLeaderboard(userID, model.LeaderboardWeekly, metric)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, leaderboard)
}

// GetConsecutiveLeaderboard 获取连续打卡排行榜
// @Summary 获取连续打卡排行榜
// @Tags 学习报告
// @Accept json
// @Produce json
// @Success 200 {object} model.LeaderboardResponse
// @Router /api/v1/learning/leaderboards/consecutive [get]
func (h *LearningStatsHandler) GetConsecutiveLeaderboard(c echo.Context) error {
	userID := getUserIDOptional(c)
	leaderboard, err := h.statsService.GetConsecutiveLeaderboard(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, leaderboard)
}

// GetMyRank 获取我的排名
// @Summary 获取我的排名
// @Tags 学习报告
// @Accept json
// @Produce json
// @Param type query string false "排行榜类型 (daily/weekly)"
// @Param metric query string false "排行指标 (study_time/question_count)"
// @Success 200 {object} model.LeaderboardEntry
// @Router /api/v1/learning/leaderboards/my-rank [get]
func (h *LearningStatsHandler) GetMyRank(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	leaderboardType := model.LeaderboardType(c.QueryParam("type"))
	if leaderboardType == "" {
		leaderboardType = model.LeaderboardDaily
	}

	metric := model.LeaderboardMetric(c.QueryParam("metric"))
	if metric == "" {
		metric = model.MetricStudyTime
	}

	leaderboard, err := h.statsService.GetLeaderboard(userID, leaderboardType, metric)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	if leaderboard.MyRank == nil {
		return c.JSON(http.StatusOK, map[string]interface{}{
			"rank":    0,
			"value":   0,
			"message": "暂无排名数据",
		})
	}

	return c.JSON(http.StatusOK, leaderboard.MyRank)
}

// GetUserAchievements 获取用户成就
// @Summary 获取用户成就
// @Tags 学习报告
// @Accept json
// @Produce json
// @Success 200 {array} model.UserLearningAchievement
// @Router /api/v1/learning/achievements [get]
func (h *LearningStatsHandler) GetUserAchievements(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	achievements, err := h.statsService.GetUserAchievements(userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, achievements)
}

// RecordStudyRequest 记录学习请求
type RecordStudyRequest struct {
	Minutes  int    `json:"minutes" validate:"required,min=1"`
	IsCourse bool   `json:"is_course"`
	Subject  string `json:"subject"`
}

// RecordStudy 记录学习
// @Summary 记录学习
// @Tags 学习报告
// @Accept json
// @Produce json
// @Param body body RecordStudyRequest true "学习记录"
// @Success 200 {object} map[string]string
// @Router /api/v1/learning/record/study [post]
func (h *LearningStatsHandler) RecordStudy(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	var req RecordStudyRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	if req.Minutes <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "学习时长必须大于0"})
	}

	err := h.statsService.RecordLearning(userID, req.Minutes, req.IsCourse, req.Subject)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "记录成功"})
}

// RecordQuestionRequest 记录做题请求
type RecordQuestionRequest struct {
	IsCorrect bool   `json:"is_correct"`
	Subject   string `json:"subject"`
}

// RecordQuestion 记录做题
// @Summary 记录做题
// @Tags 学习报告
// @Accept json
// @Produce json
// @Param body body RecordQuestionRequest true "做题记录"
// @Success 200 {object} map[string]string
// @Router /api/v1/learning/record/question [post]
func (h *LearningStatsHandler) RecordQuestion(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	var req RecordQuestionRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	err := h.statsService.RecordQuestionResult(userID, req.IsCorrect, req.Subject)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]string{"message": "记录成功"})
}

// =====================================================
// 辅助函数
// =====================================================

// getUserID 从上下文获取用户ID
func getUserID(c echo.Context) uint {
	userIDInterface := c.Get("user_id")
	if userIDInterface == nil {
		return 0
	}

	switch v := userIDInterface.(type) {
	case uint:
		return v
	case int:
		return uint(v)
	case int64:
		return uint(v)
	case float64:
		return uint(v)
	case string:
		id, _ := strconv.ParseUint(v, 10, 32)
		return uint(id)
	default:
		return 0
	}
}

// getUserIDOptional 从上下文获取可选的用户ID
func getUserIDOptional(c echo.Context) uint {
	userIDInterface := c.Get("user_id")
	if userIDInterface == nil {
		return 0
	}

	switch v := userIDInterface.(type) {
	case uint:
		return v
	case int:
		return uint(v)
	case int64:
		return uint(v)
	case float64:
		return uint(v)
	case string:
		id, _ := strconv.ParseUint(v, 10, 32)
		return uint(id)
	default:
		return 0
	}
}
