package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// ExamLocationHandler 考点处理器
type ExamLocationHandler struct {
	locationService *service.ExamLocationService
}

func NewExamLocationHandler(locationService *service.ExamLocationService) *ExamLocationHandler {
	return &ExamLocationHandler{locationService: locationService}
}

// ListLocations 获取考点列表
// @Summary List Exam Locations
// @Description Get a paginated list of exam locations with filters
// @Tags ExamTools
// @Accept json
// @Produce json
// @Param province query string false "Province filter"
// @Param city query string false "City filter"
// @Param exam_type query string false "Exam type filter"
// @Param keyword query string false "Keyword search"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/tools/locations [get]
func (h *ExamLocationHandler) ListLocations(c echo.Context) error {
	var req service.ExamLocationListRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.locationService.ListLocations(&req)
	if err != nil {
		return fail(c, 500, "Failed to fetch locations: "+err.Error())
	}

	return success(c, result)
}

// GetLocation 获取考点详情
// @Summary Get Exam Location Detail
// @Description Get detailed information for a specific exam location
// @Tags ExamTools
// @Accept json
// @Produce json
// @Param id path int true "Location ID"
// @Success 200 {object} Response
// @Router /api/v1/tools/locations/{id} [get]
func (h *ExamLocationHandler) GetLocation(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid location ID")
	}

	location, err := h.locationService.GetLocationDetail(uint(id))
	if err != nil {
		if err == service.ErrExamLocationNotFound {
			return fail(c, 404, "Location not found")
		}
		return fail(c, 500, "Failed to fetch location: "+err.Error())
	}

	return success(c, location.ToResponse())
}

// GetProvinces 获取省份列表
// @Summary Get Provinces
// @Description Get list of provinces with exam locations
// @Tags ExamTools
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/tools/locations/provinces [get]
func (h *ExamLocationHandler) GetProvinces(c echo.Context) error {
	provinces, err := h.locationService.GetProvinces()
	if err != nil {
		return fail(c, 500, "Failed to fetch provinces: "+err.Error())
	}
	return success(c, provinces)
}

// GetCities 获取城市列表
// @Summary Get Cities
// @Description Get list of cities for a province
// @Tags ExamTools
// @Produce json
// @Param province query string true "Province name"
// @Success 200 {object} Response
// @Router /api/v1/tools/locations/cities [get]
func (h *ExamLocationHandler) GetCities(c echo.Context) error {
	province := c.QueryParam("province")
	if province == "" {
		return fail(c, 400, "Province is required")
	}

	cities, err := h.locationService.GetCities(province)
	if err != nil {
		return fail(c, 500, "Failed to fetch cities: "+err.Error())
	}
	return success(c, cities)
}

// SearchLocations 搜索考点
// @Summary Search Exam Locations
// @Description Search exam locations by keyword
// @Tags ExamTools
// @Produce json
// @Param keyword query string true "Search keyword"
// @Param limit query int false "Result limit" default(20)
// @Success 200 {object} Response
// @Router /api/v1/tools/locations/search [get]
func (h *ExamLocationHandler) SearchLocations(c echo.Context) error {
	keyword := c.QueryParam("keyword")
	if keyword == "" {
		return fail(c, 400, "Keyword is required")
	}

	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	locations, err := h.locationService.SearchLocations(keyword, limit)
	if err != nil {
		return fail(c, 500, "Failed to search locations: "+err.Error())
	}
	return success(c, locations)
}

// FindNearbyLocations 查找附近考点
// @Summary Find Nearby Locations
// @Description Find exam locations near a given coordinate
// @Tags ExamTools
// @Produce json
// @Param lat query number true "Latitude"
// @Param lng query number true "Longitude"
// @Param radius query number false "Search radius in km" default(10)
// @Param limit query int false "Result limit" default(20)
// @Success 200 {object} Response
// @Router /api/v1/tools/locations/nearby [get]
func (h *ExamLocationHandler) FindNearbyLocations(c echo.Context) error {
	lat, err := strconv.ParseFloat(c.QueryParam("lat"), 64)
	if err != nil {
		return fail(c, 400, "Invalid latitude")
	}
	lng, err := strconv.ParseFloat(c.QueryParam("lng"), 64)
	if err != nil {
		return fail(c, 400, "Invalid longitude")
	}

	radius, _ := strconv.ParseFloat(c.QueryParam("radius"), 64)
	limit, _ := strconv.Atoi(c.QueryParam("limit"))

	req := &service.NearbyLocationRequest{
		Latitude:  lat,
		Longitude: lng,
		RadiusKm:  radius,
		Limit:     limit,
	}

	locations, err := h.locationService.FindNearbyLocations(req)
	if err != nil {
		return fail(c, 500, "Failed to find nearby locations: "+err.Error())
	}
	return success(c, locations)
}

// RegisterRoutes 注册路由
func (h *ExamLocationHandler) RegisterRoutes(g *echo.Group) {
	g.GET("", h.ListLocations)
	g.GET("/provinces", h.GetProvinces)
	g.GET("/cities", h.GetCities)
	g.GET("/search", h.SearchLocations)
	g.GET("/nearby", h.FindNearbyLocations)
	g.GET("/:id", h.GetLocation)
}

// RegisterAdminRoutes 注册管理员路由
func (h *ExamLocationHandler) RegisterAdminRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	locations := g.Group("/locations")
	locations.Use(authMiddleware)
	locations.POST("", h.CreateLocation)
	locations.PUT("/:id", h.UpdateLocation)
	locations.DELETE("/:id", h.DeleteLocation)
}

// CreateLocation 创建考点（管理员）
func (h *ExamLocationHandler) CreateLocation(c echo.Context) error {
	var location model.ExamLocation
	if err := c.Bind(&location); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.locationService.CreateLocation(&location); err != nil {
		return fail(c, 500, "Failed to create location: "+err.Error())
	}

	return success(c, location.ToResponse())
}

// UpdateLocation 更新考点（管理员）
func (h *ExamLocationHandler) UpdateLocation(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid location ID")
	}

	location, err := h.locationService.GetLocationDetail(uint(id))
	if err != nil {
		return fail(c, 404, "Location not found")
	}

	if err := c.Bind(location); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.locationService.UpdateLocation(location); err != nil {
		return fail(c, 500, "Failed to update location: "+err.Error())
	}

	return success(c, location.ToResponse())
}

// DeleteLocation 删除考点（管理员）
func (h *ExamLocationHandler) DeleteLocation(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid location ID")
	}

	if err := h.locationService.DeleteLocation(uint(id)); err != nil {
		return fail(c, 500, "Failed to delete location: "+err.Error())
	}

	return success(c, nil)
}

// ScoreEstimateHandler 估分处理器
type ScoreEstimateHandler struct {
	estimateService *service.ScoreEstimateService
}

func NewScoreEstimateHandler(estimateService *service.ScoreEstimateService) *ScoreEstimateHandler {
	return &ScoreEstimateHandler{estimateService: estimateService}
}

// CalculateScore 计算估分
// @Summary Calculate Score Estimate
// @Description Calculate estimated score based on answers
// @Tags ExamTools
// @Accept json
// @Produce json
// @Param request body service.ScoreEstimateRequest true "Score estimate request"
// @Success 200 {object} Response
// @Router /api/v1/tools/estimate [post]
func (h *ScoreEstimateHandler) CalculateScore(c echo.Context) error {
	var req service.ScoreEstimateRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.ExamType == "" {
		return fail(c, 400, "Exam type is required")
	}

	// 获取用户ID（可选）
	var userID *uint
	if id, ok := c.Get("user_id").(uint); ok {
		userID = &id
	}

	result, err := h.estimateService.CalculateScore(&req, userID)
	if err != nil {
		return fail(c, 500, "Failed to calculate score: "+err.Error())
	}

	return success(c, result)
}

// GetUserEstimates 获取用户估分历史
// @Summary Get User Estimates
// @Description Get user's score estimate history
// @Tags ExamTools
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/tools/estimate/history [get]
func (h *ScoreEstimateHandler) GetUserEstimates(c echo.Context) error {
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return fail(c, 401, "Unauthorized")
	}

	estimates, err := h.estimateService.GetUserEstimates(userID)
	if err != nil {
		return fail(c, 500, "Failed to fetch estimates: "+err.Error())
	}

	return success(c, estimates)
}

// UpdateActualScore 更新实际分数
// @Summary Update Actual Score
// @Description Update actual score for an estimate
// @Tags ExamTools
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Estimate ID"
// @Param actual_score body float64 true "Actual score"
// @Success 200 {object} Response
// @Router /api/v1/tools/estimate/{id}/actual [put]
func (h *ScoreEstimateHandler) UpdateActualScore(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid estimate ID")
	}

	var req struct {
		ActualScore float64 `json:"actual_score"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.estimateService.UpdateActualScore(uint(id), req.ActualScore); err != nil {
		return fail(c, 500, "Failed to update score: "+err.Error())
	}

	return success(c, nil)
}

// RegisterRoutes 注册路由
func (h *ScoreEstimateHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	g.POST("", h.CalculateScore)
	g.GET("/history", h.GetUserEstimates, authMiddleware)
	g.PUT("/:id/actual", h.UpdateActualScore, authMiddleware)
}

// ScoreShareHandler 晒分处理器
type ScoreShareHandler struct {
	shareService *service.ScoreShareService
}

func NewScoreShareHandler(shareService *service.ScoreShareService) *ScoreShareHandler {
	return &ScoreShareHandler{shareService: shareService}
}

// CreateShare 创建晒分
// @Summary Create Score Share
// @Description Share exam score
// @Tags ExamTools
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.ScoreShareCreateRequest true "Score share request"
// @Success 200 {object} Response
// @Router /api/v1/tools/scores [post]
func (h *ScoreShareHandler) CreateShare(c echo.Context) error {
	var req service.ScoreShareCreateRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.ExamType == "" || req.ExamYear == 0 {
		return fail(c, 400, "Exam type and year are required")
	}

	// 获取用户ID（可选）
	var userID *uint
	if id, ok := c.Get("user_id").(uint); ok {
		userID = &id
	}

	share, err := h.shareService.CreateShare(&req, userID)
	if err != nil {
		return fail(c, 500, "Failed to create share: "+err.Error())
	}

	return success(c, share.ToResponse())
}

// ListShares 获取晒分列表
// @Summary List Score Shares
// @Description Get a paginated list of score shares
// @Tags ExamTools
// @Produce json
// @Param exam_type query string false "Exam type filter"
// @Param exam_year query int false "Exam year filter"
// @Param exam_province query string false "Province filter"
// @Param pass_status query string false "Pass status filter"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/tools/scores [get]
func (h *ScoreShareHandler) ListShares(c echo.Context) error {
	var req service.ScoreShareListRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.shareService.ListShares(&req)
	if err != nil {
		return fail(c, 500, "Failed to fetch shares: "+err.Error())
	}

	return success(c, result)
}

// GetShare 获取晒分详情
// @Summary Get Score Share Detail
// @Description Get detailed information for a specific score share
// @Tags ExamTools
// @Produce json
// @Param id path int true "Share ID"
// @Success 200 {object} Response
// @Router /api/v1/tools/scores/{id} [get]
func (h *ScoreShareHandler) GetShare(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid share ID")
	}

	share, err := h.shareService.GetShareDetail(uint(id))
	if err != nil {
		if err == service.ErrScoreShareNotFound {
			return fail(c, 404, "Share not found")
		}
		return fail(c, 500, "Failed to fetch share: "+err.Error())
	}

	return success(c, share.ToResponse())
}

// GetUserShares 获取用户晒分历史
// @Summary Get User Shares
// @Description Get user's score share history
// @Tags ExamTools
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/tools/scores/my [get]
func (h *ScoreShareHandler) GetUserShares(c echo.Context) error {
	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return fail(c, 401, "Unauthorized")
	}

	shares, err := h.shareService.GetUserShares(userID)
	if err != nil {
		return fail(c, 500, "Failed to fetch shares: "+err.Error())
	}

	var responses []model.ScoreShareResponse
	for _, share := range shares {
		responses = append(responses, *share.ToResponse())
	}

	return success(c, responses)
}

// LikeShare 点赞晒分
// @Summary Like Score Share
// @Description Like a score share
// @Tags ExamTools
// @Produce json
// @Param id path int true "Share ID"
// @Success 200 {object} Response
// @Router /api/v1/tools/scores/{id}/like [post]
func (h *ScoreShareHandler) LikeShare(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid share ID")
	}

	if err := h.shareService.LikeShare(uint(id)); err != nil {
		if err == service.ErrScoreShareNotFound {
			return fail(c, 404, "Share not found")
		}
		return fail(c, 500, "Failed to like share: "+err.Error())
	}

	return success(c, nil)
}

// GetStatistics 获取分数统计
// @Summary Get Score Statistics
// @Description Get score statistics for an exam
// @Tags ExamTools
// @Produce json
// @Param exam_type query string false "Exam type"
// @Param exam_year query int false "Exam year"
// @Param exam_province query string false "Province"
// @Success 200 {object} Response
// @Router /api/v1/tools/scores/statistics [get]
func (h *ScoreShareHandler) GetStatistics(c echo.Context) error {
	examType := c.QueryParam("exam_type")
	examYear, _ := strconv.Atoi(c.QueryParam("exam_year"))
	examProvince := c.QueryParam("exam_province")

	stats, err := h.shareService.GetStatistics(examType, examYear, examProvince)
	if err != nil {
		return fail(c, 500, "Failed to fetch statistics: "+err.Error())
	}

	return success(c, stats)
}

// GetRanking 获取分数排行榜
// @Summary Get Score Ranking
// @Description Get score ranking for an exam
// @Tags ExamTools
// @Produce json
// @Param exam_type query string false "Exam type"
// @Param exam_year query int false "Exam year"
// @Param exam_province query string false "Province"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/tools/scores/ranking [get]
func (h *ScoreShareHandler) GetRanking(c echo.Context) error {
	examType := c.QueryParam("exam_type")
	examYear, _ := strconv.Atoi(c.QueryParam("exam_year"))
	examProvince := c.QueryParam("exam_province")
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	ranking, err := h.shareService.GetRanking(examType, examYear, examProvince, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to fetch ranking: "+err.Error())
	}

	return success(c, ranking)
}

// UpdateShare 更新晒分
func (h *ScoreShareHandler) UpdateShare(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid share ID")
	}

	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return fail(c, 401, "Unauthorized")
	}

	var req service.ScoreShareCreateRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.shareService.UpdateShare(uint(id), userID, &req); err != nil {
		return fail(c, 500, "Failed to update share: "+err.Error())
	}

	return success(c, nil)
}

// DeleteShare 删除晒分
func (h *ScoreShareHandler) DeleteShare(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid share ID")
	}

	userID, ok := c.Get("user_id").(uint)
	if !ok {
		return fail(c, 401, "Unauthorized")
	}

	if err := h.shareService.DeleteShare(uint(id), userID); err != nil {
		return fail(c, 500, "Failed to delete share: "+err.Error())
	}

	return success(c, nil)
}

// RegisterRoutes 注册路由
func (h *ScoreShareHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	g.GET("", h.ListShares)
	g.GET("/statistics", h.GetStatistics)
	g.GET("/ranking", h.GetRanking)
	g.GET("/my", h.GetUserShares, authMiddleware)
	g.GET("/:id", h.GetShare)
	g.POST("", h.CreateShare)
	g.POST("/:id/like", h.LikeShare)
	g.PUT("/:id", h.UpdateShare, authMiddleware)
	g.DELETE("/:id", h.DeleteShare, authMiddleware)
}
