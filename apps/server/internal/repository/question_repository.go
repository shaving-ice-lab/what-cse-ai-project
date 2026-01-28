package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// =====================================================
// Question Repository
// =====================================================

type QuestionRepository struct {
	db *gorm.DB
}

func NewQuestionRepository(db *gorm.DB) *QuestionRepository {
	return &QuestionRepository{db: db}
}

// QuestionQueryParams 题目查询参数
type QuestionQueryParams struct {
	CategoryID   uint   `query:"category_id"`
	QuestionType string `query:"question_type"`
	Difficulty   *int   `query:"difficulty"`
	SourceType   string `query:"source_type"`
	SourceYear   *int   `query:"source_year"`
	SourceRegion string `query:"source_region"`
	IsVIP        *bool  `query:"is_vip"`
	Status       *int   `query:"status"`
	Keyword      string `query:"keyword"`
	ExcludeIDs   []uint `query:"-"`
	Page         int    `query:"page"`
	PageSize     int    `query:"page_size"`
}

// Create creates a new question
func (r *QuestionRepository) Create(question *model.Question) error {
	return r.db.Create(question).Error
}

// Update updates a question
func (r *QuestionRepository) Update(question *model.Question) error {
	return r.db.Save(question).Error
}

// Delete soft deletes a question
func (r *QuestionRepository) Delete(id uint) error {
	return r.db.Delete(&model.Question{}, id).Error
}

// GetByID gets a question by ID
func (r *QuestionRepository) GetByID(id uint) (*model.Question, error) {
	var question model.Question
	err := r.db.Preload("Category").Preload("Material").First(&question, id).Error
	if err != nil {
		return nil, err
	}
	return &question, nil
}

// GetList gets questions with filters and pagination
func (r *QuestionRepository) GetList(params *QuestionQueryParams) ([]model.Question, int64, error) {
	var questions []model.Question
	var total int64

	query := r.db.Model(&model.Question{})

	// Apply filters
	if params.CategoryID > 0 {
		query = query.Where("category_id = ?", params.CategoryID)
	}
	if params.QuestionType != "" {
		query = query.Where("question_type = ?", params.QuestionType)
	}
	if params.Difficulty != nil {
		query = query.Where("difficulty = ?", *params.Difficulty)
	}
	if params.SourceType != "" {
		query = query.Where("source_type = ?", params.SourceType)
	}
	if params.SourceYear != nil {
		query = query.Where("source_year = ?", *params.SourceYear)
	}
	if params.SourceRegion != "" {
		query = query.Where("source_region = ?", params.SourceRegion)
	}
	if params.IsVIP != nil {
		query = query.Where("is_vip = ?", *params.IsVIP)
	}
	if params.Status != nil {
		query = query.Where("status = ?", *params.Status)
	} else {
		// Default: only published questions
		query = query.Where("status = ?", model.QuestionStatusPublished)
	}
	if params.Keyword != "" {
		keyword := "%" + params.Keyword + "%"
		query = query.Where("content LIKE ?", keyword)
	}
	if len(params.ExcludeIDs) > 0 {
		query = query.Where("id NOT IN ?", params.ExcludeIDs)
	}

	// Count total
	query.Count(&total)

	// Pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Preload("Category").
		Order("sort_order ASC, created_at DESC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&questions).Error

	return questions, total, err
}

// GetByCategory gets questions by category
func (r *QuestionRepository) GetByCategory(categoryID uint, page, pageSize int) ([]model.Question, int64, error) {
	return r.GetList(&QuestionQueryParams{
		CategoryID: categoryID,
		Page:       page,
		PageSize:   pageSize,
	})
}

// GetRandomQuestions gets random questions
func (r *QuestionRepository) GetRandomQuestions(categoryID uint, count int, excludeIDs []uint) ([]model.Question, error) {
	var questions []model.Question

	query := r.db.Model(&model.Question{}).
		Where("status = ?", model.QuestionStatusPublished)

	if categoryID > 0 {
		query = query.Where("category_id = ?", categoryID)
	}
	if len(excludeIDs) > 0 {
		query = query.Where("id NOT IN ?", excludeIDs)
	}

	err := query.Order("RAND()").
		Limit(count).
		Preload("Category").
		Find(&questions).Error

	return questions, err
}

// GetByIDs gets questions by IDs
func (r *QuestionRepository) GetByIDs(ids []uint) ([]model.Question, error) {
	var questions []model.Question
	err := r.db.Where("id IN ?", ids).
		Preload("Category").
		Preload("Material").
		Find(&questions).Error
	return questions, err
}

// UpdateStats updates question statistics
func (r *QuestionRepository) UpdateStats(id uint, isCorrect bool, timeSpent int) error {
	updates := map[string]interface{}{
		"attempt_count": gorm.Expr("attempt_count + 1"),
		"avg_time":      gorm.Expr("(avg_time * attempt_count + ?) / (attempt_count + 1)", timeSpent),
	}
	if isCorrect {
		updates["correct_count"] = gorm.Expr("correct_count + 1")
	}

	if err := r.db.Model(&model.Question{}).Where("id = ?", id).Updates(updates).Error; err != nil {
		return err
	}

	// Update correct rate
	return r.db.Model(&model.Question{}).
		Where("id = ? AND attempt_count > 0", id).
		Update("correct_rate", gorm.Expr("ROUND(correct_count * 100.0 / attempt_count, 2)")).Error
}

// BatchCreate creates multiple questions
func (r *QuestionRepository) BatchCreate(questions []model.Question) error {
	return r.db.CreateInBatches(questions, 100).Error
}

// =====================================================
// Question Material Repository
// =====================================================

type QuestionMaterialRepository struct {
	db *gorm.DB
}

func NewQuestionMaterialRepository(db *gorm.DB) *QuestionMaterialRepository {
	return &QuestionMaterialRepository{db: db}
}

// Create creates a new material
func (r *QuestionMaterialRepository) Create(material *model.QuestionMaterial) error {
	return r.db.Create(material).Error
}

// Update updates a material
func (r *QuestionMaterialRepository) Update(material *model.QuestionMaterial) error {
	return r.db.Save(material).Error
}

// Delete soft deletes a material
func (r *QuestionMaterialRepository) Delete(id uint) error {
	return r.db.Delete(&model.QuestionMaterial{}, id).Error
}

// GetByID gets a material by ID
func (r *QuestionMaterialRepository) GetByID(id uint) (*model.QuestionMaterial, error) {
	var material model.QuestionMaterial
	err := r.db.First(&material, id).Error
	if err != nil {
		return nil, err
	}
	return &material, nil
}

// GetWithQuestions gets a material with its questions
func (r *QuestionMaterialRepository) GetWithQuestions(id uint) (*model.QuestionMaterial, error) {
	var material model.QuestionMaterial
	err := r.db.Preload("Questions").First(&material, id).Error
	if err != nil {
		return nil, err
	}
	return &material, nil
}

// GetAll gets all materials with pagination
func (r *QuestionMaterialRepository) GetAll(page, pageSize int) ([]model.QuestionMaterial, int64, error) {
	var materials []model.QuestionMaterial
	var total int64

	r.db.Model(&model.QuestionMaterial{}).Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := r.db.Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&materials).Error

	return materials, total, err
}

// =====================================================
// Exam Paper Repository
// =====================================================

type ExamPaperRepository struct {
	db *gorm.DB
}

func NewExamPaperRepository(db *gorm.DB) *ExamPaperRepository {
	return &ExamPaperRepository{db: db}
}

// PaperQueryParams 试卷查询参数
type PaperQueryParams struct {
	PaperType string `query:"paper_type"`
	ExamType  string `query:"exam_type"`
	Subject   string `query:"subject"`
	Year      *int   `query:"year"`
	Region    string `query:"region"`
	IsFree    *bool  `query:"is_free"`
	Status    *int   `query:"status"`
	Keyword   string `query:"keyword"`
	Page      int    `query:"page"`
	PageSize  int    `query:"page_size"`
}

// Create creates a new paper
func (r *ExamPaperRepository) Create(paper *model.ExamPaper) error {
	return r.db.Create(paper).Error
}

// Update updates a paper
func (r *ExamPaperRepository) Update(paper *model.ExamPaper) error {
	return r.db.Save(paper).Error
}

// Delete soft deletes a paper
func (r *ExamPaperRepository) Delete(id uint) error {
	return r.db.Delete(&model.ExamPaper{}, id).Error
}

// GetByID gets a paper by ID
func (r *ExamPaperRepository) GetByID(id uint) (*model.ExamPaper, error) {
	var paper model.ExamPaper
	err := r.db.First(&paper, id).Error
	if err != nil {
		return nil, err
	}
	return &paper, nil
}

// GetList gets papers with filters and pagination
func (r *ExamPaperRepository) GetList(params *PaperQueryParams) ([]model.ExamPaper, int64, error) {
	var papers []model.ExamPaper
	var total int64

	query := r.db.Model(&model.ExamPaper{})

	// Apply filters
	if params.PaperType != "" {
		query = query.Where("paper_type = ?", params.PaperType)
	}
	if params.ExamType != "" {
		query = query.Where("exam_type = ?", params.ExamType)
	}
	if params.Subject != "" {
		query = query.Where("subject = ?", params.Subject)
	}
	if params.Year != nil {
		query = query.Where("year = ?", *params.Year)
	}
	if params.Region != "" {
		query = query.Where("region = ?", params.Region)
	}
	if params.IsFree != nil {
		query = query.Where("is_free = ?", *params.IsFree)
	}
	if params.Status != nil {
		query = query.Where("status = ?", *params.Status)
	} else {
		query = query.Where("status = ?", model.PaperStatusPublished)
	}
	if params.Keyword != "" {
		keyword := "%" + params.Keyword + "%"
		query = query.Where("title LIKE ?", keyword)
	}

	// Count total
	query.Count(&total)

	// Pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 20
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Order("sort_order ASC, created_at DESC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&papers).Error

	return papers, total, err
}

// UpdateStats updates paper statistics
func (r *ExamPaperRepository) UpdateStats(id uint, score float64) error {
	// First increment attempt count and add to total score
	if err := r.db.Model(&model.ExamPaper{}).
		Where("id = ?", id).
		Updates(map[string]interface{}{
			"attempt_count": gorm.Expr("attempt_count + 1"),
			"avg_score":     gorm.Expr("(avg_score * attempt_count + ?) / (attempt_count + 1)", score),
		}).Error; err != nil {
		return err
	}
	return nil
}

// =====================================================
// User Question Record Repository
// =====================================================

type UserQuestionRecordRepository struct {
	db *gorm.DB
}

func NewUserQuestionRecordRepository(db *gorm.DB) *UserQuestionRecordRepository {
	return &UserQuestionRecordRepository{db: db}
}

// Create creates a new record
func (r *UserQuestionRecordRepository) Create(record *model.UserQuestionRecord) error {
	return r.db.Create(record).Error
}

// GetByUserAndQuestion gets the latest record for a user-question pair
func (r *UserQuestionRecordRepository) GetByUserAndQuestion(userID, questionID uint) (*model.UserQuestionRecord, error) {
	var record model.UserQuestionRecord
	err := r.db.Where("user_id = ? AND question_id = ?", userID, questionID).
		Order("created_at DESC").
		First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

// GetUserWrongQuestions gets user's wrong questions
func (r *UserQuestionRecordRepository) GetUserWrongQuestions(userID uint, page, pageSize int) ([]model.UserQuestionRecord, int64, error) {
	var records []model.UserQuestionRecord
	var total int64

	// Get the latest record for each question where user got it wrong
	subQuery := r.db.Model(&model.UserQuestionRecord{}).
		Select("MAX(id) as id").
		Where("user_id = ? AND is_correct = ?", userID, false).
		Group("question_id")

	query := r.db.Model(&model.UserQuestionRecord{}).
		Where("id IN (?)", subQuery)

	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Preload("Question").Preload("Question.Category").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&records).Error

	return records, total, err
}

// GetUserStats gets user's question statistics
func (r *UserQuestionRecordRepository) GetUserStats(userID uint) (*model.UserQuestionStats, error) {
	var stats model.UserQuestionStats

	// Total attempts
	var totalAttempts int64
	r.db.Model(&model.UserQuestionRecord{}).
		Where("user_id = ?", userID).
		Count(&totalAttempts)
	stats.TotalAttempts = int(totalAttempts)

	// Correct count
	var correctCount int64
	r.db.Model(&model.UserQuestionRecord{}).
		Where("user_id = ? AND is_correct = ?", userID, true).
		Count(&correctCount)
	stats.CorrectCount = int(correctCount)

	stats.WrongCount = stats.TotalAttempts - stats.CorrectCount

	// Total correct rate
	if stats.TotalAttempts > 0 {
		stats.TotalCorrectRate = float64(stats.CorrectCount) * 100 / float64(stats.TotalAttempts)
	}

	// Today's statistics
	today := time.Now().Format("2006-01-02")
	var todayAttempts int64
	r.db.Model(&model.UserQuestionRecord{}).
		Where("user_id = ? AND DATE(created_at) = ?", userID, today).
		Count(&todayAttempts)
	stats.TodayAttempts = int(todayAttempts)

	var todayCorrect int64
	r.db.Model(&model.UserQuestionRecord{}).
		Where("user_id = ? AND DATE(created_at) = ? AND is_correct = ?", userID, today, true).
		Count(&todayCorrect)

	if stats.TodayAttempts > 0 {
		stats.TodayCorrectRate = float64(todayCorrect) * 100 / float64(stats.TodayAttempts)
	}

	// Consecutive days (simplified calculation)
	var consecutiveDays int64
	r.db.Raw(`
		SELECT COUNT(DISTINCT DATE(created_at)) as days
		FROM what_user_question_records
		WHERE user_id = ?
		AND DATE(created_at) >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
	`, userID).Scan(&consecutiveDays)
	stats.ConsecutiveDays = int(consecutiveDays)

	// Total study time
	var totalTime int64
	r.db.Model(&model.UserQuestionRecord{}).
		Where("user_id = ?", userID).
		Select("COALESCE(SUM(time_spent), 0)").
		Scan(&totalTime)
	stats.TotalStudyTime = int(totalTime / 60) // Convert to minutes

	return &stats, nil
}

// GetUserQuestionIDs gets all question IDs that user has attempted
func (r *UserQuestionRecordRepository) GetUserQuestionIDs(userID uint) ([]uint, error) {
	var ids []uint
	err := r.db.Model(&model.UserQuestionRecord{}).
		Where("user_id = ?", userID).
		Distinct("question_id").
		Pluck("question_id", &ids).Error
	return ids, err
}

// CategoryProgressStat 分类练习进度统计
type CategoryProgressStat struct {
	CategoryID       uint    `json:"category_id"`
	CategoryName     string  `json:"category_name"`
	TotalQuestions   int     `json:"total_questions"`
	DoneCount        int     `json:"done_count"`
	CorrectCount     int     `json:"correct_count"`
	Progress         float64 `json:"progress"`        // 完成百分比
	CorrectRate      float64 `json:"correct_rate"`    // 正确率
}

// GetUserCategoryProgress gets user's progress for each category
func (r *UserQuestionRecordRepository) GetUserCategoryProgress(userID uint, categoryIDs []uint) ([]CategoryProgressStat, error) {
	var stats []CategoryProgressStat

	// Get total questions per category
	type categoryCount struct {
		CategoryID uint
		Count      int64
	}
	var totalCounts []categoryCount
	
	query := r.db.Model(&model.Question{}).
		Select("category_id, COUNT(*) as count").
		Where("status = ?", model.QuestionStatusPublished)
	
	if len(categoryIDs) > 0 {
		query = query.Where("category_id IN ?", categoryIDs)
	}
	
	if err := query.Group("category_id").Scan(&totalCounts).Error; err != nil {
		return nil, err
	}

	// Build a map of total counts
	totalMap := make(map[uint]int64)
	for _, tc := range totalCounts {
		totalMap[tc.CategoryID] = tc.Count
	}

	// Get user's done count and correct count per category
	type userProgress struct {
		CategoryID   uint
		DoneCount    int64
		CorrectCount int64
	}
	var userStats []userProgress

	// Get distinct question attempts per category with correct count
	subQuery := r.db.Model(&model.UserQuestionRecord{}).
		Select("DISTINCT question_id, is_correct").
		Where("user_id = ?", userID)

	if err := r.db.Table("(?) as uq", subQuery).
		Joins("JOIN what_questions q ON q.id = uq.question_id").
		Select("q.category_id, COUNT(DISTINCT uq.question_id) as done_count, SUM(CASE WHEN uq.is_correct = 1 THEN 1 ELSE 0 END) as correct_count").
		Where("q.status = ?", model.QuestionStatusPublished).
		Group("q.category_id").
		Scan(&userStats).Error; err != nil {
		// Fallback to simpler query if join fails
		r.db.Raw(`
			SELECT q.category_id, 
				   COUNT(DISTINCT uqr.question_id) as done_count,
				   SUM(CASE WHEN uqr.is_correct = 1 THEN 1 ELSE 0 END) as correct_count
			FROM what_user_question_records uqr
			JOIN what_questions q ON q.id = uqr.question_id
			WHERE uqr.user_id = ? AND q.status = ?
			GROUP BY q.category_id
		`, userID, model.QuestionStatusPublished).Scan(&userStats)
	}

	// Build user progress map
	doneMap := make(map[uint]int64)
	correctMap := make(map[uint]int64)
	for _, us := range userStats {
		doneMap[us.CategoryID] = us.DoneCount
		correctMap[us.CategoryID] = us.CorrectCount
	}

	// Get category names
	var categories []model.CourseCategory
	catIDs := make([]uint, 0, len(totalMap))
	for catID := range totalMap {
		catIDs = append(catIDs, catID)
	}
	r.db.Where("id IN ?", catIDs).Find(&categories)
	
	catNameMap := make(map[uint]string)
	for _, cat := range categories {
		catNameMap[cat.ID] = cat.Name
	}

	// Build result
	for catID, total := range totalMap {
		done := doneMap[catID]
		correct := correctMap[catID]
		
		stat := CategoryProgressStat{
			CategoryID:     catID,
			CategoryName:   catNameMap[catID],
			TotalQuestions: int(total),
			DoneCount:      int(done),
			CorrectCount:   int(correct),
		}
		
		if total > 0 {
			stat.Progress = float64(done) * 100 / float64(total)
		}
		if done > 0 {
			stat.CorrectRate = float64(correct) * 100 / float64(done)
		}
		
		stats = append(stats, stat)
	}

	return stats, nil
}

// =====================================================
// User Paper Record Repository
// =====================================================

type UserPaperRecordRepository struct {
	db *gorm.DB
}

func NewUserPaperRecordRepository(db *gorm.DB) *UserPaperRecordRepository {
	return &UserPaperRecordRepository{db: db}
}

// Create creates a new record
func (r *UserPaperRecordRepository) Create(record *model.UserPaperRecord) error {
	return r.db.Create(record).Error
}

// Update updates a record
func (r *UserPaperRecordRepository) Update(record *model.UserPaperRecord) error {
	return r.db.Save(record).Error
}

// GetByID gets a record by ID
func (r *UserPaperRecordRepository) GetByID(id uint) (*model.UserPaperRecord, error) {
	var record model.UserPaperRecord
	err := r.db.Preload("Paper").First(&record, id).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

// GetInProgressByUserAndPaper gets in-progress record for a user-paper pair
func (r *UserPaperRecordRepository) GetInProgressByUserAndPaper(userID, paperID uint) (*model.UserPaperRecord, error) {
	var record model.UserPaperRecord
	err := r.db.Where("user_id = ? AND paper_id = ? AND status = ?", userID, paperID, model.UserPaperStatusInProgress).
		First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

// GetUserPaperRecords gets user's paper records
func (r *UserPaperRecordRepository) GetUserPaperRecords(userID uint, page, pageSize int) ([]model.UserPaperRecord, int64, error) {
	var records []model.UserPaperRecord
	var total int64

	query := r.db.Model(&model.UserPaperRecord{}).Where("user_id = ?", userID)
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Preload("Paper").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&records).Error

	return records, total, err
}

// GetUserBestScore gets user's best score for a paper
func (r *UserPaperRecordRepository) GetUserBestScore(userID, paperID uint) (float64, error) {
	var score float64
	err := r.db.Model(&model.UserPaperRecord{}).
		Where("user_id = ? AND paper_id = ? AND status = ?", userID, paperID, model.UserPaperStatusScored).
		Select("MAX(score)").
		Scan(&score).Error
	return score, err
}

// PaperRankingInfo 试卷排名信息
type PaperRankingInfo struct {
	UserRank        int     `json:"user_rank"`         // 用户排名
	TotalParticipants int   `json:"total_participants"` // 总参与人数
	UserScore       float64 `json:"user_score"`        // 用户得分
	AvgScore        float64 `json:"avg_score"`         // 平均分
	HighestScore    float64 `json:"highest_score"`     // 最高分
	LowestScore     float64 `json:"lowest_score"`      // 最低分
	Percentile      float64 `json:"percentile"`        // 超过的百分比
}

// GetPaperRanking gets the ranking info for a user's paper attempt
func (r *UserPaperRecordRepository) GetPaperRanking(userID, paperID uint, userScore float64) (*PaperRankingInfo, error) {
	info := &PaperRankingInfo{
		UserScore: userScore,
	}

	// Get total participants (distinct users who completed this paper)
	var totalParticipants int64
	if err := r.db.Model(&model.UserPaperRecord{}).
		Where("paper_id = ? AND status = ?", paperID, model.UserPaperStatusScored).
		Distinct("user_id").
		Count(&totalParticipants).Error; err != nil {
		return nil, err
	}
	info.TotalParticipants = int(totalParticipants)

	// Get user rank (how many users have higher best scores)
	var higherCount int64
	subQuery := r.db.Model(&model.UserPaperRecord{}).
		Select("user_id, MAX(score) as best_score").
		Where("paper_id = ? AND status = ?", paperID, model.UserPaperStatusScored).
		Group("user_id")

	if err := r.db.Table("(?) as best_scores", subQuery).
		Where("best_score > ?", userScore).
		Count(&higherCount).Error; err != nil {
		// Fallback to simpler query
		r.db.Raw(`
			SELECT COUNT(*) FROM (
				SELECT user_id, MAX(score) as best_score 
				FROM what_user_paper_records 
				WHERE paper_id = ? AND status = ?
				GROUP BY user_id
			) as best_scores
			WHERE best_score > ?
		`, paperID, model.UserPaperStatusScored, userScore).Scan(&higherCount)
	}
	info.UserRank = int(higherCount) + 1

	// Calculate percentile (percentage of users the current user beats)
	if totalParticipants > 1 {
		info.Percentile = float64(totalParticipants-higherCount-1) / float64(totalParticipants-1) * 100
	} else {
		info.Percentile = 100 // If only one participant, they're top 100%
	}

	// Get score statistics
	var avgScore float64
	r.db.Model(&model.UserPaperRecord{}).
		Where("paper_id = ? AND status = ?", paperID, model.UserPaperStatusScored).
		Select("AVG(score)").
		Scan(&avgScore)
	info.AvgScore = avgScore

	var highestScore float64
	r.db.Model(&model.UserPaperRecord{}).
		Where("paper_id = ? AND status = ?", paperID, model.UserPaperStatusScored).
		Select("MAX(score)").
		Scan(&highestScore)
	info.HighestScore = highestScore

	var lowestScore float64
	r.db.Model(&model.UserPaperRecord{}).
		Where("paper_id = ? AND status = ?", paperID, model.UserPaperStatusScored).
		Select("MIN(score)").
		Scan(&lowestScore)
	info.LowestScore = lowestScore

	return info, nil
}

// =====================================================
// User Question Collect Repository
// =====================================================

type UserQuestionCollectRepository struct {
	db *gorm.DB
}

func NewUserQuestionCollectRepository(db *gorm.DB) *UserQuestionCollectRepository {
	return &UserQuestionCollectRepository{db: db}
}

// Create creates a collect record
func (r *UserQuestionCollectRepository) Create(collect *model.UserQuestionCollect) error {
	return r.db.Create(collect).Error
}

// Delete removes a collect record
func (r *UserQuestionCollectRepository) Delete(userID, questionID uint) error {
	return r.db.Where("user_id = ? AND question_id = ?", userID, questionID).
		Delete(&model.UserQuestionCollect{}).Error
}

// IsCollected checks if a question is collected by user
func (r *UserQuestionCollectRepository) IsCollected(userID, questionID uint) bool {
	var count int64
	r.db.Model(&model.UserQuestionCollect{}).
		Where("user_id = ? AND question_id = ?", userID, questionID).
		Count(&count)
	return count > 0
}

// GetUserCollects gets all collected questions for a user
func (r *UserQuestionCollectRepository) GetUserCollects(userID uint, page, pageSize int) ([]model.UserQuestionCollect, int64, error) {
	var collects []model.UserQuestionCollect
	var total int64

	query := r.db.Model(&model.UserQuestionCollect{}).Where("user_id = ?", userID)
	query.Count(&total)

	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 || pageSize > 100 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Preload("Question").Preload("Question.Category").
		Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&collects).Error

	return collects, total, err
}

// UpdateNote updates the note of a collect record
func (r *UserQuestionCollectRepository) UpdateNote(userID, questionID uint, note string) error {
	return r.db.Model(&model.UserQuestionCollect{}).
		Where("user_id = ? AND question_id = ?", userID, questionID).
		Update("note", note).Error
}
