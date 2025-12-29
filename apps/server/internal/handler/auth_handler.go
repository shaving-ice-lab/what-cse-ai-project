package handler

import (
	"net/http"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type AuthHandler struct {
	authService *service.AuthService
}

func NewAuthHandler(authService *service.AuthService) *AuthHandler {
	return &AuthHandler{authService: authService}
}

type Response struct {
	Code    int         `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

func success(c echo.Context, data interface{}) error {
	return c.JSON(http.StatusOK, Response{
		Code:    0,
		Message: "success",
		Data:    data,
	})
}

func fail(c echo.Context, code int, message string) error {
	return c.JSON(http.StatusOK, Response{
		Code:    code,
		Message: message,
	})
}

// Register handles user registration
// @Summary User Registration
// @Description Register a new user with phone/email and password
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body service.RegisterRequest true "Registration request"
// @Success 200 {object} Response
// @Router /api/v1/auth/register [post]
func (h *AuthHandler) Register(c echo.Context) error {
	var req service.RegisterRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	// Validate request
	if req.Phone == "" && req.Email == "" {
		return fail(c, 400, "Phone or email is required")
	}
	if req.Password == "" || len(req.Password) < 6 {
		return fail(c, 400, "Password must be at least 6 characters")
	}

	user, err := h.authService.Register(&req)
	if err != nil {
		if err == service.ErrUserExists {
			return fail(c, 409, "User already exists")
		}
		return fail(c, 500, "Registration failed: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"id":       user.ID,
		"phone":    user.Phone,
		"email":    user.Email,
		"nickname": user.Nickname,
	})
}

// Login handles user login
// @Summary User Login
// @Description Login with phone/email and password
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body service.LoginRequest true "Login request"
// @Success 200 {object} Response
// @Router /api/v1/auth/login [post]
func (h *AuthHandler) Login(c echo.Context) error {
	var req service.LoginRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.Account == "" || req.Password == "" {
		return fail(c, 400, "Account and password are required")
	}

	user, tokens, err := h.authService.Login(&req)
	if err != nil {
		switch err {
		case service.ErrUserNotFound:
			return fail(c, 404, "User not found")
		case service.ErrInvalidCredentials:
			return fail(c, 401, "Invalid credentials")
		case service.ErrUserDisabled:
			return fail(c, 403, "User account is disabled")
		default:
			return fail(c, 500, "Login failed: "+err.Error())
		}
	}

	return success(c, map[string]interface{}{
		"user": map[string]interface{}{
			"id":       user.ID,
			"phone":    user.Phone,
			"email":    user.Email,
			"nickname": user.Nickname,
			"avatar":   user.Avatar,
		},
		"tokens": tokens,
	})
}

// RefreshToken handles token refresh
// @Summary Refresh Token
// @Description Refresh access token using refresh token
// @Tags Auth
// @Accept json
// @Produce json
// @Param request body map[string]string true "Refresh token request"
// @Success 200 {object} Response
// @Router /api/v1/auth/refresh [post]
func (h *AuthHandler) RefreshToken(c echo.Context) error {
	var req struct {
		RefreshToken string `json:"refresh_token"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if req.RefreshToken == "" {
		return fail(c, 400, "Refresh token is required")
	}

	tokens, err := h.authService.RefreshToken(req.RefreshToken)
	if err != nil {
		return fail(c, 401, "Invalid refresh token")
	}

	return success(c, tokens)
}

func (h *AuthHandler) RegisterRoutes(g *echo.Group) {
	g.POST("/register", h.Register)
	g.POST("/login", h.Login)
	g.POST("/refresh", h.RefreshToken)
}
