package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

// CrawlTaskRepository handles crawl task database operations
type CrawlTaskRepository struct {
	db *gorm.DB
}

// NewCrawlTaskRepository creates a new crawl task repository
func NewCrawlTaskRepository(db *gorm.DB) *CrawlTaskRepository {
	return &CrawlTaskRepository{db: db}
}

// Create creates a new crawl task
func (r *CrawlTaskRepository) Create(task *model.CrawlTask) error {
	return r.db.Create(task).Error
}

// FindByID finds a task by ID
func (r *CrawlTaskRepository) FindByID(id uint) (*model.CrawlTask, error) {
	var task model.CrawlTask
	err := r.db.First(&task, id).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

// FindByTaskID finds a task by task ID
func (r *CrawlTaskRepository) FindByTaskID(taskID string) (*model.CrawlTask, error) {
	var task model.CrawlTask
	err := r.db.Where("task_id = ?", taskID).First(&task).Error
	if err != nil {
		return nil, err
	}
	return &task, nil
}

// List returns a paginated list of tasks
func (r *CrawlTaskRepository) List(taskType, status string, page, pageSize int) ([]model.CrawlTask, int64, error) {
	var tasks []model.CrawlTask
	var total int64

	query := r.db.Model(&model.CrawlTask{})
	if taskType != "" {
		query = query.Where("task_type = ?", taskType)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}

	if err := query.Count(&total).Error; err != nil {
		return nil, 0, err
	}

	offset := (page - 1) * pageSize
	if err := query.Offset(offset).Limit(pageSize).Order("created_at DESC").Find(&tasks).Error; err != nil {
		return nil, 0, err
	}

	return tasks, total, nil
}

// GetRecent returns recent tasks
func (r *CrawlTaskRepository) GetRecent(limit int) ([]model.CrawlTask, error) {
	var tasks []model.CrawlTask
	err := r.db.Order("created_at DESC").Limit(limit).Find(&tasks).Error
	return tasks, err
}

// GetRunning returns running tasks
func (r *CrawlTaskRepository) GetRunning() ([]model.CrawlTask, error) {
	var tasks []model.CrawlTask
	err := r.db.Where("status = ?", model.CrawlTaskStatusRunning).Find(&tasks).Error
	return tasks, err
}

// Update updates a task
func (r *CrawlTaskRepository) Update(task *model.CrawlTask) error {
	return r.db.Save(task).Error
}

// UpdateStatus updates task status
func (r *CrawlTaskRepository) UpdateStatus(taskID string, status string, result model.JSON, errorMsg string) error {
	updates := map[string]interface{}{
		"status": status,
	}

	if result != nil {
		updates["result"] = result
	}
	if errorMsg != "" {
		updates["error_message"] = errorMsg
	}

	if status == string(model.CrawlTaskStatusCompleted) || status == string(model.CrawlTaskStatusFailed) {
		now := time.Now()
		updates["completed_at"] = &now
		updates["progress"] = 100
	}

	return r.db.Model(&model.CrawlTask{}).Where("task_id = ?", taskID).Updates(updates).Error
}

// UpdateProgress updates task progress
func (r *CrawlTaskRepository) UpdateProgress(taskID string, progress float64) error {
	return r.db.Model(&model.CrawlTask{}).Where("task_id = ?", taskID).Update("progress", progress).Error
}

// Delete deletes a task
func (r *CrawlTaskRepository) Delete(id uint) error {
	return r.db.Delete(&model.CrawlTask{}, id).Error
}

// GetStatsByStatus returns task counts by status
func (r *CrawlTaskRepository) GetStatsByStatus() (map[string]int64, error) {
	var results []struct {
		Status string
		Count  int64
	}

	err := r.db.Model(&model.CrawlTask{}).
		Select("status, COUNT(*) as count").
		Group("status").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	for _, r := range results {
		stats[r.Status] = r.Count
	}
	return stats, nil
}

// GetStatsByType returns task counts by type
func (r *CrawlTaskRepository) GetStatsByType() (map[string]int64, error) {
	var results []struct {
		TaskType string
		Count    int64
	}

	err := r.db.Model(&model.CrawlTask{}).
		Select("task_type, COUNT(*) as count").
		Group("task_type").
		Find(&results).Error

	if err != nil {
		return nil, err
	}

	stats := make(map[string]int64)
	for _, r := range results {
		stats[r.TaskType] = r.Count
	}
	return stats, nil
}

// GetTotalCount returns total task count
func (r *CrawlTaskRepository) GetTotalCount() (int64, error) {
	var count int64
	err := r.db.Model(&model.CrawlTask{}).Count(&count).Error
	return count, err
}

// CleanupOldTasks removes tasks older than the specified days
func (r *CrawlTaskRepository) CleanupOldTasks(days int) (int64, error) {
	cutoff := time.Now().AddDate(0, 0, -days)
	result := r.db.Where("created_at < ? AND status IN ?", cutoff, []string{
		string(model.CrawlTaskStatusCompleted),
		string(model.CrawlTaskStatusFailed),
		string(model.CrawlTaskStatusCancelled),
	}).Delete(&model.CrawlTask{})

	return result.RowsAffected, result.Error
}

// CrawlLogRepository handles crawl log database operations
type CrawlLogRepository struct {
	db *gorm.DB
}

// NewCrawlLogRepository creates a new crawl log repository
func NewCrawlLogRepository(db *gorm.DB) *CrawlLogRepository {
	return &CrawlLogRepository{db: db}
}

// Create creates a new log entry
func (r *CrawlLogRepository) Create(log *model.CrawlLog) error {
	return r.db.Create(log).Error
}

// GetByTaskID gets logs for a task
func (r *CrawlLogRepository) GetByTaskID(taskID string, limit int) ([]model.CrawlLog, error) {
	var logs []model.CrawlLog
	err := r.db.Where("task_id = ?", taskID).Order("created_at DESC").Limit(limit).Find(&logs).Error
	return logs, err
}

// GetRecent gets recent logs
func (r *CrawlLogRepository) GetRecent(limit int) ([]model.CrawlLog, error) {
	var logs []model.CrawlLog
	err := r.db.Order("created_at DESC").Limit(limit).Find(&logs).Error
	return logs, err
}

// CleanupOldLogs removes logs older than the specified days
func (r *CrawlLogRepository) CleanupOldLogs(days int) (int64, error) {
	cutoff := time.Now().AddDate(0, 0, -days)
	result := r.db.Where("created_at < ?", cutoff).Delete(&model.CrawlLog{})
	return result.RowsAffected, result.Error
}
