package middleware

import (
	"net/http"

	"github.com/labstack/echo/v4"
)

type Permission string

const (
	PermissionUserRead          Permission = "user:read"
	PermissionUserWrite         Permission = "user:write"
	PermissionPositionRead      Permission = "position:read"
	PermissionPositionWrite     Permission = "position:write"
	PermissionAnnouncementRead  Permission = "announcement:read"
	PermissionAnnouncementWrite Permission = "announcement:write"
	PermissionCrawlerRead       Permission = "crawler:read"
	PermissionCrawlerWrite      Permission = "crawler:write"
	PermissionStatsRead         Permission = "stats:read"
	PermissionSystemAdmin       Permission = "system:admin"
)

type Role string

const (
	RoleSuperAdmin Role = "super_admin"
	RoleAdmin      Role = "admin"
	RoleEditor     Role = "editor"
	RoleViewer     Role = "viewer"
)

var rolePermissions = map[Role][]Permission{
	RoleSuperAdmin: {
		PermissionUserRead, PermissionUserWrite,
		PermissionPositionRead, PermissionPositionWrite,
		PermissionAnnouncementRead, PermissionAnnouncementWrite,
		PermissionCrawlerRead, PermissionCrawlerWrite,
		PermissionStatsRead, PermissionSystemAdmin,
	},
	RoleAdmin: {
		PermissionUserRead, PermissionUserWrite,
		PermissionPositionRead, PermissionPositionWrite,
		PermissionAnnouncementRead, PermissionAnnouncementWrite,
		PermissionCrawlerRead, PermissionCrawlerWrite,
		PermissionStatsRead,
	},
	RoleEditor: {
		PermissionUserRead,
		PermissionPositionRead, PermissionPositionWrite,
		PermissionAnnouncementRead, PermissionAnnouncementWrite,
		PermissionStatsRead,
	},
	RoleViewer: {
		PermissionUserRead,
		PermissionPositionRead,
		PermissionAnnouncementRead,
		PermissionStatsRead,
	},
}

func HasPermission(role Role, permission Permission) bool {
	permissions, exists := rolePermissions[role]
	if !exists {
		return false
	}

	for _, p := range permissions {
		if p == permission {
			return true
		}
	}
	return false
}

func RequirePermission(permissions ...Permission) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			roleStr, ok := c.Get("admin_role").(string)
			if !ok || roleStr == "" {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"code":    403,
					"message": "Access denied: no role found",
				})
			}

			role := Role(roleStr)

			for _, permission := range permissions {
				if !HasPermission(role, permission) {
					return c.JSON(http.StatusForbidden, map[string]interface{}{
						"code":    403,
						"message": "Access denied: insufficient permissions",
					})
				}
			}

			return next(c)
		}
	}
}

func RequireRole(roles ...Role) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			roleStr, ok := c.Get("admin_role").(string)
			if !ok || roleStr == "" {
				return c.JSON(http.StatusForbidden, map[string]interface{}{
					"code":    403,
					"message": "Access denied: no role found",
				})
			}

			currentRole := Role(roleStr)

			for _, role := range roles {
				if currentRole == role {
					return next(c)
				}
			}

			return c.JSON(http.StatusForbidden, map[string]interface{}{
				"code":    403,
				"message": "Access denied: role not allowed",
			})
		}
	}
}
