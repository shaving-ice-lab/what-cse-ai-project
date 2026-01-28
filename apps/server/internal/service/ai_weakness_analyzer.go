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
	ErrWeaknessAnalysisFailed   = errors.New("薄弱点分析失败")
	ErrWeaknessInsufficientData = errors.New("数据不足，无法进行分析")
)

// =====================================================
// 薄弱点分析服务
// =====================================================

// AIWeaknessAnalyzerService AI薄弱点分析服务
type AIWeaknessAnalyzerService struct {
	practiceRepo *repository.PracticeSessionRepository
	questionRepo *repository.QuestionRepository
	learningRepo *repository.UserDailyLearningStatsRepository
}

// NewAIWeaknessAnalyzerService 创建AI薄弱点分析服务实例
func NewAIWeaknessAnalyzerService(
	practiceRepo *repository.PracticeSessionRepository,
	questionRepo *repository.QuestionRepository,
	learningRepo *repository.UserDailyLearningStatsRepository,
) *AIWeaknessAnalyzerService {
	return &AIWeaknessAnalyzerService{
		practiceRepo: practiceRepo,
		questionRepo: questionRepo,
		learningRepo: learningRepo,
	}
}

// =====================================================
// 类型定义
// =====================================================

// WeaknessAnalysisResult 薄弱点分析结果
type WeaknessAnalysisResult struct {
	UserID              uint                        `json:"user_id"`
	AnalyzedAt          time.Time                   `json:"analyzed_at"`
	OverallScore        float64                     `json:"overall_score"`         // 综合评分 0-100
	TotalQuestions      int                         `json:"total_questions"`       // 总做题数
	CorrectRate         float64                     `json:"correct_rate"`          // 总正确率
	WeakKnowledgePoints []WeakKnowledgePoint        `json:"weak_knowledge_points"` // 薄弱知识点
	WeakQuestionTypes   []WeakQuestionType          `json:"weak_question_types"`   // 薄弱题型
	ErrorPatterns       []ErrorPattern              `json:"error_patterns"`        // 错误模式
	ImprovementPlan     *ImprovementPlan            `json:"improvement_plan"`      // 改进计划
	Recommendations     []ImprovementRecommendation `json:"recommendations"`       // 改进建议
}

// WeakKnowledgePoint 薄弱知识点
type WeakKnowledgePoint struct {
	ID                  uint      `json:"id"`
	Name                string    `json:"name"`
	Subject             string    `json:"subject"`
	Category            string    `json:"category"`
	CorrectRate         float64   `json:"correct_rate"`         // 正确率
	TotalCount          int       `json:"total_count"`          // 总题数
	CorrectCount        int       `json:"correct_count"`        // 正确数
	AvgTime             float64   `json:"avg_time"`             // 平均用时(秒)
	SeverityLevel       string    `json:"severity_level"`       // 严重程度: critical/high/medium/low
	Trend               string    `json:"trend"`                // 趋势: improving/stable/declining
	LastPracticed       time.Time `json:"last_practiced"`       // 最后练习时间
	RecommendedPriority int       `json:"recommended_priority"` // 推荐优先级
}

// WeakQuestionType 薄弱题型
type WeakQuestionType struct {
	Type           string   `json:"type"`
	TypeName       string   `json:"type_name"`
	Subject        string   `json:"subject"`
	CorrectRate    float64  `json:"correct_rate"`
	TotalCount     int      `json:"total_count"`
	CorrectCount   int      `json:"correct_count"`
	AvgTime        float64  `json:"avg_time"`
	SeverityLevel  string   `json:"severity_level"`
	CommonMistakes []string `json:"common_mistakes"` // 常见错误
}

// ErrorPattern 错误模式
type ErrorPattern struct {
	PatternID   string   `json:"pattern_id"`
	PatternName string   `json:"pattern_name"`
	Description string   `json:"description"`
	Frequency   int      `json:"frequency"`   // 出现频率
	ExampleIDs  []uint   `json:"example_ids"` // 示例题目ID
	Causes      []string `json:"causes"`      // 可能原因
	Solutions   []string `json:"solutions"`   // 解决方案
}

// ImprovementPlan 改进计划
type ImprovementPlan struct {
	PlanID          string             `json:"plan_id"`
	Title           string             `json:"title"`
	Description     string             `json:"description"`
	TotalDays       int                `json:"total_days"`
	DailyMinutes    int                `json:"daily_minutes"`
	Phases          []ImprovementPhase `json:"phases"`
	ExpectedOutcome string             `json:"expected_outcome"`
	CreatedAt       time.Time          `json:"created_at"`
}

// ImprovementPhase 改进阶段
type ImprovementPhase struct {
	PhaseID     string   `json:"phase_id"`
	Name        string   `json:"name"`
	Description string   `json:"description"`
	Days        int      `json:"days"`
	Focus       []string `json:"focus"`
	Tasks       []string `json:"tasks"`
	Goals       []string `json:"goals"`
}

// ImprovementRecommendation 改进建议
type ImprovementRecommendation struct {
	Type        string   `json:"type"` // knowledge/skill/strategy/mindset
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Priority    int      `json:"priority"` // 1-5
	ResourceID  uint     `json:"resource_id,omitempty"`
	ActionItems []string `json:"action_items"`
}

// AnalyzeRequest 分析请求
type AnalyzeRequest struct {
	UserID       uint      `json:"user_id" validate:"required"`
	Subject      string    `json:"subject,omitempty"`       // 限定分析的科目
	DateFrom     time.Time `json:"date_from,omitempty"`     // 开始日期
	DateTo       time.Time `json:"date_to,omitempty"`       // 结束日期
	MinQuestions int       `json:"min_questions,omitempty"` // 最少题目数
}

// =====================================================
// 数据采集
// =====================================================

// PracticeData 练习数据
type PracticeData struct {
	QuestionID     uint      `json:"question_id"`
	KnowledgePoint string    `json:"knowledge_point"`
	QuestionType   string    `json:"question_type"`
	Subject        string    `json:"subject"`
	IsCorrect      bool      `json:"is_correct"`
	TimeSpent      int       `json:"time_spent"` // 秒
	PracticedAt    time.Time `json:"practiced_at"`
	UserAnswer     string    `json:"user_answer"`
	CorrectAnswer  string    `json:"correct_answer"`
}

// collectPracticeData 采集练习数据（模拟）
func (s *AIWeaknessAnalyzerService) collectPracticeData(ctx context.Context, req AnalyzeRequest) ([]PracticeData, error) {
	// TODO: 从数据库获取真实数据
	// 这里使用模拟数据
	mockData := []PracticeData{
		// 资料分析 - 增长率（薄弱）
		{QuestionID: 1, KnowledgePoint: "增长率计算", QuestionType: "single", Subject: "资料分析", IsCorrect: false, TimeSpent: 120},
		{QuestionID: 2, KnowledgePoint: "增长率计算", QuestionType: "single", Subject: "资料分析", IsCorrect: false, TimeSpent: 150},
		{QuestionID: 3, KnowledgePoint: "增长率计算", QuestionType: "single", Subject: "资料分析", IsCorrect: true, TimeSpent: 90},
		{QuestionID: 4, KnowledgePoint: "增长率计算", QuestionType: "single", Subject: "资料分析", IsCorrect: false, TimeSpent: 180},
		{QuestionID: 5, KnowledgePoint: "增长率计算", QuestionType: "single", Subject: "资料分析", IsCorrect: true, TimeSpent: 100},
		// 资料分析 - 比重计算（中等）
		{QuestionID: 6, KnowledgePoint: "比重计算", QuestionType: "single", Subject: "资料分析", IsCorrect: true, TimeSpent: 80},
		{QuestionID: 7, KnowledgePoint: "比重计算", QuestionType: "single", Subject: "资料分析", IsCorrect: true, TimeSpent: 70},
		{QuestionID: 8, KnowledgePoint: "比重计算", QuestionType: "single", Subject: "资料分析", IsCorrect: false, TimeSpent: 100},
		{QuestionID: 9, KnowledgePoint: "比重计算", QuestionType: "single", Subject: "资料分析", IsCorrect: true, TimeSpent: 85},
		// 数量关系 - 工程问题（薄弱）
		{QuestionID: 10, KnowledgePoint: "工程问题", QuestionType: "single", Subject: "数量关系", IsCorrect: false, TimeSpent: 200},
		{QuestionID: 11, KnowledgePoint: "工程问题", QuestionType: "single", Subject: "数量关系", IsCorrect: false, TimeSpent: 180},
		{QuestionID: 12, KnowledgePoint: "工程问题", QuestionType: "single", Subject: "数量关系", IsCorrect: true, TimeSpent: 150},
		{QuestionID: 13, KnowledgePoint: "工程问题", QuestionType: "single", Subject: "数量关系", IsCorrect: false, TimeSpent: 220},
		// 言语理解 - 逻辑填空（较好）
		{QuestionID: 14, KnowledgePoint: "逻辑填空", QuestionType: "single", Subject: "言语理解", IsCorrect: true, TimeSpent: 45},
		{QuestionID: 15, KnowledgePoint: "逻辑填空", QuestionType: "single", Subject: "言语理解", IsCorrect: true, TimeSpent: 50},
		{QuestionID: 16, KnowledgePoint: "逻辑填空", QuestionType: "single", Subject: "言语理解", IsCorrect: true, TimeSpent: 40},
		{QuestionID: 17, KnowledgePoint: "逻辑填空", QuestionType: "single", Subject: "言语理解", IsCorrect: false, TimeSpent: 55},
		{QuestionID: 18, KnowledgePoint: "逻辑填空", QuestionType: "single", Subject: "言语理解", IsCorrect: true, TimeSpent: 48},
		// 判断推理 - 图形推理（中等）
		{QuestionID: 19, KnowledgePoint: "图形推理", QuestionType: "single", Subject: "判断推理", IsCorrect: true, TimeSpent: 60},
		{QuestionID: 20, KnowledgePoint: "图形推理", QuestionType: "single", Subject: "判断推理", IsCorrect: false, TimeSpent: 90},
		{QuestionID: 21, KnowledgePoint: "图形推理", QuestionType: "single", Subject: "判断推理", IsCorrect: true, TimeSpent: 70},
		{QuestionID: 22, KnowledgePoint: "图形推理", QuestionType: "single", Subject: "判断推理", IsCorrect: true, TimeSpent: 65},
	}

	return mockData, nil
}

// =====================================================
// 薄弱点识别
// =====================================================

// AnalyzeWeakness 分析薄弱点
func (s *AIWeaknessAnalyzerService) AnalyzeWeakness(ctx context.Context, req AnalyzeRequest) (*WeaknessAnalysisResult, error) {
	// 采集数据
	data, err := s.collectPracticeData(ctx, req)
	if err != nil {
		return nil, fmt.Errorf("采集数据失败: %w", err)
	}

	if len(data) == 0 {
		return nil, ErrWeaknessInsufficientData
	}

	// 分析知识点薄弱情况
	weakKnowledgePoints := s.analyzeKnowledgePoints(data)

	// 分析题型薄弱情况
	weakQuestionTypes := s.analyzeQuestionTypes(data)

	// 识别错误模式
	errorPatterns := s.identifyErrorPatterns(data)

	// 生成改进计划
	improvementPlan := s.generateImprovementPlan(weakKnowledgePoints, weakQuestionTypes)

	// 生成改进建议
	recommendations := s.generateRecommendations(weakKnowledgePoints, weakQuestionTypes, errorPatterns)

	// 计算综合指标
	totalQuestions := len(data)
	correctCount := 0
	for _, d := range data {
		if d.IsCorrect {
			correctCount++
		}
	}
	correctRate := float64(correctCount) / float64(totalQuestions) * 100
	overallScore := s.calculateOverallScore(correctRate, weakKnowledgePoints)

	return &WeaknessAnalysisResult{
		UserID:              req.UserID,
		AnalyzedAt:          time.Now(),
		OverallScore:        math.Round(overallScore*10) / 10,
		TotalQuestions:      totalQuestions,
		CorrectRate:         math.Round(correctRate*10) / 10,
		WeakKnowledgePoints: weakKnowledgePoints,
		WeakQuestionTypes:   weakQuestionTypes,
		ErrorPatterns:       errorPatterns,
		ImprovementPlan:     improvementPlan,
		Recommendations:     recommendations,
	}, nil
}

// analyzeKnowledgePoints 分析知识点薄弱情况
func (s *AIWeaknessAnalyzerService) analyzeKnowledgePoints(data []PracticeData) []WeakKnowledgePoint {
	// 按知识点分组统计
	stats := make(map[string]*struct {
		subject      string
		total        int
		correct      int
		totalTime    int
		lastPractice time.Time
	})

	for _, d := range data {
		if _, exists := stats[d.KnowledgePoint]; !exists {
			stats[d.KnowledgePoint] = &struct {
				subject      string
				total        int
				correct      int
				totalTime    int
				lastPractice time.Time
			}{subject: d.Subject}
		}
		s := stats[d.KnowledgePoint]
		s.total++
		if d.IsCorrect {
			s.correct++
		}
		s.totalTime += d.TimeSpent
		if s.lastPractice.IsZero() || d.PracticedAt.After(s.lastPractice) {
			s.lastPractice = d.PracticedAt
		}
	}

	// 转换为薄弱知识点列表
	weakPoints := []WeakKnowledgePoint{}
	var id uint = 1
	for name, s := range stats {
		correctRate := float64(s.correct) / float64(s.total) * 100
		avgTime := float64(s.totalTime) / float64(s.total)

		// 判断严重程度
		severityLevel := "low"
		if correctRate < 50 {
			severityLevel = "critical"
		} else if correctRate < 60 {
			severityLevel = "high"
		} else if correctRate < 70 {
			severityLevel = "medium"
		}

		// 计算推荐优先级
		priority := 4 - map[string]int{"critical": 3, "high": 2, "medium": 1, "low": 0}[severityLevel]

		weakPoints = append(weakPoints, WeakKnowledgePoint{
			ID:                  id,
			Name:                name,
			Subject:             s.subject,
			Category:            s.subject,
			CorrectRate:         math.Round(correctRate*10) / 10,
			TotalCount:          s.total,
			CorrectCount:        s.correct,
			AvgTime:             math.Round(avgTime*10) / 10,
			SeverityLevel:       severityLevel,
			Trend:               "stable", // TODO: 计算趋势
			LastPracticed:       s.lastPractice,
			RecommendedPriority: priority,
		})
		id++
	}

	// 按正确率排序（低的在前）
	sort.Slice(weakPoints, func(i, j int) bool {
		return weakPoints[i].CorrectRate < weakPoints[j].CorrectRate
	})

	// 只返回薄弱的（正确率低于75%）
	result := []WeakKnowledgePoint{}
	for _, wp := range weakPoints {
		if wp.CorrectRate < 75 {
			result = append(result, wp)
		}
	}

	return result
}

// analyzeQuestionTypes 分析题型薄弱情况
func (s *AIWeaknessAnalyzerService) analyzeQuestionTypes(data []PracticeData) []WeakQuestionType {
	// 按科目分组统计
	stats := make(map[string]*struct {
		total     int
		correct   int
		totalTime int
	})

	for _, d := range data {
		key := d.Subject
		if _, exists := stats[key]; !exists {
			stats[key] = &struct {
				total     int
				correct   int
				totalTime int
			}{}
		}
		s := stats[key]
		s.total++
		if d.IsCorrect {
			s.correct++
		}
		s.totalTime += d.TimeSpent
	}

	// 转换为薄弱题型列表
	weakTypes := []WeakQuestionType{}
	for subject, s := range stats {
		correctRate := float64(s.correct) / float64(s.total) * 100
		avgTime := float64(s.totalTime) / float64(s.total)

		severityLevel := "low"
		if correctRate < 50 {
			severityLevel = "critical"
		} else if correctRate < 60 {
			severityLevel = "high"
		} else if correctRate < 70 {
			severityLevel = "medium"
		}

		weakTypes = append(weakTypes, WeakQuestionType{
			Type:          subject,
			TypeName:      subject,
			Subject:       subject,
			CorrectRate:   math.Round(correctRate*10) / 10,
			TotalCount:    s.total,
			CorrectCount:  s.correct,
			AvgTime:       math.Round(avgTime*10) / 10,
			SeverityLevel: severityLevel,
			CommonMistakes: []string{
				"概念理解不清",
				"计算步骤错误",
				"审题不仔细",
			},
		})
	}

	// 按正确率排序
	sort.Slice(weakTypes, func(i, j int) bool {
		return weakTypes[i].CorrectRate < weakTypes[j].CorrectRate
	})

	return weakTypes
}

// identifyErrorPatterns 识别错误模式
func (s *AIWeaknessAnalyzerService) identifyErrorPatterns(data []PracticeData) []ErrorPattern {
	// 分析常见错误模式
	patterns := []ErrorPattern{
		{
			PatternID:   "pattern_1",
			PatternName: "计算类错误",
			Description: "在数量关系和资料分析中，计算步骤出现失误",
			Frequency:   8,
			ExampleIDs:  []uint{1, 2, 10, 11},
			Causes: []string{
				"计算速度过快导致失误",
				"公式记忆不牢固",
				"估算技巧掌握不熟练",
			},
			Solutions: []string{
				"加强计算专项训练",
				"整理常用公式卡片",
				"学习速算与估算技巧",
			},
		},
		{
			PatternID:   "pattern_2",
			PatternName: "审题不清",
			Description: "没有准确理解题目要求，导致答非所问",
			Frequency:   5,
			ExampleIDs:  []uint{4, 13},
			Causes: []string{
				"答题时间紧张",
				"题目阅读不仔细",
				"忽略关键词",
			},
			Solutions: []string{
				"培养圈画关键词的习惯",
				"做题前先通读全题",
				"注意题目中的\"不\"\"除了\"等否定词",
			},
		},
		{
			PatternID:   "pattern_3",
			PatternName: "时间分配不当",
			Description: "部分题目用时过长，影响整体答题节奏",
			Frequency:   4,
			ExampleIDs:  []uint{4, 10, 13},
			Causes: []string{
				"难题上花费太多时间",
				"缺乏时间管理意识",
				"不会战略性放弃",
			},
			Solutions: []string{
				"设定每题时间上限",
				"先易后难的答题策略",
				"学会果断放弃困难题",
			},
		},
	}

	return patterns
}

// =====================================================
// 改进建议生成
// =====================================================

// generateImprovementPlan 生成改进计划
func (s *AIWeaknessAnalyzerService) generateImprovementPlan(weakPoints []WeakKnowledgePoint, weakTypes []WeakQuestionType) *ImprovementPlan {
	// 提取最薄弱的知识点作为重点
	focusAreas := []string{}
	for i, wp := range weakPoints {
		if i >= 3 {
			break
		}
		focusAreas = append(focusAreas, wp.Name)
	}

	plan := &ImprovementPlan{
		PlanID:       fmt.Sprintf("plan_%d", time.Now().Unix()),
		Title:        "个性化薄弱点突破计划",
		Description:  "根据您的答题数据分析，为您量身定制的提升方案",
		TotalDays:    21,
		DailyMinutes: 60,
		Phases: []ImprovementPhase{
			{
				PhaseID:     "phase_1",
				Name:        "基础补强阶段",
				Description: "系统学习薄弱知识点的基础理论",
				Days:        7,
				Focus:       focusAreas,
				Tasks: []string{
					"每日观看相关知识点视频课程",
					"整理知识点笔记",
					"完成基础练习题",
				},
				Goals: []string{
					"理解核心概念",
					"掌握基本公式",
					"建立知识框架",
				},
			},
			{
				PhaseID:     "phase_2",
				Name:        "强化训练阶段",
				Description: "通过大量练习巩固知识点",
				Days:        10,
				Focus:       focusAreas,
				Tasks: []string{
					"每日完成30道专项练习",
					"分析错题原因",
					"总结答题技巧",
				},
				Goals: []string{
					"提高做题速度",
					"减少低级错误",
					"掌握解题技巧",
				},
			},
			{
				PhaseID:     "phase_3",
				Name:        "综合提升阶段",
				Description: "综合检验学习效果",
				Days:        4,
				Focus:       []string{"综合模拟", "查漏补缺"},
				Tasks: []string{
					"完成2套模拟测试",
					"分析模拟测试结果",
					"针对性查漏补缺",
				},
				Goals: []string{
					"检验学习效果",
					"建立答题信心",
					"形成稳定发挥",
				},
			},
		},
		ExpectedOutcome: fmt.Sprintf("经过21天的专项训练，预计%v等薄弱知识点的正确率可提升15-20个百分点", focusAreas),
		CreatedAt:       time.Now(),
	}

	return plan
}

// generateRecommendations 生成改进建议
func (s *AIWeaknessAnalyzerService) generateRecommendations(weakPoints []WeakKnowledgePoint, weakTypes []WeakQuestionType, patterns []ErrorPattern) []ImprovementRecommendation {
	recommendations := []ImprovementRecommendation{}

	// 基于薄弱知识点的建议
	for i, wp := range weakPoints {
		if i >= 2 {
			break
		}
		recommendations = append(recommendations, ImprovementRecommendation{
			Type:        "knowledge",
			Title:       fmt.Sprintf("强化%s知识点", wp.Name),
			Description: fmt.Sprintf("您在%s的正确率仅为%.1f%%，建议重点突破", wp.Name, wp.CorrectRate),
			Priority:    1,
			ActionItems: []string{
				fmt.Sprintf("观看%s专项课程", wp.Name),
				fmt.Sprintf("完成%s专项练习50题", wp.Name),
				"整理相关错题并分析原因",
			},
		})
	}

	// 基于错误模式的建议
	for _, pattern := range patterns {
		if pattern.Frequency >= 5 {
			recommendations = append(recommendations, ImprovementRecommendation{
				Type:        "skill",
				Title:       fmt.Sprintf("改善%s", pattern.PatternName),
				Description: pattern.Description,
				Priority:    2,
				ActionItems: pattern.Solutions,
			})
		}
	}

	// 通用策略建议
	recommendations = append(recommendations, ImprovementRecommendation{
		Type:        "strategy",
		Title:       "优化答题策略",
		Description: "合理分配时间，提高答题效率",
		Priority:    3,
		ActionItems: []string{
			"严格执行先易后难策略",
			"单题时间超过平均值1.5倍立即跳过",
			"最后5分钟检查并填涂未答题目",
		},
	})

	// 心态建议
	recommendations = append(recommendations, ImprovementRecommendation{
		Type:        "mindset",
		Title:       "调整备考心态",
		Description: "保持积极心态，相信自己的进步",
		Priority:    4,
		ActionItems: []string{
			"记录每日进步，看到自己的成长",
			"遇到困难保持平常心",
			"适当休息，避免过度焦虑",
		},
	})

	// 按优先级排序
	sort.Slice(recommendations, func(i, j int) bool {
		return recommendations[i].Priority < recommendations[j].Priority
	})

	return recommendations
}

// calculateOverallScore 计算综合评分
func (s *AIWeaknessAnalyzerService) calculateOverallScore(correctRate float64, weakPoints []WeakKnowledgePoint) float64 {
	// 基础分 = 正确率
	baseScore := correctRate

	// 薄弱点扣分
	weakPenalty := 0.0
	for _, wp := range weakPoints {
		switch wp.SeverityLevel {
		case "critical":
			weakPenalty += 3
		case "high":
			weakPenalty += 2
		case "medium":
			weakPenalty += 1
		}
	}

	// 最终得分
	finalScore := baseScore - weakPenalty
	if finalScore < 0 {
		finalScore = 0
	}
	if finalScore > 100 {
		finalScore = 100
	}

	return finalScore
}

// =====================================================
// 专项练习生成
// =====================================================

// SpecializedPractice 专项练习
type SpecializedPractice struct {
	ID             string `json:"id"`
	Title          string `json:"title"`
	Description    string `json:"description"`
	KnowledgePoint string `json:"knowledge_point"`
	QuestionCount  int    `json:"question_count"`
	EstimatedTime  int    `json:"estimated_time"` // 分钟
	Difficulty     string `json:"difficulty"`     // easy/medium/hard
	QuestionIDs    []uint `json:"question_ids"`
}

// GenerateSpecializedPractice 生成专项练习
func (s *AIWeaknessAnalyzerService) GenerateSpecializedPractice(ctx context.Context, userID uint, knowledgePoint string, count int) (*SpecializedPractice, error) {
	// TODO: 从题库中筛选相关题目
	// 这里返回模拟数据

	questionIDs := []uint{}
	for i := 1; i <= count; i++ {
		questionIDs = append(questionIDs, uint(i*100))
	}

	practice := &SpecializedPractice{
		ID:             fmt.Sprintf("practice_%d_%s", userID, time.Now().Format("20060102150405")),
		Title:          fmt.Sprintf("%s专项突破练习", knowledgePoint),
		Description:    fmt.Sprintf("根据您的薄弱点分析，为您精选的%s相关练习题", knowledgePoint),
		KnowledgePoint: knowledgePoint,
		QuestionCount:  count,
		EstimatedTime:  count * 2, // 假设每题2分钟
		Difficulty:     "medium",
		QuestionIDs:    questionIDs,
	}

	return practice, nil
}

// =====================================================
// 获取典型错题
// =====================================================

// TypicalMistake 典型错题
type TypicalMistake struct {
	QuestionID      uint      `json:"question_id"`
	QuestionContent string    `json:"question_content"`
	UserAnswer      string    `json:"user_answer"`
	CorrectAnswer   string    `json:"correct_answer"`
	KnowledgePoint  string    `json:"knowledge_point"`
	ErrorType       string    `json:"error_type"`
	Analysis        string    `json:"analysis"`
	PracticedAt     time.Time `json:"practiced_at"`
}

// GetTypicalMistakes 获取典型错题
func (s *AIWeaknessAnalyzerService) GetTypicalMistakes(ctx context.Context, userID uint, limit int) ([]TypicalMistake, error) {
	// TODO: 从数据库获取真实错题数据
	// 返回模拟数据
	mistakes := []TypicalMistake{
		{
			QuestionID:      1,
			QuestionContent: "2023年某市GDP为5000亿元，比上年增长8%，则2022年该市GDP约为多少亿元？",
			UserAnswer:      "A. 4600亿元",
			CorrectAnswer:   "B. 4630亿元",
			KnowledgePoint:  "增长率计算",
			ErrorType:       "计算错误",
			Analysis:        "本题考查基期值计算。基期值=现期值÷(1+增长率)=5000÷1.08≈4630亿元。常见错误是直接用现期值减去增长量。",
			PracticedAt:     time.Now().AddDate(0, 0, -1),
		},
		{
			QuestionID:      10,
			QuestionContent: "甲乙两人合作完成一项工程，甲单独做需要10天，乙单独做需要15天，两人合作几天可以完成？",
			UserAnswer:      "C. 7天",
			CorrectAnswer:   "A. 6天",
			KnowledgePoint:  "工程问题",
			ErrorType:       "公式应用错误",
			Analysis:        "工程问题核心：设工作总量为1，甲效率1/10，乙效率1/15，合作效率1/10+1/15=1/6，时间=1÷(1/6)=6天。",
			PracticedAt:     time.Now().AddDate(0, 0, -2),
		},
	}

	if limit > 0 && len(mistakes) > limit {
		mistakes = mistakes[:limit]
	}

	return mistakes, nil
}
