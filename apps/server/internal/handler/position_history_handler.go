package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

type PositionHistoryHandler struct {
	historyService  *service.PositionHistoryService
	positionService *service.PositionService
}

func NewPositionHistoryHandler(historyService *service.PositionHistoryService, positionService *service.PositionService) *PositionHistoryHandler {
	return &PositionHistoryHandler{
		historyService:  historyService,
		positionService: positionService,
	}
}

// =====================================================
// 公开 API 端点
// =====================================================

// ListHistories returns a paginated list of history records
// @Summary List History Records
// @Description Get a paginated list of position history records with filters
// @Tags History
// @Accept json
// @Produce json
// @Param position_code query string false "Position code filter"
// @Param position_name query string false "Position name filter"
// @Param department_name query string false "Department name filter"
// @Param province query string false "Province filter"
// @Param exam_type query string false "Exam type filter"
// @Param year query int false "Year filter"
// @Param year_from query int false "Year from filter"
// @Param year_to query int false "Year to filter"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param sort_by query string false "Sort field" default(year)
// @Param sort_order query string false "Sort order" default(desc)
// @Success 200 {object} Response
// @Router /api/v1/history [get]
func (h *PositionHistoryHandler) ListHistories(c echo.Context) error {
	var params repository.PositionHistoryQueryParams
	if err := c.Bind(&params); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	result, err := h.historyService.ListHistories(&params)
	if err != nil {
		return fail(c, 500, "Failed to fetch history records: "+err.Error())
	}

	return success(c, result)
}

// GetHistoryByID returns history record details
// @Summary Get History Record Detail
// @Description Get detailed information for a specific history record
// @Tags History
// @Accept json
// @Produce json
// @Param id path int true "History Record ID"
// @Success 200 {object} Response
// @Router /api/v1/history/{id} [get]
func (h *PositionHistoryHandler) GetHistoryByID(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid history record ID")
	}

	history, err := h.historyService.GetHistoryByID(uint(id))
	if err != nil {
		if err == service.ErrHistoryNotFound {
			return fail(c, 404, "History record not found")
		}
		return fail(c, 500, "Failed to fetch history record: "+err.Error())
	}

	return success(c, history)
}

// GetPositionHistory returns history data for a specific position
// @Summary Get Position History
// @Description Get historical data for a specific position by position code
// @Tags History
// @Accept json
// @Produce json
// @Param id path int true "Position ID"
// @Success 200 {object} Response
// @Router /api/v1/positions/{id}/history [get]
func (h *PositionHistoryHandler) GetPositionHistory(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid position ID")
	}

	// 获取职位信息
	position, err := h.positionService.GetPositionDetail(uint(id))
	if err != nil {
		if err == service.ErrPositionNotFound {
			return fail(c, 404, "Position not found")
		}
		return fail(c, 500, "Failed to fetch position: "+err.Error())
	}

	// 获取历年数据
	histories, err := h.historyService.GetPositionHistory(position.PositionCode)
	if err != nil {
		return fail(c, 500, "Failed to fetch position history: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"position_code": position.PositionCode,
		"position_name": position.PositionName,
		"histories":     histories,
	})
}

// GetDepartmentHistory returns history data for a specific department
// @Summary Get Department History
// @Description Get historical data for a specific department
// @Tags History
// @Accept json
// @Produce json
// @Param name path string true "Department name"
// @Success 200 {object} Response
// @Router /api/v1/history/department/{name} [get]
func (h *PositionHistoryHandler) GetDepartmentHistory(c echo.Context) error {
	deptName := c.Param("name")
	if deptName == "" {
		return fail(c, 400, "Department name is required")
	}

	histories, err := h.historyService.GetDepartmentHistory(deptName)
	if err != nil {
		return fail(c, 500, "Failed to fetch department history: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"department_name": deptName,
		"histories":       histories,
	})
}

// GetYearlyTrends returns yearly trend data
// @Summary Get Yearly Trends
// @Description Get yearly trend data for positions
// @Tags History
// @Accept json
// @Produce json
// @Param position_code query string false "Position code"
// @Param department_code query string false "Department code"
// @Param exam_type query string false "Exam type"
// @Param province query string false "Province"
// @Success 200 {object} Response
// @Router /api/v1/history/trends [get]
func (h *PositionHistoryHandler) GetYearlyTrends(c echo.Context) error {
	positionCode := c.QueryParam("position_code")
	departmentCode := c.QueryParam("department_code")
	examType := c.QueryParam("exam_type")
	province := c.QueryParam("province")

	var trends *service.YearlyTrendResponse
	var err error

	if positionCode != "" {
		trends, err = h.historyService.GetYearlyTrend(positionCode)
	} else if departmentCode != "" {
		trends, err = h.historyService.GetDepartmentYearlyTrend(departmentCode)
	} else {
		trends, err = h.historyService.GetRegionYearlyTrend(examType, province)
	}

	if err != nil {
		return fail(c, 500, "Failed to fetch trends: "+err.Error())
	}

	return success(c, trends)
}

// GetScoreLines returns average score lines
// @Summary Get Score Lines
// @Description Get average score lines for positions
// @Tags History
// @Accept json
// @Produce json
// @Param exam_type query string false "Exam type"
// @Param province query string false "Province"
// @Param years query int false "Number of years" default(3)
// @Success 200 {object} Response
// @Router /api/v1/history/score-lines [get]
func (h *PositionHistoryHandler) GetScoreLines(c echo.Context) error {
	examType := c.QueryParam("exam_type")
	province := c.QueryParam("province")
	years, _ := strconv.Atoi(c.QueryParam("years"))

	scoreLine, err := h.historyService.GetAverageScoreLine(examType, province, years)
	if err != nil {
		return fail(c, 500, "Failed to fetch score lines: "+err.Error())
	}

	return success(c, scoreLine)
}

// GetScorePrediction returns score prediction for a position
// @Summary Get Score Prediction
// @Description Predict score line for a specific position
// @Tags History
// @Accept json
// @Produce json
// @Param id path int true "Position ID"
// @Success 200 {object} Response
// @Router /api/v1/positions/{id}/score-prediction [get]
func (h *PositionHistoryHandler) GetScorePrediction(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid position ID")
	}

	// 获取职位信息
	position, err := h.positionService.GetPositionDetail(uint(id))
	if err != nil {
		if err == service.ErrPositionNotFound {
			return fail(c, 404, "Position not found")
		}
		return fail(c, 500, "Failed to fetch position: "+err.Error())
	}

	// 预测分数线
	prediction, err := h.historyService.PredictScoreLineByPosition(position)
	if err != nil {
		if err == service.ErrInsufficientData {
			return success(c, map[string]interface{}{
				"has_prediction": false,
				"message":        "Insufficient historical data for prediction",
			})
		}
		return fail(c, 500, "Failed to predict score: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"has_prediction": true,
		"prediction":     prediction,
	})
}

// GetHistoryStats returns history statistics
// @Summary Get History Statistics
// @Description Get aggregated statistics for historical data
// @Tags History
// @Accept json
// @Produce json
// @Param exam_type query string false "Exam type"
// @Param province query string false "Province"
// @Success 200 {object} Response
// @Router /api/v1/history/stats [get]
func (h *PositionHistoryHandler) GetHistoryStats(c echo.Context) error {
	examType := c.QueryParam("exam_type")
	province := c.QueryParam("province")

	stats, err := h.historyService.GetHistoryStats(examType, province)
	if err != nil {
		return fail(c, 500, "Failed to fetch statistics: "+err.Error())
	}

	return success(c, stats)
}

// GetStatsByYear returns statistics grouped by year
// @Summary Get Stats By Year
// @Description Get history statistics grouped by year
// @Tags History
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/history/stats/year [get]
func (h *PositionHistoryHandler) GetStatsByYear(c echo.Context) error {
	stats, err := h.historyService.GetStatsByYear()
	if err != nil {
		return fail(c, 500, "Failed to fetch year stats: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"stats": stats,
	})
}

// GetStatsByProvince returns statistics grouped by province
// @Summary Get Stats By Province
// @Description Get history statistics grouped by province
// @Tags History
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/history/stats/province [get]
func (h *PositionHistoryHandler) GetStatsByProvince(c echo.Context) error {
	stats, err := h.historyService.GetStatsByProvince()
	if err != nil {
		return fail(c, 500, "Failed to fetch province stats: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"stats": stats,
	})
}

// GetStatsByExamType returns statistics grouped by exam type
// @Summary Get Stats By Exam Type
// @Description Get history statistics grouped by exam type
// @Tags History
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/history/stats/exam-type [get]
func (h *PositionHistoryHandler) GetStatsByExamType(c echo.Context) error {
	stats, err := h.historyService.GetStatsByExamType()
	if err != nil {
		return fail(c, 500, "Failed to fetch exam type stats: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"stats": stats,
	})
}

// GetFilterOptions returns filter options
// @Summary Get Filter Options
// @Description Get available filter options for history data
// @Tags History
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/history/filter-options [get]
func (h *PositionHistoryHandler) GetFilterOptions(c echo.Context) error {
	options, err := h.historyService.GetFilterOptions()
	if err != nil {
		return fail(c, 500, "Failed to fetch filter options: "+err.Error())
	}

	return success(c, options)
}

// =====================================================
// 管理端 API 端点
// =====================================================

// AdminCreateHistory creates a new history record
// @Summary Create History Record (Admin)
// @Description Create a new history record
// @Tags History Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.CreateHistoryRequest true "History data"
// @Success 200 {object} Response
// @Router /api/v1/admin/history [post]
func (h *PositionHistoryHandler) AdminCreateHistory(c echo.Context) error {
	var req service.CreateHistoryRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	history, err := h.historyService.CreateHistory(&req)
	if err != nil {
		return fail(c, 500, "Failed to create history record: "+err.Error())
	}

	return success(c, history)
}

// AdminUpdateHistory updates an existing history record
// @Summary Update History Record (Admin)
// @Description Update an existing history record
// @Tags History Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "History Record ID"
// @Param request body service.CreateHistoryRequest true "History data"
// @Success 200 {object} Response
// @Router /api/v1/admin/history/{id} [put]
func (h *PositionHistoryHandler) AdminUpdateHistory(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid history record ID")
	}

	var req service.CreateHistoryRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	history, err := h.historyService.UpdateHistory(uint(id), &req)
	if err != nil {
		if err == service.ErrHistoryNotFound {
			return fail(c, 404, "History record not found")
		}
		return fail(c, 500, "Failed to update history record: "+err.Error())
	}

	return success(c, history)
}

// AdminDeleteHistory deletes a history record
// @Summary Delete History Record (Admin)
// @Description Delete a history record by ID
// @Tags History Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "History Record ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/history/{id} [delete]
func (h *PositionHistoryHandler) AdminDeleteHistory(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid history record ID")
	}

	if err := h.historyService.DeleteHistory(uint(id)); err != nil {
		return fail(c, 500, "Failed to delete history record: "+err.Error())
	}

	return success(c, map[string]string{"message": "History record deleted successfully"})
}

// AdminBatchDeleteHistories deletes multiple history records
// @Summary Batch Delete History Records (Admin)
// @Description Delete multiple history records by IDs
// @Tags History Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body object true "History Record IDs"
// @Success 200 {object} Response
// @Router /api/v1/admin/history/batch-delete [post]
func (h *PositionHistoryHandler) AdminBatchDeleteHistories(c echo.Context) error {
	var req struct {
		IDs []uint `json:"ids"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if len(req.IDs) == 0 {
		return fail(c, 400, "No history record IDs provided")
	}

	if err := h.historyService.BatchDeleteHistories(req.IDs); err != nil {
		return fail(c, 500, "Failed to delete history records: "+err.Error())
	}

	return success(c, map[string]string{"message": "History records deleted successfully"})
}

// AdminImportHistories imports history data
// @Summary Import History Records (Admin)
// @Description Import multiple history records
// @Tags History Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.ImportHistoryRequest true "History data"
// @Success 200 {object} Response
// @Router /api/v1/admin/history/import [post]
func (h *PositionHistoryHandler) AdminImportHistories(c echo.Context) error {
	var req service.ImportHistoryRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if len(req.Histories) == 0 {
		return fail(c, 400, "No history data provided")
	}

	if err := h.historyService.ImportHistoryData(req.Histories); err != nil {
		return fail(c, 500, "Failed to import history data: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "History data imported successfully",
		"count":   len(req.Histories),
	})
}

// =====================================================
// 路由注册
// =====================================================

// RegisterRoutes 注册公开路由
func (h *PositionHistoryHandler) RegisterRoutes(g *echo.Group) {
	// 历年数据列表和详情
	g.GET("", h.ListHistories)
	g.GET("/:id", h.GetHistoryByID)
	g.GET("/department/:name", h.GetDepartmentHistory)

	// 趋势和分析
	g.GET("/trends", h.GetYearlyTrends)
	g.GET("/score-lines", h.GetScoreLines)

	// 统计
	g.GET("/stats", h.GetHistoryStats)
	g.GET("/stats/year", h.GetStatsByYear)
	g.GET("/stats/province", h.GetStatsByProvince)
	g.GET("/stats/exam-type", h.GetStatsByExamType)

	// 筛选选项
	g.GET("/filter-options", h.GetFilterOptions)
}

// RegisterPositionRoutes 注册职位相关历史路由
func (h *PositionHistoryHandler) RegisterPositionRoutes(g *echo.Group) {
	g.GET("/:id/history", h.GetPositionHistory)
	g.GET("/:id/score-prediction", h.GetScorePrediction)
}

// RegisterAdminRoutes 注册管理端路由
func (h *PositionHistoryHandler) RegisterAdminRoutes(g *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	historyGroup := g.Group("/history")
	historyGroup.Use(adminAuthMiddleware)

	historyGroup.POST("", h.AdminCreateHistory)
	historyGroup.PUT("/:id", h.AdminUpdateHistory)
	historyGroup.DELETE("/:id", h.AdminDeleteHistory)
	historyGroup.POST("/batch-delete", h.AdminBatchDeleteHistories)
	historyGroup.POST("/import", h.AdminImportHistories)
}
