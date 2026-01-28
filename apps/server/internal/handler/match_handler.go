package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type MatchHandler struct {
	matchService *service.MatchService
}

func NewMatchHandler(matchService *service.MatchService) *MatchHandler {
	return &MatchHandler{matchService: matchService}
}

// GetMatchedPositions returns positions matched to user's profile
// @Summary Get Matched Positions
// @Description Get positions that match current user's profile and preferences
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param strategy query string false "Match strategy: strict, loose, smart" default(smart)
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param min_score query int false "Minimum match score filter"
// @Param only_eligible query bool false "Only show eligible positions"
// @Param sort_by query string false "Sort by: score, recruit_count, deadline"
// @Param province query string false "Province filter"
// @Param exam_type query string false "Exam type filter"
// @Success 200 {object} Response
// @Router /api/v1/match/positions [get]
func (h *MatchHandler) GetMatchedPositions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.MatchRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.matchService.MatchPositions(userID, &req)
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "Please complete your profile first")
		}
		return fail(c, 500, "Failed to match positions: "+err.Error())
	}

	return success(c, result)
}

// PostMatch performs smart match (alias for GetMatchedPositions with POST)
// @Summary Smart Match
// @Description Perform smart position matching based on user profile
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body service.MatchRequest true "Match request"
// @Success 200 {object} Response
// @Router /api/v1/match [post]
func (h *MatchHandler) PostMatch(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.MatchRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request body")
	}

	result, err := h.matchService.MatchPositions(userID, &req)
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "Please complete your profile first")
		}
		return fail(c, 500, "Failed to match positions: "+err.Error())
	}

	return success(c, result)
}

// GetMatchPreview returns a quick preview of match results without saving
// @Summary Match Preview
// @Description Get a quick preview of match results
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Number of results to preview" default(5)
// @Success 200 {object} Response
// @Router /api/v1/match/preview [get]
func (h *MatchHandler) GetMatchPreview(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	limit := 5
	if l := c.QueryParam("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 20 {
			limit = parsed
		}
	}

	req := &service.MatchRequest{
		Strategy: "smart",
		Page:     1,
		PageSize: limit,
	}

	result, err := h.matchService.MatchPositions(userID, req)
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "Please complete your profile first")
		}
		return fail(c, 500, "Failed to preview match: "+err.Error())
	}

	return success(c, result)
}

// GetPositionMatchDetail returns match details for a specific position
// @Summary Get Position Match Detail
// @Description Get detailed match information for a specific position
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Position ID"
// @Success 200 {object} Response
// @Router /api/v1/positions/{id}/match [get]
func (h *MatchHandler) GetPositionMatchDetail(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	positionID, err := strconv.ParseUint(c.Param("id"), 10, 64)
	if err != nil {
		return fail(c, 400, "Invalid position ID")
	}

	result, err := h.matchService.GetPositionMatchDetail(userID, uint(positionID))
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "Please complete your profile first")
		}
		if err == service.ErrPositionNotFound {
			return fail(c, 404, "Position not found")
		}
		return fail(c, 500, "Failed to get match detail: "+err.Error())
	}

	return success(c, result)
}

// GetMatchStats returns match statistics by dimension
// @Summary Get Match Statistics
// @Description Get match statistics grouped by various dimensions
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/match/stats [get]
func (h *MatchHandler) GetMatchStats(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	stats, err := h.matchService.GetMatchDimensionStats(userID)
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "Please complete your profile first")
		}
		return fail(c, 500, "Failed to get match stats: "+err.Error())
	}

	return success(c, stats)
}

// GetMatchReport returns a comprehensive match report
// @Summary Get Match Report
// @Description Generate a comprehensive match report for current user
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/match/report [get]
func (h *MatchHandler) GetMatchReport(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	report, err := h.matchService.GenerateMatchReport(userID)
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "Please complete your profile first")
		}
		return fail(c, 500, "Failed to generate report: "+err.Error())
	}

	return success(c, report)
}

// UpdateMatchWeights updates custom match weights
// @Summary Update Match Weights
// @Description Update custom weights for match calculation
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param body body service.CustomWeightsRequest true "Custom weights"
// @Success 200 {object} Response
// @Router /api/v1/match/weights [put]
func (h *MatchHandler) UpdateMatchWeights(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.CustomWeightsRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request body")
	}

	if err := h.matchService.UpdateWeights(userID, &req); err != nil {
		return fail(c, 400, "Invalid weights: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "Weights updated successfully",
		"weights": h.matchService.GetCurrentWeights(),
	})
}

// GetMatchWeights returns current match weights
// @Summary Get Match Weights
// @Description Get current match weight configuration
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/match/weights [get]
func (h *MatchHandler) GetMatchWeights(c echo.Context) error {
	weights := h.matchService.GetCurrentWeights()
	return success(c, weights)
}

// =====================================================
// 缓存相关端点
// =====================================================

// GetMatchedPositionsCached returns cached matched positions (faster)
// @Summary Get Matched Positions with Cache
// @Description Get positions with cache support for faster response
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param strategy query string false "Match strategy: strict, loose, smart" default(smart)
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param min_score query int false "Minimum match score filter"
// @Param only_eligible query bool false "Only show eligible positions"
// @Param sort_by query string false "Sort by: score, recruit_count, deadline"
// @Param province query string false "Province filter"
// @Param exam_type query string false "Exam type filter"
// @Success 200 {object} Response
// @Router /api/v1/match/fast [get]
func (h *MatchHandler) GetMatchedPositionsCached(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.MatchRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	// 使用缓存版本
	result, err := h.matchService.MatchPositionsWithCache(userID, &req)
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "Please complete your profile first")
		}
		return fail(c, 500, "Failed to match positions: "+err.Error())
	}

	return success(c, result)
}

// GetCacheStats returns match cache statistics
// @Summary Get Cache Statistics
// @Description Get statistics about the match cache system
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/match/cache/stats [get]
func (h *MatchHandler) GetCacheStats(c echo.Context) error {
	if !h.matchService.IsCacheEnabled() {
		return success(c, map[string]interface{}{
			"enabled": false,
			"message": "Cache is not enabled",
		})
	}

	stats, err := h.matchService.GetCacheStats()
	if err != nil {
		return fail(c, 500, "Failed to get cache stats: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"enabled": true,
		"stats":   stats,
	})
}

// GetUserCacheStats returns user-specific cache statistics
// @Summary Get User Cache Statistics
// @Description Get cache statistics for current user
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/match/cache/user-stats [get]
func (h *MatchHandler) GetUserCacheStats(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	if !h.matchService.IsCacheEnabled() {
		return success(c, map[string]interface{}{
			"enabled": false,
			"message": "Cache is not enabled",
		})
	}

	stats, err := h.matchService.GetUserCacheStats(userID)
	if err != nil {
		return fail(c, 500, "Failed to get user cache stats: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"enabled": true,
		"stats":   stats,
	})
}

// GetCachedTopMatches returns top matches from cache (very fast)
// @Summary Get Cached Top Matches
// @Description Get top matches from cache for fast response
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Number of results" default(10)
// @Success 200 {object} Response
// @Router /api/v1/match/cache/top [get]
func (h *MatchHandler) GetCachedTopMatches(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	if !h.matchService.IsCacheEnabled() {
		return fail(c, 400, "Cache is not enabled")
	}

	limit := 10
	if l := c.QueryParam("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 50 {
			limit = parsed
		}
	}

	results, err := h.matchService.GetCachedTopMatches(userID, limit)
	if err != nil {
		return fail(c, 500, "Failed to get cached matches: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"results": results,
		"total":   len(results),
	})
}

// InvalidateUserCache invalidates all cached matches for current user
// @Summary Invalidate User Cache
// @Description Invalidate all cached matches for current user (use after profile update)
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/match/cache/invalidate [post]
func (h *MatchHandler) InvalidateUserCache(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	if !h.matchService.IsCacheEnabled() {
		return success(c, map[string]interface{}{
			"message": "Cache is not enabled, no action taken",
		})
	}

	if err := h.matchService.InvalidateUserCache(userID); err != nil {
		return fail(c, 500, "Failed to invalidate cache: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "Cache invalidated successfully",
	})
}

// PrecomputeMatches precomputes matches for hot positions
// @Summary Precompute Hot Matches
// @Description Precompute matches for hot positions to speed up future queries
// @Tags Match
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param position_ids body []uint true "Position IDs to precompute"
// @Success 200 {object} Response
// @Router /api/v1/match/cache/precompute [post]
func (h *MatchHandler) PrecomputeMatches(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	if !h.matchService.IsCacheEnabled() {
		return fail(c, 400, "Cache is not enabled")
	}

	var req struct {
		PositionIDs []string `json:"position_ids"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request body")
	}

	if len(req.PositionIDs) == 0 {
		return fail(c, 400, "Position IDs are required")
	}

	if len(req.PositionIDs) > 100 {
		return fail(c, 400, "Maximum 100 positions per request")
	}

	if err := h.matchService.PrecomputeMatches(userID, req.PositionIDs); err != nil {
		return fail(c, 500, "Failed to precompute matches: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "Precomputation started",
		"count":   len(req.PositionIDs),
	})
}

func (h *MatchHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	// Main match endpoints
	g.POST("", h.PostMatch, authMiddleware)
	g.GET("/positions", h.GetMatchedPositions, authMiddleware)
	g.GET("/fast", h.GetMatchedPositionsCached, authMiddleware) // 缓存版本
	g.GET("/preview", h.GetMatchPreview, authMiddleware)
	g.GET("/stats", h.GetMatchStats, authMiddleware)
	g.GET("/report", h.GetMatchReport, authMiddleware)

	// Weights management
	g.GET("/weights", h.GetMatchWeights, authMiddleware)
	g.PUT("/weights", h.UpdateMatchWeights, authMiddleware)

	// Cache management
	cache := g.Group("/cache")
	cache.GET("/stats", h.GetCacheStats, authMiddleware)
	cache.GET("/user-stats", h.GetUserCacheStats, authMiddleware)
	cache.GET("/top", h.GetCachedTopMatches, authMiddleware)
	cache.POST("/invalidate", h.InvalidateUserCache, authMiddleware)
	cache.POST("/precompute", h.PrecomputeMatches, authMiddleware)
}

// RegisterPositionMatchRoute registers the position match detail endpoint
// This should be called from the position handler registration
func (h *MatchHandler) RegisterPositionMatchRoute(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	g.GET("/:id/match", h.GetPositionMatchDetail, authMiddleware)
}

// GetRecommendedPositions returns recommended positions based on user profile
// @Summary Get Recommended Positions
// @Description Get recommended positions based on user's profile and preferences
// @Tags Position
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Number of recommendations" default(10)
// @Success 200 {object} Response
// @Router /api/v1/positions/recommended [get]
func (h *MatchHandler) GetRecommendedPositions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "请先登录")
	}

	limit := 10
	if l := c.QueryParam("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 && parsed <= 50 {
			limit = parsed
		}
	}

	// 使用匹配服务获取推荐职位
	req := &service.MatchRequest{
		Strategy:     "smart",
		Page:         1,
		PageSize:     limit,
		MinScore:     60,      // 只返回匹配度>=60%的职位
		OnlyEligible: true,    // 只返回符合条件的职位
		SortBy:       "score", // 按匹配度排序
	}

	result, err := h.matchService.MatchPositions(userID, req)
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "请先完善您的个人信息")
		}
		return fail(c, 500, "获取推荐职位失败: "+err.Error())
	}

	// 转换为简要响应格式
	type RecommendedPosition struct {
		ID           uint   `json:"id"`
		Name         string `json:"name"`
		DeptName     string `json:"dept_name"`
		Province     string `json:"province"`
		City         string `json:"city"`
		Education    string `json:"education"`
		RecruitCount int    `json:"recruit_count"`
		ExamType     string `json:"exam_type"`
		MatchScore   int    `json:"match_score"`
		StarLevel    int    `json:"star_level"`
		MatchLevel   string `json:"match_level"`
		IsEligible   bool   `json:"is_eligible"`
	}

	recommendations := make([]RecommendedPosition, 0, len(result.Results))
	for _, r := range result.Results {
		recommendations = append(recommendations, RecommendedPosition{
			ID:           r.Position.ID,
			Name:         r.Position.PositionName,
			DeptName:     r.Position.DepartmentName,
			Province:     r.Position.Province,
			City:         r.Position.City,
			Education:    r.Position.Education,
			RecruitCount: r.Position.RecruitCount,
			ExamType:     r.Position.ExamType,
			MatchScore:   r.MatchScore,
			StarLevel:    r.StarLevel,
			MatchLevel:   r.MatchLevel,
			IsEligible:   r.IsEligible,
		})
	}

	return success(c, map[string]interface{}{
		"positions":    recommendations,
		"total":        len(recommendations),
		"user_profile": result.UserProfile,
	})
}

// RegisterRecommendedRoute registers the recommended positions endpoint
func (h *MatchHandler) RegisterRecommendedRoute(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	g.GET("/recommended", h.GetRecommendedPositions, authMiddleware)
}
