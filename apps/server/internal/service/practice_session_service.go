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
	ErrSessionNotFound         = errors.New("练习会话不存在")
	ErrSessionNotActive        = errors.New("练习会话未开始或已结束")
	ErrSessionAlreadyStarted   = errors.New("练习会话已开始")
	ErrSessionCompleted        = errors.New("练习会话已完成")
	ErrQuestionNotInSession    = errors.New("题目不在当前练习会话中")
	ErrSessionQuestionAnswered = errors.New("该题目已回答")
	ErrNoQuestionsForSession   = errors.New("没有符合条件的题目")
)

// PracticeSessionService 练习会话服务
type PracticeSessionService struct {
	db               *gorm.DB
	sessionRepo      *repository.PracticeSessionRepository
	questionRepo     *repository.QuestionRepository
	recordRepo       *repository.UserQuestionRecordRepository
	weakCategoryRepo *repository.UserWeakCategoryRepository
}

func NewPracticeSessionService(
	db *gorm.DB,
	sessionRepo *repository.PracticeSessionRepository,
	questionRepo *repository.QuestionRepository,
	recordRepo *repository.UserQuestionRecordRepository,
	weakCategoryRepo *repository.UserWeakCategoryRepository,
) *PracticeSessionService {
	return &PracticeSessionService{
		db:               db,
		sessionRepo:      sessionRepo,
		questionRepo:     questionRepo,
		recordRepo:       recordRepo,
		weakCategoryRepo: weakCategoryRepo,
	}
}

// =====================================================
// 创建练习会话
// =====================================================

// CreateSession 创建练习会话
func (s *PracticeSessionService) CreateSession(userID uint, req *model.CreatePracticeSessionRequest) (*model.PracticeSessionDetailResponse, error) {
	// Build config
	config := model.PracticeSessionConfig{
		QuestionCount:        req.QuestionCount,
		CategoryIDs:          req.CategoryIDs,
		QuestionTypes:        req.QuestionTypes,
		Difficulties:         req.Difficulties,
		SmartRandom:          req.SmartRandom,
		TimeLimitPerQuestion: req.TimeLimitPerQuestion,
		TotalTimeLimit:       req.TotalTimeLimit,
		ShowCountdown:        req.ShowCountdown,
		WrongDateRange:       req.WrongDateRange,
		OnlyRecent:           req.OnlyRecent,
	}

	// Generate questions based on session type
	var questions []model.Question
	var err error

	switch req.SessionType {
	case model.PracticeSessionTypeSpecialized:
		questions, err = s.generateSpecializedQuestions(userID, config)
	case model.PracticeSessionTypeRandom:
		questions, err = s.generateRandomQuestions(userID, config)
	case model.PracticeSessionTypeTimed:
		questions, err = s.generateTimedQuestions(userID, config)
	case model.PracticeSessionTypeWrongRedo:
		questions, err = s.generateWrongRedoQuestions(userID, config)
	default:
		questions, err = s.generateRandomQuestions(userID, config)
	}

	if err != nil {
		return nil, err
	}

	if len(questions) == 0 {
		return nil, ErrNoQuestionsForSession
	}

	// Build question list
	questionList := make(model.SessionQuestionList, len(questions))
	for i, q := range questions {
		questionList[i] = model.SessionQuestion{
			QuestionID: q.ID,
			Order:      i + 1,
		}
	}

	// Calculate time limit
	timeLimit := 0
	if req.SessionType == model.PracticeSessionTypeTimed {
		if config.TotalTimeLimit > 0 {
			timeLimit = config.TotalTimeLimit
		} else if config.TimeLimitPerQuestion > 0 {
			timeLimit = config.TimeLimitPerQuestion * len(questions)
		}
	}

	// Create session
	session := &model.PracticeSession{
		UserID:         userID,
		SessionType:    req.SessionType,
		Title:          req.Title,
		Config:         config,
		Questions:      questionList,
		TotalQuestions: len(questions),
		TimeLimit:      timeLimit,
		Status:         model.PracticeSessionStatusPending,
	}

	if err := s.sessionRepo.Create(session); err != nil {
		return nil, err
	}

	return s.buildDetailResponse(session)
}

// generateSpecializedQuestions 生成专项练习题目
func (s *PracticeSessionService) generateSpecializedQuestions(userID uint, config model.PracticeSessionConfig) ([]model.Question, error) {
	var allQuestions []model.Question

	// Get recent question IDs to avoid repetition
	recentIDs, _ := s.getRecentQuestionIDs(userID, 7)

	// Build query params
	params := &repository.QuestionQueryParams{
		ExcludeIDs: recentIDs,
	}

	// If categories specified, get questions from each category
	if len(config.CategoryIDs) > 0 {
		questionsPerCategory := (config.QuestionCount + len(config.CategoryIDs) - 1) / len(config.CategoryIDs)

		for _, categoryID := range config.CategoryIDs {
			params.CategoryID = categoryID
			params.PageSize = questionsPerCategory

			// Apply additional filters
			if len(config.QuestionTypes) > 0 {
				// For now, pick first type (could be enhanced to mix)
				params.QuestionType = config.QuestionTypes[0]
			}
			if len(config.Difficulties) > 0 {
				diff := config.Difficulties[rand.Intn(len(config.Difficulties))]
				params.Difficulty = &diff
			}

			questions, _, err := s.questionRepo.GetList(params)
			if err == nil && len(questions) > 0 {
				allQuestions = append(allQuestions, questions...)
			}

			// Update exclude IDs
			for _, q := range questions {
				params.ExcludeIDs = append(params.ExcludeIDs, q.ID)
			}
		}
	} else {
		// No specific category - apply type and difficulty filters
		params.PageSize = config.QuestionCount

		if len(config.QuestionTypes) > 0 {
			params.QuestionType = config.QuestionTypes[0]
		}
		if len(config.Difficulties) > 0 {
			diff := config.Difficulties[rand.Intn(len(config.Difficulties))]
			params.Difficulty = &diff
		}

		questions, _, err := s.questionRepo.GetList(params)
		if err == nil {
			allQuestions = questions
		}
	}

	// Trim to requested count
	if len(allQuestions) > config.QuestionCount {
		// Shuffle and take first N
		rand.Shuffle(len(allQuestions), func(i, j int) {
			allQuestions[i], allQuestions[j] = allQuestions[j], allQuestions[i]
		})
		allQuestions = allQuestions[:config.QuestionCount]
	}

	return allQuestions, nil
}

// generateRandomQuestions 生成随机练习题目
func (s *PracticeSessionService) generateRandomQuestions(userID uint, config model.PracticeSessionConfig) ([]model.Question, error) {
	// Get recent question IDs to avoid repetition
	recentIDs, _ := s.getRecentQuestionIDs(userID, 7)

	if config.SmartRandom {
		// Smart random: prioritize weak categories
		return s.generateSmartRandomQuestions(userID, config.QuestionCount, recentIDs)
	}

	// Simple random
	return s.questionRepo.GetRandomQuestions(0, config.QuestionCount, recentIDs)
}

// generateSmartRandomQuestions 生成智能随机题目（根据薄弱点加权）
func (s *PracticeSessionService) generateSmartRandomQuestions(userID uint, count int, excludeIDs []uint) ([]model.Question, error) {
	var allQuestions []model.Question

	// Get weak categories (with correct rate < 60%)
	weakCategoryIDs, _ := s.weakCategoryRepo.GetWeakCategoryIDs(userID, 5, 60.0)

	if len(weakCategoryIDs) > 0 {
		// 60% from weak categories
		weakCount := count * 60 / 100
		randomCount := count - weakCount

		// Get questions from weak categories
		questionsPerCategory := (weakCount + len(weakCategoryIDs) - 1) / len(weakCategoryIDs)
		for _, categoryID := range weakCategoryIDs {
			questions, err := s.questionRepo.GetRandomQuestions(categoryID, questionsPerCategory, excludeIDs)
			if err == nil && len(questions) > 0 {
				allQuestions = append(allQuestions, questions...)
				for _, q := range questions {
					excludeIDs = append(excludeIDs, q.ID)
				}
			}
		}

		// Get remaining random questions
		if needed := count - len(allQuestions); needed > 0 || randomCount > 0 {
			needed = max(needed, randomCount)
			randomQuestions, _ := s.questionRepo.GetRandomQuestions(0, needed, excludeIDs)
			allQuestions = append(allQuestions, randomQuestions...)
		}
	} else {
		// No weak categories - all random
		questions, _ := s.questionRepo.GetRandomQuestions(0, count, excludeIDs)
		allQuestions = questions
	}

	// Shuffle
	rand.Shuffle(len(allQuestions), func(i, j int) {
		allQuestions[i], allQuestions[j] = allQuestions[j], allQuestions[i]
	})

	// Trim to count
	if len(allQuestions) > count {
		allQuestions = allQuestions[:count]
	}

	return allQuestions, nil
}

// generateTimedQuestions 生成计时练习题目
func (s *PracticeSessionService) generateTimedQuestions(userID uint, config model.PracticeSessionConfig) ([]model.Question, error) {
	// Same as random for now, can be customized
	return s.generateRandomQuestions(userID, config)
}

// generateWrongRedoQuestions 生成错题重做题目
func (s *PracticeSessionService) generateWrongRedoQuestions(userID uint, config model.PracticeSessionConfig) ([]model.Question, error) {
	// Get wrong questions from user records
	page := 1
	pageSize := config.QuestionCount
	if pageSize <= 0 {
		pageSize = 20
	}

	records, _, err := s.recordRepo.GetUserWrongQuestions(userID, page, pageSize)
	if err != nil {
		return nil, err
	}

	var questionIDs []uint
	for _, r := range records {
		questionIDs = append(questionIDs, r.QuestionID)
	}

	if len(questionIDs) == 0 {
		return nil, ErrNoQuestionsForSession
	}

	// Get questions by IDs
	questions, err := s.questionRepo.GetByIDs(questionIDs)
	if err != nil {
		return nil, err
	}

	// Shuffle
	rand.Shuffle(len(questions), func(i, j int) {
		questions[i], questions[j] = questions[j], questions[i]
	})

	// Trim to count
	if len(questions) > config.QuestionCount && config.QuestionCount > 0 {
		questions = questions[:config.QuestionCount]
	}

	return questions, nil
}

// getRecentQuestionIDs 获取最近做过的题目ID
func (s *PracticeSessionService) getRecentQuestionIDs(userID uint, days int) ([]uint, error) {
	var ids []uint
	startDate := time.Now().AddDate(0, 0, -days)

	err := s.db.Model(&model.UserQuestionRecord{}).
		Where("user_id = ? AND created_at >= ?", userID, startDate).
		Distinct("question_id").
		Pluck("question_id", &ids).Error

	return ids, err
}

// =====================================================
// 会话操作
// =====================================================

// GetSession 获取练习会话
func (s *PracticeSessionService) GetSession(sessionID, userID uint) (*model.PracticeSessionDetailResponse, error) {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSessionNotFound
		}
		return nil, err
	}

	// Verify ownership
	if session.UserID != userID {
		return nil, ErrSessionNotFound
	}

	return s.buildDetailResponse(session)
}

// StartSession 开始练习会话
func (s *PracticeSessionService) StartSession(sessionID, userID uint) (*model.PracticeSessionDetailResponse, error) {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSessionNotFound
		}
		return nil, err
	}

	// Verify ownership
	if session.UserID != userID {
		return nil, ErrSessionNotFound
	}

	// Check status
	if session.Status == model.PracticeSessionStatusActive {
		return s.buildDetailResponse(session)
	}
	if session.Status == model.PracticeSessionStatusCompleted {
		return nil, ErrSessionCompleted
	}

	// Update status
	now := time.Now()
	session.Status = model.PracticeSessionStatusActive
	session.StartedAt = &now

	if err := s.sessionRepo.Update(session); err != nil {
		return nil, err
	}

	return s.buildDetailResponse(session)
}

// SubmitAnswer 提交答案
func (s *PracticeSessionService) SubmitAnswer(sessionID, userID uint, req *model.SubmitSessionAnswerRequest) (*model.QuestionDetailResponse, error) {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSessionNotFound
		}
		return nil, err
	}

	// Verify ownership
	if session.UserID != userID {
		return nil, ErrSessionNotFound
	}

	// Check status
	if session.Status != model.PracticeSessionStatusActive && session.Status != model.PracticeSessionStatusPending {
		return nil, ErrSessionNotActive
	}

	// If pending, auto-start
	if session.Status == model.PracticeSessionStatusPending {
		now := time.Now()
		session.Status = model.PracticeSessionStatusActive
		session.StartedAt = &now
	}

	// Find the question in session
	questionIndex := -1
	for i, q := range session.Questions {
		if q.QuestionID == req.QuestionID {
			questionIndex = i
			break
		}
	}

	if questionIndex == -1 {
		return nil, ErrQuestionNotInSession
	}

	if session.Questions[questionIndex].IsCorrect != nil {
		return nil, ErrSessionQuestionAnswered
	}

	// Get question for answer checking
	question, err := s.questionRepo.GetByID(req.QuestionID)
	if err != nil {
		return nil, err
	}

	// Check answer
	isCorrect := checkAnswer(question, req.UserAnswer)

	// Update session question
	session.Questions[questionIndex].UserAnswer = req.UserAnswer
	session.Questions[questionIndex].IsCorrect = &isCorrect
	session.Questions[questionIndex].TimeSpent = req.TimeSpent
	session.Questions[questionIndex].AnsweredAt = time.Now().Format("2006-01-02 15:04:05")

	// Update session stats
	session.CompletedCount++
	session.TotalTimeSpent += req.TimeSpent
	if isCorrect {
		session.CorrectCount++
	} else {
		session.WrongCount++
	}

	// Check if completed
	if session.CompletedCount >= session.TotalQuestions {
		now := time.Now()
		session.Status = model.PracticeSessionStatusCompleted
		session.CompletedAt = &now
	}

	// Save session
	if err := s.sessionRepo.Update(session); err != nil {
		return nil, err
	}

	// Save individual question record
	practiceType := model.PracticeTypeCategory
	switch session.SessionType {
	case model.PracticeSessionTypeRandom:
		practiceType = model.PracticeTypeRandom
	case model.PracticeSessionTypeWrongRedo:
		practiceType = model.PracticeTypeWrongRedo
	}

	record := &model.UserQuestionRecord{
		UserID:       userID,
		QuestionID:   req.QuestionID,
		UserAnswer:   req.UserAnswer,
		IsCorrect:    isCorrect,
		TimeSpent:    req.TimeSpent,
		PracticeType: practiceType,
		PracticeID:   &session.ID,
	}
	if err := s.recordRepo.Create(record); err != nil {
		return nil, err
	}

	// Update question stats
	_ = s.questionRepo.UpdateStats(req.QuestionID, isCorrect, req.TimeSpent)

	// Update weak category stats
	if question.CategoryID > 0 && s.weakCategoryRepo != nil {
		_ = s.weakCategoryRepo.UpdateFromQuestionRecord(userID, question.CategoryID, isCorrect)
	}

	// Return response
	resp := question.ToDetailResponse()
	resp.UserAnswer = req.UserAnswer
	resp.IsCorrect = &isCorrect

	return resp, nil
}

// AbandonSession 放弃练习会话
func (s *PracticeSessionService) AbandonSession(sessionID, userID uint) error {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrSessionNotFound
		}
		return err
	}

	// Verify ownership
	if session.UserID != userID {
		return ErrSessionNotFound
	}

	// Check if can be abandoned
	if session.Status == model.PracticeSessionStatusCompleted {
		return ErrSessionCompleted
	}

	return s.sessionRepo.AbandonSession(sessionID)
}

// =====================================================
// 查询功能
// =====================================================

// GetUserSessions 获取用户的练习会话列表
func (s *PracticeSessionService) GetUserSessions(userID uint, page, pageSize int) ([]model.PracticeSessionResponse, int64, error) {
	sessions, total, err := s.sessionRepo.GetByUserID(userID, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	var responses []model.PracticeSessionResponse
	for _, session := range sessions {
		responses = append(responses, *session.ToResponse())
	}

	return responses, total, nil
}

// GetActiveSessions 获取用户进行中的练习会话
func (s *PracticeSessionService) GetActiveSessions(userID uint) ([]model.PracticeSessionResponse, error) {
	sessions, err := s.sessionRepo.GetActiveByUserID(userID)
	if err != nil {
		return nil, err
	}

	var responses []model.PracticeSessionResponse
	for _, session := range sessions {
		responses = append(responses, *session.ToResponse())
	}

	return responses, nil
}

// GetPracticeStats 获取用户练习统计
func (s *PracticeSessionService) GetPracticeStats(userID uint) (*repository.PracticeStats, error) {
	return s.sessionRepo.GetCompletedStats(userID)
}

// GetQuickTemplates 获取快速练习模板
func (s *PracticeSessionService) GetQuickTemplates() []model.PracticeTemplate {
	return model.GetQuickPracticeTemplates()
}

// =====================================================
// 断点续做功能
// =====================================================

// SaveProgress 保存练习进度（自动保存）
func (s *PracticeSessionService) SaveProgress(sessionID, userID uint, req *model.SaveSessionProgressRequest) error {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrSessionNotFound
		}
		return err
	}

	// Verify ownership
	if session.UserID != userID {
		return ErrSessionNotFound
	}

	// Only save if session is active or pending
	if session.Status != model.PracticeSessionStatusActive && session.Status != model.PracticeSessionStatusPending {
		return ErrSessionNotActive
	}

	// Update answers from request
	for _, answer := range req.Answers {
		for i, q := range session.Questions {
			if q.QuestionID == answer.QuestionID && answer.UserAnswer != "" {
				session.Questions[i].UserAnswer = answer.UserAnswer
				session.Questions[i].TimeSpent = answer.TimeSpent
			}
		}
	}

	// Update progress info
	now := time.Now()
	session.CurrentIndex = req.CurrentIndex
	session.TotalTimeSpent = req.TotalTimeSpent
	session.ElapsedAtSave = req.TotalTimeSpent
	session.LastSavedAt = &now

	// Use optimized update
	return s.sessionRepo.UpdateProgress(session)
}

// InterruptSession 中断练习会话
func (s *PracticeSessionService) InterruptSession(sessionID, userID uint, req *model.InterruptSessionRequest) error {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrSessionNotFound
		}
		return err
	}

	// Verify ownership
	if session.UserID != userID {
		return ErrSessionNotFound
	}

	// Only interrupt active sessions
	if session.Status != model.PracticeSessionStatusActive && session.Status != model.PracticeSessionStatusPending {
		return ErrSessionNotActive
	}

	// Update answers if provided
	if len(req.Answers) > 0 {
		for _, answer := range req.Answers {
			for i, q := range session.Questions {
				if q.QuestionID == answer.QuestionID && answer.UserAnswer != "" {
					session.Questions[i].UserAnswer = answer.UserAnswer
					session.Questions[i].TimeSpent = answer.TimeSpent
				}
			}
		}
	}

	// Update session
	now := time.Now()
	session.CurrentIndex = req.CurrentIndex
	session.TotalTimeSpent = req.TotalTimeSpent
	session.ElapsedAtSave = req.TotalTimeSpent
	session.LastSavedAt = &now
	session.IsInterrupted = true
	session.InterruptReason = req.Reason

	return s.sessionRepo.Update(session)
}

// GetResumableSessions 获取可恢复的练习会话
func (s *PracticeSessionService) GetResumableSessions(userID uint) ([]model.PracticeSessionResponse, error) {
	sessions, err := s.sessionRepo.GetResumableSessions(userID)
	if err != nil {
		return nil, err
	}

	var responses []model.PracticeSessionResponse
	for _, session := range sessions {
		responses = append(responses, *session.ToResponse())
	}

	return responses, nil
}

// GetLatestResumable 获取最近一个可恢复的会话
func (s *PracticeSessionService) GetLatestResumable(userID uint) (*model.PracticeSessionDetailResponse, error) {
	session, err := s.sessionRepo.GetLatestResumable(userID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil // 没有可恢复的会话，返回nil
		}
		return nil, err
	}

	return s.buildDetailResponse(session)
}

// ResumeSession 恢复练习会话
func (s *PracticeSessionService) ResumeSession(sessionID, userID uint) (*model.PracticeSessionDetailResponse, error) {
	session, err := s.sessionRepo.GetByID(sessionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrSessionNotFound
		}
		return nil, err
	}

	// Verify ownership
	if session.UserID != userID {
		return nil, ErrSessionNotFound
	}

	// Check if can be resumed
	canResume := (session.Status == model.PracticeSessionStatusActive || session.IsInterrupted) &&
		session.CompletedCount < session.TotalQuestions

	if !canResume {
		return nil, ErrSessionNotActive
	}

	// Clear interrupt status
	if session.IsInterrupted {
		session.IsInterrupted = false
		session.InterruptReason = ""
		if err := s.sessionRepo.ClearInterrupt(sessionID); err != nil {
			return nil, err
		}
	}

	// Ensure status is active
	if session.Status == model.PracticeSessionStatusPending {
		now := time.Now()
		session.Status = model.PracticeSessionStatusActive
		session.StartedAt = &now
		if err := s.sessionRepo.Update(session); err != nil {
			return nil, err
		}
	}

	return s.buildDetailResponse(session)
}

// =====================================================
// 辅助方法
// =====================================================

// buildDetailResponse 构建详情响应
func (s *PracticeSessionService) buildDetailResponse(session *model.PracticeSession) (*model.PracticeSessionDetailResponse, error) {
	// Get question IDs
	var questionIDs []uint
	for _, q := range session.Questions {
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
	var questionsWithDetail []model.SessionQuestionWithDetail
	for _, sq := range session.Questions {
		detail := model.SessionQuestionWithDetail{
			SessionQuestion: sq,
		}
		if q, ok := questionMap[sq.QuestionID]; ok {
			detail.Question = q.ToBriefResponse()
		}
		questionsWithDetail = append(questionsWithDetail, detail)
	}

	return &model.PracticeSessionDetailResponse{
		PracticeSessionResponse: *session.ToResponse(),
		Config:                  session.Config,
		Questions:               questionsWithDetail,
	}, nil
}

// max returns the maximum of two integers
func max(a, b int) int {
	if a > b {
		return a
	}
	return b
}
