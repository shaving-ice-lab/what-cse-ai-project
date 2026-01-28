package repository

import (
	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// =====================================================
// Practice Session Repository
// =====================================================

type PracticeSessionRepository struct {
	db *gorm.DB
}

func NewPracticeSessionRepository(db *gorm.DB) *PracticeSessionRepository {
	return &PracticeSessionRepository{db: db}
}

// Create creates a new practice session
func (r *PracticeSessionRepository) Create(session *model.PracticeSession) error {
	return r.db.Create(session).Error
}

// Update updates a practice session
func (r *PracticeSessionRepository) Update(session *model.PracticeSession) error {
	return r.db.Save(session).Error
}

// GetByID gets a practice session by ID
func (r *PracticeSessionRepository) GetByID(id uint) (*model.PracticeSession, error) {
	var session model.PracticeSession
	err := r.db.First(&session, id).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// GetByUserID gets all practice sessions for a user
func (r *PracticeSessionRepository) GetByUserID(userID uint, page, pageSize int) ([]model.PracticeSession, int64, error) {
	var sessions []model.PracticeSession
	var total int64

	query := r.db.Model(&model.PracticeSession{}).Where("user_id = ?", userID)
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&sessions).Error

	return sessions, total, err
}

// GetActiveByUserID gets active (in-progress) sessions for a user
func (r *PracticeSessionRepository) GetActiveByUserID(userID uint) ([]model.PracticeSession, error) {
	var sessions []model.PracticeSession
	err := r.db.Where("user_id = ? AND status IN ?", userID, []model.PracticeSessionStatus{
		model.PracticeSessionStatusPending,
		model.PracticeSessionStatusActive,
	}).Order("created_at DESC").Find(&sessions).Error
	return sessions, err
}

// GetByUserAndType gets sessions by user and type
func (r *PracticeSessionRepository) GetByUserAndType(userID uint, sessionType model.PracticeSessionType, page, pageSize int) ([]model.PracticeSession, int64, error) {
	var sessions []model.PracticeSession
	var total int64

	query := r.db.Model(&model.PracticeSession{}).
		Where("user_id = ? AND session_type = ?", userID, sessionType)
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&sessions).Error

	return sessions, total, err
}

// GetCompletedStats gets statistics of completed sessions for a user
func (r *PracticeSessionRepository) GetCompletedStats(userID uint) (*PracticeStats, error) {
	var stats PracticeStats

	// Count total completed sessions
	r.db.Model(&model.PracticeSession{}).
		Where("user_id = ? AND status = ?", userID, model.PracticeSessionStatusCompleted).
		Count(&stats.TotalSessions)

	// Calculate totals
	var result struct {
		TotalQuestions int
		TotalCorrect   int
		TotalTime      int
	}
	r.db.Model(&model.PracticeSession{}).
		Where("user_id = ? AND status = ?", userID, model.PracticeSessionStatusCompleted).
		Select("COALESCE(SUM(total_questions), 0) as total_questions, COALESCE(SUM(correct_count), 0) as total_correct, COALESCE(SUM(total_time_spent), 0) as total_time").
		Scan(&result)

	stats.TotalQuestions = int64(result.TotalQuestions)
	stats.TotalCorrect = int64(result.TotalCorrect)
	stats.TotalTimeSpent = int64(result.TotalTime)

	if stats.TotalQuestions > 0 {
		stats.AvgCorrectRate = float64(stats.TotalCorrect) * 100 / float64(stats.TotalQuestions)
	}

	return &stats, nil
}

// PracticeStats 练习统计
type PracticeStats struct {
	TotalSessions  int64   `json:"total_sessions"`
	TotalQuestions int64   `json:"total_questions"`
	TotalCorrect   int64   `json:"total_correct"`
	TotalTimeSpent int64   `json:"total_time_spent"` // 秒
	AvgCorrectRate float64 `json:"avg_correct_rate"`
}

// Delete soft deletes a practice session
func (r *PracticeSessionRepository) Delete(id uint) error {
	return r.db.Delete(&model.PracticeSession{}, id).Error
}

// AbandonSession marks a session as abandoned
func (r *PracticeSessionRepository) AbandonSession(id uint) error {
	return r.db.Model(&model.PracticeSession{}).
		Where("id = ?", id).
		Update("status", model.PracticeSessionStatusAbandoned).Error
}

// =====================================================
// 断点续做相关方法
// =====================================================

// GetResumableSessions gets all sessions that can be resumed for a user
func (r *PracticeSessionRepository) GetResumableSessions(userID uint) ([]model.PracticeSession, error) {
	var sessions []model.PracticeSession
	err := r.db.Where(`
		user_id = ? AND 
		(status = ? OR is_interrupted = ?) AND 
		completed_count < total_questions
	`, userID, model.PracticeSessionStatusActive, true).
		Order("updated_at DESC").
		Limit(10). // 最多返回10个可恢复的会话
		Find(&sessions).Error
	return sessions, err
}

// GetLatestResumable gets the most recent resumable session for a user
func (r *PracticeSessionRepository) GetLatestResumable(userID uint) (*model.PracticeSession, error) {
	var session model.PracticeSession
	err := r.db.Where(`
		user_id = ? AND 
		(status = ? OR is_interrupted = ?) AND 
		completed_count < total_questions
	`, userID, model.PracticeSessionStatusActive, true).
		Order("updated_at DESC").
		First(&session).Error
	if err != nil {
		return nil, err
	}
	return &session, nil
}

// UpdateProgress updates the session progress (for auto-save)
func (r *PracticeSessionRepository) UpdateProgress(session *model.PracticeSession) error {
	return r.db.Model(session).
		Select("questions", "completed_count", "correct_count", "wrong_count",
			"total_time_spent", "current_index", "last_saved_at", "elapsed_at_save").
		Updates(session).Error
}

// MarkInterrupted marks a session as interrupted
func (r *PracticeSessionRepository) MarkInterrupted(id uint, reason string) error {
	return r.db.Model(&model.PracticeSession{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_interrupted":   true,
			"interrupt_reason": reason,
		}).Error
}

// ClearInterrupt clears the interrupted status when resuming
func (r *PracticeSessionRepository) ClearInterrupt(id uint) error {
	return r.db.Model(&model.PracticeSession{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"is_interrupted":   false,
			"interrupt_reason": "",
		}).Error
}
