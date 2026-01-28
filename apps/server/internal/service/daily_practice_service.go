package service

import (
	"errors"
	"math/rand"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"gorm.io/gorm"
)

var (
	ErrDailyPracticeNotFound   = errors.New("每日练习不存在")
	ErrDailyPracticeCompleted  = errors.New("今日练习已完成")
	ErrQuestionNotInPractice   = errors.New("题目不在今日练习中")
	ErrQuestionAlreadyAnswered = errors.New("题目已回答")
	ErrNoQuestionsAvailable    = errors.New("暂无可用题目")
)

// DailyPracticeService 每日练习服务
type DailyPracticeService struct {
	db               *gorm.DB
	practiceRepo     *repository.DailyPracticeRepository
	streakRepo       *repository.UserDailyStreakRepository
	weakCategoryRepo *repository.UserWeakCategoryRepository
	questionRepo     *repository.QuestionRepository
	recordRepo       *repository.UserQuestionRecordRepository
}

func NewDailyPracticeService(
	db *gorm.DB,
	practiceRepo *repository.DailyPracticeRepository,
	streakRepo *repository.UserDailyStreakRepository,
	weakCategoryRepo *repository.UserWeakCategoryRepository,
	questionRepo *repository.QuestionRepository,
	recordRepo *repository.UserQuestionRecordRepository,
) *DailyPracticeService {
	return &DailyPracticeService{
		db:               db,
		practiceRepo:     practiceRepo,
		streakRepo:       streakRepo,
		weakCategoryRepo: weakCategoryRepo,
		questionRepo:     questionRepo,
		recordRepo:       recordRepo,
	}
}

// =====================================================
// 每日一练核心功能
// =====================================================

// GetTodayPractice 获取今日练习（如果不存在则创建）
func (s *DailyPracticeService) GetTodayPractice(userID uint) (*model.DailyPracticeDetailResponse, error) {
	today := time.Now().Format("2006-01-02")

	// Try to get existing practice
	practice, err := s.practiceRepo.GetByUserAndDate(userID, today)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			// Create new practice
			practice, err = s.createDailyPractice(userID, model.DefaultDailyPracticeConfig)
			if err != nil {
				return nil, err
			}
		} else {
			return nil, err
		}
	}

	return s.buildDetailResponse(practice)
}

// createDailyPractice 创建每日练习
func (s *DailyPracticeService) createDailyPractice(userID uint, config model.DailyPracticeConfig) (*model.DailyPractice, error) {
	today := time.Now().Format("2006-01-02")

	// Generate questions using smart algorithm
	questions, err := s.generateDailyQuestions(userID, config)
	if err != nil {
		return nil, err
	}

	if len(questions) == 0 {
		return nil, ErrNoQuestionsAvailable
	}

	// Build question list
	questionList := make(model.DailyQuestionList, len(questions))
	for i, q := range questions {
		questionList[i] = model.DailyQuestion{
			QuestionID: q.ID,
			Order:      i + 1,
		}
	}

	practice := &model.DailyPractice{
		UserID:          userID,
		PracticeDate:    today,
		Questions:       questionList,
		TotalQuestions:  len(questions),
		Status:          model.DailyPracticeStatusPending,
		DifficultyLevel: config.DifficultyLevel,
	}

	if err := s.practiceRepo.Create(practice); err != nil {
		return nil, err
	}

	return practice, nil
}

// generateDailyQuestions 智能生成每日题目
func (s *DailyPracticeService) generateDailyQuestions(userID uint, config model.DailyPracticeConfig) ([]model.Question, error) {
	var allQuestions []model.Question

	// Get recently answered question IDs to exclude
	recentQuestionIDs, _ := s.getRecentQuestionIDs(userID, 7) // Exclude questions from last 7 days

	if config.IncludeWeak && config.WeakRatio > 0 {
		// Calculate how many questions should come from weak categories
		weakCount := (config.QuestionCount * config.WeakRatio) / 100
		randomCount := config.QuestionCount - weakCount

		// Get questions from weak categories
		if weakCount > 0 {
			weakQuestions, err := s.getWeakCategoryQuestions(userID, weakCount, config.DifficultyLevel, recentQuestionIDs)
			if err == nil && len(weakQuestions) > 0 {
				allQuestions = append(allQuestions, weakQuestions...)
				// Add these IDs to exclude list
				for _, q := range weakQuestions {
					recentQuestionIDs = append(recentQuestionIDs, q.ID)
				}
			}
		}

		// Get remaining random questions
		if randomCount > 0 || len(allQuestions) < config.QuestionCount {
			neededCount := config.QuestionCount - len(allQuestions)
			randomQuestions, err := s.getRandomQuestions(neededCount, config.DifficultyLevel, recentQuestionIDs)
			if err == nil && len(randomQuestions) > 0 {
				allQuestions = append(allQuestions, randomQuestions...)
			}
		}
	} else {
		// All random questions
		randomQuestions, err := s.getRandomQuestions(config.QuestionCount, config.DifficultyLevel, recentQuestionIDs)
		if err != nil {
			return nil, err
		}
		allQuestions = randomQuestions
	}

	// Shuffle the questions
	rand.Shuffle(len(allQuestions), func(i, j int) {
		allQuestions[i], allQuestions[j] = allQuestions[j], allQuestions[i]
	})

	return allQuestions, nil
}

// getRecentQuestionIDs 获取最近做过的题目ID
func (s *DailyPracticeService) getRecentQuestionIDs(userID uint, days int) ([]uint, error) {
	var ids []uint
	startDate := time.Now().AddDate(0, 0, -days)

	err := s.db.Model(&model.UserQuestionRecord{}).
		Where("user_id = ? AND created_at >= ?", userID, startDate).
		Distinct("question_id").
		Pluck("question_id", &ids).Error

	return ids, err
}

// getWeakCategoryQuestions 从薄弱分类获取题目
func (s *DailyPracticeService) getWeakCategoryQuestions(userID uint, count, difficulty int, excludeIDs []uint) ([]model.Question, error) {
	// Get weak category IDs (categories with correct rate < 60%)
	weakCategoryIDs, err := s.weakCategoryRepo.GetWeakCategoryIDs(userID, 5, 60.0)
	if err != nil || len(weakCategoryIDs) == 0 {
		return nil, err
	}

	var questions []model.Question
	perCategory := (count + len(weakCategoryIDs) - 1) / len(weakCategoryIDs) // Ceiling division

	for _, categoryID := range weakCategoryIDs {
		if len(questions) >= count {
			break
		}

		categoryQuestions, _, err := s.questionRepo.GetList(&repository.QuestionQueryParams{
			CategoryID: categoryID,
			Difficulty: &difficulty,
			ExcludeIDs: append(excludeIDs, getQuestionIDs(questions)...),
			Page:       1,
			PageSize:   perCategory,
		})
		if err == nil && len(categoryQuestions) > 0 {
			questions = append(questions, categoryQuestions...)
		}
	}

	// Trim to count
	if len(questions) > count {
		questions = questions[:count]
	}

	return questions, nil
}

// getRandomQuestions 获取随机题目
func (s *DailyPracticeService) getRandomQuestions(count, difficulty int, excludeIDs []uint) ([]model.Question, error) {
	return s.questionRepo.GetRandomQuestions(0, count, excludeIDs)
}

// getQuestionIDs 从题目列表获取ID列表
func getQuestionIDs(questions []model.Question) []uint {
	ids := make([]uint, len(questions))
	for i, q := range questions {
		ids[i] = q.ID
	}
	return ids
}

// buildDetailResponse 构建详情响应
func (s *DailyPracticeService) buildDetailResponse(practice *model.DailyPractice) (*model.DailyPracticeDetailResponse, error) {
	// Get question IDs
	var questionIDs []uint
	for _, q := range practice.Questions {
		questionIDs = append(questionIDs, q.QuestionID)
	}

	// Get questions
	questions, err := s.questionRepo.GetByIDs(questionIDs)
	if err != nil {
		return nil, err
	}

	// Build question map
	questionMap := make(map[uint]*model.Question)
	for i := range questions {
		questionMap[questions[i].ID] = &questions[i]
	}

	// Build response
	var questionsWithDetail []model.DailyQuestionWithDetail
	for _, dq := range practice.Questions {
		detail := model.DailyQuestionWithDetail{
			DailyQuestion: dq,
		}
		if q, ok := questionMap[dq.QuestionID]; ok {
			detail.Question = q.ToBriefResponse()
		}
		questionsWithDetail = append(questionsWithDetail, detail)
	}

	return &model.DailyPracticeDetailResponse{
		DailyPracticeResponse: *practice.ToResponse(),
		Questions:             questionsWithDetail,
	}, nil
}

// =====================================================
// 答题功能
// =====================================================

// SubmitAnswer 提交答案
func (s *DailyPracticeService) SubmitAnswer(userID uint, req *model.SubmitDailyAnswerRequest) (*model.QuestionDetailResponse, error) {
	today := time.Now().Format("2006-01-02")

	// Get today's practice
	practice, err := s.practiceRepo.GetByUserAndDate(userID, today)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrDailyPracticeNotFound
		}
		return nil, err
	}

	if practice.Status == model.DailyPracticeStatusCompleted {
		return nil, ErrDailyPracticeCompleted
	}

	// Find the question in practice
	questionIndex := -1
	for i, q := range practice.Questions {
		if q.QuestionID == req.QuestionID {
			questionIndex = i
			break
		}
	}

	if questionIndex == -1 {
		return nil, ErrQuestionNotInPractice
	}

	if practice.Questions[questionIndex].IsCorrect != nil {
		return nil, ErrQuestionAlreadyAnswered
	}

	// Get question for answer checking
	question, err := s.questionRepo.GetByID(req.QuestionID)
	if err != nil {
		return nil, err
	}

	// Check answer
	isCorrect := checkAnswer(question, req.UserAnswer)

	// Update practice question
	practice.Questions[questionIndex].UserAnswer = req.UserAnswer
	practice.Questions[questionIndex].IsCorrect = &isCorrect
	practice.Questions[questionIndex].TimeSpent = req.TimeSpent
	practice.Questions[questionIndex].AnsweredAt = time.Now().Format("2006-01-02 15:04:05")

	// Update practice stats
	practice.CompletedCount++
	practice.TotalTimeSpent += req.TimeSpent
	if isCorrect {
		practice.CorrectCount++
	} else {
		practice.WrongCount++
	}

	// Update status
	if practice.CompletedCount >= practice.TotalQuestions {
		practice.Status = model.DailyPracticeStatusCompleted
		now := time.Now()
		practice.CompletedAt = &now

		// Update streak
		go s.updateStreak(userID, practice)
	} else {
		practice.Status = model.DailyPracticeStatusPartial
	}

	// Save practice
	if err := s.practiceRepo.Update(practice); err != nil {
		return nil, err
	}

	// Save individual question record
	record := &model.UserQuestionRecord{
		UserID:       userID,
		QuestionID:   req.QuestionID,
		UserAnswer:   req.UserAnswer,
		IsCorrect:    isCorrect,
		TimeSpent:    req.TimeSpent,
		PracticeType: model.PracticeTypeDaily,
		PracticeID:   &practice.ID,
	}
	if err := s.recordRepo.Create(record); err != nil {
		return nil, err
	}

	// Update question stats
	_ = s.questionRepo.UpdateStats(req.QuestionID, isCorrect, req.TimeSpent)

	// Update weak category stats
	if question.CategoryID > 0 {
		_ = s.weakCategoryRepo.UpdateFromQuestionRecord(userID, question.CategoryID, isCorrect)
	}

	// Return response
	resp := question.ToDetailResponse()
	resp.UserAnswer = req.UserAnswer
	resp.IsCorrect = &isCorrect

	return resp, nil
}

// updateStreak 更新打卡记录
func (s *DailyPracticeService) updateStreak(userID uint, practice *model.DailyPractice) {
	streak, err := s.streakRepo.GetOrCreate(userID)
	if err != nil {
		return
	}

	today := time.Now().Truncate(24 * time.Hour)

	// Check if last practice was yesterday
	if streak.LastPracticeAt != nil {
		lastPractice := streak.LastPracticeAt.Truncate(24 * time.Hour)
		yesterday := today.AddDate(0, 0, -1)

		if lastPractice.Equal(yesterday) {
			// Continue streak
			streak.CurrentStreak++
		} else if !lastPractice.Equal(today) {
			// Break streak (not yesterday and not today)
			streak.CurrentStreak = 1
		}
		// If last practice was today, keep current streak unchanged
	} else {
		streak.CurrentStreak = 1
	}

	// Update longest streak
	if streak.CurrentStreak > streak.LongestStreak {
		streak.LongestStreak = streak.CurrentStreak
	}

	// Update other stats
	streak.TotalDays++
	streak.LastPracticeAt = &today
	streak.TotalQuestions += practice.TotalQuestions
	streak.TotalCorrect += practice.CorrectCount

	// Update average correct rate
	if streak.TotalQuestions > 0 {
		streak.AvgCorrectRate = float64(streak.TotalCorrect) * 100 / float64(streak.TotalQuestions)
	}

	// Update weekly and monthly stats (simplified - could be scheduled job)
	now := time.Now()
	weekday := int(now.Weekday())
	if weekday == 0 {
		weekday = 7
	}
	startOfWeek := now.AddDate(0, 0, -(weekday - 1))
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, now.Location())

	if today.After(startOfWeek) || today.Equal(startOfWeek.Truncate(24*time.Hour)) {
		streak.ThisWeekDays++
	}
	if today.After(startOfMonth) || today.Equal(startOfMonth.Truncate(24*time.Hour)) {
		streak.ThisMonthDays++
	}

	_ = s.streakRepo.Update(streak)
}

// =====================================================
// 统计功能
// =====================================================

// GetUserStreak 获取用户打卡记录
func (s *DailyPracticeService) GetUserStreak(userID uint) (*model.UserDailyStreakResponse, error) {
	streak, err := s.streakRepo.GetOrCreate(userID)
	if err != nil {
		return nil, err
	}

	resp := streak.ToResponse()

	// Check if today is completed
	today := time.Now().Format("2006-01-02")
	practice, _ := s.practiceRepo.GetByUserAndDate(userID, today)
	if practice != nil && practice.Status == model.DailyPracticeStatusCompleted {
		resp.TodayCompleted = true
	}

	// Verify current streak is still valid
	if streak.LastPracticeAt != nil {
		lastPractice := streak.LastPracticeAt.Truncate(24 * time.Hour)
		today := time.Now().Truncate(24 * time.Hour)
		yesterday := today.AddDate(0, 0, -1)

		// If last practice was before yesterday and not today, streak should be 0
		if !lastPractice.Equal(today) && !lastPractice.Equal(yesterday) {
			resp.CurrentStreak = 0
		}
	}

	return resp, nil
}

// GetUserHistory 获取用户练习历史
func (s *DailyPracticeService) GetUserHistory(userID uint, page, pageSize int) ([]model.DailyPracticeResponse, int64, error) {
	practices, total, err := s.practiceRepo.GetUserHistory(userID, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	var responses []model.DailyPracticeResponse
	for _, p := range practices {
		responses = append(responses, *p.ToResponse())
	}

	return responses, total, nil
}

// GetUserCalendar 获取用户打卡日历
func (s *DailyPracticeService) GetUserCalendar(userID uint, year, month int) ([]model.DailyPracticeCalendarItem, error) {
	practices, err := s.practiceRepo.GetUserCalendar(userID, year, month)
	if err != nil {
		return nil, err
	}

	// Build calendar items
	practiceMap := make(map[string]*model.DailyPractice)
	for i := range practices {
		practiceMap[practices[i].PracticeDate] = &practices[i]
	}

	// Generate calendar for the month
	var calendar []model.DailyPracticeCalendarItem
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.UTC)
	endDate := startDate.AddDate(0, 1, 0)
	today := time.Now().Format("2006-01-02")

	for d := startDate; d.Before(endDate); d = d.AddDate(0, 0, 1) {
		dateStr := d.Format("2006-01-02")
		item := model.DailyPracticeCalendarItem{
			Date:      dateStr,
			Completed: false,
		}

		// Don't show future dates
		if dateStr > today {
			break
		}

		if p, ok := practiceMap[dateStr]; ok {
			if p.Status == model.DailyPracticeStatusCompleted {
				item.Completed = true
				if p.CompletedCount > 0 {
					item.CorrectRate = float64(p.CorrectCount) * 100 / float64(p.CompletedCount)
				}
				item.TotalQuestions = p.TotalQuestions
			}
		}

		calendar = append(calendar, item)
	}

	return calendar, nil
}

// GetWeakCategories 获取用户薄弱分类
func (s *DailyPracticeService) GetWeakCategories(userID uint, limit int) ([]model.WeakCategoryResponse, error) {
	categories, err := s.weakCategoryRepo.GetUserWeakCategories(userID, limit)
	if err != nil {
		return nil, err
	}

	var responses []model.WeakCategoryResponse
	for _, c := range categories {
		resp := model.WeakCategoryResponse{
			CategoryID:   c.CategoryID,
			TotalCount:   c.TotalCount,
			CorrectCount: c.CorrectCount,
			WrongCount:   c.WrongCount,
			CorrectRate:  c.CorrectRate,
		}
		if c.Category != nil {
			resp.CategoryName = c.Category.Name
		}
		responses = append(responses, resp)
	}

	return responses, nil
}
