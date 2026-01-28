package service

import (
	"errors"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrStudyPlanNotFound        = errors.New("study plan not found")
	ErrStudyPlanAlreadyActive   = errors.New("already has an active study plan")
	ErrStudyTimeRecordNotFound  = errors.New("study time record not found")
	ErrNoActiveSession          = errors.New("no active study session")
	ErrLearningFavoriteExists   = errors.New("learning content already favorited")
	ErrLearningFavoriteNotFound = errors.New("learning favorite not found")
	ErrFolderNotFound           = errors.New("folder not found")
	ErrTemplateNotFound         = errors.New("template not found")
)

// =====================================================
// Study Plan Service
// =====================================================

type StudyPlanService struct {
	planRepo *repository.StudyPlanRepository
}

func NewStudyPlanService(planRepo *repository.StudyPlanRepository) *StudyPlanService {
	return &StudyPlanService{
		planRepo: planRepo,
	}
}

// CreateStudyPlanRequest 创建学习计划请求
type CreateStudyPlanRequest struct {
	Title          string                `json:"title" validate:"required,max=200"`
	Description    string                `json:"description"`
	ExamType       string                `json:"exam_type"`
	TargetExamDate *time.Time            `json:"target_exam_date"`
	StartDate      time.Time             `json:"start_date" validate:"required"`
	EndDate        time.Time             `json:"end_date" validate:"required"`
	DailyStudyTime int                   `json:"daily_study_time"`
	DailyQuestions int                   `json:"daily_questions"`
	PlanDetails    model.JSONPlanDetails `json:"plan_details"`
	TemplateID     *uint                 `json:"template_id"`
}

// Create 创建学习计划
func (s *StudyPlanService) Create(userID uint, req *CreateStudyPlanRequest) (*model.StudyPlan, error) {
	// 检查是否已有进行中的计划
	existingPlan, _ := s.planRepo.GetActiveByUser(userID)
	if existingPlan != nil {
		return nil, ErrStudyPlanAlreadyActive
	}

	// 设置默认值
	if req.DailyStudyTime <= 0 {
		req.DailyStudyTime = 120
	}
	if req.DailyQuestions <= 0 {
		req.DailyQuestions = 50
	}

	plan := &model.StudyPlan{
		UserID:         userID,
		Title:          req.Title,
		Description:    req.Description,
		ExamType:       req.ExamType,
		TargetExamDate: req.TargetExamDate,
		StartDate:      req.StartDate,
		EndDate:        req.EndDate,
		DailyStudyTime: req.DailyStudyTime,
		DailyQuestions: req.DailyQuestions,
		PlanDetails:    req.PlanDetails,
		Status:         model.StudyPlanStatusActive,
		TemplateID:     req.TemplateID,
	}

	err := s.planRepo.Create(plan)
	if err != nil {
		return nil, err
	}

	// 如果使用了模板，增加模板使用次数
	if req.TemplateID != nil {
		s.planRepo.IncrementTemplateUseCount(*req.TemplateID)
	}

	return plan, nil
}

// CreateFromTemplate 从模板创建计划
func (s *StudyPlanService) CreateFromTemplate(userID uint, templateID uint, startDate time.Time, targetExamDate *time.Time) (*model.StudyPlan, error) {
	template, err := s.planRepo.GetTemplateByID(templateID)
	if err != nil {
		return nil, ErrTemplateNotFound
	}

	endDate := startDate.AddDate(0, 0, template.Duration-1)

	req := &CreateStudyPlanRequest{
		Title:          template.Name,
		Description:    template.Description,
		ExamType:       template.ExamType,
		TargetExamDate: targetExamDate,
		StartDate:      startDate,
		EndDate:        endDate,
		DailyStudyTime: template.DailyStudyTime,
		DailyQuestions: template.DailyQuestions,
		PlanDetails:    template.PlanDetails,
		TemplateID:     &templateID,
	}

	return s.Create(userID, req)
}

// GetByID 获取计划详情
func (s *StudyPlanService) GetByID(userID, planID uint) (*model.StudyPlanResponse, error) {
	plan, err := s.planRepo.GetByID(userID, planID)
	if err != nil {
		return nil, ErrStudyPlanNotFound
	}
	return plan.ToResponse(), nil
}

// GetActive 获取当前进行中的计划
func (s *StudyPlanService) GetActive(userID uint) (*model.StudyPlanResponse, error) {
	plan, err := s.planRepo.GetActiveByUser(userID)
	if err != nil {
		return nil, nil // 没有进行中的计划，返回nil
	}
	return plan.ToResponse(), nil
}

// StudyPlanListResponse 计划列表响应
type StudyPlanListResponse struct {
	Plans    []*model.StudyPlanResponse `json:"plans"`
	Total    int64                      `json:"total"`
	Page     int                        `json:"page"`
	PageSize int                        `json:"page_size"`
}

// List 获取计划列表
func (s *StudyPlanService) List(userID uint, params *repository.StudyPlanQueryParams) (*StudyPlanListResponse, error) {
	plans, total, err := s.planRepo.GetByUser(userID, params)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.StudyPlanResponse, len(plans))
	for i, plan := range plans {
		responses[i] = plan.ToResponse()
	}

	return &StudyPlanListResponse{
		Plans:    responses,
		Total:    total,
		Page:     params.Page,
		PageSize: params.PageSize,
	}, nil
}

// UpdateStudyPlanRequest 更新计划请求
type UpdateStudyPlanRequest struct {
	Title          string                 `json:"title"`
	Description    string                 `json:"description"`
	DailyStudyTime int                    `json:"daily_study_time"`
	DailyQuestions int                    `json:"daily_questions"`
	EndDate        *time.Time             `json:"end_date"`
	PlanDetails    *model.JSONPlanDetails `json:"plan_details"`
}

// Update 更新计划
func (s *StudyPlanService) Update(userID, planID uint, req *UpdateStudyPlanRequest) error {
	updates := make(map[string]interface{})

	if req.Title != "" {
		updates["title"] = req.Title
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.DailyStudyTime > 0 {
		updates["daily_study_time"] = req.DailyStudyTime
	}
	if req.DailyQuestions > 0 {
		updates["daily_questions"] = req.DailyQuestions
	}
	if req.EndDate != nil {
		updates["end_date"] = req.EndDate
	}
	if req.PlanDetails != nil {
		updates["plan_details"] = req.PlanDetails
	}

	if len(updates) == 0 {
		return nil
	}

	return s.planRepo.UpdateFields(userID, planID, updates)
}

// UpdateStatus 更新计划状态
func (s *StudyPlanService) UpdateStatus(userID, planID uint, status model.StudyPlanStatus) error {
	return s.planRepo.UpdateFields(userID, planID, map[string]interface{}{
		"status": status,
	})
}

// UpdateProgress 更新计划进度
func (s *StudyPlanService) UpdateProgress(userID, planID uint, completedDays int, progress float64) error {
	return s.planRepo.UpdateFields(userID, planID, map[string]interface{}{
		"completed_days": completedDays,
		"progress":       progress,
	})
}

// Delete 删除计划
func (s *StudyPlanService) Delete(userID, planID uint) error {
	return s.planRepo.Delete(userID, planID)
}

// GetTemplates 获取计划模板
func (s *StudyPlanService) GetTemplates(examType string) ([]model.StudyPlanTemplate, error) {
	return s.planRepo.GetAllTemplates(examType)
}

// =====================================================
// Daily Task Methods
// =====================================================

// GetDailyTasks 获取今日任务
func (s *StudyPlanService) GetDailyTasks(userID uint, date time.Time) ([]model.StudyDailyTask, error) {
	return s.planRepo.GetDailyTasks(userID, date)
}

// CompleteDailyTask 完成每日任务
func (s *StudyPlanService) CompleteDailyTask(userID, taskID uint) error {
	return s.planRepo.CompleteDailyTask(userID, taskID)
}

// UpdateDailyTaskProgress 更新任务进度
func (s *StudyPlanService) UpdateDailyTaskProgress(userID, taskID uint, actualTime, actualCount int) error {
	updates := make(map[string]interface{})
	if actualTime > 0 {
		updates["actual_time"] = actualTime
	}
	if actualCount > 0 {
		updates["actual_count"] = actualCount
	}
	return s.planRepo.UpdateDailyTask(userID, taskID, updates)
}

// DailyTaskStats 每日任务统计
type DailyTaskStats struct {
	Total     int64   `json:"total"`
	Completed int64   `json:"completed"`
	Progress  float64 `json:"progress"`
}

// GetDailyTaskStats 获取今日任务统计
func (s *StudyPlanService) GetDailyTaskStats(userID, planID uint, date time.Time) (*DailyTaskStats, error) {
	total, completed, err := s.planRepo.GetDailyTaskStats(userID, planID, date)
	if err != nil {
		return nil, err
	}

	var progress float64
	if total > 0 {
		progress = float64(completed) / float64(total) * 100
	}

	return &DailyTaskStats{
		Total:     total,
		Completed: completed,
		Progress:  progress,
	}, nil
}

// =====================================================
// Study Time Service
// =====================================================

type StudyTimeService struct {
	timeRepo *repository.StudyTimeRepository
}

func NewStudyTimeService(timeRepo *repository.StudyTimeRepository) *StudyTimeService {
	return &StudyTimeService{
		timeRepo: timeRepo,
	}
}

// StartSessionRequest 开始学习会话请求
type StartSessionRequest struct {
	StudyType   model.StudyType `json:"study_type" validate:"required"`
	Subject     string          `json:"subject"`
	ContentType string          `json:"content_type"`
	ContentID   *uint           `json:"content_id"`
	ContentName string          `json:"content_name"`
	DeviceInfo  string          `json:"device_info"`
}

// StartSession 开始学习会话
func (s *StudyTimeService) StartSession(userID uint, req *StartSessionRequest) (*model.StudyTimeRecord, error) {
	// 检查是否有未结束的会话，如果有则先结束
	activeSession, _ := s.timeRepo.GetActiveSession(userID)
	if activeSession != nil {
		s.EndSession(userID, activeSession.ID)
	}

	now := time.Now()
	record := &model.StudyTimeRecord{
		UserID:      userID,
		StudyType:   req.StudyType,
		Subject:     req.Subject,
		ContentType: req.ContentType,
		ContentID:   req.ContentID,
		ContentName: req.ContentName,
		StudyDate:   now,
		StartTime:   now,
		IsActive:    true,
		DeviceInfo:  req.DeviceInfo,
	}

	err := s.timeRepo.Create(record)
	if err != nil {
		return nil, err
	}

	// 增加会话计数
	s.timeRepo.IncrementDailySummary(userID, now, "session_count", 1)

	return record, nil
}

// EndSession 结束学习会话
func (s *StudyTimeService) EndSession(userID, recordID uint) error {
	record, err := s.timeRepo.GetByID(userID, recordID)
	if err != nil {
		return ErrStudyTimeRecordNotFound
	}

	if !record.IsActive {
		return nil // 已经结束
	}

	now := time.Now()
	duration := int(now.Sub(record.StartTime).Seconds())

	record.EndTime = &now
	record.Duration = duration
	record.IsActive = false

	err = s.timeRepo.Update(record)
	if err != nil {
		return err
	}

	// 更新每日统计
	s.timeRepo.IncrementDailySummary(userID, record.StudyDate, "total_seconds", duration)

	// 根据类型更新分类统计
	switch record.StudyType {
	case model.StudyTypeVideo:
		s.timeRepo.IncrementDailySummary(userID, record.StudyDate, "video_seconds", duration)
	case model.StudyTypePractice, model.StudyTypeExam:
		s.timeRepo.IncrementDailySummary(userID, record.StudyDate, "practice_seconds", duration)
	case model.StudyTypeArticle:
		s.timeRepo.IncrementDailySummary(userID, record.StudyDate, "article_seconds", duration)
	default:
		s.timeRepo.IncrementDailySummary(userID, record.StudyDate, "other_seconds", duration)
	}

	return nil
}

// RecordStudyTime 直接记录学习时长
func (s *StudyTimeService) RecordStudyTime(userID uint, req *StartSessionRequest, duration int) (*model.StudyTimeRecord, error) {
	now := time.Now()
	endTime := now
	startTime := now.Add(-time.Duration(duration) * time.Second)

	record := &model.StudyTimeRecord{
		UserID:      userID,
		StudyType:   req.StudyType,
		Subject:     req.Subject,
		ContentType: req.ContentType,
		ContentID:   req.ContentID,
		ContentName: req.ContentName,
		Duration:    duration,
		StudyDate:   now,
		StartTime:   startTime,
		EndTime:     &endTime,
		IsActive:    false,
		DeviceInfo:  req.DeviceInfo,
	}

	err := s.timeRepo.Create(record)
	if err != nil {
		return nil, err
	}

	// 更新每日统计
	s.timeRepo.IncrementDailySummary(userID, now, "total_seconds", duration)
	s.timeRepo.IncrementDailySummary(userID, now, "session_count", 1)

	return record, nil
}

// GetActiveSession 获取当前进行中的会话
func (s *StudyTimeService) GetActiveSession(userID uint) (*model.StudyTimeRecordResponse, error) {
	record, err := s.timeRepo.GetActiveSession(userID)
	if err != nil {
		return nil, nil
	}
	return record.ToResponse(), nil
}

// StudyTimeListResponse 学习记录列表响应
type StudyTimeListResponse struct {
	Records  []*model.StudyTimeRecordResponse `json:"records"`
	Total    int64                            `json:"total"`
	Page     int                              `json:"page"`
	PageSize int                              `json:"page_size"`
}

// GetRecords 获取学习记录
func (s *StudyTimeService) GetRecords(userID uint, params *repository.StudyTimeQueryParams) (*StudyTimeListResponse, error) {
	records, total, err := s.timeRepo.GetByUser(userID, params)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.StudyTimeRecordResponse, len(records))
	for i, r := range records {
		responses[i] = r.ToResponse()
	}

	return &StudyTimeListResponse{
		Records:  responses,
		Total:    total,
		Page:     params.Page,
		PageSize: params.PageSize,
	}, nil
}

// GetDailyStatistics 获取日统计
func (s *StudyTimeService) GetDailyStatistics(userID uint, date time.Time) (*model.StudyStatisticsResponse, error) {
	summary, err := s.timeRepo.GetDailyStatistics(userID, date)
	if err != nil {
		// 如果没有记录，返回零值
		return &model.StudyStatisticsResponse{
			Period: "day",
		}, nil
	}

	var correctRate float64
	if summary.QuestionCount > 0 {
		correctRate = float64(summary.CorrectCount) / float64(summary.QuestionCount) * 100
	}

	return &model.StudyStatisticsResponse{
		Period:          "day",
		TotalMinutes:    summary.TotalSeconds / 60,
		TotalHours:      float64(summary.TotalSeconds) / 3600,
		VideoMinutes:    summary.VideoSeconds / 60,
		PracticeMinutes: summary.PracticeSeconds / 60,
		ArticleMinutes:  summary.ArticleSeconds / 60,
		OtherMinutes:    summary.OtherSeconds / 60,
		SessionCount:    summary.SessionCount,
		QuestionCount:   summary.QuestionCount,
		CorrectRate:     correctRate,
	}, nil
}

// GetWeeklyStatistics 获取周统计
func (s *StudyTimeService) GetWeeklyStatistics(userID uint) (*model.StudyStatisticsResponse, error) {
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -6) // 过去7天

	summaries, err := s.timeRepo.GetStatisticsRange(userID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	var totalSeconds, videoSeconds, practiceSeconds, articleSeconds, otherSeconds int
	var sessionCount, questionCount, correctCount int
	trend := make([]model.DailyStudyTrend, 0)

	for _, s := range summaries {
		totalSeconds += s.TotalSeconds
		videoSeconds += s.VideoSeconds
		practiceSeconds += s.PracticeSeconds
		articleSeconds += s.ArticleSeconds
		otherSeconds += s.OtherSeconds
		sessionCount += s.SessionCount
		questionCount += s.QuestionCount
		correctCount += s.CorrectCount

		trend = append(trend, model.DailyStudyTrend{
			Date:         s.StudyDate.Format("2006-01-02"),
			TotalMinutes: s.TotalSeconds / 60,
			SessionCount: s.SessionCount,
		})
	}

	var correctRate float64
	if questionCount > 0 {
		correctRate = float64(correctCount) / float64(questionCount) * 100
	}

	return &model.StudyStatisticsResponse{
		Period:          "week",
		TotalMinutes:    totalSeconds / 60,
		TotalHours:      float64(totalSeconds) / 3600,
		VideoMinutes:    videoSeconds / 60,
		PracticeMinutes: practiceSeconds / 60,
		ArticleMinutes:  articleSeconds / 60,
		OtherMinutes:    otherSeconds / 60,
		SessionCount:    sessionCount,
		QuestionCount:   questionCount,
		CorrectRate:     correctRate,
		DailyAverage:    totalSeconds / 60 / 7,
		Trend:           trend,
	}, nil
}

// GetMonthlyStatistics 获取月统计
func (s *StudyTimeService) GetMonthlyStatistics(userID uint) (*model.StudyStatisticsResponse, error) {
	endDate := time.Now()
	startDate := endDate.AddDate(0, 0, -29) // 过去30天

	summaries, err := s.timeRepo.GetStatisticsRange(userID, startDate, endDate)
	if err != nil {
		return nil, err
	}

	var totalSeconds, videoSeconds, practiceSeconds, articleSeconds, otherSeconds int
	var sessionCount, questionCount, correctCount int
	trend := make([]model.DailyStudyTrend, 0)

	for _, s := range summaries {
		totalSeconds += s.TotalSeconds
		videoSeconds += s.VideoSeconds
		practiceSeconds += s.PracticeSeconds
		articleSeconds += s.ArticleSeconds
		otherSeconds += s.OtherSeconds
		sessionCount += s.SessionCount
		questionCount += s.QuestionCount
		correctCount += s.CorrectCount

		trend = append(trend, model.DailyStudyTrend{
			Date:         s.StudyDate.Format("2006-01-02"),
			TotalMinutes: s.TotalSeconds / 60,
			SessionCount: s.SessionCount,
		})
	}

	var correctRate float64
	if questionCount > 0 {
		correctRate = float64(correctCount) / float64(questionCount) * 100
	}

	return &model.StudyStatisticsResponse{
		Period:          "month",
		TotalMinutes:    totalSeconds / 60,
		TotalHours:      float64(totalSeconds) / 3600,
		VideoMinutes:    videoSeconds / 60,
		PracticeMinutes: practiceSeconds / 60,
		ArticleMinutes:  articleSeconds / 60,
		OtherMinutes:    otherSeconds / 60,
		SessionCount:    sessionCount,
		QuestionCount:   questionCount,
		CorrectRate:     correctRate,
		DailyAverage:    totalSeconds / 60 / 30,
		Trend:           trend,
	}, nil
}

// =====================================================
// Learning Favorite Service
// =====================================================

type LearningFavoriteService struct {
	favoriteRepo *repository.LearningFavoriteRepository
}

func NewLearningFavoriteService(favoriteRepo *repository.LearningFavoriteRepository) *LearningFavoriteService {
	return &LearningFavoriteService{
		favoriteRepo: favoriteRepo,
	}
}

// AddFavoriteRequest 添加收藏请求
type AddLearningFavoriteRequest struct {
	ContentType model.LearningContentType `json:"content_type" validate:"required"`
	ContentID   uint                      `json:"content_id" validate:"required"`
	FolderID    *uint                     `json:"folder_id"`
	Note        string                    `json:"note"`
	Tags        []string                  `json:"tags"`
}

// Add 添加收藏
func (s *LearningFavoriteService) Add(userID uint, req *AddLearningFavoriteRequest) (*model.LearningFavorite, error) {
	// 检查是否已收藏
	if s.favoriteRepo.IsFavorite(userID, req.ContentType, req.ContentID) {
		return nil, ErrLearningFavoriteExists
	}

	favorite := &model.LearningFavorite{
		UserID:      userID,
		ContentType: req.ContentType,
		ContentID:   req.ContentID,
		FolderID:    req.FolderID,
		Note:        req.Note,
		Tags:        req.Tags,
	}

	err := s.favoriteRepo.Add(favorite)
	if err != nil {
		return nil, err
	}

	// 更新收藏夹计数
	if req.FolderID != nil {
		s.favoriteRepo.UpdateFolderItemCount(*req.FolderID)
	}

	return favorite, nil
}

// Remove 取消收藏
func (s *LearningFavoriteService) Remove(userID uint, contentType model.LearningContentType, contentID uint) error {
	return s.favoriteRepo.Remove(userID, contentType, contentID)
}

// RemoveByID 通过ID取消收藏
func (s *LearningFavoriteService) RemoveByID(userID, favoriteID uint) error {
	return s.favoriteRepo.RemoveByID(userID, favoriteID)
}

// IsFavorite 检查是否已收藏
func (s *LearningFavoriteService) IsFavorite(userID uint, contentType model.LearningContentType, contentID uint) bool {
	return s.favoriteRepo.IsFavorite(userID, contentType, contentID)
}

// BatchCheck 批量检查
func (s *LearningFavoriteService) BatchCheck(userID uint, contentType model.LearningContentType, contentIDs []uint) (map[uint]bool, error) {
	return s.favoriteRepo.BatchCheckFavorites(userID, contentType, contentIDs)
}

// LearningFavoriteListResponse 收藏列表响应
type LearningFavoriteListResponse struct {
	Favorites []*model.LearningFavoriteResponse `json:"favorites"`
	Total     int64                             `json:"total"`
	Page      int                               `json:"page"`
	PageSize  int                               `json:"page_size"`
	Stats     map[string]int64                  `json:"stats,omitempty"`
}

// List 获取收藏列表
func (s *LearningFavoriteService) List(userID uint, params *repository.LearningFavoriteQueryParams) (*LearningFavoriteListResponse, error) {
	favorites, total, err := s.favoriteRepo.GetByUser(userID, params)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.LearningFavoriteResponse, len(favorites))
	for i, f := range favorites {
		responses[i] = f.ToResponse()
	}

	stats, _ := s.favoriteRepo.GetStats(userID)

	return &LearningFavoriteListResponse{
		Favorites: responses,
		Total:     total,
		Page:      params.Page,
		PageSize:  params.PageSize,
		Stats:     stats,
	}, nil
}

// UpdateNote 更新备注
func (s *LearningFavoriteService) UpdateNote(userID, favoriteID uint, note string) error {
	return s.favoriteRepo.UpdateNote(userID, favoriteID, note)
}

// MoveToFolder 移动到收藏夹
func (s *LearningFavoriteService) MoveToFolder(userID, favoriteID uint, folderID *uint) error {
	return s.favoriteRepo.UpdateFolder(userID, favoriteID, folderID)
}

// GetStats 获取统计
func (s *LearningFavoriteService) GetStats(userID uint) (map[string]int64, error) {
	return s.favoriteRepo.GetStats(userID)
}

// =====================================================
// Folder Methods
// =====================================================

// CreateFolderRequest 创建收藏夹请求
type CreateLearningFolderRequest struct {
	Name        string `json:"name" validate:"required,max=100"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
}

// CreateFolder 创建收藏夹
func (s *LearningFavoriteService) CreateFolder(userID uint, req *CreateLearningFolderRequest) (*model.LearningFavoriteFolder, error) {
	if req.Color == "" {
		req.Color = "#6366f1"
	}

	folder := &model.LearningFavoriteFolder{
		UserID:      userID,
		Name:        req.Name,
		Description: req.Description,
		Icon:        req.Icon,
		Color:       req.Color,
	}

	err := s.favoriteRepo.CreateFolder(folder)
	if err != nil {
		return nil, err
	}

	return folder, nil
}

// GetFolders 获取收藏夹列表
func (s *LearningFavoriteService) GetFolders(userID uint) ([]*model.LearningFavoriteFolderResponse, error) {
	folders, err := s.favoriteRepo.GetFolders(userID)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.LearningFavoriteFolderResponse, len(folders))
	for i, f := range folders {
		responses[i] = f.ToResponse()
	}

	return responses, nil
}

// UpdateFolderRequest 更新收藏夹请求
type UpdateLearningFolderRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	Color       string `json:"color"`
}

// UpdateFolder 更新收藏夹
func (s *LearningFavoriteService) UpdateFolder(userID, folderID uint, req *UpdateLearningFolderRequest) error {
	updates := make(map[string]interface{})
	if req.Name != "" {
		updates["name"] = req.Name
	}
	if req.Description != "" {
		updates["description"] = req.Description
	}
	if req.Icon != "" {
		updates["icon"] = req.Icon
	}
	if req.Color != "" {
		updates["color"] = req.Color
	}

	if len(updates) == 0 {
		return nil
	}

	return s.favoriteRepo.UpdateFolderInfo(userID, folderID, updates)
}

// DeleteFolder 删除收藏夹
func (s *LearningFavoriteService) DeleteFolder(userID, folderID uint) error {
	return s.favoriteRepo.DeleteFolder(userID, folderID)
}

// =====================================================
// Knowledge Mastery Service
// =====================================================

type KnowledgeMasteryService struct {
	masteryRepo *repository.KnowledgeMasteryRepository
}

func NewKnowledgeMasteryService(masteryRepo *repository.KnowledgeMasteryRepository) *KnowledgeMasteryService {
	return &KnowledgeMasteryService{
		masteryRepo: masteryRepo,
	}
}

// UpdateMastery 更新掌握度
func (s *KnowledgeMasteryService) UpdateMastery(userID, knowledgePointID uint, isCorrect bool) error {
	return s.masteryRepo.Upsert(userID, knowledgePointID, isCorrect)
}

// GetMasteryList 获取知识点掌握情况
func (s *KnowledgeMasteryService) GetMasteryList(userID uint, categoryID *uint) ([]*model.KnowledgeMasteryResponse, error) {
	masteries, err := s.masteryRepo.GetByUser(userID, categoryID)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.KnowledgeMasteryResponse, len(masteries))
	for i, m := range masteries {
		responses[i] = m.ToResponse()
	}

	return responses, nil
}

// GetWeakPoints 获取薄弱知识点
func (s *KnowledgeMasteryService) GetWeakPoints(userID uint, limit int) ([]*model.KnowledgeMasteryResponse, error) {
	if limit <= 0 {
		limit = 10
	}

	masteries, err := s.masteryRepo.GetWeakPoints(userID, 60, limit)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.KnowledgeMasteryResponse, len(masteries))
	for i, m := range masteries {
		responses[i] = m.ToResponse()
	}

	return responses, nil
}

// KnowledgeMasteryStatsResponse 掌握度统计响应
type KnowledgeMasteryStatsResponse struct {
	Mastered int64 `json:"mastered"` // 已掌握 (>=80%)
	Familiar int64 `json:"familiar"` // 熟悉 (60-80%)
	Learning int64 `json:"learning"` // 学习中 (40-60%)
	Weak     int64 `json:"weak"`     // 薄弱 (<40%)
	Total    int64 `json:"total"`
}

// GetStats 获取统计
func (s *KnowledgeMasteryService) GetStats(userID uint) (*KnowledgeMasteryStatsResponse, error) {
	stats, err := s.masteryRepo.GetMasteryStats(userID)
	if err != nil {
		return nil, err
	}

	resp := &KnowledgeMasteryStatsResponse{
		Mastered: stats["mastered"],
		Familiar: stats["familiar"],
		Learning: stats["learning"],
		Weak:     stats["weak"],
	}
	resp.Total = resp.Mastered + resp.Familiar + resp.Learning + resp.Weak

	return resp, nil
}
