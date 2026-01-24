package middleware

import (
	"strings"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

type AdminAuthMiddleware struct {
	adminService *service.AdminService
}

func NewAdminAuthMiddleware(adminService *service.AdminService) *AdminAuthMiddleware {
	return &AdminAuthMiddleware{adminService: adminService}
}

func (m *AdminAuthMiddleware) JWT() echo.MiddlewareFunc {
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
			claims, err := m.adminService.ValidateAdminToken(tokenString)
			if err != nil {
				return echo.NewHTTPError(401, "Invalid or expired admin token")
			}

			// Set admin info in context
			c.Set("admin_id", claims.AdminID)
			c.Set("admin_username", claims.Username)
			c.Set("admin_role", claims.Role)

			return next(c)
		}
	}
}
