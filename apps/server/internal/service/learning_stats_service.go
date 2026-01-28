package service

import (
	"errors"
	"fmt"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrLearningGoalNotFound  = errors.New("学习目标不存在")
	ErrLearningStatsNotFound = errors.New("学习统计不存在")
)

// LearningStatsService 学习统计服务
type LearningStatsService struct {
	dailyStatsRepo     *repository.UserDailyLearningStatsRepository
	goalRepo           *repository.UserLearningGoalRepository
	achievementRepo    *repository.UserLearningAchievementRepository
	leaderboardRepo    *repository.LearningLeaderboardRepository
	questionRecordRepo *repository.UserQuestionRecordRepository
	courseProgressRepo *repository.UserCourseProgressRepository
}

// NewLearningStatsService 创建学习统计服务
func NewLearningStatsService(
	dailyStatsRepo *repository.UserDailyLearningStatsRepository,
	goalRepo *repository.UserLearningGoalRepository,
	achievementRepo *repository.UserLearningAchievementRepository,
	leaderboardRepo *repository.LearningLeaderboardRepository,
	questionRecordRepo *repository.UserQuestionRecordRepository,
	courseProgressRepo *repository.UserCourseProgressRepository,
) *LearningStatsService {
	return &LearningStatsService{
		dailyStatsRepo:     dailyStatsRepo,
		goalRepo:           goalRepo,
		achievementRepo:    achievementRepo,
		leaderboardRepo:    leaderboardRepo,
		questionRecordRepo: questionRecordRepo,
		courseProgressRepo: courseProgressRepo,
	}
}

// =====================================================
// 每日学习报告
// =====================================================

// GetDailyReport 获取每日学习报告
func (s *LearningStatsService) GetDailyReport(userID uint, date time.Time) (*model.DailyLearningReportResponse, error) {
	dateStr := date.Format("2006-01-02")

	// 获取当天统计
	todayStats, err := s.dailyStatsRepo.GetByUserAndDate(userID, date)
	if err != nil {
		// 如果没有记录，返回空报告
		todayStats = &model.UserDailyLearningStats{}
	}

	// 计算正确率
	var correctRate float64
	if todayStats.QuestionCount > 0 {
		correctRate = float64(todayStats.CorrectCount) / float64(todayStats.QuestionCount) * 100
	}

	// 构建概览
	overview := model.DailyOverview{
		TotalMinutes:     todayStats.TotalMinutes,
		QuestionCount:    todayStats.QuestionCount,
		CorrectRate:      correctRate,
		CourseCompleted:  todayStats.CourseCompleted,
		ChapterCompleted: todayStats.ChapterCompleted,
	}

	// 获取科目分布
	subjectBreakdown := s.getSubjectBreakdown(todayStats)

	// 获取昨日对比
	yesterday := date.AddDate(0, 0, -1)
	yesterdayStats, _ := s.dailyStatsRepo.GetByUserAndDate(userID, yesterday)
	var comparisonWithYesterday *model.LearningComparison
	if yesterdayStats != nil {
		var yesterdayRate float64
		if yesterdayStats.QuestionCount > 0 {
			yesterdayRate = float64(yesterdayStats.CorrectCount) / float64(yesterdayStats.QuestionCount) * 100
		}
		comparisonWithYesterday = &model.LearningComparison{
			TotalMinutesChange:  todayStats.TotalMinutes - yesterdayStats.TotalMinutes,
			QuestionCountChange: todayStats.QuestionCount - yesterdayStats.QuestionCount,
			CorrectRateChange:   correctRate - yesterdayRate,
		}
	}

	// 获取目标对比
	goal, _ := s.goalRepo.GetByUserID(userID)
	var comparisonWithGoal *model.GoalComparison
	if goal != nil {
		minutesPercent := float64(todayStats.TotalMinutes) / float64(goal.DailyMinutes) * 100
		questionsPercent := float64(todayStats.QuestionCount) / float64(goal.DailyQuestions) * 100
		comparisonWithGoal = &model.GoalComparison{
			MinutesGoal:      goal.DailyMinutes,
			MinutesActual:    todayStats.TotalMinutes,
			MinutesPercent:   minutesPercent,
			QuestionsGoal:    goal.DailyQuestions,
			QuestionsActual:  todayStats.QuestionCount,
			QuestionsPercent: questionsPercent,
			IsGoalAchieved:   minutesPercent >= 100 && questionsPercent >= 100,
		}
	}

	// 获取当日成就
	achievements, _ := s.achievementRepo.GetUserAchievementsInDateRange(
		userID,
		time.Date(date.Year(), date.Month(), date.Day(), 0, 0, 0, 0, date.Location()),
		time.Date(date.Year(), date.Month(), date.Day(), 23, 59, 59, 0, date.Location()),
	)

	return &model.DailyLearningReportResponse{
		Date:                    dateStr,
		Overview:                overview,
		SubjectBreakdown:        subjectBreakdown,
		ComparisonWithYesterday: comparisonWithYesterday,
		ComparisonWithGoal:      comparisonWithGoal,
		Achievements:            achievements,
	}, nil
}

// getSubjectBreakdown 获取科目分布
func (s *LearningStatsService) getSubjectBreakdown(stats *model.UserDailyLearningStats) []model.SubjectLearningStats {
	if stats == nil || stats.SubjectStats == nil {
		return []model.SubjectLearningStats{}
	}

	result := make([]model.SubjectLearningStats, 0, len(stats.SubjectStats))
	for subject, stat := range stats.SubjectStats {
		stat.Subject = subject
		result = append(result, stat)
	}
	return result
}

// =====================================================
// 每周学习报告
// =====================================================

// GetWeeklyReport 获取每周学习报告
func (s *LearningStatsService) GetWeeklyReport(userID uint, weekStart time.Time) (*model.WeeklyLearningReportResponse, error) {
	weekEnd := weekStart.AddDate(0, 0, 6)

	// 获取本周统计数据
	weeklyStats, err := s.dailyStatsRepo.GetUserDateRange(userID, weekStart, weekEnd)
	if err != nil {
		return nil, err
	}

	// 计算概览
	var totalMinutes, totalQuestions, totalCorrect, totalWrong, courseCompleted int
	learningDays := 0

	for _, stat := range weeklyStats {
		totalMinutes += stat.TotalMinutes
		totalQuestions += stat.QuestionCount
		totalCorrect += stat.CorrectCount
		totalWrong += stat.WrongCount
		courseCompleted += stat.CourseCompleted
		if stat.TotalMinutes > 0 {
			learningDays++
		}
	}

	avgDailyMinutes := 0
	if learningDays > 0 {
		avgDailyMinutes = totalMinutes / learningDays
	}

	var avgCorrectRate float64
	if totalQuestions > 0 {
		avgCorrectRate = float64(totalCorrect) / float64(totalQuestions) * 100
	}

	overview := model.WeeklyOverview{
		TotalMinutes:    totalMinutes,
		TotalQuestions:  totalQuestions,
		AvgDailyMinutes: avgDailyMinutes,
		AvgCorrectRate:  avgCorrectRate,
		LearningDays:    learningDays,
		CourseCompleted: courseCompleted,
	}

	// 获取学习目标
	goal, _ := s.goalRepo.GetByUserID(userID)

	// 构建每日趋势
	dailyTrend := s.buildDailyTrend(weekStart, weeklyStats, goal)

	// 获取科目分布汇总
	subjectBreakdown := s.aggregateSubjectStats(weeklyStats)

	// 获取本周成就
	achievementSummary := s.getAchievementSummary(userID, weekStart, weekEnd)

	// 获取连续天数
	consecutiveDays := 0
	if goal != nil {
		consecutiveDays = goal.ConsecutiveDays
	}

	return &model.WeeklyLearningReportResponse{
		WeekStart:        weekStart.Format("2006-01-02"),
		WeekEnd:          weekEnd.Format("2006-01-02"),
		Overview:         overview,
		DailyTrend:       dailyTrend,
		SubjectBreakdown: subjectBreakdown,
		KnowledgePoints:  model.KnowledgeAnalysis{}, // 需要从做题记录中分析
		Achievements:     achievementSummary,
		ConsecutiveDays:  consecutiveDays,
	}, nil
}

// buildDailyTrend 构建每日趋势
func (s *LearningStatsService) buildDailyTrend(weekStart time.Time, stats []model.UserDailyLearningStats, goal *model.UserLearningGoal) []model.DailyTrendItem {
	weekDays := []string{"周一", "周二", "周三", "周四", "周五", "周六", "周日"}
	trend := make([]model.DailyTrendItem, 7)

	// 创建日期到统计的映射
	statsMap := make(map[string]*model.UserDailyLearningStats)
	for i := range stats {
		dateStr := stats[i].Date.Format("2006-01-02")
		statsMap[dateStr] = &stats[i]
	}

	for i := 0; i < 7; i++ {
		date := weekStart.AddDate(0, 0, i)
		dateStr := date.Format("2006-01-02")

		item := model.DailyTrendItem{
			Date:      dateStr,
			DayOfWeek: weekDays[i],
		}

		if stat, ok := statsMap[dateStr]; ok {
			item.Minutes = stat.TotalMinutes
			item.QuestionCount = stat.QuestionCount
			if stat.QuestionCount > 0 {
				item.CorrectRate = float64(stat.CorrectCount) / float64(stat.QuestionCount) * 100
			}
			if goal != nil {
				item.IsGoalAchieved = stat.TotalMinutes >= goal.DailyMinutes && stat.QuestionCount >= goal.DailyQuestions
			}
		}

		trend[i] = item
	}

	return trend
}

// aggregateSubjectStats 汇总科目统计
func (s *LearningStatsService) aggregateSubjectStats(stats []model.UserDailyLearningStats) []model.SubjectLearningStats {
	subjectMap := make(map[string]*model.SubjectLearningStats)

	for _, stat := range stats {
		if stat.SubjectStats == nil {
			continue
		}
		for subject, subjectStat := range stat.SubjectStats {
			if existing, ok := subjectMap[subject]; ok {
				existing.Minutes += subjectStat.Minutes
				existing.QuestionCount += subjectStat.QuestionCount
				existing.CorrectCount += subjectStat.CorrectCount
				existing.CourseCompleted += subjectStat.CourseCompleted
			} else {
				copied := subjectStat
				copied.Subject = subject
				subjectMap[subject] = &copied
			}
		}
	}

	result := make([]model.SubjectLearningStats, 0, len(subjectMap))
	for _, stat := range subjectMap {
		if stat.QuestionCount > 0 {
			stat.CorrectRate = float64(stat.CorrectCount) / float64(stat.QuestionCount) * 100
		}
		result = append(result, *stat)
	}

	return result
}

// getAchievementSummary 获取成就摘要
func (s *LearningStatsService) getAchievementSummary(userID uint, startDate, endDate time.Time) []model.AchievementSummary {
	achievements, _ := s.achievementRepo.GetUserAchievementsInDateRange(userID, startDate, endDate)

	summary := make([]model.AchievementSummary, len(achievements))
	for i, a := range achievements {
		summary[i] = model.AchievementSummary{
			Title:       a.Title,
			Description: a.Description,
			Icon:        a.Icon,
			UnlockedAt:  a.UnlockedAt.Format("2006-01-02 15:04"),
		}
	}
	return summary
}

// =====================================================
// 能力分析报告
// =====================================================

// GetAbilityReport 获取能力分析报告
func (s *LearningStatsService) GetAbilityReport(userID uint) (*model.AbilityReportResponse, error) {
	// 获取用户总统计
	totalStats, err := s.dailyStatsRepo.GetUserTotalStats(userID)
	if err != nil {
		return nil, err
	}

	// 计算综合能力分
	overallScore := s.calculateOverallScore(totalStats)

	// 各科目能力
	subjectScores := s.calculateSubjectAbility(userID)

	// 雷达图数据
	radarData := s.buildRadarData(subjectScores)

	// 进步曲线（最近30天）
	progressCurve := s.buildProgressCurve(userID, 30)

	// 预测分数
	predictedScore := s.calculatePredictedScore(overallScore, totalStats)

	// 与平均水平对比
	comparisonWithAvg := s.calculateAvgComparison(userID, overallScore, totalStats)

	return &model.AbilityReportResponse{
		OverallScore:      overallScore,
		SubjectScores:     subjectScores,
		RadarData:         radarData,
		KnowledgeMastery:  []model.KnowledgeMastery{}, // 需要从做题记录中分析
		QuestionTypeStats: []model.QuestionTypeStat{}, // 需要从做题记录中分析
		ProgressCurve:     progressCurve,
		PredictedScore:    predictedScore,
		ComparisonWithAvg: comparisonWithAvg,
	}, nil
}

// calculateOverallScore 计算综合能力分
func (s *LearningStatsService) calculateOverallScore(stats *repository.UserTotalStats) float64 {
	if stats == nil {
		return 0
	}

	// 基于正确率和做题量计算
	var correctRate float64
	if stats.TotalQuestions > 0 {
		correctRate = float64(stats.TotalCorrect) / float64(stats.TotalQuestions)
	}

	// 做题量加权
	volumeWeight := 1.0
	if stats.TotalQuestions >= 1000 {
		volumeWeight = 1.2
	} else if stats.TotalQuestions >= 500 {
		volumeWeight = 1.1
	} else if stats.TotalQuestions < 100 {
		volumeWeight = 0.8
	}

	return correctRate * 100 * volumeWeight
}

// calculateSubjectAbility 计算各科目能力
func (s *LearningStatsService) calculateSubjectAbility(userID uint) []model.SubjectAbility {
	subjects := []struct {
		Code string
		Name string
	}{
		{"xingce", "行测"},
		{"shenlun", "申论"},
		{"mianshi", "面试"},
		{"gongji", "公基"},
	}

	abilities := make([]model.SubjectAbility, len(subjects))
	for i, sub := range subjects {
		abilities[i] = model.SubjectAbility{
			Subject:        sub.Code,
			SubjectName:    sub.Name,
			Score:          0,
			CorrectRate:    0,
			TotalQuestions: 0,
			Rank:           "E",
			Trend:          "stable",
		}
	}

	return abilities
}

// buildRadarData 构建雷达图数据
func (s *LearningStatsService) buildRadarData(subjectScores []model.SubjectAbility) []model.RadarDataPoint {
	dimensions := []string{"行测", "申论", "面试", "公基", "学习时长", "做题量"}
	radarData := make([]model.RadarDataPoint, len(dimensions))

	for i, dim := range dimensions {
		value := 0.0
		// 根据科目匹配
		for _, score := range subjectScores {
			if score.SubjectName == dim {
				value = score.Score
				break
			}
		}
		radarData[i] = model.RadarDataPoint{
			Dimension: dim,
			Value:     value,
			FullMark:  100,
		}
	}

	return radarData
}

// buildProgressCurve 构建进步曲线
func (s *LearningStatsService) buildProgressCurve(userID uint, days int) []model.ProgressPoint {
	now := time.Now()
	startDate := now.AddDate(0, 0, -days)

	stats, _ := s.dailyStatsRepo.GetUserDateRange(userID, startDate, now)

	curve := make([]model.ProgressPoint, len(stats))
	for i, stat := range stats {
		var correctRate float64
		if stat.QuestionCount > 0 {
			correctRate = float64(stat.CorrectCount) / float64(stat.QuestionCount) * 100
		}
		curve[i] = model.ProgressPoint{
			Date:        stat.Date.Format("2006-01-02"),
			Score:       correctRate, // 简化：使用正确率作为能力分
			CorrectRate: correctRate,
		}
	}

	return curve
}

// calculatePredictedScore 计算预测分数
func (s *LearningStatsService) calculatePredictedScore(overallScore float64, stats *repository.UserTotalStats) *model.PredictedScore {
	if stats == nil || stats.TotalQuestions < 100 {
		return nil // 做题量不足，不给预测
	}

	// 基于能力分预测分数区间
	baseScore := overallScore * 0.8 // 假设满分100，能力分转换

	return &model.PredictedScore{
		MinScore:    baseScore - 10,
		MaxScore:    baseScore + 10,
		MostLikely:  baseScore,
		Confidence:  0.7,
		LastUpdated: time.Now().Format("2006-01-02"),
	}
}

// calculateAvgComparison 计算与平均水平对比
func (s *LearningStatsService) calculateAvgComparison(userID uint, overallScore float64, stats *repository.UserTotalStats) *model.AvgComparison {
	// 简化实现：假设平均值
	avgOverall := 60.0
	avgStudyTime := 30.0 // 分钟/天
	avgCorrectRate := 60.0

	userAvgStudyTime := 0.0
	userCorrectRate := 0.0
	if stats != nil && stats.LearningDays > 0 {
		userAvgStudyTime = float64(stats.TotalMinutes) / float64(stats.LearningDays)
		if stats.TotalQuestions > 0 {
			userCorrectRate = float64(stats.TotalCorrect) / float64(stats.TotalQuestions) * 100
		}
	}

	return &model.AvgComparison{
		OverallVsAvg:     overallScore - avgOverall,
		StudyTimeVsAvg:   userAvgStudyTime - avgStudyTime,
		CorrectRateVsAvg: userCorrectRate - avgCorrectRate,
		Percentile:       int(overallScore), // 简化：使用能力分作为百分位
	}
}

// =====================================================
// 排行榜
// =====================================================

// GetLeaderboard 获取排行榜
func (s *LearningStatsService) GetLeaderboard(userID uint, leaderboardType model.LeaderboardType, metric model.LeaderboardMetric) (*model.LeaderboardResponse, error) {
	now := time.Now()
	var date time.Time
	var entries []model.LeaderboardEntry
	var err error

	switch leaderboardType {
	case model.LeaderboardDaily:
		date = now
		entries, err = s.dailyStatsRepo.GetDailyLeaderboard(date, metric, 100)
	case model.LeaderboardWeekly:
		// 计算本周开始
		weekday := int(now.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		date = now.AddDate(0, 0, -(weekday - 1))
		entries, err = s.dailyStatsRepo.GetWeeklyLeaderboard(date, metric, 100)
	default:
		return nil, errors.New("不支持的排行榜类型")
	}

	if err != nil {
		return nil, err
	}

	// 获取用户排名
	var myRank *model.LeaderboardEntry
	rank, value, err := s.dailyStatsRepo.GetUserRank(userID, now, metric)
	if err == nil {
		valueUnit := "分钟"
		if metric == model.MetricQuestionCount {
			valueUnit = "题"
		}
		myRank = &model.LeaderboardEntry{
			Rank:      rank,
			UserID:    userID,
			Value:     value,
			ValueUnit: valueUnit,
		}
	}

	// 获取总用户数
	totalUsers, _ := s.dailyStatsRepo.GetTotalUsersForDate(now)

	return &model.LeaderboardResponse{
		Type:       leaderboardType,
		Metric:     metric,
		Date:       date.Format("2006-01-02"),
		Entries:    entries,
		MyRank:     myRank,
		TotalUsers: totalUsers,
	}, nil
}

// GetConsecutiveLeaderboard 获取连续打卡排行榜
func (s *LearningStatsService) GetConsecutiveLeaderboard(userID uint) (*model.LeaderboardResponse, error) {
	entries, err := s.goalRepo.GetConsecutiveDaysLeaderboard(100)
	if err != nil {
		return nil, err
	}

	// 获取用户连续天数
	var myRank *model.LeaderboardEntry
	goal, _ := s.goalRepo.GetByUserID(userID)
	if goal != nil {
		// 找到用户排名
		for _, entry := range entries {
			if entry.UserID == userID {
				myRank = &entry
				break
			}
		}
		if myRank == nil {
			myRank = &model.LeaderboardEntry{
				UserID:    userID,
				Value:     float64(goal.ConsecutiveDays),
				ValueUnit: "天",
			}
		}
	}

	return &model.LeaderboardResponse{
		Type:    model.LeaderboardAllTime,
		Metric:  model.MetricConsecutive,
		Date:    time.Now().Format("2006-01-02"),
		Entries: entries,
		MyRank:  myRank,
	}, nil
}

// =====================================================
// 学习目标
// =====================================================

// GetUserGoal 获取用户学习目标
func (s *LearningStatsService) GetUserGoal(userID uint) (*model.UserLearningGoal, error) {
	return s.goalRepo.GetOrCreate(userID)
}

// UpdateUserGoal 更新用户学习目标
func (s *LearningStatsService) UpdateUserGoal(userID uint, dailyMinutes, dailyQuestions, weeklyDays int, targetDate *time.Time, targetScore float64) error {
	goal, err := s.goalRepo.GetOrCreate(userID)
	if err != nil {
		return err
	}

	if dailyMinutes > 0 {
		goal.DailyMinutes = dailyMinutes
	}
	if dailyQuestions > 0 {
		goal.DailyQuestions = dailyQuestions
	}
	if weeklyDays > 0 {
		goal.WeeklyCourseDays = weeklyDays
	}
	if targetDate != nil {
		goal.TargetExamDate = targetDate
	}
	if targetScore > 0 {
		goal.TargetScore = targetScore
	}

	return s.goalRepo.Update(goal)
}

// =====================================================
// 学习记录
// =====================================================

// RecordLearning 记录学习
func (s *LearningStatsService) RecordLearning(userID uint, minutes int, isCourse bool, subject string) error {
	// 更新每日统计
	if err := s.dailyStatsRepo.AddLearningMinutes(userID, minutes, isCourse); err != nil {
		return err
	}

	// 更新打卡记录
	return s.goalRepo.UpdateStreak(userID, time.Now())
}

// RecordQuestionResult 记录做题结果
func (s *LearningStatsService) RecordQuestionResult(userID uint, isCorrect bool, subject string) error {
	// 更新每日统计
	if err := s.dailyStatsRepo.AddQuestionResult(userID, isCorrect); err != nil {
		return err
	}

	// 检查并颁发成就
	s.checkAndGrantAchievements(userID)

	return nil
}

// checkAndGrantAchievements 检查并颁发成就
func (s *LearningStatsService) checkAndGrantAchievements(userID uint) {
	goal, _ := s.goalRepo.GetByUserID(userID)
	if goal == nil {
		return
	}

	// 连续打卡成就
	streakMilestones := []int{7, 14, 30, 60, 100, 365}
	for _, milestone := range streakMilestones {
		if goal.ConsecutiveDays >= milestone {
			achievementID := fmt.Sprintf("streak_%d", milestone)
			if !s.achievementRepo.HasAchievement(userID, achievementID) {
				achievement := &model.UserLearningAchievement{
					UserID:          userID,
					AchievementType: model.AchievementConsecutiveDays,
					AchievementID:   achievementID,
					Title:           fmt.Sprintf("连续学习%d天", milestone),
					Description:     fmt.Sprintf("恭喜你连续学习%d天！坚持就是胜利！", milestone),
					Icon:            "🔥",
					Value:           milestone,
					UnlockedAt:      time.Now(),
				}
				s.achievementRepo.Create(achievement)
			}
		}
	}
}

// GetUserAchievements 获取用户成就列表
func (s *LearningStatsService) GetUserAchievements(userID uint) ([]model.UserLearningAchievement, error) {
	return s.achievementRepo.GetByUserID(userID)
}

// GetUserStats 获取用户学习统计概览
func (s *LearningStatsService) GetUserStats(userID uint) (*UserLearningOverview, error) {
	totalStats, _ := s.dailyStatsRepo.GetUserTotalStats(userID)
	goal, _ := s.goalRepo.GetOrCreate(userID)
	todayStats, _ := s.dailyStatsRepo.GetByUserAndDate(userID, time.Now())

	var totalCorrectRate float64
	if totalStats != nil && totalStats.TotalQuestions > 0 {
		totalCorrectRate = float64(totalStats.TotalCorrect) / float64(totalStats.TotalQuestions) * 100
	}

	var todayMinutes, todayQuestions int
	if todayStats != nil {
		todayMinutes = todayStats.TotalMinutes
		todayQuestions = todayStats.QuestionCount
	}

	return &UserLearningOverview{
		TotalMinutes:       int(totalStats.TotalMinutes),
		TotalQuestions:     int(totalStats.TotalQuestions),
		TotalCorrectRate:   totalCorrectRate,
		LearningDays:       int(totalStats.LearningDays),
		ConsecutiveDays:    goal.ConsecutiveDays,
		TodayMinutes:       todayMinutes,
		TodayQuestions:     todayQuestions,
		DailyGoalMinutes:   goal.DailyMinutes,
		DailyGoalQuestions: goal.DailyQuestions,
	}, nil
}

// UserLearningOverview 用户学习概览
type UserLearningOverview struct {
	TotalMinutes       int     `json:"total_minutes"`
	TotalQuestions     int     `json:"total_questions"`
	TotalCorrectRate   float64 `json:"total_correct_rate"`
	LearningDays       int     `json:"learning_days"`
	ConsecutiveDays    int     `json:"consecutive_days"`
	TodayMinutes       int     `json:"today_minutes"`
	TodayQuestions     int     `json:"today_questions"`
	DailyGoalMinutes   int     `json:"daily_goal_minutes"`
	DailyGoalQuestions int     `json:"daily_goal_questions"`
}

// =====================================================
// AI 能力分析报告增强
// =====================================================

// GetAIAbilityReport 获取增强版能力分析报告（包含AI分析）
func (s *LearningStatsService) GetAIAbilityReport(userID uint) (*model.AIAbilityReportResponse, error) {
	// 先获取基础能力报告
	baseReport, err := s.GetAbilityReport(userID)
	if err != nil {
		return nil, err
	}

	// 生成AI分析内容
	aiAnalysis := s.generateAIAbilityAnalysis(userID, baseReport)

	return &model.AIAbilityReportResponse{
		AbilityReportResponse: *baseReport,
		AIAnalysis:            aiAnalysis,
	}, nil
}

// generateAIAbilityAnalysis 生成AI能力分析
func (s *LearningStatsService) generateAIAbilityAnalysis(userID uint, report *model.AbilityReportResponse) *model.AIAbilityAnalysis {
	// 生成雷达图解读
	radarInterpretation := s.generateRadarInterpretation(report)

	// 生成对标分析
	comparisonAnalysis := s.generateComparisonAnalysis(userID, report)

	// 生成提升建议
	improvementPlan := s.generateImprovementPlan(report)

	return &model.AIAbilityAnalysis{
		RadarInterpretation: radarInterpretation,
		ComparisonAnalysis:  comparisonAnalysis,
		ImprovementPlan:     improvementPlan,
		GeneratedAt:         time.Now().Format("2006-01-02 15:04:05"),
	}
}

// generateRadarInterpretation 生成雷达图解读
func (s *LearningStatsService) generateRadarInterpretation(report *model.AbilityReportResponse) *model.RadarInterpretation {
	dimensionAnalysis := make([]model.DimensionAnalysis, 0)

	// 分析各维度
	var maxScore, minScore float64 = 0, 100
	var maxDim, minDim string

	for _, radar := range report.RadarData {
		level, desc, tips := getDimensionLevelAndDesc(radar.Value)
		dimensionAnalysis = append(dimensionAnalysis, model.DimensionAnalysis{
			Dimension:   radar.Dimension,
			Score:       int(radar.Value),
			Level:       level,
			Description: desc,
			Tips:        tips,
		})

		if radar.Value > maxScore {
			maxScore = radar.Value
			maxDim = radar.Dimension
		}
		if radar.Value < minScore {
			minScore = radar.Value
			minDim = radar.Dimension
		}
	}

	// 生成优势和劣势分析
	strengthAnalysis := fmt.Sprintf("您在「%s」方面表现突出，得分%.0f分，处于优秀水平。这是您的核心竞争优势，建议保持并继续深化。", maxDim, maxScore)
	weaknessAnalysis := fmt.Sprintf("「%s」是您目前最需要提升的领域，当前得分%.0f分。建议增加该领域的专项练习时间，每天至少投入30分钟进行针对性训练。", minDim, minScore)

	// 生成综合评价
	overallSummary := generateOverallSummary(report.OverallScore, maxDim, minDim)

	return &model.RadarInterpretation{
		DimensionAnalysis: dimensionAnalysis,
		StrengthAnalysis:  strengthAnalysis,
		WeaknessAnalysis:  weaknessAnalysis,
		OverallSummary:    overallSummary,
	}
}

// getDimensionLevelAndDesc 获取维度等级和描述
func getDimensionLevelAndDesc(score float64) (level, desc, tips string) {
	switch {
	case score >= 85:
		level = "优秀"
		desc = "该能力已达到优秀水平，在同类考生中处于领先位置。"
		tips = "保持现有水平，可适当减少基础练习，专注难题突破。"
	case score >= 70:
		level = "良好"
		desc = "该能力处于良好水平，已掌握核心要点，仍有提升空间。"
		tips = "巩固基础的同时，增加中高难度题目的练习比例。"
	case score >= 55:
		level = "中等"
		desc = "该能力处于中等水平，基础知识较为扎实，需加强应用能力。"
		tips = "建议系统复习知识点，多做题总结规律和技巧。"
	default:
		level = "待提升"
		desc = "该能力有较大提升空间，需要重点关注和加强练习。"
		tips = "从基础开始，每天安排专项练习，逐步提升。"
	}
	return
}

// generateOverallSummary 生成综合评价
func generateOverallSummary(overallScore float64, maxDim, minDim string) string {
	var levelDesc string
	switch {
	case overallScore >= 80:
		levelDesc = "您的综合能力优秀，整体学习状态良好"
	case overallScore >= 65:
		levelDesc = "您的综合能力良好，具备扎实的知识基础"
	case overallScore >= 50:
		levelDesc = "您的综合能力处于中等水平，有较大进步空间"
	default:
		levelDesc = "您目前处于备考初期，需要系统性学习"
	}

	return fmt.Sprintf("%s。优势科目「%s」可以作为得分保障，同时重点攻克「%s」薄弱环节，实现整体能力的均衡发展。建议制定合理的学习计划，科学分配各科目学习时间。",
		levelDesc, maxDim, minDim)
}

// generateComparisonAnalysis 生成对标分析
func (s *LearningStatsService) generateComparisonAnalysis(userID uint, report *model.AbilityReportResponse) *model.ComparisonAnalysis {
	// 获取用户目标
	goal, _ := s.goalRepo.GetByUserID(userID)

	var targetGap *model.TargetGapAnalysis
	if goal != nil && goal.TargetScore > 0 {
		targetGap = s.calculateTargetGap(report, goal.TargetScore)
	}

	// 计算与平均水平差距
	averageGap := s.calculateAverageGap(report)

	// 计算与优秀者差距
	topGap := s.calculateTopGap(report)

	// 生成量化差距描述
	quantifiedGap := generateQuantifiedGap(report.OverallScore, averageGap, topGap)

	// 识别主要差距领域
	keyGapAreas := identifyKeyGapAreas(report)

	return &model.ComparisonAnalysis{
		TargetGap:     targetGap,
		AverageGap:    averageGap,
		TopGap:        topGap,
		QuantifiedGap: quantifiedGap,
		KeyGapAreas:   keyGapAreas,
	}
}

// calculateTargetGap 计算与目标的差距
func (s *LearningStatsService) calculateTargetGap(report *model.AbilityReportResponse, targetScore float64) *model.TargetGapAnalysis {
	currentScore := report.OverallScore
	gapValue := targetScore - currentScore

	var gapDescription string
	var estimatedDays int

	if gapValue <= 0 {
		gapDescription = "恭喜！您已达到目标分数，继续保持！"
		estimatedDays = 0
	} else if gapValue <= 10 {
		gapDescription = fmt.Sprintf("距离目标仅差%.1f分，继续努力即可达成！", gapValue)
		estimatedDays = int(gapValue * 3) // 假设每天提升0.33分
	} else if gapValue <= 20 {
		gapDescription = fmt.Sprintf("距离目标还有%.1f分差距，需要稳扎稳打持续学习。", gapValue)
		estimatedDays = int(gapValue * 4)
	} else {
		gapDescription = fmt.Sprintf("距离目标有%.1f分差距，需要系统规划，全力以赴。", gapValue)
		estimatedDays = int(gapValue * 5)
	}

	// 计算各科目差距
	subjectGaps := make([]model.SubjectGap, 0)
	for i, subj := range report.SubjectScores {
		// 假设目标分数按科目均分
		subjectTargetScore := targetScore
		gap := subjectTargetScore - subj.Score
		priority := 1
		if gap > 20 {
			priority = 1 // 最高优先级
		} else if gap > 10 {
			priority = 2
		} else if gap > 0 {
			priority = 3
		} else {
			priority = 5 // 已达标
		}

		suggestion := getSubjectSuggestion(subj.Subject, gap)

		subjectGaps = append(subjectGaps, model.SubjectGap{
			Subject:      subj.Subject,
			SubjectName:  subj.SubjectName,
			TargetScore:  subjectTargetScore,
			CurrentScore: subj.Score,
			GapValue:     gap,
			Priority:     priority,
			Suggestion:   suggestion,
		})

		// 只显示前4个科目
		if i >= 3 {
			break
		}
	}

	return &model.TargetGapAnalysis{
		TargetScore:    targetScore,
		CurrentScore:   currentScore,
		GapValue:       gapValue,
		GapDescription: gapDescription,
		SubjectGaps:    subjectGaps,
		EstimatedDays:  estimatedDays,
	}
}

// getSubjectSuggestion 获取科目提升建议
func getSubjectSuggestion(subject string, gap float64) string {
	if gap <= 0 {
		return "保持现有水平，定期复习巩固"
	}

	suggestions := map[string]string{
		"xingce":  "增加行测专项练习，重点攻克资料分析和数量关系",
		"shenlun": "多读优秀范文，练习概括归纳和论点论证",
		"mianshi": "加强结构化面试练习，提升表达流畅度",
		"gongji":  "系统复习法律、政治、经济等核心知识点",
	}

	if s, ok := suggestions[subject]; ok {
		return s
	}
	return "增加该科目学习时间，多做题多总结"
}

// calculateAverageGap 计算与平均水平差距
func (s *LearningStatsService) calculateAverageGap(report *model.AbilityReportResponse) *model.AverageGapAnalysis {
	// 假设平均分数为60分
	averageScore := 60.0
	currentScore := report.OverallScore
	gapValue := currentScore - averageScore

	var percentileRank int
	var gapDescription string

	if gapValue >= 30 {
		percentileRank = 95
		gapDescription = "您的能力远超平均水平，处于顶尖位置！"
	} else if gapValue >= 20 {
		percentileRank = 85
		gapDescription = "您的能力显著高于平均水平，继续保持！"
	} else if gapValue >= 10 {
		percentileRank = 70
		gapDescription = "您的能力高于平均水平，表现良好。"
	} else if gapValue >= 0 {
		percentileRank = 55
		gapDescription = "您的能力接近平均水平，仍有提升空间。"
	} else if gapValue >= -10 {
		percentileRank = 40
		gapDescription = "您的能力略低于平均，需要加强练习。"
	} else {
		percentileRank = 25
		gapDescription = "您的能力低于平均水平，需要系统性提升。"
	}

	return &model.AverageGapAnalysis{
		AverageScore:   averageScore,
		CurrentScore:   currentScore,
		GapValue:       gapValue,
		PercentileRank: percentileRank,
		GapDescription: gapDescription,
	}
}

// calculateTopGap 计算与优秀者差距
func (s *LearningStatsService) calculateTopGap(report *model.AbilityReportResponse) *model.TopGapAnalysis {
	// 假设优秀者（前10%）平均分为85分
	topScore := 85.0
	currentScore := report.OverallScore
	gapValue := topScore - currentScore

	var gapDescription string
	if gapValue <= 0 {
		gapDescription = "恭喜！您已跻身优秀者行列！"
	} else if gapValue <= 10 {
		gapDescription = fmt.Sprintf("距离优秀者仅%.1f分差距，冲刺一下即可达成！", gapValue)
	} else if gapValue <= 20 {
		gapDescription = fmt.Sprintf("距离优秀者有%.1f分差距，需要持续努力。", gapValue)
	} else {
		gapDescription = fmt.Sprintf("距离优秀者有%.1f分差距，需要制定长期学习计划。", gapValue)
	}

	return &model.TopGapAnalysis{
		TopScore:       topScore,
		CurrentScore:   currentScore,
		GapValue:       gapValue,
		GapDescription: gapDescription,
	}
}

// generateQuantifiedGap 生成量化差距描述
func generateQuantifiedGap(overallScore float64, avgGap *model.AverageGapAnalysis, topGap *model.TopGapAnalysis) string {
	if avgGap == nil || topGap == nil {
		return ""
	}

	return fmt.Sprintf("您当前综合能力分为%.1f分，超过了%d%%的考生。距离优秀者（前10%%）还有%.1f分的提升空间。按照科学的学习计划，预计可在%d天内显著提升。",
		overallScore, avgGap.PercentileRank, topGap.GapValue, int(topGap.GapValue*3))
}

// identifyKeyGapAreas 识别主要差距领域
func identifyKeyGapAreas(report *model.AbilityReportResponse) []string {
	areas := make([]string, 0)

	// 找出分数最低的2-3个维度
	type dimScore struct {
		dim   string
		score float64
	}
	dims := make([]dimScore, 0)
	for _, r := range report.RadarData {
		dims = append(dims, dimScore{dim: r.Dimension, score: r.Value})
	}

	// 简单排序
	for i := 0; i < len(dims); i++ {
		for j := i + 1; j < len(dims); j++ {
			if dims[j].score < dims[i].score {
				dims[i], dims[j] = dims[j], dims[i]
			}
		}
	}

	// 取分数最低的2-3个
	count := 2
	if len(dims) > 4 {
		count = 3
	}
	for i := 0; i < count && i < len(dims); i++ {
		if dims[i].score < 70 { // 只显示低于70分的
			areas = append(areas, fmt.Sprintf("%s（%.0f分）", dims[i].dim, dims[i].score))
		}
	}

	if len(areas) == 0 {
		areas = append(areas, "各领域表现均衡，无明显短板")
	}

	return areas
}

// generateImprovementPlan 生成提升建议
func (s *LearningStatsService) generateImprovementPlan(report *model.AbilityReportResponse) *model.ImprovementPlan {
	overallScore := report.OverallScore

	// 短期策略（1-2周）
	shortTerm := &model.ImprovementStrategy{
		Period: "1-2周",
		Goals: []string{
			"完成薄弱知识点的系统复习",
			"每日保持至少50题的刷题量",
			"建立错题本，分析错误原因",
		},
		Actions: []string{
			"每天安排1小时专项练习薄弱科目",
			"做题后认真分析每道错题",
			"每周末进行一次阶段性总结",
		},
		ExpectedGain: 3,
	}

	// 中期策略（1-2月）
	mediumTerm := &model.ImprovementStrategy{
		Period: "1-2月",
		Goals: []string{
			"薄弱科目能力提升至良好水平",
			"建立完整的知识体系框架",
			"做题速度和正确率同步提升",
		},
		Actions: []string{
			"按照艾宾浩斯曲线安排复习计划",
			"每周完成2-3套模拟试卷",
			"参加学习小组，互相督促",
		},
		ExpectedGain: 10,
	}

	// 长期策略（3-6月）
	longTerm := &model.ImprovementStrategy{
		Period: "3-6月",
		Goals: []string{
			"综合能力达到优秀水平",
			"各科目均衡发展，无明显短板",
			"具备应对各类题型的能力",
		},
		Actions: []string{
			"系统学习所有核心知识点",
			"大量真题练习，熟悉考试节奏",
			"定期模拟考试，查漏补缺",
		},
		ExpectedGain: 25,
	}

	// 重点突破方向
	focusAreas := generateFocusAreas(report)

	// 周计划
	weeklyPlan := generateWeeklyPlan(overallScore)

	// 激励建议
	motivationalTips := []string{
		"学习是一场马拉松，保持每天进步一点点",
		"相信自己的潜力，你比想象中更优秀",
		"每一道题的积累都是向目标前进的一步",
		"适当休息也是高效学习的一部分",
		"找到适合自己的学习节奏最重要",
	}

	return &model.ImprovementPlan{
		ShortTermStrategy:  shortTerm,
		MediumTermStrategy: mediumTerm,
		LongTermStrategy:   longTerm,
		FocusAreas:         focusAreas,
		WeeklyPlan:         weeklyPlan,
		MotivationalTips:   motivationalTips,
	}
}

// generateFocusAreas 生成重点突破方向
func generateFocusAreas(report *model.AbilityReportResponse) []model.FocusArea {
	areas := make([]model.FocusArea, 0)

	// 按分数排序科目，找出薄弱科目
	for i, subj := range report.SubjectScores {
		if subj.Score < 70 {
			var currentLevel, targetLevel string
			switch {
			case subj.Score < 50:
				currentLevel = "待提升"
				targetLevel = "中等"
			case subj.Score < 60:
				currentLevel = "较弱"
				targetLevel = "良好"
			default:
				currentLevel = "中等"
				targetLevel = "优秀"
			}

			areas = append(areas, model.FocusArea{
				Area:         subj.SubjectName,
				Priority:     i + 1,
				CurrentLevel: currentLevel,
				TargetLevel:  targetLevel,
				RecommendTasks: []string{
					fmt.Sprintf("每日%s专项练习30题", subj.SubjectName),
					fmt.Sprintf("复习%s核心知识点", subj.SubjectName),
					"总结常见题型解法",
				},
				EstimatedTime: 20 + i*5, // 预计学习时间
			})
		}

		if len(areas) >= 3 {
			break
		}
	}

	if len(areas) == 0 {
		// 如果没有明显薄弱科目，推荐提升最弱的一个
		if len(report.SubjectScores) > 0 {
			subj := report.SubjectScores[len(report.SubjectScores)-1]
			areas = append(areas, model.FocusArea{
				Area:         subj.SubjectName,
				Priority:     1,
				CurrentLevel: "良好",
				TargetLevel:  "优秀",
				RecommendTasks: []string{
					"挑战高难度题目",
					"学习解题技巧",
					"提升做题速度",
				},
				EstimatedTime: 15,
			})
		}
	}

	return areas
}

// generateWeeklyPlan 生成周计划
func generateWeeklyPlan(overallScore float64) []model.WeeklyPlanItem {
	plans := []model.WeeklyPlanItem{
		{
			Week:  1,
			Theme: "基础巩固周",
			MainTasks: []string{
				"完成知识点诊断测试",
				"制定个人学习计划",
				"开始薄弱科目专项练习",
			},
			TargetMinutes:   420, // 7小时
			TargetQuestions: 300,
		},
		{
			Week:  2,
			Theme: "专项提升周",
			MainTasks: []string{
				"深入学习薄弱知识点",
				"做题技巧训练",
				"错题分析与总结",
			},
			TargetMinutes:   480,
			TargetQuestions: 350,
		},
		{
			Week:  3,
			Theme: "综合训练周",
			MainTasks: []string{
				"完成1-2套模拟卷",
				"各科目均衡练习",
				"计时训练提速",
			},
			TargetMinutes:   480,
			TargetQuestions: 400,
		},
		{
			Week:  4,
			Theme: "查漏补缺周",
			MainTasks: []string{
				"复习错题本",
				"针对性强化练习",
				"模拟考试总结",
			},
			TargetMinutes:   420,
			TargetQuestions: 350,
		},
	}

	return plans
}
