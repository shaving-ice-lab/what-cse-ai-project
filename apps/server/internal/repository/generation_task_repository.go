package repository

import (
	"context"
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// GenerationTaskRepository 生成任务仓库
type GenerationTaskRepository struct {
	db *gorm.DB
}

// NewGenerationTaskRepository 创建生成任务仓库
func NewGenerationTaskRepository(db *gorm.DB) *GenerationTaskRepository {
	return &GenerationTaskRepository{db: db}
}

// Create 创建任务
func (r *GenerationTaskRepository) Create(task *model.GenerationTask) error {
	return r.db.Create(task).Error
}

// Update 更新任务
func (r *GenerationTaskRepository) Update(task *model.GenerationTask) error {
	return r.db.Save(task).Error
}

// Delete 删除任务
func (r *GenerationTaskRepository) Delete(id uint) error {
	return r.db.Delete(&model.GenerationTask{}, id).Error
}

// GetByID 根据ID获取任务
func (r *GenerationTaskRepository) GetByID(id uint) (*model.GenerationTask, error) {
	var task model.GenerationTask
	err := r.db.First(&task, id).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

// List 列出任务
func (r *GenerationTaskRepository) List(taskType string, status string, page, pageSize int) ([]model.GenerationTask, int64, error) {
	var tasks []model.GenerationTask
	var total int64

	query := r.db.Model(&model.GenerationTask{})

	if taskType != "" {
		query = query.Where("task_type = ?", taskType)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	// 计算总数
	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	// 分页
	if page <= 0 {
		page = 1
	}
	if pageSize <= 0 {
		pageSize = 20
	}
	offset := (page - 1) * pageSize

	err := query.Order("created_at DESC").
		Offset(offset).
		Limit(pageSize).
		Find(&tasks).Error

	return tasks, total, err
}

// UpdateStatus 更新任务状态
func (r *GenerationTaskRepository) UpdateStatus(id uint, status model.GenerationTaskStatus, errorMessage string, tokensUsed int, durationMs int) error {
	updates := map[string]interface{}{
		"status":      status,
		"duration_ms": durationMs,
	}

	if errorMessage != "" {
		updates["error_message"] = errorMessage
	}
	if tokensUsed > 0 {
		updates["tokens_used"] = tokensUsed
	}

	if status == model.GenerationTaskStatusCompleted || status == model.GenerationTaskStatusFailed || status == model.GenerationTaskStatusCancelled {
		now := time.Now()
		updates["completed_at"] = &now
	}

	return r.db.Model(&model.GenerationTask{}).Where("id = ?", id).Updates(updates).Error
}

// UpdateResult 更新任务结果
func (r *GenerationTaskRepository) UpdateResult(ctx context.Context, id uint, result string, durationMs int) error {
	now := time.Now()
	return r.db.Model(&model.GenerationTask{}).Where("id = ?", id).Updates(map[string]interface{}{
		"status":       model.GenerationTaskStatusCompleted,
		"result":       result,
		"duration_ms":  durationMs,
		"completed_at": &now,
	}).Error
}

// GetPendingTasks 获取待处理任务
func (r *GenerationTaskRepository) GetPendingTasks(limit int) ([]model.GenerationTask, error) {
	var tasks []model.GenerationTask
	err := r.db.Where("status = ?", model.GenerationTaskStatusPending).
		Order("created_at ASC").
		Limit(limit).
		Find(&tasks).Error
	return tasks, err
}

// GetByTargetID 根据目标ID获取任务
func (r *GenerationTaskRepository) GetByTargetID(taskType model.GenerationTaskType, targetID uint) (*model.GenerationTask, error) {
	var task model.GenerationTask
	err := r.db.Where("task_type = ? AND target_id = ?", taskType, targetID).
		Order("created_at DESC").
		First(&task).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

// CountByStatus 统计各状态任务数量
func (r *GenerationTaskRepository) CountByStatus() (map[string]int64, error) {
	type StatusCount struct {
		Status string
		Count  int64
	}

	var results []StatusCount
	err := r.db.Model(&model.GenerationTask{}).
		Select("status, count(*) as count").
		Group("status").
		Scan(&results).Error
	if err != nil {
		return nil, err
	}

	counts := make(map[string]int64)
	for _, r := range results {
		counts[r.Status] = r.Count
	}
	return counts, nil
}

// GetRecentTasks 获取最近的任务
func (r *GenerationTaskRepository) GetRecentTasks(limit int) ([]model.GenerationTask, error) {
	var tasks []model.GenerationTask
	err := r.db.Order("created_at DESC").
		Limit(limit).
		Find(&tasks).Error
	return tasks, err
}

// CancelPendingTasks 取消所有待处理任务
func (r *GenerationTaskRepository) CancelPendingTasks() error {
	return r.db.Model(&model.GenerationTask{}).
		Where("status = ?", model.GenerationTaskStatusPending).
		Updates(map[string]interface{}{
			"status":        model.GenerationTaskStatusCancelled,
			"error_message": "批量取消",
		}).Error
}

// CleanupOldTasks 清理旧任务（保留指定天数内的任务）
func (r *GenerationTaskRepository) CleanupOldTasks(daysToKeep int) error {
	cutoff := time.Now().AddDate(0, 0, -daysToKeep)
	return r.db.Where("created_at < ? AND status IN ?", cutoff, []string{
		string(model.GenerationTaskStatusCompleted),
		string(model.GenerationTaskStatusFailed),
		string(model.GenerationTaskStatusCancelled),
	}).Delete(&model.GenerationTask{}).Error
}
