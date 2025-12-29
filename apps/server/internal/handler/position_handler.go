package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type PositionHandler struct {
	positionService *service.PositionService
}

func NewPositionHandler(positionService *service.PositionService) *PositionHandler {
	return &PositionHandler{positionService: positionService}
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

func (h *PositionHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	g.GET("", h.ListPositions)
	g.GET("/:id", h.GetPosition)
	g.POST("/compare", h.ComparePositions)

	// Protected routes
	g.POST("/:id/favorite", h.AddFavorite, authMiddleware)
	g.DELETE("/:id/favorite", h.RemoveFavorite, authMiddleware)
}
