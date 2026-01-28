package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

type PositionHandler struct {
	positionService *service.PositionService
	matchService    *service.MatchService
}

func NewPositionHandler(positionService *service.PositionService) *PositionHandler {
	return &PositionHandler{positionService: positionService}
}

// SetMatchService 设置匹配服务（用于推荐职位功能）
func (h *PositionHandler) SetMatchService(matchService *service.MatchService) {
	h.matchService = matchService
}

// ListPositions returns a paginated list of positions
// @Summary List Positions
// @Description Get a paginated list of positions with filters
// @Tags Position
// @Accept json
// @Produce json
// @Param exam_type query string false "Exam type filter"
// @Param province query string false "Province filter"
// @Param city query string false "City filter"
// @Param education_min query string false "Minimum education filter"
// @Param keyword query string false "Keyword search"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/positions [get]
func (h *PositionHandler) ListPositions(c echo.Context) error {
	var req service.PositionListRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.positionService.ListPositions(&req)
	if err != nil {
		return fail(c, 500, "Failed to fetch positions: "+err.Error())
	}

	return success(c, result)
}

// GetPosition returns position details
// @Summary Get Position Detail
// @Description Get detailed information for a specific position
// @Tags Position
// @Accept json
// @Produce json
// @Param id path int true "Position ID"
// @Success 200 {object} Response
// @Router /api/v1/positions/{id} [get]
func (h *PositionHandler) GetPosition(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid position ID")
	}

	position, err := h.positionService.GetPositionDetail(uint(id))
	if err != nil {
		if err == service.ErrPositionNotFound {
			return fail(c, 404, "Position not found")
		}
		return fail(c, 500, "Failed to fetch position: "+err.Error())
	}

	// Check if user has favorited this position
	userID := getUserIDFromContext(c)
	var isFavorite bool
	if userID > 0 {
		isFavorite = h.positionService.IsFavorite(userID, uint(id))
	}

	return success(c, map[string]interface{}{
		"position":    position,
		"is_favorite": isFavorite,
	})
}

// AddFavorite adds a position to user's favorites
// @Summary Add Favorite
// @Description Add a position to user's favorites
// @Tags Position
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Position ID"
// @Success 200 {object} Response
// @Router /api/v1/positions/{id}/favorite [post]
func (h *PositionHandler) AddFavorite(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	positionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid position ID")
	}

	if err := h.positionService.AddFavorite(userID, uint(positionID)); err != nil {
		if err == service.ErrPositionNotFound {
			return fail(c, 404, "Position not found")
		}
		return fail(c, 500, "Failed to add favorite: "+err.Error())
	}

	return success(c, map[string]string{"message": "Position added to favorites"})
}

// RemoveFavorite removes a position from user's favorites
// @Summary Remove Favorite
// @Description Remove a position from user's favorites
// @Tags Position
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Position ID"
// @Success 200 {object} Response
// @Router /api/v1/positions/{id}/favorite [delete]
func (h *PositionHandler) RemoveFavorite(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	positionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid position ID")
	}

	if err := h.positionService.RemoveFavorite(userID, uint(positionID)); err != nil {
		return fail(c, 500, "Failed to remove favorite: "+err.Error())
	}

	return success(c, map[string]string{"message": "Position removed from favorites"})
}

// GetFavorites returns user's favorite positions
// @Summary Get User Favorites
// @Description Get current user's favorite positions
// @Tags Position
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/user/favorites [get]
func (h *PositionHandler) GetFavorites(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	positions, total, err := h.positionService.GetUserFavorites(userID, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to fetch favorites: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"positions": positions,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// ComparePositions compares multiple positions
// @Summary Compare Positions
// @Description Compare multiple positions side by side
// @Tags Position
// @Accept json
// @Produce json
// @Param request body []uint true "Position IDs to compare"
// @Success 200 {object} Response
// @Router /api/v1/positions/compare [post]
func (h *PositionHandler) ComparePositions(c echo.Context) error {
	var req struct {
		IDs []uint `json:"ids"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if len(req.IDs) < 2 || len(req.IDs) > 5 {
		return fail(c, 400, "Please select 2-5 positions to compare")
	}

	result, err := h.positionService.ComparePositions(req.IDs)
	if err != nil {
		return fail(c, 500, "Failed to compare positions: "+err.Error())
	}

	return success(c, result)
}

// =====================================================
// 新增 API 端点
// =====================================================

// ListPositionsV2 returns positions with enhanced filters
// @Summary List Positions V2
// @Description Get positions with enhanced filtering and pagination
// @Tags Position
// @Accept json
// @Produce json
// @Param province query string false "Province filter"
// @Param city query string false "City filter"
// @Param district query string false "District filter"
// @Param education query string false "Education filter"
// @Param exam_type query string false "Exam type filter"
// @Param department_level query string false "Department level filter"
// @Param unlimited_major query bool false "Only unlimited major positions"
// @Param fresh_graduate query bool false "Only fresh graduate positions"
// @Param min_recruit query int false "Minimum recruit count"
// @Param reg_status query string false "Registration status: registering/upcoming/ended"
// @Param expiring_days query int false "Expiring in N days"
// @Param keyword query string false "Search keyword"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param sort_by query string false "Sort field" default(created_at)
// @Param sort_order query string false "Sort order" default(desc)
// @Success 200 {object} Response
// @Router /api/v1/positions/v2 [get]
func (h *PositionHandler) ListPositionsV2(c echo.Context) error {
	var params repository.PositionQueryParams
	if err := c.Bind(&params); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.positionService.ListPositionsWithParams(&params)
	if err != nil {
		return fail(c, 500, "Failed to fetch positions: "+err.Error())
	}

	return success(c, result)
}

// SearchPositions searches positions by keyword
// @Summary Search Positions
// @Description Search positions by keyword with filters
// @Tags Position
// @Accept json
// @Produce json
// @Param keyword query string true "Search keyword"
// @Param province query string false "Province filter"
// @Param exam_type query string false "Exam type filter"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/positions/search [get]
func (h *PositionHandler) SearchPositions(c echo.Context) error {
	keyword := c.QueryParam("keyword")
	if keyword == "" {
		return fail(c, 400, "Keyword is required")
	}

	var params repository.PositionQueryParams
	if err := c.Bind(&params); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.positionService.SearchPositions(keyword, &params)
	if err != nil {
		return fail(c, 500, "Failed to search positions: "+err.Error())
	}

	return success(c, result)
}

// GetPositionStats returns position statistics
// @Summary Get Position Stats
// @Description Get overall position statistics
// @Tags Position
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/positions/stats [get]
func (h *PositionHandler) GetPositionStats(c echo.Context) error {
	stats, err := h.positionService.GetPositionStatsV2()
	if err != nil {
		return fail(c, 500, "Failed to fetch stats: "+err.Error())
	}

	return success(c, stats)
}

// GetStatsByProvince returns stats grouped by province
// @Summary Get Stats By Province
// @Description Get position statistics grouped by province
// @Tags Position
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/positions/stats/province [get]
func (h *PositionHandler) GetStatsByProvince(c echo.Context) error {
	stats, err := h.positionService.GetStatsByProvince()
	if err != nil {
		return fail(c, 500, "Failed to fetch province stats: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"stats": stats,
	})
}

// GetStatsByExamType returns stats grouped by exam type
// @Summary Get Stats By Exam Type
// @Description Get position statistics grouped by exam type
// @Tags Position
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/positions/stats/exam-type [get]
func (h *PositionHandler) GetStatsByExamType(c echo.Context) error {
	stats, err := h.positionService.GetStatsByExamTypeV2()
	if err != nil {
		return fail(c, 500, "Failed to fetch exam type stats: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"stats": stats,
	})
}

// GetPositionTrends returns position trends
// @Summary Get Position Trends
// @Description Get position creation trends over time
// @Tags Position
// @Accept json
// @Produce json
// @Param days query int false "Number of days" default(30)
// @Success 200 {object} Response
// @Router /api/v1/positions/stats/trends [get]
func (h *PositionHandler) GetPositionTrends(c echo.Context) error {
	days, _ := strconv.Atoi(c.QueryParam("days"))
	if days <= 0 {
		days = 30
	}

	trends, err := h.positionService.GetPositionTrends(days)
	if err != nil {
		return fail(c, 500, "Failed to fetch trends: "+err.Error())
	}

	return success(c, trends)
}

// GetFilterOptions returns filter options
// @Summary Get Filter Options
// @Description Get available filter options for positions
// @Tags Position
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/positions/filter-options [get]
func (h *PositionHandler) GetFilterOptions(c echo.Context) error {
	options, err := h.positionService.GetFilterOptions()
	if err != nil {
		return fail(c, 500, "Failed to fetch filter options: "+err.Error())
	}

	return success(c, options)
}

// GetCascadeRegions returns cascade region data
// @Summary Get Cascade Regions
// @Description Get cascade region data (province -> cities)
// @Tags Position
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/positions/regions [get]
func (h *PositionHandler) GetCascadeRegions(c echo.Context) error {
	regions, err := h.positionService.GetCascadeRegions()
	if err != nil {
		return fail(c, 500, "Failed to fetch regions: "+err.Error())
	}

	return success(c, regions)
}

// GetDistricts returns districts for a province and city
// @Summary Get Districts
// @Description Get districts for a specific province and city
// @Tags Position
// @Accept json
// @Produce json
// @Param province query string false "Province"
// @Param city query string false "City"
// @Success 200 {object} Response
// @Router /api/v1/positions/districts [get]
func (h *PositionHandler) GetDistricts(c echo.Context) error {
	province := c.QueryParam("province")
	city := c.QueryParam("city")

	districts, err := h.positionService.GetDistricts(province, city)
	if err != nil {
		return fail(c, 500, "Failed to fetch districts: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"districts": districts,
	})
}

// GetHotPositions returns hot positions
// @Summary Get Hot Positions
// @Description Get hot positions with high recruit count
// @Tags Position
// @Accept json
// @Produce json
// @Param limit query int false "Limit" default(10)
// @Success 200 {object} Response
// @Router /api/v1/positions/hot [get]
func (h *PositionHandler) GetHotPositions(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 10
	}

	positions, err := h.positionService.GetHotPositions(limit)
	if err != nil {
		return fail(c, 500, "Failed to fetch hot positions: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"positions": positions,
	})
}

// GetExpiringPositions returns positions expiring soon
// @Summary Get Expiring Positions
// @Description Get positions with registration ending soon
// @Tags Position
// @Accept json
// @Produce json
// @Param days query int false "Days until expiry" default(3)
// @Param limit query int false "Limit" default(10)
// @Success 200 {object} Response
// @Router /api/v1/positions/expiring [get]
func (h *PositionHandler) GetExpiringPositions(c echo.Context) error {
	days, _ := strconv.Atoi(c.QueryParam("days"))
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if days <= 0 {
		days = 3
	}
	if limit <= 0 {
		limit = 10
	}

	positions, err := h.positionService.GetExpiringPositions(days, limit)
	if err != nil {
		return fail(c, 500, "Failed to fetch expiring positions: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"positions": positions,
	})
}

// GetLatestPositions returns latest positions
// @Summary Get Latest Positions
// @Description Get recently added positions
// @Tags Position
// @Accept json
// @Produce json
// @Param limit query int false "Limit" default(10)
// @Success 200 {object} Response
// @Router /api/v1/positions/latest [get]
func (h *PositionHandler) GetLatestPositions(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 10
	}

	positions, err := h.positionService.GetLatestPositions(limit)
	if err != nil {
		return fail(c, 500, "Failed to fetch latest positions: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"positions": positions,
	})
}

// GetRecommendedPositions returns positions recommended for the user based on their profile
// @Summary Get Recommended Positions
// @Description Get positions recommended based on user's profile and preferences
// @Tags Position
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Limit" default(10)
// @Param min_score query int false "Minimum match score (0-100)" default(60)
// @Success 200 {object} Response
// @Router /api/v1/positions/recommended [get]
func (h *PositionHandler) GetRecommendedPositions(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Please login to get recommended positions")
	}

	if h.matchService == nil {
		return fail(c, 500, "Match service not available")
	}

	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 10
	}
	if limit > 50 {
		limit = 50
	}

	minScore, _ := strconv.Atoi(c.QueryParam("min_score"))
	if minScore <= 0 {
		minScore = 60 // 默认最低匹配度 60%
	}

	// 使用匹配服务获取推荐职位
	matchReq := &service.MatchRequest{
		Strategy:     "smart",
		Page:         1,
		PageSize:     limit,
		MinScore:     minScore,
		OnlyEligible: false, // 不仅限符合条件的，也包括接近符合的
		SortBy:       "score",
	}

	result, err := h.matchService.MatchPositions(userID, matchReq)
	if err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 400, "Please complete your profile first to get recommendations")
		}
		return fail(c, 500, "Failed to get recommended positions: "+err.Error())
	}

	// 转换为推荐响应格式
	type RecommendedPosition struct {
		ID             uint   `json:"id"`
		PositionID     string `json:"position_id"`
		PositionName   string `json:"position_name"`
		DepartmentName string `json:"department_name"`
		Province       string `json:"province"`
		City           string `json:"city"`
		ExamType       string `json:"exam_type"`
		Education      string `json:"education"`
		RecruitCount   int    `json:"recruit_count"`
		MatchScore     int    `json:"match_score"`
		MatchLevel     string `json:"match_level"`
		StarLevel      int    `json:"star_level"`
		IsEligible     bool   `json:"is_eligible"`
	}

	positions := make([]RecommendedPosition, len(result.Results))
	for i, r := range result.Results {
		positions[i] = RecommendedPosition{
			ID:             r.Position.ID,
			PositionID:     r.Position.PositionID,
			PositionName:   r.Position.PositionName,
			DepartmentName: r.Position.DepartmentName,
			Province:       r.Position.Province,
			City:           r.Position.City,
			ExamType:       r.Position.ExamType,
			Education:      r.Position.Education,
			RecruitCount:   r.Position.RecruitCount,
			MatchScore:     r.MatchScore,
			MatchLevel:     r.MatchLevel,
			StarLevel:      r.StarLevel,
			IsEligible:     r.IsEligible,
		}
	}

	return success(c, map[string]interface{}{
		"positions":    positions,
		"total":        result.Total,
		"stats":        result.Stats,
		"user_profile": result.UserProfile,
	})
}

// GetSimilarPositions returns similar positions for a given position
// @Summary Get Similar Positions
// @Description Get similar positions based on province, exam type, education
// @Tags Position
// @Accept json
// @Produce json
// @Param id path int true "Position ID"
// @Param limit query int false "Limit" default(5)
// @Success 200 {object} Response
// @Router /api/v1/positions/{id}/similar [get]
func (h *PositionHandler) GetSimilarPositions(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid position ID")
	}

	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 5
	}

	positions, err := h.positionService.GetSimilarPositions(uint(id), limit)
	if err != nil {
		if err == service.ErrPositionNotFound {
			return fail(c, 404, "Position not found")
		}
		return fail(c, 500, "Failed to fetch similar positions: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"positions": positions,
	})
}

// =====================================================
// 管理端 API 端点
// =====================================================

// AdminDeletePosition deletes a position (admin only)
// @Summary Delete Position (Admin)
// @Description Delete a position by ID
// @Tags Position Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Position ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/positions/{id} [delete]
func (h *PositionHandler) AdminDeletePosition(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid position ID")
	}

	if err := h.positionService.DeletePosition(uint(id)); err != nil {
		return fail(c, 500, "Failed to delete position: "+err.Error())
	}

	return success(c, map[string]string{"message": "Position deleted successfully"})
}

// AdminBatchDeletePositions deletes multiple positions (admin only)
// @Summary Batch Delete Positions (Admin)
// @Description Delete multiple positions by IDs
// @Tags Position Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body object true "Position IDs"
// @Success 200 {object} Response
// @Router /api/v1/admin/positions/batch-delete [post]
func (h *PositionHandler) AdminBatchDeletePositions(c echo.Context) error {
	var req struct {
		IDs []uint `json:"ids"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if len(req.IDs) == 0 {
		return fail(c, 400, "No position IDs provided")
	}

	if err := h.positionService.BatchDeletePositions(req.IDs); err != nil {
		return fail(c, 500, "Failed to delete positions: "+err.Error())
	}

	return success(c, map[string]string{"message": "Positions deleted successfully"})
}

// AdminUpdatePositionStatus updates position status (admin only)
// @Summary Update Position Status (Admin)
// @Description Update position status
// @Tags Position Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Position ID"
// @Param request body object true "Status"
// @Success 200 {object} Response
// @Router /api/v1/admin/positions/{id}/status [put]
func (h *PositionHandler) AdminUpdatePositionStatus(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid position ID")
	}

	var req struct {
		Status int `json:"status"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.positionService.UpdatePositionStatus(uint(id), req.Status); err != nil {
		return fail(c, 500, "Failed to update position status: "+err.Error())
	}

	return success(c, map[string]string{"message": "Position status updated successfully"})
}

// AdminBatchUpdateStatus updates status for multiple positions (admin only)
// @Summary Batch Update Position Status (Admin)
// @Description Update status for multiple positions
// @Tags Position Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body object true "IDs and Status"
// @Success 200 {object} Response
// @Router /api/v1/admin/positions/batch-status [put]
func (h *PositionHandler) AdminBatchUpdateStatus(c echo.Context) error {
	var req struct {
		IDs    []uint `json:"ids"`
		Status int    `json:"status"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if len(req.IDs) == 0 {
		return fail(c, 400, "No position IDs provided")
	}

	if err := h.positionService.BatchUpdateStatus(req.IDs, req.Status); err != nil {
		return fail(c, 500, "Failed to update position status: "+err.Error())
	}

	return success(c, map[string]string{"message": "Position status updated successfully"})
}

// =====================================================
// 路由注册
// =====================================================

func (h *PositionHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	// 公开路由
	g.GET("", h.ListPositions)
	g.GET("/v2", h.ListPositionsV2)
	g.GET("/search", h.SearchPositions)
	g.GET("/stats", h.GetPositionStats)
	g.GET("/stats/province", h.GetStatsByProvince)
	g.GET("/stats/exam-type", h.GetStatsByExamType)
	g.GET("/stats/trends", h.GetPositionTrends)
	g.GET("/filter-options", h.GetFilterOptions)
	g.GET("/regions", h.GetCascadeRegions)
	g.GET("/districts", h.GetDistricts)
	g.GET("/hot", h.GetHotPositions)
	g.GET("/expiring", h.GetExpiringPositions)
	g.GET("/latest", h.GetLatestPositions)
	g.GET("/:id", h.GetPosition)
	g.GET("/:id/similar", h.GetSimilarPositions)
	g.POST("/compare", h.ComparePositions)

	// 需要登录的路由
	g.GET("/recommended", h.GetRecommendedPositions, authMiddleware)
	g.POST("/:id/favorite", h.AddFavorite, authMiddleware)
	g.DELETE("/:id/favorite", h.RemoveFavorite, authMiddleware)
}

// RegisterAdminRoutes 注册管理端路由
func (h *PositionHandler) RegisterAdminRoutes(g *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	positionGroup := g.Group("/positions")
	positionGroup.Use(adminAuthMiddleware)

	positionGroup.DELETE("/:id", h.AdminDeletePosition)
	positionGroup.POST("/batch-delete", h.AdminBatchDeletePositions)
	positionGroup.PUT("/:id/status", h.AdminUpdatePositionStatus)
	positionGroup.PUT("/batch-status", h.AdminBatchUpdateStatus)
}
