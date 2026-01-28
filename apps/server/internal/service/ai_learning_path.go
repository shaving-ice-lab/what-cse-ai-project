package service

import (
	"context"
	"errors"
	"fmt"
	"math"
	"sort"
	"time"

	"github.com/what-cse/server/internal/repository"
)

var (
	ErrLearningPathNotFound = errors.New("学习路径不存在")
	ErrInvalidUserProfile   = errors.New("用户画像无效")
	ErrNoLearningData       = errors.New("暂无学习数据")
)

// =====================================================
// 学习路径生成服务
// =====================================================

// AILearningPathService AI学习路径服务
type AILearningPathService struct {
	userRepo      *repository.UserProfileRepository
	learningRepo  *repository.UserDailyLearningStatsRepository
	questionRepo  *repository.QuestionRepository
	courseRepo    *repository.CourseRepository
	knowledgeRepo *repository.KnowledgePointRepository
}

// NewAILearningPathService 创建AI学习路径服务实例
func NewAILearningPathService(
	userRepo *repository.UserProfileRepository,
	learningRepo *repository.UserDailyLearningStatsRepository,
	questionRepo *repository.QuestionRepository,
	courseRepo *repository.CourseRepository,
	knowledgeRepo *repository.KnowledgePointRepository,
) *AILearningPathService {
	return &AILearningPathService{
		userRepo:      userRepo,
		learningRepo:  learningRepo,
		questionRepo:  questionRepo,
		courseRepo:    courseRepo,
		knowledgeRepo: knowledgeRepo,
	}
}

// =====================================================
// 类型定义
// =====================================================

// UserProfile 用户画像
type UserProfile struct {
	UserID            uint      `json:"user_id"`
	TargetExam        string    `json:"target_exam"`         // 目标考试类型
	TargetExamDate    time.Time `json:"target_exam_date"`    // 目标考试日期
	DailyStudyMinutes int       `json:"daily_study_minutes"` // 每日可学习时间(分钟)
	CurrentLevel      string    `json:"current_level"`       // 当前能力水平: beginner/intermediate/advanced
	WeakSubjects      []string  `json:"weak_subjects"`       // 薄弱科目
	StrongSubjects    []string  `json:"strong_subjects"`     // 擅长科目
	OverallScore      float64   `json:"overall_score"`       // 综合评分 0-100
	StudyDays         int       `json:"study_days"`          // 已学习天数
	TotalMinutes      int       `json:"total_minutes"`       // 累计学习时长
}

// LearningPath 学习路径
type LearningPath struct {
	ID              string          `json:"id"`
	UserID          uint            `json:"user_id"`
	Name            string          `json:"name"`
	Description     string          `json:"description"`
	TargetExam      string          `json:"target_exam"`
	TotalDays       int             `json:"total_days"`       // 总天数
	CurrentDay      int             `json:"current_day"`      // 当前第几天
	ProgressPercent float64         `json:"progress_percent"` // 进度百分比
	Phases          []LearningPhase `json:"phases"`           // 学习阶段
	DailyTasks      []DailyTask     `json:"daily_tasks"`      // 今日任务
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`
}

// LearningPhase 学习阶段
type LearningPhase struct {
	ID          string   `json:"id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	StartDay    int      `json:"start_day"`
	EndDay      int      `json:"end_day"`
	Goals       []string `json:"goals"` // 阶段目标
	Focus       []string `json:"focus"` // 重点内容
	IsCompleted bool     `json:"is_completed"`
	IsCurrent   bool     `json:"is_current"`
	Progress    float64  `json:"progress"` // 阶段进度
}

// DailyTask 每日任务
type DailyTask struct {
	ID          string   `json:"id"`
	Type        string   `json:"type"` // course/practice/review
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Subject     string   `json:"subject"`
	Duration    int      `json:"duration"` // 预计时长(分钟)
	Priority    int      `json:"priority"` // 优先级 1-3
	IsCompleted bool     `json:"is_completed"`
	ResourceID  uint     `json:"resource_id,omitempty"` // 关联资源ID
	Tags        []string `json:"tags,omitempty"`
}

// GeneratePathRequest 生成学习路径请求
type GeneratePathRequest struct {
	UserID            uint      `json:"user_id" validate:"required"`
	TargetExam        string    `json:"target_exam" validate:"required"`
	TargetExamDate    time.Time `json:"target_exam_date"`
	DailyStudyMinutes int       `json:"daily_study_minutes"`
	Force             bool      `json:"force"` // 强制重新生成
}

// =====================================================
// 用户画像分析
// =====================================================

// AnalyzeUserProfile 分析用户画像
func (s *AILearningPathService) AnalyzeUserProfile(ctx context.Context, userID uint) (*UserProfile, error) {
	// 模拟获取用户学习数据并生成画像
	profile := &UserProfile{
		UserID:            userID,
		TargetExam:        "国考",
		DailyStudyMinutes: 120,
		CurrentLevel:      "intermediate",
		WeakSubjects:      []string{"资料分析", "数量关系"},
		StrongSubjects:    []string{"言语理解", "判断推理"},
		OverallScore:      65.5,
		StudyDays:         30,
		TotalMinutes:      3600,
	}

	// TODO: 从实际数据分析用户画像
	// 1. 获取用户做题记录，计算各科目正确率
	// 2. 分析学习时间分布
	// 3. 评估当前能力水平

	return profile, nil
}

// =====================================================
// 学习路径生成
// =====================================================

// GenerateLearningPath 生成学习路径
func (s *AILearningPathService) GenerateLearningPath(ctx context.Context, req GeneratePathRequest) (*LearningPath, error) {
	// 分析用户画像
	profile, err := s.AnalyzeUserProfile(ctx, req.UserID)
	if err != nil {
		return nil, fmt.Errorf("分析用户画像失败: %w", err)
	}

	// 计算剩余天数
	var daysUntilExam int
	if !req.TargetExamDate.IsZero() {
		daysUntilExam = int(req.TargetExamDate.Sub(time.Now()).Hours() / 24)
	} else {
		daysUntilExam = 90 // 默认90天
	}

	dailyMinutes := req.DailyStudyMinutes
	if dailyMinutes <= 0 {
		dailyMinutes = profile.DailyStudyMinutes
		if dailyMinutes <= 0 {
			dailyMinutes = 120
		}
	}

	// 生成学习阶段
	phases := s.generatePhases(daysUntilExam, profile)

	// 生成今日任务
	dailyTasks := s.generateDailyTasks(profile, dailyMinutes)

	// 构建学习路径
	path := &LearningPath{
		ID:              fmt.Sprintf("path_%d_%d", req.UserID, time.Now().Unix()),
		UserID:          req.UserID,
		Name:            fmt.Sprintf("%s 备考学习路径", req.TargetExam),
		Description:     s.generatePathDescription(profile, daysUntilExam),
		TargetExam:      req.TargetExam,
		TotalDays:       daysUntilExam,
		CurrentDay:      1,
		ProgressPercent: 0,
		Phases:          phases,
		DailyTasks:      dailyTasks,
		CreatedAt:       time.Now(),
		UpdatedAt:       time.Now(),
	}

	return path, nil
}

// generatePhases 生成学习阶段
func (s *AILearningPathService) generatePhases(totalDays int, profile *UserProfile) []LearningPhase {
	phases := []LearningPhase{}

	if totalDays >= 60 {
		// 长期备考：基础->强化->冲刺
		foundationDays := int(float64(totalDays) * 0.4)
		enhanceDays := int(float64(totalDays) * 0.35)
		_ = totalDays - foundationDays - enhanceDays // sprintDays

		phases = append(phases, LearningPhase{
			ID:          "phase_1",
			Name:        "基础夯实阶段",
			Description: "系统学习各科目基础知识，构建完整知识体系",
			StartDay:    1,
			EndDay:      foundationDays,
			Goals: []string{
				"掌握各科目核心知识点",
				"建立系统的知识框架",
				"培养良好的学习习惯",
			},
			Focus: []string{
				"行测基础题型训练",
				"申论材料阅读训练",
				"公基基础知识积累",
			},
			IsCurrent: true,
			Progress:  0,
		})

		phases = append(phases, LearningPhase{
			ID:          "phase_2",
			Name:        "强化提升阶段",
			Description: "针对薄弱环节专项突破，提升解题能力和速度",
			StartDay:    foundationDays + 1,
			EndDay:      foundationDays + enhanceDays,
			Goals: []string{
				"突破薄弱知识点",
				"提高解题速度",
				"掌握答题技巧",
			},
			Focus:    profile.WeakSubjects,
			Progress: 0,
		})

		phases = append(phases, LearningPhase{
			ID:          "phase_3",
			Name:        "冲刺模考阶段",
			Description: "全真模拟训练，查漏补缺，调整考试状态",
			StartDay:    foundationDays + enhanceDays + 1,
			EndDay:      totalDays,
			Goals: []string{
				"模拟真实考试环境",
				"优化时间分配",
				"保持最佳状态",
			},
			Focus: []string{
				"全真模考演练",
				"错题回顾总结",
				"时政热点梳理",
			},
			Progress: 0,
		})
	} else if totalDays >= 30 {
		// 中期备考：强化->冲刺
		enhanceDays := int(float64(totalDays) * 0.6)
		_ = totalDays - enhanceDays // sprintDays

		phases = append(phases, LearningPhase{
			ID:          "phase_1",
			Name:        "强化突破阶段",
			Description: "快速补充基础知识，重点突破薄弱环节",
			StartDay:    1,
			EndDay:      enhanceDays,
			Goals: []string{
				"快速夯实基础",
				"重点突破薄弱科目",
				"提高做题效率",
			},
			Focus:     append([]string{"核心知识点速学"}, profile.WeakSubjects...),
			IsCurrent: true,
			Progress:  0,
		})

		phases = append(phases, LearningPhase{
			ID:          "phase_2",
			Name:        "冲刺模考阶段",
			Description: "密集模考训练，快速提升应试能力",
			StartDay:    enhanceDays + 1,
			EndDay:      totalDays,
			Goals: []string{
				"每日一套模拟卷",
				"熟练掌握答题节奏",
				"保持良好心态",
			},
			Focus: []string{
				"限时模考",
				"错题精析",
				"考前冲刺",
			},
			Progress: 0,
		})
	} else {
		// 短期冲刺
		phases = append(phases, LearningPhase{
			ID:          "phase_1",
			Name:        "考前冲刺阶段",
			Description: "聚焦高频考点，快速提分",
			StartDay:    1,
			EndDay:      totalDays,
			Goals: []string{
				"抓住核心考点",
				"保持做题手感",
				"调整心态迎考",
			},
			Focus: []string{
				"高频考点速记",
				"真题模拟演练",
				"错题快速回顾",
			},
			IsCurrent: true,
			Progress:  0,
		})
	}

	return phases
}

// generateDailyTasks 生成每日任务
func (s *AILearningPathService) generateDailyTasks(profile *UserProfile, dailyMinutes int) []DailyTask {
	tasks := []DailyTask{}

	// 根据可用时间和薄弱科目生成任务
	courseMins := int(float64(dailyMinutes) * 0.4)
	practiceMins := int(float64(dailyMinutes) * 0.4)
	reviewMins := dailyMinutes - courseMins - practiceMins

	// 课程学习任务
	tasks = append(tasks, DailyTask{
		ID:          "task_course_1",
		Type:        "course",
		Title:       "资料分析专项课程",
		Description: "学习增长率、比重计算等核心考点",
		Subject:     "资料分析",
		Duration:    courseMins,
		Priority:    1,
		IsCompleted: false,
		Tags:        []string{"核心考点", "薄弱项"},
	})

	// 练习任务
	tasks = append(tasks, DailyTask{
		ID:          "task_practice_1",
		Type:        "practice",
		Title:       "数量关系专项练习",
		Description: "完成20道数量关系练习题",
		Subject:     "数量关系",
		Duration:    practiceMins / 2,
		Priority:    1,
		IsCompleted: false,
		Tags:        []string{"专项练习", "薄弱项"},
	})

	tasks = append(tasks, DailyTask{
		ID:          "task_practice_2",
		Type:        "practice",
		Title:       "判断推理巩固练习",
		Description: "完成15道判断推理练习题",
		Subject:     "判断推理",
		Duration:    practiceMins / 2,
		Priority:    2,
		IsCompleted: false,
		Tags:        []string{"巩固练习"},
	})

	// 复习任务
	tasks = append(tasks, DailyTask{
		ID:          "task_review_1",
		Type:        "review",
		Title:       "昨日错题回顾",
		Description: "回顾并分析昨天做错的题目",
		Subject:     "综合",
		Duration:    reviewMins,
		Priority:    2,
		IsCompleted: false,
		Tags:        []string{"错题复习"},
	})

	return tasks
}

// generatePathDescription 生成路径描述
func (s *AILearningPathService) generatePathDescription(profile *UserProfile, days int) string {
	levelDesc := map[string]string{
		"beginner":     "基础薄弱",
		"intermediate": "有一定基础",
		"advanced":     "基础扎实",
	}

	level := levelDesc[profile.CurrentLevel]
	if level == "" {
		level = "有一定基础"
	}

	return fmt.Sprintf("根据您%s的学习水平，结合%d天的备考周期，为您量身定制的学习方案。重点突破%v等薄弱环节，巩固%v等优势科目。",
		level, days, profile.WeakSubjects, profile.StrongSubjects)
}

// =====================================================
// 路径动态调整
// =====================================================

// AdjustPathRequest 调整路径请求
type AdjustPathRequest struct {
	UserID   uint     `json:"user_id" validate:"required"`
	PathID   string   `json:"path_id" validate:"required"`
	Reason   string   `json:"reason"` // 调整原因: progress_behind, progress_ahead, focus_change
	NewFocus []string `json:"new_focus,omitempty"`
}

// AdjustLearningPath 动态调整学习路径
func (s *AILearningPathService) AdjustLearningPath(ctx context.Context, req AdjustPathRequest) (*LearningPath, error) {
	// 重新分析用户画像
	profile, err := s.AnalyzeUserProfile(ctx, req.UserID)
	if err != nil {
		return nil, err
	}

	// 根据调整原因调整策略
	switch req.Reason {
	case "progress_behind":
		// 进度落后，增加每日任务量
		profile.DailyStudyMinutes = int(float64(profile.DailyStudyMinutes) * 1.2)
	case "progress_ahead":
		// 进度超前，可以增加深度学习
		profile.DailyStudyMinutes = profile.DailyStudyMinutes
	case "focus_change":
		// 调整学习重点
		if len(req.NewFocus) > 0 {
			profile.WeakSubjects = req.NewFocus
		}
	}

	// 重新生成路径
	return s.GenerateLearningPath(ctx, GeneratePathRequest{
		UserID:            req.UserID,
		TargetExam:        profile.TargetExam,
		DailyStudyMinutes: profile.DailyStudyMinutes,
		Force:             true,
	})
}

// =====================================================
// 进度追踪
// =====================================================

// ProgressSummary 进度摘要
type ProgressSummary struct {
	TotalProgress  float64 `json:"total_progress"`  // 总进度
	CurrentPhase   string  `json:"current_phase"`   // 当前阶段
	PhaseProgress  float64 `json:"phase_progress"`  // 阶段进度
	DaysRemaining  int     `json:"days_remaining"`  // 剩余天数
	DaysCompleted  int     `json:"days_completed"`  // 已完成天数
	TodayCompleted int     `json:"today_completed"` // 今日已完成任务数
	TodayTotal     int     `json:"today_total"`     // 今日总任务数
	IsOnTrack      bool    `json:"is_on_track"`     // 是否按计划进行
	StatusMessage  string  `json:"status_message"`  // 状态消息
	Streak         int     `json:"streak"`          // 连续学习天数
}

// GetProgressSummary 获取进度摘要
func (s *AILearningPathService) GetProgressSummary(ctx context.Context, userID uint, path *LearningPath) (*ProgressSummary, error) {
	// 计算进度
	totalProgress := float64(path.CurrentDay) / float64(path.TotalDays) * 100
	daysRemaining := path.TotalDays - path.CurrentDay

	// 计算当前阶段
	var currentPhase string
	var phaseProgress float64
	for _, phase := range path.Phases {
		if phase.IsCurrent {
			currentPhase = phase.Name
			phaseDays := phase.EndDay - phase.StartDay + 1
			currentInPhase := path.CurrentDay - phase.StartDay + 1
			phaseProgress = float64(currentInPhase) / float64(phaseDays) * 100
			break
		}
	}

	// 计算今日完成情况
	todayCompleted := 0
	for _, task := range path.DailyTasks {
		if task.IsCompleted {
			todayCompleted++
		}
	}

	// 判断是否按计划进行
	expectedProgress := totalProgress
	actualProgress := path.ProgressPercent
	isOnTrack := actualProgress >= expectedProgress*0.9 // 允许10%的偏差

	var statusMessage string
	if isOnTrack {
		statusMessage = "学习进度正常，请继续保持！"
	} else if actualProgress < expectedProgress*0.7 {
		statusMessage = "进度稍有落后，建议适当增加学习时间"
	} else {
		statusMessage = "进度略有落后，注意赶上进度"
	}

	return &ProgressSummary{
		TotalProgress:  math.Round(totalProgress*10) / 10,
		CurrentPhase:   currentPhase,
		PhaseProgress:  math.Round(phaseProgress*10) / 10,
		DaysRemaining:  daysRemaining,
		DaysCompleted:  path.CurrentDay - 1,
		TodayCompleted: todayCompleted,
		TodayTotal:     len(path.DailyTasks),
		IsOnTrack:      isOnTrack,
		StatusMessage:  statusMessage,
		Streak:         7, // TODO: 从实际数据获取
	}, nil
}

// =====================================================
// 推荐下一步学习
// =====================================================

// NextStepRecommendation 下一步学习推荐
type NextStepRecommendation struct {
	Type        string `json:"type"` // course/practice/review/mock
	Title       string `json:"title"`
	Description string `json:"description"`
	Duration    int    `json:"duration"`
	Priority    int    `json:"priority"`
	Reason      string `json:"reason"` // 推荐理由
	ResourceID  uint   `json:"resource_id,omitempty"`
}

// GetNextStepRecommendations 获取下一步学习推荐
func (s *AILearningPathService) GetNextStepRecommendations(ctx context.Context, userID uint, limit int) ([]NextStepRecommendation, error) {
	profile, err := s.AnalyzeUserProfile(ctx, userID)
	if err != nil {
		return nil, err
	}

	recommendations := []NextStepRecommendation{}

	// 基于薄弱科目推荐
	for _, weak := range profile.WeakSubjects {
		recommendations = append(recommendations, NextStepRecommendation{
			Type:        "practice",
			Title:       fmt.Sprintf("%s专项练习", weak),
			Description: fmt.Sprintf("针对您的薄弱环节%s，推荐进行专项训练", weak),
			Duration:    30,
			Priority:    1,
			Reason:      fmt.Sprintf("根据您的做题数据分析，%s正确率偏低", weak),
		})
	}

	// 复习推荐
	recommendations = append(recommendations, NextStepRecommendation{
		Type:        "review",
		Title:       "错题回顾",
		Description: "回顾近期错题，巩固薄弱知识点",
		Duration:    20,
		Priority:    2,
		Reason:      "定期复习错题可以有效提高正确率",
	})

	// 模考推荐
	recommendations = append(recommendations, NextStepRecommendation{
		Type:        "mock",
		Title:       "模拟测试",
		Description: "进行一次完整的模拟测试，检验学习效果",
		Duration:    120,
		Priority:    3,
		Reason:      "距离上次模考已超过7天，建议进行模拟练习",
	})

	// 按优先级排序
	sort.Slice(recommendations, func(i, j int) bool {
		return recommendations[i].Priority < recommendations[j].Priority
	})

	if limit > 0 && len(recommendations) > limit {
		recommendations = recommendations[:limit]
	}

	return recommendations, nil
}
