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

	// Seed Fenbi categories if not present
	if err := database.SeedFenbiCategories(db); err != nil {
		log.Warn(fmt.Sprintf("Failed to seed Fenbi categories: %v", err))
	} else {
		log.Info("Fenbi categories initialized")
	}

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

	// Fenbi repositories
	fenbiCredRepo := repository.NewFenbiCredentialRepository(db)
	fenbiCategoryRepo := repository.NewFenbiCategoryRepository(db)
	fenbiAnnouncementRepo := repository.NewFenbiAnnouncementRepository(db)
	fenbiParseTaskRepo := repository.NewFenbiParseTaskRepository(db)

	// LLM config repository
	llmConfigRepo := repository.NewLLMConfigRepository(db)

	// Subscription repository
	subscriptionRepo := repository.NewSubscriptionRepository(db)

	// Membership repository
	membershipRepo := repository.NewMembershipRepository(db)

	// Calendar repository
	calendarRepo := repository.NewCalendarRepository(db)

	// Position history repository
	positionHistoryRepo := repository.NewPositionHistoryRepository(db)

	// Exam tools repositories
	examLocationRepo := repository.NewExamLocationRepository(db)
	scoreEstimateRepo := repository.NewScoreEstimateRepository(db)
	scoreShareRepo := repository.NewScoreShareRepository(db)

	// WeChat RSS repositories
	wechatRSSSourceRepo := repository.NewWechatRSSSourceRepository(db)
	wechatRSSArticleRepo := repository.NewWechatRSSArticleRepository(db)

	// WeChat MP Auth repository
	wechatMPAuthRepo := repository.NewWechatMPAuthRepository(db)

	// Major repository
	majorRepo := repository.NewMajorRepository(db)

	// Community repositories
	postRepo := repository.NewPostRepository(db)
	commentRepo := repository.NewCommentRepository(db)
	likeRepo := repository.NewLikeRepository(db)
	postCategoryRepo := repository.NewPostCategoryRepository(db)
	hotTopicRepo := repository.NewHotTopicRepository(db)

	// Course learning system repositories
	courseCategoryRepo := repository.NewCourseCategoryRepository(db)
	courseRepo := repository.NewCourseRepository(db)
	courseChapterRepo := repository.NewCourseChapterRepository(db)
	knowledgePointRepo := repository.NewKnowledgePointRepository(db)
	userCourseProgressRepo := repository.NewUserCourseProgressRepository(db)
	userCourseCollectRepo := repository.NewUserCourseCollectRepository(db)

	// Learning stats repositories
	dailyLearningStatsRepo := repository.NewUserDailyLearningStatsRepository(db)
	learningGoalRepo := repository.NewUserLearningGoalRepository(db)
	learningAchievementRepo := repository.NewUserLearningAchievementRepository(db)
	learningLeaderboardRepo := repository.NewLearningLeaderboardRepository(db)
	questionRecordRepo := repository.NewUserQuestionRecordRepository(db)

	// Study tools repositories
	studyPlanRepo := repository.NewStudyPlanRepository(db)
	studyTimeRepo := repository.NewStudyTimeRepository(db)
	learningFavoriteRepo := repository.NewLearningFavoriteRepository(db)
	knowledgeMasteryRepo := repository.NewKnowledgeMasteryRepository(db)

	// Question bank repositories
	questionRepo := repository.NewQuestionRepository(db)

	// Daily practice repositories
	dailyPracticeRepo := repository.NewDailyPracticeRepository(db)
	userDailyStreakRepo := repository.NewUserDailyStreakRepository(db)
	userWeakCategoryRepo := repository.NewUserWeakCategoryRepository(db)

	// Practice session repository
	practiceSessionRepo := repository.NewPracticeSessionRepository(db)

	// Question bank (题库) repositories
	questionMaterialRepo := repository.NewQuestionMaterialRepository(db)
	examPaperRepo := repository.NewExamPaperRepository(db)
	userQuestionRecordRepo := repository.NewUserQuestionRecordRepository(db)
	userPaperRecordRepo := repository.NewUserPaperRecordRepository(db)
	userQuestionCollectRepo := repository.NewUserQuestionCollectRepository(db)

	// Study note and wrong question repositories (错题本与笔记)
	wrongQuestionRepo := repository.NewWrongQuestionRepository(db)
	studyNoteRepo := repository.NewStudyNoteRepository(db)
	noteLikeRepo := repository.NewNoteLikeRepository(db)

	// Learning material repositories (素材库 §25.4)
	materialRepo := repository.NewMaterialRepository(db)
	materialCategoryRepo := repository.NewMaterialCategoryRepository(db)

	// Knowledge content repositories (知识点内容生成 §25.3)
	knowledgeDetailRepo := repository.NewKnowledgeDetailRepository(db)
	flashCardRepo := repository.NewFlashCardRepository(db)
	mindMapRepo := repository.NewMindMapRepository(db)
	userFlashCardRecordRepo := repository.NewUserFlashCardRecordRepository(db)
	knowledgeContentStatsRepo := repository.NewKnowledgeContentStatsRepository(db)

	// AI content repositories (AI内容预生成 §26.1)
	aiContentRepo := repository.NewAIContentRepository(db)
	aiBatchTaskRepo := repository.NewAIBatchTaskRepository(db)

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
	crawlerService := service.NewCrawlerServiceSimple(listPageRepo)
	favoriteService := service.NewFavoriteService(favoriteRepo, positionRepo)
	subscriptionService := service.NewSubscriptionService(subscriptionRepo)

	// Membership service
	membershipService := service.NewMembershipService(membershipRepo)

	// LLM config service (initialized first as it's needed by FenbiService)
	llmConfigService := service.NewLLMConfigService(llmConfigRepo, log.Logger)

	// Calendar service
	calendarService := service.NewCalendarService(calendarRepo, positionRepo, announcementRepo)

	// Position history service
	positionHistoryService := service.NewPositionHistoryService(positionHistoryRepo, positionRepo)

	// Major service
	majorService := service.NewMajorService(majorRepo)

	// Community services
	postService := service.NewPostService(postRepo, commentRepo, likeRepo, postCategoryRepo, userRepo)
	commentService := service.NewCommentService(commentRepo, postRepo, likeRepo, userRepo)
	categoryService := service.NewCategoryService(postCategoryRepo)
	hotTopicService := service.NewHotTopicService(hotTopicRepo)

	// Course learning system services
	courseCategoryService := service.NewCourseCategoryService(courseCategoryRepo)
	courseService := service.NewCourseService(courseRepo, courseCategoryRepo, courseChapterRepo, userCourseProgressRepo, userCourseCollectRepo)
	knowledgePointService := service.NewKnowledgePointService(knowledgePointRepo, courseCategoryRepo)

	// Learning stats service
	learningStatsService := service.NewLearningStatsService(
		dailyLearningStatsRepo,
		learningGoalRepo,
		learningAchievementRepo,
		learningLeaderboardRepo,
		questionRecordRepo,
		userCourseProgressRepo,
	)

	// Study tools services
	studyPlanService := service.NewStudyPlanService(studyPlanRepo)
	studyTimeService := service.NewStudyTimeService(studyTimeRepo)
	learningFavoriteService := service.NewLearningFavoriteService(learningFavoriteRepo)
	knowledgeMasteryService := service.NewKnowledgeMasteryService(knowledgeMasteryRepo)

	// Daily practice service
	dailyPracticeService := service.NewDailyPracticeService(db, dailyPracticeRepo, userDailyStreakRepo, userWeakCategoryRepo, questionRepo, questionRecordRepo)

	// Practice session service
	practiceSessionService := service.NewPracticeSessionService(db, practiceSessionRepo, questionRepo, questionRecordRepo, userWeakCategoryRepo)

	// Question bank (题库) service
	questionService := service.NewQuestionService(questionRepo, questionMaterialRepo, examPaperRepo, userQuestionRecordRepo, userPaperRecordRepo, userQuestionCollectRepo)

	// Study note and wrong question service (错题本与笔记)
	studyNoteService := service.NewStudyNoteService(wrongQuestionRepo, studyNoteRepo, noteLikeRepo, questionRepo)

	// Learning material service (素材库 §25.4)
	materialService := service.NewMaterialService(materialRepo, materialCategoryRepo)

	// Content generator service (内容生成)
	contentGeneratorService := service.NewContentGeneratorService(db, courseCategoryRepo, courseRepo, courseChapterRepo, knowledgePointRepo)

	// Knowledge content services (知识点内容生成 §25.3)
	knowledgeDetailService := service.NewKnowledgeDetailService(knowledgeDetailRepo)
	flashCardService := service.NewFlashCardService(flashCardRepo, userFlashCardRecordRepo)
	mindMapService := service.NewMindMapService(mindMapRepo)
	knowledgeContentService := service.NewKnowledgeContentService(knowledgeDetailService, flashCardService, mindMapService, knowledgeContentStatsRepo)

	// AI content generator service (AI内容预生成 §26.1)
	aiContentGenService := service.NewAIContentGeneratorService(aiContentRepo, questionRepo, courseRepo)
	aiBatchGenService := service.NewAIBatchGeneratorService(aiBatchTaskRepo, aiContentRepo, aiContentGenService)

	// AI learning path service (AI个性化学习 §26.5)
	aiLearningPathService := service.NewAILearningPathService(userProfileRepo, dailyLearningStatsRepo, questionRepo, courseRepo, knowledgePointRepo)
	aiWeaknessService := service.NewAIWeaknessAnalyzerService(practiceSessionRepo, questionRepo, dailyLearningStatsRepo)

	// Fenbi service
	fenbiService := service.NewFenbiService(fenbiCredRepo, fenbiCategoryRepo, fenbiAnnouncementRepo, fenbiParseTaskRepo, positionRepo, nil, llmConfigService, log.Logger)

	// Migration service
	migrateService := service.NewMigrateService(fenbiParseTaskRepo, positionRepo, log.Logger)

	// Compare service
	compareService := service.NewCompareService(positionRepo)

	// Exam tools services
	examLocationService := service.NewExamLocationService(examLocationRepo)
	scoreEstimateService := service.NewScoreEstimateService(scoreEstimateRepo)
	scoreShareService := service.NewScoreShareService(scoreShareRepo)

	// WeChat MP Auth service
	wechatMPAuthService := service.NewWechatMPAuthService(wechatMPAuthRepo, log.Logger)

	// WeChat RSS service
	wechatRSSService := service.NewWechatRSSService(wechatRSSSourceRepo, wechatRSSArticleRepo, log.Logger)
	// Inject MP auth service for wechat_api source type support
	wechatRSSService.SetMPAuthService(wechatMPAuthService)

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
	positionHandler.SetMatchService(matchService) // 启用推荐职位功能
	matchHandler := handler.NewMatchHandler(matchService)
	announcementHandler := handler.NewAnnouncementHandler(announcementService)
	notificationHandler := handler.NewNotificationHandler(notificationService)
	adminHandler := handler.NewAdminHandler(adminService)
	crawlerHandler := handler.NewCrawlerHandler(crawlerService)
	fenbiHandler := handler.NewFenbiHandler(fenbiService)
	llmConfigHandler := handler.NewLLMConfigHandler(llmConfigService)
	migrateHandler := handler.NewMigrateHandler(migrateService)
	wechatRSSHandler := handler.NewWechatRSSHandler(wechatRSSService)
	wechatMPAuthHandler := handler.NewWechatMPAuthHandler(wechatMPAuthService, wechatRSSService)

	// Compare handler
	compareHandler := handler.NewCompareHandler(compareService)

	// Exam tools handlers
	examLocationHandler := handler.NewExamLocationHandler(examLocationService)
	scoreEstimateHandler := handler.NewScoreEstimateHandler(scoreEstimateService)
	scoreShareHandler := handler.NewScoreShareHandler(scoreShareService)

	// Major handler
	majorHandler := handler.NewMajorHandler(majorService)

	// Favorite and Subscription handlers
	favoriteHandler := handler.NewFavoriteHandler(favoriteService)
	subscriptionHandler := handler.NewSubscriptionHandler(subscriptionService)

	// Position history handler
	positionHistoryHandler := handler.NewPositionHistoryHandler(positionHistoryService, positionService)

	// Membership handler
	membershipHandler := handler.NewMembershipHandler(membershipService)

	// Calendar handler
	calendarHandler := handler.NewCalendarHandler(calendarService)

	// Community handler
	communityHandler := handler.NewCommunityHandler(postService, commentService, categoryService, hotTopicService)

	// Course learning system handler
	courseHandler := handler.NewCourseHandler(courseService, courseCategoryService, knowledgePointService)

	// Learning stats handler
	learningStatsHandler := handler.NewLearningStatsHandler(learningStatsService)

	// Study tools handler
	studyToolsHandler := handler.NewStudyToolsHandler(studyPlanService, studyTimeService, learningFavoriteService, knowledgeMasteryService)

	// Daily practice handler
	dailyPracticeHandler := handler.NewDailyPracticeHandler(dailyPracticeService)

	// Practice session handler
	practiceSessionHandler := handler.NewPracticeSessionHandler(practiceSessionService)

	// Question bank (题库) handler
	questionHandler := handler.NewQuestionHandler(questionService, courseCategoryService)

	// Study note and wrong question handler (错题本与笔记)
	studyNoteHandler := handler.NewStudyNoteHandler(studyNoteService)

	// Learning material handler (素材库 §25.4)
	materialHandler := handler.NewMaterialHandler(materialService)

	// Content generator handler (内容生成)
	contentGeneratorHandler := handler.NewContentGeneratorHandler(contentGeneratorService)

	// Knowledge content handler (知识点内容生成 §25.3)
	knowledgeContentHandler := handler.NewKnowledgeContentHandler(knowledgeDetailService, flashCardService, mindMapService, knowledgeContentService)

	// Knowledge content seeder (知识点内容种子数据生成器)
	knowledgeContentSeeder := service.NewKnowledgeContentSeeder(knowledgeDetailRepo, flashCardRepo, mindMapRepo)
	knowledgeContentHandler.SetSeeder(knowledgeContentSeeder)

	// AI content handler (AI内容预生成 §26.1)
	aiContentHandler := handler.NewAIContentHandler(aiContentGenService, aiBatchGenService)

	// AI learning path handler (AI个性化学习 §26.5)
	aiLearningPathHandler := handler.NewAILearningPathHandler(aiLearningPathService, aiWeaknessService)

	// Content import handler (MCP内容导入)
	contentImportHandler := handler.NewContentImportHandler(db, courseService, questionService, materialService)

	// Initialize SearchHandler (only if Elasticsearch is available)
	var searchHandler *handler.SearchHandler
	if searchService != nil {
		searchHandler = handler.NewSearchHandler(searchService)
	}

	// ============================================
	// Initialize Middleware
	// ============================================
	authMiddleware := customMiddleware.NewAuthMiddleware(authService)
	adminAuthMiddleware := customMiddleware.NewAdminAuthMiddleware(adminService)
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
	// Register position history routes (public)
	positionHistoryHandler.RegisterPositionRoutes(positionGroup)

	// History routes (public)
	historyGroup := v1.Group("/history")
	positionHistoryHandler.RegisterRoutes(historyGroup)

	// User favorites (protected) - legacy route, kept for backwards compatibility
	v1.GET("/user/favorites", positionHandler.GetFavorites, authMiddleware.JWT())

	// Favorite routes (new API)
	favoriteHandler.RegisterRoutes(v1, authMiddleware.JWT())

	// Subscription routes
	subscriptionHandler.RegisterRoutes(v1, authMiddleware.JWT())

	// Membership routes (public + protected)
	membershipHandler.RegisterRoutes(v1, authMiddleware.JWT())

	// Calendar routes (protected)
	calendarHandler.RegisterRoutes(v1, authMiddleware.JWT())

	// Match routes (protected)
	matchGroup := v1.Group("/match")
	matchHandler.RegisterRoutes(matchGroup, authMiddleware.JWT())

	// Register position match detail endpoint
	matchHandler.RegisterPositionMatchRoute(positionGroup, authMiddleware.JWT())

	// Register recommended positions endpoint
	matchHandler.RegisterRecommendedRoute(positionGroup, authMiddleware.JWT())

	// Announcement routes (public)
	announcementGroup := v1.Group("/announcements")
	announcementHandler.RegisterRoutes(announcementGroup)

	// Notification routes (protected)
	notificationGroup := v1.Group("/notifications")
	notificationHandler.RegisterRoutes(notificationGroup, authMiddleware.JWT())

	// Admin routes
	adminGroup := v1.Group("/admin")
	adminHandler.RegisterRoutes(adminGroup, adminAuthMiddleware.JWT())

	// Crawler routes (admin only)
	crawlerHandler.RegisterRoutes(adminGroup, adminAuthMiddleware.JWT())

	// Position admin routes (admin only)
	positionHandler.RegisterAdminRoutes(adminGroup, adminAuthMiddleware.JWT())

	// Position history admin routes (admin only)
	positionHistoryHandler.RegisterAdminRoutes(adminGroup, adminAuthMiddleware.JWT())

	// Fenbi routes (admin only)
	fenbiHandler.RegisterRoutes(adminGroup, adminAuthMiddleware.JWT())

	// LLM config routes (admin only)
	llmConfigHandler.RegisterRoutes(adminGroup, adminAuthMiddleware.JWT())

	// WeChat RSS routes (admin only)
	wechatRSSHandler.RegisterRoutes(adminGroup, adminAuthMiddleware.JWT())

	// Migration routes (admin only)
	migrateHandler.RegisterRoutes(adminGroup, adminAuthMiddleware.JWT())

	// Membership admin routes (admin only)
	membershipHandler.RegisterAdminRoutes(adminGroup, adminAuthMiddleware.JWT())

	// WeChat MP Auth routes (admin only)
	wechatMPGroup := adminGroup.Group("/wechat-mp")
	wechatMPGroup.Use(adminAuthMiddleware.JWT())
	wechatMPGroup.GET("/auth", wechatMPAuthHandler.GetAuthStatus)
	wechatMPGroup.GET("/qrcode", wechatMPAuthHandler.GetQRCode)
	wechatMPGroup.GET("/status", wechatMPAuthHandler.CheckLoginStatus)
	wechatMPGroup.POST("/logout", wechatMPAuthHandler.Logout)
	wechatMPGroup.GET("/search", wechatMPAuthHandler.SearchAccount)
	wechatMPGroup.POST("/create-source", wechatMPAuthHandler.CreateSourceViaAPI)
	wechatMPGroup.POST("/create-source-by-account", wechatMPAuthHandler.CreateSourceViaAccount)
	wechatMPGroup.GET("/articles", wechatMPAuthHandler.GetArticles)

	// Compare routes (public)
	compareHandler.RegisterRoutes(v1)

	// Community routes (public + some protected)
	communityHandler.RegisterRoutes(v1, authMiddleware.JWT())

	// Community admin routes (admin only)
	communityHandler.RegisterAdminRoutes(adminGroup, adminAuthMiddleware.JWT())

	// Course learning system routes
	courseHandler.RegisterRoutes(e, authMiddleware.JWT())

	// Learning stats routes
	learningStatsHandler.RegisterRoutes(e, authMiddleware.JWT())

	// Study tools routes (学习工具)
	studyToolsHandler.RegisterRoutes(e, authMiddleware.JWT())

	// Daily practice routes (每日一练)
	dailyPracticeHandler.RegisterRoutes(e, authMiddleware.JWT())

	// Practice session routes (专项练习、随机练习、计时练习)
	practiceSessionHandler.RegisterRoutes(e, authMiddleware.JWT())

	// Question bank (题库) routes
	questionHandler.RegisterRoutes(e, authMiddleware.JWT())
	questionHandler.RegisterAdminRoutes(adminGroup, adminAuthMiddleware.JWT())

	// Study note and wrong question routes (错题本与笔记)
	studyNoteHandler.RegisterRoutes(e, authMiddleware.JWT())

	// Learning material routes (素材库 §25.4)
	materialHandler.RegisterRoutes(v1, authMiddleware.JWT())

	// Content generator routes (内容生成) - admin only
	contentGeneratorHandler.RegisterRoutes(e, adminAuthMiddleware.JWT())

	// Content import routes (MCP内容导入) - admin only
	contentImportHandler.RegisterRoutes(e, adminAuthMiddleware.JWT())

	// 开发环境：注册内部导入路由（无需认证，仅用于 MCP 脚本导入）
	if cfg.Server.Mode == "development" {
		contentImportHandler.RegisterInternalRoutes(e)
		log.Info("Development mode: Internal content import routes enabled at /api/v1/internal/content/import")
	}

	// AI content routes (AI内容预生成 §26.1)
	aiContentHandler.RegisterRoutes(e, authMiddleware.JWT(), adminAuthMiddleware.JWT())

	// AI learning path routes (AI个性化学习 §26.5)
	aiLearningPathHandler.RegisterRoutes(e, authMiddleware.JWT())

	// Exam tools routes
	toolsGroup := v1.Group("/tools")
	locationGroup := toolsGroup.Group("/locations")
	examLocationHandler.RegisterRoutes(locationGroup)
	estimateGroup := toolsGroup.Group("/estimate")
	scoreEstimateHandler.RegisterRoutes(estimateGroup, authMiddleware.JWT())
	scoresGroup := toolsGroup.Group("/scores")
	scoreShareHandler.RegisterRoutes(scoresGroup, authMiddleware.JWT())

	// Exam location admin routes
	examLocationHandler.RegisterAdminRoutes(adminGroup, adminAuthMiddleware.JWT())

	// Major routes (public)
	majorGroup := v1.Group("/majors")
	majorHandler.RegisterRoutes(majorGroup)
	// Major admin routes
	majorHandler.RegisterAdminRoutes(adminGroup)

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
