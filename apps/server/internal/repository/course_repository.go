package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// =====================================================
// Course Category Repository
// =====================================================

type CourseCategoryRepository struct {
	db *gorm.DB
}

func NewCourseCategoryRepository(db *gorm.DB) *CourseCategoryRepository {
	return &CourseCategoryRepository{db: db}
}

// Create creates a new category
func (r *CourseCategoryRepository) Create(category *model.CourseCategory) error {
	return r.db.Create(category).Error
}

// Update updates a category
func (r *CourseCategoryRepository) Update(category *model.CourseCategory) error {
	return r.db.Save(category).Error
}

// Delete soft deletes a category
func (r *CourseCategoryRepository) Delete(id uint) error {
	return r.db.Delete(&model.CourseCategory{}, id).Error
}

// GetByID gets a category by ID
func (r *CourseCategoryRepository) GetByID(id uint) (*model.CourseCategory, error) {
	var category model.CourseCategory
	err := r.db.First(&category, id).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetByCode gets a category by code
func (r *CourseCategoryRepository) GetByCode(code string) (*model.CourseCategory, error) {
	var category model.CourseCategory
	err := r.db.Where("code = ?", code).First(&category).Error
	if err != nil {
		return nil, err
	}
	return &category, nil
}

// GetAll gets all active categories
func (r *CourseCategoryRepository) GetAll() ([]model.CourseCategory, error) {
	var categories []model.CourseCategory
	err := r.db.Where("is_active = ?", true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// GetBySubject gets categories by subject
func (r *CourseCategoryRepository) GetBySubject(subject string) ([]model.CourseCategory, error) {
	var categories []model.CourseCategory
	err := r.db.Where("subject = ? AND is_active = ?", subject, true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// GetByExamType gets categories by exam type
func (r *CourseCategoryRepository) GetByExamType(examType string) ([]model.CourseCategory, error) {
	var categories []model.CourseCategory
	err := r.db.Where("exam_type = ? AND is_active = ?", examType, true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// GetTopLevel gets top-level categories (no parent)
func (r *CourseCategoryRepository) GetTopLevel() ([]model.CourseCategory, error) {
	var categories []model.CourseCategory
	err := r.db.Where("parent_id IS NULL AND is_active = ?", true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// GetChildren gets child categories
func (r *CourseCategoryRepository) GetChildren(parentID uint) ([]model.CourseCategory, error) {
	var categories []model.CourseCategory
	err := r.db.Where("parent_id = ? AND is_active = ?", parentID, true).
		Order("sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// GetTree gets category tree (recursive)
func (r *CourseCategoryRepository) GetTree() ([]model.CourseCategory, error) {
	var categories []model.CourseCategory
	err := r.db.Where("is_active = ?", true).
		Order("level ASC, sort_order ASC, id ASC").
		Find(&categories).Error
	return categories, err
}

// IncrementCourseCount increments course count
func (r *CourseCategoryRepository) IncrementCourseCount(id uint) error {
	return r.db.Model(&model.CourseCategory{}).
		Where("id = ?", id).
		Update("course_count", gorm.Expr("course_count + 1")).Error
}

// DecrementCourseCount decrements course count
func (r *CourseCategoryRepository) DecrementCourseCount(id uint) error {
	return r.db.Model(&model.CourseCategory{}).
		Where("id = ? AND course_count > 0", id).
		Update("course_count", gorm.Expr("course_count - 1")).Error
}

// UpdateFields updates specific fields
func (r *CourseCategoryRepository) UpdateFields(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.CourseCategory{}).Where("id = ?", id).Updates(updates).Error
}

// =====================================================
// Course Repository
// =====================================================

type CourseRepository struct {
	db *gorm.DB
}

func NewCourseRepository(db *gorm.DB) *CourseRepository {
	return &CourseRepository{db: db}
}

// CourseQueryParams 课程查询参数
type CourseQueryParams struct {
	CategoryID  uint   `query:"category_id"`
	Subject     string `query:"subject"`
	ExamType    string `query:"exam_type"`
	ContentType string `query:"content_type"`
	Difficulty  string `query:"difficulty"`
	IsFree      *bool  `query:"is_free"`
	VIPOnly     *bool  `query:"vip_only"`
	Status      *int   `query:"status"`
	Keyword     string `query:"keyword"`
	OrderBy     string `query:"order_by"` // latest, popular, views, rating
	Page        int    `query:"page"`
	PageSize    int    `query:"page_size"`
}

// Create creates a new course
func (r *CourseRepository) Create(course *model.Course) error {
	return r.db.Create(course).Error
}

// Update updates a course
func (r *CourseRepository) Update(course *model.Course) error {
	return r.db.Save(course).Error
}

// UpdateFields updates specific fields
func (r *CourseRepository) UpdateFields(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.Course{}).Where("id = ?", id).Updates(updates).Error
}

// Delete soft deletes a course
func (r *CourseRepository) Delete(id uint) error {
	return r.db.Delete(&model.Course{}, id).Error
}

// GetByID gets a course by ID
func (r *CourseRepository) GetByID(id uint) (*model.Course, error) {
	var course model.Course
	err := r.db.Preload("Category").First(&course, id).Error
	if err != nil {
		return nil, err
	}
	return &course, nil
}

// GetWithChapters gets a course with all chapters
func (r *CourseRepository) GetWithChapters(id uint) (*model.Course, error) {
	var course model.Course
	err := r.db.Preload("Category").
		Preload("Chapters", func(db *gorm.DB) *gorm.DB {
			return db.Order("level ASC, sort_order ASC, id ASC")
		}).
		First(&course, id).Error
	if err != nil {
		return nil, err
	}
	return &course, nil
}

// GetList gets courses with filters and pagination
func (r *CourseRepository) GetList(params *CourseQueryParams) ([]model.Course, int64, error) {
	var courses []model.Course
	var total int64

	query := r.db.Model(&model.Course{})

	// Apply filters
	if params.CategoryID > 0 {
		query = query.Where("category_id = ?", params.CategoryID)
	}
	if params.Subject != "" {
		// Join with category to filter by subject
		query = query.Joins("JOIN what_course_categories ON what_courses.category_id = what_course_categories.id").
			Where("what_course_categories.subject = ?", params.Subject)
	}
	if params.ExamType != "" {
		query = query.Joins("JOIN what_course_categories ON what_courses.category_id = what_course_categories.id").
			Where("what_course_categories.exam_type = ?", params.ExamType)
	}
	if params.ContentType != "" {
		query = query.Where("content_type = ?", params.ContentType)
	}
	if params.Difficulty != "" {
		query = query.Where("difficulty = ?", params.Difficulty)
	}
	if params.IsFree != nil {
		query = query.Where("is_free = ?", *params.IsFree)
	}
	if params.VIPOnly != nil {
		query = query.Where("vip_only = ?", *params.VIPOnly)
	}
	if params.Status != nil {
		query = query.Where("what_courses.status = ?", *params.Status)
	} else {
		// Default: only published courses
		query = query.Where("what_courses.status = ?", model.CourseStatusPublished)
	}
	if params.Keyword != "" {
		keyword := "%" + params.Keyword + "%"
		query = query.Where("what_courses.title LIKE ? OR what_courses.subtitle LIKE ?", keyword, keyword)
	}

	// Count total
	query.Count(&total)

	// Order by
	switch params.OrderBy {
	case "popular":
		query = query.Order("what_courses.study_count DESC, what_courses.created_at DESC")
	case "views":
		query = query.Order("what_courses.view_count DESC, what_courses.created_at DESC")
	case "rating":
		query = query.Order("what_courses.like_count DESC, what_courses.created_at DESC")
	default: // latest
		query = query.Order("what_courses.sort_order ASC, what_courses.created_at DESC")
	}

	// Pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Preload("Category").
		Offset(offset).
		Limit(params.PageSize).
		Find(&courses).Error

	return courses, total, err
}

// GetByCategory gets courses by category
func (r *CourseRepository) GetByCategory(categoryID uint, page, pageSize int) ([]model.Course, int64, error) {
	return r.GetList(&CourseQueryParams{
		CategoryID: categoryID,
		Page:       page,
		PageSize:   pageSize,
	})
}

// GetFeatured gets featured/recommended courses
func (r *CourseRepository) GetFeatured(limit int) ([]model.Course, error) {
	var courses []model.Course
	err := r.db.Where("status = ?", model.CourseStatusPublished).
		Order("sort_order ASC, study_count DESC, view_count DESC").
		Limit(limit).
		Preload("Category").
		Find(&courses).Error
	return courses, err
}

// GetFreeCourses gets free courses
func (r *CourseRepository) GetFreeCourses(limit int) ([]model.Course, error) {
	var courses []model.Course
	err := r.db.Where("status = ? AND is_free = ?", model.CourseStatusPublished, true).
		Order("sort_order ASC, study_count DESC").
		Limit(limit).
		Preload("Category").
		Find(&courses).Error
	return courses, err
}

// IncrementViewCount increments view count
func (r *CourseRepository) IncrementViewCount(id uint) error {
	return r.db.Model(&model.Course{}).
		Where("id = ?", id).
		Update("view_count", gorm.Expr("view_count + 1")).Error
}

// IncrementStudyCount increments study count
func (r *CourseRepository) IncrementStudyCount(id uint) error {
	return r.db.Model(&model.Course{}).
		Where("id = ?", id).
		Update("study_count", gorm.Expr("study_count + 1")).Error
}

// IncrementLikeCount increments like count
func (r *CourseRepository) IncrementLikeCount(id uint) error {
	return r.db.Model(&model.Course{}).
		Where("id = ?", id).
		Update("like_count", gorm.Expr("like_count + 1")).Error
}

// DecrementLikeCount decrements like count
func (r *CourseRepository) DecrementLikeCount(id uint) error {
	return r.db.Model(&model.Course{}).
		Where("id = ? AND like_count > 0", id).
		Update("like_count", gorm.Expr("like_count - 1")).Error
}

// IncrementCollectCount increments collect count
func (r *CourseRepository) IncrementCollectCount(id uint) error {
	return r.db.Model(&model.Course{}).
		Where("id = ?", id).
		Update("collect_count", gorm.Expr("collect_count + 1")).Error
}

// DecrementCollectCount decrements collect count
func (r *CourseRepository) DecrementCollectCount(id uint) error {
	return r.db.Model(&model.Course{}).
		Where("id = ? AND collect_count > 0", id).
		Update("collect_count", gorm.Expr("collect_count - 1")).Error
}

// CountAll counts all courses
func (r *CourseRepository) CountAll(count *int64) error {
	return r.db.Model(&model.Course{}).Count(count).Error
}

// CountByStatus counts courses by status
func (r *CourseRepository) CountByStatus(status model.CourseStatus, count *int64) error {
	return r.db.Model(&model.Course{}).Where("status = ?", status).Count(count).Error
}

// CountFree counts free courses
func (r *CourseRepository) CountFree(count *int64) error {
	return r.db.Model(&model.Course{}).Where("is_free = ?", true).Count(count).Error
}

// CountVIP counts VIP courses
func (r *CourseRepository) CountVIP(count *int64) error {
	return r.db.Model(&model.Course{}).Where("vip_only = ?", true).Count(count).Error
}

// SumStudyCount sums total study count
func (r *CourseRepository) SumStudyCount(sum *int64) error {
	var result struct {
		Total int64
	}
	err := r.db.Model(&model.Course{}).Select("COALESCE(SUM(study_count), 0) as total").Scan(&result).Error
	*sum = result.Total
	return err
}

// GetChapterByID gets a chapter by ID (convenience method)
func (r *CourseRepository) GetChapterByID(id uint) (*model.CourseChapter, error) {
	var chapter model.CourseChapter
	err := r.db.Preload("Course").First(&chapter, id).Error
	if err != nil {
		return nil, err
	}
	return &chapter, nil
}

// GetChaptersByCourseID gets all chapters for a course
func (r *CourseRepository) GetChaptersByCourseID(courseID uint) ([]model.CourseChapter, error) {
	var chapters []model.CourseChapter
	err := r.db.Where("course_id = ?", courseID).
		Order("level ASC, sort_order ASC, id ASC").
		Find(&chapters).Error
	return chapters, err
}

// =====================================================
// Course Chapter Repository
// =====================================================

type CourseChapterRepository struct {
	db *gorm.DB
}

func NewCourseChapterRepository(db *gorm.DB) *CourseChapterRepository {
	return &CourseChapterRepository{db: db}
}

// Create creates a new chapter
func (r *CourseChapterRepository) Create(chapter *model.CourseChapter) error {
	return r.db.Create(chapter).Error
}

// Update updates a chapter
func (r *CourseChapterRepository) Update(chapter *model.CourseChapter) error {
	return r.db.Save(chapter).Error
}

// Delete soft deletes a chapter
func (r *CourseChapterRepository) Delete(id uint) error {
	return r.db.Delete(&model.CourseChapter{}, id).Error
}

// GetByID gets a chapter by ID
func (r *CourseChapterRepository) GetByID(id uint) (*model.CourseChapter, error) {
	var chapter model.CourseChapter
	err := r.db.First(&chapter, id).Error
	if err != nil {
		return nil, err
	}
	return &chapter, nil
}

// GetByCourse gets all chapters for a course
func (r *CourseChapterRepository) GetByCourse(courseID uint) ([]model.CourseChapter, error) {
	var chapters []model.CourseChapter
	err := r.db.Where("course_id = ?", courseID).
		Order("level ASC, sort_order ASC, id ASC").
		Find(&chapters).Error
	return chapters, err
}

// GetTopLevel gets top-level chapters (no parent)
func (r *CourseChapterRepository) GetTopLevel(courseID uint) ([]model.CourseChapter, error) {
	var chapters []model.CourseChapter
	err := r.db.Where("course_id = ? AND parent_id IS NULL", courseID).
		Order("sort_order ASC, id ASC").
		Find(&chapters).Error
	return chapters, err
}

// GetChildren gets child chapters
func (r *CourseChapterRepository) GetChildren(parentID uint) ([]model.CourseChapter, error) {
	var chapters []model.CourseChapter
	err := r.db.Where("parent_id = ?", parentID).
		Order("sort_order ASC, id ASC").
		Find(&chapters).Error
	return chapters, err
}

// CountByCourse counts chapters for a course
func (r *CourseChapterRepository) CountByCourse(courseID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.CourseChapter{}).
		Where("course_id = ?", courseID).
		Count(&count).Error
	return count, err
}

// UpdateFields updates specific fields
func (r *CourseChapterRepository) UpdateFields(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.CourseChapter{}).Where("id = ?", id).Updates(updates).Error
}

// =====================================================
// Knowledge Point Repository
// =====================================================

type KnowledgePointRepository struct {
	db *gorm.DB
}

func NewKnowledgePointRepository(db *gorm.DB) *KnowledgePointRepository {
	return &KnowledgePointRepository{db: db}
}

// Create creates a new knowledge point
func (r *KnowledgePointRepository) Create(point *model.KnowledgePoint) error {
	return r.db.Create(point).Error
}

// Update updates a knowledge point
func (r *KnowledgePointRepository) Update(point *model.KnowledgePoint) error {
	return r.db.Save(point).Error
}

// Delete soft deletes a knowledge point
func (r *KnowledgePointRepository) Delete(id uint) error {
	return r.db.Delete(&model.KnowledgePoint{}, id).Error
}

// GetByID gets a knowledge point by ID
func (r *KnowledgePointRepository) GetByID(id uint) (*model.KnowledgePoint, error) {
	var point model.KnowledgePoint
	err := r.db.Preload("Category").First(&point, id).Error
	if err != nil {
		return nil, err
	}
	return &point, nil
}

// GetByCode gets a knowledge point by code
func (r *KnowledgePointRepository) GetByCode(code string) (*model.KnowledgePoint, error) {
	var point model.KnowledgePoint
	err := r.db.Where("code = ?", code).First(&point).Error
	if err != nil {
		return nil, err
	}
	return &point, nil
}

// GetByCategory gets knowledge points by category
func (r *KnowledgePointRepository) GetByCategory(categoryID uint) ([]model.KnowledgePoint, error) {
	var points []model.KnowledgePoint
	err := r.db.Where("category_id = ?", categoryID).
		Order("level ASC, sort_order ASC, id ASC").
		Find(&points).Error
	return points, err
}

// GetTopLevel gets top-level knowledge points (no parent)
func (r *KnowledgePointRepository) GetTopLevel(categoryID uint) ([]model.KnowledgePoint, error) {
	var points []model.KnowledgePoint
	err := r.db.Where("category_id = ? AND parent_id IS NULL", categoryID).
		Order("sort_order ASC, id ASC").
		Find(&points).Error
	return points, err
}

// GetChildren gets child knowledge points
func (r *KnowledgePointRepository) GetChildren(parentID uint) ([]model.KnowledgePoint, error) {
	var points []model.KnowledgePoint
	err := r.db.Where("parent_id = ?", parentID).
		Order("sort_order ASC, id ASC").
		Find(&points).Error
	return points, err
}

// GetHighFrequency gets high-frequency knowledge points
func (r *KnowledgePointRepository) GetHighFrequency(categoryID uint, limit int) ([]model.KnowledgePoint, error) {
	var points []model.KnowledgePoint
	query := r.db.Where("frequency = ?", model.KnowledgeFrequencyHigh)
	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}
	err := query.Order("importance DESC, sort_order ASC").
		Limit(limit).
		Find(&points).Error
	return points, err
}

// GetTree gets knowledge point tree
func (r *KnowledgePointRepository) GetTree(categoryID uint) ([]model.KnowledgePoint, error) {
	var points []model.KnowledgePoint
	err := r.db.Where("category_id = ?", categoryID).
		Order("level ASC, sort_order ASC, id ASC").
		Find(&points).Error
	return points, err
}

// GetAll gets all knowledge points
func (r *KnowledgePointRepository) GetAll() ([]model.KnowledgePoint, error) {
	var points []model.KnowledgePoint
	err := r.db.Order("category_id ASC, level ASC, sort_order ASC, id ASC").
		Find(&points).Error
	return points, err
}

// UpdateFields updates specific fields
func (r *KnowledgePointRepository) UpdateFields(id uint, updates map[string]interface{}) error {
	return r.db.Model(&model.KnowledgePoint{}).Where("id = ?", id).Updates(updates).Error
}

// =====================================================
// User Course Progress Repository
// =====================================================

type UserCourseProgressRepository struct {
	db *gorm.DB
}

func NewUserCourseProgressRepository(db *gorm.DB) *UserCourseProgressRepository {
	return &UserCourseProgressRepository{db: db}
}

// Create creates a progress record
func (r *UserCourseProgressRepository) Create(progress *model.UserCourseProgress) error {
	return r.db.Create(progress).Error
}

// Update updates a progress record
func (r *UserCourseProgressRepository) Update(progress *model.UserCourseProgress) error {
	return r.db.Save(progress).Error
}

// GetByUserAndCourse gets progress for a user-course pair
func (r *UserCourseProgressRepository) GetByUserAndCourse(userID, courseID uint) (*model.UserCourseProgress, error) {
	var progress model.UserCourseProgress
	err := r.db.Where("user_id = ? AND course_id = ?", userID, courseID).First(&progress).Error
	if err != nil {
		return nil, err
	}
	return &progress, nil
}

// GetOrCreate gets or creates progress for a user-course pair
func (r *UserCourseProgressRepository) GetOrCreate(userID, courseID uint) (*model.UserCourseProgress, error) {
	progress, err := r.GetByUserAndCourse(userID, courseID)
	if err == nil {
		return progress, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}
	// Create new progress
	progress = &model.UserCourseProgress{
		UserID:   userID,
		CourseID: courseID,
	}
	if err := r.Create(progress); err != nil {
		return nil, err
	}
	return progress, nil
}

// GetUserCourses gets all courses a user is learning
func (r *UserCourseProgressRepository) GetUserCourses(userID uint, page, pageSize int) ([]model.UserCourseProgress, int64, error) {
	var progresses []model.UserCourseProgress
	var total int64

	query := r.db.Model(&model.UserCourseProgress{}).Where("user_id = ?", userID)
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Preload("Course").Preload("Course.Category").
		Order("last_study_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&progresses).Error

	return progresses, total, err
}

// GetRecentLearning gets recently learning courses
func (r *UserCourseProgressRepository) GetRecentLearning(userID uint, limit int) ([]model.UserCourseProgress, error) {
	var progresses []model.UserCourseProgress
	err := r.db.Where("user_id = ? AND last_study_at IS NOT NULL", userID).
		Preload("Course").Preload("Course.Category").
		Order("last_study_at DESC").
		Limit(limit).
		Find(&progresses).Error
	return progresses, err
}

// GetCompletedCourses gets completed courses
func (r *UserCourseProgressRepository) GetCompletedCourses(userID uint) ([]model.UserCourseProgress, error) {
	var progresses []model.UserCourseProgress
	err := r.db.Where("user_id = ? AND is_completed = ?", userID, true).
		Preload("Course").Preload("Course.Category").
		Order("completed_at DESC").
		Find(&progresses).Error
	return progresses, err
}

// =====================================================
// User Course Collect Repository
// =====================================================

type UserCourseCollectRepository struct {
	db *gorm.DB
}

func NewUserCourseCollectRepository(db *gorm.DB) *UserCourseCollectRepository {
	return &UserCourseCollectRepository{db: db}
}

// Create creates a collect record
func (r *UserCourseCollectRepository) Create(collect *model.UserCourseCollect) error {
	return r.db.Create(collect).Error
}

// Delete removes a collect record
func (r *UserCourseCollectRepository) Delete(userID, courseID uint) error {
	return r.db.Where("user_id = ? AND course_id = ?", userID, courseID).
		Delete(&model.UserCourseCollect{}).Error
}

// IsCollected checks if a course is collected by user
func (r *UserCourseCollectRepository) IsCollected(userID, courseID uint) bool {
	var count int64
	r.db.Model(&model.UserCourseCollect{}).
		Where("user_id = ? AND course_id = ?", userID, courseID).
		Count(&count)
	return count > 0
}

// GetUserCollects gets all collected courses for a user
func (r *UserCourseCollectRepository) GetUserCollects(userID uint, page, pageSize int) ([]model.UserCourseCollect, int64, error) {
	var collects []model.UserCourseCollect
	var total int64

	query := r.db.Model(&model.UserCourseCollect{}).Where("user_id = ?", userID)
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Preload("Course").Preload("Course.Category").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&collects).Error

	return collects, total, err
}
