package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// =====================================================
// Wrong Question Repository
// =====================================================

type WrongQuestionRepository struct {
	db *gorm.DB
}

func NewWrongQuestionRepository(db *gorm.DB) *WrongQuestionRepository {
	return &WrongQuestionRepository{db: db}
}

// WrongQuestionQueryParams 错题查询参数
type WrongQuestionQueryParams struct {
	CategoryID  uint   `query:"category_id"`
	Status      string `query:"status"`
	ErrorReason string `query:"error_reason"`
	NeedReview  bool   `query:"need_review"` // 需要复习的
	Keyword     string `query:"keyword"`
	StartDate   string `query:"start_date"` // 错题时间范围
	EndDate     string `query:"end_date"`
	SortBy      string `query:"sort_by"`    // wrong_count, last_wrong_at, created_at
	SortOrder   string `query:"sort_order"` // asc, desc
	Page        int    `query:"page"`
	PageSize    int    `query:"page_size"`
}

// Create creates a wrong question record
func (r *WrongQuestionRepository) Create(wrong *model.WrongQuestion) error {
	return r.db.Create(wrong).Error
}

// Update updates a wrong question record
func (r *WrongQuestionRepository) Update(wrong *model.WrongQuestion) error {
	return r.db.Save(wrong).Error
}

// Delete soft deletes a wrong question record
func (r *WrongQuestionRepository) Delete(id uint) error {
	return r.db.Delete(&model.WrongQuestion{}, id).Error
}

// GetByID gets a wrong question record by ID
func (r *WrongQuestionRepository) GetByID(id uint) (*model.WrongQuestion, error) {
	var wrong model.WrongQuestion
	err := r.db.Preload("Question").Preload("Question.Category").First(&wrong, id).Error
	if err != nil {
		return nil, err
	}
	return &wrong, nil
}

// GetByUserAndQuestion gets wrong question by user and question
func (r *WrongQuestionRepository) GetByUserAndQuestion(userID, questionID uint) (*model.WrongQuestion, error) {
	var wrong model.WrongQuestion
	err := r.db.Where("user_id = ? AND question_id = ?", userID, questionID).First(&wrong).Error
	if err != nil {
		return nil, err
	}
	return &wrong, nil
}

// GetUserWrongQuestions gets user's wrong questions with filters
func (r *WrongQuestionRepository) GetUserWrongQuestions(userID uint, params *WrongQuestionQueryParams) ([]model.WrongQuestion, int64, error) {
	var wrongs []model.WrongQuestion
	var total int64

	query := r.db.Model(&model.WrongQuestion{}).Where("user_id = ?", userID)

	// Apply filters
	if params.CategoryID > 0 {
		query = query.Where("category_id = ?", params.CategoryID)
	}
	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	} else {
		// Default: only active questions
		query = query.Where("status = ?", model.WrongQuestionStatusActive)
	}
	if params.ErrorReason != "" {
		query = query.Where("error_reason = ?", params.ErrorReason)
	}
	if params.NeedReview {
		now := time.Now()
		query = query.Where("next_review_at IS NOT NULL AND next_review_at <= ?", now)
	}
	if params.StartDate != "" {
		query = query.Where("first_wrong_at >= ?", params.StartDate)
	}
	if params.EndDate != "" {
		query = query.Where("first_wrong_at <= ?", params.EndDate+" 23:59:59")
	}
	if params.Keyword != "" {
		// Search in question content
		keyword := "%" + params.Keyword + "%"
		query = query.Joins("JOIN what_questions ON what_questions.id = what_wrong_questions.question_id").
			Where("what_questions.content LIKE ?", keyword)
	}

	// Count total
	query.Count(&total)

	// Sorting
	orderBy := "last_wrong_at DESC"
	if params.SortBy != "" {
		order := "DESC"
		if params.SortOrder == "asc" {
			order = "ASC"
		}
		switch params.SortBy {
		case "wrong_count":
			orderBy = "wrong_count " + order
		case "last_wrong_at":
			orderBy = "last_wrong_at " + order
		case "created_at":
			orderBy = "created_at " + order
		case "next_review_at":
			orderBy = "next_review_at " + order
		}
	}

	// Pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Preload("Question").Preload("Question.Category").
		Order(orderBy).
		Offset(offset).
		Limit(params.PageSize).
		Find(&wrongs).Error

	return wrongs, total, err
}

// GetUserWrongQuestionIDs gets all wrong question IDs for a user
func (r *WrongQuestionRepository) GetUserWrongQuestionIDs(userID uint, status string) ([]uint, error) {
	var ids []uint
	query := r.db.Model(&model.WrongQuestion{}).Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Pluck("question_id", &ids).Error
	return ids, err
}

// GetByIDs gets wrong questions by IDs for a specific user
func (r *WrongQuestionRepository) GetByIDs(userID uint, ids []uint) ([]model.WrongQuestion, error) {
	var wrongs []model.WrongQuestion
	if len(ids) == 0 {
		return wrongs, nil
	}
	err := r.db.Where("user_id = ? AND id IN ?", userID, ids).
		Preload("Question").
		Preload("Question.Category").
		Find(&wrongs).Error
	return wrongs, err
}

// GetUserWrongQuestionStats gets user's wrong question statistics
func (r *WrongQuestionRepository) GetUserWrongQuestionStats(userID uint) (*model.WrongQuestionStats, error) {
	stats := &model.WrongQuestionStats{}

	var count int64

	// Total count
	r.db.Model(&model.WrongQuestion{}).
		Where("user_id = ? AND status != ?", userID, model.WrongQuestionStatusRemoved).
		Count(&count)
	stats.TotalCount = int(count)

	// Active count
	r.db.Model(&model.WrongQuestion{}).
		Where("user_id = ? AND status = ?", userID, model.WrongQuestionStatusActive).
		Count(&count)
	stats.ActiveCount = int(count)

	// Mastered count
	r.db.Model(&model.WrongQuestion{}).
		Where("user_id = ? AND status = ?", userID, model.WrongQuestionStatusMastered).
		Count(&count)
	stats.MasteredCount = int(count)

	// Today new count
	today := time.Now().Format("2006-01-02")
	r.db.Model(&model.WrongQuestion{}).
		Where("user_id = ? AND DATE(first_wrong_at) = ?", userID, today).
		Count(&count)
	stats.TodayNewCount = int(count)

	// Need review count
	now := time.Now()
	r.db.Model(&model.WrongQuestion{}).
		Where("user_id = ? AND status = ? AND next_review_at IS NOT NULL AND next_review_at <= ?",
			userID, model.WrongQuestionStatusActive, now).
		Count(&count)
	stats.NeedReviewCount = int(count)

	// Category stats
	var categoryStats []struct {
		CategoryID   uint   `json:"category_id"`
		CategoryName string `json:"category_name"`
		Count        int    `json:"count"`
	}
	r.db.Model(&model.WrongQuestion{}).
		Select("what_wrong_questions.category_id, what_course_categories.name as category_name, COUNT(*) as count").
		Joins("LEFT JOIN what_course_categories ON what_course_categories.id = what_wrong_questions.category_id").
		Where("what_wrong_questions.user_id = ? AND what_wrong_questions.status = ?", userID, model.WrongQuestionStatusActive).
		Group("what_wrong_questions.category_id").
		Order("count DESC").
		Limit(10).
		Scan(&categoryStats)
	for _, cs := range categoryStats {
		stats.CategoryStats = append(stats.CategoryStats, model.CategoryStat{
			CategoryID:   cs.CategoryID,
			CategoryName: cs.CategoryName,
			Count:        cs.Count,
		})
	}

	// Error reason stats
	var reasonStats []struct {
		Reason string `json:"reason"`
		Count  int    `json:"count"`
	}
	r.db.Model(&model.WrongQuestion{}).
		Select("error_reason as reason, COUNT(*) as count").
		Where("user_id = ? AND status = ? AND error_reason != ''", userID, model.WrongQuestionStatusActive).
		Group("error_reason").
		Order("count DESC").
		Scan(&reasonStats)
	for _, rs := range reasonStats {
		stats.ErrorReasonStats = append(stats.ErrorReasonStats, model.ReasonStat{
			Reason: rs.Reason,
			Count:  rs.Count,
		})
	}

	return stats, nil
}

// UpdateStatus updates wrong question status
func (r *WrongQuestionRepository) UpdateStatus(id uint, status model.WrongQuestionStatus) error {
	return r.db.Model(&model.WrongQuestion{}).Where("id = ?", id).Update("status", status).Error
}

// IncrementWrongCount increments wrong count and updates last_wrong_at
func (r *WrongQuestionRepository) IncrementWrongCount(id uint) error {
	return r.db.Model(&model.WrongQuestion{}).Where("id = ?", id).
		Updates(map[string]interface{}{
			"wrong_count":   gorm.Expr("wrong_count + 1"),
			"last_wrong_at": time.Now(),
		}).Error
}

// IncrementCorrectCount increments correct count
func (r *WrongQuestionRepository) IncrementCorrectCount(id uint) error {
	return r.db.Model(&model.WrongQuestion{}).Where("id = ?", id).
		Update("correct_count", gorm.Expr("correct_count + 1")).Error
}

// UpdateNote updates user note
func (r *WrongQuestionRepository) UpdateNote(id uint, note string) error {
	return r.db.Model(&model.WrongQuestion{}).Where("id = ?", id).Update("user_note", note).Error
}

// UpdateErrorReason updates error reason
func (r *WrongQuestionRepository) UpdateErrorReason(id uint, reason string) error {
	return r.db.Model(&model.WrongQuestion{}).Where("id = ?", id).Update("error_reason", reason).Error
}

// UpdateReview updates review info
func (r *WrongQuestionRepository) UpdateReview(id uint, nextReviewAt *time.Time) error {
	now := time.Now()
	return r.db.Model(&model.WrongQuestion{}).Where("id = ?", id).
		Updates(map[string]interface{}{
			"last_review_at": now,
			"review_count":   gorm.Expr("review_count + 1"),
			"next_review_at": nextReviewAt,
		}).Error
}

// GetNeedReviewQuestions gets questions that need review
func (r *WrongQuestionRepository) GetNeedReviewQuestions(userID uint, limit int) ([]model.WrongQuestion, error) {
	var wrongs []model.WrongQuestion
	now := time.Now()
	err := r.db.Where("user_id = ? AND status = ? AND next_review_at IS NOT NULL AND next_review_at <= ?",
		userID, model.WrongQuestionStatusActive, now).
		Preload("Question").Preload("Question.Category").
		Order("next_review_at ASC").
		Limit(limit).
		Find(&wrongs).Error
	return wrongs, err
}

// BatchUpdateStatus updates status for multiple records
func (r *WrongQuestionRepository) BatchUpdateStatus(ids []uint, status model.WrongQuestionStatus) error {
	return r.db.Model(&model.WrongQuestion{}).Where("id IN ?", ids).Update("status", status).Error
}

// =====================================================
// Study Note Repository
// =====================================================

type StudyNoteRepository struct {
	db *gorm.DB
}

func NewStudyNoteRepository(db *gorm.DB) *StudyNoteRepository {
	return &StudyNoteRepository{db: db}
}

// NoteQueryParams 笔记查询参数
type NoteQueryParams struct {
	UserID    uint     `query:"-"`
	NoteType  string   `query:"note_type"`
	RelatedID *uint    `query:"related_id"`
	IsPublic  *bool    `query:"is_public"`
	Tags      []string `query:"tags"`
	Keyword   string   `query:"keyword"`
	SortBy    string   `query:"sort_by"` // created_at, updated_at, like_count, view_count
	SortOrder string   `query:"sort_order"`
	Page      int      `query:"page"`
	PageSize  int      `query:"page_size"`
}

// Create creates a study note
func (r *StudyNoteRepository) Create(note *model.StudyNote) error {
	return r.db.Create(note).Error
}

// Update updates a study note
func (r *StudyNoteRepository) Update(note *model.StudyNote) error {
	return r.db.Save(note).Error
}

// Delete soft deletes a study note
func (r *StudyNoteRepository) Delete(id uint) error {
	return r.db.Delete(&model.StudyNote{}, id).Error
}

// GetByID gets a study note by ID
func (r *StudyNoteRepository) GetByID(id uint) (*model.StudyNote, error) {
	var note model.StudyNote
	err := r.db.Preload("User").First(&note, id).Error
	if err != nil {
		return nil, err
	}
	return &note, nil
}

// GetUserNotes gets user's notes with filters
func (r *StudyNoteRepository) GetUserNotes(userID uint, params *NoteQueryParams) ([]model.StudyNote, int64, error) {
	var notes []model.StudyNote
	var total int64

	query := r.db.Model(&model.StudyNote{}).Where("user_id = ?", userID)

	query = r.applyNoteFilters(query, params)

	// Count total
	query.Count(&total)

	// Sorting
	orderBy := r.getNoteOrderBy(params)

	// Pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Preload("User").
		Order(orderBy).
		Offset(offset).
		Limit(params.PageSize).
		Find(&notes).Error

	return notes, total, err
}

// GetPublicNotes gets public notes
func (r *StudyNoteRepository) GetPublicNotes(params *NoteQueryParams) ([]model.StudyNote, int64, error) {
	var notes []model.StudyNote
	var total int64

	query := r.db.Model(&model.StudyNote{}).Where("is_public = ?", true)

	query = r.applyNoteFilters(query, params)

	// Count total
	query.Count(&total)

	// Sorting
	orderBy := r.getNoteOrderBy(params)

	// Pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Preload("User").
		Order(orderBy).
		Offset(offset).
		Limit(params.PageSize).
		Find(&notes).Error

	return notes, total, err
}

// GetNotesByRelated gets notes by related entity
func (r *StudyNoteRepository) GetNotesByRelated(noteType model.NoteType, relatedID uint, includePrivate bool, userID uint) ([]model.StudyNote, error) {
	var notes []model.StudyNote
	query := r.db.Where("note_type = ? AND related_id = ?", noteType, relatedID)

	if !includePrivate {
		query = query.Where("is_public = ? OR user_id = ?", true, userID)
	}

	err := query.Preload("User").
		Order("sort_order ASC, created_at DESC").
		Find(&notes).Error
	return notes, err
}

// GetVideoNotes gets video notes for a video
func (r *StudyNoteRepository) GetVideoNotes(relatedID uint, userID uint) ([]model.StudyNote, error) {
	var notes []model.StudyNote
	err := r.db.Where("note_type = ? AND related_id = ? AND (is_public = ? OR user_id = ?)",
		model.NoteTypeVideo, relatedID, true, userID).
		Preload("User").
		Order("video_time ASC, created_at DESC").
		Find(&notes).Error
	return notes, err
}

// SearchNotes searches notes
func (r *StudyNoteRepository) SearchNotes(keyword string, params *NoteQueryParams) ([]model.StudyNote, int64, error) {
	var notes []model.StudyNote
	var total int64

	query := r.db.Model(&model.StudyNote{}).Where("is_public = ?", true)

	if keyword != "" {
		kw := "%" + keyword + "%"
		query = query.Where("title LIKE ? OR content LIKE ?", kw, kw)
	}

	query = r.applyNoteFilters(query, params)

	// Count total
	query.Count(&total)

	// Sorting
	orderBy := r.getNoteOrderBy(params)

	// Pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Preload("User").
		Order(orderBy).
		Offset(offset).
		Limit(params.PageSize).
		Find(&notes).Error

	return notes, total, err
}

// applyNoteFilters applies common filters
func (r *StudyNoteRepository) applyNoteFilters(query *gorm.DB, params *NoteQueryParams) *gorm.DB {
	if params.NoteType != "" {
		query = query.Where("note_type = ?", params.NoteType)
	}
	if params.RelatedID != nil {
		query = query.Where("related_id = ?", *params.RelatedID)
	}
	if params.IsPublic != nil {
		query = query.Where("is_public = ?", *params.IsPublic)
	}
	if params.Keyword != "" {
		kw := "%" + params.Keyword + "%"
		query = query.Where("title LIKE ? OR content LIKE ?", kw, kw)
	}
	return query
}

// getNoteOrderBy gets order by clause
func (r *StudyNoteRepository) getNoteOrderBy(params *NoteQueryParams) string {
	orderBy := "created_at DESC"
	if params.SortBy != "" {
		order := "DESC"
		if params.SortOrder == "asc" {
			order = "ASC"
		}
		switch params.SortBy {
		case "created_at":
			orderBy = "created_at " + order
		case "updated_at":
			orderBy = "updated_at " + order
		case "like_count":
			orderBy = "like_count " + order
		case "view_count":
			orderBy = "view_count " + order
		}
	}
	return orderBy
}

// IncrementViewCount increments view count
func (r *StudyNoteRepository) IncrementViewCount(id uint) error {
	return r.db.Model(&model.StudyNote{}).Where("id = ?", id).
		Update("view_count", gorm.Expr("view_count + 1")).Error
}

// IncrementLikeCount increments like count
func (r *StudyNoteRepository) IncrementLikeCount(id uint) error {
	return r.db.Model(&model.StudyNote{}).Where("id = ?", id).
		Update("like_count", gorm.Expr("like_count + 1")).Error
}

// DecrementLikeCount decrements like count
func (r *StudyNoteRepository) DecrementLikeCount(id uint) error {
	return r.db.Model(&model.StudyNote{}).Where("id = ? AND like_count > 0", id).
		Update("like_count", gorm.Expr("like_count - 1")).Error
}

// GetUserNoteStats gets user's note statistics
func (r *StudyNoteRepository) GetUserNoteStats(userID uint) (*model.UserNoteStats, error) {
	stats := &model.UserNoteStats{}
	var count int64

	// Total notes
	r.db.Model(&model.StudyNote{}).Where("user_id = ?", userID).Count(&count)
	stats.TotalNotes = int(count)

	// Public notes
	r.db.Model(&model.StudyNote{}).Where("user_id = ? AND is_public = ?", userID, true).Count(&count)
	stats.PublicNotes = int(count)

	// Total likes
	r.db.Model(&model.StudyNote{}).Where("user_id = ?", userID).Select("COALESCE(SUM(like_count), 0)").Scan(&stats.TotalLikes)

	// Total views
	r.db.Model(&model.StudyNote{}).Where("user_id = ?", userID).Select("COALESCE(SUM(view_count), 0)").Scan(&stats.TotalViews)

	// By note type
	r.db.Model(&model.StudyNote{}).Where("user_id = ? AND note_type = ?", userID, model.NoteTypeCourse).Count(&count)
	stats.CourseNotes = int(count)
	r.db.Model(&model.StudyNote{}).Where("user_id = ? AND note_type = ?", userID, model.NoteTypeQuestion).Count(&count)
	stats.QuestionNotes = int(count)
	r.db.Model(&model.StudyNote{}).Where("user_id = ? AND note_type = ?", userID, model.NoteTypeKnowledge).Count(&count)
	stats.KnowledgeNotes = int(count)
	r.db.Model(&model.StudyNote{}).Where("user_id = ? AND note_type = ?", userID, model.NoteTypeFree).Count(&count)
	stats.FreeNotes = int(count)
	r.db.Model(&model.StudyNote{}).Where("user_id = ? AND note_type = ?", userID, model.NoteTypeVideo).Count(&count)
	stats.VideoNotes = int(count)

	return stats, nil
}

// =====================================================
// Note Like Repository
// =====================================================

type NoteLikeRepository struct {
	db *gorm.DB
}

func NewNoteLikeRepository(db *gorm.DB) *NoteLikeRepository {
	return &NoteLikeRepository{db: db}
}

// Create creates a note like
func (r *NoteLikeRepository) Create(like *model.NoteLike) error {
	return r.db.Create(like).Error
}

// Delete removes a note like
func (r *NoteLikeRepository) Delete(userID, noteID uint) error {
	return r.db.Where("user_id = ? AND note_id = ?", userID, noteID).Delete(&model.NoteLike{}).Error
}

// IsLiked checks if user liked the note
func (r *NoteLikeRepository) IsLiked(userID, noteID uint) bool {
	var count int64
	r.db.Model(&model.NoteLike{}).Where("user_id = ? AND note_id = ?", userID, noteID).Count(&count)
	return count > 0
}

// GetUserLikedNoteIDs gets all note IDs liked by user
func (r *NoteLikeRepository) GetUserLikedNoteIDs(userID uint) ([]uint, error) {
	var ids []uint
	err := r.db.Model(&model.NoteLike{}).Where("user_id = ?", userID).Pluck("note_id", &ids).Error
	return ids, err
}
