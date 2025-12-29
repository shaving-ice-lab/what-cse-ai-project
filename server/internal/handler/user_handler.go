package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type UserHandler struct {
	userService *service.UserService
}

func NewUserHandler(userService *service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetProfile returns the current user's profile
// @Summary Get User Profile
// @Description Get current user's complete profile information
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/user/profile [get]
func (h *UserHandler) GetProfile(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	profile, err := h.userService.GetUserProfile(userID)
	if err != nil {
		return fail(c, 404, "User not found")
	}

	return success(c, profile)
}

// UpdateProfile updates user profile information
// @Summary Update User Profile
// @Description Update current user's profile information
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.UpdateProfileRequest true "Profile update request"
// @Success 200 {object} Response
// @Router /api/v1/user/profile [put]
func (h *UserHandler) UpdateProfile(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.UpdateProfileRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.userService.UpdateProfile(userID, &req); err != nil {
		return fail(c, 500, "Failed to update profile: "+err.Error())
	}

	return success(c, map[string]string{"message": "Profile updated successfully"})
}

// UpdatePreferences updates user preferences
// @Summary Update User Preferences
// @Description Update current user's preferences
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.UpdatePreferencesRequest true "Preferences update request"
// @Success 200 {object} Response
// @Router /api/v1/user/preferences [put]
func (h *UserHandler) UpdatePreferences(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.UpdatePreferencesRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.userService.UpdatePreferences(userID, &req); err != nil {
		return fail(c, 500, "Failed to update preferences: "+err.Error())
	}

	return success(c, map[string]string{"message": "Preferences updated successfully"})
}

// GetCertificates returns user's certificates
// @Summary Get User Certificates
// @Description Get current user's certificates list
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/user/certificates [get]
func (h *UserHandler) GetCertificates(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	certs, err := h.userService.GetCertificates(userID)
	if err != nil {
		return fail(c, 500, "Failed to get certificates")
	}

	return success(c, certs)
}

// AddCertificate adds a new certificate
// @Summary Add Certificate
// @Description Add a new certificate for current user
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.AddCertificateRequest true "Certificate request"
// @Success 200 {object} Response
// @Router /api/v1/user/certificates [post]
func (h *UserHandler) AddCertificate(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.AddCertificateRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.CertType == "" || req.CertName == "" {
		return fail(c, 400, "Certificate type and name are required")
	}

	cert, err := h.userService.AddCertificate(userID, &req)
	if err != nil {
		return fail(c, 500, "Failed to add certificate: "+err.Error())
	}

	return success(c, cert)
}

// UpdateCertificate updates a certificate
// @Summary Update Certificate
// @Description Update an existing certificate
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Certificate ID"
// @Param request body service.AddCertificateRequest true "Certificate request"
// @Success 200 {object} Response
// @Router /api/v1/user/certificates/{id} [put]
func (h *UserHandler) UpdateCertificate(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	certID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid certificate ID")
	}

	var req service.AddCertificateRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.userService.UpdateCertificate(userID, uint(certID), &req); err != nil {
		if err == service.ErrCertificateNotFound {
			return fail(c, 404, "Certificate not found")
		}
		return fail(c, 500, "Failed to update certificate: "+err.Error())
	}

	return success(c, map[string]string{"message": "Certificate updated successfully"})
}

// DeleteCertificate deletes a certificate
// @Summary Delete Certificate
// @Description Delete a certificate
// @Tags User
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Certificate ID"
// @Success 200 {object} Response
// @Router /api/v1/user/certificates/{id} [delete]
func (h *UserHandler) DeleteCertificate(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	certID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid certificate ID")
	}

	if err := h.userService.DeleteCertificate(userID, uint(certID)); err != nil {
		if err == service.ErrCertificateNotFound {
			return fail(c, 404, "Certificate not found")
		}
		return fail(c, 500, "Failed to delete certificate: "+err.Error())
	}

	return success(c, map[string]string{"message": "Certificate deleted successfully"})
}

func (h *UserHandler) RegisterRoutes(g *echo.Group) {
	g.GET("/profile", h.GetProfile)
	g.PUT("/profile", h.UpdateProfile)
	g.PUT("/preferences", h.UpdatePreferences)
	g.GET("/certificates", h.GetCertificates)
	g.POST("/certificates", h.AddCertificate)
	g.PUT("/certificates/:id", h.UpdateCertificate)
	g.DELETE("/certificates/:id", h.DeleteCertificate)
}

// getUserIDFromContext extracts user ID from echo context
func getUserIDFromContext(c echo.Context) uint {
	if userID, ok := c.Get("user_id").(uint); ok {
		return userID
	}
	return 0
}
