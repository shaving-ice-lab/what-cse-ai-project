package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// =====================================================
// UserDailyLearningStatsRepository 用户每日学习统计仓库
// =====================================================

type UserDailyLearningStatsRepository struct {
	db *gorm.DB
}

func NewUserDailyLearningStatsRepository(db *gorm.DB) *UserDailyLearningStatsRepository {
	return &UserDailyLearningStatsRepository{db: db}
}

// Create 创建每日统计记录
func (r *UserDailyLearningStatsRepository) Create(stats *model.UserDailyLearningStats) error {
	return r.db.Create(stats).Error
}

// Update 更新每日统计记录
func (r *UserDailyLearningStatsRepository) Update(stats *model.UserDailyLearningStats) error {
	return r.db.Save(stats).Error
}

// GetByUserAndDate 获取用户指定日期的统计
func (r *UserDailyLearningStatsRepository) GetByUserAndDate(userID uint, date time.Time) (*model.UserDailyLearningStats, error) {
	var stats model.UserDailyLearningStats
	err := r.db.Where("user_id = ? AND date = ?", userID, date.Format("2006-01-02")).First(&stats).Error
	if err != nil {
		return nil, err
	}
	return &stats, nil
}

// GetOrCreate 获取或创建用户指定日期的统计
func (r *UserDailyLearningStatsRepository) GetOrCreate(userID uint, date time.Time) (*model.UserDailyLearningStats, error) {
	stats, err := r.GetByUserAndDate(userID, date)
	if err == nil {
		return stats, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}
	// 创建新记录
	stats = &model.UserDailyLearningStats{
		UserID: userID,
		Date:   date,
	}
	if err := r.Create(stats); err != nil {
		return nil, err
	}
	return stats, nil
}

// GetUserDateRange 获取用户指定日期范围的统计
func (r *UserDailyLearningStatsRepository) GetUserDateRange(userID uint, startDate, endDate time.Time) ([]model.UserDailyLearningStats, error) {
	var stats []model.UserDailyLearningStats
	err := r.db.Where("user_id = ? AND date >= ? AND date <= ?", userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
		Order("date ASC").
		Find(&stats).Error
	return stats, err
}

// GetUserWeeklyStats 获取用户本周统计
func (r *UserDailyLearningStatsRepository) GetUserWeeklyStats(userID uint) ([]model.UserDailyLearningStats, error) {
	now := time.Now()
	// 计算本周开始日期（周一）
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	weekStart := now.AddDate(0, 0, -(weekday - 1))
	weekStart = time.Date(weekStart.Year(), weekStart.Month(), weekStart.Day(), 0, 0, 0, 0, now.Location())

	return r.GetUserDateRange(userID, weekStart, now)
}

// GetUserMonthlyStats 获取用户本月统计
func (r *UserDailyLearningStatsRepository) GetUserMonthlyStats(userID uint) ([]model.UserDailyLearningStats, error) {
	now := time.Now()
	monthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())
	return r.GetUserDateRange(userID, monthStart, now)
}

// GetUserTotalStats 获取用户总统计
func (r *UserDailyLearningStatsRepository) GetUserTotalStats(userID uint) (*UserTotalStats, error) {
	var result UserTotalStats
	err := r.db.Model(&model.UserDailyLearningStats{}).
		Select(`
			SUM(total_minutes) as total_minutes,
			SUM(question_count) as total_questions,
			SUM(correct_count) as total_correct,
			SUM(wrong_count) as total_wrong,
			SUM(course_completed) as total_courses,
			COUNT(DISTINCT date) as learning_days
		`).
		Where("user_id = ?", userID).
		Scan(&result).Error
	if err != nil {
		return nil, err
	}
	return &result, nil
}

// UserTotalStats 用户总统计结构
type UserTotalStats struct {
	TotalMinutes   int64 `json:"total_minutes"`
	TotalQuestions int64 `json:"total_questions"`
	TotalCorrect   int64 `json:"total_correct"`
	TotalWrong     int64 `json:"total_wrong"`
	TotalCourses   int64 `json:"total_courses"`
	LearningDays   int64 `json:"learning_days"`
}

// IncrementStats 增加统计数据
func (r *UserDailyLearningStatsRepository) IncrementStats(userID uint, date time.Time, updates map[string]interface{}) error {
	stats, err := r.GetOrCreate(userID, date)
	if err != nil {
		return err
	}

	return r.db.Model(stats).Updates(updates).Error
}

// AddLearningMinutes 增加学习时长
func (r *UserDailyLearningStatsRepository) AddLearningMinutes(userID uint, minutes int, isCourse bool) error {
	date := time.Now()
	stats, err := r.GetOrCreate(userID, date)
	if err != nil {
		return err
	}

	updates := map[string]interface{}{
		"total_minutes": gorm.Expr("total_minutes + ?", minutes),
	}
	if isCourse {
		updates["course_minutes"] = gorm.Expr("course_minutes + ?", minutes)
	} else {
		updates["question_minutes"] = gorm.Expr("question_minutes + ?", minutes)
	}

	return r.db.Model(stats).Updates(updates).Error
}

// AddQuestionResult 添加做题结果
func (r *UserDailyLearningStatsRepository) AddQuestionResult(userID uint, isCorrect bool) error {
	date := time.Now()
	stats, err := r.GetOrCreate(userID, date)
	if err != nil {
		return err
	}

	updates := map[string]interface{}{
		"question_count": gorm.Expr("question_count + 1"),
	}
	if isCorrect {
		updates["correct_count"] = gorm.Expr("correct_count + 1")
	} else {
		updates["wrong_count"] = gorm.Expr("wrong_count + 1")
	}

	return r.db.Model(stats).Updates(updates).Error
}

// =====================================================
// UserLearningGoalRepository 用户学习目标仓库
// =====================================================

type UserLearningGoalRepository struct {
	db *gorm.DB
}

func NewUserLearningGoalRepository(db *gorm.DB) *UserLearningGoalRepository {
	return &UserLearningGoalRepository{db: db}
}

// Create 创建学习目标
func (r *UserLearningGoalRepository) Create(goal *model.UserLearningGoal) error {
	return r.db.Create(goal).Error
}

// Update 更新学习目标
func (r *UserLearningGoalRepository) Update(goal *model.UserLearningGoal) error {
	return r.db.Save(goal).Error
}

// GetByUserID 获取用户学习目标
func (r *UserLearningGoalRepository) GetByUserID(userID uint) (*model.UserLearningGoal, error) {
	var goal model.UserLearningGoal
	err := r.db.Where("user_id = ?", userID).First(&goal).Error
	if err != nil {
		return nil, err
	}
	return &goal, nil
}

// GetOrCreate 获取或创建用户学习目标
func (r *UserLearningGoalRepository) GetOrCreate(userID uint) (*model.UserLearningGoal, error) {
	goal, err := r.GetByUserID(userID)
	if err == nil {
		return goal, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}
	// 创建默认目标
	goal = &model.UserLearningGoal{
		UserID:           userID,
		DailyMinutes:     60,
		DailyQuestions:   50,
		WeeklyCourseDays: 5,
	}
	if err := r.Create(goal); err != nil {
		return nil, err
	}
	return goal, nil
}

// UpdateStreak 更新连续打卡
func (r *UserLearningGoalRepository) UpdateStreak(userID uint, date time.Time) error {
	goal, err := r.GetOrCreate(userID)
	if err != nil {
		return err
	}

	today := time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location())

	// 检查是否是今天已经打卡
	if goal.LastCheckInDate != nil {
		lastCheckIn := *goal.LastCheckInDate
		lastCheckIn = time.Date(lastCheckIn.Year(), lastCheckIn.Month(), lastCheckIn.Day(), 0, 0, 0, 0, lastCheckIn.Location())
		if lastCheckIn.Equal(today) {
			return nil // 今天已打卡
		}

		// 检查是否连续
		yesterday := today.AddDate(0, 0, -1)
		if lastCheckIn.Equal(yesterday) {
			goal.ConsecutiveDays++
		} else {
			goal.ConsecutiveDays = 1
		}
	} else {
		goal.ConsecutiveDays = 1
	}

	goal.TotalLearningDays++
	goal.LastCheckInDate = &today

	// 更新最长连续天数
	if goal.ConsecutiveDays > goal.LongestStreak {
		goal.LongestStreak = goal.ConsecutiveDays
	}

	return r.Update(goal)
}

// =====================================================
// UserLearningAchievementRepository 用户学习成就仓库
// =====================================================

type UserLearningAchievementRepository struct {
	db *gorm.DB
}

func NewUserLearningAchievementRepository(db *gorm.DB) *UserLearningAchievementRepository {
	return &UserLearningAchievementRepository{db: db}
}

// Create 创建成就
func (r *UserLearningAchievementRepository) Create(achievement *model.UserLearningAchievement) error {
	return r.db.Create(achievement).Error
}

// GetByUserID 获取用户所有成就
func (r *UserLearningAchievementRepository) GetByUserID(userID uint) ([]model.UserLearningAchievement, error) {
	var achievements []model.UserLearningAchievement
	err := r.db.Where("user_id = ?", userID).
		Order("unlocked_at DESC").
		Find(&achievements).Error
	return achievements, err
}

// GetByUserAndType 获取用户指定类型的成就
func (r *UserLearningAchievementRepository) GetByUserAndType(userID uint, achievementType model.LearningAchievementType) ([]model.UserLearningAchievement, error) {
	var achievements []model.UserLearningAchievement
	err := r.db.Where("user_id = ? AND achievement_type = ?", userID, achievementType).
		Order("value DESC").
		Find(&achievements).Error
	return achievements, err
}

// HasAchievement 检查用户是否已获得某成就
func (r *UserLearningAchievementRepository) HasAchievement(userID uint, achievementID string) bool {
	var count int64
	r.db.Model(&model.UserLearningAchievement{}).
		Where("user_id = ? AND achievement_id = ?", userID, achievementID).
		Count(&count)
	return count > 0
}

// GetRecentAchievements 获取用户最近的成就
func (r *UserLearningAchievementRepository) GetRecentAchievements(userID uint, limit int) ([]model.UserLearningAchievement, error) {
	var achievements []model.UserLearningAchievement
	err := r.db.Where("user_id = ?", userID).
		Order("unlocked_at DESC").
		Limit(limit).
		Find(&achievements).Error
	return achievements, err
}

// GetUserAchievementsInDateRange 获取用户指定日期范围内的成就
func (r *UserLearningAchievementRepository) GetUserAchievementsInDateRange(userID uint, startDate, endDate time.Time) ([]model.UserLearningAchievement, error) {
	var achievements []model.UserLearningAchievement
	err := r.db.Where("user_id = ? AND unlocked_at >= ? AND unlocked_at <= ?", userID, startDate, endDate).
		Order("unlocked_at DESC").
		Find(&achievements).Error
	return achievements, err
}

// =====================================================
// LearningLeaderboardRepository 学习排行榜仓库
// =====================================================

type LearningLeaderboardRepository struct {
	db *gorm.DB
}

func NewLearningLeaderboardRepository(db *gorm.DB) *LearningLeaderboardRepository {
	return &LearningLeaderboardRepository{db: db}
}

// Create 创建排行榜记录
func (r *LearningLeaderboardRepository) Create(leaderboard *model.LearningLeaderboard) error {
	return r.db.Create(leaderboard).Error
}

// Update 更新排行榜
func (r *LearningLeaderboardRepository) Update(leaderboard *model.LearningLeaderboard) error {
	return r.db.Save(leaderboard).Error
}

// GetOrCreate 获取或创建排行榜
func (r *LearningLeaderboardRepository) GetOrCreate(leaderboardType model.LeaderboardType, metric model.LeaderboardMetric, date time.Time) (*model.LearningLeaderboard, error) {
	var leaderboard model.LearningLeaderboard
	dateStr := date.Format("2006-01-02")
	err := r.db.Where("leaderboard_type = ? AND metric = ? AND date = ?", leaderboardType, metric, dateStr).First(&leaderboard).Error
	if err == nil {
		return &leaderboard, nil
	}
	if err != gorm.ErrRecordNotFound {
		return nil, err
	}
	// 创建新记录
	leaderboard = model.LearningLeaderboard{
		LeaderboardType: leaderboardType,
		Metric:          metric,
		Date:            date,
		Data:            []model.LeaderboardEntry{},
	}
	if err := r.Create(&leaderboard); err != nil {
		return nil, err
	}
	return &leaderboard, nil
}

// GetLeaderboard 获取排行榜
func (r *LearningLeaderboardRepository) GetLeaderboard(leaderboardType model.LeaderboardType, metric model.LeaderboardMetric, date time.Time) (*model.LearningLeaderboard, error) {
	var leaderboard model.LearningLeaderboard
	dateStr := date.Format("2006-01-02")
	err := r.db.Where("leaderboard_type = ? AND metric = ? AND date = ?", leaderboardType, metric, dateStr).First(&leaderboard).Error
	if err != nil {
		return nil, err
	}
	return &leaderboard, nil
}

// =====================================================
// 聚合查询方法
// =====================================================

// GetDailyLeaderboard 计算每日排行榜数据
func (r *UserDailyLearningStatsRepository) GetDailyLeaderboard(date time.Time, metric model.LeaderboardMetric, limit int) ([]model.LeaderboardEntry, error) {
	var entries []model.LeaderboardEntry
	dateStr := date.Format("2006-01-02")

	var orderField string
	var valueUnit string
	switch metric {
	case model.MetricStudyTime:
		orderField = "total_minutes"
		valueUnit = "分钟"
	case model.MetricQuestionCount:
		orderField = "question_count"
		valueUnit = "题"
	default:
		orderField = "total_minutes"
		valueUnit = "分钟"
	}

	query := r.db.Model(&model.UserDailyLearningStats{}).
		Select(`
			what_user_daily_learning_stats.user_id,
			what_users.username,
			what_users.avatar,
			what_user_daily_learning_stats.`+orderField+` as value
		`).
		Joins("LEFT JOIN what_users ON what_users.id = what_user_daily_learning_stats.user_id").
		Where("what_user_daily_learning_stats.date = ?", dateStr).
		Order(orderField + " DESC").
		Limit(limit)

	rows, err := query.Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rank := 0
	for rows.Next() {
		rank++
		var entry model.LeaderboardEntry
		if err := rows.Scan(&entry.UserID, &entry.Username, &entry.Avatar, &entry.Value); err != nil {
			continue
		}
		entry.Rank = rank
		entry.ValueUnit = valueUnit
		entries = append(entries, entry)
	}

	return entries, nil
}

// GetWeeklyLeaderboard 计算每周排行榜数据
func (r *UserDailyLearningStatsRepository) GetWeeklyLeaderboard(weekStart time.Time, metric model.LeaderboardMetric, limit int) ([]model.LeaderboardEntry, error) {
	var entries []model.LeaderboardEntry
	weekEnd := weekStart.AddDate(0, 0, 6)

	var orderField string
	var valueUnit string
	switch metric {
	case model.MetricStudyTime:
		orderField = "total_minutes"
		valueUnit = "分钟"
	case model.MetricQuestionCount:
		orderField = "question_count"
		valueUnit = "题"
	default:
		orderField = "total_minutes"
		valueUnit = "分钟"
	}

	query := r.db.Model(&model.UserDailyLearningStats{}).
		Select(`
			what_user_daily_learning_stats.user_id,
			what_users.username,
			what_users.avatar,
			SUM(what_user_daily_learning_stats.`+orderField+`) as value
		`).
		Joins("LEFT JOIN what_users ON what_users.id = what_user_daily_learning_stats.user_id").
		Where("what_user_daily_learning_stats.date >= ? AND what_user_daily_learning_stats.date <= ?", weekStart.Format("2006-01-02"), weekEnd.Format("2006-01-02")).
		Group("what_user_daily_learning_stats.user_id").
		Order("value DESC").
		Limit(limit)

	rows, err := query.Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rank := 0
	for rows.Next() {
		rank++
		var entry model.LeaderboardEntry
		if err := rows.Scan(&entry.UserID, &entry.Username, &entry.Avatar, &entry.Value); err != nil {
			continue
		}
		entry.Rank = rank
		entry.ValueUnit = valueUnit
		entries = append(entries, entry)
	}

	return entries, nil
}

// GetConsecutiveDaysLeaderboard 计算连续打卡排行榜
func (r *UserLearningGoalRepository) GetConsecutiveDaysLeaderboard(limit int) ([]model.LeaderboardEntry, error) {
	var entries []model.LeaderboardEntry

	query := r.db.Model(&model.UserLearningGoal{}).
		Select(`
			what_user_learning_goals.user_id,
			what_users.username,
			what_users.avatar,
			what_user_learning_goals.consecutive_days as value
		`).
		Joins("LEFT JOIN what_users ON what_users.id = what_user_learning_goals.user_id").
		Where("what_user_learning_goals.consecutive_days > 0").
		Order("consecutive_days DESC").
		Limit(limit)

	rows, err := query.Rows()
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	rank := 0
	for rows.Next() {
		rank++
		var entry model.LeaderboardEntry
		if err := rows.Scan(&entry.UserID, &entry.Username, &entry.Avatar, &entry.Value); err != nil {
			continue
		}
		entry.Rank = rank
		entry.ValueUnit = "天"
		entries = append(entries, entry)
	}

	return entries, nil
}

// GetUserRank 获取用户在排行榜中的排名
func (r *UserDailyLearningStatsRepository) GetUserRank(userID uint, date time.Time, metric model.LeaderboardMetric) (int, float64, error) {
	dateStr := date.Format("2006-01-02")
	var orderField string
	switch metric {
	case model.MetricStudyTime:
		orderField = "total_minutes"
	case model.MetricQuestionCount:
		orderField = "question_count"
	default:
		orderField = "total_minutes"
	}

	// 获取用户的值
	var userValue float64
	err := r.db.Model(&model.UserDailyLearningStats{}).
		Select(orderField).
		Where("user_id = ? AND date = ?", userID, dateStr).
		Scan(&userValue).Error
	if err != nil {
		return 0, 0, err
	}

	// 计算排名
	var rank int64
	err = r.db.Model(&model.UserDailyLearningStats{}).
		Where("date = ? AND "+orderField+" > ?", dateStr, userValue).
		Count(&rank).Error
	if err != nil {
		return 0, 0, err
	}

	return int(rank + 1), userValue, nil
}

// GetTotalUsersForDate 获取指定日期学习的总用户数
func (r *UserDailyLearningStatsRepository) GetTotalUsersForDate(date time.Time) (int, error) {
	var count int64
	dateStr := date.Format("2006-01-02")
	err := r.db.Model(&model.UserDailyLearningStats{}).
		Where("date = ? AND total_minutes > 0", dateStr).
		Count(&count).Error
	return int(count), err
}
