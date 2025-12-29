package middleware

import (
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type AuthMiddleware struct {
	authService *service.AuthService
}

func NewAuthMiddleware(authService *service.AuthService) *AuthMiddleware {
	return &AuthMiddleware{authService: authService}
}

func (m *AuthMiddleware) JWT() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return echo.NewHTTPError(401, "Missing authorization header")
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				return echo.NewHTTPError(401, "Invalid authorization header format")
			}

			tokenString := parts[1]
			claims, err := m.authService.ValidateToken(tokenString)
			if err != nil {
				return echo.NewHTTPError(401, "Invalid or expired token")
			}

			// Set user info in context
			c.Set("user_id", claims.UserID)
			c.Set("phone", claims.Phone)
			c.Set("email", claims.Email)

			return next(c)
		}
	}
}

func (m *AuthMiddleware) OptionalJWT() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			authHeader := c.Request().Header.Get("Authorization")
			if authHeader == "" {
				return next(c)
			}

			parts := strings.Split(authHeader, " ")
			if len(parts) != 2 || parts[0] != "Bearer" {
				return next(c)
			}

			tokenString := parts[1]
			claims, err := m.authService.ValidateToken(tokenString)
			if err == nil {
				c.Set("user_id", claims.UserID)
				c.Set("phone", claims.Phone)
				c.Set("email", claims.Email)
			}

			return next(c)
		}
	}
}
