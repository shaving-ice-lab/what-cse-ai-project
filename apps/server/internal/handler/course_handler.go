package handler

import (
	"strconv"

	"github.com/labstack/echo/v4"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"github.com/what-cse/server/internal/service"
)

// =====================================================
// Course Handler
// =====================================================

type CourseHandler struct {
	courseService    *service.CourseService
	categoryService  *service.CourseCategoryService
	knowledgeService *service.KnowledgePointService
}

func NewCourseHandler(
	courseService *service.CourseService,
	categoryService *service.CourseCategoryService,
	knowledgeService *service.KnowledgePointService,
) *CourseHandler {
	return &CourseHandler{
		courseService:    courseService,
		categoryService:  categoryService,
		knowledgeService: knowledgeService,
	}
}

// =====================================================
// Category APIs
// =====================================================

// GetCategories gets all course categories
// @Summary Get Categories
// @Description Get all course categories as a tree
// @Tags Course
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/courses/categories [get]
func (h *CourseHandler) GetCategories(c echo.Context) error {
	subject := c.QueryParam("subject")
	examType := c.QueryParam("exam_type")
	status := parseCourseStatusParam(c.QueryParam("status"))

	var (
		categories []*model.CourseCategoryResponse
		err        error
	)

	switch {
	case subject != "":
		categories, err = h.categoryService.GetBySubjectWithStatus(subject, status)
	case examType != "":
		categories, err = h.categoryService.GetByExamTypeWithStatus(examType, status)
	default:
		categories, err = h.categoryService.GetAllWithStatus(status)
	}
	if err != nil {
		return fail(c, 500, "Failed to get categories: "+err.Error())
	}
	return success(c, map[string]interface{}{
		"categories": categories,
	})
}

// GetCategoriesBySubject gets categories by subject
// @Summary Get Categories by Subject
// @Description Get categories filtered by subject (行测/申论/面试/公基)
// @Tags Course
// @Produce json
// @Param subject path string true "Subject (xingce/shenlun/mianshi/gongji)"
// @Success 200 {object} Response
// @Router /api/v1/courses/categories/subject/{subject} [get]
func (h *CourseHandler) GetCategoriesBySubject(c echo.Context) error {
	subject := c.Param("subject")
	if subject == "" {
		return fail(c, 400, "Subject is required")
	}

	status := parseCourseStatusParam(c.QueryParam("status"))
	categories, err := h.categoryService.GetBySubjectWithStatus(subject, status)
	if err != nil {
		return fail(c, 500, "Failed to get categories: "+err.Error())
	}
	return success(c, map[string]interface{}{
		"categories": categories,
	})
}

// GetCategory gets a single category
// @Summary Get Category
// @Description Get a single category by ID
// @Tags Course
// @Produce json
// @Param id path int true "Category ID"
// @Success 200 {object} Response
// @Router /api/v1/courses/categories/{id} [get]
func (h *CourseHandler) GetCategory(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid category ID")
	}

	category, err := h.categoryService.GetByID(uint(id))
	if err != nil {
		if err == service.ErrCategoryNotFound {
			return fail(c, 404, err.Error())
		}
		return fail(c, 500, "Failed to get category: "+err.Error())
	}
	return success(c, category)
}

// =====================================================
// Course APIs
// =====================================================

// GetCourses gets courses with filters
// @Summary Get Courses
// @Description Get courses with pagination and filters
// @Tags Course
// @Produce json
// @Param category_id query int false "Category ID"
// @Param subject query string false "Subject"
// @Param content_type query string false "Content type"
// @Param difficulty query string false "Difficulty"
// @Param is_free query bool false "Is free"
// @Param keyword query string false "Search keyword"
// @Param order_by query string false "Order by (latest/popular/views/rating)"
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/courses [get]
func (h *CourseHandler) GetCourses(c echo.Context) error {
	// Manually parse query parameters to avoid binding errors
	categoryID, _ := strconv.ParseUint(c.QueryParam("category_id"), 10, 32)
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	// Parse boolean pointers
	var isFree *bool
	if v := c.QueryParam("is_free"); v != "" {
		b := v == "true" || v == "1"
		isFree = &b
	}
	var vipOnly *bool
	if v := c.QueryParam("vip_only"); v != "" {
		b := v == "true" || v == "1"
		vipOnly = &b
	}

	params := repository.CourseQueryParams{
		CategoryID:  uint(categoryID),
		Subject:     c.QueryParam("subject"),
		ExamType:    c.QueryParam("exam_type"),
		ContentType: c.QueryParam("content_type"),
		Difficulty:  c.QueryParam("difficulty"),
		IsFree:      isFree,
		VIPOnly:     vipOnly,
		Status:      c.QueryParam("status"),
		Keyword:     c.QueryParam("keyword"),
		OrderBy:     c.QueryParam("order_by"),
		Page:        page,
		PageSize:    pageSize,
	}

	courses, total, err := h.courseService.GetCourses(&params)
	if err != nil {
		return fail(c, 500, "Failed to get courses: "+err.Error())
	}

	// Convert to brief responses
	var briefCourses []interface{}
	for _, course := range courses {
		briefCourses = append(briefCourses, course.ToBriefResponse())
	}

	return success(c, map[string]interface{}{
		"courses":   briefCourses,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// GetCourse gets course detail
// @Summary Get Course Detail
// @Description Get course detail with chapters
// @Tags Course
// @Produce json
// @Param id path int true "Course ID"
// @Success 200 {object} Response
// @Router /api/v1/courses/{id} [get]
func (h *CourseHandler) GetCourse(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	userID := getUserIDFromContext(c)

	course, err := h.courseService.GetCourseDetail(uint(id), userID)
	if err != nil {
		if err == service.ErrCourseNotFound {
			return fail(c, 404, err.Error())
		}
		return fail(c, 500, "Failed to get course: "+err.Error())
	}
	return success(c, course)
}

// GetFeaturedCourses gets featured courses
// @Summary Get Featured Courses
// @Description Get featured/recommended courses
// @Tags Course
// @Produce json
// @Param limit query int false "Limit (default 10)"
// @Success 200 {object} Response
// @Router /api/v1/courses/featured [get]
func (h *CourseHandler) GetFeaturedCourses(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 10
	}

	courses, err := h.courseService.GetFeaturedCourses(limit)
	if err != nil {
		return fail(c, 500, "Failed to get featured courses: "+err.Error())
	}

	var briefCourses []interface{}
	for _, course := range courses {
		briefCourses = append(briefCourses, course.ToBriefResponse())
	}

	return success(c, map[string]interface{}{
		"courses": briefCourses,
	})
}

// GetFreeCourses gets free courses
// @Summary Get Free Courses
// @Description Get free courses
// @Tags Course
// @Produce json
// @Param limit query int false "Limit (default 10)"
// @Success 200 {object} Response
// @Router /api/v1/courses/free [get]
func (h *CourseHandler) GetFreeCourses(c echo.Context) error {
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 10
	}

	courses, err := h.courseService.GetFreeCourses(limit)
	if err != nil {
		return fail(c, 500, "Failed to get free courses: "+err.Error())
	}

	var briefCourses []interface{}
	for _, course := range courses {
		briefCourses = append(briefCourses, course.ToBriefResponse())
	}

	return success(c, map[string]interface{}{
		"courses": briefCourses,
	})
}

// GetChapterContent gets chapter content
// @Summary Get Chapter Content
// @Description Get chapter content (may require VIP)
// @Tags Course
// @Produce json
// @Param id path int true "Chapter ID"
// @Success 200 {object} Response
// @Router /api/v1/courses/chapters/{id} [get]
func (h *CourseHandler) GetChapterContent(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid chapter ID")
	}

	userID := getUserIDFromContext(c)
	isVIP := getIsVIPFromContext(c)

	chapter, err := h.courseService.GetChapterContent(uint(id), userID, isVIP)
	if err != nil {
		if err == service.ErrChapterNotFound {
			return fail(c, 404, err.Error())
		}
		if err == service.ErrChapterAccessDenied {
			return fail(c, 403, err.Error())
		}
		return fail(c, 500, "Failed to get chapter: "+err.Error())
	}
	return success(c, chapter)
}

// GetChapterFullContent gets chapter full content with all modules
// @Summary Get Chapter Full Content
// @Description Get chapter content with all 13 modules (考情分析/课程导入/核心概念/方法步骤/etc)
// @Tags Course
// @Produce json
// @Param id path int true "Chapter ID"
// @Success 200 {object} model.CourseChapterContentResponse
// @Router /api/v1/courses/chapters/{id}/content [get]
func (h *CourseHandler) GetChapterFullContent(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid chapter ID")
	}

	userID := getUserIDFromContext(c)
	isVIP := getIsVIPFromContext(c)

	content, err := h.courseService.GetChapterFullContent(uint(id), userID, isVIP)
	if err != nil {
		if err == service.ErrChapterNotFound {
			return fail(c, 404, err.Error())
		}
		if err == service.ErrChapterAccessDenied {
			return fail(c, 403, err.Error())
		}
		return fail(c, 500, "Failed to get chapter content: "+err.Error())
	}
	return success(c, content)
}

// GetChapterModules gets chapter modules list
// @Summary Get Chapter Modules
// @Description Get all modules of a chapter
// @Tags Course
// @Produce json
// @Param id path int true "Chapter ID"
// @Success 200 {object} Response
// @Router /api/v1/courses/chapters/{id}/modules [get]
func (h *CourseHandler) GetChapterModules(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid chapter ID")
	}

	modules, err := h.courseService.GetChapterModules(uint(id))
	if err != nil {
		return fail(c, 500, "Failed to get chapter modules: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"modules": modules,
	})
}

// GetSubjectModulesConfig gets module configuration for a subject
// @Summary Get Subject Modules Config
// @Description Get module configuration (replaces frontend hardcoded xingceModules)
// @Tags Course
// @Produce json
// @Param subject query string true "Subject (xingce/shenlun/mianshi/gongji)"
// @Success 200 {object} Response
// @Router /api/v1/courses/modules-config [get]
func (h *CourseHandler) GetSubjectModulesConfig(c echo.Context) error {
	subject := c.QueryParam("subject")
	if subject == "" {
		subject = "xingce" // 默认行测
	}

	config := h.courseService.GetSubjectModulesConfig(subject)
	return success(c, map[string]interface{}{
		"subject": subject,
		"modules": config,
	})
}

// GetSubjectsOverview gets overview of all subjects with their modules
// @Summary Get Subjects Overview
// @Description Get all subjects with their modules and stats (for learn page)
// @Tags Course
// @Produce json
// @Success 200 {object} Response
// @Router /api/v1/courses/subjects [get]
func (h *CourseHandler) GetSubjectsOverview(c echo.Context) error {
	subjects := h.courseService.GetSubjectsOverview()
	return success(c, map[string]interface{}{
		"subjects": subjects,
	})
}

// =====================================================
// User Course APIs (require auth)
// =====================================================

// CollectCourse collects a course
// @Summary Collect Course
// @Description Add course to collection
// @Tags Course
// @Produce json
// @Security BearerAuth
// @Param id path int true "Course ID"
// @Success 200 {object} Response
// @Router /api/v1/courses/{id}/collect [post]
func (h *CourseHandler) CollectCourse(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	courseID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	if err := h.courseService.CollectCourse(userID, uint(courseID)); err != nil {
		if err == service.ErrCourseNotFound {
			return fail(c, 404, err.Error())
		}
		if err == service.ErrCourseAlreadyCollected {
			return fail(c, 400, err.Error())
		}
		return fail(c, 500, "Failed to collect course: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "已收藏",
	})
}

// UncollectCourse removes course from collection
// @Summary Uncollect Course
// @Description Remove course from collection
// @Tags Course
// @Produce json
// @Security BearerAuth
// @Param id path int true "Course ID"
// @Success 200 {object} Response
// @Router /api/v1/courses/{id}/collect [delete]
func (h *CourseHandler) UncollectCourse(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	courseID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	if err := h.courseService.UncollectCourse(userID, uint(courseID)); err != nil {
		return fail(c, 500, "Failed to uncollect course: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "已取消收藏",
	})
}

// GetMyCollects gets user's collected courses
// @Summary Get My Collects
// @Description Get courses collected by current user
// @Tags Course
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/courses/my/collects [get]
func (h *CourseHandler) GetMyCollects(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	collects, total, err := h.courseService.GetUserCollects(userID, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to get collects: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"collects":  collects,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// UpdateProgress updates study progress
// @Summary Update Study Progress
// @Description Update user's study progress for a course
// @Tags Course
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path int true "Course ID"
// @Param request body UpdateProgressRequest true "Progress details"
// @Success 200 {object} Response
// @Router /api/v1/courses/{id}/progress [put]
func (h *CourseHandler) UpdateProgress(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	courseID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	var req UpdateProgressRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.courseService.UpdateStudyProgress(userID, uint(courseID), req.ChapterID, req.Progress); err != nil {
		return fail(c, 500, "Failed to update progress: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "进度已更新",
	})
}

// GetMyProgress gets user's progress for a course
// @Summary Get My Progress
// @Description Get current user's progress for a specific course
// @Tags Course
// @Produce json
// @Security BearerAuth
// @Param id path int true "Course ID"
// @Success 200 {object} Response
// @Router /api/v1/courses/{id}/progress [get]
func (h *CourseHandler) GetMyProgress(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	courseID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	progress, err := h.courseService.GetUserProgress(userID, uint(courseID))
	if err != nil {
		// Not found is okay, return empty progress
		return success(c, map[string]interface{}{
			"progress": 0,
		})
	}

	return success(c, progress)
}

// GetRecentLearning gets recently learned courses
// @Summary Get Recent Learning
// @Description Get courses user recently learned
// @Tags Course
// @Produce json
// @Security BearerAuth
// @Param limit query int false "Limit (default 5)"
// @Success 200 {object} Response
// @Router /api/v1/courses/my/recent [get]
func (h *CourseHandler) GetRecentLearning(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 5
	}

	recent, err := h.courseService.GetRecentLearning(userID, limit)
	if err != nil {
		return fail(c, 500, "Failed to get recent learning: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"courses": recent,
	})
}

// GetMyLearning gets all courses user is learning
// @Summary Get My Learning
// @Description Get all courses user is learning
// @Tags Course
// @Produce json
// @Security BearerAuth
// @Param page query int false "Page number"
// @Param page_size query int false "Page size"
// @Success 200 {object} Response
// @Router /api/v1/courses/my/learning [get]
func (h *CourseHandler) GetMyLearning(c echo.Context) error {
	userID := getUserIDFromContext(c)
	if userID == 0 {
		return fail(c, 401, "Unauthorized")
	}

	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	learning, total, err := h.courseService.GetUserLearningCourses(userID, page, pageSize)
	if err != nil {
		return fail(c, 500, "Failed to get learning courses: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"courses":   learning,
		"total":     total,
		"page":      page,
		"page_size": pageSize,
	})
}

// =====================================================
// Knowledge Point APIs
// =====================================================

// GetKnowledgeTree gets knowledge point tree
// @Summary Get Knowledge Tree
// @Description Get knowledge points as a tree by category
// @Tags Course
// @Produce json
// @Param category_id path int true "Category ID"
// @Success 200 {object} Response
// @Router /api/v1/courses/knowledge/{category_id} [get]
func (h *CourseHandler) GetKnowledgeTree(c echo.Context) error {
	categoryID, err := strconv.ParseUint(c.Param("category_id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid category ID")
	}

	tree, err := h.knowledgeService.GetTree(uint(categoryID))
	if err != nil {
		return fail(c, 500, "Failed to get knowledge tree: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"knowledge_points": tree,
	})
}

// GetKnowledgePoint gets a single knowledge point
// @Summary Get Knowledge Point
// @Description Get a single knowledge point by ID
// @Tags Course
// @Produce json
// @Param id path int true "Knowledge Point ID"
// @Success 200 {object} Response
// @Router /api/v1/courses/knowledge/point/{id} [get]
func (h *CourseHandler) GetKnowledgePoint(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid knowledge point ID")
	}

	point, err := h.knowledgeService.GetByID(uint(id))
	if err != nil {
		if err == service.ErrKnowledgeNotFound {
			return fail(c, 404, err.Error())
		}
		return fail(c, 500, "Failed to get knowledge point: "+err.Error())
	}
	return success(c, point)
}

// GetHighFrequencyKnowledge gets high-frequency knowledge points
// @Summary Get High Frequency Knowledge
// @Description Get high-frequency knowledge points
// @Tags Course
// @Produce json
// @Param category_id query int false "Category ID (optional)"
// @Param limit query int false "Limit (default 20)"
// @Success 200 {object} Response
// @Router /api/v1/courses/knowledge/hot [get]
func (h *CourseHandler) GetHighFrequencyKnowledge(c echo.Context) error {
	categoryID, _ := strconv.ParseUint(c.QueryParam("category_id"), 10, 32)
	limit, _ := strconv.Atoi(c.QueryParam("limit"))
	if limit <= 0 {
		limit = 20
	}

	points, err := h.knowledgeService.GetHighFrequency(uint(categoryID), limit)
	if err != nil {
		return fail(c, 500, "Failed to get high frequency points: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"knowledge_points": points,
	})
}

// =====================================================
// Request Types
// =====================================================

type UpdateProgressRequest struct {
	ChapterID uint    `json:"chapter_id"`
	Progress  float64 `json:"progress"`
}

// CreateCategoryRequest 创建分类请求
type CreateCategoryRequest struct {
	ParentID    *uint  `json:"parent_id"`
	Name        string `json:"name" validate:"required"`
	Code        string `json:"code" validate:"required"`
	ExamType    string `json:"exam_type"`
	Subject     string `json:"subject"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
	Description string `json:"description"`
	SortOrder   int    `json:"sort_order"`
}

// CreateCourseRequest 创建课程请求
type CreateCourseRequest struct {
	CategoryID    uint     `json:"category_id" validate:"required"`
	Title         string   `json:"title" validate:"required"`
	Subtitle      string   `json:"subtitle"`
	CoverImage    string   `json:"cover_image"`
	Description   string   `json:"description"`
	ContentType   string   `json:"content_type"`
	Difficulty    string   `json:"difficulty"`
	Duration      int      `json:"duration"`
	TeacherName   string   `json:"teacher_name"`
	TeacherAvatar string   `json:"teacher_avatar"`
	TeacherIntro  string   `json:"teacher_intro"`
	IsFree        bool     `json:"is_free"`
	VIPOnly       bool     `json:"vip_only"`
	Price         float64  `json:"price"`
	Tags          []string `json:"tags"`
	SortOrder     int      `json:"sort_order"`
}

// CreateChapterRequest 创建章节请求
type CreateChapterRequest struct {
	ParentID      *uint  `json:"parent_id"`
	Title         string `json:"title" validate:"required"`
	ContentType   string `json:"content_type"`
	ContentURL    string `json:"content_url"`
	ContentText   string `json:"content_text"`
	Duration      int    `json:"duration"`
	IsFreePreview bool   `json:"is_free_preview"`
	SortOrder     int    `json:"sort_order"`
	Level         int    `json:"level"`
}

// CreateKnowledgePointRequest 创建知识点请求
type CreateKnowledgePointRequest struct {
	CategoryID  uint   `json:"category_id" validate:"required"`
	ParentID    *uint  `json:"parent_id"`
	Name        string `json:"name" validate:"required"`
	Code        string `json:"code"`
	Description string `json:"description"`
	Importance  int    `json:"importance"`
	Frequency   string `json:"frequency"`
	Tips        string `json:"tips"`
	SortOrder   int    `json:"sort_order"`
}

// =====================================================
// Helper Functions
// =====================================================

// getIsVIPFromContext gets VIP status from context
func getIsVIPFromContext(c echo.Context) bool {
	isVIP, ok := c.Get("is_vip").(bool)
	if !ok {
		return false
	}
	return isVIP
}

func parseCourseStatusParam(status string) *model.CourseStatus {
	switch status {
	case "draft":
		s := model.CourseStatusDraft
		return &s
	case "published":
		s := model.CourseStatusPublished
		return &s
	case "archived":
		s := model.CourseStatusArchived
		return &s
	default:
		return nil
	}
}

// =====================================================
// Admin APIs - Category Management
// =====================================================

// AdminCreateCategory creates a new category
func (h *CourseHandler) AdminCreateCategory(c echo.Context) error {
	var req CreateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	category := &model.CourseCategory{
		ParentID:    req.ParentID,
		Name:        req.Name,
		Code:        req.Code,
		ExamType:    req.ExamType,
		Subject:     req.Subject,
		Icon:        req.Icon,
		Color:       req.Color,
		Description: req.Description,
		SortOrder:   req.SortOrder,
		IsActive:    true,
		Level:       1,
	}

	// Calculate level based on parent
	if req.ParentID != nil && *req.ParentID > 0 {
		parent, err := h.categoryService.GetByID(*req.ParentID)
		if err == nil && parent != nil {
			category.Level = parent.Level + 1
		}
	}

	if err := h.categoryService.Create(category); err != nil {
		return fail(c, 500, "Failed to create category: "+err.Error())
	}

	return success(c, category.ToResponse())
}

// AdminUpdateCategory updates a category
func (h *CourseHandler) AdminUpdateCategory(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid category ID")
	}

	var req CreateCategoryRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	updates := map[string]interface{}{
		"name":        req.Name,
		"code":        req.Code,
		"exam_type":   req.ExamType,
		"subject":     req.Subject,
		"icon":        req.Icon,
		"color":       req.Color,
		"description": req.Description,
		"sort_order":  req.SortOrder,
	}

	if err := h.categoryService.Update(uint(id), updates); err != nil {
		return fail(c, 500, "Failed to update category: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "分类更新成功",
	})
}

// AdminDeleteCategory deletes a category
func (h *CourseHandler) AdminDeleteCategory(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid category ID")
	}

	if err := h.categoryService.Delete(uint(id)); err != nil {
		return fail(c, 500, "Failed to delete category: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "分类删除成功",
	})
}

// =====================================================
// Admin APIs - Course Management
// =====================================================

// AdminGetCourses gets all courses for admin
func (h *CourseHandler) AdminGetCourses(c echo.Context) error {
	// Manually parse query parameters to avoid binding errors
	categoryID, _ := strconv.ParseUint(c.QueryParam("category_id"), 10, 32)
	page, _ := strconv.Atoi(c.QueryParam("page"))
	pageSize, _ := strconv.Atoi(c.QueryParam("page_size"))

	// Parse boolean pointers
	var isFree *bool
	if v := c.QueryParam("is_free"); v != "" {
		b := v == "true" || v == "1"
		isFree = &b
	}
	var vipOnly *bool
	if v := c.QueryParam("vip_only"); v != "" {
		b := v == "true" || v == "1"
		vipOnly = &b
	}

	params := repository.CourseQueryParams{
		CategoryID:  uint(categoryID),
		Subject:     c.QueryParam("subject"),
		ExamType:    c.QueryParam("exam_type"),
		ContentType: c.QueryParam("content_type"),
		Difficulty:  c.QueryParam("difficulty"),
		IsFree:      isFree,
		VIPOnly:     vipOnly,
		Status:      c.QueryParam("status"),
		Keyword:     c.QueryParam("keyword"),
		OrderBy:     c.QueryParam("order_by"),
		Page:        page,
		PageSize:    pageSize,
	}

	// Admin can see all status courses by default
	// If no status is specified, use "all" to get all statuses
	if params.Status == "" {
		params.Status = "all"
	}

	courses, total, err := h.courseService.GetCourses(&params)
	if err != nil {
		return fail(c, 500, "Failed to get courses: "+err.Error())
	}

	var briefCourses []interface{}
	for _, course := range courses {
		briefCourses = append(briefCourses, course.ToBriefResponse())
	}

	return success(c, map[string]interface{}{
		"courses":   briefCourses,
		"total":     total,
		"page":      params.Page,
		"page_size": params.PageSize,
	})
}

// AdminGetCourse gets a course detail for admin
func (h *CourseHandler) AdminGetCourse(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	course, err := h.courseService.GetCourseDetail(uint(id), 0)
	if err != nil {
		if err == service.ErrCourseNotFound {
			return fail(c, 404, err.Error())
		}
		return fail(c, 500, "Failed to get course: "+err.Error())
	}
	return success(c, course)
}

// AdminCreateCourse creates a new course
func (h *CourseHandler) AdminCreateCourse(c echo.Context) error {
	var req CreateCourseRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	contentType := model.CourseContentArticle
	if req.ContentType != "" {
		contentType = model.CourseContentType(req.ContentType)
	}

	difficulty := model.CourseDifficultyBasic
	if req.Difficulty != "" {
		difficulty = model.CourseDifficulty(req.Difficulty)
	}

	course := &model.Course{
		CategoryID:    req.CategoryID,
		Title:         req.Title,
		Subtitle:      req.Subtitle,
		CoverImage:    req.CoverImage,
		Description:   req.Description,
		ContentType:   contentType,
		Difficulty:    difficulty,
		Duration:      req.Duration,
		TeacherName:   req.TeacherName,
		TeacherAvatar: req.TeacherAvatar,
		TeacherIntro:  req.TeacherIntro,
		IsFree:        req.IsFree,
		VIPOnly:       req.VIPOnly,
		Price:         req.Price,
		Tags:          req.Tags,
		SortOrder:     req.SortOrder,
		Status:        model.CourseStatusDraft,
	}

	if err := h.courseService.CreateCourse(course); err != nil {
		return fail(c, 500, "Failed to create course: "+err.Error())
	}

	return success(c, course.ToBriefResponse())
}

// AdminUpdateCourse updates a course
func (h *CourseHandler) AdminUpdateCourse(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	var req CreateCourseRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	updates := map[string]interface{}{
		"category_id":    req.CategoryID,
		"title":          req.Title,
		"subtitle":       req.Subtitle,
		"cover_image":    req.CoverImage,
		"description":    req.Description,
		"content_type":   req.ContentType,
		"difficulty":     req.Difficulty,
		"duration":       req.Duration,
		"teacher_name":   req.TeacherName,
		"teacher_avatar": req.TeacherAvatar,
		"teacher_intro":  req.TeacherIntro,
		"is_free":        req.IsFree,
		"vip_only":       req.VIPOnly,
		"price":          req.Price,
		"tags":           req.Tags,
		"sort_order":     req.SortOrder,
	}

	if err := h.courseService.UpdateCourse(uint(id), updates); err != nil {
		return fail(c, 500, "Failed to update course: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "课程更新成功",
	})
}

// AdminDeleteCourse deletes a course
func (h *CourseHandler) AdminDeleteCourse(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	if err := h.courseService.DeleteCourse(uint(id)); err != nil {
		return fail(c, 500, "Failed to delete course: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "课程删除成功",
	})
}

// AdminUpdateCourseStatus updates course status
func (h *CourseHandler) AdminUpdateCourseStatus(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	var req struct {
		Status int `json:"status"`
	}
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	if err := h.courseService.UpdateCourseStatus(uint(id), model.CourseStatus(req.Status)); err != nil {
		return fail(c, 500, "Failed to update course status: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "课程状态更新成功",
	})
}

// =====================================================
// Admin APIs - Chapter Management
// =====================================================

// AdminGetChapters gets chapters for a course
func (h *CourseHandler) AdminGetChapters(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	chapters, err := h.courseService.GetChaptersByCourse(uint(id))
	if err != nil {
		return fail(c, 500, "Failed to get chapters: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"chapters": chapters,
	})
}

// AdminCreateChapter creates a new chapter
func (h *CourseHandler) AdminCreateChapter(c echo.Context) error {
	courseID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid course ID")
	}

	var req CreateChapterRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	contentType := model.CourseContentArticle
	if req.ContentType != "" {
		contentType = model.CourseContentType(req.ContentType)
	}

	chapter := &model.CourseChapter{
		CourseID:      uint(courseID),
		ParentID:      req.ParentID,
		Title:         req.Title,
		ContentType:   contentType,
		ContentURL:    req.ContentURL,
		ContentText:   req.ContentText,
		Duration:      req.Duration,
		IsFreePreview: req.IsFreePreview,
		SortOrder:     req.SortOrder,
		Level:         req.Level,
	}

	if chapter.Level == 0 {
		chapter.Level = 1
	}

	if err := h.courseService.CreateChapter(chapter); err != nil {
		return fail(c, 500, "Failed to create chapter: "+err.Error())
	}

	return success(c, chapter.ToResponse())
}

// AdminUpdateChapter updates a chapter
func (h *CourseHandler) AdminUpdateChapter(c echo.Context) error {
	chapterID, err := strconv.ParseUint(c.Param("chapterId"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid chapter ID")
	}

	var req CreateChapterRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	updates := map[string]interface{}{
		"title":           req.Title,
		"content_type":    req.ContentType,
		"content_url":     req.ContentURL,
		"content_text":    req.ContentText,
		"duration":        req.Duration,
		"is_free_preview": req.IsFreePreview,
		"sort_order":      req.SortOrder,
		"level":           req.Level,
	}

	if err := h.courseService.UpdateChapter(uint(chapterID), updates); err != nil {
		return fail(c, 500, "Failed to update chapter: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "章节更新成功",
	})
}

// AdminDeleteChapter deletes a chapter
func (h *CourseHandler) AdminDeleteChapter(c echo.Context) error {
	chapterID, err := strconv.ParseUint(c.Param("chapterId"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid chapter ID")
	}

	if err := h.courseService.DeleteChapter(uint(chapterID)); err != nil {
		return fail(c, 500, "Failed to delete chapter: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "章节删除成功",
	})
}

// =====================================================
// Admin APIs - Knowledge Point Management
// =====================================================

// AdminGetKnowledgePoints gets all knowledge points
func (h *CourseHandler) AdminGetKnowledgePoints(c echo.Context) error {
	categoryID, _ := strconv.ParseUint(c.QueryParam("category_id"), 10, 32)

	var points interface{}
	var err error

	if categoryID > 0 {
		points, err = h.knowledgeService.GetTree(uint(categoryID))
	} else {
		points, err = h.knowledgeService.GetAll()
	}

	if err != nil {
		return fail(c, 500, "Failed to get knowledge points: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"knowledge_points": points,
	})
}

// AdminCreateKnowledgePoint creates a new knowledge point
func (h *CourseHandler) AdminCreateKnowledgePoint(c echo.Context) error {
	var req CreateKnowledgePointRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	frequency := model.KnowledgeFrequencyMedium
	if req.Frequency != "" {
		frequency = model.KnowledgeFrequency(req.Frequency)
	}

	point := &model.KnowledgePoint{
		CategoryID:  req.CategoryID,
		ParentID:    req.ParentID,
		Name:        req.Name,
		Code:        req.Code,
		Description: req.Description,
		Importance:  req.Importance,
		Frequency:   frequency,
		Tips:        req.Tips,
		SortOrder:   req.SortOrder,
		Level:       1,
	}

	if req.Importance == 0 {
		point.Importance = 3
	}

	if err := h.knowledgeService.Create(point); err != nil {
		return fail(c, 500, "Failed to create knowledge point: "+err.Error())
	}

	return success(c, point.ToResponse())
}

// AdminUpdateKnowledgePoint updates a knowledge point
func (h *CourseHandler) AdminUpdateKnowledgePoint(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid knowledge point ID")
	}

	var req CreateKnowledgePointRequest
	if err := c.Bind(&req); err != nil {
		return fail(c, 400, "Invalid request parameters")
	}

	updates := map[string]interface{}{
		"name":        req.Name,
		"code":        req.Code,
		"description": req.Description,
		"importance":  req.Importance,
		"frequency":   req.Frequency,
		"tips":        req.Tips,
		"sort_order":  req.SortOrder,
	}

	if err := h.knowledgeService.Update(uint(id), updates); err != nil {
		return fail(c, 500, "Failed to update knowledge point: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "知识点更新成功",
	})
}

// AdminDeleteKnowledgePoint deletes a knowledge point
func (h *CourseHandler) AdminDeleteKnowledgePoint(c echo.Context) error {
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		return fail(c, 400, "Invalid knowledge point ID")
	}

	if err := h.knowledgeService.Delete(uint(id)); err != nil {
		return fail(c, 500, "Failed to delete knowledge point: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "知识点删除成功",
	})
}

// =====================================================
// Admin APIs - Content Initialization & Stats
// =====================================================

// AdminInitCourseContent initializes course content (seed data)
func (h *CourseHandler) AdminInitCourseContent(c echo.Context) error {
	if err := h.courseService.InitCourseContent(); err != nil {
		return fail(c, 500, "Failed to initialize course content: "+err.Error())
	}

	return success(c, map[string]interface{}{
		"message": "课程内容初始化成功",
	})
}

// AdminGetCourseStats gets course statistics
func (h *CourseHandler) AdminGetCourseStats(c echo.Context) error {
	stats, err := h.courseService.GetStats()
	if err != nil {
		return fail(c, 500, "Failed to get course stats: "+err.Error())
	}

	return success(c, stats)
}

// =====================================================
// Debug APIs
// =====================================================

// DebugModulesConfig 调试端点：查看模块配置的原始数据
// @Summary Debug Modules Config
// @Description 调试用：查看分类数据和模块配置的原始数据
// @Tags Debug
// @Produce json
// @Param subject query string true "Subject (xingce/shenlun/mianshi/gongji)"
// @Success 200 {object} Response
// @Router /api/v1/courses/debug/modules-config [get]
func (h *CourseHandler) DebugModulesConfig(c echo.Context) error {
	subject := c.QueryParam("subject")
	if subject == "" {
		subject = "xingce"
	}

	// 获取该科目下所有分类
	categories, err := h.categoryService.GetBySubjectWithStatus(subject, nil)
	if err != nil {
		return fail(c, 500, "Failed to get categories: "+err.Error())
	}

	// 获取模块配置
	modulesConfig := h.courseService.GetSubjectModulesConfig(subject)

	// 获取课程统计
	stats, _ := h.courseService.GetStats()

	return success(c, map[string]interface{}{
		"subject":        subject,
		"categories":     categories,
		"modules_config": modulesConfig,
		"course_stats":   stats,
		"debug_info": map[string]interface{}{
			"category_count":      len(categories),
			"modules_count":       len(modulesConfig),
			"is_using_db_config":  len(modulesConfig) > 0,
			"is_using_default":    len(modulesConfig) == 0,
		},
	})
}

// =====================================================
// Route Registration
// =====================================================

// RegisterRoutes registers all course routes
func (h *CourseHandler) RegisterRoutes(e *echo.Echo, authMiddleware echo.MiddlewareFunc) {
	courses := e.Group("/api/v1/courses")

	// Public routes
	courses.GET("", h.GetCourses)
	courses.GET("/featured", h.GetFeaturedCourses)
	courses.GET("/free", h.GetFreeCourses)
	courses.GET("/categories", h.GetCategories)
	courses.GET("/categories/subject/:subject", h.GetCategoriesBySubject)
	courses.GET("/categories/:id", h.GetCategory)
	courses.GET("/chapters/:id", h.GetChapterContent)
	courses.GET("/chapters/:id/content", h.GetChapterFullContent)    // 获取章节完整内容（含13模块）
	courses.GET("/chapters/:id/modules", h.GetChapterModules)        // 获取章节模块列表
	courses.GET("/modules-config", h.GetSubjectModulesConfig)        // 获取科目模块配置
	courses.GET("/subjects", h.GetSubjectsOverview)                   // 获取所有科目概览（用于学习首页）
	courses.GET("/debug/modules-config", h.DebugModulesConfig)       // 调试端点：查看原始数据
	courses.GET("/knowledge/:category_id", h.GetKnowledgeTree)
	courses.GET("/knowledge/point/:id", h.GetKnowledgePoint)
	courses.GET("/knowledge/hot", h.GetHighFrequencyKnowledge)
	courses.GET("/:id", h.GetCourse)

	// Protected routes (require authentication)
	protected := courses.Group("")
	protected.Use(authMiddleware)
	protected.POST("/:id/collect", h.CollectCourse)
	protected.DELETE("/:id/collect", h.UncollectCourse)
	protected.GET("/my/collects", h.GetMyCollects)
	protected.GET("/my/recent", h.GetRecentLearning)
	protected.GET("/my/learning", h.GetMyLearning)
	protected.GET("/:id/progress", h.GetMyProgress)
	protected.PUT("/:id/progress", h.UpdateProgress)
}

// RegisterAdminRoutes registers admin course routes
func (h *CourseHandler) RegisterAdminRoutes(adminGroup *echo.Group) {
	courses := adminGroup.Group("/courses")

	// Category management
	courses.POST("/categories", h.AdminCreateCategory)
	courses.PUT("/categories/:id", h.AdminUpdateCategory)
	courses.DELETE("/categories/:id", h.AdminDeleteCategory)

	// Course management
	courses.GET("", h.AdminGetCourses)
	courses.POST("", h.AdminCreateCourse)
	courses.GET("/:id", h.AdminGetCourse)
	courses.PUT("/:id", h.AdminUpdateCourse)
	courses.DELETE("/:id", h.AdminDeleteCourse)
	courses.PUT("/:id/status", h.AdminUpdateCourseStatus)

	// Chapter management
	courses.GET("/:id/chapters", h.AdminGetChapters)
	courses.POST("/:id/chapters", h.AdminCreateChapter)
	courses.PUT("/chapters/:chapterId", h.AdminUpdateChapter)
	courses.DELETE("/chapters/:chapterId", h.AdminDeleteChapter)

	// Knowledge point management
	courses.GET("/knowledge", h.AdminGetKnowledgePoints)
	courses.POST("/knowledge", h.AdminCreateKnowledgePoint)
	courses.PUT("/knowledge/:id", h.AdminUpdateKnowledgePoint)
	courses.DELETE("/knowledge/:id", h.AdminDeleteKnowledgePoint)

	// Content initialization
	courses.POST("/init-content", h.AdminInitCourseContent)
	courses.GET("/stats", h.AdminGetCourseStats)
}
