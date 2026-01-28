package handler

import (
	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

// CompareHandler 对比处理器
type CompareHandler struct {
	compareService *service.CompareService
}

// NewCompareHandler 创建对比处理器
func NewCompareHandler(compareService *service.CompareService) *CompareHandler {
	return &CompareHandler{compareService: compareService}
}

// ComparePositionsRequest 对比请求
type ComparePositionsRequest struct {
	IDs []uint `json:"ids" validate:"required,min=2,max=5"`
}

// ComparePositions 对比职位
// @Summary Compare Positions
// @Description Compare multiple positions with detailed analysis
// @Tags Compare
// @Accept json
// @Produce json
// @Param request body ComparePositionsRequest true "Position IDs to compare"
// @Success 200 {object} Response
// @Router /api/v1/compare/positions [post]
func (h *CompareHandler) ComparePositions(c echo.Context) error {
	var req ComparePositionsRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "请求参数无效")
	}

	if len(req.IDs) < 2 {
		return fail(c, 400, "请选择至少2个职位进行对比")
	}
	if len(req.IDs) > 5 {
		return fail(c, 400, "最多只能对比5个职位")
	}

	result, err := h.compareService.ComparePositions(req.IDs)
	if err != nil {
		return fail(c, 500, "对比失败: "+err.Error())
	}

	return success(c, result)
}

// GetCompareItems 获取对比数据
// @Summary Get Compare Items
// @Description Get compare items by position IDs
// @Tags Compare
// @Accept json
// @Produce json
// @Param ids query []uint true "Position IDs"
// @Success 200 {object} Response
// @Router /api/v1/compare/items [get]
func (h *CompareHandler) GetCompareItems(c echo.Context) error {
	var ids []uint
	if err := echo.QueryParamsBinder(c).Uints("ids", &ids).BindError(); err != nil {
		return fail(c, 400, "请求参数无效")
	}

	if len(ids) < 2 {
		return fail(c, 400, "请选择至少2个职位进行对比")
	}
	if len(ids) > 5 {
		return fail(c, 400, "最多只能对比5个职位")
	}

	items, err := h.compareService.GetCompareItems(ids)
	if err != nil {
		return fail(c, 500, "获取对比数据失败: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"items": items,
	})
}

// ExportCompareReport 导出对比报告
// @Summary Export Compare Report
// @Description Export compare report as PDF or Excel
// @Tags Compare
// @Accept json
// @Produce application/octet-stream
// @Param request body ComparePositionsRequest true "Position IDs to compare"
// @Param format query string false "Export format: pdf, excel" default(excel)
// @Success 200 {file} binary
// @Router /api/v1/compare/export [post]
func (h *CompareHandler) ExportCompareReport(c echo.Context) error {
	var req ComparePositionsRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "请求参数无效")
	}

	format := c.QueryParam("format")
	if format == "" {
		format = "excel"
	}

	if len(req.IDs) < 2 {
		return fail(c, 400, "请选择至少2个职位进行对比")
	}
	if len(req.IDs) > 5 {
		return fail(c, 400, "最多只能对比5个职位")
	}

	// 获取对比数据
	result, err := h.compareService.ComparePositions(req.IDs)
	if err != nil {
		return fail(c, 500, "对比失败: "+err.Error())
	}

	// TODO: 实现 PDF/Excel 导出功能
	// 目前返回 JSON 数据，后续实现文件导出
	switch format {
	case "pdf":
		// 返回 PDF
		return success(c, map[string]interface{}{
			"message": "PDF导出功能开发中",
			"data":    result,
		})
	case "excel":
		// 返回 Excel
		return success(c, map[string]interface{}{
			"message": "Excel导出功能开发中",
			"data":    result,
		})
	default:
		return fail(c, 400, "不支持的导出格式")
	}
}

// RegisterRoutes 注册路由
func (h *CompareHandler) RegisterRoutes(g *echo.Group) {
	compareGroup := g.Group("/compare")

	compareGroup.POST("/positions", h.ComparePositions)
	compareGroup.GET("/items", h.GetCompareItems)
	compareGroup.POST("/export", h.ExportCompareReport)
}
