package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"

	"server/internal/service"
)

type SearchHandler struct {
	searchService *service.SearchService
}

func NewSearchHandler(searchService *service.SearchService) *SearchHandler {
	return &SearchHandler{
		searchService: searchService,
	}
}

type SearchRequest struct {
	Keyword    string `query:"keyword"`
	Province   string `query:"province"`
	City       string `query:"city"`
	Department string `query:"department"`
	Education  string `query:"education"`
	ExamType   string `query:"exam_type"`
	Page       int    `query:"page"`
	PageSize   int    `query:"page_size"`
}

// Search godoc
// @Summary 全文搜索职位
// @Description 使用Elasticsearch进行职位全文搜索
// @Tags 搜索
// @Accept json
// @Produce json
// @Param keyword query string false "搜索关键词"
// @Param province query string false "省份代码"
// @Param city query string false "城市代码"
// @Param education query string false "学历要求"
// @Param exam_type query string false "考试类型"
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(20)
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/search/positions [get]
func (h *SearchHandler) Search(c echo.Context) error {
	var req SearchRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "参数错误",
		})
	}

	if req.Page < 1 {
		req.Page = 1
	}
	if req.PageSize < 1 || req.PageSize > 100 {
		req.PageSize = 20
	}

	query := service.SearchQuery{
		Keyword:    req.Keyword,
		Province:   req.Province,
		City:       req.City,
		Department: req.Department,
		Education:  req.Education,
		ExamType:   req.ExamType,
		Page:       req.Page,
		PageSize:   req.PageSize,
	}

	result, err := h.searchService.Search(c.Request().Context(), query)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "搜索失败",
			"error":   err.Error(),
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data": map[string]interface{}{
			"total":     result.Total,
			"positions": result.Positions,
			"took_ms":   result.Took,
			"page":      req.Page,
			"page_size": req.PageSize,
		},
	})
}

// Suggest godoc
// @Summary 搜索建议
// @Description 根据输入前缀返回搜索建议
// @Tags 搜索
// @Accept json
// @Produce json
// @Param prefix query string true "搜索前缀"
// @Param size query int false "建议数量" default(10)
// @Success 200 {object} map[string]interface{}
// @Router /api/v1/search/suggest [get]
func (h *SearchHandler) Suggest(c echo.Context) error {
	prefix := c.QueryParam("prefix")
	if prefix == "" {
		return c.JSON(http.StatusBadRequest, map[string]interface{}{
			"code":    400,
			"message": "请输入搜索内容",
		})
	}

	size := 10
	if sizeStr := c.QueryParam("size"); sizeStr != "" {
		if s, err := strconv.Atoi(sizeStr); err == nil && s > 0 {
			size = s
		}
	}

	suggestions, err := h.searchService.Suggest(c.Request().Context(), prefix, size)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]interface{}{
			"code":    500,
			"message": "获取建议失败",
		})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"message": "success",
		"data":    suggestions,
	})
}

func (h *SearchHandler) RegisterRoutes(g *echo.Group) {
	g.GET("/positions", h.Search)
	g.GET("/suggest", h.Suggest)
}
