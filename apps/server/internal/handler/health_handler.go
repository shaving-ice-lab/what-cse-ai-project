package handler

import (
	"context"
	"net/http"
	"runtime"
	"time"

	"github.com/labstack/echo/v4"
	"github.com/redis/go-redis/v9"
	"gorm.io/gorm"
)

type HealthHandler struct {
	db    *gorm.DB
	redis *redis.Client
}

func NewHealthHandler(db *gorm.DB, redis *redis.Client) *HealthHandler {
	return &HealthHandler{
		db:    db,
		redis: redis,
	}
}

type HealthStatus struct {
	Status    string            `json:"status"`
	Timestamp time.Time         `json:"timestamp"`
	Version   string            `json:"version"`
	Services  map[string]string `json:"services"`
	System    SystemInfo        `json:"system"`
}

type SystemInfo struct {
	GoVersion    string `json:"go_version"`
	NumGoroutine int    `json:"num_goroutine"`
	NumCPU       int    `json:"num_cpu"`
	MemAlloc     uint64 `json:"mem_alloc_mb"`
}

// Health godoc
// @Summary 健康检查
// @Description 检查服务健康状态
// @Tags 系统
// @Produce json
// @Success 200 {object} HealthStatus
// @Router /health [get]
func (h *HealthHandler) Health(c echo.Context) error {
	ctx := c.Request().Context()
	services := make(map[string]string)

	// Check database
	if h.db != nil {
		sqlDB, err := h.db.DB()
		if err == nil {
			if err := sqlDB.PingContext(ctx); err == nil {
				services["database"] = "healthy"
			} else {
				services["database"] = "unhealthy: " + err.Error()
			}
		} else {
			services["database"] = "unhealthy: " + err.Error()
		}
	}

	// Check Redis
	if h.redis != nil {
		if _, err := h.redis.Ping(ctx).Result(); err == nil {
			services["redis"] = "healthy"
		} else {
			services["redis"] = "unhealthy: " + err.Error()
		}
	}

	// Get memory stats
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	status := HealthStatus{
		Status:    "ok",
		Timestamp: time.Now(),
		Version:   "1.0.0",
		Services:  services,
		System: SystemInfo{
			GoVersion:    runtime.Version(),
			NumGoroutine: runtime.NumGoroutine(),
			NumCPU:       runtime.NumCPU(),
			MemAlloc:     m.Alloc / 1024 / 1024,
		},
	}

	// Check if any service is unhealthy
	for _, v := range services {
		if v != "healthy" {
			status.Status = "degraded"
			break
		}
	}

	return c.JSON(http.StatusOK, status)
}

// Ready godoc
// @Summary 就绪检查
// @Description 检查服务是否就绪接受流量
// @Tags 系统
// @Produce json
// @Success 200 {object} map[string]string
// @Router /ready [get]
func (h *HealthHandler) Ready(c echo.Context) error {
	ctx, cancel := context.WithTimeout(c.Request().Context(), 5*time.Second)
	defer cancel()

	// Check database connection
	if h.db != nil {
		sqlDB, err := h.db.DB()
		if err != nil {
			return c.JSON(http.StatusServiceUnavailable, map[string]string{
				"status": "not ready",
				"error":  "database connection failed",
			})
		}
		if err := sqlDB.PingContext(ctx); err != nil {
			return c.JSON(http.StatusServiceUnavailable, map[string]string{
				"status": "not ready",
				"error":  "database ping failed",
			})
		}
	}

	return c.JSON(http.StatusOK, map[string]string{
		"status": "ready",
	})
}

// Live godoc
// @Summary 存活检查
// @Description 检查服务是否存活
// @Tags 系统
// @Produce json
// @Success 200 {object} map[string]string
// @Router /live [get]
func (h *HealthHandler) Live(c echo.Context) error {
	return c.JSON(http.StatusOK, map[string]string{
		"status": "alive",
	})
}

// Metrics godoc
// @Summary 性能指标
// @Description 获取服务性能指标
// @Tags 系统
// @Produce json
// @Success 200 {object} map[string]interface{}
// @Router /metrics [get]
func (h *HealthHandler) Metrics(c echo.Context) error {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	metrics := map[string]interface{}{
		"timestamp": time.Now(),
		"runtime": map[string]interface{}{
			"go_version":    runtime.Version(),
			"num_goroutine": runtime.NumGoroutine(),
			"num_cpu":       runtime.NumCPU(),
			"gomaxprocs":    runtime.GOMAXPROCS(0),
		},
		"memory": map[string]interface{}{
			"alloc_mb":       m.Alloc / 1024 / 1024,
			"total_alloc_mb": m.TotalAlloc / 1024 / 1024,
			"sys_mb":         m.Sys / 1024 / 1024,
			"heap_alloc_mb":  m.HeapAlloc / 1024 / 1024,
			"heap_inuse_mb":  m.HeapInuse / 1024 / 1024,
			"num_gc":         m.NumGC,
			"last_gc_time":   time.Unix(0, int64(m.LastGC)),
		},
	}

	return c.JSON(http.StatusOK, metrics)
}

func (h *HealthHandler) RegisterRoutes(e *echo.Echo) {
	e.GET("/health", h.Health)
	e.GET("/ready", h.Ready)
	e.GET("/live", h.Live)
	e.GET("/metrics", h.Metrics)
}
