package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// =====================================================
// Daily Practice Repository
// =====================================================

type DailyPracticeRepository struct {
	db *gorm.DB
}

func NewDailyPracticeRepository(db *gorm.DB) *DailyPracticeRepository {
	return &DailyPracticeRepository{db: db}
}

// Create creates a new daily practice
func (r *DailyPracticeRepository) Create(practice *model.DailyPractice) error {
	return r.db.Create(practice).Error
}

// Update updates a daily practice
func (r *DailyPracticeRepository) Update(practice *model.DailyPractice) error {
	return r.db.Save(practice).Error
}

// GetByID gets a daily practice by ID
func (r *DailyPracticeRepository) GetByID(id uint) (*model.DailyPractice, error) {
	var practice model.DailyPractice
	err := r.db.First(&practice, id).Error
	if err != nil {
		return nil, err
	}
	return &practice, nil
}

// GetByUserAndDate gets a daily practice by user ID and date
func (r *DailyPracticeRepository) GetByUserAndDate(userID uint, date string) (*model.DailyPractice, error) {
	var practice model.DailyPractice
	err := r.db.Where("user_id = ? AND practice_date = ?", userID, date).First(&practice).Error
	if err != nil {
		return nil, err
	}
	return &practice, nil
}

// GetUserHistory gets user's practice history
func (r *DailyPracticeRepository) GetUserHistory(userID uint, page, pageSize int) ([]model.DailyPractice, int64, error) {
	var practices []model.DailyPractice
	var total int64

	query := r.db.Model(&model.DailyPractice{}).Where("user_id = ?", userID)
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Order("practice_date DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&practices).Error

	return practices, total, err
}

// GetUserCalendar gets user's practice calendar for a month
func (r *DailyPracticeRepository) GetUserCalendar(userID uint, year, month int) ([]model.DailyPractice, error) {
	var practices []model.DailyPractice

	// Get start and end date of the month
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0).Add(-time.Second)

	err := r.db.Where("user_id = ? AND practice_date >= ? AND practice_date <= ?",
		userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
		Order("practice_date ASC").
		Find(&practices).Error

	return practices, err
}

// GetCompletedCount gets the count of completed practices for a user
func (r *DailyPracticeRepository) GetCompletedCount(userID uint) (int64, error) {
	var count int64
	err := r.db.Model(&model.DailyPractice{}).
		Where("user_id = ? AND status = ?", userID, model.DailyPracticeStatusCompleted).
		Count(&count).Error
	return count, err
}

// GetRecentCompletedDates gets recent completed practice dates
func (r *DailyPracticeRepository) GetRecentCompletedDates(userID uint, days int) ([]string, error) {
	var dates []string
	err := r.db.Model(&model.DailyPractice{}).
		Where("user_id = ? AND status = ? AND practice_date >= ?",
			userID, model.DailyPracticeStatusCompleted,
			time.Now().AddDate(0, 0, -days).Format("2006-01-02")).
		Order("practice_date DESC").
		Pluck("practice_date", &dates).Error
	return dates, err
}

// =====================================================
// User Daily Streak Repository
// =====================================================

type UserDailyStreakRepository struct {
	db *gorm.DB
}

func NewUserDailyStreakRepository(db *gorm.DB) *UserDailyStreakRepository {
	return &UserDailyStreakRepository{db: db}
}

// GetOrCreate gets existing streak or creates a new one
func (r *UserDailyStreakRepository) GetOrCreate(userID uint) (*model.UserDailyStreak, error) {
	var streak model.UserDailyStreak
	err := r.db.Where("user_id = ?", userID).First(&streak).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new streak
			streak = model.UserDailyStreak{
				UserID: userID,
			}
			if err := r.db.Create(&streak).Error; err != nil {
				return nil, err
			}
			return &streak, nil
		}
		return nil, err
	}
	return &streak, nil
}

// Update updates a streak
func (r *UserDailyStreakRepository) Update(streak *model.UserDailyStreak) error {
	return r.db.Save(streak).Error
}

// GetByUserID gets streak by user ID
func (r *UserDailyStreakRepository) GetByUserID(userID uint) (*model.UserDailyStreak, error) {
	var streak model.UserDailyStreak
	err := r.db.Where("user_id = ?", userID).First(&streak).Error
	if err != nil {
		return nil, err
	}
	return &streak, nil
}

// GetTopStreaks gets top streaks for leaderboard
func (r *UserDailyStreakRepository) GetTopStreaks(limit int) ([]model.UserDailyStreak, error) {
	var streaks []model.UserDailyStreak
	err := r.db.Order("current_streak DESC").Limit(limit).Find(&streaks).Error
	return streaks, err
}

// UpdateWeeklyStats updates weekly statistics for all users
func (r *UserDailyStreakRepository) UpdateWeeklyStats(db *gorm.DB) error {
	// Get start of current week (Monday)
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7 // Sunday
	}
	startOfWeek := now.AddDate(0, 0, -(weekday - 1)).Format("2006-01-02")

	// Update this_week_days from daily_practices
	return db.Exec(`
		UPDATE what_user_daily_streaks s
		SET this_week_days = (
			SELECT COUNT(*) FROM what_daily_practices p
			WHERE p.user_id = s.user_id
			AND p.status = 'completed'
			AND p.practice_date >= ?
		)
	`, startOfWeek).Error
}

// UpdateMonthlyStats updates monthly statistics for all users
func (r *UserDailyStreakRepository) UpdateMonthlyStats(db *gorm.DB) error {
	startOfMonth := time.Now().Format("2006-01") + "-01"

	return db.Exec(`
		UPDATE what_user_daily_streaks s
		SET this_month_days = (
			SELECT COUNT(*) FROM what_daily_practices p
			WHERE p.user_id = s.user_id
			AND p.status = 'completed'
			AND p.practice_date >= ?
		)
	`, startOfMonth).Error
}

// =====================================================
// User Weak Category Repository
// =====================================================

type UserWeakCategoryRepository struct {
	db *gorm.DB
}

func NewUserWeakCategoryRepository(db *gorm.DB) *UserWeakCategoryRepository {
	return &UserWeakCategoryRepository{db: db}
}

// GetOrCreate gets existing weak category or creates a new one
func (r *UserWeakCategoryRepository) GetOrCreate(userID, categoryID uint) (*model.UserWeakCategory, error) {
	var weak model.UserWeakCategory
	err := r.db.Where("user_id = ? AND category_id = ?", userID, categoryID).First(&weak).Error
	if err != nil {
		if err == gorm.ErrRecordNotFound {
			// Create new
			weak = model.UserWeakCategory{
				UserID:     userID,
				CategoryID: categoryID,
			}
			if err := r.db.Create(&weak).Error; err != nil {
				return nil, err
			}
			return &weak, nil
		}
		return nil, err
	}
	return &weak, nil
}

// Update updates a weak category
func (r *UserWeakCategoryRepository) Update(weak *model.UserWeakCategory) error {
	return r.db.Save(weak).Error
}

// GetUserWeakCategories gets user's weak categories (sorted by correct rate ascending)
func (r *UserWeakCategoryRepository) GetUserWeakCategories(userID uint, limit int) ([]model.UserWeakCategory, error) {
	var categories []model.UserWeakCategory
	query := r.db.Where("user_id = ? AND total_count > 0", userID).
		Preload("Category").
		Order("correct_rate ASC")

	if limit > 0 {
		query = query.Limit(limit)
	}

	err := query.Find(&categories).Error
	return categories, err
}

// GetUserCategoryStats gets all user category statistics
func (r *UserWeakCategoryRepository) GetUserCategoryStats(userID uint) ([]model.UserWeakCategory, error) {
	var categories []model.UserWeakCategory
	err := r.db.Where("user_id = ?", userID).
		Preload("Category").
		Order("total_count DESC").
		Find(&categories).Error
	return categories, err
}

// UpdateFromQuestionRecord updates weak category stats from a question record
func (r *UserWeakCategoryRepository) UpdateFromQuestionRecord(userID, categoryID uint, isCorrect bool) error {
	weak, err := r.GetOrCreate(userID, categoryID)
	if err != nil {
		return err
	}

	weak.TotalCount++
	if isCorrect {
		weak.CorrectCount++
	} else {
		weak.WrongCount++
	}
	if weak.TotalCount > 0 {
		weak.CorrectRate = float64(weak.CorrectCount) * 100 / float64(weak.TotalCount)
	}
	now := time.Now()
	weak.LastPracticeAt = &now

	return r.Update(weak)
}

// GetWeakCategoryIDs gets category IDs with low correct rate for a user
func (r *UserWeakCategoryRepository) GetWeakCategoryIDs(userID uint, limit int, maxCorrectRate float64) ([]uint, error) {
	var ids []uint
	err := r.db.Model(&model.UserWeakCategory{}).
		Where("user_id = ? AND total_count >= 5 AND correct_rate < ?", userID, maxCorrectRate).
		Order("correct_rate ASC").
		Limit(limit).
		Pluck("category_id", &ids).Error
	return ids, err
}
