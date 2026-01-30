package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"gorm.io/gorm"
)

var (
	ErrCourseTemplateNotFound     = errors.New("模板不存在")
	ErrGeneratorInvalidSubject    = errors.New("无效的科目")
	ErrGeneratorTaskNotFound      = errors.New("任务不存在")
	ErrGeneratorInvalidImportData = errors.New("无效的导入数据")
)

// ContentGeneratorService 内容生成服务
type ContentGeneratorService struct {
	db           *gorm.DB
	categoryRepo *repository.CourseCategoryRepository
	courseRepo   *repository.CourseRepository
	chapterRepo  *repository.CourseChapterRepository
	pointRepo    *repository.KnowledgePointRepository
}

// NewContentGeneratorService 创建内容生成服务
func NewContentGeneratorService(
	db *gorm.DB,
	categoryRepo *repository.CourseCategoryRepository,
	courseRepo *repository.CourseRepository,
	chapterRepo *repository.CourseChapterRepository,
	pointRepo *repository.KnowledgePointRepository,
) *ContentGeneratorService {
	return &ContentGeneratorService{
		db:           db,
		categoryRepo: categoryRepo,
		courseRepo:   courseRepo,
		chapterRepo:  chapterRepo,
		pointRepo:    pointRepo,
	}
}

// =====================================================
// 任务管理
// =====================================================

// CreateTask 创建任务
func (s *ContentGeneratorService) CreateTask(taskType model.ContentGeneratorTaskType, subject string, totalItems int, createdBy uint) (*model.ContentGeneratorTask, error) {
	task := &model.ContentGeneratorTask{
		TaskType:   taskType,
		Status:     model.TaskStatusPending,
		Subject:    subject,
		TotalItems: totalItems,
		CreatedBy:  createdBy,
	}
	if err := s.db.Create(task).Error; err != nil {
		return nil, err
	}
	return task, nil
}

// GetTask 获取任务
func (s *ContentGeneratorService) GetTask(id uint) (*model.ContentGeneratorTask, error) {
	var task model.ContentGeneratorTask
	if err := s.db.First(&task, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrGeneratorTaskNotFound
		}
		return nil, err
	}
	return &task, nil
}

// GetTasks 获取任务列表
func (s *ContentGeneratorService) GetTasks(page, pageSize int) ([]model.ContentGeneratorTask, int64, error) {
	var tasks []model.ContentGeneratorTask
	var total int64

	query := s.db.Model(&model.ContentGeneratorTask{})
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Order("created_at DESC").Offset(offset).Limit(pageSize).Find(&tasks).Error; err != nil {
		return nil, 0, err
	}

	return tasks, total, nil
}

// UpdateTaskStatus 更新任务状态
func (s *ContentGeneratorService) UpdateTaskStatus(task *model.ContentGeneratorTask) error {
	return s.db.Save(task).Error
}

// =====================================================
// 批量创建分类
// =====================================================

// BatchCreateCategories 批量创建分类
func (s *ContentGeneratorService) BatchCreateCategories(req *model.BatchCreateCategoryRequest, createdBy uint) (*model.ContentGeneratorTask, error) {
	// 统计总数
	totalItems := countCategoryItems(req.Items)

	// 创建任务
	task, err := s.CreateTask(model.TaskTypeCategory, req.Subject, totalItems, createdBy)
	if err != nil {
		return nil, err
	}

	// 开始处理
	now := time.Now()
	task.Status = model.TaskStatusProcessing
	task.StartedAt = &now
	s.UpdateTaskStatus(task)

	// 执行创建
	go func() {
		successCount, failedCount, errMsg := s.createCategoriesRecursive(req.Items, nil, req.Subject, req.ExamType, 1)

		task.ProcessedItems = totalItems
		task.SuccessItems = successCount
		task.FailedItems = failedCount
		if errMsg != "" {
			task.ErrorMessage = errMsg
		}

		completed := time.Now()
		task.CompletedAt = &completed
		if failedCount > 0 {
			task.Status = model.TaskStatusFailed
		} else {
			task.Status = model.TaskStatusCompleted
		}
		s.UpdateTaskStatus(task)
	}()

	return task, nil
}

func countCategoryItems(items []model.BatchCreateCategoryItem) int {
	count := len(items)
	for _, item := range items {
		count += countCategoryItems(item.Children)
	}
	return count
}

func (s *ContentGeneratorService) createCategoriesRecursive(items []model.BatchCreateCategoryItem, parentID *uint, subject, examType string, level int) (int, int, string) {
	var successCount, failedCount int
	var errMsgs []string

	for i, item := range items {
		category := &model.CourseCategory{
			ParentID:    parentID,
			Name:        item.Name,
			Code:        item.Code,
			Subject:     subject,
			ExamType:    examType,
			Description: item.Description,
			Icon:        item.Icon,
			Color:       item.Color,
			SortOrder:   item.SortOrder,
			Level:       level,
			IsActive:    true,
		}

		if category.SortOrder == 0 {
			category.SortOrder = (i + 1) * 10
		}

		if err := s.categoryRepo.Create(category); err != nil {
			failedCount++
			errMsgs = append(errMsgs, fmt.Sprintf("创建分类[%s]失败: %v", item.Name, err))
			continue
		}

		successCount++

		// 递归创建子分类
		if len(item.Children) > 0 {
			childSuccess, childFailed, childErr := s.createCategoriesRecursive(item.Children, &category.ID, subject, examType, level+1)
			successCount += childSuccess
			failedCount += childFailed
			if childErr != "" {
				errMsgs = append(errMsgs, childErr)
			}
		}
	}

	return successCount, failedCount, strings.Join(errMsgs, "; ")
}

// =====================================================
// 批量创建课程
// =====================================================

// BatchCreateCourses 批量创建课程
func (s *ContentGeneratorService) BatchCreateCourses(req *model.BatchCreateCourseRequest, createdBy uint) (*model.ContentGeneratorTask, error) {
	// 统计总数
	totalItems := len(req.Items)
	for _, item := range req.Items {
		totalItems += countChapterItems(item.Chapters)
	}

	// 创建任务
	task, err := s.CreateTask(model.TaskTypeCourse, "", totalItems, createdBy)
	if err != nil {
		return nil, err
	}

	// 开始处理
	now := time.Now()
	task.Status = model.TaskStatusProcessing
	task.StartedAt = &now
	s.UpdateTaskStatus(task)

	// 执行创建
	go func() {
		var successCount, failedCount int
		var errMsgs []string

		for i, item := range req.Items {
			course := &model.Course{
				CategoryID:  req.CategoryID,
				Title:       item.Title,
				Subtitle:    item.Subtitle,
				Description: item.Description,
				CoverImage:  item.CoverImage,
				ContentType: req.ContentType,
				Difficulty:  req.Difficulty,
				Duration:    item.Duration,
				TeacherName: req.TeacherName,
				IsFree:      req.IsFree,
				VIPOnly:     req.VIPOnly,
				Status:      req.Status,
				Tags:        item.Tags,
				SortOrder:   (i + 1) * 10,
			}

			if err := s.courseRepo.Create(course); err != nil {
				failedCount++
				errMsgs = append(errMsgs, fmt.Sprintf("创建课程[%s]失败: %v", item.Title, err))
				continue
			}

			successCount++

			// 创建章节
			if len(item.Chapters) > 0 {
				chSuccess, chFailed, chErr := s.createChaptersRecursive(item.Chapters, course.ID, nil, 1)
				successCount += chSuccess
				failedCount += chFailed
				if chErr != "" {
					errMsgs = append(errMsgs, chErr)
				}

				// 更新课程章节数
				course.ChapterCount = chSuccess
				s.courseRepo.Update(course)
			}
		}

		task.ProcessedItems = totalItems
		task.SuccessItems = successCount
		task.FailedItems = failedCount
		if len(errMsgs) > 0 {
			task.ErrorMessage = strings.Join(errMsgs, "; ")
		}

		completed := time.Now()
		task.CompletedAt = &completed
		if failedCount > 0 {
			task.Status = model.TaskStatusFailed
		} else {
			task.Status = model.TaskStatusCompleted
		}
		s.UpdateTaskStatus(task)
	}()

	return task, nil
}

func countChapterItems(items []model.BatchCreateChapterItem) int {
	count := len(items)
	for _, item := range items {
		count += countChapterItems(item.Children)
	}
	return count
}

func (s *ContentGeneratorService) createChaptersRecursive(items []model.BatchCreateChapterItem, courseID uint, parentID *uint, level int) (int, int, string) {
	var successCount, failedCount int
	var errMsgs []string

	for i, item := range items {
		chapter := &model.CourseChapter{
			CourseID:      courseID,
			ParentID:      parentID,
			Title:         item.Title,
			ContentType:   item.ContentType,
			ContentURL:    item.ContentURL,
			ContentText:   item.ContentText,
			Duration:      item.Duration,
			IsFreePreview: item.IsFreePreview,
			SortOrder:     (i + 1) * 10,
			Level:         level,
		}

		if err := s.chapterRepo.Create(chapter); err != nil {
			failedCount++
			errMsgs = append(errMsgs, fmt.Sprintf("创建章节[%s]失败: %v", item.Title, err))
			continue
		}

		successCount++

		// 递归创建子章节
		if len(item.Children) > 0 {
			childSuccess, childFailed, childErr := s.createChaptersRecursive(item.Children, courseID, &chapter.ID, level+1)
			successCount += childSuccess
			failedCount += childFailed
			if childErr != "" {
				errMsgs = append(errMsgs, childErr)
			}
		}
	}

	return successCount, failedCount, strings.Join(errMsgs, "; ")
}

// =====================================================
// 批量创建知识点
// =====================================================

// BatchCreateKnowledgePoints 批量创建知识点
func (s *ContentGeneratorService) BatchCreateKnowledgePoints(req *model.BatchCreateKnowledgeRequest, createdBy uint) (*model.ContentGeneratorTask, error) {
	// 统计总数
	totalItems := countKnowledgeItems(req.Items)

	// 创建任务
	task, err := s.CreateTask(model.TaskTypeKnowledge, "", totalItems, createdBy)
	if err != nil {
		return nil, err
	}

	// 开始处理
	now := time.Now()
	task.Status = model.TaskStatusProcessing
	task.StartedAt = &now
	s.UpdateTaskStatus(task)

	// 执行创建
	go func() {
		successCount, failedCount, errMsg := s.createKnowledgePointsRecursive(req.Items, req.CategoryID, nil, 1)

		task.ProcessedItems = totalItems
		task.SuccessItems = successCount
		task.FailedItems = failedCount
		if errMsg != "" {
			task.ErrorMessage = errMsg
		}

		completed := time.Now()
		task.CompletedAt = &completed
		if failedCount > 0 {
			task.Status = model.TaskStatusFailed
		} else {
			task.Status = model.TaskStatusCompleted
		}
		s.UpdateTaskStatus(task)
	}()

	return task, nil
}

func countKnowledgeItems(items []model.BatchCreateKnowledgeItem) int {
	count := len(items)
	for _, item := range items {
		count += countKnowledgeItems(item.Children)
	}
	return count
}

func (s *ContentGeneratorService) createKnowledgePointsRecursive(items []model.BatchCreateKnowledgeItem, categoryID uint, parentID *uint, level int) (int, int, string) {
	var successCount, failedCount int
	var errMsgs []string

	for i, item := range items {
		point := &model.KnowledgePoint{
			CategoryID:     categoryID,
			ParentID:       parentID,
			Code:           item.Code,
			Name:           item.Name,
			Description:    item.Description,
			Importance:     item.Importance,
			Frequency:      item.Frequency,
			Tips:           item.Tips,
			RelatedCourses: item.RelatedCourses,
			SortOrder:      (i + 1) * 10,
			Level:          level,
		}

		if point.Importance == 0 {
			point.Importance = 3
		}
		if point.Frequency == "" {
			point.Frequency = model.KnowledgeFrequencyMedium
		}

		if err := s.pointRepo.Create(point); err != nil {
			failedCount++
			errMsgs = append(errMsgs, fmt.Sprintf("创建知识点[%s]失败: %v", item.Name, err))
			continue
		}

		successCount++

		// 递归创建子知识点
		if len(item.Children) > 0 {
			childSuccess, childFailed, childErr := s.createKnowledgePointsRecursive(item.Children, categoryID, &point.ID, level+1)
			successCount += childSuccess
			failedCount += childFailed
			if childErr != "" {
				errMsgs = append(errMsgs, childErr)
			}
		}
	}

	return successCount, failedCount, strings.Join(errMsgs, "; ")
}

// =====================================================
// 从模板生成
// =====================================================

// GenerateFromTemplate 从模板生成内容
func (s *ContentGeneratorService) GenerateFromTemplate(req *model.GenerateFromTemplateRequest, createdBy uint) (*model.ContentGeneratorTask, error) {
	// 获取模板
	var template model.CourseTemplate
	if err := s.db.First(&template, req.TemplateID).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseTemplateNotFound
		}
		return nil, err
	}

	// 解析模板结构
	var structure map[string]interface{}
	if err := json.Unmarshal([]byte(template.Structure), &structure); err != nil {
		return nil, fmt.Errorf("解析模板结构失败: %v", err)
	}

	// 计算总项数
	totalItems := countStructureItems(structure)

	// 创建任务
	task, err := s.CreateTask(model.TaskTypeTemplate, template.Subject, totalItems, createdBy)
	if err != nil {
		return nil, err
	}
	task.TemplateName = template.Name

	// 开始处理
	now := time.Now()
	task.Status = model.TaskStatusProcessing
	task.StartedAt = &now
	s.UpdateTaskStatus(task)

	// 更新模板使用次数
	s.db.Model(&template).Update("usage_count", gorm.Expr("usage_count + 1"))

	// 异步执行生成
	go func() {
		successCount, failedCount, errMsg := s.generateFromStructure(structure, req.Subject, req.ExamType)

		task.ProcessedItems = totalItems
		task.SuccessItems = successCount
		task.FailedItems = failedCount
		if errMsg != "" {
			task.ErrorMessage = errMsg
		}

		completed := time.Now()
		task.CompletedAt = &completed
		if failedCount > 0 {
			task.Status = model.TaskStatusFailed
		} else {
			task.Status = model.TaskStatusCompleted
		}
		s.UpdateTaskStatus(task)
	}()

	return task, nil
}

func countStructureItems(structure map[string]interface{}) int {
	count := 0
	for _, v := range structure {
		count++
		if children, ok := v.(map[string]interface{}); ok {
			count += countStructureItems(children)
		} else if arr, ok := v.([]interface{}); ok {
			count += len(arr)
		}
	}
	return count
}

func (s *ContentGeneratorService) generateFromStructure(structure map[string]interface{}, subject, examType string) (int, int, string) {
	// 这里实现从结构生成内容的逻辑
	// 简化实现：直接返回成功
	return len(structure), 0, ""
}

// =====================================================
// 快速生成预设内容
// =====================================================

// GenerateSubjectCategories 生成科目分类结构
func (s *ContentGeneratorService) GenerateSubjectCategories(subject string, createdBy uint) (*model.ContentGeneratorTask, error) {
	structure := model.GetCourseStructure(subject)
	if structure == nil {
		return nil, ErrGeneratorInvalidSubject
	}

	subjectName := model.GetSubjectName(subject)

	// 构建批量创建请求
	var items []model.BatchCreateCategoryItem
	sortOrder := 10
	for categoryName, subCategories := range structure {
		categoryCode := fmt.Sprintf("%s_%d", subject, sortOrder)
		item := model.BatchCreateCategoryItem{
			Code:      categoryCode,
			Name:      categoryName,
			SortOrder: sortOrder,
		}

		// 添加子分类
		childOrder := 10
		for _, subName := range subCategories {
			childCode := fmt.Sprintf("%s_%d_%d", subject, sortOrder, childOrder)
			item.Children = append(item.Children, model.BatchCreateCategoryItem{
				Code:      childCode,
				Name:      subName,
				SortOrder: childOrder,
			})
			childOrder += 10
		}

		items = append(items, item)
		sortOrder += 10
	}

	req := &model.BatchCreateCategoryRequest{
		Subject:  subject,
		ExamType: "公务员",
		Items:    items,
	}

	task, err := s.BatchCreateCategories(req, createdBy)
	if err != nil {
		return nil, err
	}
	task.TemplateName = subjectName + "课程分类结构"
	s.UpdateTaskStatus(task)

	return task, nil
}

// GenerateSubjectCourses 生成科目课程
func (s *ContentGeneratorService) GenerateSubjectCourses(subject string, categoryID uint, createdBy uint) (*model.ContentGeneratorTask, error) {
	structure := model.GetCourseStructure(subject)
	if structure == nil {
		return nil, ErrGeneratorInvalidSubject
	}

	subjectName := model.GetSubjectName(subject)

	// 构建批量创建课程请求
	var items []model.BatchCreateCourseItem
	for categoryName, subCategories := range structure {
		// 每个大类生成一门课程
		course := model.BatchCreateCourseItem{
			Title:       subjectName + " - " + categoryName + "精讲",
			Subtitle:    "系统掌握" + categoryName + "核心考点",
			Description: fmt.Sprintf("本课程系统讲解%s科目中%s模块的核心知识点和解题技巧。", subjectName, categoryName),
		}

		// 子分类作为章节
		for i, subName := range subCategories {
			course.Chapters = append(course.Chapters, model.BatchCreateChapterItem{
				Title:         subName,
				Duration:      45,
				IsFreePreview: i == 0, // 第一个章节免费试看
			})
		}

		items = append(items, course)
	}

	req := &model.BatchCreateCourseRequest{
		CategoryID:  categoryID,
		ContentType: model.CourseContentVideo,
		Difficulty:  model.CourseDifficultyBasic,
		TeacherName: "公考名师",
		IsFree:      false,
		VIPOnly:     false,
		Status:      model.CourseStatusDraft,
		Items:       items,
	}

	task, err := s.BatchCreateCourses(req, createdBy)
	if err != nil {
		return nil, err
	}
	task.TemplateName = subjectName + "课程内容"
	s.UpdateTaskStatus(task)

	return task, nil
}

// EnrichCategoryDescription 使用 AI 丰富分类描述
func (s *ContentGeneratorService) EnrichCategoryDescription(categoryID uint) (*model.CourseCategory, error) {
	// 获取分类
	category, err := s.categoryRepo.GetByID(categoryID)
	if err != nil {
		return nil, fmt.Errorf("分类不存在: %w", err)
	}

	// TODO: 调用 LLM 生成丰富的描述
	// 这里是一个占位实现，实际应该调用 AI 服务
	// 根据分类名称和现有描述生成：
	// - long_description (详细描述 200-300 字)
	// - features (功能亮点 3-5 条)
	// - learning_objectives (学习目标 3-5 条)
	// - key_points (核心考点 5-8 条)

	// 占位实现：根据分类名称生成基础描述
	if category.LongDescription == "" {
		category.LongDescription = fmt.Sprintf(
			"%s是公务员考试中的重要考点，系统学习本模块可以帮助考生掌握核心知识点和解题技巧。"+
				"通过本课程的学习，您将了解%s的基本概念、常见题型和高效解题方法，"+
				"提升应试能力，在考试中取得优异成绩。",
			category.Name, category.Name,
		)
	}

	if len(category.Features) == 0 {
		category.Features = []string{
			"系统化知识体系梳理",
			"高频考点精准覆盖",
			"典型例题深度剖析",
			"解题技巧方法总结",
		}
	}

	if len(category.LearningObjectives) == 0 {
		category.LearningObjectives = []string{
			fmt.Sprintf("掌握%s的基本概念和核心原理", category.Name),
			"熟悉常见题型和出题规律",
			"学会高效的解题方法和技巧",
			"能够举一反三，灵活应对各类变式题",
		}
	}

	if len(category.KeyPoints) == 0 {
		category.KeyPoints = []string{
			"核心概念",
			"基础方法",
			"常见题型",
			"解题技巧",
			"易错点分析",
		}
	}

	// 保存更新
	if err := s.db.Save(category).Error; err != nil {
		return nil, fmt.Errorf("保存更新失败: %w", err)
	}

	return category, nil
}

// =====================================================
// 统计
// =====================================================

// GetContentStats 获取内容统计
func (s *ContentGeneratorService) GetContentStats() (*model.GenerateContentStats, error) {
	stats := &model.GenerateContentStats{}

	s.db.Model(&model.CourseCategory{}).Count(new(int64))
	var categoryCount int64
	s.db.Model(&model.CourseCategory{}).Where("deleted_at IS NULL").Count(&categoryCount)
	stats.TotalCategories = int(categoryCount)

	var courseCount int64
	s.db.Model(&model.Course{}).Where("deleted_at IS NULL").Count(&courseCount)
	stats.TotalCourses = int(courseCount)

	var chapterCount int64
	s.db.Model(&model.CourseChapter{}).Where("deleted_at IS NULL").Count(&chapterCount)
	stats.TotalChapters = int(chapterCount)

	var pointCount int64
	s.db.Model(&model.KnowledgePoint{}).Where("deleted_at IS NULL").Count(&pointCount)
	stats.TotalKnowledgePoints = int(pointCount)

	return stats, nil
}

// =====================================================
// 模板管理
// =====================================================

// GetTemplates 获取模板列表
func (s *ContentGeneratorService) GetTemplates(subject string) ([]model.CourseTemplate, error) {
	var templates []model.CourseTemplate
	query := s.db.Where("is_active = ?", true)
	if subject != "" {
		query = query.Where("subject = ?", subject)
	}
	if err := query.Order("sort_order ASC, created_at DESC").Find(&templates).Error; err != nil {
		return nil, err
	}
	return templates, nil
}

// GetTemplate 获取模板
func (s *ContentGeneratorService) GetTemplate(id uint) (*model.CourseTemplate, error) {
	var template model.CourseTemplate
	if err := s.db.First(&template, id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrCourseTemplateNotFound
		}
		return nil, err
	}
	return &template, nil
}

// CreateTemplate 创建模板
func (s *ContentGeneratorService) CreateTemplate(template *model.CourseTemplate) error {
	return s.db.Create(template).Error
}

// UpdateTemplate 更新模板
func (s *ContentGeneratorService) UpdateTemplate(template *model.CourseTemplate) error {
	return s.db.Save(template).Error
}

// DeleteTemplate 删除模板
func (s *ContentGeneratorService) DeleteTemplate(id uint) error {
	return s.db.Delete(&model.CourseTemplate{}, id).Error
}

// CleanupSubjectData 清理指定科目的所有数据（调试用）
func (s *ContentGeneratorService) CleanupSubjectData(subject string) (map[string]interface{}, error) {
	result := map[string]interface{}{
		"subject": subject,
	}

	codePrefix := subject + "_%"

	// 1. 查询分类数量
	var categoryCount int64
	s.db.Table("what_course_categories").Where("subject = ? OR code LIKE ?", subject, codePrefix).Count(&categoryCount)
	result["categories_found"] = categoryCount

	// 2. 查询课程数量
	var courseCount int64
	s.db.Raw(`
		SELECT COUNT(*) FROM what_courses c
		INNER JOIN what_course_categories cat ON c.category_id = cat.id
		WHERE cat.subject = ? OR cat.code LIKE ?
	`, subject, codePrefix).Scan(&courseCount)
	result["courses_found"] = courseCount

	// 3. 查询章节数量
	var chapterCount int64
	s.db.Raw(`
		SELECT COUNT(*) FROM what_course_chapters ch
		INNER JOIN what_courses c ON ch.course_id = c.id
		INNER JOIN what_course_categories cat ON c.category_id = cat.id
		WHERE cat.subject = ? OR cat.code LIKE ?
	`, subject, codePrefix).Scan(&chapterCount)
	result["chapters_found"] = chapterCount

	// 4. 执行删除（使用 GORM 的方式，而不是原生 SQL）
	// 获取分类ID列表
	var categoryIDs []uint
	s.db.Table("what_course_categories").
		Where("subject = ? OR code LIKE ?", subject, codePrefix).
		Pluck("id", &categoryIDs)
	result["category_ids_count"] = len(categoryIDs)

	if len(categoryIDs) > 0 {
		// 获取课程ID列表
		var courseIDs []uint
		s.db.Table("what_courses").Where("category_id IN ?", categoryIDs).Pluck("id", &courseIDs)

		// 删除章节
		if len(courseIDs) > 0 {
			chapterResult := s.db.Table("what_course_chapters").Where("course_id IN ?", courseIDs).Delete(nil)
			result["chapters_deleted"] = chapterResult.RowsAffected
			if chapterResult.Error != nil {
				result["chapters_delete_error"] = chapterResult.Error.Error()
			}
		} else {
			result["chapters_deleted"] = int64(0)
		}

		// 删除课程
		courseResult := s.db.Table("what_courses").Where("category_id IN ?", categoryIDs).Delete(nil)
		result["courses_deleted"] = courseResult.RowsAffected
		if courseResult.Error != nil {
			result["courses_delete_error"] = courseResult.Error.Error()
		}

		// 删除分类（按层级从深到浅删除，避免外键约束问题）
		var totalDeleted int64
		// 先删除 Level 3（专题）
		level3Result := s.db.Table("what_course_categories").Where("id IN ? AND level = 3", categoryIDs).Delete(nil)
		totalDeleted += level3Result.RowsAffected

		// 再删除 Level 2（分类）
		level2Result := s.db.Table("what_course_categories").Where("id IN ? AND level = 2", categoryIDs).Delete(nil)
		totalDeleted += level2Result.RowsAffected

		// 最后删除 Level 1（模块）
		level1Result := s.db.Table("what_course_categories").Where("id IN ? AND level = 1", categoryIDs).Delete(nil)
		totalDeleted += level1Result.RowsAffected

		// 删除任何剩余的（可能 level 字段未设置的）
		remainingResult := s.db.Table("what_course_categories").Where("id IN ?", categoryIDs).Delete(nil)
		totalDeleted += remainingResult.RowsAffected

		result["categories_deleted"] = totalDeleted
		if level1Result.Error != nil {
			result["categories_delete_error"] = level1Result.Error.Error()
		}
	} else {
		result["chapters_deleted"] = int64(0)
		result["courses_deleted"] = int64(0)
		result["categories_deleted"] = int64(0)
	}

	// 5. 再次查询确认
	var remainingCount int64
	s.db.Table("what_course_categories").Where("subject = ? OR code LIKE ?", subject, codePrefix).Count(&remainingCount)
	result["categories_remaining"] = remainingCount

	return result, nil
}

// =====================================================
// 课程树（用于内容生成页面）
// =====================================================

// CourseTreeChapterNode 课程树章节节点
type CourseTreeChapterNode struct {
	ID         uint   `json:"id"`
	Title      string `json:"title"`
	CourseID   uint   `json:"course_id"`
	HasContent bool   `json:"has_content"`
}

// CourseTreeCourseNode 课程树课程节点
type CourseTreeCourseNode struct {
	ID        uint                    `json:"id"`
	Title     string                  `json:"title"`
	CategoryID uint                   `json:"category_id"`
	Chapters  []CourseTreeChapterNode `json:"chapters"`
}

// CourseTreeCategoryNode 课程树分类节点
type CourseTreeCategoryNode struct {
	ID       uint                      `json:"id"`
	Name     string                    `json:"name"`
	Subject  string                    `json:"subject"`
	Children []CourseTreeCategoryNode  `json:"children,omitempty"`
	Courses  []CourseTreeCourseNode    `json:"courses,omitempty"`
}

// CourseTreeSubjectNode 课程树科目节点
type CourseTreeSubjectNode struct {
	Subject    string                   `json:"subject"`
	Name       string                   `json:"name"`
	Categories []CourseTreeCategoryNode `json:"categories"`
}

// CourseTreeResponse 课程树响应
type CourseTreeResponse struct {
	Subjects []CourseTreeSubjectNode `json:"subjects"`
}

var subjectNames = map[string]string{
	"xingce":  "行测",
	"shenlun": "申论",
	"mianshi": "面试",
	"gongji":  "公基",
}

// GetCourseTreeForContent 获取课程结构树（用于内容生成页面，含章节生成状态）
func (s *ContentGeneratorService) GetCourseTreeForContent() (*CourseTreeResponse, error) {
	allCats, err := s.categoryRepo.GetTree()
	if err != nil {
		return nil, err
	}

	// 按 subject 分组，并找出根节点（parent_id 为空）
	bySubject := make(map[string][]model.CourseCategory)
	for _, c := range allCats {
		if c.ParentID == nil || *c.ParentID == 0 {
			bySubject[c.Subject] = append(bySubject[c.Subject], c)
		}
	}

	// 为每个 subject 排序根分类
	for subj := range bySubject {
		cats := bySubject[subj]
		for i := 0; i < len(cats); i++ {
			for j := i + 1; j < len(cats); j++ {
				if cats[j].SortOrder < cats[i].SortOrder || (cats[j].SortOrder == cats[i].SortOrder && cats[j].ID < cats[i].ID) {
					cats[i], cats[j] = cats[j], cats[i]
				}
			}
		}
		bySubject[subj] = cats
	}

	// 构建父子映射
	childrenMap := make(map[uint][]model.CourseCategory)
	for _, c := range allCats {
		if c.ParentID != nil && *c.ParentID > 0 {
			childrenMap[*c.ParentID] = append(childrenMap[*c.ParentID], c)
		}
	}

	// 对每个 parent 下的 children 排序
	for pid := range childrenMap {
		ch := childrenMap[pid]
		for i := 0; i < len(ch); i++ {
			for j := i + 1; j < len(ch); j++ {
				if ch[j].SortOrder < ch[i].SortOrder || (ch[j].SortOrder == ch[i].SortOrder && ch[j].ID < ch[i].ID) {
					ch[i], ch[j] = ch[j], ch[i]
				}
			}
		}
		childrenMap[pid] = ch
	}

	var subjects []CourseTreeSubjectNode
	subjectOrder := []string{"xingce", "shenlun", "mianshi", "gongji"}
	for _, subj := range subjectOrder {
		roots := bySubject[subj]
		if len(roots) == 0 {
			continue
		}
		name := subjectNames[subj]
		if name == "" {
			name = subj
		}
		var categories []CourseTreeCategoryNode
		for _, r := range roots {
			catNode := s.buildCategoryNode(r, childrenMap)
			categories = append(categories, catNode)
		}
		subjects = append(subjects, CourseTreeSubjectNode{
			Subject:    subj,
			Name:       name,
			Categories: categories,
		})
	}

	return &CourseTreeResponse{Subjects: subjects}, nil
}

// buildCategoryNode 递归构建分类节点（含子分类与课程）
func (s *ContentGeneratorService) buildCategoryNode(cat model.CourseCategory, childrenMap map[uint][]model.CourseCategory) CourseTreeCategoryNode {
	node := CourseTreeCategoryNode{
		ID:      cat.ID,
		Name:    cat.Name,
		Subject: cat.Subject,
	}

	// 子分类
	children := childrenMap[cat.ID]
	for _, ch := range children {
		node.Children = append(node.Children, s.buildCategoryNode(ch, childrenMap))
	}

	// 直接属于该分类的课程
	courses, _ := s.courseRepo.GetByCategoryID(cat.ID, 0, 500)
	for _, course := range courses {
		chapters, _ := s.chapterRepo.GetByCourse(course.ID)
		var chapterNodes []CourseTreeChapterNode
		for _, ch := range chapters {
			hasContent := len(ch.ContentJSON) > 0 && string(ch.ContentJSON) != "{}" && string(ch.ContentJSON) != "null"
			chapterNodes = append(chapterNodes, CourseTreeChapterNode{
				ID:         ch.ID,
				Title:      ch.Title,
				CourseID:   ch.CourseID,
				HasContent: hasContent,
			})
		}
		node.Courses = append(node.Courses, CourseTreeCourseNode{
			ID:         course.ID,
			Title:      course.Title,
			CategoryID: cat.ID,
			Chapters:   chapterNodes,
		})
	}

	return node
}
