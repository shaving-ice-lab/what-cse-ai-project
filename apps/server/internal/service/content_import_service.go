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
	ErrInvalidFileFormat = errors.New("无效的文件格式")
	ErrImportFailed      = errors.New("导入失败")
	ErrNoDataToImport    = errors.New("没有可导入的数据")
)

// ContentImportService 内容导入服务
type ContentImportService struct {
	db           *gorm.DB
	questionRepo *repository.QuestionRepository
	courseRepo   *repository.CourseRepository
}

// NewContentImportService 创建内容导入服务
func NewContentImportService(
	db *gorm.DB,
	questionRepo *repository.QuestionRepository,
	courseRepo *repository.CourseRepository,
) *ContentImportService {
	return &ContentImportService{
		db:           db,
		questionRepo: questionRepo,
		courseRepo:   courseRepo,
	}
}

// =====================================================
// 导入请求结构
// =====================================================

// ImportRequest 导入请求
type ImportRequest struct {
	ImportType string        `json:"import_type" binding:"required"` // questions, courses, materials, knowledge_points
	FileFormat string        `json:"file_format" binding:"required"` // excel, json, csv
	Data       string        `json:"data" binding:"required"`        // Base64 encoded data or JSON string
	Options    ImportOptions `json:"options,omitempty"`
}

// ImportOptions 导入选项
type ImportOptions struct {
	SkipDuplicates bool  `json:"skip_duplicates"`
	CategoryID     *uint `json:"category_id,omitempty"`
	AutoPublish    bool  `json:"auto_publish"`
}

// ImportResult 导入结果
type ImportResult struct {
	TotalItems    int      `json:"total_items"`
	SuccessCount  int      `json:"success_count"`
	FailedCount   int      `json:"failed_count"`
	SkippedCount  int      `json:"skipped_count"`
	FailedReasons []string `json:"failed_reasons,omitempty"`
}

// =====================================================
// 题目导入
// =====================================================

// QuestionImportItem 题目导入项
type QuestionImportItem struct {
	CategoryID   uint         `json:"category_id"`
	CategoryName string       `json:"category_name,omitempty"` // 可选，用于按名称匹配分类
	QuestionType string       `json:"question_type"`
	Difficulty   int          `json:"difficulty"`
	SourceType   string       `json:"source_type"`
	SourceYear   int          `json:"source_year,omitempty"`
	SourceRegion string       `json:"source_region,omitempty"`
	SourceExam   string       `json:"source_exam,omitempty"`
	Content      string       `json:"content"`
	Options      []OptionItem `json:"options,omitempty"`
	Answer       string       `json:"answer"`
	Analysis     string       `json:"analysis,omitempty"`
	Tips         string       `json:"tips,omitempty"`
	Tags         []string     `json:"tags,omitempty"`
	IsVIP        bool         `json:"is_vip"`
}

// OptionItem 选项项
type OptionItem struct {
	Key     string `json:"key"`
	Content string `json:"content"`
}

// ImportQuestions 导入题目
func (s *ContentImportService) ImportQuestions(req *ImportRequest, createdBy uint) (*model.ContentGeneratorTask, error) {
	// 解析导入数据
	var items []QuestionImportItem
	if req.FileFormat == "json" {
		if err := json.Unmarshal([]byte(req.Data), &items); err != nil {
			return nil, fmt.Errorf("解析JSON数据失败: %w", err)
		}
	} else {
		// TODO: 实现Excel/CSV解析
		return nil, ErrInvalidFileFormat
	}

	if len(items) == 0 {
		return nil, ErrNoDataToImport
	}

	// 创建任务
	task := &model.ContentGeneratorTask{
		TaskType:   model.TaskTypeBulkImport,
		Status:     model.TaskStatusPending,
		Subject:    "questions",
		TotalItems: len(items),
		CreatedBy:  createdBy,
	}

	if err := s.db.Create(task).Error; err != nil {
		return nil, fmt.Errorf("创建任务失败: %w", err)
	}

	// 异步执行导入
	go func() {
		now := time.Now()
		task.Status = model.TaskStatusProcessing
		task.StartedAt = &now
		s.db.Save(task)

		result := s.processQuestionImport(items, req.Options)

		task.ProcessedItems = result.TotalItems
		task.SuccessItems = result.SuccessCount
		task.FailedItems = result.FailedCount

		if len(result.FailedReasons) > 0 {
			task.ErrorMessage = strings.Join(result.FailedReasons[:min(10, len(result.FailedReasons))], "; ")
		}

		completed := time.Now()
		task.CompletedAt = &completed

		if result.FailedCount > 0 && result.SuccessCount == 0 {
			task.Status = model.TaskStatusFailed
		} else {
			task.Status = model.TaskStatusCompleted
		}

		s.db.Save(task)
	}()

	return task, nil
}

func (s *ContentImportService) processQuestionImport(items []QuestionImportItem, options ImportOptions) ImportResult {
	result := ImportResult{
		TotalItems: len(items),
	}

	for _, item := range items {
		// 验证必填字段
		if item.Content == "" {
			result.FailedCount++
			result.FailedReasons = append(result.FailedReasons, "题目内容不能为空")
			continue
		}

		if item.Answer == "" {
			result.FailedCount++
			result.FailedReasons = append(result.FailedReasons, fmt.Sprintf("题目[%s...]答案不能为空", truncateStr(item.Content, 20)))
			continue
		}

		// 构建题目对象
		status := 0 // 草稿
		if options.AutoPublish {
			status = 1 // 已发布
		}

		// 处理选项
		var optionsJSON []model.QuestionOption
		for _, opt := range item.Options {
			optionsJSON = append(optionsJSON, model.QuestionOption{
				Key:     opt.Key,
				Content: opt.Content,
			})
		}

		categoryID := item.CategoryID
		if options.CategoryID != nil && *options.CategoryID > 0 {
			categoryID = *options.CategoryID
		}

		// Convert SourceYear to pointer
		var sourceYear *int
		if item.SourceYear > 0 {
			sourceYear = &item.SourceYear
		}

		question := &model.Question{
			CategoryID:   categoryID,
			QuestionType: model.QuestionType(item.QuestionType),
			Difficulty:   item.Difficulty,
			SourceType:   model.QuestionSourceType(item.SourceType),
			SourceYear:   sourceYear,
			SourceRegion: item.SourceRegion,
			SourceExam:   item.SourceExam,
			Content:      item.Content,
			Options:      optionsJSON,
			Answer:       item.Answer,
			Analysis:     item.Analysis,
			Tips:         item.Tips,
			Tags:         item.Tags,
			IsVIP:        item.IsVIP,
			Status:       model.QuestionStatus(status),
		}

		if err := s.questionRepo.Create(question); err != nil {
			result.FailedCount++
			result.FailedReasons = append(result.FailedReasons, fmt.Sprintf("导入题目失败: %v", err))
			continue
		}

		result.SuccessCount++
	}

	return result
}

// =====================================================
// 课程导入
// =====================================================

// CourseImportItem 课程导入项
type CourseImportItem struct {
	CategoryID  uint   `json:"category_id"`
	Title       string `json:"title"`
	Subtitle    string `json:"subtitle,omitempty"`
	Description string `json:"description,omitempty"`
	CoverImage  string `json:"cover_image,omitempty"`
	ContentType string `json:"content_type"`
	Difficulty  string `json:"difficulty"`
	Duration    int    `json:"duration"`
	TeacherName string `json:"teacher_name,omitempty"`
	IsFree      bool   `json:"is_free"`
	VIPOnly     bool   `json:"vip_only"`
}

// ImportCourses 导入课程
func (s *ContentImportService) ImportCourses(req *ImportRequest, createdBy uint) (*model.ContentGeneratorTask, error) {
	var items []CourseImportItem
	if req.FileFormat == "json" {
		if err := json.Unmarshal([]byte(req.Data), &items); err != nil {
			return nil, fmt.Errorf("解析JSON数据失败: %w", err)
		}
	} else {
		return nil, ErrInvalidFileFormat
	}

	if len(items) == 0 {
		return nil, ErrNoDataToImport
	}

	task := &model.ContentGeneratorTask{
		TaskType:   model.TaskTypeBulkImport,
		Status:     model.TaskStatusPending,
		Subject:    "courses",
		TotalItems: len(items),
		CreatedBy:  createdBy,
	}

	if err := s.db.Create(task).Error; err != nil {
		return nil, fmt.Errorf("创建任务失败: %w", err)
	}

	go func() {
		now := time.Now()
		task.Status = model.TaskStatusProcessing
		task.StartedAt = &now
		s.db.Save(task)

		result := s.processCourseImport(items, req.Options)

		task.ProcessedItems = result.TotalItems
		task.SuccessItems = result.SuccessCount
		task.FailedItems = result.FailedCount

		if len(result.FailedReasons) > 0 {
			task.ErrorMessage = strings.Join(result.FailedReasons[:min(10, len(result.FailedReasons))], "; ")
		}

		completed := time.Now()
		task.CompletedAt = &completed

		if result.FailedCount > 0 && result.SuccessCount == 0 {
			task.Status = model.TaskStatusFailed
		} else {
			task.Status = model.TaskStatusCompleted
		}

		s.db.Save(task)
	}()

	return task, nil
}

func (s *ContentImportService) processCourseImport(items []CourseImportItem, options ImportOptions) ImportResult {
	result := ImportResult{
		TotalItems: len(items),
	}

	for _, item := range items {
		if item.Title == "" {
			result.FailedCount++
			result.FailedReasons = append(result.FailedReasons, "课程标题不能为空")
			continue
		}

		status := model.CourseStatusDraft
		if options.AutoPublish {
			status = model.CourseStatusPublished
		}

		categoryID := item.CategoryID
		if options.CategoryID != nil && *options.CategoryID > 0 {
			categoryID = *options.CategoryID
		}

		course := &model.Course{
			CategoryID:  categoryID,
			Title:       item.Title,
			Subtitle:    item.Subtitle,
			Description: item.Description,
			CoverImage:  item.CoverImage,
			ContentType: model.CourseContentType(item.ContentType),
			Difficulty:  model.CourseDifficulty(item.Difficulty),
			Duration:    item.Duration,
			TeacherName: item.TeacherName,
			IsFree:      item.IsFree,
			VIPOnly:     item.VIPOnly,
			Status:      status,
		}

		if err := s.courseRepo.Create(course); err != nil {
			result.FailedCount++
			result.FailedReasons = append(result.FailedReasons, fmt.Sprintf("导入课程[%s]失败: %v", item.Title, err))
			continue
		}

		result.SuccessCount++
	}

	return result
}

// =====================================================
// 辅助函数
// =====================================================

func truncateStr(s string, maxLen int) string {
	if len(s) <= maxLen {
		return s
	}
	return s[:maxLen] + "..."
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}
