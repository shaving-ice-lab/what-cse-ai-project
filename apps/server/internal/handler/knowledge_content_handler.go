package handler

import (
	"net/http"
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

// =====================================================
// §25.3 知识点内容生成 Handler
// =====================================================

// KnowledgeContentHandler 知识点内容处理器
type KnowledgeContentHandler struct {
	detailService  *service.KnowledgeDetailService
	cardService    *service.FlashCardService
	mindMapService *service.MindMapService
	contentService *service.KnowledgeContentService
	seeder         *service.KnowledgeContentSeeder
}

// NewKnowledgeContentHandler 创建处理器
func NewKnowledgeContentHandler(
	detailService *service.KnowledgeDetailService,
	cardService *service.FlashCardService,
	mindMapService *service.MindMapService,
	contentService *service.KnowledgeContentService,
) *KnowledgeContentHandler {
	return &KnowledgeContentHandler{
		detailService:  detailService,
		cardService:    cardService,
		mindMapService: mindMapService,
		contentService: contentService,
	}
}

// SetSeeder 设置种子数据生成器
func (h *KnowledgeContentHandler) SetSeeder(seeder *service.KnowledgeContentSeeder) {
	h.seeder = seeder
}

// =====================================================
// 知识点详情 API
// =====================================================

// CreateDetail 创建知识点详情
func (h *KnowledgeContentHandler) CreateDetail(c echo.Context) error {
	var req service.CreateKnowledgeDetailRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid request: " + err.Error()})
	}

	detail, err := h.detailService.CreateDetail(&req)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Create failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": detail.ToResponse(), "message": "success"})
}

// UpdateDetail 更新知识点详情
func (h *KnowledgeContentHandler) UpdateDetail(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid ID"})
	}

	var req service.UpdateKnowledgeDetailRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid request: " + err.Error()})
	}

	if err := h.detailService.UpdateDetail(uint(id), &req); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Update failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "message": "success"})
}

// DeleteDetail 删除知识点详情
func (h *KnowledgeContentHandler) DeleteDetail(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid ID"})
	}

	if err := h.detailService.DeleteDetail(uint(id)); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Delete failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "message": "success"})
}

// GetDetail 获取知识点详情
func (h *KnowledgeContentHandler) GetDetail(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid ID"})
	}

	detail, err := h.detailService.GetDetail(uint(id))
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 404, "message": "Not found"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": detail, "message": "success"})
}

// ListDetails 获取知识点详情列表
func (h *KnowledgeContentHandler) ListDetails(c echo.Context) error {
	params := &repository.KnowledgeDetailQueryParams{
		Page:     1,
		PageSize: 20,
	}

	if kpID := c.QueryParam("knowledge_point_id"); kpID != "" {
		if id, err := strconv.ParseUint(kpID, 10, 32); err == nil {
			params.KnowledgePointID = uint(id)
		}
	}
	if ct := c.QueryParam("content_type"); ct != "" {
		params.ContentType = model.KnowledgeDetailContentType(ct)
	}
	if page := c.QueryParam("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			params.Page = p
		}
	}
	if pageSize := c.QueryParam("page_size"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil && ps > 0 && ps <= 100 {
			params.PageSize = ps
		}
	}

	details, total, err := h.detailService.ListDetails(params)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code": 0,
		"data": map[string]interface{}{
			"details":   details,
			"total":     total,
			"page":      params.Page,
			"page_size": params.PageSize,
		},
		"message": "success",
	})
}

// GetDetailsByKnowledgePoint 获取知识点的所有详情
func (h *KnowledgeContentHandler) GetDetailsByKnowledgePoint(c echo.Context) error {
	kpID, err := strconv.ParseUint(c.Param("knowledge_point_id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid knowledge point ID"})
	}

	details, err := h.detailService.GetByKnowledgePoint(uint(kpID))
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": details, "message": "success"})
}

// =====================================================
// 速记卡片 API
// =====================================================

// CreateCard 创建速记卡片
func (h *KnowledgeContentHandler) CreateCard(c echo.Context) error {
	var req service.CreateFlashCardRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid request: " + err.Error()})
	}

	card, err := h.cardService.CreateCard(&req)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Create failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": card.ToResponse(), "message": "success"})
}

// BatchCreateCards 批量创建速记卡片
func (h *KnowledgeContentHandler) BatchCreateCards(c echo.Context) error {
	var cards []*model.KnowledgeFlashCard
	if err := c.Bind(&cards); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid request: " + err.Error()})
	}

	if len(cards) == 0 {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "No cards provided"})
	}

	if len(cards) > 100 {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Too many cards (max 100)"})
	}

	if err := h.cardService.BatchCreateCards(cards); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Create failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": map[string]interface{}{"count": len(cards)}, "message": "success"})
}

// UpdateCard 更新速记卡片
func (h *KnowledgeContentHandler) UpdateCard(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid ID"})
	}

	var req service.UpdateFlashCardRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid request: " + err.Error()})
	}

	if err := h.cardService.UpdateCard(uint(id), &req); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Update failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "message": "success"})
}

// DeleteCard 删除速记卡片
func (h *KnowledgeContentHandler) DeleteCard(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid ID"})
	}

	if err := h.cardService.DeleteCard(uint(id)); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Delete failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "message": "success"})
}

// GetCard 获取速记卡片
func (h *KnowledgeContentHandler) GetCard(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid ID"})
	}

	card, err := h.cardService.GetCard(uint(id))
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 404, "message": "Not found"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": card, "message": "success"})
}

// ListCards 获取速记卡片列表
func (h *KnowledgeContentHandler) ListCards(c echo.Context) error {
	params := &repository.FlashCardQueryParams{
		Page:     1,
		PageSize: 20,
	}

	if kpID := c.QueryParam("knowledge_point_id"); kpID != "" {
		if id, err := strconv.ParseUint(kpID, 10, 32); err == nil {
			params.KnowledgePointID = uint(id)
		}
	}
	if catID := c.QueryParam("category_id"); catID != "" {
		if id, err := strconv.ParseUint(catID, 10, 32); err == nil {
			params.CategoryID = uint(id)
		}
	}
	if ct := c.QueryParam("card_type"); ct != "" {
		params.CardType = model.FlashCardType(ct)
	}
	if diff := c.QueryParam("difficulty"); diff != "" {
		if d, err := strconv.Atoi(diff); err == nil {
			params.Difficulty = d
		}
	}
	if imp := c.QueryParam("importance"); imp != "" {
		if i, err := strconv.Atoi(imp); err == nil {
			params.Importance = i
		}
	}
	if kw := c.QueryParam("keyword"); kw != "" {
		params.Keyword = kw
	}
	if page := c.QueryParam("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			params.Page = p
		}
	}
	if pageSize := c.QueryParam("page_size"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil && ps > 0 && ps <= 100 {
			params.PageSize = ps
		}
	}
	if ob := c.QueryParam("order_by"); ob != "" {
		params.OrderBy = ob
	}

	cards, total, err := h.cardService.ListCards(params)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code": 0,
		"data": map[string]interface{}{
			"flash_cards": cards,
			"total":       total,
			"page":        params.Page,
			"page_size":   params.PageSize,
		},
		"message": "success",
	})
}

// GetCardsByType 获取指定类型的卡片
func (h *KnowledgeContentHandler) GetCardsByType(c echo.Context) error {
	cardType := model.FlashCardType(c.Param("type"))
	limit := 20
	if l := c.QueryParam("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	cards, err := h.cardService.GetByType(cardType, limit)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": cards, "message": "success"})
}

// GetRandomCards 随机获取卡片
func (h *KnowledgeContentHandler) GetRandomCards(c echo.Context) error {
	cardType := model.FlashCardType(c.QueryParam("type"))
	count := 10
	if cnt := c.QueryParam("count"); cnt != "" {
		if parsed, err := strconv.Atoi(cnt); err == nil && parsed > 0 {
			count = parsed
		}
	}

	cards, err := h.cardService.GetRandomCards(cardType, count)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": cards, "message": "success"})
}

// GetCardTypeStats 获取卡片类型统计
func (h *KnowledgeContentHandler) GetCardTypeStats(c echo.Context) error {
	stats, err := h.cardService.GetTypeStats()
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": stats, "message": "success"})
}

// =====================================================
// 思维导图 API
// =====================================================

// CreateMindMap 创建思维导图
func (h *KnowledgeContentHandler) CreateMindMap(c echo.Context) error {
	var req service.CreateMindMapRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid request: " + err.Error()})
	}

	// 获取当前用户ID（从中间件）
	userID := c.Get("user_id")
	uid, _ := userID.(uint)
	if uid == 0 {
		uid = 1 // 默认管理员
	}

	mindMap, err := h.mindMapService.CreateMindMap(uid, &req)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Create failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": mindMap.ToResponse(), "message": "success"})
}

// UpdateMindMap 更新思维导图
func (h *KnowledgeContentHandler) UpdateMindMap(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid ID"})
	}

	var req service.UpdateMindMapRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid request: " + err.Error()})
	}

	if err := h.mindMapService.UpdateMindMap(uint(id), &req); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Update failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "message": "success"})
}

// DeleteMindMap 删除思维导图
func (h *KnowledgeContentHandler) DeleteMindMap(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid ID"})
	}

	if err := h.mindMapService.DeleteMindMap(uint(id)); err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Delete failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "message": "success"})
}

// GetMindMap 获取思维导图
func (h *KnowledgeContentHandler) GetMindMap(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid ID"})
	}

	mindMap, err := h.mindMapService.GetMindMap(uint(id))
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 404, "message": "Not found"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": mindMap, "message": "success"})
}

// ListMindMaps 获取思维导图列表
func (h *KnowledgeContentHandler) ListMindMaps(c echo.Context) error {
	params := &repository.MindMapQueryParams{
		Page:     1,
		PageSize: 20,
	}

	if kpID := c.QueryParam("knowledge_point_id"); kpID != "" {
		if id, err := strconv.ParseUint(kpID, 10, 32); err == nil {
			params.KnowledgePointID = uint(id)
		}
	}
	if catID := c.QueryParam("category_id"); catID != "" {
		if id, err := strconv.ParseUint(catID, 10, 32); err == nil {
			params.CategoryID = uint(id)
		}
	}
	if mt := c.QueryParam("map_type"); mt != "" {
		params.MapType = model.MindMapType(mt)
	}
	if kw := c.QueryParam("keyword"); kw != "" {
		params.Keyword = kw
	}
	if page := c.QueryParam("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			params.Page = p
		}
	}
	if pageSize := c.QueryParam("page_size"); pageSize != "" {
		if ps, err := strconv.Atoi(pageSize); err == nil && ps > 0 && ps <= 100 {
			params.PageSize = ps
		}
	}

	mindMaps, total, err := h.mindMapService.ListMindMaps(params)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code": 0,
		"data": map[string]interface{}{
			"mind_maps": mindMaps,
			"total":     total,
			"page":      params.Page,
			"page_size": params.PageSize,
		},
		"message": "success",
	})
}

// GetMindMapsByType 获取指定类型的导图
func (h *KnowledgeContentHandler) GetMindMapsByType(c echo.Context) error {
	mapType := model.MindMapType(c.Param("type"))
	limit := 20
	if l := c.QueryParam("limit"); l != "" {
		if parsed, err := strconv.Atoi(l); err == nil && parsed > 0 {
			limit = parsed
		}
	}

	mindMaps, err := h.mindMapService.GetByType(mapType, limit)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": mindMaps, "message": "success"})
}

// GetMindMapTypeStats 获取导图类型统计
func (h *KnowledgeContentHandler) GetMindMapTypeStats(c echo.Context) error {
	stats, err := h.mindMapService.GetTypeStats()
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": stats, "message": "success"})
}

// DownloadMindMap 下载思维导图
func (h *KnowledgeContentHandler) DownloadMindMap(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid ID"})
	}

	mindMap, err := h.mindMapService.DownloadMindMap(uint(id))
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 404, "message": "Not found"})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": mindMap, "message": "success"})
}

// =====================================================
// 综合 API
// =====================================================

// GetContentStats 获取内容统计
func (h *KnowledgeContentHandler) GetContentStats(c echo.Context) error {
	stats, err := h.contentService.GetStats()
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": stats, "message": "success"})
}

// GetKnowledgePointFullContent 获取知识点完整内容
func (h *KnowledgeContentHandler) GetKnowledgePointFullContent(c echo.Context) error {
	kpID, err := strconv.ParseUint(c.Param("knowledge_point_id"), 10, 32)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 400, "message": "Invalid knowledge point ID"})
	}

	content, err := h.contentService.GetKnowledgePointFullContent(uint(kpID))
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Query failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": content, "message": "success"})
}

// =====================================================
// 种子数据 API
// =====================================================

// SeedAll 生成所有种子数据
func (h *KnowledgeContentHandler) SeedAll(c echo.Context) error {
	if h.seeder == nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Seeder not initialized"})
	}

	// 获取当前用户ID
	userID := c.Get("user_id")
	uid, _ := userID.(uint)
	if uid == 0 {
		uid = 1 // 默认管理员
	}

	result, err := h.seeder.SeedAll(uid)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Seed failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{"code": 0, "data": result, "message": "success"})
}

// SeedFlashCards 生成速记卡片种子数据
func (h *KnowledgeContentHandler) SeedFlashCards(c echo.Context) error {
	if h.seeder == nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Seeder not initialized"})
	}

	count, err := h.seeder.SeedFlashCards()
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Seed failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    map[string]interface{}{"flash_cards_created": count},
		"message": "success",
	})
}

// SeedMindMaps 生成思维导图种子数据
func (h *KnowledgeContentHandler) SeedMindMaps(c echo.Context) error {
	if h.seeder == nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Seeder not initialized"})
	}

	// 获取当前用户ID
	userID := c.Get("user_id")
	uid, _ := userID.(uint)
	if uid == 0 {
		uid = 1 // 默认管理员
	}

	count, err := h.seeder.SeedMindMaps(uid)
	if err != nil {
		return c.JSON(http.StatusOK, map[string]interface{}{"code": 500, "message": "Seed failed: " + err.Error()})
	}

	return c.JSON(http.StatusOK, map[string]interface{}{
		"code":    0,
		"data":    map[string]interface{}{"mind_maps_created": count},
		"message": "success",
	})
}

// RegisterRoutes 注册路由
func (h *KnowledgeContentHandler) RegisterRoutes(adminGroup *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	kc := adminGroup.Group("/knowledge-content", adminAuthMiddleware)

	// 统计
	kc.GET("/stats", h.GetContentStats)

	// 知识点详情
	kc.POST("/details", h.CreateDetail)
	kc.PUT("/details/:id", h.UpdateDetail)
	kc.DELETE("/details/:id", h.DeleteDetail)
	kc.GET("/details/:id", h.GetDetail)
	kc.GET("/details", h.ListDetails)
	kc.GET("/knowledge/:knowledge_point_id/details", h.GetDetailsByKnowledgePoint)
	kc.GET("/knowledge/:knowledge_point_id/full", h.GetKnowledgePointFullContent)

	// 速记卡片
	kc.POST("/flash-cards", h.CreateCard)
	kc.POST("/flash-cards/batch", h.BatchCreateCards)
	kc.PUT("/flash-cards/:id", h.UpdateCard)
	kc.DELETE("/flash-cards/:id", h.DeleteCard)
	kc.GET("/flash-cards/:id", h.GetCard)
	kc.GET("/flash-cards", h.ListCards)
	kc.GET("/flash-cards/type/:type", h.GetCardsByType)
	kc.GET("/flash-cards/random", h.GetRandomCards)
	kc.GET("/flash-cards/stats", h.GetCardTypeStats)

	// 思维导图
	kc.POST("/mind-maps", h.CreateMindMap)
	kc.PUT("/mind-maps/:id", h.UpdateMindMap)
	kc.DELETE("/mind-maps/:id", h.DeleteMindMap)
	kc.GET("/mind-maps/:id", h.GetMindMap)
	kc.GET("/mind-maps", h.ListMindMaps)
	kc.GET("/mind-maps/type/:type", h.GetMindMapsByType)
	kc.GET("/mind-maps/stats", h.GetMindMapTypeStats)
	kc.GET("/mind-maps/:id/download", h.DownloadMindMap)

	// 种子数据生成
	kc.POST("/seed/all", h.SeedAll)
	kc.POST("/seed/flash-cards", h.SeedFlashCards)
	kc.POST("/seed/mind-maps", h.SeedMindMaps)
}
