package handler

import (
	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/service"
)

// MigrateHandler 迁移处理器
type MigrateHandler struct {
	migrateService *service.MigrateService
}

// NewMigrateHandler 创建迁移处理器
func NewMigrateHandler(migrateService *service.MigrateService) *MigrateHandler {
	return &MigrateHandler{migrateService: migrateService}
}

// GetStats 获取迁移统计信息
// @Summary Get Migration Stats
// @Description Get statistics about pending migration data
// @Tags Admin/Migration
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/migrate/positions/stats [get]
func (h *MigrateHandler) GetStats(c echo.Context) error {
	stats, err := h.migrateService.GetStats()
	if err != nil {
		return fail(c, 500, "获取统计信息失败: "+err.Error())
	}

	return success(c, stats)
}

// GetStatus 获取迁移状态
// @Summary Get Migration Status
// @Description Get current migration status
// @Tags Admin/Migration
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Router /api/v1/admin/migrate/positions/status [get]
func (h *MigrateHandler) GetStatus(c echo.Context) error {
	status := h.migrateService.GetStatus()
	return success(c, status)
}

// StartMigration 启动迁移
// @Summary Start Migration
// @Description Start migrating positions from parse tasks to positions table
// @Tags Admin/Migration
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Failure 409 {object} Response "Migration already running"
// @Router /api/v1/admin/migrate/positions [post]
func (h *MigrateHandler) StartMigration(c echo.Context) error {
	state, err := h.migrateService.StartMigration()
	if err != nil {
		if err == service.ErrMigrationAlreadyRunning {
			return fail(c, 409, "迁移任务正在执行中")
		}
		return fail(c, 500, "启动迁移失败: "+err.Error())
	}

	return success(c, state)
}

// StopMigration 停止迁移
// @Summary Stop Migration
// @Description Stop the running migration
// @Tags Admin/Migration
// @Accept json
// @Produce json
// @Security AdminAuth
// @Success 200 {object} Response
// @Failure 400 {object} Response "Migration not running"
// @Router /api/v1/admin/migrate/positions/stop [post]
func (h *MigrateHandler) StopMigration(c echo.Context) error {
	err := h.migrateService.StopMigration()
	if err != nil {
		if err == service.ErrMigrationNotRunning {
			return fail(c, 400, "没有正在执行的迁移任务")
		}
		return fail(c, 500, "停止迁移失败: "+err.Error())
	}

	return success(c, map[string]string{"message": "迁移任务已停止"})
}

// RegisterRoutes 注册路由
func (h *MigrateHandler) RegisterRoutes(g *echo.Group, adminAuthMiddleware echo.MiddlewareFunc) {
	migrate := g.Group("/migrate", adminAuthMiddleware)
	migrate.GET("/positions/stats", h.GetStats)
	migrate.GET("/positions/status", h.GetStatus)
	migrate.POST("/positions", h.StartMigration)
	migrate.POST("/positions/stop", h.StopMigration)
}
