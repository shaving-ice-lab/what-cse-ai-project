package service

import (
	"context"
	"errors"
	"fmt"
	"sync"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrBatchTaskNotFound = errors.New("批量任务不存在")
	ErrBatchTaskRunning  = errors.New("有任务正在运行中")
	ErrInvalidTargetIDs  = errors.New("目标ID列表无效")
)

// AIBatchGeneratorService AI批量生成服务
type AIBatchGeneratorService struct {
	taskRepo    *repository.AIBatchTaskRepository
	contentRepo *repository.AIContentRepository
	contentGen  *AIContentGeneratorService

	// 任务处理控制
	mu           sync.Mutex
	isProcessing bool
	stopChan     chan struct{}
}

// NewAIBatchGeneratorService 创建AI批量生成服务实例
func NewAIBatchGeneratorService(
	taskRepo *repository.AIBatchTaskRepository,
	contentRepo *repository.AIContentRepository,
	contentGen *AIContentGeneratorService,
) *AIBatchGeneratorService {
	return &AIBatchGeneratorService{
		taskRepo:    taskRepo,
		contentRepo: contentRepo,
		contentGen:  contentGen,
		stopChan:    make(chan struct{}),
	}
}

// =====================================================
// 任务管理
// =====================================================

// CreateBatchTaskRequest 创建批量任务请求
type CreateBatchTaskRequest struct {
	TaskName    string                `json:"task_name" validate:"required"`
	ContentType model.AIContentType   `json:"content_type" validate:"required"`
	RelatedType model.AIRelatedType   `json:"related_type" validate:"required"`
	TargetIDs   []uint                `json:"target_ids" validate:"required,min=1"`
	Priority    int                   `json:"priority,omitempty"`
	Config      model.JSONBatchConfig `json:"config,omitempty"`
	CreatedBy   uint                  `json:"created_by" validate:"required"`
}

// CreateBatchTask 创建批量任务
func (s *AIBatchGeneratorService) CreateBatchTask(req CreateBatchTaskRequest) (*model.AIBatchTask, error) {
	if len(req.TargetIDs) == 0 {
		return nil, ErrInvalidTargetIDs
	}

	// 设置默认配置
	if req.Config.Concurrency == 0 {
		req.Config.Concurrency = 3
	}
	if req.Config.RetryCount == 0 {
		req.Config.RetryCount = 2
	}

	task := &model.AIBatchTask{
		TaskName:       req.TaskName,
		ContentType:    req.ContentType,
		RelatedType:    req.RelatedType,
		TargetIDs:      model.JSONUintArray(req.TargetIDs),
		TotalCount:     len(req.TargetIDs),
		ProcessedCount: 0,
		SuccessCount:   0,
		FailedCount:    0,
		Status:         model.AIBatchTaskStatusPending,
		Priority:       req.Priority,
		Config:         req.Config,
		CreatedBy:      req.CreatedBy,
	}

	if err := s.taskRepo.Create(task); err != nil {
		return nil, fmt.Errorf("创建批量任务失败: %w", err)
	}

	return task, nil
}

// GetBatchTask 获取批量任务
func (s *AIBatchGeneratorService) GetBatchTask(id uint) (*model.AIBatchTask, error) {
	task, err := s.taskRepo.GetByID(id)
	if err != nil {
		return nil, ErrBatchTaskNotFound
	}
	return task, nil
}

// ListBatchTasks 获取批量任务列表
func (s *AIBatchGeneratorService) ListBatchTasks(params repository.AIBatchTaskListParams) ([]model.AIBatchTask, int64, error) {
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}
	return s.taskRepo.List(params)
}

// CancelBatchTask 取消批量任务
func (s *AIBatchGeneratorService) CancelBatchTask(id uint) error {
	return s.taskRepo.CancelTask(id)
}

// GetTaskProgress 获取任务进度
func (s *AIBatchGeneratorService) GetTaskProgress(id uint) (*BatchTaskProgress, error) {
	task, err := s.taskRepo.GetByID(id)
	if err != nil {
		return nil, ErrBatchTaskNotFound
	}

	var progress float64
	if task.TotalCount > 0 {
		progress = float64(task.ProcessedCount) / float64(task.TotalCount) * 100
	}

	return &BatchTaskProgress{
		TaskID:         task.ID,
		TaskName:       task.TaskName,
		Status:         task.Status,
		TotalCount:     task.TotalCount,
		ProcessedCount: task.ProcessedCount,
		SuccessCount:   task.SuccessCount,
		FailedCount:    task.FailedCount,
		Progress:       progress,
		StartedAt:      task.StartedAt,
		CompletedAt:    task.CompletedAt,
	}, nil
}

// BatchTaskProgress 任务进度
type BatchTaskProgress struct {
	TaskID         uint                    `json:"task_id"`
	TaskName       string                  `json:"task_name"`
	Status         model.AIBatchTaskStatus `json:"status"`
	TotalCount     int                     `json:"total_count"`
	ProcessedCount int                     `json:"processed_count"`
	SuccessCount   int                     `json:"success_count"`
	FailedCount    int                     `json:"failed_count"`
	Progress       float64                 `json:"progress"`
	StartedAt      *time.Time              `json:"started_at,omitempty"`
	CompletedAt    *time.Time              `json:"completed_at,omitempty"`
}

// =====================================================
// 任务处理
// =====================================================

// StartProcessing 开始处理任务（后台运行）
func (s *AIBatchGeneratorService) StartProcessing() error {
	s.mu.Lock()
	if s.isProcessing {
		s.mu.Unlock()
		return ErrBatchTaskRunning
	}
	s.isProcessing = true
	s.stopChan = make(chan struct{})
	s.mu.Unlock()

	go s.processLoop()
	return nil
}

// StopProcessing 停止处理任务
func (s *AIBatchGeneratorService) StopProcessing() {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.isProcessing {
		close(s.stopChan)
		s.isProcessing = false
	}
}

// processLoop 处理循环
func (s *AIBatchGeneratorService) processLoop() {
	ticker := time.NewTicker(5 * time.Second)
	defer ticker.Stop()

	for {
		select {
		case <-s.stopChan:
			return
		case <-ticker.C:
			s.processNextTask()
		}
	}
}

// processNextTask 处理下一个任务
func (s *AIBatchGeneratorService) processNextTask() {
	// 检查是否有正在处理的任务
	processing, _ := s.taskRepo.GetProcessingTask()
	if processing != nil {
		// 继续处理当前任务
		s.processTask(processing)
		return
	}

	// 获取下一个待处理任务
	tasks, err := s.taskRepo.GetPendingTasks(1)
	if err != nil || len(tasks) == 0 {
		return
	}

	task := &tasks[0]
	// 更新状态为处理中
	if err := s.taskRepo.UpdateStatus(task.ID, model.AIBatchTaskStatusProcessing); err != nil {
		return
	}

	s.processTask(task)
}

// processTask 处理单个任务
func (s *AIBatchGeneratorService) processTask(task *model.AIBatchTask) {
	ctx := context.Background()
	targetIDs := []uint(task.TargetIDs)

	// 从已处理的位置继续
	startIndex := task.ProcessedCount
	if startIndex >= len(targetIDs) {
		// 任务已完成
		s.taskRepo.UpdateStatus(task.ID, model.AIBatchTaskStatusCompleted)
		return
	}

	// 处理配置
	config := task.Config
	batchSize := config.Concurrency
	if batchSize <= 0 {
		batchSize = 3
	}

	// 处理一批
	endIndex := startIndex + batchSize
	if endIndex > len(targetIDs) {
		endIndex = len(targetIDs)
	}

	var wg sync.WaitGroup
	var mu sync.Mutex
	successCount := 0
	failedCount := 0

	for i := startIndex; i < endIndex; i++ {
		wg.Add(1)
		go func(targetID uint) {
			defer wg.Done()

			// 检查是否跳过已存在的
			if config.SkipExisting {
				exists, _ := s.contentRepo.Exists(task.RelatedType, targetID, task.ContentType)
				if exists {
					mu.Lock()
					successCount++
					mu.Unlock()
					return
				}
			}

			// 生成内容
			err := s.generateContent(ctx, task.ContentType, task.RelatedType, targetID, config)
			mu.Lock()
			if err != nil {
				failedCount++
				s.taskRepo.AppendErrorLog(task.ID, fmt.Sprintf("ID %d: %v", targetID, err))
			} else {
				successCount++
			}
			mu.Unlock()
		}(targetIDs[i])
	}

	wg.Wait()

	// 更新进度
	s.taskRepo.UpdateProgress(
		task.ID,
		endIndex,
		task.SuccessCount+successCount,
		task.FailedCount+failedCount,
	)

	// 检查是否完成
	if endIndex >= len(targetIDs) {
		s.taskRepo.UpdateStatus(task.ID, model.AIBatchTaskStatusCompleted)
	}
}

// generateContent 生成单个内容
func (s *AIBatchGeneratorService) generateContent(ctx context.Context, contentType model.AIContentType, relatedType model.AIRelatedType, targetID uint, config model.JSONBatchConfig) error {
	var err error
	retryCount := config.RetryCount
	if retryCount <= 0 {
		retryCount = 1
	}

	for i := 0; i < retryCount; i++ {
		switch relatedType {
		case model.AIRelatedTypeQuestion:
			_, err = s.generateQuestionContent(ctx, contentType, targetID, config)
		case model.AIRelatedTypeKnowledgePoint:
			_, err = s.generateKnowledgeContent(ctx, contentType, targetID, config)
		case model.AIRelatedTypeCourse:
			_, err = s.generateCourseContent(ctx, contentType, targetID, config)
		case model.AIRelatedTypeChapter:
			_, err = s.generateChapterContent(ctx, contentType, targetID, config)
		default:
			err = ErrInvalidContentType
		}

		if err == nil {
			return nil
		}

		// 等待后重试
		time.Sleep(time.Duration(i+1) * time.Second)
	}

	return err
}

// generateQuestionContent 生成题目相关内容
func (s *AIBatchGeneratorService) generateQuestionContent(ctx context.Context, contentType model.AIContentType, questionID uint, config model.JSONBatchConfig) (*model.AIGeneratedContent, error) {
	req := GenerateQuestionAnalysisRequest{
		QuestionID: questionID,
		ModelName:  config.ModelName,
		Force:      !config.SkipExisting,
	}

	switch contentType {
	case model.AIContentTypeQuestionAnalysis:
		return s.contentGen.GenerateQuestionAnalysis(ctx, req)
	case model.AIContentTypeQuestionTips:
		return s.contentGen.GenerateQuestionTips(ctx, req)
	default:
		return nil, ErrInvalidContentType
	}
}

// generateKnowledgeContent 生成知识点相关内容
func (s *AIBatchGeneratorService) generateKnowledgeContent(ctx context.Context, contentType model.AIContentType, knowledgePointID uint, config model.JSONBatchConfig) (*model.AIGeneratedContent, error) {
	req := GenerateKnowledgeContentRequest{
		KnowledgePointID: knowledgePointID,
		ModelName:        config.ModelName,
		Force:            !config.SkipExisting,
	}

	switch contentType {
	case model.AIContentTypeKnowledgeSummary:
		return s.contentGen.GenerateKnowledgeSummary(ctx, req)
	case model.AIContentTypeKnowledgeMindmap:
		return s.contentGen.GenerateKnowledgeMindmap(ctx, req)
	default:
		return nil, ErrInvalidContentType
	}
}

// generateCourseContent 生成课程相关内容
func (s *AIBatchGeneratorService) generateCourseContent(ctx context.Context, contentType model.AIContentType, courseID uint, config model.JSONBatchConfig) (*model.AIGeneratedContent, error) {
	req := GenerateCourseContentRequest{
		CourseID:  courseID,
		ModelName: config.ModelName,
		Force:     !config.SkipExisting,
	}

	switch contentType {
	case model.AIContentTypeCoursePreview:
		return s.contentGen.GenerateCoursePreview(ctx, req)
	case model.AIContentTypeCourseReview:
		return s.contentGen.GenerateCourseReview(ctx, req)
	default:
		return nil, ErrInvalidContentType
	}
}

// generateChapterContent 生成章节相关内容
func (s *AIBatchGeneratorService) generateChapterContent(ctx context.Context, contentType model.AIContentType, chapterID uint, config model.JSONBatchConfig) (*model.AIGeneratedContent, error) {
	req := GenerateChapterContentRequest{
		ChapterID: chapterID,
		ModelName: config.ModelName,
		Force:     !config.SkipExisting,
	}

	switch contentType {
	case model.AIContentTypeChapterSummary:
		return s.contentGen.GenerateChapterSummary(ctx, req)
	case model.AIContentTypeChapterKeypoints:
		return s.contentGen.GenerateChapterKeypoints(ctx, req)
	case model.AIContentTypeChapterExercises:
		return s.contentGen.GenerateChapterExercises(ctx, req)
	case model.AIContentTypeChapterLesson:
		// 获取额外配置
		subject := ""
		if config.Extra != nil {
			if s, ok := config.Extra["subject"]; ok {
				subject = s
			}
		}
		lessonReq := GenerateChapterLessonRequest{
			ChapterID:   chapterID,
			Subject:     subject,
			ModelName:   config.ModelName,
			Force:       !config.SkipExisting,
			AutoApprove: config.AutoApprove,
		}
		return s.contentGen.GenerateChapterLesson(ctx, lessonReq)
	default:
		return nil, ErrInvalidContentType
	}
}

// =====================================================
// 便捷方法
// =====================================================

// CreateQuestionAnalysisBatchTask 创建题目解析批量任务
func (s *AIBatchGeneratorService) CreateQuestionAnalysisBatchTask(name string, questionIDs []uint, createdBy uint) (*model.AIBatchTask, error) {
	return s.CreateBatchTask(CreateBatchTaskRequest{
		TaskName:    name,
		ContentType: model.AIContentTypeQuestionAnalysis,
		RelatedType: model.AIRelatedTypeQuestion,
		TargetIDs:   questionIDs,
		CreatedBy:   createdBy,
		Config: model.JSONBatchConfig{
			Concurrency:  3,
			RetryCount:   2,
			SkipExisting: true,
		},
	})
}

// CreateKnowledgeSummaryBatchTask 创建知识点总结批量任务
func (s *AIBatchGeneratorService) CreateKnowledgeSummaryBatchTask(name string, knowledgePointIDs []uint, createdBy uint) (*model.AIBatchTask, error) {
	return s.CreateBatchTask(CreateBatchTaskRequest{
		TaskName:    name,
		ContentType: model.AIContentTypeKnowledgeSummary,
		RelatedType: model.AIRelatedTypeKnowledgePoint,
		TargetIDs:   knowledgePointIDs,
		CreatedBy:   createdBy,
		Config: model.JSONBatchConfig{
			Concurrency:  3,
			RetryCount:   2,
			SkipExisting: true,
		},
	})
}

// CreateChapterLessonBatchTask 创建章节教学内容批量任务
func (s *AIBatchGeneratorService) CreateChapterLessonBatchTask(name string, chapterIDs []uint, subject string, createdBy uint, autoApprove bool) (*model.AIBatchTask, error) {
	return s.CreateBatchTask(CreateBatchTaskRequest{
		TaskName:    name,
		ContentType: model.AIContentTypeChapterLesson,
		RelatedType: model.AIRelatedTypeChapter,
		TargetIDs:   chapterIDs,
		CreatedBy:   createdBy,
		Config: model.JSONBatchConfig{
			Concurrency:  2, // 教学内容生成比较耗时，降低并发
			RetryCount:   3,
			SkipExisting: true,
			AutoApprove:  autoApprove,
			Extra: map[string]string{
				"subject": subject,
			},
		},
	})
}

// GenerateCourseLessonsRequest 为课程生成所有章节教学内容的请求
type GenerateCourseLessonsRequest struct {
	CourseID    uint   `json:"course_id" validate:"required"`
	Subject     string `json:"subject,omitempty"`     // 科目
	AutoApprove bool   `json:"auto_approve,omitempty"` // 是否自动审核通过
	CreatedBy   uint   `json:"created_by" validate:"required"`
}

// GenerateCourseLessons 为课程生成所有章节教学内容
func (s *AIBatchGeneratorService) GenerateCourseLessons(req GenerateCourseLessonsRequest) (*model.AIBatchTask, error) {
	// 获取课程的所有章节
	chapters, err := s.contentGen.courseRepo.GetChaptersByCourseID(req.CourseID)
	if err != nil {
		return nil, fmt.Errorf("获取课程章节失败: %w", err)
	}

	if len(chapters) == 0 {
		return nil, fmt.Errorf("课程没有章节")
	}

	// 收集章节ID
	chapterIDs := make([]uint, 0, len(chapters))
	for _, chapter := range chapters {
		chapterIDs = append(chapterIDs, chapter.ID)
	}

	// 获取课程信息
	course, _ := s.contentGen.courseRepo.GetByID(req.CourseID)
	taskName := fmt.Sprintf("课程教学内容生成 - 课程#%d", req.CourseID)
	if course != nil {
		taskName = fmt.Sprintf("课程教学内容生成 - %s", course.Title)
	}

	return s.CreateChapterLessonBatchTask(taskName, chapterIDs, req.Subject, req.CreatedBy, req.AutoApprove)
}

// GenerateCategoryLessonsRequest 为分类下所有课程生成教学内容的请求
type GenerateCategoryLessonsRequest struct {
	CategoryID  uint   `json:"category_id" validate:"required"`
	Subject     string `json:"subject,omitempty"`
	AutoApprove bool   `json:"auto_approve,omitempty"`
	CreatedBy   uint   `json:"created_by" validate:"required"`
}

// GenerateCategoryLessons 为分类下所有课程生成教学内容
func (s *AIBatchGeneratorService) GenerateCategoryLessons(req GenerateCategoryLessonsRequest) ([]*model.AIBatchTask, error) {
	// 获取分类下的所有课程
	courses, _, err := s.contentGen.courseRepo.GetByCategory(req.CategoryID, 1, 1000)
	if err != nil {
		return nil, fmt.Errorf("获取分类课程失败: %w", err)
	}

	if len(courses) == 0 {
		return nil, fmt.Errorf("分类下没有课程")
	}

	tasks := make([]*model.AIBatchTask, 0, len(courses))
	for _, course := range courses {
		task, err := s.GenerateCourseLessons(GenerateCourseLessonsRequest{
			CourseID:    course.ID,
			Subject:     req.Subject,
			AutoApprove: req.AutoApprove,
			CreatedBy:   req.CreatedBy,
		})
		if err != nil {
			continue // 跳过失败的课程
		}
		tasks = append(tasks, task)
	}

	return tasks, nil
}

// =====================================================
// 质量控制
// =====================================================

// ContentQualityConfig 内容质量配置
type ContentQualityConfig struct {
	MinContentLength      int     `json:"min_content_length"`      // 最小内容长度
	MaxContentLength      int     `json:"max_content_length"`      // 最大内容长度
	MinKeyPointsCount     int     `json:"min_key_points_count"`    // 最少要点数量
	EnableSensitiveFilter bool    `json:"enable_sensitive_filter"` // 是否启用敏感词过滤
	AutoApproveThreshold  float64 `json:"auto_approve_threshold"`  // 自动通过的质量分阈值
}

// DefaultQualityConfig 默认质量配置
var DefaultQualityConfig = ContentQualityConfig{
	MinContentLength:      50,
	MaxContentLength:      50000,
	MinKeyPointsCount:     2,
	EnableSensitiveFilter: true,
	AutoApproveThreshold:  3.5, // 满分5分，3.5分以上自动通过
}

// 敏感词列表（实际应用中应从配置或数据库加载）
var sensitiveWords = []string{
	"赌博", "色情", "暴力", "毒品", "枪支",
	"反动", "邪教", "传销", "诈骗", "非法",
}

// ContentQualityResult 内容质量检查结果
type ContentQualityResult struct {
	IsValid      bool     `json:"is_valid"`      // 是否有效
	QualityScore float64  `json:"quality_score"` // 质量评分 (0-5)
	Issues       []string `json:"issues"`        // 问题列表
	Suggestions  []string `json:"suggestions"`   // 改进建议
	AutoApproved bool     `json:"auto_approved"` // 是否自动通过审核
}

// CheckContentQuality 检查内容质量
func (s *AIBatchGeneratorService) CheckContentQuality(content *model.AIGeneratedContent, config *ContentQualityConfig) *ContentQualityResult {
	if config == nil {
		config = &DefaultQualityConfig
	}

	result := &ContentQualityResult{
		IsValid:      true,
		QualityScore: 5.0, // 初始满分
		Issues:       []string{},
		Suggestions:  []string{},
	}

	// 1. 内容长度检查
	s.checkContentLength(content, config, result)

	// 2. 内容完整性检查
	s.checkContentCompleteness(content, config, result)

	// 3. 敏感词过滤
	if config.EnableSensitiveFilter {
		s.checkSensitiveWords(content, result)
	}

	// 4. 计算最终质量分
	s.calculateQualityScore(content, result)

	// 5. 判断是否自动通过
	result.AutoApproved = result.IsValid && result.QualityScore >= config.AutoApproveThreshold

	return result
}

// checkContentLength 检查内容长度
func (s *AIBatchGeneratorService) checkContentLength(content *model.AIGeneratedContent, config *ContentQualityConfig, result *ContentQualityResult) {
	// 检查主要内容长度
	contentLen := len(content.Content.Summary) + len(content.Content.Analysis) + len(content.Content.Details)

	if contentLen < config.MinContentLength {
		result.Issues = append(result.Issues, fmt.Sprintf("内容长度不足：当前 %d 字符，要求至少 %d 字符", contentLen, config.MinContentLength))
		result.Suggestions = append(result.Suggestions, "建议补充更多详细内容")
		result.QualityScore -= 1.0
	}

	if contentLen > config.MaxContentLength {
		result.Issues = append(result.Issues, fmt.Sprintf("内容长度过长：当前 %d 字符，建议不超过 %d 字符", contentLen, config.MaxContentLength))
		result.Suggestions = append(result.Suggestions, "建议精简内容，突出重点")
		result.QualityScore -= 0.5
	}
}

// checkContentCompleteness 检查内容完整性
func (s *AIBatchGeneratorService) checkContentCompleteness(content *model.AIGeneratedContent, config *ContentQualityConfig, result *ContentQualityResult) {
	// 检查要点数量
	keyPointsCount := len(content.Content.KeyPoints) + len(content.Content.MainPoints)
	if keyPointsCount < config.MinKeyPointsCount {
		result.Issues = append(result.Issues, fmt.Sprintf("要点数量不足：当前 %d 个，要求至少 %d 个", keyPointsCount, config.MinKeyPointsCount))
		result.Suggestions = append(result.Suggestions, "建议添加更多知识要点")
		result.QualityScore -= 0.5
	}

	// 根据内容类型检查特定字段
	switch content.ContentType {
	case model.AIContentTypeQuestionAnalysis:
		if content.Content.Analysis == "" {
			result.Issues = append(result.Issues, "缺少题目解析内容")
			result.QualityScore -= 1.5
			result.IsValid = false
		}
		if len(content.Content.SolutionSteps) == 0 {
			result.Suggestions = append(result.Suggestions, "建议添加解题步骤")
			result.QualityScore -= 0.3
		}

	case model.AIContentTypeKnowledgeSummary:
		if content.Content.Summary == "" && content.Content.Definition == "" {
			result.Issues = append(result.Issues, "缺少知识点摘要或定义")
			result.QualityScore -= 1.5
			result.IsValid = false
		}

	case model.AIContentTypeChapterSummary:
		if content.Content.Summary == "" {
			result.Issues = append(result.Issues, "缺少章节总结")
			result.QualityScore -= 1.5
			result.IsValid = false
		}
	}
}

// checkSensitiveWords 检查敏感词
func (s *AIBatchGeneratorService) checkSensitiveWords(content *model.AIGeneratedContent, result *ContentQualityResult) {
	// 汇总所有文本内容
	allText := content.Title + content.Content.Summary + content.Content.Analysis +
		content.Content.Details + content.Content.Definition

	// 检查敏感词
	for _, word := range sensitiveWords {
		if containsWord(allText, word) {
			result.Issues = append(result.Issues, fmt.Sprintf("包含敏感词：%s", word))
			result.QualityScore -= 2.0
			result.IsValid = false
		}
	}
}

// containsWord 检查文本是否包含指定词语
func containsWord(text, word string) bool {
	return len(text) > 0 && len(word) > 0 &&
		(len(text) >= len(word)) &&
		(findSubstring(text, word) >= 0)
}

// findSubstring 查找子字符串
func findSubstring(s, substr string) int {
	for i := 0; i <= len(s)-len(substr); i++ {
		if s[i:i+len(substr)] == substr {
			return i
		}
	}
	return -1
}

// calculateQualityScore 计算质量评分
func (s *AIBatchGeneratorService) calculateQualityScore(content *model.AIGeneratedContent, result *ContentQualityResult) {
	// 确保分数在 0-5 范围内
	if result.QualityScore < 0 {
		result.QualityScore = 0
	}
	if result.QualityScore > 5 {
		result.QualityScore = 5
	}

	// 根据问题数量额外扣分
	if len(result.Issues) > 3 {
		result.QualityScore -= 0.5
		if result.QualityScore < 0 {
			result.QualityScore = 0
		}
	}
}

// AutoScoreContent 自动评分内容（基于规则）
func (s *AIBatchGeneratorService) AutoScoreContent(content *model.AIGeneratedContent) float64 {
	score := 5.0 // 初始满分

	// 1. 内容长度评分
	contentLen := len(content.Content.Summary) + len(content.Content.Analysis)
	if contentLen < 100 {
		score -= 1.5
	} else if contentLen < 300 {
		score -= 0.5
	} else if contentLen > 10000 {
		score -= 0.3
	}

	// 2. 要点数量评分
	keyPointsCount := len(content.Content.KeyPoints)
	if keyPointsCount == 0 {
		score -= 1.0
	} else if keyPointsCount < 3 {
		score -= 0.5
	} else if keyPointsCount >= 5 {
		score += 0.2 // 奖励分
	}

	// 3. 解题步骤评分（仅针对题目解析）
	if content.ContentType == model.AIContentTypeQuestionAnalysis {
		if len(content.Content.SolutionSteps) >= 3 {
			score += 0.3
		} else if len(content.Content.SolutionSteps) == 0 {
			score -= 0.5
		}

		// 选项分析完整性
		if len(content.Content.OptionAnalysis) >= 4 {
			score += 0.2
		}
	}

	// 4. 技巧/建议数量评分
	if len(content.Content.Tips) >= 2 {
		score += 0.2
	}

	// 确保分数在合理范围
	if score < 0 {
		score = 0
	}
	if score > 5 {
		score = 5
	}

	return score
}

// BatchCheckQuality 批量质量检查
func (s *AIBatchGeneratorService) BatchCheckQuality(contentIDs []uint, config *ContentQualityConfig) ([]ContentQualityResult, error) {
	results := make([]ContentQualityResult, 0, len(contentIDs))

	for _, id := range contentIDs {
		content, err := s.contentRepo.GetByID(id)
		if err != nil {
			results = append(results, ContentQualityResult{
				IsValid: false,
				Issues:  []string{fmt.Sprintf("获取内容失败: %v", err)},
			})
			continue
		}

		result := s.CheckContentQuality(content, config)
		results = append(results, *result)

		// 更新内容的质量评分
		s.contentRepo.UpdateQualityScore(id, result.QualityScore)

		// 如果自动通过，更新状态
		if result.AutoApproved {
			s.contentRepo.UpdateStatus(id, model.AIContentStatusApproved, nil)
		}
	}

	return results, nil
}

// GetQualityStatistics 获取质量统计
func (s *AIBatchGeneratorService) GetQualityStatistics() (*QualityStatistics, error) {
	// 获取各状态的内容数量
	totalCount, _ := s.contentRepo.CountByStatus("")
	pendingCount, _ := s.contentRepo.CountByStatus(string(model.AIContentStatusPending))
	approvedCount, _ := s.contentRepo.CountByStatus(string(model.AIContentStatusApproved))
	rejectedCount, _ := s.contentRepo.CountByStatus(string(model.AIContentStatusRejected))

	// 获取平均质量分
	avgScore, _ := s.contentRepo.GetAverageQualityScore()

	return &QualityStatistics{
		TotalCount:    int(totalCount),
		PendingCount:  int(pendingCount),
		ApprovedCount: int(approvedCount),
		RejectedCount: int(rejectedCount),
		AverageScore:  avgScore,
	}, nil
}

// QualityStatistics 质量统计
type QualityStatistics struct {
	TotalCount    int     `json:"total_count"`
	PendingCount  int     `json:"pending_count"`
	ApprovedCount int     `json:"approved_count"`
	RejectedCount int     `json:"rejected_count"`
	AverageScore  float64 `json:"average_score"`
}
