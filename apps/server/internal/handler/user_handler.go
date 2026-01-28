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

// =====================================================
// 分区更新 API
// =====================================================

// UpdateEducation updates education section
// @Summary Update Education Info
// @Description Update user's education information
// @Tags User Profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.UpdateEducationRequest true "Education info"
// @Success 200 {object} Response
// @Router /api/v1/user/profile/education [patch]
func (h *UserHandler) UpdateEducation(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.UpdateEducationRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.userService.UpdateEducation(userID, &req); err != nil {
		return fail(c, 500, "Failed to update education: "+err.Error())
	}

	return success(c, map[string]string{"message": "Education info updated successfully"})
}

// UpdateMajor updates major section
// @Summary Update Major Info
// @Description Update user's major information
// @Tags User Profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.UpdateMajorRequest true "Major info"
// @Success 200 {object} Response
// @Router /api/v1/user/profile/major [patch]
func (h *UserHandler) UpdateMajor(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.UpdateMajorRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.userService.UpdateMajor(userID, &req); err != nil {
		return fail(c, 500, "Failed to update major: "+err.Error())
	}

	return success(c, map[string]string{"message": "Major info updated successfully"})
}

// UpdatePersonal updates personal section
// @Summary Update Personal Info
// @Description Update user's personal information
// @Tags User Profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.UpdatePersonalRequest true "Personal info"
// @Success 200 {object} Response
// @Router /api/v1/user/profile/personal [patch]
func (h *UserHandler) UpdatePersonal(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.UpdatePersonalRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.userService.UpdatePersonal(userID, &req); err != nil {
		return fail(c, 500, "Failed to update personal info: "+err.Error())
	}

	return success(c, map[string]string{"message": "Personal info updated successfully"})
}

// UpdateLocation updates location section
// @Summary Update Location Info
// @Description Update user's location information
// @Tags User Profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.UpdateLocationRequest true "Location info"
// @Success 200 {object} Response
// @Router /api/v1/user/profile/location [patch]
func (h *UserHandler) UpdateLocation(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.UpdateLocationRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.userService.UpdateLocation(userID, &req); err != nil {
		return fail(c, 500, "Failed to update location: "+err.Error())
	}

	return success(c, map[string]string{"message": "Location info updated successfully"})
}

// UpdateWork updates work experience section
// @Summary Update Work Experience
// @Description Update user's work experience
// @Tags User Profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body service.UpdateWorkRequest true "Work info"
// @Success 200 {object} Response
// @Router /api/v1/user/profile/work [patch]
func (h *UserHandler) UpdateWork(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	var req service.UpdateWorkRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.userService.UpdateWork(userID, &req); err != nil {
		return fail(c, 500, "Failed to update work experience: "+err.Error())
	}

	return success(c, map[string]string{"message": "Work experience updated successfully"})
}

// GetCompleteness returns profile completeness
// @Summary Get Profile Completeness
// @Description Get user's profile completeness details
// @Tags User Profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/user/profile/completeness [get]
func (h *UserHandler) GetCompleteness(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	completeness, err := h.userService.GetProfileCompleteness(userID)
	if err != nil {
		return fail(c, 500, "Failed to get completeness: "+err.Error())
	}

	return success(c, completeness)
}

// DeleteProfile deletes user profile
// @Summary Delete User Profile
// @Description Delete current user's profile
// @Tags User Profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/user/profile [delete]
func (h *UserHandler) DeleteProfile(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	if err := h.userService.DeleteProfile(userID); err != nil {
		if err == service.ErrProfileNotFound {
			return fail(c, 404, "Profile not found")
		}
		return fail(c, 500, "Failed to delete profile: "+err.Error())
	}

	return success(c, map[string]string{"message": "Profile deleted successfully"})
}

// GetProfileOnly returns profile without user info
// @Summary Get Profile Only
// @Description Get user's profile without user basic info
// @Tags User Profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/user/profile/detail [get]
func (h *UserHandler) GetProfileOnly(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	profile, err := h.userService.GetProfileOnly(userID)
	if err != nil {
		if err == service.ErrProfileNotFound {
			// 返回空画像，不是错误
			return success(c, map[string]interface{}{
				"profile": nil,
				"message": "Profile not created yet",
			})
		}
		return fail(c, 500, "Failed to get profile: "+err.Error())
	}

	return success(c, profile)
}

// GetPreferences returns user preferences
// @Summary Get User Preferences
// @Description Get current user's preferences
// @Tags User Profile
// @Accept json
// @Produce json
// @Security BearerAuth
// @Success 200 {object} Response
// @Router /api/v1/user/preferences [get]
func (h *UserHandler) GetPreferences(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	pref, err := h.userService.GetPreferencesOnly(userID)
	if err != nil {
		// 返回默认偏好设置
		return success(c, map[string]interface{}{
			"preferred_provinces":   []string{},
			"preferred_cities":      []string{},
			"preferred_departments": []string{},
			"exam_types":            []string{},
			"match_strategy":        "smart",
		})
	}

	return success(c, pref)
}

func (h *UserHandler) RegisterRoutes(g *echo.Group) {
	// 基础画像 API
	g.GET("/profile", h.GetProfile)
	g.PUT("/profile", h.UpdateProfile)
	g.DELETE("/profile", h.DeleteProfile)

	// 分区更新 API
	g.GET("/profile/detail", h.GetProfileOnly)
	g.GET("/profile/completeness", h.GetCompleteness)
	g.PATCH("/profile/education", h.UpdateEducation)
	g.PATCH("/profile/major", h.UpdateMajor)
	g.PATCH("/profile/personal", h.UpdatePersonal)
	g.PATCH("/profile/location", h.UpdateLocation)
	g.PATCH("/profile/work", h.UpdateWork)

	// 偏好设置 API
	g.GET("/preferences", h.GetPreferences)
	g.PUT("/preferences", h.UpdatePreferences)

	// 证书 API
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
