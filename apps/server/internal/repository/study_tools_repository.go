package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// =====================================================
// Study Plan Repository
// =====================================================

type StudyPlanRepository struct {
	db *gorm.DB
}

func NewStudyPlanRepository(db *gorm.DB) *StudyPlanRepository {
	return &StudyPlanRepository{db: db}
}

// Create 创建学习计划
func (r *StudyPlanRepository) Create(plan *model.StudyPlan) error {
	// 计算总天数
	plan.TotalDays = int(plan.EndDate.Sub(plan.StartDate).Hours()/24) + 1
	return r.db.Create(plan).Error
}

// Update 更新学习计划
func (r *StudyPlanRepository) Update(plan *model.StudyPlan) error {
	return r.db.Save(plan).Error
}

// UpdateFields 更新指定字段
func (r *StudyPlanRepository) UpdateFields(userID, planID uint, updates map[string]interface{}) error {
	return r.db.Model(&model.StudyPlan{}).
		Where("id = ? AND user_id = ?", planID, userID).
		Updates(updates).Error
}

// Delete 删除学习计划
func (r *StudyPlanRepository) Delete(userID, planID uint) error {
	return r.db.Where("id = ? AND user_id = ?", planID, userID).Delete(&model.StudyPlan{}).Error
}

// GetByID 获取单个计划
func (r *StudyPlanRepository) GetByID(userID, planID uint) (*model.StudyPlan, error) {
	var plan model.StudyPlan
	err := r.db.Where("id = ? AND user_id = ?", planID, userID).First(&plan).Error
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

// GetActiveByUser 获取用户进行中的计划
func (r *StudyPlanRepository) GetActiveByUser(userID uint) (*model.StudyPlan, error) {
	var plan model.StudyPlan
	err := r.db.Where("user_id = ? AND status = ?", userID, model.StudyPlanStatusActive).
		Order("created_at DESC").
		First(&plan).Error
	if err != nil {
		return nil, err
	}
	return &plan, nil
}

// StudyPlanQueryParams 查询参数
type StudyPlanQueryParams struct {
	Status   model.StudyPlanStatus
	ExamType string
	Page     int
	PageSize int
}

// GetByUser 获取用户的学习计划列表
func (r *StudyPlanRepository) GetByUser(userID uint, params *StudyPlanQueryParams) ([]model.StudyPlan, int64, error) {
	var plans []model.StudyPlan
	var total int64

	query := r.db.Model(&model.StudyPlan{}).Where("user_id = ?", userID)

	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}
	if params.ExamType != "" {
		query = query.Where("exam_type = ?", params.ExamType)
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 10
	}

	offset := (params.Page - 1) * params.PageSize
	err = query.Order("created_at DESC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&plans).Error

	return plans, total, err
}

// GetAllTemplates 获取所有公开模板
func (r *StudyPlanRepository) GetAllTemplates(examType string) ([]model.StudyPlanTemplate, error) {
	var templates []model.StudyPlanTemplate
	query := r.db.Where("is_public = ?", true)
	if examType != "" {
		query = query.Where("exam_type = ?", examType)
	}
	err := query.Order("sort_order ASC, use_count DESC").Find(&templates).Error
	return templates, err
}

// GetTemplateByID 获取模板
func (r *StudyPlanRepository) GetTemplateByID(id uint) (*model.StudyPlanTemplate, error) {
	var template model.StudyPlanTemplate
	err := r.db.First(&template, id).Error
	if err != nil {
		return nil, err
	}
	return &template, nil
}

// IncrementTemplateUseCount 增加模板使用次数
func (r *StudyPlanRepository) IncrementTemplateUseCount(id uint) error {
	return r.db.Model(&model.StudyPlanTemplate{}).Where("id = ?", id).
		Update("use_count", gorm.Expr("use_count + 1")).Error
}

// =====================================================
// Study Daily Task Repository
// =====================================================

// CreateDailyTask 创建每日任务
func (r *StudyPlanRepository) CreateDailyTask(task *model.StudyDailyTask) error {
	return r.db.Create(task).Error
}

// CreateDailyTasks 批量创建每日任务
func (r *StudyPlanRepository) CreateDailyTasks(tasks []model.StudyDailyTask) error {
	if len(tasks) == 0 {
		return nil
	}
	return r.db.CreateInBatches(tasks, 100).Error
}

// GetDailyTasks 获取某天的任务
func (r *StudyPlanRepository) GetDailyTasks(userID uint, date time.Time) ([]model.StudyDailyTask, error) {
	var tasks []model.StudyDailyTask
	err := r.db.Where("user_id = ? AND task_date = ?", userID, date.Format("2006-01-02")).
		Order("id ASC").
		Find(&tasks).Error
	return tasks, err
}

// UpdateDailyTask 更新每日任务
func (r *StudyPlanRepository) UpdateDailyTask(userID, taskID uint, updates map[string]interface{}) error {
	return r.db.Model(&model.StudyDailyTask{}).
		Where("id = ? AND user_id = ?", taskID, userID).
		Updates(updates).Error
}

// CompleteDailyTask 完成每日任务
func (r *StudyPlanRepository) CompleteDailyTask(userID, taskID uint) error {
	now := time.Now()
	return r.db.Model(&model.StudyDailyTask{}).
		Where("id = ? AND user_id = ?", taskID, userID).
		Updates(map[string]interface{}{
			"is_completed": true,
			"completed_at": &now,
		}).Error
}

// GetDailyTaskStats 获取每日任务完成统计
func (r *StudyPlanRepository) GetDailyTaskStats(userID, planID uint, date time.Time) (total, completed int64, err error) {
	query := r.db.Model(&model.StudyDailyTask{}).Where("user_id = ?", userID)
	if planID > 0 {
		query = query.Where("plan_id = ?", planID)
	}
	query = query.Where("task_date = ?", date.Format("2006-01-02"))

	err = query.Count(&total).Error
	if err != nil {
		return
	}

	err = query.Where("is_completed = ?", true).Count(&completed).Error
	return
}

// =====================================================
// Study Time Record Repository
// =====================================================

type StudyTimeRepository struct {
	db *gorm.DB
}

func NewStudyTimeRepository(db *gorm.DB) *StudyTimeRepository {
	return &StudyTimeRepository{db: db}
}

// Create 创建学习时长记录
func (r *StudyTimeRepository) Create(record *model.StudyTimeRecord) error {
	return r.db.Create(record).Error
}

// Update 更新记录
func (r *StudyTimeRepository) Update(record *model.StudyTimeRecord) error {
	return r.db.Save(record).Error
}

// EndSession 结束学习会话
func (r *StudyTimeRepository) EndSession(userID, recordID uint) error {
	now := time.Now()
	return r.db.Model(&model.StudyTimeRecord{}).
		Where("id = ? AND user_id = ? AND is_active = ?", recordID, userID, true).
		Updates(map[string]interface{}{
			"end_time":  &now,
			"is_active": false,
		}).Error
}

// GetActiveSession 获取进行中的学习会话
func (r *StudyTimeRepository) GetActiveSession(userID uint) (*model.StudyTimeRecord, error) {
	var record model.StudyTimeRecord
	err := r.db.Where("user_id = ? AND is_active = ?", userID, true).
		Order("start_time DESC").
		First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

// GetByID 获取记录
func (r *StudyTimeRepository) GetByID(userID, recordID uint) (*model.StudyTimeRecord, error) {
	var record model.StudyTimeRecord
	err := r.db.Where("id = ? AND user_id = ?", recordID, userID).First(&record).Error
	if err != nil {
		return nil, err
	}
	return &record, nil
}

// StudyTimeQueryParams 查询参数
type StudyTimeQueryParams struct {
	StudyType model.StudyType
	Subject   string
	StartDate time.Time
	EndDate   time.Time
	Page      int
	PageSize  int
}

// GetByUser 获取用户的学习记录
func (r *StudyTimeRepository) GetByUser(userID uint, params *StudyTimeQueryParams) ([]model.StudyTimeRecord, int64, error) {
	var records []model.StudyTimeRecord
	var total int64

	query := r.db.Model(&model.StudyTimeRecord{}).Where("user_id = ?", userID)

	if params.StudyType != "" {
		query = query.Where("study_type = ?", params.StudyType)
	}
	if params.Subject != "" {
		query = query.Where("subject = ?", params.Subject)
	}
	if !params.StartDate.IsZero() {
		query = query.Where("study_date >= ?", params.StartDate.Format("2006-01-02"))
	}
	if !params.EndDate.IsZero() {
		query = query.Where("study_date <= ?", params.EndDate.Format("2006-01-02"))
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}

	offset := (params.Page - 1) * params.PageSize
	err = query.Order("start_time DESC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&records).Error

	return records, total, err
}

// GetDailyStatistics 获取日统计
func (r *StudyTimeRepository) GetDailyStatistics(userID uint, date time.Time) (*model.StudyTimeDailySummary, error) {
	var summary model.StudyTimeDailySummary
	err := r.db.Where("user_id = ? AND study_date = ?", userID, date.Format("2006-01-02")).
		First(&summary).Error
	if err != nil {
		return nil, err
	}
	return &summary, nil
}

// GetStatisticsRange 获取日期范围内的统计
func (r *StudyTimeRepository) GetStatisticsRange(userID uint, startDate, endDate time.Time) ([]model.StudyTimeDailySummary, error) {
	var summaries []model.StudyTimeDailySummary
	err := r.db.Where("user_id = ? AND study_date BETWEEN ? AND ?",
		userID, startDate.Format("2006-01-02"), endDate.Format("2006-01-02")).
		Order("study_date ASC").
		Find(&summaries).Error
	return summaries, err
}

// UpsertDailySummary 更新或创建每日统计
func (r *StudyTimeRepository) UpsertDailySummary(userID uint, date time.Time, updates map[string]interface{}) error {
	var summary model.StudyTimeDailySummary
	err := r.db.Where("user_id = ? AND study_date = ?", userID, date.Format("2006-01-02")).
		First(&summary).Error

	if err == gorm.ErrRecordNotFound {
		// 创建新记录
		summary = model.StudyTimeDailySummary{
			UserID:    userID,
			StudyDate: date,
		}
		for k, v := range updates {
			switch k {
			case "total_seconds":
				summary.TotalSeconds = v.(int)
			case "video_seconds":
				summary.VideoSeconds = v.(int)
			case "practice_seconds":
				summary.PracticeSeconds = v.(int)
			case "article_seconds":
				summary.ArticleSeconds = v.(int)
			case "other_seconds":
				summary.OtherSeconds = v.(int)
			case "session_count":
				summary.SessionCount = v.(int)
			case "question_count":
				summary.QuestionCount = v.(int)
			case "correct_count":
				summary.CorrectCount = v.(int)
			}
		}
		return r.db.Create(&summary).Error
	}

	// 更新现有记录
	return r.db.Model(&summary).Updates(updates).Error
}

// IncrementDailySummary 增量更新每日统计
func (r *StudyTimeRepository) IncrementDailySummary(userID uint, date time.Time, field string, amount int) error {
	var summary model.StudyTimeDailySummary
	err := r.db.Where("user_id = ? AND study_date = ?", userID, date.Format("2006-01-02")).
		First(&summary).Error

	if err == gorm.ErrRecordNotFound {
		// 创建新记录
		summary = model.StudyTimeDailySummary{
			UserID:    userID,
			StudyDate: date,
		}
		switch field {
		case "total_seconds":
			summary.TotalSeconds = amount
		case "video_seconds":
			summary.VideoSeconds = amount
		case "practice_seconds":
			summary.PracticeSeconds = amount
		case "session_count":
			summary.SessionCount = amount
		case "question_count":
			summary.QuestionCount = amount
		case "correct_count":
			summary.CorrectCount = amount
		}
		return r.db.Create(&summary).Error
	}

	// 增量更新
	return r.db.Model(&summary).Update(field, gorm.Expr(field+" + ?", amount)).Error
}

// GetTotalStudyTime 获取总学习时长
func (r *StudyTimeRepository) GetTotalStudyTime(userID uint, startDate, endDate time.Time) (int, error) {
	var total struct {
		Sum int
	}
	query := r.db.Model(&model.StudyTimeDailySummary{}).
		Select("COALESCE(SUM(total_seconds), 0) as sum").
		Where("user_id = ?", userID)

	if !startDate.IsZero() {
		query = query.Where("study_date >= ?", startDate.Format("2006-01-02"))
	}
	if !endDate.IsZero() {
		query = query.Where("study_date <= ?", endDate.Format("2006-01-02"))
	}

	err := query.Scan(&total).Error
	return total.Sum, err
}

// =====================================================
// Learning Favorite Repository
// =====================================================

type LearningFavoriteRepository struct {
	db *gorm.DB
}

func NewLearningFavoriteRepository(db *gorm.DB) *LearningFavoriteRepository {
	return &LearningFavoriteRepository{db: db}
}

// Add 添加收藏
func (r *LearningFavoriteRepository) Add(favorite *model.LearningFavorite) error {
	return r.db.Create(favorite).Error
}

// Remove 删除收藏
func (r *LearningFavoriteRepository) Remove(userID uint, contentType model.LearningContentType, contentID uint) error {
	return r.db.Where("user_id = ? AND content_type = ? AND content_id = ?",
		userID, contentType, contentID).
		Delete(&model.LearningFavorite{}).Error
}

// RemoveByID 通过ID删除
func (r *LearningFavoriteRepository) RemoveByID(userID, favoriteID uint) error {
	return r.db.Where("id = ? AND user_id = ?", favoriteID, userID).
		Delete(&model.LearningFavorite{}).Error
}

// IsFavorite 检查是否已收藏
func (r *LearningFavoriteRepository) IsFavorite(userID uint, contentType model.LearningContentType, contentID uint) bool {
	var count int64
	r.db.Model(&model.LearningFavorite{}).
		Where("user_id = ? AND content_type = ? AND content_id = ?", userID, contentType, contentID).
		Count(&count)
	return count > 0
}

// BatchCheckFavorites 批量检查是否已收藏
func (r *LearningFavoriteRepository) BatchCheckFavorites(userID uint, contentType model.LearningContentType, contentIDs []uint) (map[uint]bool, error) {
	result := make(map[uint]bool)
	if len(contentIDs) == 0 {
		return result, nil
	}

	var favorites []model.LearningFavorite
	err := r.db.Where("user_id = ? AND content_type = ? AND content_id IN ?",
		userID, contentType, contentIDs).
		Find(&favorites).Error
	if err != nil {
		return nil, err
	}

	for _, f := range favorites {
		result[f.ContentID] = true
	}
	return result, nil
}

// LearningFavoriteQueryParams 查询参数
type LearningFavoriteQueryParams struct {
	ContentType model.LearningContentType
	FolderID    *uint
	Page        int
	PageSize    int
}

// GetByUser 获取用户收藏列表
func (r *LearningFavoriteRepository) GetByUser(userID uint, params *LearningFavoriteQueryParams) ([]model.LearningFavorite, int64, error) {
	var favorites []model.LearningFavorite
	var total int64

	query := r.db.Model(&model.LearningFavorite{}).Where("user_id = ?", userID)

	if params.ContentType != "" {
		query = query.Where("content_type = ?", params.ContentType)
	}
	if params.FolderID != nil {
		if *params.FolderID == 0 {
			query = query.Where("folder_id IS NULL")
		} else {
			query = query.Where("folder_id = ?", *params.FolderID)
		}
	}

	err := query.Count(&total).Error
	if err != nil {
		return nil, 0, err
	}

	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 {
		params.PageSize = 20
	}

	offset := (params.Page - 1) * params.PageSize
	err = query.Preload("Folder").
		Order("created_at DESC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&favorites).Error

	return favorites, total, err
}

// UpdateNote 更新备注
func (r *LearningFavoriteRepository) UpdateNote(userID, favoriteID uint, note string) error {
	return r.db.Model(&model.LearningFavorite{}).
		Where("id = ? AND user_id = ?", favoriteID, userID).
		Update("note", note).Error
}

// UpdateFolder 移动到收藏夹
func (r *LearningFavoriteRepository) UpdateFolder(userID, favoriteID uint, folderID *uint) error {
	return r.db.Model(&model.LearningFavorite{}).
		Where("id = ? AND user_id = ?", favoriteID, userID).
		Update("folder_id", folderID).Error
}

// GetStats 获取收藏统计
func (r *LearningFavoriteRepository) GetStats(userID uint) (map[string]int64, error) {
	type stat struct {
		ContentType string
		Count       int64
	}
	var stats []stat

	err := r.db.Model(&model.LearningFavorite{}).
		Select("content_type, COUNT(*) as count").
		Where("user_id = ?", userID).
		Group("content_type").
		Scan(&stats).Error
	if err != nil {
		return nil, err
	}

	result := make(map[string]int64)
	var total int64
	for _, s := range stats {
		result[s.ContentType] = s.Count
		total += s.Count
	}
	result["total"] = total

	return result, nil
}

// =====================================================
// Learning Favorite Folder Repository
// =====================================================

// CreateFolder 创建收藏夹
func (r *LearningFavoriteRepository) CreateFolder(folder *model.LearningFavoriteFolder) error {
	return r.db.Create(folder).Error
}

// UpdateFolder 更新收藏夹
func (r *LearningFavoriteRepository) UpdateFolderInfo(userID, folderID uint, updates map[string]interface{}) error {
	return r.db.Model(&model.LearningFavoriteFolder{}).
		Where("id = ? AND user_id = ?", folderID, userID).
		Updates(updates).Error
}

// DeleteFolder 删除收藏夹
func (r *LearningFavoriteRepository) DeleteFolder(userID, folderID uint) error {
	// 先把该收藏夹中的收藏移到"未分类"
	r.db.Model(&model.LearningFavorite{}).
		Where("user_id = ? AND folder_id = ?", userID, folderID).
		Update("folder_id", nil)

	return r.db.Where("id = ? AND user_id = ?", folderID, userID).
		Delete(&model.LearningFavoriteFolder{}).Error
}

// GetFolders 获取用户的收藏夹列表
func (r *LearningFavoriteRepository) GetFolders(userID uint) ([]model.LearningFavoriteFolder, error) {
	var folders []model.LearningFavoriteFolder
	err := r.db.Where("user_id = ?", userID).
		Order("sort_order ASC, created_at ASC").
		Find(&folders).Error
	return folders, err
}

// GetFolderByID 获取收藏夹
func (r *LearningFavoriteRepository) GetFolderByID(userID, folderID uint) (*model.LearningFavoriteFolder, error) {
	var folder model.LearningFavoriteFolder
	err := r.db.Where("id = ? AND user_id = ?", folderID, userID).First(&folder).Error
	if err != nil {
		return nil, err
	}
	return &folder, nil
}

// UpdateFolderItemCount 更新收藏夹内项目数量
func (r *LearningFavoriteRepository) UpdateFolderItemCount(folderID uint) error {
	var count int64
	r.db.Model(&model.LearningFavorite{}).Where("folder_id = ?", folderID).Count(&count)
	return r.db.Model(&model.LearningFavoriteFolder{}).Where("id = ?", folderID).
		Update("item_count", count).Error
}

// =====================================================
// Knowledge Mastery Repository
// =====================================================

type KnowledgeMasteryRepository struct {
	db *gorm.DB
}

func NewKnowledgeMasteryRepository(db *gorm.DB) *KnowledgeMasteryRepository {
	return &KnowledgeMasteryRepository{db: db}
}

// Upsert 更新或创建掌握度记录
func (r *KnowledgeMasteryRepository) Upsert(userID, knowledgePointID uint, isCorrect bool) error {
	var mastery model.UserKnowledgeMastery
	err := r.db.Where("user_id = ? AND knowledge_point_id = ?", userID, knowledgePointID).
		First(&mastery).Error

	now := time.Now()

	if err == gorm.ErrRecordNotFound {
		// 创建新记录
		mastery = model.UserKnowledgeMastery{
			UserID:           userID,
			KnowledgePointID: knowledgePointID,
			TotalQuestions:   1,
			LastPracticeAt:   &now,
		}
		if isCorrect {
			mastery.CorrectQuestions = 1
			mastery.MasteryLevel = 100
			mastery.StreakCount = 1
			mastery.LastCorrectAt = &now
		}
		return r.db.Create(&mastery).Error
	}

	// 更新现有记录
	mastery.TotalQuestions++
	mastery.LastPracticeAt = &now
	if isCorrect {
		mastery.CorrectQuestions++
		mastery.StreakCount++
		mastery.LastCorrectAt = &now
	} else {
		mastery.StreakCount = 0
	}

	// 计算掌握度：正确率 * 0.6 + 连续正确奖励 * 0.4
	correctRate := float64(mastery.CorrectQuestions) / float64(mastery.TotalQuestions) * 100
	streakBonus := float64(mastery.StreakCount) * 5 // 每连续正确一次加5分
	if streakBonus > 20 {
		streakBonus = 20 // 最多加20分
	}
	mastery.MasteryLevel = correctRate*0.8 + streakBonus
	if mastery.MasteryLevel > 100 {
		mastery.MasteryLevel = 100
	}

	return r.db.Save(&mastery).Error
}

// GetByUser 获取用户的知识点掌握情况
func (r *KnowledgeMasteryRepository) GetByUser(userID uint, categoryID *uint) ([]model.UserKnowledgeMastery, error) {
	var masteries []model.UserKnowledgeMastery
	query := r.db.Where("user_id = ?", userID).
		Preload("KnowledgePoint")

	if categoryID != nil {
		query = query.Joins("JOIN what_knowledge_points kp ON kp.id = what_user_knowledge_mastery.knowledge_point_id").
			Where("kp.category_id = ?", *categoryID)
	}

	err := query.Find(&masteries).Error
	return masteries, err
}

// GetWeakPoints 获取薄弱知识点
func (r *KnowledgeMasteryRepository) GetWeakPoints(userID uint, threshold float64, limit int) ([]model.UserKnowledgeMastery, error) {
	var masteries []model.UserKnowledgeMastery
	err := r.db.Where("user_id = ? AND mastery_level < ?", userID, threshold).
		Preload("KnowledgePoint").
		Order("mastery_level ASC").
		Limit(limit).
		Find(&masteries).Error
	return masteries, err
}

// GetMasteryStats 获取掌握度统计
func (r *KnowledgeMasteryRepository) GetMasteryStats(userID uint) (map[string]int64, error) {
	type stat struct {
		Level string
		Count int64
	}

	// 按掌握度分段统计
	var stats []stat
	err := r.db.Model(&model.UserKnowledgeMastery{}).
		Select(`
			CASE 
				WHEN mastery_level >= 80 THEN 'mastered'
				WHEN mastery_level >= 60 THEN 'familiar'
				WHEN mastery_level >= 40 THEN 'learning'
				ELSE 'weak'
			END as level, 
			COUNT(*) as count
		`).
		Where("user_id = ?", userID).
		Group("level").
		Scan(&stats).Error
	if err != nil {
		return nil, err
	}

	result := make(map[string]int64)
	for _, s := range stats {
		result[s.Level] = s.Count
	}

	return result, nil
}
