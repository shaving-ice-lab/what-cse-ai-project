package repository

import (
	"github.com/what-cse/server/internal/model"

	"gorm.io/gorm"
)

// AIContentRepository AI生成内容仓库
type AIContentRepository struct {
	db *gorm.DB
}

// NewAIContentRepository 创建AI内容仓库实例
func NewAIContentRepository(db *gorm.DB) *AIContentRepository {
	return &AIContentRepository{db: db}
}

// =====================================================
// AI 生成内容 CRUD
// =====================================================

// Create 创建AI生成内容
func (r *AIContentRepository) Create(content *model.AIGeneratedContent) error {
	return r.db.Create(content).Error
}

// Update 更新AI生成内容
func (r *AIContentRepository) Update(content *model.AIGeneratedContent) error {
	return r.db.Save(content).Error
}

// Delete 删除AI生成内容
func (r *AIContentRepository) Delete(id uint) error {
	return r.db.Delete(&model.AIGeneratedContent{}, id).Error
}

// GetByID 根据ID获取AI生成内容
func (r *AIContentRepository) GetByID(id uint) (*model.AIGeneratedContent, error) {
	var content model.AIGeneratedContent
	err := r.db.First(&content, id).Error
	if err != nil {
		return nil, err
	}
	return &content, nil
}

// GetByRelated 根据关联类型和ID获取AI生成内容
func (r *AIContentRepository) GetByRelated(relatedType model.AIRelatedType, relatedID uint, contentType model.AIContentType) (*model.AIGeneratedContent, error) {
	var content model.AIGeneratedContent
	err := r.db.Where("related_type = ? AND related_id = ? AND content_type = ? AND status = ?",
		relatedType, relatedID, contentType, model.AIContentStatusApproved).
		Order("version DESC").
		First(&content).Error
	if err != nil {
		return nil, err
	}
	return &content, nil
}

// GetAllByRelated 根据关联类型和ID获取所有类型的AI生成内容
func (r *AIContentRepository) GetAllByRelated(relatedType model.AIRelatedType, relatedID uint) ([]model.AIGeneratedContent, error) {
	var contents []model.AIGeneratedContent
	err := r.db.Where("related_type = ? AND related_id = ? AND status = ?",
		relatedType, relatedID, model.AIContentStatusApproved).
		Order("content_type ASC").
		Find(&contents).Error
	return contents, err
}

// GetLatestByRelated 获取最新版本的AI内容
func (r *AIContentRepository) GetLatestByRelated(relatedType model.AIRelatedType, relatedID uint, contentType model.AIContentType) (*model.AIGeneratedContent, error) {
	var content model.AIGeneratedContent
	err := r.db.Where("related_type = ? AND related_id = ? AND content_type = ?",
		relatedType, relatedID, contentType).
		Order("version DESC").
		First(&content).Error
	if err != nil {
		return nil, err
	}
	return &content, nil
}

// Exists 检查是否存在
func (r *AIContentRepository) Exists(relatedType model.AIRelatedType, relatedID uint, contentType model.AIContentType) (bool, error) {
	var count int64
	err := r.db.Model(&model.AIGeneratedContent{}).
		Where("related_type = ? AND related_id = ? AND content_type = ?",
			relatedType, relatedID, contentType).
		Count(&count).Error
	return count > 0, err
}

// List 获取AI生成内容列表
func (r *AIContentRepository) List(params AIContentListParams) ([]model.AIGeneratedContent, int64, error) {
	var contents []model.AIGeneratedContent
	var total int64

	query := r.db.Model(&model.AIGeneratedContent{})

	// 筛选条件
	if params.ContentType != "" {
		query = query.Where("content_type = ?", params.ContentType)
	}
	if params.RelatedType != "" {
		query = query.Where("related_type = ?", params.RelatedType)
	}
	if params.RelatedID > 0 {
		query = query.Where("related_id = ?", params.RelatedID)
	}
	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}

	// 统计总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页
	offset := (params.Page - 1) * params.PageSize
	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&contents).Error

	return contents, total, err
}

// AIContentListParams 列表查询参数
type AIContentListParams struct {
	ContentType model.AIContentType   `json:"content_type"`
	RelatedType model.AIRelatedType   `json:"related_type"`
	RelatedID   uint                  `json:"related_id"`
	Status      model.AIContentStatus `json:"status"`
	Page        int                   `json:"page"`
	PageSize    int                   `json:"page_size"`
}

// UpdateStatus 更新状态
func (r *AIContentRepository) UpdateStatus(id uint, status model.AIContentStatus, approvedBy *uint) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if status == model.AIContentStatusApproved {
		updates["approved_by"] = approvedBy
		updates["approved_at"] = gorm.Expr("NOW()")
	}
	return r.db.Model(&model.AIGeneratedContent{}).Where("id = ?", id).Updates(updates).Error
}

// BatchCreate 批量创建
func (r *AIContentRepository) BatchCreate(contents []model.AIGeneratedContent) error {
	return r.db.CreateInBatches(contents, 100).Error
}

// GetPendingContents 获取待审核内容
func (r *AIContentRepository) GetPendingContents(limit int) ([]model.AIGeneratedContent, error) {
	var contents []model.AIGeneratedContent
	err := r.db.Where("status = ?", model.AIContentStatusPending).
		Order("created_at ASC").
		Limit(limit).
		Find(&contents).Error
	return contents, err
}

// UpdateQualityScore 更新质量评分
func (r *AIContentRepository) UpdateQualityScore(id uint, score float64) error {
	return r.db.Model(&model.AIGeneratedContent{}).
		Where("id = ?", id).
		Update("quality_score", score).Error
}

// CountByStatus 按状态统计数量
func (r *AIContentRepository) CountByStatus(status string) (int64, error) {
	var count int64
	query := r.db.Model(&model.AIGeneratedContent{})
	if status != "" {
		query = query.Where("status = ?", status)
	}
	err := query.Count(&count).Error
	return count, err
}

// GetAverageQualityScore 获取平均质量分
func (r *AIContentRepository) GetAverageQualityScore() (float64, error) {
	var avg float64
	err := r.db.Model(&model.AIGeneratedContent{}).
		Where("quality_score > 0").
		Select("COALESCE(AVG(quality_score), 0)").
		Scan(&avg).Error
	return avg, err
}

// GetHighQualityContents 获取高质量内容
func (r *AIContentRepository) GetHighQualityContents(minScore float64, limit int) ([]model.AIGeneratedContent, error) {
	var contents []model.AIGeneratedContent
	err := r.db.Where("quality_score >= ? AND status = ?", minScore, model.AIContentStatusApproved).
		Order("quality_score DESC").
		Limit(limit).
		Find(&contents).Error
	return contents, err
}

// GetLowQualityContents 获取低质量内容（需要改进）
func (r *AIContentRepository) GetLowQualityContents(maxScore float64, limit int) ([]model.AIGeneratedContent, error) {
	var contents []model.AIGeneratedContent
	err := r.db.Where("quality_score <= ? AND quality_score > 0", maxScore).
		Order("quality_score ASC").
		Limit(limit).
		Find(&contents).Error
	return contents, err
}

// =====================================================
// AI 批量任务 CRUD
// =====================================================

// AIBatchTaskRepository AI批量任务仓库
type AIBatchTaskRepository struct {
	db *gorm.DB
}

// NewAIBatchTaskRepository 创建AI批量任务仓库实例
func NewAIBatchTaskRepository(db *gorm.DB) *AIBatchTaskRepository {
	return &AIBatchTaskRepository{db: db}
}

// Create 创建批量任务
func (r *AIBatchTaskRepository) Create(task *model.AIBatchTask) error {
	return r.db.Create(task).Error
}

// Update 更新批量任务
func (r *AIBatchTaskRepository) Update(task *model.AIBatchTask) error {
	return r.db.Save(task).Error
}

// GetByID 根据ID获取批量任务
func (r *AIBatchTaskRepository) GetByID(id uint) (*model.AIBatchTask, error) {
	var task model.AIBatchTask
	err := r.db.Preload("Creator").First(&task, id).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

// List 获取批量任务列表
func (r *AIBatchTaskRepository) List(params AIBatchTaskListParams) ([]model.AIBatchTask, int64, error) {
	var tasks []model.AIBatchTask
	var total int64

	query := r.db.Model(&model.AIBatchTask{})

	// 筛选条件
	if params.ContentType != "" {
		query = query.Where("content_type = ?", params.ContentType)
	}
	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}
	if params.CreatedBy > 0 {
		query = query.Where("created_by = ?", params.CreatedBy)
	}

	// 统计总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页
	offset := (params.Page - 1) * params.PageSize
	err := query.Preload("Creator").
		Order("priority DESC, created_at DESC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&tasks).Error

	return tasks, total, err
}

// AIBatchTaskListParams 批量任务列表查询参数
type AIBatchTaskListParams struct {
	ContentType model.AIContentType     `json:"content_type"`
	Status      model.AIBatchTaskStatus `json:"status"`
	CreatedBy   uint                    `json:"created_by"`
	Page        int                     `json:"page"`
	PageSize    int                     `json:"page_size"`
}

// GetPendingTasks 获取待处理的任务
func (r *AIBatchTaskRepository) GetPendingTasks(limit int) ([]model.AIBatchTask, error) {
	var tasks []model.AIBatchTask
	err := r.db.Where("status = ?", model.AIBatchTaskStatusPending).
		Order("priority DESC, created_at ASC").
		Limit(limit).
		Find(&tasks).Error
	return tasks, err
}

// GetProcessingTask 获取正在处理的任务
func (r *AIBatchTaskRepository) GetProcessingTask() (*model.AIBatchTask, error) {
	var task model.AIBatchTask
	err := r.db.Where("status = ?", model.AIBatchTaskStatusProcessing).
		First(&task).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

// UpdateStatus 更新任务状态
func (r *AIBatchTaskRepository) UpdateStatus(id uint, status model.AIBatchTaskStatus) error {
	updates := map[string]interface{}{
		"status": status,
	}
	if status == model.AIBatchTaskStatusProcessing {
		updates["started_at"] = gorm.Expr("NOW()")
	}
	if status == model.AIBatchTaskStatusCompleted || status == model.AIBatchTaskStatusFailed {
		updates["completed_at"] = gorm.Expr("NOW()")
	}
	return r.db.Model(&model.AIBatchTask{}).Where("id = ?", id).Updates(updates).Error
}

// UpdateProgress 更新任务进度
func (r *AIBatchTaskRepository) UpdateProgress(id uint, processed, success, failed int) error {
	return r.db.Model(&model.AIBatchTask{}).Where("id = ?", id).Updates(map[string]interface{}{
		"processed_count": processed,
		"success_count":   success,
		"failed_count":    failed,
	}).Error
}

// IncrementProgress 增加任务进度
func (r *AIBatchTaskRepository) IncrementProgress(id uint, success bool) error {
	updates := map[string]interface{}{
		"processed_count": gorm.Expr("processed_count + 1"),
	}
	if success {
		updates["success_count"] = gorm.Expr("success_count + 1")
	} else {
		updates["failed_count"] = gorm.Expr("failed_count + 1")
	}
	return r.db.Model(&model.AIBatchTask{}).Where("id = ?", id).Updates(updates).Error
}

// AppendErrorLog 追加错误日志
func (r *AIBatchTaskRepository) AppendErrorLog(id uint, errorMsg string) error {
	return r.db.Model(&model.AIBatchTask{}).Where("id = ?", id).
		Update("error_log", gorm.Expr("CONCAT(COALESCE(error_log, ''), ?)", errorMsg+"\n")).Error
}

// CancelTask 取消任务
func (r *AIBatchTaskRepository) CancelTask(id uint) error {
	return r.db.Model(&model.AIBatchTask{}).
		Where("id = ? AND status IN ?", id, []model.AIBatchTaskStatus{
			model.AIBatchTaskStatusPending,
			model.AIBatchTaskStatusProcessing,
		}).
		Updates(map[string]interface{}{
			"status":       model.AIBatchTaskStatusCancelled,
			"completed_at": gorm.Expr("NOW()"),
		}).Error
}
