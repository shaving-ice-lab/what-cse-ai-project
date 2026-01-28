package service

import (
	"errors"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"gorm.io/gorm"
)

var (
	ErrCourseNotFound         = errors.New("课程不存在")
	ErrCourseCategoryNotFound = errors.New("课程分类不存在")
	ErrChapterNotFound        = errors.New("章节不存在")
	ErrKnowledgeNotFound      = errors.New("知识点不存在")
	ErrCourseNotPublished     = errors.New("课程未发布")
	ErrChapterAccessDenied    = errors.New("章节需要VIP权限")
	ErrCourseAlreadyCollected = errors.New("已收藏该课程")
)

// =====================================================
// Course Category Service
// =====================================================

type CourseCategoryService struct {
	categoryRepo *repository.CourseCategoryRepository
}

func NewCourseCategoryService(categoryRepo *repository.CourseCategoryRepository) *CourseCategoryService {
	return &CourseCategoryService{categoryRepo: categoryRepo}
}

// GetAll gets all categories
func (s *CourseCategoryService) GetAll() ([]*model.CourseCategoryResponse, error) {
	categories, err := s.categoryRepo.GetAll()
	if err != nil {
		return nil, err
	}

	// Build tree structure
	return s.buildCategoryTree(categories), nil
}

// GetBySubject gets categories by subject
func (s *CourseCategoryService) GetBySubject(subject string) ([]*model.CourseCategoryResponse, error) {
	categories, err := s.categoryRepo.GetBySubject(subject)
	if err != nil {
		return nil, err
	}
	return s.buildCategoryTree(categories), nil
}

// GetByExamType gets categories by exam type
func (s *CourseCategoryService) GetByExamType(examType string) ([]*model.CourseCategoryResponse, error) {
	categories, err := s.categoryRepo.GetByExamType(examType)
	if err != nil {
		return nil, err
	}
	return s.buildCategoryTree(categories), nil
}

// GetByID gets a category by ID
func (s *CourseCategoryService) GetByID(id uint) (*model.CourseCategoryResponse, error) {
	category, err := s.categoryRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseCategoryNotFound
		}
		return nil, err
	}
	return category.ToResponse(), nil
}

// buildCategoryTree builds a tree structure from flat category list
func (s *CourseCategoryService) buildCategoryTree(categories []model.CourseCategory) []*model.CourseCategoryResponse {
	// Create a map for quick lookup
	categoryMap := make(map[uint]*model.CourseCategoryResponse)
	for i := range categories {
		categoryMap[categories[i].ID] = categories[i].ToResponse()
	}

	// Build tree
	var roots []*model.CourseCategoryResponse
	for _, cat := range categories {
		resp := categoryMap[cat.ID]
		if cat.ParentID == nil || *cat.ParentID == 0 {
			roots = append(roots, resp)
		} else {
			if parent, exists := categoryMap[*cat.ParentID]; exists {
				parent.Children = append(parent.Children, resp)
			}
		}
	}

	return roots
}

// Create creates a new category
func (s *CourseCategoryService) Create(category *model.CourseCategory) error {
	return s.categoryRepo.Create(category)
}

// Update updates a category
func (s *CourseCategoryService) Update(id uint, updates map[string]interface{}) error {
	return s.categoryRepo.UpdateFields(id, updates)
}

// Delete deletes a category
func (s *CourseCategoryService) Delete(id uint) error {
	return s.categoryRepo.Delete(id)
}

// =====================================================
// Course Service
// =====================================================

type CourseService struct {
	courseRepo   *repository.CourseRepository
	categoryRepo *repository.CourseCategoryRepository
	chapterRepo  *repository.CourseChapterRepository
	progressRepo *repository.UserCourseProgressRepository
	collectRepo  *repository.UserCourseCollectRepository
}

func NewCourseService(
	courseRepo *repository.CourseRepository,
	categoryRepo *repository.CourseCategoryRepository,
	chapterRepo *repository.CourseChapterRepository,
	progressRepo *repository.UserCourseProgressRepository,
	collectRepo *repository.UserCourseCollectRepository,
) *CourseService {
	return &CourseService{
		courseRepo:   courseRepo,
		categoryRepo: categoryRepo,
		chapterRepo:  chapterRepo,
		progressRepo: progressRepo,
		collectRepo:  collectRepo,
	}
}

// GetCourses gets courses with filters
func (s *CourseService) GetCourses(params *repository.CourseQueryParams) ([]model.Course, int64, error) {
	return s.courseRepo.GetList(params)
}

// GetCourseByID gets a course by ID
func (s *CourseService) GetCourseByID(id uint) (*model.Course, error) {
	course, err := s.courseRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseNotFound
		}
		return nil, err
	}
	return course, nil
}

// GetCourseDetail gets course detail with chapters
func (s *CourseService) GetCourseDetail(id uint, userID uint) (*model.CourseDetailResponse, error) {
	course, err := s.courseRepo.GetWithChapters(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseNotFound
		}
		return nil, err
	}

	// Increment view count
	_ = s.courseRepo.IncrementViewCount(id)

	resp := course.ToDetailResponse()

	// Add user-specific data if logged in
	if userID > 0 {
		resp.IsCollected = s.collectRepo.IsCollected(userID, id)

		// Get study progress
		progress, err := s.progressRepo.GetByUserAndCourse(userID, id)
		if err == nil && progress != nil {
			resp.StudyProgress = progress.Progress
		}
	}

	return resp, nil
}

// GetFeaturedCourses gets featured courses
func (s *CourseService) GetFeaturedCourses(limit int) ([]model.Course, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	return s.courseRepo.GetFeatured(limit)
}

// GetFreeCourses gets free courses
func (s *CourseService) GetFreeCourses(limit int) ([]model.Course, error) {
	if limit <= 0 || limit > 50 {
		limit = 10
	}
	return s.courseRepo.GetFreeCourses(limit)
}

// GetChapterContent gets chapter content
func (s *CourseService) GetChapterContent(chapterID uint, userID uint, isVIP bool) (*model.CourseChapter, error) {
	chapter, err := s.chapterRepo.GetByID(chapterID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrChapterNotFound
		}
		return nil, err
	}

	// Check access
	if !chapter.IsFreePreview {
		// Get course to check if VIP only
		course, err := s.courseRepo.GetByID(chapter.CourseID)
		if err != nil {
			return nil, err
		}
		if course.VIPOnly && !isVIP {
			return nil, ErrChapterAccessDenied
		}
		if !course.IsFree && !isVIP && userID == 0 {
			return nil, ErrChapterAccessDenied
		}
	}

	return chapter, nil
}

// CollectCourse collects a course
func (s *CourseService) CollectCourse(userID, courseID uint) error {
	// Check if course exists
	_, err := s.courseRepo.GetByID(courseID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrCourseNotFound
		}
		return err
	}

	// Check if already collected
	if s.collectRepo.IsCollected(userID, courseID) {
		return ErrCourseAlreadyCollected
	}

	// Create collect record
	collect := &model.UserCourseCollect{
		UserID:   userID,
		CourseID: courseID,
	}
	if err := s.collectRepo.Create(collect); err != nil {
		return err
	}

	// Increment collect count
	_ = s.courseRepo.IncrementCollectCount(courseID)

	return nil
}

// UncollectCourse uncollects a course
func (s *CourseService) UncollectCourse(userID, courseID uint) error {
	if err := s.collectRepo.Delete(userID, courseID); err != nil {
		return err
	}

	// Decrement collect count
	_ = s.courseRepo.DecrementCollectCount(courseID)

	return nil
}

// GetUserCollects gets user's collected courses
func (s *CourseService) GetUserCollects(userID uint, page, pageSize int) ([]model.UserCourseCollect, int64, error) {
	return s.collectRepo.GetUserCollects(userID, page, pageSize)
}

// UpdateStudyProgress updates study progress
func (s *CourseService) UpdateStudyProgress(userID, courseID, chapterID uint, progress float64) error {
	// Get or create progress
	courseProgress, err := s.progressRepo.GetOrCreate(userID, courseID)
	if err != nil {
		return err
	}

	// Update last chapter and time
	now := time.Now()
	courseProgress.LastChapterID = &chapterID
	courseProgress.LastStudyAt = &now

	// Calculate overall progress based on chapter completion
	// For simplicity, just update the passed progress value
	if progress > courseProgress.Progress {
		courseProgress.Progress = progress
	}

	// Check if completed
	if courseProgress.Progress >= 100 {
		courseProgress.IsCompleted = true
		courseProgress.CompletedAt = &now
	}

	return s.progressRepo.Update(courseProgress)
}

// GetUserProgress gets user's course progress
func (s *CourseService) GetUserProgress(userID, courseID uint) (*model.UserCourseProgress, error) {
	return s.progressRepo.GetByUserAndCourse(userID, courseID)
}

// GetRecentLearning gets recently learned courses
func (s *CourseService) GetRecentLearning(userID uint, limit int) ([]model.UserCourseProgress, error) {
	if limit <= 0 || limit > 20 {
		limit = 5
	}
	return s.progressRepo.GetRecentLearning(userID, limit)
}

// GetUserLearningCourses gets all courses user is learning
func (s *CourseService) GetUserLearningCourses(userID uint, page, pageSize int) ([]model.UserCourseProgress, int64, error) {
	return s.progressRepo.GetUserCourses(userID, page, pageSize)
}

// =====================================================
// Admin Methods
// =====================================================

// CreateCourse creates a new course
func (s *CourseService) CreateCourse(course *model.Course) error {
	if err := s.courseRepo.Create(course); err != nil {
		return err
	}
	// Increment category course count
	_ = s.categoryRepo.IncrementCourseCount(course.CategoryID)
	return nil
}

// UpdateCourse updates a course
func (s *CourseService) UpdateCourse(id uint, updates map[string]interface{}) error {
	return s.courseRepo.UpdateFields(id, updates)
}

// DeleteCourse deletes a course
func (s *CourseService) DeleteCourse(id uint) error {
	course, err := s.courseRepo.GetByID(id)
	if err != nil {
		return err
	}
	if err := s.courseRepo.Delete(id); err != nil {
		return err
	}
	// Decrement category course count
	_ = s.categoryRepo.DecrementCourseCount(course.CategoryID)
	return nil
}

// UpdateCourseStatus updates course status
func (s *CourseService) UpdateCourseStatus(id uint, status model.CourseStatus) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if status == model.CourseStatusPublished {
		now := time.Now()
		updates["published_at"] = &now
	}
	return s.courseRepo.UpdateFields(id, updates)
}

// GetChaptersByCourse gets all chapters for a course
func (s *CourseService) GetChaptersByCourse(courseID uint) ([]*model.CourseChapterResponse, error) {
	chapters, err := s.chapterRepo.GetByCourse(courseID)
	if err != nil {
		return nil, err
	}

	// Build tree structure
	chapterMap := make(map[uint]*model.CourseChapterResponse)
	for i := range chapters {
		chapterMap[chapters[i].ID] = chapters[i].ToResponse()
	}

	var roots []*model.CourseChapterResponse
	for _, ch := range chapters {
		resp := chapterMap[ch.ID]
		if ch.ParentID == nil || *ch.ParentID == 0 {
			roots = append(roots, resp)
		} else {
			if parent, exists := chapterMap[*ch.ParentID]; exists {
				parent.Children = append(parent.Children, resp)
			}
		}
	}

	return roots, nil
}

// CreateChapter creates a new chapter
func (s *CourseService) CreateChapter(chapter *model.CourseChapter) error {
	if err := s.chapterRepo.Create(chapter); err != nil {
		return err
	}
	// Update course chapter count
	count, _ := s.chapterRepo.CountByCourse(chapter.CourseID)
	_ = s.courseRepo.UpdateFields(chapter.CourseID, map[string]interface{}{
		"chapter_count": count,
	})
	return nil
}

// UpdateChapter updates a chapter
func (s *CourseService) UpdateChapter(id uint, updates map[string]interface{}) error {
	return s.chapterRepo.UpdateFields(id, updates)
}

// DeleteChapter deletes a chapter
func (s *CourseService) DeleteChapter(id uint) error {
	chapter, err := s.chapterRepo.GetByID(id)
	if err != nil {
		return err
	}
	if err := s.chapterRepo.Delete(id); err != nil {
		return err
	}
	// Update course chapter count
	count, _ := s.chapterRepo.CountByCourse(chapter.CourseID)
	_ = s.courseRepo.UpdateFields(chapter.CourseID, map[string]interface{}{
		"chapter_count": count,
	})
	return nil
}

// CourseStats course statistics
type CourseStats struct {
	TotalCourses     int64            `json:"total_courses"`
	PublishedCourses int64            `json:"published_courses"`
	DraftCourses     int64            `json:"draft_courses"`
	FreeCourses      int64            `json:"free_courses"`
	VIPCourses       int64            `json:"vip_courses"`
	TotalChapters    int64            `json:"total_chapters"`
	TotalKnowledge   int64            `json:"total_knowledge"`
	TotalStudyCount  int64            `json:"total_study_count"`
	CategoryStats    []CategoryStat   `json:"category_stats"`
	SubjectStats     []SubjectStat    `json:"subject_stats"`
	DifficultyStats  []DifficultyStat `json:"difficulty_stats"`
}

type CategoryStat struct {
	CategoryID   uint   `json:"category_id"`
	CategoryName string `json:"category_name"`
	CourseCount  int64  `json:"course_count"`
}

type SubjectStat struct {
	Subject     string `json:"subject"`
	CourseCount int64  `json:"course_count"`
}

type DifficultyStat struct {
	Difficulty  string `json:"difficulty"`
	CourseCount int64  `json:"course_count"`
}

// GetStats gets course statistics
func (s *CourseService) GetStats() (*CourseStats, error) {
	stats := &CourseStats{}

	// Total courses
	s.courseRepo.CountAll(&stats.TotalCourses)

	// Published courses
	s.courseRepo.CountByStatus(model.CourseStatusPublished, &stats.PublishedCourses)

	// Draft courses
	s.courseRepo.CountByStatus(model.CourseStatusDraft, &stats.DraftCourses)

	// Free courses
	s.courseRepo.CountFree(&stats.FreeCourses)

	// VIP courses
	s.courseRepo.CountVIP(&stats.VIPCourses)

	// Total study count
	s.courseRepo.SumStudyCount(&stats.TotalStudyCount)

	return stats, nil
}

// InitCourseContent initializes course content from seed data
func (s *CourseService) InitCourseContent() error {
	// This will be called from the handler to trigger seed data
	// The actual implementation is in database/seed_courses.go
	return nil
}

// =====================================================
// Knowledge Point Service
// =====================================================

type KnowledgePointService struct {
	pointRepo    *repository.KnowledgePointRepository
	categoryRepo *repository.CourseCategoryRepository
}

func NewKnowledgePointService(
	pointRepo *repository.KnowledgePointRepository,
	categoryRepo *repository.CourseCategoryRepository,
) *KnowledgePointService {
	return &KnowledgePointService{
		pointRepo:    pointRepo,
		categoryRepo: categoryRepo,
	}
}

// GetByCategory gets knowledge points by category
func (s *KnowledgePointService) GetByCategory(categoryID uint) ([]*model.KnowledgePointResponse, error) {
	points, err := s.pointRepo.GetByCategory(categoryID)
	if err != nil {
		return nil, err
	}
	return s.buildPointTree(points), nil
}

// GetTree gets knowledge point tree
func (s *KnowledgePointService) GetTree(categoryID uint) ([]*model.KnowledgePointResponse, error) {
	points, err := s.pointRepo.GetTree(categoryID)
	if err != nil {
		return nil, err
	}
	return s.buildPointTree(points), nil
}

// GetHighFrequency gets high-frequency knowledge points
func (s *KnowledgePointService) GetHighFrequency(categoryID uint, limit int) ([]model.KnowledgePoint, error) {
	if limit <= 0 || limit > 50 {
		limit = 20
	}
	return s.pointRepo.GetHighFrequency(categoryID, limit)
}

// GetByID gets a knowledge point by ID
func (s *KnowledgePointService) GetByID(id uint) (*model.KnowledgePointResponse, error) {
	point, err := s.pointRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrKnowledgeNotFound
		}
		return nil, err
	}
	return point.ToResponse(), nil
}

// buildPointTree builds tree structure from flat list
func (s *KnowledgePointService) buildPointTree(points []model.KnowledgePoint) []*model.KnowledgePointResponse {
	pointMap := make(map[uint]*model.KnowledgePointResponse)
	for i := range points {
		pointMap[points[i].ID] = points[i].ToResponse()
	}

	var roots []*model.KnowledgePointResponse
	for _, point := range points {
		resp := pointMap[point.ID]
		if point.ParentID == nil || *point.ParentID == 0 {
			roots = append(roots, resp)
		} else {
			if parent, exists := pointMap[*point.ParentID]; exists {
				parent.Children = append(parent.Children, resp)
			}
		}
	}

	return roots
}

// GetAll gets all knowledge points
func (s *KnowledgePointService) GetAll() ([]*model.KnowledgePointResponse, error) {
	points, err := s.pointRepo.GetAll()
	if err != nil {
		return nil, err
	}
	return s.buildPointTree(points), nil
}

// Create creates a new knowledge point
func (s *KnowledgePointService) Create(point *model.KnowledgePoint) error {
	return s.pointRepo.Create(point)
}

// Update updates a knowledge point
func (s *KnowledgePointService) Update(id uint, updates map[string]interface{}) error {
	return s.pointRepo.UpdateFields(id, updates)
}

// Delete deletes a knowledge point
func (s *KnowledgePointService) Delete(id uint) error {
	return s.pointRepo.Delete(id)
}
