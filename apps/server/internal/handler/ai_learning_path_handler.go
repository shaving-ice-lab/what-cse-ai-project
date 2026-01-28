package handler

import (
	"net/http"
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

// AILearningPathHandler AI学习路径处理器
type AILearningPathHandler struct {
	pathService     *service.AILearningPathService
	weaknessService *service.AIWeaknessAnalyzerService
}

// NewAILearningPathHandler 创建AI学习路径处理器
func NewAILearningPathHandler(
	pathService *service.AILearningPathService,
	weaknessService *service.AIWeaknessAnalyzerService,
) *AILearningPathHandler {
	return &AILearningPathHandler{
		pathService:     pathService,
		weaknessService: weaknessService,
	}
}

// RegisterRoutes 注册路由
func (h *AILearningPathHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	// AI学习路径相关路由（需要登录）
	aiPath := e.Group("/api/v1/ai/learning")
	aiPath.Use(authMiddleware)

	// 学习路径
	aiPath.GET("/path", h.GetLearningPath)
	aiPath.POST("/path/generate", h.GenerateLearningPath)
	aiPath.PUT("/path/adjust", h.AdjustLearningPath)
	aiPath.GET("/path/progress", h.GetProgressSummary)
	aiPath.GET("/path/recommendations", h.GetNextStepRecommendations)

	// 用户画像
	aiPath.GET("/profile", h.GetUserProfile)

	// 薄弱点分析
	aiPath.GET("/weakness", h.GetWeaknessAnalysis)
	aiPath.POST("/weakness/analyze", h.AnalyzeWeakness)
	aiPath.GET("/weakness/mistakes", h.GetTypicalMistakes)
	aiPath.POST("/weakness/practice", h.GenerateSpecializedPractice)
}

// =====================================================
// 学习路径相关接口
// =====================================================

// GetLearningPath 获取用户学习路径
// @Summary 获取用户学习路径
// @Tags AI学习
// @Accept json
// @Produce json
// @Success 200 {object} service.LearningPath
// @Router /api/v1/ai/learning/path [get]
func (h *AILearningPathHandler) GetLearningPath(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	// 生成默认路径
	path, err := h.pathService.GenerateLearningPath(c.Request().Context(), service.GeneratePathRequest{
		UserID:     userID,
		TargetExam: "国考",
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, path)
}

// GenerateLearningPathRequest 生成学习路径请求
type GenerateLearningPathRequest struct {
	TargetExam        string `json:"target_exam" validate:"required"`
	TargetExamDate    string `json:"target_exam_date"`
	DailyStudyMinutes int    `json:"daily_study_minutes"`
	Force             bool   `json:"force"`
}

// GenerateLearningPath 生成学习路径
// @Summary 生成学习路径
// @Tags AI学习
// @Accept json
// @Produce json
// @Param body body GenerateLearningPathRequest true "生成学习路径请求"
// @Success 200 {object} service.LearningPath
// @Router /api/v1/ai/learning/path/generate [post]
func (h *AILearningPathHandler) GenerateLearningPath(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	var req GenerateLearningPathRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	if req.TargetExam == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "目标考试类型不能为空"})
	}

	// 解析日期
	var targetDate time.Time
	if req.TargetExamDate != "" {
		var err error
		targetDate, err = time.Parse("2006-01-02", req.TargetExamDate)
		if err != nil {
			return c.JSON(http.StatusBadRequest, map[string]string{"error": "日期格式错误，请使用 YYYY-MM-DD 格式"})
		}
	}

	path, err := h.pathService.GenerateLearningPath(c.Request().Context(), service.GeneratePathRequest{
		UserID:            userID,
		TargetExam:        req.TargetExam,
		TargetExamDate:    targetDate,
		DailyStudyMinutes: req.DailyStudyMinutes,
		Force:             req.Force,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, path)
}

// AdjustLearningPathRequest 调整学习路径请求
type AdjustLearningPathRequest struct {
	PathID   string   `json:"path_id" validate:"required"`
	Reason   string   `json:"reason"`
	NewFocus []string `json:"new_focus,omitempty"`
}

// AdjustLearningPath 调整学习路径
// @Summary 调整学习路径
// @Tags AI学习
// @Accept json
// @Produce json
// @Param body body AdjustLearningPathRequest true "调整学习路径请求"
// @Success 200 {object} service.LearningPath
// @Router /api/v1/ai/learning/path/adjust [put]
func (h *AILearningPathHandler) AdjustLearningPath(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	var req AdjustLearningPathRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	path, err := h.pathService.AdjustLearningPath(c.Request().Context(), service.AdjustPathRequest{
		UserID:   userID,
		PathID:   req.PathID,
		Reason:   req.Reason,
		NewFocus: req.NewFocus,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, path)
}

// GetProgressSummary 获取学习进度摘要
// @Summary 获取学习进度摘要
// @Tags AI学习
// @Accept json
// @Produce json
// @Success 200 {object} service.ProgressSummary
// @Router /api/v1/ai/learning/path/progress [get]
func (h *AILearningPathHandler) GetProgressSummary(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	// 先获取学习路径
	path, err := h.pathService.GenerateLearningPath(c.Request().Context(), service.GeneratePathRequest{
		UserID:     userID,
		TargetExam: "国考",
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// 获取进度摘要
	summary, err := h.pathService.GetProgressSummary(c.Request().Context(), userID, path)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, summary)
}

// GetNextStepRecommendations 获取下一步学习推荐
// @Summary 获取下一步学习推荐
// @Tags AI学习
// @Accept json
// @Produce json
// @Param limit query int false "返回数量限制"
// @Success 200 {array} service.NextStepRecommendation
// @Router /api/v1/ai/learning/path/recommendations [get]
func (h *AILearningPathHandler) GetNextStepRecommendations(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	limit := 5
	if limitStr := c.QueryParam("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	recommendations, err := h.pathService.GetNextStepRecommendations(c.Request().Context(), userID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, recommendations)
}

// GetUserProfile 获取用户画像
// @Summary 获取用户画像
// @Tags AI学习
// @Accept json
// @Produce json
// @Success 200 {object} service.UserProfile
// @Router /api/v1/ai/learning/profile [get]
func (h *AILearningPathHandler) GetUserProfile(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	profile, err := h.pathService.AnalyzeUserProfile(c.Request().Context(), userID)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, profile)
}

// =====================================================
// 薄弱点分析相关接口
// =====================================================

// GetWeaknessAnalysis 获取薄弱点分析结果
// @Summary 获取薄弱点分析结果
// @Tags AI学习
// @Accept json
// @Produce json
// @Param subject query string false "筛选科目"
// @Success 200 {object} service.WeaknessAnalysisResult
// @Router /api/v1/ai/learning/weakness [get]
func (h *AILearningPathHandler) GetWeaknessAnalysis(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	subject := c.QueryParam("subject")

	result, err := h.weaknessService.AnalyzeWeakness(c.Request().Context(), service.AnalyzeRequest{
		UserID:  userID,
		Subject: subject,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

// AnalyzeWeaknessRequest 薄弱点分析请求
type AnalyzeWeaknessRequest struct {
	Subject      string `json:"subject,omitempty"`
	DateFrom     string `json:"date_from,omitempty"`
	DateTo       string `json:"date_to,omitempty"`
	MinQuestions int    `json:"min_questions,omitempty"`
}

// AnalyzeWeakness 执行薄弱点分析
// @Summary 执行薄弱点分析
// @Tags AI学习
// @Accept json
// @Produce json
// @Param body body AnalyzeWeaknessRequest true "分析请求"
// @Success 200 {object} service.WeaknessAnalysisResult
// @Router /api/v1/ai/learning/weakness/analyze [post]
func (h *AILearningPathHandler) AnalyzeWeakness(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	var req AnalyzeWeaknessRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	// 解析日期
	var dateFrom, dateTo time.Time
	if req.DateFrom != "" {
		if d, err := time.Parse("2006-01-02", req.DateFrom); err == nil {
			dateFrom = d
		}
	}
	if req.DateTo != "" {
		if d, err := time.Parse("2006-01-02", req.DateTo); err == nil {
			dateTo = d
		}
	}

	result, err := h.weaknessService.AnalyzeWeakness(c.Request().Context(), service.AnalyzeRequest{
		UserID:       userID,
		Subject:      req.Subject,
		DateFrom:     dateFrom,
		DateTo:       dateTo,
		MinQuestions: req.MinQuestions,
	})
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, result)
}

// GetTypicalMistakes 获取典型错题
// @Summary 获取典型错题
// @Tags AI学习
// @Accept json
// @Produce json
// @Param limit query int false "返回数量限制"
// @Success 200 {array} service.TypicalMistake
// @Router /api/v1/ai/learning/weakness/mistakes [get]
func (h *AILearningPathHandler) GetTypicalMistakes(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	limit := 10
	if limitStr := c.QueryParam("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	mistakes, err := h.weaknessService.GetTypicalMistakes(c.Request().Context(), userID, limit)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, mistakes)
}

// GenerateSpecializedPracticeRequest 生成专项练习请求
type GenerateSpecializedPracticeRequest struct {
	KnowledgePoint string `json:"knowledge_point" validate:"required"`
	Count          int    `json:"count"`
}

// GenerateSpecializedPractice 生成专项练习
// @Summary 生成专项练习
// @Tags AI学习
// @Accept json
// @Produce json
// @Param body body GenerateSpecializedPracticeRequest true "生成专项练习请求"
// @Success 200 {object} service.SpecializedPractice
// @Router /api/v1/ai/learning/weakness/practice [post]
func (h *AILearningPathHandler) GenerateSpecializedPractice(c echo.Context) error {
	userID := getUserID(c)
	if userID == 0 {
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "未登录"})
	}

	var req GenerateSpecializedPracticeRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "参数错误"})
	}

	if req.KnowledgePoint == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "知识点不能为空"})
	}

	count := req.Count
	if count <= 0 {
		count = 20
	}

	practice, err := h.weaknessService.GenerateSpecializedPractice(c.Request().Context(), userID, req.KnowledgePoint, count)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, practice)
}
