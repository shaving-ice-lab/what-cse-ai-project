package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

type AdminHandler struct {
	adminService *service.AdminService
}

func NewAdminHandler(adminService *service.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

// Login handles admin login
// @Summary Admin Login
// @Description Login for administrators
// @Tags Admin
// @Accept json
// @Produce json
// @Param request body service.AdminLoginRequest true "Admin login request"
// @Success 200 {object} Response
// @Router /api/v1/admin/login [post]
func (h *AdminHandler) Login(c echo.Context) error {
	var req service.AdminLoginRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.Username == "" || req.Password == "" {
		return fail(c, 400, "Username and password are required")
	}

	result, err := h.adminService.Login(&req)
	if err != nil {
		switch err {
		case service.ErrAdminNotFound:
			return fail(c, 404, "Admin not found")
		case service.ErrAdminDisabled:
			return fail(c, 403, "Admin account is disabled")
		case service.ErrInvalidAdminCredentials:
			return fail(c, 401, "Invalid credentials")
		default:
			return fail(c, 500, "Login failed: "+err.Error())
		}
	}

	return success(c, result)
}

// ListUsers returns paginated user list
// @Summary List Users (Admin)
// @Description Get paginated list of users for admin
// @Tags Admin
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param keyword query string false "Search keyword"
// @Success 200 {object} Response
// @Router /api/v1/admin/users [get]
func (h *AdminHandler) ListUsers(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	keyword := c.QueryParam("keyword")

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	users, total, err := h.adminService.ListUsers(page, pageSize, keyword)
	if err != nil {
		return fail(c, 500, "Failed to fetch users: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"users":     users,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// UpdateUserStatus updates a user's status
// @Summary Update User Status (Admin)
// @Description Enable or disable a user account
// @Tags Admin
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "User ID"
// @Param request body map[string]int true "Status update"
// @Success 200 {object} Response
// @Router /api/v1/admin/users/{id}/status [put]
func (h *AdminHandler) UpdateUserStatus(c echo.Context) error {
	userID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid user ID")
	}

	var req struct {
		Status int `json:"status"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.adminService.UpdateUserStatus(uint(userID), req.Status); err != nil {
		return fail(c, 500, "Failed to update user status: "+err.Error())
	}

	return success(c, map[string]string{"message": "User status updated"})
}

// ListPositions returns paginated position list for admin
// @Summary List Positions (Admin)
// @Description Get paginated list of positions for admin review
// @Tags Admin
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param page query int false "Page number" default(1)
// @Param page_size query int false "Page size" default(20)
// @Param status query int false "Position status filter"
// @Success 200 {object} Response
// @Router /api/v1/admin/positions [get]
func (h *AdminHandler) ListPositions(c echo.Context) error {
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))
	statusStr := c.QueryParam("status")

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}

	filter := &repository.PositionFilter{}
	if statusStr != "" {
		status, _ := strconv.Atoi(statusStr)
		filter.Status = &status
	}

	positions, total, err := h.adminService.ListPositionsForAdmin(filter, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to fetch positions: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"positions": positions,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// UpdatePositionStatus updates a position's status
// @Summary Update Position Status (Admin)
// @Description Approve, publish or take down a position
// @Tags Admin
// @Accept json
// @Produce json
// @Security AdminAuth
// @Param id path int true "Position ID"
// @Param request body map[string]int true "Status update"
// @Success 200 {object} Response
// @Router /api/v1/admin/positions/{id}/status [put]
func (h *AdminHandler) UpdatePositionStatus(c echo.Context) error {
	positionID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid position ID")
	}

	var req struct {
		Status int `json:"status"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.adminService.UpdatePositionStatus(uint(positionID), req.Status); err != nil {
		return fail(c, 500, "Failed to update position status: "+err.Error())
	}

	return success(c, map[string]string{"message": "Position status updated"})
}

// GetDashboardStats returns dashboard statistics
// @Summary Get Dashboard Stats (Admin)
// @Description Get overview statistics for admin dashboard
// @Tags Admin
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/stats/overview [get]
func (h *AdminHandler) GetDashboardStats(c echo.Context) error {
	stats, err := h.adminService.GetDashboardStats()
	if err != nil {
		return fail(c, 500, "Failed to fetch stats: "+err.Error())
	}

	return success(c, stats)
}

func (h *AdminHandler) RegisterRoutes(g *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	g.POST("/login", h.Login)

	// Protected admin routes
	admin := g.Group("", adminAuthMiddleware)
	admin.GET("/users", h.ListUsers)
	admin.PUT("/users/:id/status", h.UpdateUserStatus)
	admin.GET("/positions", h.ListPositions)
	admin.PUT("/positions/:id/status", h.UpdatePositionStatus)
	admin.GET("/stats/overview", h.GetDashboardStats)
}
