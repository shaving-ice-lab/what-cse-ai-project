package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
	"go.uber.org/zap"
)

// =====================================================
// 数据迁移服务
// 将 what_fenbi_parse_tasks 中已解析的职位数据迁移到 what_positions 表
// =====================================================

var (
	ErrMigrationAlreadyRunning = errors.New("migration is already running")
	ErrMigrationNotRunning     = errors.New("migration is not running")
)

// MigrationStatus 迁移状态枚举
type MigrationStatus string

const (
	MigrationStatusIdle      MigrationStatus = "idle"
	MigrationStatusRunning   MigrationStatus = "running"
	MigrationStatusCompleted MigrationStatus = "completed"
	MigrationStatusFailed    MigrationStatus = "failed"
	MigrationStatusStopped   MigrationStatus = "stopped"
)

// MigrationLogEntry 迁移日志条目
type MigrationLogEntry struct {
	Time    time.Time `json:"time"`
	Level   string    `json:"level"` // info, warn, error
	Message string    `json:"message"`
	TaskID  *uint     `json:"task_id,omitempty"`
}

// MigrationState 迁移状态
type MigrationState struct {
	ID              string              `json:"id"`
	Status          MigrationStatus     `json:"status"`
	StartedAt       *time.Time          `json:"started_at,omitempty"`
	CompletedAt     *time.Time          `json:"completed_at,omitempty"`
	TotalTasks      int                 `json:"total_tasks"`      // 待迁移的解析任务数
	ProcessedTasks  int                 `json:"processed_tasks"`  // 已处理的任务数
	SuccessfulTasks int                 `json:"successful_tasks"` // 成功的任务数
	FailedTasks     int                 `json:"failed_tasks"`     // 失败的任务数
	SkippedTasks    int                 `json:"skipped_tasks"`    // 跳过的任务数（无职位数据）
	TotalPositions  int                 `json:"total_positions"`  // 提取的职位总数
	CreatedCount    int                 `json:"created_count"`    // 新建的职位数
	UpdatedCount    int                 `json:"updated_count"`    // 更新的职位数
	DuplicateCount  int                 `json:"duplicate_count"`  // 重复的职位数
	ErrorCount      int                 `json:"error_count"`      // 错误数
	Logs            []MigrationLogEntry `json:"logs"`
	LastError       string              `json:"last_error,omitempty"`
}

// MigrationStats 待迁移数据统计
type MigrationStats struct {
	TotalParseTasks    int64      `json:"total_parse_tasks"`   // 所有解析任务数
	CompletedTasks     int64      `json:"completed_tasks"`     // 已完成的解析任务数
	PositionsInDB      int64      `json:"positions_in_db"`     // 数据库中已有的职位数
	EstimatedPositions int64      `json:"estimated_positions"` // 预估可迁移的职位数
	LastMigrationTime  *time.Time `json:"last_migration_time,omitempty"`
}

// MigrateService 迁移服务
type MigrateService struct {
	fenbiParseTaskRepo *repository.FenbiParseTaskRepository
	positionRepo       *repository.PositionRepository
	logger             *zap.Logger

	mu        sync.RWMutex
	state     *MigrationState
	stopChan  chan struct{}
	isRunning bool
}

// NewMigrateService 创建迁移服务
func NewMigrateService(
	fenbiParseTaskRepo *repository.FenbiParseTaskRepository,
	positionRepo *repository.PositionRepository,
	logger *zap.Logger,
) *MigrateService {
	return &MigrateService{
		fenbiParseTaskRepo: fenbiParseTaskRepo,
		positionRepo:       positionRepo,
		logger:             logger,
		state:              &MigrationState{Status: MigrationStatusIdle},
	}
}

// GetStats 获取迁移统计信息
func (s *MigrateService) GetStats() (*MigrationStats, error) {
	stats := &MigrationStats{}

	// 获取解析任务统计
	taskStats, err := s.fenbiParseTaskRepo.GetStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get parse task stats: %w", err)
	}

	stats.TotalParseTasks = taskStats["total"]
	stats.CompletedTasks = taskStats[string(model.FenbiParseTaskStatusCompleted)]

	// 获取职位数量
	positionStats, err := s.positionRepo.GetStats()
	if err != nil {
		return nil, fmt.Errorf("failed to get position stats: %w", err)
	}
	stats.PositionsInDB = positionStats.TotalCount

	// 预估可迁移职位数（每个任务平均约 50 个职位，仅做粗略估计）
	stats.EstimatedPositions = stats.CompletedTasks * 50

	return stats, nil
}

// GetStatus 获取当前迁移状态
func (s *MigrateService) GetStatus() *MigrationState {
	s.mu.RLock()
	defer s.mu.RUnlock()
	return s.state
}

// StartMigration 开始迁移
func (s *MigrateService) StartMigration() (*MigrationState, error) {
	s.mu.Lock()
	if s.isRunning {
		s.mu.Unlock()
		return nil, ErrMigrationAlreadyRunning
	}
	s.isRunning = true
	now := time.Now()
	s.state = &MigrationState{
		ID:        uuid.New().String(),
		Status:    MigrationStatusRunning,
		StartedAt: &now,
		Logs:      []MigrationLogEntry{},
	}
	s.stopChan = make(chan struct{})
	s.mu.Unlock()

	// 异步执行迁移
	go s.runMigration()

	return s.state, nil
}

// StopMigration 停止迁移
func (s *MigrateService) StopMigration() error {
	s.mu.Lock()
	defer s.mu.Unlock()

	if !s.isRunning {
		return ErrMigrationNotRunning
	}

	close(s.stopChan)
	return nil
}

// runMigration 执行迁移
func (s *MigrateService) runMigration() {
	s.addLog("info", "开始执行数据迁移...", nil)

	defer func() {
		s.mu.Lock()
		s.isRunning = false
		now := time.Now()
		s.state.CompletedAt = &now
		if s.state.Status == MigrationStatusRunning {
			s.state.Status = MigrationStatusCompleted
		}
		s.mu.Unlock()
	}()

	// 1. 获取所有已完成的解析任务
	s.addLog("info", "正在获取待迁移的解析任务...", nil)

	params := &repository.FenbiParseTaskListParams{
		Status:   string(model.FenbiParseTaskStatusCompleted),
		Page:     1,
		PageSize: 1000, // 分批处理
	}

	tasks, total, err := s.fenbiParseTaskRepo.List(params)
	if err != nil {
		s.setError(fmt.Sprintf("获取解析任务失败: %v", err))
		return
	}

	s.mu.Lock()
	s.state.TotalTasks = int(total)
	s.mu.Unlock()
	s.addLog("info", fmt.Sprintf("共发现 %d 个已完成的解析任务待迁移", total), nil)

	// 2. 逐个处理解析任务
	for _, task := range tasks {
		// 检查是否停止
		select {
		case <-s.stopChan:
			s.mu.Lock()
			s.state.Status = MigrationStatusStopped
			s.mu.Unlock()
			s.addLog("warn", "迁移已被手动停止", nil)
			return
		default:
		}

		s.processTask(&task)
	}

	// 处理剩余分页（如果有）
	if int(total) > len(tasks) {
		pages := (int(total) + 999) / 1000
		for page := 2; page <= pages; page++ {
			select {
			case <-s.stopChan:
				s.mu.Lock()
				s.state.Status = MigrationStatusStopped
				s.mu.Unlock()
				s.addLog("warn", "迁移已被手动停止", nil)
				return
			default:
			}

			params.Page = page
			tasks, _, err = s.fenbiParseTaskRepo.List(params)
			if err != nil {
				s.addLog("error", fmt.Sprintf("获取第 %d 页解析任务失败: %v", page, err), nil)
				continue
			}

			for _, task := range tasks {
				select {
				case <-s.stopChan:
					s.mu.Lock()
					s.state.Status = MigrationStatusStopped
					s.mu.Unlock()
					s.addLog("warn", "迁移已被手动停止", nil)
					return
				default:
				}
				s.processTask(&task)
			}
		}
	}

	s.addLog("info", fmt.Sprintf("迁移完成! 处理任务: %d, 成功: %d, 失败: %d, 跳过: %d, 新建职位: %d, 更新: %d, 重复: %d",
		s.state.ProcessedTasks, s.state.SuccessfulTasks, s.state.FailedTasks, s.state.SkippedTasks,
		s.state.CreatedCount, s.state.UpdatedCount, s.state.DuplicateCount), nil)
}

// processTask 处理单个解析任务
func (s *MigrateService) processTask(task *model.FenbiParseTask) {
	taskID := task.ID

	s.mu.Lock()
	s.state.ProcessedTasks++
	s.mu.Unlock()

	// 检查 parse_result_summary
	if task.ParseResultSummary == nil {
		s.mu.Lock()
		s.state.SkippedTasks++
		s.mu.Unlock()
		return
	}

	// 提取职位数据
	positions := s.extractPositions(task)
	if len(positions) == 0 {
		s.mu.Lock()
		s.state.SkippedTasks++
		s.mu.Unlock()
		return
	}

	s.mu.Lock()
	s.state.TotalPositions += len(positions)
	s.mu.Unlock()

	// 批量保存职位
	created, updated, duplicates, errs := s.savePositions(positions, task.FenbiAnnouncementID)

	s.mu.Lock()
	s.state.CreatedCount += created
	s.state.UpdatedCount += updated
	s.state.DuplicateCount += duplicates
	s.state.ErrorCount += errs
	if errs > 0 {
		s.state.FailedTasks++
	} else {
		s.state.SuccessfulTasks++
	}
	s.mu.Unlock()

	if created > 0 || updated > 0 {
		s.addLog("info", fmt.Sprintf("任务 #%d: 提取 %d 个职位, 新建 %d, 更新 %d, 重复 %d",
			taskID, len(positions), created, updated, duplicates), &taskID)
	}
}

// extractPositions 从解析结果中提取职位数据
func (s *MigrateService) extractPositions(task *model.FenbiParseTask) []*model.Position {
	var positions []*model.Position

	// 尝试从 parse_result_summary 中提取 positions
	summary := task.ParseResultSummary
	if summary == nil {
		return nil
	}

	// 获取 positions 数组
	positionsData, ok := summary["positions"]
	if !ok {
		// 尝试其他可能的字段名
		positionsData, ok = summary["position_list"]
		if !ok {
			positionsData, ok = summary["data"]
			if !ok {
				return nil
			}
		}
	}

	// 转换为 []interface{}
	positionsList, ok := positionsData.([]interface{})
	if !ok {
		return nil
	}

	for _, item := range positionsList {
		posMap, ok := item.(map[string]interface{})
		if !ok {
			continue
		}

		position := s.mapToPosition(posMap, task)
		if position != nil {
			positions = append(positions, position)
		}
	}

	return positions
}

// mapToPosition 将 map 转换为 Position 结构体
func (s *MigrateService) mapToPosition(data map[string]interface{}, task *model.FenbiParseTask) *model.Position {
	position := &model.Position{}

	// 关联信息
	position.FenbiAnnouncementID = task.FenbiAnnouncementID

	// 基本信息
	position.PositionName = getStringValue(data, "position_name", "岗位名称", "name")
	if position.PositionName == "" {
		return nil // 职位名称必填
	}

	position.PositionCode = getStringValue(data, "position_code", "职位代码", "code")
	position.DepartmentName = getStringValue(data, "department_name", "招录单位", "unit_name", "dept_name")
	position.DepartmentCode = getStringValue(data, "department_code", "单位代码")
	position.DepartmentLevel = getStringValue(data, "department_level", "单位层级")

	// 招录条件
	position.RecruitCount = getIntValue(data, "recruit_count", "招录人数", "recruit_num", "plan_num")
	if position.RecruitCount <= 0 {
		position.RecruitCount = 1
	}

	position.Education = getStringValue(data, "education", "学历", "education_requirement")
	position.Degree = getStringValue(data, "degree", "学位")
	position.MajorCategory = getStringValue(data, "major_category", "专业大类")
	position.MajorRequirement = getStringValue(data, "major_requirement", "专业要求", "major")
	position.MajorList = getStringArrayValue(data, "major_list", "专业列表")
	position.IsUnlimitedMajor = getBoolValue(data, "is_unlimited_major", "不限专业") || isUnlimitedMajor(position.MajorRequirement)

	// 工作地点
	position.WorkLocation = getStringValue(data, "work_location", "工作地点", "location")
	position.Province = getStringValue(data, "province", "省份")
	position.City = getStringValue(data, "city", "城市")
	position.District = getStringValue(data, "district", "区县")

	// 如果省市区为空，尝试从工作地点提取
	if position.Province == "" && position.WorkLocation != "" {
		position.Province = extractProvince(position.WorkLocation)
	}
	if position.City == "" && position.WorkLocation != "" {
		position.City = extractCity(position.WorkLocation)
	}
	if position.District == "" && position.WorkLocation != "" {
		position.District = extractDistrict(position.WorkLocation)
	}

	// 其他条件
	position.PoliticalStatus = getStringValue(data, "political_status", "政治面貌")
	position.Age = getStringValue(data, "age", "年龄要求", "age_requirement")
	position.AgeMin, position.AgeMax = parseAgeRequirement(position.Age)
	position.WorkExperience = getStringValue(data, "work_experience", "工作经验", "experience")
	position.WorkExperienceYears = parseWorkExperience(position.WorkExperience)
	position.Gender = getStringValue(data, "gender", "性别")
	position.HouseholdRequirement = getStringValue(data, "household_requirement", "户籍要求", "household")
	position.ServicePeriod = getStringValue(data, "service_period", "服务期限")
	position.OtherConditions = getStringValue(data, "other_conditions", "其他条件", "remark", "备注")

	// 应届生检测
	freshGrad := getBoolPtrValue(data, "is_for_fresh_graduate", "限应届")
	if freshGrad != nil {
		position.IsForFreshGraduate = freshGrad
	} else if position.OtherConditions != "" {
		position.IsForFreshGraduate = detectFreshGraduateOnly(position.OtherConditions)
	}

	// 考试信息
	position.ExamType = getStringValue(data, "exam_type", "考试类型")
	position.ExamCategory = getStringValue(data, "exam_category", "考试分类")

	// 时间信息
	position.RegistrationStart = parseTimeValue(data, "registration_start", "报名开始")
	position.RegistrationEnd = parseTimeValue(data, "registration_end", "报名截止")
	position.ExamDate = parseTimeValue(data, "exam_date", "考试时间", "笔试时间")
	position.InterviewDate = parseTimeValue(data, "interview_date", "面试时间")

	// 其他
	position.SalaryRange = getStringValue(data, "salary_range", "薪资范围", "salary")
	position.Remark = getStringValue(data, "remark", "备注")
	position.SourceURL = getStringValue(data, "source_url", "来源链接", "url")

	// 解析置信度
	position.ParseConfidence = getIntValue(data, "parse_confidence", "置信度")
	if position.ParseConfidence == 0 {
		position.ParseConfidence = 80 // 默认置信度
	}
	now := time.Now()
	position.ParsedAt = &now

	// 生成唯一ID
	position.PositionID = s.generatePositionID(position)

	// 默认状态为待审核
	position.Status = int(model.PositionStatusPending)

	return position
}

// generatePositionID 生成职位唯一ID
func (s *MigrateService) generatePositionID(pos *model.Position) string {
	// 使用职位代码、单位代码、职位名称等生成唯一标识
	components := []string{}

	if pos.PositionCode != "" {
		components = append(components, pos.PositionCode)
	}
	if pos.DepartmentCode != "" {
		components = append(components, pos.DepartmentCode)
	}
	if pos.PositionName != "" {
		components = append(components, pos.PositionName)
	}
	if pos.DepartmentName != "" {
		components = append(components, pos.DepartmentName)
	}

	if len(components) == 0 {
		// 如果没有足够信息，生成UUID
		return uuid.New().String()
	}

	// 使用组件生成确定性ID
	return fmt.Sprintf("%x", hash(strings.Join(components, "|")))[:32]
}

// savePositions 批量保存职位
func (s *MigrateService) savePositions(positions []*model.Position, fenbiAnnouncementID *uint) (created, updated, duplicates, errs int) {
	for _, pos := range positions {
		// 检查是否已存在
		existing, err := s.positionRepo.FindByPositionID(pos.PositionID)
		if err == nil && existing != nil {
			// 已存在，可选择更新或跳过
			duplicates++
			continue
		}

		// 创建新职位
		if err := s.positionRepo.Create(pos); err != nil {
			s.logger.Error("创建职位失败",
				zap.String("position_id", pos.PositionID),
				zap.String("position_name", pos.PositionName),
				zap.Error(err))
			errs++
			continue
		}
		created++
	}
	return
}

// addLog 添加日志
func (s *MigrateService) addLog(level, message string, taskID *uint) {
	s.mu.Lock()
	defer s.mu.Unlock()

	entry := MigrationLogEntry{
		Time:    time.Now(),
		Level:   level,
		Message: message,
		TaskID:  taskID,
	}
	s.state.Logs = append(s.state.Logs, entry)

	// 限制日志数量
	if len(s.state.Logs) > 1000 {
		s.state.Logs = s.state.Logs[len(s.state.Logs)-500:]
	}

	// 同时记录到 zap logger
	switch level {
	case "error":
		s.logger.Error(message)
	case "warn":
		s.logger.Warn(message)
	default:
		s.logger.Info(message)
	}
}

// setError 设置错误状态
func (s *MigrateService) setError(errMsg string) {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.state.Status = MigrationStatusFailed
	s.state.LastError = errMsg
	s.addLog("error", errMsg, nil)
}

// =====================================================
// 辅助函数
// =====================================================

// getStringValue 从 map 中获取字符串值，支持多个可能的键名
func getStringValue(data map[string]interface{}, keys ...string) string {
	for _, key := range keys {
		if val, ok := data[key]; ok {
			if str, ok := val.(string); ok && str != "" {
				return strings.TrimSpace(str)
			}
		}
	}
	return ""
}

// getIntValue 从 map 中获取整数值
func getIntValue(data map[string]interface{}, keys ...string) int {
	for _, key := range keys {
		if val, ok := data[key]; ok {
			switch v := val.(type) {
			case int:
				return v
			case int64:
				return int(v)
			case float64:
				return int(v)
			case json.Number:
				if i, err := v.Int64(); err == nil {
					return int(i)
				}
			case string:
				// 尝试解析字符串中的数字
				var num int
				if _, err := fmt.Sscanf(v, "%d", &num); err == nil {
					return num
				}
			}
		}
	}
	return 0
}

// getBoolValue 从 map 中获取布尔值
func getBoolValue(data map[string]interface{}, keys ...string) bool {
	for _, key := range keys {
		if val, ok := data[key]; ok {
			switch v := val.(type) {
			case bool:
				return v
			case int:
				return v != 0
			case float64:
				return v != 0
			case string:
				return v == "true" || v == "1" || v == "是"
			}
		}
	}
	return false
}

// getBoolPtrValue 从 map 中获取布尔指针值
func getBoolPtrValue(data map[string]interface{}, keys ...string) *bool {
	for _, key := range keys {
		if val, ok := data[key]; ok {
			switch v := val.(type) {
			case bool:
				return &v
			case int:
				b := v != 0
				return &b
			case float64:
				b := v != 0
				return &b
			case string:
				b := v == "true" || v == "1" || v == "是"
				return &b
			case nil:
				return nil
			}
		}
	}
	return nil
}

// getStringArrayValue 从 map 中获取字符串数组
func getStringArrayValue(data map[string]interface{}, keys ...string) model.JSONStringArray {
	for _, key := range keys {
		if val, ok := data[key]; ok {
			switch v := val.(type) {
			case []string:
				return v
			case []interface{}:
				var result []string
				for _, item := range v {
					if str, ok := item.(string); ok {
						result = append(result, str)
					}
				}
				return result
			case string:
				// 尝试解析 JSON 数组
				var arr []string
				if err := json.Unmarshal([]byte(v), &arr); err == nil {
					return arr
				}
			}
		}
	}
	return nil
}

// parseTimeValue 解析时间值
func parseTimeValue(data map[string]interface{}, keys ...string) *time.Time {
	for _, key := range keys {
		if val, ok := data[key]; ok {
			switch v := val.(type) {
			case string:
				if t := parseTimeString(v); t != nil {
					return t
				}
			case time.Time:
				return &v
			}
		}
	}
	return nil
}

// hash 简单哈希函数
func hash(s string) uint64 {
	h := uint64(14695981039346656037)
	for i := 0; i < len(s); i++ {
		h ^= uint64(s[i])
		h *= 1099511628211
	}
	return h
}
