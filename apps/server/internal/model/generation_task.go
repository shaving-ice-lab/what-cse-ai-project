package model

import (
	"encoding/json"
	"time"

	"gorm.io/gorm"
)

// GenerationTaskType 生成任务类型
type GenerationTaskType string

const (
	GenerationTaskTypeCourse      GenerationTaskType = "course"      // 课程内容
	GenerationTaskTypeQuestion    GenerationTaskType = "question"    // 题目批次
	GenerationTaskTypeMaterial    GenerationTaskType = "material"    // 素材批次
	GenerationTaskTypeDescription GenerationTaskType = "description" // 分类描述
)

// GenerationTaskStatus 生成任务状态
type GenerationTaskStatus string

const (
	GenerationTaskStatusPending    GenerationTaskStatus = "pending"    // 等待处理
	GenerationTaskStatusGenerating GenerationTaskStatus = "generating" // 生成中
	GenerationTaskStatusCompleted  GenerationTaskStatus = "completed"  // 已完成
	GenerationTaskStatusFailed     GenerationTaskStatus = "failed"     // 失败
	GenerationTaskStatusCancelled  GenerationTaskStatus = "cancelled"  // 已取消
)

// GenerationTask 内容生成任务
type GenerationTask struct {
	ID           uint                 `gorm:"primaryKey" json:"id"`
	TaskType     GenerationTaskType   `gorm:"type:varchar(50);not null;index" json:"task_type"`       // 任务类型
	TargetID     *uint                `gorm:"index" json:"target_id,omitempty"`                       // 目标记录 ID（如分类ID、课程ID等）
	TargetInfo   string               `gorm:"type:json" json:"target_info,omitempty"`                 // 目标详情（JSON格式）
	Status       GenerationTaskStatus `gorm:"type:varchar(20);default:'pending';index" json:"status"` // 任务状态
	PromptUsed   string               `gorm:"type:text" json:"prompt_used,omitempty"`                 // 使用的 Prompt
	Result       string               `gorm:"type:longtext" json:"result,omitempty"`                  // 生成结果（JSON格式）
	ErrorMessage string               `gorm:"type:text" json:"error_message,omitempty"`               // 错误信息
	TokensUsed   int                  `gorm:"default:0" json:"tokens_used"`                           // Token 使用量
	DurationMs   int                  `gorm:"default:0" json:"duration_ms"`                           // 耗时（毫秒）
	CreatedBy    *uint                `gorm:"index" json:"created_by,omitempty"`                      // 创建者
	CreatedAt    time.Time            `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt    time.Time            `gorm:"autoUpdateTime" json:"updated_at"`
	CompletedAt  *time.Time           `json:"completed_at,omitempty"` // 完成时间
	DeletedAt    gorm.DeletedAt       `gorm:"index" json:"-"`
}

// TableName 表名
func (GenerationTask) TableName() string {
	return "what_generation_tasks"
}

// GenerationTaskResponse 生成任务响应
type GenerationTaskResponse struct {
	ID           uint                 `json:"id"`
	TaskType     GenerationTaskType   `json:"task_type"`
	TargetID     *uint                `json:"target_id,omitempty"`
	TargetInfo   interface{}          `json:"target_info,omitempty"`
	Status       GenerationTaskStatus `json:"status"`
	Result       interface{}          `json:"result,omitempty"`
	ErrorMessage string               `json:"error_message,omitempty"`
	TokensUsed   int                  `json:"tokens_used"`
	DurationMs   int                  `json:"duration_ms"`
	CreatedAt    time.Time            `json:"created_at"`
	CompletedAt  *time.Time           `json:"completed_at,omitempty"`
}

// ToResponse 转换为响应格式
func (t *GenerationTask) ToResponse() *GenerationTaskResponse {
	resp := &GenerationTaskResponse{
		ID:           t.ID,
		TaskType:     t.TaskType,
		TargetID:     t.TargetID,
		Status:       t.Status,
		ErrorMessage: t.ErrorMessage,
		TokensUsed:   t.TokensUsed,
		DurationMs:   t.DurationMs,
		CreatedAt:    t.CreatedAt,
		CompletedAt:  t.CompletedAt,
	}

	// 解析 JSON 字段
	if t.TargetInfo != "" {
		var targetInfo interface{}
		if err := json.Unmarshal([]byte(t.TargetInfo), &targetInfo); err == nil {
			resp.TargetInfo = targetInfo
		}
	}

	if t.Result != "" && t.Status == GenerationTaskStatusCompleted {
		var result interface{}
		if err := json.Unmarshal([]byte(t.Result), &result); err == nil {
			resp.Result = result
		} else {
			// Fall back to raw result string when JSON parsing fails
			resp.Result = t.Result
		}
	}

	return resp
}

// CreateGenerationTaskRequest 创建生成任务请求
type CreateGenerationTaskRequest struct {
	TaskType   GenerationTaskType `json:"task_type" validate:"required,oneof=course question material description"`
	TargetID   *uint              `json:"target_id,omitempty"`
	TargetInfo interface{}        `json:"target_info,omitempty"`
}

// ListGenerationTasksRequest 列出生成任务请求
type ListGenerationTasksRequest struct {
	TaskType string `query:"task_type"`
	Status   string `query:"status"`
	Page     int    `query:"page"`
	PageSize int    `query:"page_size"`
}
