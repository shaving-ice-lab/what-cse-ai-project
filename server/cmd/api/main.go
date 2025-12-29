package main

import (
	"fmt"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	echoSwagger "github.com/swaggo/echo-swagger"
	"github.com/what-cse/server/internal/config"
	"github.com/what-cse/server/pkg/logger"

	_ "github.com/what-cse/server/docs"
)

func main() {
	// Load configuration
	cfg, err := config.Load()
	if err != nil {
		fmt.Printf("Failed to load config: %v\n", err)
		os.Exit(1)
	}

	// Initialize logger
	log, err := logger.New(cfg.Log.Level, cfg.Log.Format)
	if err != nil {
		fmt.Printf("Failed to initialize logger: %v\n", err)
		os.Exit(1)
	}
	defer log.Sync()

	// Create Echo instance
	e := echo.New()

	// Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(middleware.CORS())

	// Health check endpoint
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	// Swagger documentation endpoint
	e.GET("/swagger/*", echoSwagger.WrapHandler)

	// API v1 group
	v1 := e.Group("/api/v1")

	// Auth routes
	v1.POST("/auth/register", nil) // TODO: implement
	v1.POST("/auth/login", nil)    // TODO: implement
	v1.POST("/auth/refresh", nil)  // TODO: implement

	// Start server
	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Info(fmt.Sprintf("Starting server on %s", addr))
	if err := e.Start(addr); err != nil {
		log.Fatal(fmt.Sprintf("Failed to start server: %v", err))
	}
}
