package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type MajorHandler struct {
	majorService *service.MajorService
}

func NewMajorHandler(majorService *service.MajorService) *MajorHandler {
	return &MajorHandler{majorService: majorService}
}

// GetCategories godoc
// @Summary 获取专业大类列表
// @Description 获取所有专业大类列表
// @Tags Major
// @Accept json
// @Produce json
// @Success 200 {object} Response{data=service.CategoryListResponse}
// @Router /api/v1/majors/categories [get]
func (h *MajorHandler) GetCategories(c echo.Context) error {
	resp, err := h.majorService.GetCategories()
	if err != nil {
		return fail(c, 500, "获取专业大类失败: "+err.Error())
	}
	return success(c, resp)
}

// GetMajors godoc
// @Summary 获取专业列表
// @Description 获取专业列表，支持筛选和分页
// @Tags Major
// @Accept json
// @Produce json
// @Param category_code query string false "专业大类代码"
// @Param education_level query string false "学历层次"
// @Param page query int false "页码" default(1)
// @Param page_size query int false "每页数量" default(50)
// @Success 200 {object} Response{data=service.MajorListResponse}
// @Router /api/v1/majors [get]
func (h *MajorHandler) GetMajors(c echo.Context) error {
	categoryCode := c.QueryParam("category_code")
	educationLevel := c.QueryParam("education_level")
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 50
	}

	resp, err := h.majorService.GetMajors(categoryCode, educationLevel, page, pageSize)
	if err != nil {
		return fail(c, 500, "获取专业列表失败: "+err.Error())
	}
	return success(c, resp)
}

// SearchMajors godoc
// @Summary 搜索专业
// @Description 根据关键词搜索专业
// @Tags Major
// @Accept json
// @Produce json
// @Param keyword query string true "搜索关键词"
// @Param limit query int false "返回数量限制" default(20)
// @Success 200 {object} Response{data=service.MajorSearchResponse}
// @Router /api/v1/majors/search [get]
func (h *MajorHandler) SearchMajors(c echo.Context) error {
	keyword := c.QueryParam("keyword")
	if keyword == "" {
		return fail(c, 400, "请输入搜索关键词")
	}

	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 20
	}

	resp, err := h.majorService.SearchMajors(keyword, limit)
	if err != nil {
		return fail(c, 500, "搜索专业失败: "+err.Error())
	}
	return success(c, resp)
}

// GetMajorByCode godoc
// @Summary 获取专业详情
// @Description 根据专业代码获取专业详情
// @Tags Major
// @Accept json
// @Produce json
// @Param code path string true "专业代码"
// @Success 200 {object} Response{data=model.MajorResponse}
// @Router /api/v1/majors/{code} [get]
func (h *MajorHandler) GetMajorByCode(c echo.Context) error {
	code := c.Param("code")
	if code == "" {
		return fail(c, 400, "专业代码不能为空")
	}

	resp, err := h.majorService.GetMajorByCode(code)
	if err != nil {
		if err == service.ErrMajorNotFound {
			return fail(c, 404, "专业不存在")
		}
		return fail(c, 500, "获取专业详情失败: "+err.Error())
	}
	return success(c, resp)
}

// GetCascadeData godoc
// @Summary 获取级联数据
// @Description 获取专业大类-专业的级联数据
// @Tags Major
// @Accept json
// @Produce json
// @Success 200 {object} Response{data=service.MajorCascadeListResponse}
// @Router /api/v1/majors/cascade [get]
func (h *MajorHandler) GetCascadeData(c echo.Context) error {
	resp, err := h.majorService.GetCascadeData()
	if err != nil {
		return fail(c, 500, "获取级联数据失败: "+err.Error())
	}
	return success(c, resp)
}

// GetMajorsByCategory godoc
// @Summary 根据大类获取专业
// @Description 根据专业大类代码获取该大类下的所有专业
// @Tags Major
// @Accept json
// @Produce json
// @Param category_code path string true "专业大类代码"
// @Success 200 {object} Response{data=[]model.MajorResponse}
// @Router /api/v1/majors/categories/{category_code}/majors [get]
func (h *MajorHandler) GetMajorsByCategory(c echo.Context) error {
	categoryCode := c.Param("category_code")
	if categoryCode == "" {
		return fail(c, 400, "专业大类代码不能为空")
	}

	resp, err := h.majorService.GetMajorsByCategory(categoryCode)
	if err != nil {
		return fail(c, 500, "获取专业列表失败: "+err.Error())
	}
	return success(c, resp)
}

// InitMajorData godoc
// @Summary 初始化专业数据
// @Description 初始化专业目录数据（仅管理员可用）
// @Tags Major
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/majors/init [post]
func (h *MajorHandler) InitMajorData(c echo.Context) error {
	if err := h.majorService.InitMajorData(); err != nil {
		return fail(c, 500, "初始化专业数据失败: "+err.Error())
	}
	return success(c, map[string]string{"message": "专业数据初始化成功"})
}

// RegisterRoutes 注册路由
func (h *MajorHandler) RegisterRoutes(g *echo.Group) {
	// 公开接口
	g.GET("/categories", h.GetCategories)
	g.GET("", h.GetMajors)
	g.GET("/search", h.SearchMajors)
	g.GET("/cascade", h.GetCascadeData)
	g.GET("/:code", h.GetMajorByCode)
	g.GET("/categories/:category_code/majors", h.GetMajorsByCategory)
}

// RegisterAdminRoutes 注册管理员路由
func (h *MajorHandler) RegisterAdminRoutes(g *echo.Group) {
	g.POST("/majors/init", h.InitMajorData)
}
