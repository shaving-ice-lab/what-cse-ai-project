package service

import (
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"gorm.io/gorm"
)

var (
	ErrWrongQuestionNotFound = errors.New("错题记录不存在")
	ErrNoteNotFound          = errors.New("笔记不存在")
	ErrNoteNotOwner          = errors.New("无权操作此笔记")
	ErrNoteAlreadyLiked      = errors.New("已点赞此笔记")
	ErrNoteNotLiked          = errors.New("未点赞此笔记")
	ErrInvalidNoteType       = errors.New("无效的笔记类型")
)

// WrongQuestionExportRequest 错题导出请求
type WrongQuestionExportRequest struct {
	Format       string `json:"format"`                // 导出格式: json, csv, markdown, html
	CategoryID   uint   `json:"category_id,omitempty"` // 筛选分类
	Status       string `json:"status,omitempty"`      // 筛选状态
	IncludeNote  bool   `json:"include_note"`          // 是否包含笔记
	IncludeStats bool   `json:"include_stats"`         // 是否包含统计
	StartDate    string `json:"start_date,omitempty"`  // 开始日期
	EndDate      string `json:"end_date,omitempty"`    // 结束日期
	IDs          []uint `json:"ids,omitempty"`         // 指定错题ID列表
}

// =====================================================
// Study Note Service
// =====================================================

type StudyNoteService struct {
	wrongQuestionRepo *repository.WrongQuestionRepository
	noteRepo          *repository.StudyNoteRepository
	noteLikeRepo      *repository.NoteLikeRepository
	questionRepo      *repository.QuestionRepository
}

func NewStudyNoteService(
	wrongQuestionRepo *repository.WrongQuestionRepository,
	noteRepo *repository.StudyNoteRepository,
	noteLikeRepo *repository.NoteLikeRepository,
	questionRepo *repository.QuestionRepository,
) *StudyNoteService {
	return &StudyNoteService{
		wrongQuestionRepo: wrongQuestionRepo,
		noteRepo:          noteRepo,
		noteLikeRepo:      noteLikeRepo,
		questionRepo:      questionRepo,
	}
}

// =====================================================
// Wrong Question Operations
// =====================================================

// AddWrongQuestion adds a question to wrong question book
func (s *StudyNoteService) AddWrongQuestion(userID, questionID uint) (*model.WrongQuestion, error) {
	// Check if already exists
	existing, err := s.wrongQuestionRepo.GetByUserAndQuestion(userID, questionID)
	if err == nil && existing != nil {
		// Increment wrong count
		if err := s.wrongQuestionRepo.IncrementWrongCount(existing.ID); err != nil {
			return nil, err
		}
		// Reload and return
		return s.wrongQuestionRepo.GetByID(existing.ID)
	}

	// Get question to get category_id
	question, err := s.questionRepo.GetByID(questionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrQuestionNotFound
		}
		return nil, err
	}

	// Create new wrong question record
	now := time.Now()
	wrong := &model.WrongQuestion{
		UserID:       userID,
		QuestionID:   questionID,
		CategoryID:   question.CategoryID,
		FirstWrongAt: now,
		LastWrongAt:  now,
		WrongCount:   1,
		Status:       model.WrongQuestionStatusActive,
	}

	// Set initial next review time (1 day later)
	nextReview := now.Add(24 * time.Hour)
	wrong.NextReviewAt = &nextReview

	if err := s.wrongQuestionRepo.Create(wrong); err != nil {
		return nil, err
	}

	// Reload with relations
	return s.wrongQuestionRepo.GetByID(wrong.ID)
}

// GetWrongQuestions gets user's wrong questions
func (s *StudyNoteService) GetWrongQuestions(userID uint, params *repository.WrongQuestionQueryParams) ([]model.WrongQuestionResponse, int64, error) {
	wrongs, total, err := s.wrongQuestionRepo.GetUserWrongQuestions(userID, params)
	if err != nil {
		return nil, 0, err
	}

	var responses []model.WrongQuestionResponse
	for _, w := range wrongs {
		responses = append(responses, *w.ToResponse())
	}

	return responses, total, nil
}

// GetWrongQuestionByID gets a wrong question by ID
func (s *StudyNoteService) GetWrongQuestionByID(id, userID uint) (*model.WrongQuestionResponse, error) {
	wrong, err := s.wrongQuestionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrWrongQuestionNotFound
		}
		return nil, err
	}

	// Verify ownership
	if wrong.UserID != userID {
		return nil, ErrWrongQuestionNotFound
	}

	return wrong.ToResponse(), nil
}

// GetWrongQuestionStats gets user's wrong question statistics
func (s *StudyNoteService) GetWrongQuestionStats(userID uint) (*model.WrongQuestionStats, error) {
	return s.wrongQuestionRepo.GetUserWrongQuestionStats(userID)
}

// UpdateWrongQuestionNote updates wrong question note
func (s *StudyNoteService) UpdateWrongQuestionNote(id, userID uint, note string) error {
	wrong, err := s.wrongQuestionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrWrongQuestionNotFound
		}
		return err
	}

	if wrong.UserID != userID {
		return ErrWrongQuestionNotFound
	}

	return s.wrongQuestionRepo.UpdateNote(id, note)
}

// UpdateWrongQuestionErrorReason updates wrong question error reason
func (s *StudyNoteService) UpdateWrongQuestionErrorReason(id, userID uint, reason string) error {
	wrong, err := s.wrongQuestionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrWrongQuestionNotFound
		}
		return err
	}

	if wrong.UserID != userID {
		return ErrWrongQuestionNotFound
	}

	return s.wrongQuestionRepo.UpdateErrorReason(id, reason)
}

// MarkAsMastered marks a wrong question as mastered
func (s *StudyNoteService) MarkAsMastered(id, userID uint) error {
	wrong, err := s.wrongQuestionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrWrongQuestionNotFound
		}
		return err
	}

	if wrong.UserID != userID {
		return ErrWrongQuestionNotFound
	}

	return s.wrongQuestionRepo.UpdateStatus(id, model.WrongQuestionStatusMastered)
}

// RemoveWrongQuestion removes a wrong question (soft delete)
func (s *StudyNoteService) RemoveWrongQuestion(id, userID uint) error {
	wrong, err := s.wrongQuestionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrWrongQuestionNotFound
		}
		return err
	}

	if wrong.UserID != userID {
		return ErrWrongQuestionNotFound
	}

	return s.wrongQuestionRepo.UpdateStatus(id, model.WrongQuestionStatusRemoved)
}

// RestoreWrongQuestion restores a removed wrong question
func (s *StudyNoteService) RestoreWrongQuestion(id, userID uint) error {
	wrong, err := s.wrongQuestionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrWrongQuestionNotFound
		}
		return err
	}

	if wrong.UserID != userID {
		return ErrWrongQuestionNotFound
	}

	return s.wrongQuestionRepo.UpdateStatus(id, model.WrongQuestionStatusActive)
}

// RecordReview records a review of a wrong question
func (s *StudyNoteService) RecordReview(id, userID uint, isCorrect bool) error {
	wrong, err := s.wrongQuestionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrWrongQuestionNotFound
		}
		return err
	}

	if wrong.UserID != userID {
		return ErrWrongQuestionNotFound
	}

	if isCorrect {
		// Increment correct count
		if err := s.wrongQuestionRepo.IncrementCorrectCount(id); err != nil {
			return err
		}

		// If correct 3+ times, suggest marking as mastered
		wrong.CorrectCount++
		if wrong.CorrectCount >= 3 {
			// Auto mark as mastered if user has gotten it right 3+ times
			return s.wrongQuestionRepo.UpdateStatus(id, model.WrongQuestionStatusMastered)
		}
	}

	// Calculate next review time using spaced repetition
	nextReview := s.calculateNextReviewTime(wrong.ReviewCount, isCorrect)
	return s.wrongQuestionRepo.UpdateReview(id, nextReview)
}

// calculateNextReviewTime calculates next review time using simple spaced repetition
func (s *StudyNoteService) calculateNextReviewTime(reviewCount int, isCorrect bool) *time.Time {
	now := time.Now()
	var interval time.Duration

	if !isCorrect {
		// If wrong, review again in 1 day
		interval = 24 * time.Hour
	} else {
		// Spaced repetition intervals: 1d, 3d, 7d, 14d, 30d
		intervals := []int{1, 3, 7, 14, 30}
		idx := reviewCount
		if idx >= len(intervals) {
			idx = len(intervals) - 1
		}
		interval = time.Duration(intervals[idx]) * 24 * time.Hour
	}

	nextReview := now.Add(interval)
	return &nextReview
}

// GetNeedReviewQuestions gets questions that need review
func (s *StudyNoteService) GetNeedReviewQuestions(userID uint, limit int) ([]model.WrongQuestionResponse, error) {
	if limit <= 0 {
		limit = 20
	}
	wrongs, err := s.wrongQuestionRepo.GetNeedReviewQuestions(userID, limit)
	if err != nil {
		return nil, err
	}

	var responses []model.WrongQuestionResponse
	for _, w := range wrongs {
		responses = append(responses, *w.ToResponse())
	}

	return responses, nil
}

// ExportWrongQuestions exports wrong questions for a user
func (s *StudyNoteService) ExportWrongQuestions(userID uint, req *WrongQuestionExportRequest) (*model.WrongQuestionExportData, error) {
	// Build query params
	params := &repository.WrongQuestionQueryParams{
		CategoryID: req.CategoryID,
		Status:     req.Status,
		StartDate:  req.StartDate,
		EndDate:    req.EndDate,
		Page:       1,
		PageSize:   1000, // Export up to 1000 items
	}

	// If specific IDs are provided, we need to handle differently
	var wrongs []model.WrongQuestion
	var err error

	if len(req.IDs) > 0 {
		// Get specific wrong questions by IDs
		wrongs, err = s.wrongQuestionRepo.GetByIDs(userID, req.IDs)
	} else {
		// Get all matching wrong questions
		wrongs, _, err = s.wrongQuestionRepo.GetUserWrongQuestions(userID, params)
	}

	if err != nil {
		return nil, err
	}

	// Build export items
	items := make([]model.WrongQuestionExportItem, 0, len(wrongs))
	for _, w := range wrongs {
		item := model.WrongQuestionExportItem{
			QuestionID:   w.QuestionID,
			WrongCount:   w.WrongCount,
			CorrectCount: w.CorrectCount,
			FirstWrongAt: w.FirstWrongAt.Format("2006-01-02 15:04:05"),
			LastWrongAt:  w.LastWrongAt.Format("2006-01-02 15:04:05"),
		}

		// Include note if requested
		if req.IncludeNote {
			item.UserNote = w.UserNote
			item.ErrorReason = w.ErrorReason
		}

		// Add question details
		if w.Question != nil {
			item.Content = w.Question.Content
			item.Answer = w.Question.Answer
			item.Analysis = w.Question.Analysis
			item.Difficulty = w.Question.Difficulty
			item.QuestionType = string(w.Question.QuestionType)

			// Format options
			if len(w.Question.Options) > 0 {
				var optStr string
				for i, opt := range w.Question.Options {
					if i > 0 {
						optStr += "\n"
					}
					optStr += opt.Key + ". " + opt.Content
				}
				item.Options = optStr
			}

			// Get category name
			if w.Question.Category != nil {
				item.CategoryName = w.Question.Category.Name
			}
		}

		items = append(items, item)
	}

	// Build export data
	exportData := &model.WrongQuestionExportData{
		ExportTime: time.Now().Format("2006-01-02 15:04:05"),
		TotalCount: len(items),
		Items:      items,
	}

	// Include stats if requested
	if req.IncludeStats {
		stats, err := s.wrongQuestionRepo.GetUserWrongQuestionStats(userID)
		if err == nil {
			exportData.UserStats = stats
		}
	}

	return exportData, nil
}

// FormatExportAsCSV formats export data as CSV string
func (s *StudyNoteService) FormatExportAsCSV(data *model.WrongQuestionExportData) string {
	var result string

	// Header
	result = "题目ID,分类,题目内容,选项,答案,解析,难度,题型,错误次数,正确次数,笔记,错误原因,首次做错时间,最近做错时间\n"

	// Data rows
	for _, item := range data.Items {
		// Escape CSV fields
		content := escapeCSV(item.Content)
		options := escapeCSV(item.Options)
		answer := escapeCSV(item.Answer)
		analysis := escapeCSV(item.Analysis)
		note := escapeCSV(item.UserNote)
		reason := escapeCSV(item.ErrorReason)
		category := escapeCSV(item.CategoryName)

		result += fmt.Sprintf("%d,%s,%s,%s,%s,%s,%d,%s,%d,%d,%s,%s,%s,%s\n",
			item.QuestionID,
			category,
			content,
			options,
			answer,
			analysis,
			item.Difficulty,
			item.QuestionType,
			item.WrongCount,
			item.CorrectCount,
			note,
			reason,
			item.FirstWrongAt,
			item.LastWrongAt,
		)
	}

	return result
}

// FormatExportAsMarkdown formats export data as Markdown string
func (s *StudyNoteService) FormatExportAsMarkdown(data *model.WrongQuestionExportData) string {
	var result string

	// Header
	result = "# 错题本导出\n\n"
	result += fmt.Sprintf("导出时间: %s\n\n", data.ExportTime)
	result += fmt.Sprintf("总计错题: %d 道\n\n", data.TotalCount)

	// Stats if available
	if data.UserStats != nil {
		result += "## 统计信息\n\n"
		result += fmt.Sprintf("- 总错题数: %d\n", data.UserStats.TotalCount)
		result += fmt.Sprintf("- 待复习: %d\n", data.UserStats.ActiveCount)
		result += fmt.Sprintf("- 已掌握: %d\n", data.UserStats.MasteredCount)
		result += fmt.Sprintf("- 今日新增: %d\n", data.UserStats.TodayNewCount)
		result += "\n"
	}

	result += "---\n\n"
	result += "## 错题列表\n\n"

	// Questions
	for i, item := range data.Items {
		result += fmt.Sprintf("### 第 %d 题\n\n", i+1)

		if item.CategoryName != "" {
			result += fmt.Sprintf("**分类**: %s\n\n", item.CategoryName)
		}

		result += fmt.Sprintf("**题目**: %s\n\n", item.Content)

		if item.Options != "" {
			result += "**选项**:\n"
			result += fmt.Sprintf("```\n%s\n```\n\n", item.Options)
		}

		result += fmt.Sprintf("**答案**: %s\n\n", item.Answer)

		if item.Analysis != "" {
			result += fmt.Sprintf("**解析**: %s\n\n", item.Analysis)
		}

		result += fmt.Sprintf("**错误次数**: %d | **正确次数**: %d\n\n", item.WrongCount, item.CorrectCount)

		if item.UserNote != "" {
			result += fmt.Sprintf("**我的笔记**: %s\n\n", item.UserNote)
		}

		if item.ErrorReason != "" {
			result += fmt.Sprintf("**错误原因**: %s\n\n", item.ErrorReason)
		}

		result += fmt.Sprintf("*首次做错: %s | 最近做错: %s*\n\n", item.FirstWrongAt, item.LastWrongAt)
		result += "---\n\n"
	}

	return result
}

// FormatExportAsHTML formats export data as HTML string
func (s *StudyNoteService) FormatExportAsHTML(data *model.WrongQuestionExportData) string {
	var result string

	result = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>错题本导出</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; background: #f5f5f5; }
        .header { text-align: center; margin-bottom: 30px; padding: 20px; background: linear-gradient(135deg, #f59e0b, #ea580c); color: white; border-radius: 12px; }
        .header h1 { margin: 0 0 10px 0; }
        .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 15px; border-radius: 8px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .stat-card .number { font-size: 24px; font-weight: bold; color: #f59e0b; }
        .stat-card .label { font-size: 12px; color: #666; margin-top: 5px; }
        .question-card { background: white; padding: 20px; margin-bottom: 20px; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .question-card .number { background: #f59e0b; color: white; padding: 4px 12px; border-radius: 20px; font-size: 14px; display: inline-block; margin-bottom: 15px; }
        .question-card .category { color: #666; font-size: 14px; margin-bottom: 10px; }
        .question-card .content { font-size: 16px; line-height: 1.6; margin-bottom: 15px; }
        .question-card .options { background: #f9f9f9; padding: 15px; border-radius: 8px; margin-bottom: 15px; }
        .question-card .options pre { margin: 0; white-space: pre-wrap; font-family: inherit; }
        .question-card .answer { background: #ecfdf5; padding: 10px 15px; border-radius: 8px; margin-bottom: 15px; }
        .question-card .answer strong { color: #059669; }
        .question-card .analysis { background: #eff6ff; padding: 10px 15px; border-radius: 8px; margin-bottom: 15px; color: #1e40af; }
        .question-card .note { background: #fef3c7; padding: 10px 15px; border-radius: 8px; margin-bottom: 15px; }
        .question-card .meta { display: flex; justify-content: space-between; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 15px; }
        .question-card .counts { display: flex; gap: 15px; }
        .question-card .counts .wrong { color: #ef4444; }
        .question-card .counts .correct { color: #22c55e; }
        @media print { body { background: white; } .question-card { box-shadow: none; border: 1px solid #eee; } }
    </style>
</head>
<body>
`

	result += fmt.Sprintf(`<div class="header">
    <h1>📚 错题本</h1>
    <p>导出时间: %s | 共 %d 道题目</p>
</div>`, data.ExportTime, data.TotalCount)

	// Stats
	if data.UserStats != nil {
		result += `<div class="stats">`
		result += fmt.Sprintf(`<div class="stat-card"><div class="number">%d</div><div class="label">总错题</div></div>`, data.UserStats.TotalCount)
		result += fmt.Sprintf(`<div class="stat-card"><div class="number">%d</div><div class="label">待复习</div></div>`, data.UserStats.ActiveCount)
		result += fmt.Sprintf(`<div class="stat-card"><div class="number">%d</div><div class="label">已掌握</div></div>`, data.UserStats.MasteredCount)
		result += fmt.Sprintf(`<div class="stat-card"><div class="number">%d</div><div class="label">今日新增</div></div>`, data.UserStats.TodayNewCount)
		result += `</div>`
	}

	// Questions
	for i, item := range data.Items {
		result += `<div class="question-card">`
		result += fmt.Sprintf(`<span class="number">第 %d 题</span>`, i+1)

		if item.CategoryName != "" {
			result += fmt.Sprintf(`<div class="category">📁 %s</div>`, escapeHTML(item.CategoryName))
		}

		result += fmt.Sprintf(`<div class="content">%s</div>`, escapeHTML(item.Content))

		if item.Options != "" {
			result += fmt.Sprintf(`<div class="options"><pre>%s</pre></div>`, escapeHTML(item.Options))
		}

		result += fmt.Sprintf(`<div class="answer"><strong>答案:</strong> %s</div>`, escapeHTML(item.Answer))

		if item.Analysis != "" {
			result += fmt.Sprintf(`<div class="analysis"><strong>解析:</strong> %s</div>`, escapeHTML(item.Analysis))
		}

		if item.UserNote != "" {
			result += fmt.Sprintf(`<div class="note"><strong>📝 我的笔记:</strong> %s</div>`, escapeHTML(item.UserNote))
		}

		result += `<div class="meta">`
		result += `<div class="counts">`
		result += fmt.Sprintf(`<span class="wrong">❌ 错误 %d 次</span>`, item.WrongCount)
		result += fmt.Sprintf(`<span class="correct">✅ 正确 %d 次</span>`, item.CorrectCount)
		result += `</div>`
		result += fmt.Sprintf(`<span>首次: %s</span>`, item.FirstWrongAt)
		result += `</div>`

		result += `</div>`
	}

	result += `</body></html>`

	return result
}

// Helper functions
func escapeCSV(s string) string {
	if s == "" {
		return ""
	}
	// If the field contains a comma, double-quote, or newline, wrap it in quotes
	needsQuotes := strings.ContainsAny(s, ",\"\n\r")
	if needsQuotes {
		// Escape double quotes by doubling them
		escaped := strings.ReplaceAll(s, "\"", "\"\"")
		return "\"" + escaped + "\""
	}
	return s
}

func escapeHTML(s string) string {
	s = strings.ReplaceAll(s, "&", "&amp;")
	s = strings.ReplaceAll(s, "<", "&lt;")
	s = strings.ReplaceAll(s, ">", "&gt;")
	s = strings.ReplaceAll(s, "\"", "&quot;")
	return s
}

// BatchMarkAsMastered marks multiple wrong questions as mastered
func (s *StudyNoteService) BatchMarkAsMastered(ids []uint, userID uint) error {
	// Verify ownership for all
	for _, id := range ids {
		wrong, err := s.wrongQuestionRepo.GetByID(id)
		if err != nil {
			continue
		}
		if wrong.UserID != userID {
			continue
		}
	}
	return s.wrongQuestionRepo.BatchUpdateStatus(ids, model.WrongQuestionStatusMastered)
}

// GetWrongQuestionIDs gets all wrong question IDs for redoing
func (s *StudyNoteService) GetWrongQuestionIDs(userID uint, status string) ([]uint, error) {
	return s.wrongQuestionRepo.GetUserWrongQuestionIDs(userID, status)
}

// =====================================================
// Study Note Operations
// =====================================================

// CreateNote creates a study note
func (s *StudyNoteService) CreateNote(userID uint, req *CreateNoteRequest) (*model.StudyNoteResponse, error) {
	// Validate note type
	if !isValidNoteType(req.NoteType) {
		return nil, ErrInvalidNoteType
	}

	note := &model.StudyNote{
		UserID:    userID,
		NoteType:  model.NoteType(req.NoteType),
		RelatedID: req.RelatedID,
		Title:     req.Title,
		Content:   req.Content,
		Summary:   req.Summary,
		Tags:      req.Tags,
		IsPublic:  req.IsPublic,
		VideoTime: req.VideoTime,
	}

	// Generate summary if not provided
	if note.Summary == "" && len(note.Content) > 0 {
		if len(note.Content) > 200 {
			note.Summary = note.Content[:200] + "..."
		} else {
			note.Summary = note.Content
		}
	}

	if err := s.noteRepo.Create(note); err != nil {
		return nil, err
	}

	// Reload with user
	note, _ = s.noteRepo.GetByID(note.ID)
	return note.ToResponse(false, true), nil
}

// UpdateNote updates a study note
func (s *StudyNoteService) UpdateNote(id, userID uint, req *UpdateNoteRequest) (*model.StudyNoteResponse, error) {
	note, err := s.noteRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNoteNotFound
		}
		return nil, err
	}

	// Verify ownership
	if note.UserID != userID {
		return nil, ErrNoteNotOwner
	}

	// Update fields
	if req.Title != "" {
		note.Title = req.Title
	}
	if req.Content != "" {
		note.Content = req.Content
	}
	if req.Summary != "" {
		note.Summary = req.Summary
	}
	if req.Tags != nil {
		note.Tags = req.Tags
	}
	if req.IsPublic != nil {
		note.IsPublic = *req.IsPublic
	}
	if req.VideoTime != nil {
		note.VideoTime = req.VideoTime
	}

	// Regenerate summary if content changed
	if req.Content != "" && note.Summary == "" {
		if len(note.Content) > 200 {
			note.Summary = note.Content[:200] + "..."
		} else {
			note.Summary = note.Content
		}
	}

	if err := s.noteRepo.Update(note); err != nil {
		return nil, err
	}

	return note.ToResponse(false, true), nil
}

// DeleteNote deletes a study note
func (s *StudyNoteService) DeleteNote(id, userID uint) error {
	note, err := s.noteRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrNoteNotFound
		}
		return err
	}

	// Verify ownership
	if note.UserID != userID {
		return ErrNoteNotOwner
	}

	return s.noteRepo.Delete(id)
}

// GetNoteByID gets a note by ID
func (s *StudyNoteService) GetNoteByID(id, userID uint) (*model.StudyNoteResponse, error) {
	note, err := s.noteRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrNoteNotFound
		}
		return nil, err
	}

	// Check access
	if !note.IsPublic && note.UserID != userID {
		return nil, ErrNoteNotFound
	}

	// Increment view count if not owner
	if note.UserID != userID {
		_ = s.noteRepo.IncrementViewCount(id)
	}

	isLiked := false
	if userID > 0 {
		isLiked = s.noteLikeRepo.IsLiked(userID, id)
	}

	return note.ToResponse(isLiked, note.UserID == userID), nil
}

// GetUserNotes gets user's notes
func (s *StudyNoteService) GetUserNotes(userID uint, params *repository.NoteQueryParams) ([]model.StudyNoteResponse, int64, error) {
	notes, total, err := s.noteRepo.GetUserNotes(userID, params)
	if err != nil {
		return nil, 0, err
	}

	likedIDs, _ := s.noteLikeRepo.GetUserLikedNoteIDs(userID)
	likedMap := make(map[uint]bool)
	for _, id := range likedIDs {
		likedMap[id] = true
	}

	var responses []model.StudyNoteResponse
	for _, n := range notes {
		resp := n.ToResponse(likedMap[n.ID], true)
		responses = append(responses, *resp)
	}

	return responses, total, nil
}

// GetPublicNotes gets public notes
func (s *StudyNoteService) GetPublicNotes(params *repository.NoteQueryParams, currentUserID uint) ([]model.StudyNoteResponse, int64, error) {
	notes, total, err := s.noteRepo.GetPublicNotes(params)
	if err != nil {
		return nil, 0, err
	}

	var likedMap map[uint]bool
	if currentUserID > 0 {
		likedIDs, _ := s.noteLikeRepo.GetUserLikedNoteIDs(currentUserID)
		likedMap = make(map[uint]bool)
		for _, id := range likedIDs {
			likedMap[id] = true
		}
	}

	var responses []model.StudyNoteResponse
	for _, n := range notes {
		isLiked := false
		if likedMap != nil {
			isLiked = likedMap[n.ID]
		}
		resp := n.ToResponse(isLiked, n.UserID == currentUserID)
		responses = append(responses, *resp)
	}

	return responses, total, nil
}

// SearchNotes searches notes
func (s *StudyNoteService) SearchNotes(keyword string, params *repository.NoteQueryParams, currentUserID uint) ([]model.StudyNoteResponse, int64, error) {
	notes, total, err := s.noteRepo.SearchNotes(keyword, params)
	if err != nil {
		return nil, 0, err
	}

	var likedMap map[uint]bool
	if currentUserID > 0 {
		likedIDs, _ := s.noteLikeRepo.GetUserLikedNoteIDs(currentUserID)
		likedMap = make(map[uint]bool)
		for _, id := range likedIDs {
			likedMap[id] = true
		}
	}

	var responses []model.StudyNoteResponse
	for _, n := range notes {
		isLiked := false
		if likedMap != nil {
			isLiked = likedMap[n.ID]
		}
		resp := n.ToResponse(isLiked, n.UserID == currentUserID)
		responses = append(responses, *resp)
	}

	return responses, total, nil
}

// GetNotesByRelated gets notes by related entity
func (s *StudyNoteService) GetNotesByRelated(noteType string, relatedID uint, userID uint) ([]model.StudyNoteResponse, error) {
	notes, err := s.noteRepo.GetNotesByRelated(model.NoteType(noteType), relatedID, false, userID)
	if err != nil {
		return nil, err
	}

	var likedMap map[uint]bool
	if userID > 0 {
		likedIDs, _ := s.noteLikeRepo.GetUserLikedNoteIDs(userID)
		likedMap = make(map[uint]bool)
		for _, id := range likedIDs {
			likedMap[id] = true
		}
	}

	var responses []model.StudyNoteResponse
	for _, n := range notes {
		isLiked := false
		if likedMap != nil {
			isLiked = likedMap[n.ID]
		}
		resp := n.ToResponse(isLiked, n.UserID == userID)
		responses = append(responses, *resp)
	}

	return responses, nil
}

// GetVideoNotes gets video notes with timeline markers
func (s *StudyNoteService) GetVideoNotes(relatedID, userID uint) ([]model.StudyNoteResponse, []model.VideoNoteMarker, error) {
	notes, err := s.noteRepo.GetVideoNotes(relatedID, userID)
	if err != nil {
		return nil, nil, err
	}

	var responses []model.StudyNoteResponse
	var markers []model.VideoNoteMarker

	for _, n := range notes {
		resp := n.ToResponse(false, n.UserID == userID)
		responses = append(responses, *resp)

		// Create timeline marker
		if n.VideoTime != nil {
			marker := model.VideoNoteMarker{
				NoteID:  n.ID,
				Time:    *n.VideoTime,
				TimeStr: formatVideoTime(*n.VideoTime),
				Title:   n.Title,
			}
			markers = append(markers, marker)
		}
	}

	return responses, markers, nil
}

// formatVideoTime formats seconds to HH:MM:SS
func formatVideoTime(seconds int) string {
	h := seconds / 3600
	m := (seconds % 3600) / 60
	s := seconds % 60
	if h > 0 {
		return time.Date(0, 0, 0, h, m, s, 0, time.UTC).Format("15:04:05")
	}
	return time.Date(0, 0, 0, 0, m, s, 0, time.UTC).Format("04:05")
}

// LikeNote likes a note
func (s *StudyNoteService) LikeNote(noteID, userID uint) error {
	// Check note exists
	note, err := s.noteRepo.GetByID(noteID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrNoteNotFound
		}
		return err
	}

	// Check if public or owned
	if !note.IsPublic && note.UserID != userID {
		return ErrNoteNotFound
	}

	// Check if already liked
	if s.noteLikeRepo.IsLiked(userID, noteID) {
		return ErrNoteAlreadyLiked
	}

	// Create like
	like := &model.NoteLike{
		UserID: userID,
		NoteID: noteID,
	}
	if err := s.noteLikeRepo.Create(like); err != nil {
		return err
	}

	// Increment like count
	return s.noteRepo.IncrementLikeCount(noteID)
}

// UnlikeNote unlikes a note
func (s *StudyNoteService) UnlikeNote(noteID, userID uint) error {
	// Check if liked
	if !s.noteLikeRepo.IsLiked(userID, noteID) {
		return ErrNoteNotLiked
	}

	// Delete like
	if err := s.noteLikeRepo.Delete(userID, noteID); err != nil {
		return err
	}

	// Decrement like count
	return s.noteRepo.DecrementLikeCount(noteID)
}

// GetUserNoteStats gets user's note statistics
func (s *StudyNoteService) GetUserNoteStats(userID uint) (*model.UserNoteStats, error) {
	return s.noteRepo.GetUserNoteStats(userID)
}

// isValidNoteType checks if note type is valid
func isValidNoteType(noteType string) bool {
	validTypes := []model.NoteType{
		model.NoteTypeCourse,
		model.NoteTypeChapter,
		model.NoteTypeQuestion,
		model.NoteTypeKnowledge,
		model.NoteTypeFree,
		model.NoteTypeVideo,
	}
	for _, t := range validTypes {
		if model.NoteType(noteType) == t {
			return true
		}
	}
	return false
}

// =====================================================
// Request DTOs
// =====================================================

// CreateNoteRequest 创建笔记请求
type CreateNoteRequest struct {
	NoteType  string   `json:"note_type" binding:"required"`
	RelatedID *uint    `json:"related_id"`
	Title     string   `json:"title" binding:"required"`
	Content   string   `json:"content"`
	Summary   string   `json:"summary"`
	Tags      []string `json:"tags"`
	IsPublic  bool     `json:"is_public"`
	VideoTime *int     `json:"video_time"`
}

// UpdateNoteRequest 更新笔记请求
type UpdateNoteRequest struct {
	Title     string   `json:"title"`
	Content   string   `json:"content"`
	Summary   string   `json:"summary"`
	Tags      []string `json:"tags"`
	IsPublic  *bool    `json:"is_public"`
	VideoTime *int     `json:"video_time"`
}

// UpdateWrongQuestionRequest 更新错题请求
type UpdateWrongQuestionRequest struct {
	Note        string `json:"note"`
	ErrorReason string `json:"error_reason"`
}

// RecordReviewRequest 记录复习请求
type RecordReviewRequest struct {
	IsCorrect bool `json:"is_correct"`
}
