package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type RegistrationDataHandler struct {
	regDataService *service.RegistrationDataService
}

func NewRegistrationDataHandler(regDataService *service.RegistrationDataService) *RegistrationDataHandler {
	return &RegistrationDataHandler{regDataService: regDataService}
}

// GetOverview 获取报名数据总览
// @Summary Get Registration Data Overview
// @Description Get overall registration data statistics including hot positions
// @Tags Registration Data
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/registration-data/overview [get]
func (h *RegistrationDataHandler) GetOverview(c echo.Context) error {
	overview, err := h.regDataService.GetOverview()
	if err != nil {
		return fail(c, 500, "Failed to fetch overview: "+err.Error())
	}

	return success(c, overview)
}

// GetHotPositionsByApplyCount 获取报名人数TOP职位
// @Summary Get Hot Positions By Apply Count
// @Description Get positions ranked by apply count
// @Tags Registration Data
// @Accept json
// @Produce json
// @Param limit query int false "Limit" default(10)
// @Success 200 {object} Response
// @Router /api/v1/registration-data/hot/apply-count [get]
func (h *RegistrationDataHandler) GetHotPositionsByApplyCount(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 10
	}

	positions, err := h.regDataService.GetHotPositionsByApplyCount(limit)
	if err != nil {
		return fail(c, 500, "Failed to fetch hot positions: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"positions": positions,
	})
}

// GetHotPositionsByCompetitionRatio 获取竞争比TOP职位
// @Summary Get Hot Positions By Competition Ratio
// @Description Get positions ranked by competition ratio
// @Tags Registration Data
// @Accept json
// @Produce json
// @Param limit query int false "Limit" default(10)
// @Success 200 {object} Response
// @Router /api/v1/registration-data/hot/competition-ratio [get]
func (h *RegistrationDataHandler) GetHotPositionsByCompetitionRatio(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 10
	}

	positions, err := h.regDataService.GetHotPositionsByCompetitionRatio(limit)
	if err != nil {
		return fail(c, 500, "Failed to fetch hot positions: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"positions": positions,
	})
}

// GetNoApplicantPositions 获取无人报考职位
// @Summary Get No Applicant Positions
// @Description Get positions with zero applicants
// @Tags Registration Data
// @Accept json
// @Produce json
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/registration-data/cold/no-applicant [get]
func (h *RegistrationDataHandler) GetNoApplicantPositions(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	result, err := h.regDataService.GetNoApplicantPositions(page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to fetch positions: "+err.Error())
	}

	return success(c, result)
}

// GetLowCompetitionPositions 获取低竞争比职位
// @Summary Get Low Competition Positions
// @Description Get positions with low competition ratio
// @Tags Registration Data
// @Accept json
// @Produce json
// @Param max_ratio query number false "Maximum competition ratio" default(10)
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/registration-data/cold/low-competition [get]
func (h *RegistrationDataHandler) GetLowCompetitionPositions(c echo.Context) error {
	maxRatio, _ := strconv.ParseFloat(c.QueryParam("max_ratio"), 64)
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	if maxRatio <= 0 {
		maxRatio = 10.0
	}
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}

	result, err := h.regDataService.GetLowCompetitionPositions(maxRatio, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to fetch positions: "+err.Error())
	}

	return success(c, result)
}

// GetRegistrationTrends 获取报名趋势
// @Summary Get Registration Trends
// @Description Get registration data trends over time
// @Tags Registration Data
// @Accept json
// @Produce json
// @Param days query int false "Number of days" default(30)
// @Success 200 {object} Response
// @Router /api/v1/registration-data/trends [get]
func (h *RegistrationDataHandler) GetRegistrationTrends(c echo.Context) error {
	days, _ := strconv.Atoi(c.QueryParam("days"))
	if days <= 0 {
		days = 30
	}

	result, err := h.regDataService.GetRegistrationTrends(days)
	if err != nil {
		return fail(c, 500, "Failed to fetch trends: "+err.Error())
	}

	return success(c, result)
}

// GetPositionTrends 获取单个职位的报名趋势
// @Summary Get Position Registration Trends
// @Description Get registration trends for a specific position
// @Tags Registration Data
// @Accept json
// @Produce json
// @Param id path int true "Position ID"
// @Param days query int false "Number of days" default(30)
// @Success 200 {object} Response
// @Router /api/v1/registration-data/position/{id}/trends [get]
func (h *RegistrationDataHandler) GetPositionTrends(c echo.Context) error {
	positionID := c.Param("id")
	if positionID == "" {
		return fail(c, 400, "Position ID is required")
	}

	days, _ := strconv.Atoi(c.QueryParam("days"))
	if days <= 0 {
		days = 30
	}

	result, err := h.regDataService.GetPositionTrends(positionID, days)
	if err != nil {
		return fail(c, 500, "Failed to fetch position trends: "+err.Error())
	}

	return success(c, result)
}

// GetStatsByProvince 按省份统计报名数据
// @Summary Get Registration Stats By Province
// @Description Get registration statistics grouped by province
// @Tags Registration Data
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/registration-data/stats/province [get]
func (h *RegistrationDataHandler) GetStatsByProvince(c echo.Context) error {
	result, err := h.regDataService.GetStatsByProvince()
	if err != nil {
		return fail(c, 500, "Failed to fetch province stats: "+err.Error())
	}

	return success(c, result)
}

// GetStatsByExamType 按考试类型统计报名数据
// @Summary Get Registration Stats By Exam Type
// @Description Get registration statistics grouped by exam type
// @Tags Registration Data
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/registration-data/stats/exam-type [get]
func (h *RegistrationDataHandler) GetStatsByExamType(c echo.Context) error {
	result, err := h.regDataService.GetStatsByExamType()
	if err != nil {
		return fail(c, 500, "Failed to fetch exam type stats: "+err.Error())
	}

	return success(c, result)
}

// CollectSnapshot 手动触发数据采集（管理员）
// @Summary Collect Registration Data Snapshot
// @Description Manually trigger collection of registration data snapshot
// @Tags Registration Data Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/registration-data/collect [post]
func (h *RegistrationDataHandler) CollectSnapshot(c echo.Context) error {
	err := h.regDataService.CollectSnapshot()
	if err != nil {
		return fail(c, 500, "Failed to collect snapshot: "+err.Error())
	}

	return success(c, map[string]string{"message": "Snapshot collected successfully"})
}

// CleanOldData 清理旧数据（管理员）
// @Summary Clean Old Registration Data
// @Description Clean old registration data snapshots
// @Tags Registration Data Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param days query int false "Keep data for last N days" default(90)
// @Success 200 {object} Response
// @Router /api/v1/admin/registration-data/clean [delete]
func (h *RegistrationDataHandler) CleanOldData(c echo.Context) error {
	days, _ := strconv.Atoi(c.QueryParam("days"))
	if days <= 0 {
		days = 90
	}

	err := h.regDataService.CleanOldData(days)
	if err != nil {
		return fail(c, 500, "Failed to clean old data: "+err.Error())
	}

	return success(c, map[string]string{"message": "Old data cleaned successfully"})
}

// RegisterRoutes 注册公开路由
func (h *RegistrationDataHandler) RegisterRoutes(g *echo.Group) {
	regDataGroup := g.Group("/registration-data")

	// 公开路由
	regDataGroup.GET("/overview", h.GetOverview)
	regDataGroup.GET("/hot/apply-count", h.GetHotPositionsByApplyCount)
	regDataGroup.GET("/hot/competition-ratio", h.GetHotPositionsByCompetitionRatio)
	regDataGroup.GET("/cold/no-applicant", h.GetNoApplicantPositions)
	regDataGroup.GET("/cold/low-competition", h.GetLowCompetitionPositions)
	regDataGroup.GET("/trends", h.GetRegistrationTrends)
	regDataGroup.GET("/position/:id/trends", h.GetPositionTrends)
	regDataGroup.GET("/stats/province", h.GetStatsByProvince)
	regDataGroup.GET("/stats/exam-type", h.GetStatsByExamType)
}

// RegisterAdminRoutes 注册管理端路由
func (h *RegistrationDataHandler) RegisterAdminRoutes(g *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	regDataGroup := g.Group("/registration-data")
	regDataGroup.Use(adminAuthMiddleware)

	regDataGroup.POST("/collect", h.CollectSnapshot)
	regDataGroup.DELETE("/clean", h.CleanOldData)
}
