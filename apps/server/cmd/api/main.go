package main

import (
	"context"
	"fmt"
	"os"

	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"github.com/redis/go-redis/v9"
	echoSwagger "github.com/swaggo/echo-swagger"
	"github.com/what-cse/server/internal/config"
	"github.com/what-cse/server/internal/database"
	"github.com/what-cse/server/internal/handler"
	customMiddleware "github.com/what-cse/server/internal/middleware"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
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

	// Initialize database
	db, err := database.NewMySQL(&cfg.Database)
	if err != nil {
		log.Fatal(fmt.Sprintf("Failed to connect to database: %v", err))
	}
	log.Info("Database connected successfully")

	// Run database migrations
	if err := database.AutoMigrate(db); err != nil {
		log.Fatal(fmt.Sprintf("Failed to run migrations: %v", err))
	}
	log.Info("Database migrations completed")

	// ============================================
	// Initialize Redis (optional)
	// ============================================
	var redisClient *redis.Client
	redisClient = redis.NewClient(&redis.Options{
		Addr:     fmt.Sprintf("%s:%d", cfg.Redis.Host, cfg.Redis.Port),
		Password: cfg.Redis.Password,
		DB:       cfg.Redis.DB,
	})
	if err := redisClient.Ping(context.Background()).Err(); err != nil {
		log.Warn(fmt.Sprintf("Redis not available, rate limiting will use local memory: %v", err))
		redisClient = nil
	} else {
		log.Info("Redis connected successfully")
	}

	// ============================================
	// Initialize Repositories
	// ============================================
	userRepo := repository.NewUserRepository(db)
	userProfileRepo := repository.NewUserProfileRepository(db)
	userPrefRepo := repository.NewUserPreferenceRepository(db)
	userCertRepo := repository.NewUserCertificateRepository(db)
	positionRepo := repository.NewPositionRepository(db)
	favoriteRepo := repository.NewFavoriteRepository(db)
	announcementRepo := repository.NewAnnouncementRepository(db)
	notificationRepo := repository.NewNotificationRepository(db)
	adminRepo := repository.NewAdminRepository(db)
	listPageRepo := repository.NewListPageRepository(db)

	// ============================================
	// Initialize Services
	// ============================================
	authService := service.NewAuthService(userRepo, &cfg.JWT)
	userService := service.NewUserService(userRepo, userProfileRepo, userPrefRepo, userCertRepo)
	positionService := service.NewPositionService(positionRepo, favoriteRepo)
	matchService := service.NewMatchService(positionRepo, userRepo, userProfileRepo, userPrefRepo)
	announcementService := service.NewAnnouncementService(announcementRepo)
	notificationService := service.NewNotificationService(notificationRepo)
	adminService := service.NewAdminService(adminRepo, userRepo, positionRepo, &cfg.JWT)
	crawlerService := service.NewCrawlerService(listPageRepo)

	// Initialize SearchService (optional - requires Elasticsearch)
	var searchService *service.SearchService
	searchService, err = service.NewSearchService(&cfg.Elasticsearch)
	if err != nil {
		log.Warn(fmt.Sprintf("Elasticsearch not available, search disabled: %v", err))
	} else {
		log.Info("Elasticsearch connected successfully")
	}

	// ============================================
	// Initialize Handlers
	// ============================================
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userService)
	positionHandler := handler.NewPositionHandler(positionService)
	matchHandler := handler.NewMatchHandler(matchService)
	announcementHandler := handler.NewAnnouncementHandler(announcementService)
	notificationHandler := handler.NewNotificationHandler(notificationService)
	adminHandler := handler.NewAdminHandler(adminService)
	crawlerHandler := handler.NewCrawlerHandler(crawlerService)

	// Initialize SearchHandler (only if Elasticsearch is available)
	var searchHandler *handler.SearchHandler
	if searchService != nil {
		searchHandler = handler.NewSearchHandler(searchService)
	}

	// ============================================
	// Initialize Middleware
	// ============================================
	authMiddleware := customMiddleware.NewAuthMiddleware(authService)
	rateLimiter := customMiddleware.DefaultRateLimiter(redisClient)

	// Create Echo instance
	e := echo.New()

	// Global Middleware
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())
	e.Use(customMiddleware.RateLimitMiddleware(rateLimiter))
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{"*"},
		AllowMethods: []string{echo.GET, echo.POST, echo.PUT, echo.DELETE, echo.OPTIONS},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	// Health check endpoint
	e.GET("/health", func(c echo.Context) error {
		return c.JSON(200, map[string]string{"status": "ok"})
	})

	// Swagger documentation endpoint
	e.GET("/swagger/*", echoSwagger.WrapHandler)

	// ============================================
	// API v1 Routes
	// ============================================
	v1 := e.Group("/api/v1")

	// Auth routes (public)
	authGroup := v1.Group("/auth")
	authHandler.RegisterRoutes(authGroup)

	// User routes (protected)
	userGroup := v1.Group("/user")
	userGroup.Use(authMiddleware.JWT())
	userHandler.RegisterRoutes(userGroup)

	// Position routes (public + some protected)
	positionGroup := v1.Group("/positions")
	positionHandler.RegisterRoutes(positionGroup, authMiddleware.JWT())

	// User favorites (protected)
	v1.GET("/user/favorites", positionHandler.GetFavorites, authMiddleware.JWT())

	// Match routes (protected)
	matchGroup := v1.Group("/match")
	matchHandler.RegisterRoutes(matchGroup, authMiddleware.JWT())

	// Announcement routes (public)
	announcementGroup := v1.Group("/announcements")
	announcementHandler.RegisterRoutes(announcementGroup)

	// Notification routes (protected)
	notificationGroup := v1.Group("/notifications")
	notificationHandler.RegisterRoutes(notificationGroup, authMiddleware.JWT())

	// Admin routes
	adminGroup := v1.Group("/admin")
	adminHandler.RegisterRoutes(adminGroup, authMiddleware.JWT())

	// Crawler routes (admin only)
	crawlerHandler.RegisterRoutes(adminGroup, authMiddleware.JWT())

	// Search routes (public, only if Elasticsearch is available)
	if searchHandler != nil {
		searchGroup := v1.Group("/search")
		searchHandler.RegisterRoutes(searchGroup)
	}

	// Start server
	addr := fmt.Sprintf(":%d", cfg.Server.Port)
	log.Info(fmt.Sprintf("Starting server on %s", addr))
	if err := e.Start(addr); err != nil {
		log.Fatal(fmt.Sprintf("Failed to start server: %v", err))
	}
}
