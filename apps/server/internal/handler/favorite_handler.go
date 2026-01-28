package handler

import (
	"strconv"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

type FavoriteHandler struct {
	favoriteService *service.FavoriteService
}

func NewFavoriteHandler(favoriteService *service.FavoriteService) *FavoriteHandler {
	return &FavoriteHandler{favoriteService: favoriteService}
}

// AddFavorite adds a new favorite
// @Summary Add Favorite
// @Description Add a position or announcement to favorites
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.AddFavoriteRequest true "Favorite request"
// @Success 200 {object} Response
// @Router /api/v1/favorites [post]
func (h *FavoriteHandler) AddFavorite(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.AddFavoriteRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.FavoriteType == "" || req.TargetID == "" {
		return fail(c, 400, "favorite_type and target_id are required")
	}

	if err := h.favoriteService.AddFavorite(userID, &req); err != nil {
		if err == service.ErrFavoriteAlreadyExist {
			return fail(c, 409, "Already favorited")
		}
		if err == service.ErrInvalidFavoriteType {
			return fail(c, 400, "Invalid favorite type")
		}
		if err == service.ErrPositionNotFound {
			return fail(c, 404, "Position not found")
		}
		return fail(c, 500, "Failed to add favorite: "+err.Error())
	}

	return success(c, map[string]string{"message": "Added to favorites"})
}

// RemoveFavorite removes a favorite
// @Summary Remove Favorite
// @Description Remove a favorite by type and target ID
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param type path string true "Favorite type (position/announcement)"
// @Param id path string true "Target ID"
// @Success 200 {object} Response
// @Router /api/v1/favorites/{type}/{id} [delete]
func (h *FavoriteHandler) RemoveFavorite(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	favoriteType := model.FavoriteType(c.Param("type"))
	targetID := c.Param("id")

	if favoriteType != model.FavoriteTypePosition && favoriteType != model.FavoriteTypeAnnouncement {
		return fail(c, 400, "Invalid favorite type")
	}

	if err := h.favoriteService.RemoveFavorite(userID, favoriteType, targetID); err != nil {
		return fail(c, 500, "Failed to remove favorite: "+err.Error())
	}

	return success(c, map[string]string{"message": "Removed from favorites"})
}

// BatchRemoveFavorites removes multiple favorites
// @Summary Batch Remove Favorites
// @Description Remove multiple favorites by IDs
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body object true "Favorite IDs to remove"
// @Success 200 {object} Response
// @Router /api/v1/favorites/batch-remove [post]
func (h *FavoriteHandler) BatchRemoveFavorites(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req struct {
		IDs []uint `json:"ids"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if len(req.IDs) == 0 {
		return fail(c, 400, "No IDs provided")
	}

	if err := h.favoriteService.BatchRemoveFavorites(userID, req.IDs); err != nil {
		return fail(c, 500, "Failed to remove favorites: "+err.Error())
	}

	return success(c, map[string]string{"message": "Favorites removed"})
}

// GetFavorites gets user's favorites
// @Summary Get Favorites
// @Description Get current user's favorites with pagination
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param favorite_type query string false "Filter by type (position/announcement)"
// @Param folder_id query int false "Filter by folder ID"
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Success 200 {object} Response
// @Router /api/v1/favorites [get]
func (h *FavoriteHandler) GetFavorites(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	params := &repository.FavoriteQueryParams{}
	if err := c.Bind(params); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}

	result, err := h.favoriteService.GetFavorites(userID, params)
	if err != nil {
		return fail(c, 500, "Failed to get favorites: "+err.Error())
	}

	return success(c, result)
}

// CheckFavorites checks if targets are favorited
// @Summary Check Favorites
// @Description Batch check if targets are favorited
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param favorite_type query string true "Favorite type"
// @Param target_ids query string true "Comma-separated target IDs"
// @Success 200 {object} Response
// @Router /api/v1/favorites/check [get]
func (h *FavoriteHandler) CheckFavorites(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	favoriteType := model.FavoriteType(c.QueryParam("favorite_type"))
	targetIDsStr := c.QueryParam("target_ids")

	if favoriteType == "" || targetIDsStr == "" {
		return fail(c, 400, "favorite_type and target_ids are required")
	}

	// Parse target IDs (comma-separated)
	var targetIDs []string
	for _, id := range splitString(targetIDsStr, ",") {
		if id != "" {
			targetIDs = append(targetIDs, id)
		}
	}

	if len(targetIDs) == 0 {
		return fail(c, 400, "No target IDs provided")
	}

	result, err := h.favoriteService.BatchCheckFavorites(userID, favoriteType, targetIDs)
	if err != nil {
		return fail(c, 500, "Failed to check favorites: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"favorites": result,
	})
}

// ExportFavorites exports all favorites
// @Summary Export Favorites
// @Description Export all favorites as JSON
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param favorite_type query string false "Filter by type"
// @Success 200 {object} Response
// @Router /api/v1/favorites/export [get]
func (h *FavoriteHandler) ExportFavorites(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	favoriteType := model.FavoriteType(c.QueryParam("favorite_type"))

	result, err := h.favoriteService.ExportFavorites(userID, favoriteType)
	if err != nil {
		return fail(c, 500, "Failed to export favorites: "+err.Error())
	}

	result.ExportAt = time.Now().Format(time.RFC3339)

	return success(c, result)
}

// GetFavoriteStats gets favorite statistics
// @Summary Get Favorite Stats
// @Description Get statistics of user's favorites
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/favorites/stats [get]
func (h *FavoriteHandler) GetFavoriteStats(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	stats, err := h.favoriteService.GetFavoriteStats(userID)
	if err != nil {
		return fail(c, 500, "Failed to get stats: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"stats": stats,
	})
}

// UpdateFavoriteNote updates favorite note
// @Summary Update Favorite Note
// @Description Update the note of a favorite
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Favorite ID"
// @Param request body object true "Note content"
// @Success 200 {object} Response
// @Router /api/v1/favorites/{id}/note [put]
func (h *FavoriteHandler) UpdateFavoriteNote(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	favoriteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid favorite ID")
	}

	var req struct {
		Note string `json:"note"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.favoriteService.UpdateFavoriteNote(userID, uint(favoriteID), req.Note); err != nil {
		return fail(c, 500, "Failed to update note: "+err.Error())
	}

	return success(c, map[string]string{"message": "Note updated"})
}

// =====================================================
// 收藏夹管理
// =====================================================

// CreateFolder creates a new folder
// @Summary Create Folder
// @Description Create a new favorite folder
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body object true "Folder details"
// @Success 200 {object} Response
// @Router /api/v1/favorites/folders [post]
func (h *FavoriteHandler) CreateFolder(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Color       string `json:"color"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.Name == "" {
		return fail(c, 400, "Folder name is required")
	}

	folder, err := h.favoriteService.CreateFolder(userID, req.Name, req.Description, req.Color)
	if err != nil {
		return fail(c, 500, "Failed to create folder: "+err.Error())
	}

	return success(c, folder)
}

// GetFolders gets all folders
// @Summary Get Folders
// @Description Get all favorite folders
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/favorites/folders [get]
func (h *FavoriteHandler) GetFolders(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	folders, err := h.favoriteService.GetFolders(userID)
	if err != nil {
		return fail(c, 500, "Failed to get folders: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"folders": folders,
	})
}

// UpdateFolder updates a folder
// @Summary Update Folder
// @Description Update a favorite folder
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Folder ID"
// @Param request body object true "Folder details"
// @Success 200 {object} Response
// @Router /api/v1/favorites/folders/{id} [put]
func (h *FavoriteHandler) UpdateFolder(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	folderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid folder ID")
	}

	var req struct {
		Name        string `json:"name"`
		Description string `json:"description"`
		Color       string `json:"color"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.favoriteService.UpdateFolder(userID, uint(folderID), req.Name, req.Description, req.Color); err != nil {
		return fail(c, 500, "Failed to update folder: "+err.Error())
	}

	return success(c, map[string]string{"message": "Folder updated"})
}

// DeleteFolder deletes a folder
// @Summary Delete Folder
// @Description Delete a favorite folder
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Folder ID"
// @Success 200 {object} Response
// @Router /api/v1/favorites/folders/{id} [delete]
func (h *FavoriteHandler) DeleteFolder(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	folderID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid folder ID")
	}

	if err := h.favoriteService.DeleteFolder(userID, uint(folderID)); err != nil {
		return fail(c, 500, "Failed to delete folder: "+err.Error())
	}

	return success(c, map[string]string{"message": "Folder deleted"})
}

// MoveFavoriteToFolder moves a favorite to a folder
// @Summary Move Favorite
// @Description Move a favorite to another folder
// @Tags Favorites
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Favorite ID"
// @Param request body object true "Folder ID"
// @Success 200 {object} Response
// @Router /api/v1/favorites/{id}/move [put]
func (h *FavoriteHandler) MoveFavoriteToFolder(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	favoriteID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid favorite ID")
	}

	var req struct {
		FolderID *uint `json:"folder_id"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.favoriteService.MoveFavoriteToFolder(userID, uint(favoriteID), req.FolderID); err != nil {
		return fail(c, 500, "Failed to move favorite: "+err.Error())
	}

	return success(c, map[string]string{"message": "Favorite moved"})
}

// RegisterRoutes registers all favorite routes
func (h *FavoriteHandler) RegisterRoutes(g *echo.Group, authMiddleware echo.MiddlewareFunc) {
	favGroup := g.Group("/favorites")
	favGroup.Use(authMiddleware)

	// 收藏基础操作
	favGroup.POST("", h.AddFavorite)
	favGroup.GET("", h.GetFavorites)
	favGroup.DELETE("/:type/:id", h.RemoveFavorite)
	favGroup.POST("/batch-remove", h.BatchRemoveFavorites)
	favGroup.GET("/check", h.CheckFavorites)
	favGroup.GET("/export", h.ExportFavorites)
	favGroup.GET("/stats", h.GetFavoriteStats)
	favGroup.PUT("/:id/note", h.UpdateFavoriteNote)
	favGroup.PUT("/:id/move", h.MoveFavoriteToFolder)

	// 收藏夹管理
	favGroup.POST("/folders", h.CreateFolder)
	favGroup.GET("/folders", h.GetFolders)
	favGroup.PUT("/folders/:id", h.UpdateFolder)
	favGroup.DELETE("/folders/:id", h.DeleteFolder)
}

// Helper function
func splitString(s, sep string) []string {
	var result []string
	start := 0
	for i := 0; i < len(s); i++ {
		if string(s[i]) == sep {
			if i > start {
				result = append(result, s[start:i])
			}
			start = i + 1
		}
	}
	if start < len(s) {
		result = append(result, s[start:])
	}
	return result
}
