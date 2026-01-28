package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/service"
)

// MaterialHandler 素材处理器
type MaterialHandler struct {
	materialService *service.MaterialService
}

// NewMaterialHandler 创建素材处理器
func NewMaterialHandler(materialService *service.MaterialService) *MaterialHandler {
	return &MaterialHandler{
		materialService: materialService,
	}
}

// RegisterRoutes 注册路由
func (h *MaterialHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	// 公开接口
	materials := g.Group("/materials")
	{
		materials.GET("", h.ListMaterials)                            // 获取素材列表
		materials.GET("/search", h.SearchMaterials)                   // 搜索素材
		materials.GET("/hot", h.GetHotMaterials)                      // 获取热门素材
		materials.GET("/featured", h.GetFeaturedMaterials)            // 获取精选素材
		materials.GET("/random", h.GetRandomMaterials)                // 随机获取素材
		materials.GET("/types", h.GetMaterialTypes)                   // 获取素材类型列表
		materials.GET("/sub-types", h.GetMaterialSubTypes)            // 获取素材子类型列表
		materials.GET("/theme-topics", h.GetThemeTopics)              // 获取热点主题列表
		materials.GET("/by-theme/:topic", h.GetMaterialsByThemeTopic) // 按主题获取素材
		materials.GET("/stats", h.GetMaterialStats)                   // 获取素材统计
		materials.GET("/:id", h.GetMaterial)                          // 获取素材详情

		// 分类接口
		materials.GET("/categories", h.GetMaterialCategories)                           // 获取所有分类
		materials.GET("/categories/tree", h.GetMaterialCategoryTree)                    // 获取分类树
		materials.GET("/categories/type/:type", h.GetMaterialCategoriesByType)          // 按素材类型获取分类
		materials.GET("/categories/subject/:subject", h.GetMaterialCategoriesBySubject) // 按科目获取分类
		materials.GET("/categories/:id", h.GetMaterialCategory)                         // 获取分类详情
	}

	// 需要登录的接口
	authMaterials := g.Group("/materials", authMiddleware)
	{
		authMaterials.POST("/:id/collect", h.CollectMaterial)          // 收藏素材
		authMaterials.DELETE("/:id/collect", h.UncollectMaterial)      // 取消收藏
		authMaterials.GET("/my/collects", h.GetUserCollectedMaterials) // 获取我收藏的素材
	}

	// 管理员接口
	adminMaterials := g.Group("/admin/materials", authMiddleware)
	{
		adminMaterials.POST("", h.CreateMaterial)                          // 创建素材
		adminMaterials.PUT("/:id", h.UpdateMaterial)                       // 更新素材
		adminMaterials.DELETE("/:id", h.DeleteMaterial)                    // 删除素材
		adminMaterials.POST("/batch/delete", h.BatchDeleteMaterials)       // 批量删除
		adminMaterials.POST("/batch/status", h.BatchUpdateMaterialStatus)  // 批量更新状态
		adminMaterials.POST("/batch/hot", h.BatchSetMaterialHot)           // 批量设置热门
		adminMaterials.POST("/batch/featured", h.BatchSetMaterialFeatured) // 批量设置精选
		adminMaterials.POST("/batch/import", h.BatchImportMaterials)       // 批量导入
		adminMaterials.POST("/ai/generate", h.AIGenerateMaterials)         // AI 生成素材
		adminMaterials.GET("/templates", h.GetMaterialTemplates)           // 获取素材模板
		adminMaterials.GET("/preset/info", h.GetPresetDataInfo)            // 获取预置数据信息
		adminMaterials.POST("/preset/fill", h.PrefillMaterials)            // 预填充素材

		// 分类管理
		adminMaterials.POST("/categories", h.CreateMaterialCategory)       // 创建分类
		adminMaterials.PUT("/categories/:id", h.UpdateMaterialCategory)    // 更新分类
		adminMaterials.DELETE("/categories/:id", h.DeleteMaterialCategory) // 删除分类
	}
}

// =====================================================
// 素材接口
// =====================================================

// ListMaterials 获取素材列表
// @Summary 获取素材列表
// @Description 获取素材列表，支持多种筛选条件
// @Tags 素材管理
// @Accept json
// @Produce json
// @Param category_id query int false "分类ID"
// @Param type query string false "素材类型"
// @Param sub_type query string false "素材子类型"
// @Param subject query string false "科目"
// @Param status query string false "状态"
// @Param is_hot query bool false "是否热门"
// @Param is_featured query bool false "是否精选"
// @Param keyword query string false "搜索关键词"
// @Param page query int false "页码"
// @Param page_size query int false "每页数量"
// @Success 200 {object} Response
// @Router /api/v1/materials [get]
func (h *MaterialHandler) ListMaterials(c echo.Context) error {
	params := &model.MaterialQueryParams{}

	if err := c.Bind(params); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	// 解析分类ID
	if categoryIDStr := c.QueryParam("category_id"); categoryIDStr != "" {
		categoryID, err := strconv.ParseUint(categoryIDStr, 10, 32)
		if err == nil {
			catID := uint(categoryID)
			params.CategoryID = &catID
		}
	}

	// 解析布尔参数
	if isHotStr := c.QueryParam("is_hot"); isHotStr != "" {
		isHot := isHotStr == "true"
		params.IsHot = &isHot
	}
	if isFeaturedStr := c.QueryParam("is_featured"); isFeaturedStr != "" {
		isFeatured := isFeaturedStr == "true"
		params.IsFeatured = &isFeatured
	}
	if isFreeStr := c.QueryParam("is_free"); isFreeStr != "" {
		isFree := isFreeStr == "true"
		params.IsFree = &isFree
	}

	result, err := h.materialService.ListMaterials(params)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// SearchMaterials 搜索素材
// @Summary 搜索素材
// @Description 根据关键词搜索素材
// @Tags 素材管理
// @Accept json
// @Produce json
// @Param keyword query string true "搜索关键词"
// @Param type query string false "素材类型"
// @Param page query int false "页码"
// @Param page_size query int false "每页数量"
// @Success 200 {object} Response
// @Router /api/v1/materials/search [get]
func (h *MaterialHandler) SearchMaterials(c echo.Context) error {
	keyword := c.QueryParam("keyword")
	if keyword == "" {
		return fail(c, http.StatusBadRequest, "请输入搜索关键词")
	}

	params := &model.MaterialQueryParams{}
	if err := c.Bind(params); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	result, err := h.materialService.SearchMaterials(keyword, params)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetMaterial 获取素材详情
// @Summary 获取素材详情
// @Description 根据ID获取素材详情
// @Tags 素材管理
// @Accept json
// @Produce json
// @Param id path int true "素材ID"
// @Success 200 {object} Response
// @Router /api/v1/materials/{id} [get]
func (h *MaterialHandler) GetMaterial(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, http.StatusBadRequest, "无效的ID")
	}

	// 获取用户ID（如果已登录）
	userID := getUserIDFromContext(c)

	var result *model.LearningMaterialResponse
	if userID > 0 {
		result, err = h.materialService.GetMaterialWithCollectStatus(uint(id), userID)
	} else {
		result, err = h.materialService.GetMaterial(uint(id))
	}

	if err != nil {
		if err == service.ErrLearningMaterialNotFound {
			return fail(c, http.StatusNotFound, "素材不存在")
		}
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetHotMaterials 获取热门素材
// @Summary 获取热门素材
// @Description 获取热门素材列表
// @Tags 素材管理
// @Accept json
// @Produce json
// @Param limit query int false "数量限制"
// @Success 200 {object} Response
// @Router /api/v1/materials/hot [get]
func (h *MaterialHandler) GetHotMaterials(c echo.Context) error {
	limit := 10
	if limitStr := c.QueryParam("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	result, err := h.materialService.GetHotMaterials(limit)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetFeaturedMaterials 获取精选素材
// @Summary 获取精选素材
// @Description 获取精选素材列表
// @Tags 素材管理
// @Accept json
// @Produce json
// @Param limit query int false "数量限制"
// @Success 200 {object} Response
// @Router /api/v1/materials/featured [get]
func (h *MaterialHandler) GetFeaturedMaterials(c echo.Context) error {
	limit := 10
	if limitStr := c.QueryParam("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	result, err := h.materialService.GetFeaturedMaterials(limit)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetRandomMaterials 随机获取素材
// @Summary 随机获取素材
// @Description 随机获取素材，可指定类型
// @Tags 素材管理
// @Accept json
// @Produce json
// @Param type query string false "素材类型"
// @Param count query int false "数量"
// @Success 200 {object} Response
// @Router /api/v1/materials/random [get]
func (h *MaterialHandler) GetRandomMaterials(c echo.Context) error {
	materialType := model.MaterialType(c.QueryParam("type"))
	count := 5
	if countStr := c.QueryParam("count"); countStr != "" {
		if cnt, err := strconv.Atoi(countStr); err == nil && cnt > 0 {
			count = cnt
		}
	}

	result, err := h.materialService.GetRandomMaterials(materialType, count)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetMaterialsByThemeTopic 按主题获取素材
// @Summary 按主题获取素材
// @Description 根据热点主题获取相关素材
// @Tags 素材管理
// @Accept json
// @Produce json
// @Param topic path string true "主题名称"
// @Param limit query int false "数量限制"
// @Success 200 {object} Response
// @Router /api/v1/materials/by-theme/{topic} [get]
func (h *MaterialHandler) GetMaterialsByThemeTopic(c echo.Context) error {
	topic := c.Param("topic")
	if topic == "" {
		return fail(c, http.StatusBadRequest, "请指定主题")
	}

	limit := 20
	if limitStr := c.QueryParam("limit"); limitStr != "" {
		if l, err := strconv.Atoi(limitStr); err == nil && l > 0 {
			limit = l
		}
	}

	result, err := h.materialService.GetMaterialsByThemeTopic(topic, limit)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetMaterialStats 获取素材统计
// @Summary 获取素材统计
// @Description 获取素材统计信息
// @Tags 素材管理
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/materials/stats [get]
func (h *MaterialHandler) GetMaterialStats(c echo.Context) error {
	result, err := h.materialService.GetMaterialStats()
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetMaterialTypes 获取素材类型列表
// @Summary 获取素材类型列表
// @Description 获取所有素材类型及其名称
// @Tags 素材管理
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/materials/types [get]
func (h *MaterialHandler) GetMaterialTypes(c echo.Context) error {
	return success(c, h.materialService.GetMaterialTypes())
}

// GetMaterialSubTypes 获取素材子类型列表
// @Summary 获取素材子类型列表
// @Description 获取所有素材子类型及其名称
// @Tags 素材管理
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/materials/sub-types [get]
func (h *MaterialHandler) GetMaterialSubTypes(c echo.Context) error {
	return success(c, h.materialService.GetMaterialSubTypes())
}

// GetThemeTopics 获取热点主题列表
// @Summary 获取热点主题列表
// @Description 获取预定义的热点主题列表
// @Tags 素材管理
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/materials/theme-topics [get]
func (h *MaterialHandler) GetThemeTopics(c echo.Context) error {
	return success(c, h.materialService.GetThemeTopics())
}

// =====================================================
// 素材分类接口
// =====================================================

// GetMaterialCategories 获取所有分类
// @Summary 获取所有素材分类
// @Description 获取所有素材分类列表
// @Tags 素材分类
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/materials/categories [get]
func (h *MaterialHandler) GetMaterialCategories(c echo.Context) error {
	result, err := h.materialService.GetMaterialCategories()
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetMaterialCategoryTree 获取分类树
// @Summary 获取素材分类树
// @Description 获取素材分类的树形结构
// @Tags 素材分类
// @Accept json
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/materials/categories/tree [get]
func (h *MaterialHandler) GetMaterialCategoryTree(c echo.Context) error {
	result, err := h.materialService.GetMaterialCategoryTree()
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetMaterialCategoriesByType 按素材类型获取分类
// @Summary 按素材类型获取分类
// @Description 根据素材类型获取分类列表
// @Tags 素材分类
// @Accept json
// @Produce json
// @Param type path string true "素材类型"
// @Success 200 {object} Response
// @Router /api/v1/materials/categories/type/{type} [get]
func (h *MaterialHandler) GetMaterialCategoriesByType(c echo.Context) error {
	materialType := model.MaterialType(c.Param("type"))
	if materialType == "" {
		return fail(c, http.StatusBadRequest, "请指定素材类型")
	}

	result, err := h.materialService.GetMaterialCategoriesByType(materialType)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetMaterialCategoriesBySubject 按科目获取分类
// @Summary 按科目获取分类
// @Description 根据科目获取分类列表
// @Tags 素材分类
// @Accept json
// @Produce json
// @Param subject path string true "科目"
// @Success 200 {object} Response
// @Router /api/v1/materials/categories/subject/{subject} [get]
func (h *MaterialHandler) GetMaterialCategoriesBySubject(c echo.Context) error {
	subject := c.Param("subject")
	if subject == "" {
		return fail(c, http.StatusBadRequest, "请指定科目")
	}

	result, err := h.materialService.GetMaterialCategoriesBySubject(subject)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetMaterialCategory 获取分类详情
// @Summary 获取分类详情
// @Description 根据ID获取素材分类详情
// @Tags 素材分类
// @Accept json
// @Produce json
// @Param id path int true "分类ID"
// @Success 200 {object} Response
// @Router /api/v1/materials/categories/{id} [get]
func (h *MaterialHandler) GetMaterialCategory(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, http.StatusBadRequest, "无效的ID")
	}

	result, err := h.materialService.GetMaterialCategory(uint(id))
	if err != nil {
		if err == service.ErrMaterialCategoryNotFound {
			return fail(c, http.StatusNotFound, "分类不存在")
		}
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// =====================================================
// 用户相关接口
// =====================================================

// CollectMaterial 收藏素材
// @Summary 收藏素材
// @Description 收藏指定素材
// @Tags 素材收藏
// @Accept json
// @Produce json
// @Param id path int true "素材ID"
// @Param body body CollectRequest false "收藏信息"
// @Success 200 {object} Response
// @Router /api/v1/materials/{id}/collect [post]
func (h *MaterialHandler) CollectMaterial(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, http.StatusUnauthorized, "请先登录")
	}

	materialID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, http.StatusBadRequest, "无效的ID")
	}

	var req struct {
		Note string `json:"note"`
	}
	c.Bind(&req)

	err = h.materialService.CollectMaterial(userID, uint(materialID), req.Note)
	if err != nil {
		if err == service.ErrLearningMaterialNotFound {
			return fail(c, http.StatusNotFound, "素材不存在")
		}
		if err == service.ErrMaterialAlreadyCollected {
			return fail(c, http.StatusBadRequest, "已收藏该素材")
		}
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, nil)
}

// UncollectMaterial 取消收藏素材
// @Summary 取消收藏素材
// @Description 取消收藏指定素材
// @Tags 素材收藏
// @Accept json
// @Produce json
// @Param id path int true "素材ID"
// @Success 200 {object} Response
// @Router /api/v1/materials/{id}/collect [delete]
func (h *MaterialHandler) UncollectMaterial(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, http.StatusUnauthorized, "请先登录")
	}

	materialID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, http.StatusBadRequest, "无效的ID")
	}

	err = h.materialService.UncollectMaterial(userID, uint(materialID))
	if err != nil {
		if err == service.ErrMaterialNotCollected {
			return fail(c, http.StatusBadRequest, "未收藏该素材")
		}
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, nil)
}

// GetUserCollectedMaterials 获取用户收藏的素材
// @Summary 获取我收藏的素材
// @Description 获取当前用户收藏的素材列表
// @Tags 素材收藏
// @Accept json
// @Produce json
// @Param page query int false "页码"
// @Param page_size query int false "每页数量"
// @Success 200 {object} Response
// @Router /api/v1/materials/my/collects [get]
func (h *MaterialHandler) GetUserCollectedMaterials(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, http.StatusUnauthorized, "请先登录")
	}

	page := 1
	pageSize := 20
	if p, err := strconv.Atoi(c.QueryParam("page")); err == nil && p > 0 {
		page = p
	}
	if ps, err := strconv.Atoi(c.QueryParam("page_size")); err == nil && ps > 0 {
		pageSize = ps
	}

	result, err := h.materialService.GetUserCollectedMaterials(userID, page, pageSize)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// =====================================================
// 管理员接口
// =====================================================

// CreateMaterial 创建素材
// @Summary 创建素材
// @Description 创建新素材（管理员）
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param body body service.CreateMaterialRequest true "素材信息"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials [post]
func (h *MaterialHandler) CreateMaterial(c echo.Context) error {
	var req service.CreateMaterialRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	result, err := h.materialService.CreateMaterial(&req)
	if err != nil {
		if err == service.ErrMaterialCategoryNotFound {
			return fail(c, http.StatusBadRequest, "分类不存在")
		}
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// UpdateMaterial 更新素材
// @Summary 更新素材
// @Description 更新素材信息（管理员）
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param id path int true "素材ID"
// @Param body body service.UpdateMaterialRequest true "素材信息"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/{id} [put]
func (h *MaterialHandler) UpdateMaterial(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, http.StatusBadRequest, "无效的ID")
	}

	var req service.UpdateMaterialRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	err = h.materialService.UpdateMaterial(uint(id), &req)
	if err != nil {
		if err == service.ErrLearningMaterialNotFound {
			return fail(c, http.StatusNotFound, "素材不存在")
		}
		if err == service.ErrMaterialCategoryNotFound {
			return fail(c, http.StatusBadRequest, "分类不存在")
		}
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, nil)
}

// DeleteMaterial 删除素材
// @Summary 删除素材
// @Description 删除素材（管理员）
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param id path int true "素材ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/{id} [delete]
func (h *MaterialHandler) DeleteMaterial(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, http.StatusBadRequest, "无效的ID")
	}

	err = h.materialService.DeleteMaterial(uint(id))
	if err != nil {
		if err == service.ErrLearningMaterialNotFound {
			return fail(c, http.StatusNotFound, "素材不存在")
		}
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, nil)
}

// BatchDeleteMaterials 批量删除素材
// @Summary 批量删除素材
// @Description 批量删除素材（管理员）
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param body body BatchIDsRequest true "素材ID列表"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/batch/delete [post]
func (h *MaterialHandler) BatchDeleteMaterials(c echo.Context) error {
	var req struct {
		IDs []uint `json:"ids" binding:"required"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	if err := h.materialService.BatchDeleteMaterials(req.IDs); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, nil)
}

// BatchUpdateMaterialStatus 批量更新素材状态
// @Summary 批量更新素材状态
// @Description 批量更新素材状态（管理员）
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param body body BatchStatusRequest true "请求体"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/batch/status [post]
func (h *MaterialHandler) BatchUpdateMaterialStatus(c echo.Context) error {
	var req struct {
		IDs    []uint               `json:"ids" binding:"required"`
		Status model.MaterialStatus `json:"status" binding:"required"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	if err := h.materialService.BatchUpdateMaterialStatus(req.IDs, req.Status); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, nil)
}

// BatchSetMaterialHot 批量设置热门
// @Summary 批量设置热门
// @Description 批量设置素材为热门（管理员）
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param body body BatchBoolRequest true "请求体"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/batch/hot [post]
func (h *MaterialHandler) BatchSetMaterialHot(c echo.Context) error {
	var req struct {
		IDs   []uint `json:"ids" binding:"required"`
		IsHot bool   `json:"is_hot"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	if err := h.materialService.BatchSetMaterialHot(req.IDs, req.IsHot); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, nil)
}

// BatchSetMaterialFeatured 批量设置精选
// @Summary 批量设置精选
// @Description 批量设置素材为精选（管理员）
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param body body BatchBoolRequest true "请求体"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/batch/featured [post]
func (h *MaterialHandler) BatchSetMaterialFeatured(c echo.Context) error {
	var req struct {
		IDs        []uint `json:"ids" binding:"required"`
		IsFeatured bool   `json:"is_featured"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	if err := h.materialService.BatchSetMaterialFeatured(req.IDs, req.IsFeatured); err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, nil)
}

// CreateMaterialCategory 创建素材分类
// @Summary 创建素材分类
// @Description 创建素材分类（管理员）
// @Tags 素材分类-管理员
// @Accept json
// @Produce json
// @Param body body service.CreateMaterialCategoryRequest true "分类信息"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/categories [post]
func (h *MaterialHandler) CreateMaterialCategory(c echo.Context) error {
	var req service.CreateMaterialCategoryRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	result, err := h.materialService.CreateMaterialCategory(&req)
	if err != nil {
		if err == service.ErrMaterialCategoryCodeExists {
			return fail(c, http.StatusBadRequest, "分类编码已存在")
		}
		if err == service.ErrMaterialCategoryNotFound {
			return fail(c, http.StatusBadRequest, "父分类不存在")
		}
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// UpdateMaterialCategory 更新素材分类
// @Summary 更新素材分类
// @Description 更新素材分类信息（管理员）
// @Tags 素材分类-管理员
// @Accept json
// @Produce json
// @Param id path int true "分类ID"
// @Param body body service.UpdateMaterialCategoryRequest true "分类信息"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/categories/{id} [put]
func (h *MaterialHandler) UpdateMaterialCategory(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, http.StatusBadRequest, "无效的ID")
	}

	var req service.UpdateMaterialCategoryRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	err = h.materialService.UpdateMaterialCategory(uint(id), &req)
	if err != nil {
		if err == service.ErrMaterialCategoryNotFound {
			return fail(c, http.StatusNotFound, "分类不存在")
		}
		if err == service.ErrMaterialCategoryCodeExists {
			return fail(c, http.StatusBadRequest, "分类编码已存在")
		}
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, nil)
}

// DeleteMaterialCategory 删除素材分类
// @Summary 删除素材分类
// @Description 删除素材分类（管理员）
// @Tags 素材分类-管理员
// @Accept json
// @Produce json
// @Param id path int true "分类ID"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/categories/{id} [delete]
func (h *MaterialHandler) DeleteMaterialCategory(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, http.StatusBadRequest, "无效的ID")
	}

	err = h.materialService.DeleteMaterialCategory(uint(id))
	if err != nil {
		if err == service.ErrMaterialCategoryNotFound {
			return fail(c, http.StatusNotFound, "分类不存在")
		}
		if err == service.ErrMaterialCategoryHasChildren {
			return fail(c, http.StatusBadRequest, "分类下存在子分类，无法删除")
		}
		if err == service.ErrMaterialCategoryHasMaterials {
			return fail(c, http.StatusBadRequest, "分类下存在素材，无法删除")
		}
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, nil)
}

// BatchImportMaterials 批量导入素材
// @Summary 批量导入素材
// @Description 批量导入素材（管理员）
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param body body BatchImportRequest true "导入数据"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/batch/import [post]
func (h *MaterialHandler) BatchImportMaterials(c echo.Context) error {
	var req struct {
		CategoryID uint                                  `json:"category_id"`
		Type       model.MaterialType                    `json:"type"`
		Items      []*service.BatchImportMaterialRequest `json:"items" binding:"required"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	if len(req.Items) == 0 {
		return fail(c, http.StatusBadRequest, "导入数据不能为空")
	}

	if len(req.Items) > 500 {
		return fail(c, http.StatusBadRequest, "单次最多导入500条")
	}

	result := h.materialService.BatchImportMaterials(req.Items, req.CategoryID, req.Type)
	return success(c, result)
}

// AIGenerateMaterials AI 生成素材
// @Summary AI 生成素材
// @Description 使用 AI 生成素材（管理员）
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param body body service.AIGenerateMaterialRequest true "生成请求"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/ai/generate [post]
func (h *MaterialHandler) AIGenerateMaterials(c echo.Context) error {
	var req service.AIGenerateMaterialRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	if req.Type == "" {
		return fail(c, http.StatusBadRequest, "请指定素材类型")
	}

	result, err := h.materialService.GenerateMaterialsWithAI(&req)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}

// GetMaterialTemplates 获取素材模板
// @Summary 获取素材模板
// @Description 获取指定类型的素材模板
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param type query string false "素材类型"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/templates [get]
func (h *MaterialHandler) GetMaterialTemplates(c echo.Context) error {
	materialType := model.MaterialType(c.QueryParam("type"))
	templates := h.materialService.GetMaterialTemplates(materialType)
	return success(c, templates)
}

// GetPresetDataInfo 获取预置数据信息
// @Summary 获取预置数据信息
// @Description 获取可预填充的素材数据分类和数量信息
// @Tags 素材管理-管理员
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/preset/info [get]
func (h *MaterialHandler) GetPresetDataInfo(c echo.Context) error {
	info := h.materialService.GetPresetDataInfo()
	return success(c, info)
}

// PrefillMaterials 预填充素材数据
// @Summary 预填充素材数据
// @Description 使用预置数据批量填充素材
// @Tags 素材管理-管理员
// @Accept json
// @Produce json
// @Param body body service.PrefillMaterialsRequest true "预填充请求"
// @Success 200 {object} Response
// @Router /api/v1/admin/materials/preset/fill [post]
func (h *MaterialHandler) PrefillMaterials(c echo.Context) error {
	var req service.PrefillMaterialsRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, http.StatusBadRequest, "参数错误")
	}

	if len(req.CategoryCodes) == 0 {
		return fail(c, http.StatusBadRequest, "请选择要填充的数据分类")
	}

	result, err := h.materialService.PrefillMaterials(&req)
	if err != nil {
		return fail(c, http.StatusInternalServerError, err.Error())
	}

	return success(c, result)
}
