package service

import (
	"errors"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"gorm.io/gorm"
)

var (
	ErrQuestionNotFound       = errors.New("题目不存在")
	ErrMaterialNotFound       = errors.New("材料不存在")
	ErrPaperNotFound          = errors.New("试卷不存在")
	ErrPaperRecordNotFound    = errors.New("试卷记录不存在")
	ErrPaperNotPublished      = errors.New("试卷未发布")
	ErrPaperAlreadyStarted    = errors.New("已有进行中的试卷")
	ErrPaperNotInProgress     = errors.New("试卷未开始或已结束")
	ErrQuestionAlreadyCollect = errors.New("已收藏该题目")
	ErrQuestionNotCollected   = errors.New("未收藏该题目")
	ErrInvalidAnswer          = errors.New("答案格式无效")
)

// =====================================================
// Question Service
// =====================================================

type QuestionService struct {
	questionRepo    *repository.QuestionRepository
	materialRepo    *repository.QuestionMaterialRepository
	paperRepo       *repository.ExamPaperRepository
	recordRepo      *repository.UserQuestionRecordRepository
	paperRecordRepo *repository.UserPaperRecordRepository
	collectRepo     *repository.UserQuestionCollectRepository
}

func NewQuestionService(
	questionRepo *repository.QuestionRepository,
	materialRepo *repository.QuestionMaterialRepository,
	paperRepo *repository.ExamPaperRepository,
	recordRepo *repository.UserQuestionRecordRepository,
	paperRecordRepo *repository.UserPaperRecordRepository,
	collectRepo *repository.UserQuestionCollectRepository,
) *QuestionService {
	return &QuestionService{
		questionRepo:    questionRepo,
		materialRepo:    materialRepo,
		paperRepo:       paperRepo,
		recordRepo:      recordRepo,
		paperRecordRepo: paperRecordRepo,
		collectRepo:     collectRepo,
	}
}

// =====================================================
// Question Operations
// =====================================================

// GetQuestions gets questions with filters
func (s *QuestionService) GetQuestions(params *repository.QuestionQueryParams) ([]model.Question, int64, error) {
	return s.questionRepo.GetList(params)
}

// GetQuestionByID gets a question by ID
func (s *QuestionService) GetQuestionByID(id uint, userID uint) (*model.QuestionDetailResponse, error) {
	question, err := s.questionRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrQuestionNotFound
		}
		return nil, err
	}

	resp := question.ToDetailResponse()

	// Check if collected
	if userID > 0 {
		resp.IsCollected = s.collectRepo.IsCollected(userID, id)
	}

	return resp, nil
}

// GetQuestionForPractice gets questions for practice
func (s *QuestionService) GetQuestionForPractice(categoryID uint, count int, excludeIDs []uint) ([]model.Question, error) {
	if count <= 0 {
		count = 10
	}
	if count > 100 {
		count = 100
	}
	return s.questionRepo.GetRandomQuestions(categoryID, count, excludeIDs)
}

// SubmitAnswer submits an answer for a question
func (s *QuestionService) SubmitAnswer(userID, questionID uint, userAnswer string, timeSpent int, practiceType model.PracticeType, practiceID *uint) (*model.QuestionDetailResponse, error) {
	// Get question
	question, err := s.questionRepo.GetByID(questionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrQuestionNotFound
		}
		return nil, err
	}

	// Check answer
	isCorrect := checkAnswer(question, userAnswer)

	// Save record
	record := &model.UserQuestionRecord{
		UserID:       userID,
		QuestionID:   questionID,
		UserAnswer:   userAnswer,
		IsCorrect:    isCorrect,
		TimeSpent:    timeSpent,
		PracticeType: practiceType,
		PracticeID:   practiceID,
	}
	if err := s.recordRepo.Create(record); err != nil {
		return nil, err
	}

	// Update question stats
	_ = s.questionRepo.UpdateStats(questionID, isCorrect, timeSpent)

	// Return response with answer and analysis
	resp := question.ToDetailResponse()
	resp.UserAnswer = userAnswer
	resp.IsCorrect = &isCorrect

	return resp, nil
}

// checkAnswer checks if the user's answer is correct
func checkAnswer(question *model.Question, userAnswer string) bool {
	if userAnswer == "" {
		return false
	}
	// Simple string comparison for now
	// TODO: More sophisticated answer checking for different question types
	return question.Answer == userAnswer
}

// GetUserStats gets user's question statistics
func (s *QuestionService) GetUserStats(userID uint) (*model.UserQuestionStats, error) {
	return s.recordRepo.GetUserStats(userID)
}

// GetUserCategoryProgress gets user's progress for each category
func (s *QuestionService) GetUserCategoryProgress(userID uint, subject string) ([]repository.CategoryProgressStat, error) {
	// Get category IDs for the subject if specified
	var categoryIDs []uint
	
	// Subject to category mapping - this would typically come from database
	// For now, we return all categories if no specific filter
	// The frontend will filter based on its own subject config
	
	return s.recordRepo.GetUserCategoryProgress(userID, categoryIDs)
}

// GetUserWrongQuestions gets user's wrong questions
func (s *QuestionService) GetUserWrongQuestions(userID uint, page, pageSize int) ([]model.UserQuestionRecordResponse, int64, error) {
	records, total, err := s.recordRepo.GetUserWrongQuestions(userID, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	var responses []model.UserQuestionRecordResponse
	for _, r := range records {
		responses = append(responses, *r.ToResponse())
	}

	return responses, total, nil
}

// =====================================================
// Paper Operations
// =====================================================

// GetPapers gets papers with filters
func (s *QuestionService) GetPapers(params *repository.PaperQueryParams, userID uint) ([]model.ExamPaperBriefResponse, int64, error) {
	papers, total, err := s.paperRepo.GetList(params)
	if err != nil {
		return nil, 0, err
	}

	var responses []model.ExamPaperBriefResponse
	for _, p := range papers {
		resp := *p.ToBriefResponse()
		// Get user's best score if logged in
		if userID > 0 {
			bestScore, _ := s.paperRecordRepo.GetUserBestScore(userID, p.ID)
			if bestScore > 0 {
				resp.MyScore = &bestScore
			}
		}
		responses = append(responses, resp)
	}

	return responses, total, nil
}

// GetPaperByID gets paper detail
func (s *QuestionService) GetPaperByID(id uint, userID uint) (*model.ExamPaperDetailResponse, error) {
	paper, err := s.paperRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPaperNotFound
		}
		return nil, err
	}

	resp := paper.ToDetailResponse()

	// Get user's best score if logged in
	if userID > 0 {
		bestScore, _ := s.paperRecordRepo.GetUserBestScore(userID, id)
		if bestScore > 0 {
			resp.MyScore = &bestScore
		}
	}

	return resp, nil
}

// GetPaperWithQuestions gets paper with full question details
func (s *QuestionService) GetPaperWithQuestions(id uint) (*model.ExamPaper, []model.Question, error) {
	paper, err := s.paperRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, nil, ErrPaperNotFound
		}
		return nil, nil, err
	}

	// Get question IDs from paper
	var questionIDs []uint
	for _, q := range paper.Questions {
		questionIDs = append(questionIDs, q.QuestionID)
	}

	// Get questions
	questions, err := s.questionRepo.GetByIDs(questionIDs)
	if err != nil {
		return nil, nil, err
	}

	return paper, questions, nil
}

// StartPaper starts a paper for a user
func (s *QuestionService) StartPaper(userID, paperID uint) (*model.UserPaperRecord, error) {
	// Check paper exists and is published
	paper, err := s.paperRepo.GetByID(paperID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPaperNotFound
		}
		return nil, err
	}
	if paper.Status != model.PaperStatusPublished {
		return nil, ErrPaperNotPublished
	}

	// Check if user already has an in-progress record
	existing, _ := s.paperRecordRepo.GetInProgressByUserAndPaper(userID, paperID)
	if existing != nil {
		// Return existing record
		return existing, nil
	}

	// Create new record
	record := &model.UserPaperRecord{
		UserID:    userID,
		PaperID:   paperID,
		StartTime: time.Now(),
		Status:    model.UserPaperStatusInProgress,
		Answers:   model.PaperAnswers{},
	}
	if err := s.paperRecordRepo.Create(record); err != nil {
		return nil, err
	}

	record.Paper = paper
	return record, nil
}

// SubmitPaper submits a paper
func (s *QuestionService) SubmitPaper(userID, paperID uint, answers []model.PaperAnswer) (*model.UserPaperResultResponse, error) {
	// Get in-progress record
	record, err := s.paperRecordRepo.GetInProgressByUserAndPaper(userID, paperID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPaperNotInProgress
		}
		return nil, err
	}

	// Get paper
	paper, err := s.paperRepo.GetByID(paperID)
	if err != nil {
		return nil, err
	}

	// Build question ID to score map
	questionScores := make(map[uint]float64)
	for _, q := range paper.Questions {
		questionScores[q.QuestionID] = q.Score
	}

	// Get questions for answer checking
	var questionIDs []uint
	for _, a := range answers {
		questionIDs = append(questionIDs, a.QuestionID)
	}
	questions, err := s.questionRepo.GetByIDs(questionIDs)
	if err != nil {
		return nil, err
	}
	questionMap := make(map[uint]*model.Question)
	for i := range questions {
		questionMap[questions[i].ID] = &questions[i]
	}

	// Calculate score
	var totalScore float64
	var correctCount, wrongCount, unansweredCount int
	var totalTimeSpent int

	checkedAnswers := make([]model.PaperAnswer, len(answers))
	for i, a := range answers {
		checkedAnswers[i] = a
		if a.UserAnswer == "" {
			unansweredCount++
			continue
		}

		q, ok := questionMap[a.QuestionID]
		if !ok {
			continue
		}

		isCorrect := checkAnswer(q, a.UserAnswer)
		checkedAnswers[i].IsCorrect = isCorrect

		if isCorrect {
			correctCount++
			totalScore += questionScores[a.QuestionID]
		} else {
			wrongCount++
		}
		totalTimeSpent += a.TimeSpent

		// Update question stats
		_ = s.questionRepo.UpdateStats(a.QuestionID, isCorrect, a.TimeSpent)

		// Save individual question record
		qRecord := &model.UserQuestionRecord{
			UserID:       userID,
			QuestionID:   a.QuestionID,
			UserAnswer:   a.UserAnswer,
			IsCorrect:    isCorrect,
			TimeSpent:    a.TimeSpent,
			PracticeType: model.PracticeTypePaper,
			PracticeID:   &record.ID,
		}
		_ = s.recordRepo.Create(qRecord)
	}

	// Update record
	now := time.Now()
	record.EndTime = &now
	record.TimeSpent = int(now.Sub(record.StartTime).Seconds())
	if totalTimeSpent > 0 {
		record.TimeSpent = totalTimeSpent
	}
	record.Score = totalScore
	record.CorrectCount = correctCount
	record.WrongCount = wrongCount
	record.UnansweredCount = unansweredCount
	record.Answers = checkedAnswers
	record.Status = model.UserPaperStatusScored

	if err := s.paperRecordRepo.Update(record); err != nil {
		return nil, err
	}

	// Update paper stats
	_ = s.paperRepo.UpdateStats(paperID, totalScore)

	record.Paper = paper
	return record.ToResultResponse(), nil
}

// GetPaperResult gets paper result
func (s *QuestionService) GetPaperResult(recordID uint, userID uint) (*model.UserPaperResultResponse, error) {
	record, err := s.paperRecordRepo.GetByID(recordID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPaperRecordNotFound
		}
		return nil, err
	}

	// Verify ownership
	if record.UserID != userID {
		return nil, ErrPaperRecordNotFound
	}

	return record.ToResultResponse(), nil
}

// GetUserPaperRecords gets user's paper records
func (s *QuestionService) GetUserPaperRecords(userID uint, page, pageSize int) ([]model.UserPaperRecordResponse, int64, error) {
	records, total, err := s.paperRecordRepo.GetUserPaperRecords(userID, page, pageSize)
	if err != nil {
		return nil, 0, err
	}

	var responses []model.UserPaperRecordResponse
	for _, r := range records {
		responses = append(responses, *r.ToResponse())
	}

	return responses, total, nil
}

// GetPaperRanking gets user's ranking for a paper
func (s *QuestionService) GetPaperRanking(userID, paperID, recordID uint) (*repository.PaperRankingInfo, error) {
	// Get the record
	record, err := s.paperRecordRepo.GetByID(recordID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrPaperRecordNotFound
		}
		return nil, err
	}

	// Verify ownership
	if record.UserID != userID {
		return nil, ErrPaperRecordNotFound
	}

	// Verify paper ID matches
	if record.PaperID != paperID {
		return nil, ErrPaperRecordNotFound
	}

	return s.paperRecordRepo.GetPaperRanking(userID, paperID, record.Score)
}

// =====================================================
// Collection Operations
// =====================================================

// CollectQuestion collects a question
func (s *QuestionService) CollectQuestion(userID, questionID uint) error {
	// Check question exists
	_, err := s.questionRepo.GetByID(questionID)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return ErrQuestionNotFound
		}
		return err
	}

	// Check if already collected
	if s.collectRepo.IsCollected(userID, questionID) {
		return ErrQuestionAlreadyCollect
	}

	// Create collect record
	collect := &model.UserQuestionCollect{
		UserID:     userID,
		QuestionID: questionID,
	}
	return s.collectRepo.Create(collect)
}

// UncollectQuestion removes a question from collection
func (s *QuestionService) UncollectQuestion(userID, questionID uint) error {
	if !s.collectRepo.IsCollected(userID, questionID) {
		return ErrQuestionNotCollected
	}
	return s.collectRepo.Delete(userID, questionID)
}

// GetUserCollects gets user's collected questions
func (s *QuestionService) GetUserCollects(userID uint, page, pageSize int) ([]model.UserQuestionCollect, int64, error) {
	return s.collectRepo.GetUserCollects(userID, page, pageSize)
}

// UpdateCollectNote updates the note of a collected question
func (s *QuestionService) UpdateCollectNote(userID, questionID uint, note string) error {
	if !s.collectRepo.IsCollected(userID, questionID) {
		return ErrQuestionNotCollected
	}
	return s.collectRepo.UpdateNote(userID, questionID, note)
}

// =====================================================
// Material Operations
// =====================================================

// GetMaterialByID gets a material by ID
func (s *QuestionService) GetMaterialByID(id uint) (*model.QuestionMaterialResponse, error) {
	material, err := s.materialRepo.GetByID(id)
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, ErrMaterialNotFound
		}
		return nil, err
	}
	return material.ToResponse(), nil
}

// =====================================================
// Admin Operations
// =====================================================

// CreateQuestion creates a new question (admin)
func (s *QuestionService) CreateQuestion(question *model.Question) error {
	return s.questionRepo.Create(question)
}

// UpdateQuestion updates a question (admin)
func (s *QuestionService) UpdateQuestion(question *model.Question) error {
	return s.questionRepo.Update(question)
}

// DeleteQuestion deletes a question (admin)
func (s *QuestionService) DeleteQuestion(id uint) error {
	return s.questionRepo.Delete(id)
}

// BatchCreateQuestions creates multiple questions (admin)
func (s *QuestionService) BatchCreateQuestions(questions []model.Question) error {
	return s.questionRepo.BatchCreate(questions)
}

// CreateMaterial creates a new material (admin)
func (s *QuestionService) CreateMaterial(material *model.QuestionMaterial) error {
	return s.materialRepo.Create(material)
}

// UpdateMaterial updates a material (admin)
func (s *QuestionService) UpdateMaterial(material *model.QuestionMaterial) error {
	return s.materialRepo.Update(material)
}

// DeleteMaterial deletes a material (admin)
func (s *QuestionService) DeleteMaterial(id uint) error {
	return s.materialRepo.Delete(id)
}

// GetMaterials gets all materials with pagination (admin)
func (s *QuestionService) GetMaterials(page, pageSize int) ([]model.QuestionMaterial, int64, error) {
	return s.materialRepo.GetAll(page, pageSize)
}

// CreatePaper creates a new paper (admin)
func (s *QuestionService) CreatePaper(paper *model.ExamPaper) error {
	return s.paperRepo.Create(paper)
}

// UpdatePaper updates a paper (admin)
func (s *QuestionService) UpdatePaper(paper *model.ExamPaper) error {
	return s.paperRepo.Update(paper)
}

// DeletePaper deletes a paper (admin)
func (s *QuestionService) DeletePaper(id uint) error {
	return s.paperRepo.Delete(id)
}

// GetAllQuestions gets all questions for admin
func (s *QuestionService) GetAllQuestions(params *repository.QuestionQueryParams) ([]model.Question, int64, error) {
	// For admin, don't filter by status
	params.Status = nil
	return s.questionRepo.GetList(params)
}

// GetAllPapers gets all papers for admin
func (s *QuestionService) GetAllPapers(params *repository.PaperQueryParams) ([]model.ExamPaper, int64, error) {
	// For admin, don't filter by status
	params.Status = nil
	return s.paperRepo.GetList(params)
}
