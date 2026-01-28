package service

import (
	"context"
	"errors"
	"fmt"
	"math"
	"sort"
	"time"
)

var (
	ErrReportNotFound      = errors.New("报告不存在")
	ErrReportDataNotEnough = errors.New("数据不足以生成报告")
)

// =====================================================
// AI 学习报告服务
// =====================================================

// AILearningReportService AI学习报告服务
type AILearningReportService struct {
	// 依赖注入的仓库
}

// NewAILearningReportService 创建AI学习报告服务实例
func NewAILearningReportService() *AILearningReportService {
	return &AILearningReportService{}
}

// =====================================================
// 类型定义
// =====================================================

// DimensionAnalysis 维度分析
type DimensionAnalysis struct {
	Dimension   string  `json:"dimension"`
	Score       float64 `json:"score"`
	FullMark    float64 `json:"full_mark"`
	Level       string  `json:"level"`       // excellent/good/average/weak
	Description string  `json:"description"` // AI 生成的描述
	Tips        string  `json:"tips"`        // 提升建议
}

// AbilityInterpretation AI 能力解读
type AbilityInterpretation struct {
	Summary          string              `json:"summary"`           // 总体评价
	StrengthAreas    []DimensionAnalysis `json:"strength_areas"`    // 优势领域
	WeaknessAreas    []DimensionAnalysis `json:"weakness_areas"`    // 薄弱领域
	ImprovementSpace string              `json:"improvement_space"` // 提升空间分析
	KeyInsights      []string            `json:"key_insights"`      // 关键洞察
}

// TargetComparison 目标对比分析
type TargetComparison struct {
	TargetScore     float64      `json:"target_score"`    // 目标分数
	CurrentScore    float64      `json:"current_score"`   // 当前分数
	Gap             float64      `json:"gap"`             // 差距
	GapPercent      float64      `json:"gap_percent"`     // 差距百分比
	SubjectGaps     []SubjectGap `json:"subject_gaps"`    // 各科目差距
	PredictedDays   int          `json:"predicted_days"`  // 预计需要天数
	AIAnalysis      string       `json:"ai_analysis"`     // AI 分析
	Recommendations []string     `json:"recommendations"` // 建议
}

// SubjectGap 科目差距
type SubjectGap struct {
	Subject      string  `json:"subject"`
	SubjectName  string  `json:"subject_name"`
	CurrentScore float64 `json:"current_score"`
	TargetScore  float64 `json:"target_score"`
	Gap          float64 `json:"gap"`
	Priority     int     `json:"priority"` // 1-5
	Suggestion   string  `json:"suggestion"`
}

// ImprovementStrategy 提升策略
type ImprovementStrategy struct {
	Type        string   `json:"type"` // short_term/long_term
	Title       string   `json:"title"`
	Description string   `json:"description"`
	Duration    string   `json:"duration"` // 时间周期
	Priority    int      `json:"priority"`
	Steps       []string `json:"steps"`    // 具体步骤
	Expected    string   `json:"expected"` // 预期效果
}

// AIEnhancedAbilityReport AI 增强的能力报告
type AIEnhancedAbilityReport struct {
	GeneratedAt           time.Time              `json:"generated_at"`
	Interpretation        *AbilityInterpretation `json:"interpretation"`
	TargetComparison      *TargetComparison      `json:"target_comparison"`
	ImprovementStrategies []ImprovementStrategy  `json:"improvement_strategies"`
	FocusAreas            []string               `json:"focus_areas"`
}

// =====================================================
// AI 能力报告生成
// =====================================================

// GenerateAbilityInterpretation 生成 AI 能力解读
func (s *AILearningReportService) GenerateAbilityInterpretation(ctx context.Context, userID uint, radarData []map[string]interface{}) (*AbilityInterpretation, error) {
	if len(radarData) == 0 {
		return nil, ErrReportDataNotEnough
	}

	// 分析各维度
	var strengths, weaknesses []DimensionAnalysis
	var totalScore float64
	var count int

	for _, data := range radarData {
		dimension, _ := data["dimension"].(string)
		value, _ := data["value"].(float64)
		fullMark, _ := data["full_mark"].(float64)
		if fullMark == 0 {
			fullMark = 100
		}

		percent := value / fullMark * 100
		totalScore += percent
		count++

		level := s.getLevel(percent)
		analysis := DimensionAnalysis{
			Dimension:   dimension,
			Score:       value,
			FullMark:    fullMark,
			Level:       level,
			Description: s.generateDimensionDescription(dimension, percent, level),
			Tips:        s.generateDimensionTips(dimension, level),
		}

		if percent >= 70 {
			strengths = append(strengths, analysis)
		} else if percent < 60 {
			weaknesses = append(weaknesses, analysis)
		}
	}

	avgScore := totalScore / float64(count)

	// 生成总体评价
	summary := s.generateSummary(avgScore, len(strengths), len(weaknesses))

	// 生成关键洞察
	insights := s.generateKeyInsights(strengths, weaknesses)

	// 提升空间分析
	improvementSpace := s.generateImprovementSpace(weaknesses)

	return &AbilityInterpretation{
		Summary:          summary,
		StrengthAreas:    strengths,
		WeaknessAreas:    weaknesses,
		ImprovementSpace: improvementSpace,
		KeyInsights:      insights,
	}, nil
}

// GenerateTargetComparison 生成目标对比分析
func (s *AILearningReportService) GenerateTargetComparison(ctx context.Context, userID uint, currentScore float64, targetScore float64, subjectScores []map[string]interface{}) (*TargetComparison, error) {
	if targetScore <= 0 {
		targetScore = 140 // 默认目标分
	}

	gap := targetScore - currentScore
	gapPercent := gap / targetScore * 100

	// 分析各科目差距
	var subjectGaps []SubjectGap
	for i, subject := range subjectScores {
		subjectName, _ := subject["subject_name"].(string)
		subjectCode, _ := subject["subject"].(string)
		score, _ := subject["score"].(float64)

		// 估算目标分
		subjectTarget := targetScore / float64(len(subjectScores))
		subjectGap := subjectTarget - score

		priority := 3
		if subjectGap > 10 {
			priority = 1
		} else if subjectGap > 5 {
			priority = 2
		}

		subjectGaps = append(subjectGaps, SubjectGap{
			Subject:      subjectCode,
			SubjectName:  subjectName,
			CurrentScore: score,
			TargetScore:  subjectTarget,
			Gap:          subjectGap,
			Priority:     priority,
			Suggestion:   s.generateSubjectSuggestion(subjectName, subjectGap, priority),
		})
		_ = i // avoid unused variable
	}

	// 按优先级排序
	sort.Slice(subjectGaps, func(i, j int) bool {
		return subjectGaps[i].Priority < subjectGaps[j].Priority
	})

	// 预计需要天数
	predictedDays := int(math.Ceil(gap / 0.5)) // 假设每天提升0.5分

	// AI 分析
	aiAnalysis := s.generateGapAnalysis(gap, gapPercent, predictedDays)

	// 建议
	recommendations := s.generateGapRecommendations(subjectGaps)

	return &TargetComparison{
		TargetScore:     targetScore,
		CurrentScore:    currentScore,
		Gap:             gap,
		GapPercent:      math.Round(gapPercent*10) / 10,
		SubjectGaps:     subjectGaps,
		PredictedDays:   predictedDays,
		AIAnalysis:      aiAnalysis,
		Recommendations: recommendations,
	}, nil
}

// GenerateImprovementStrategies 生成提升策略
func (s *AILearningReportService) GenerateImprovementStrategies(ctx context.Context, userID uint, weakAreas []DimensionAnalysis) ([]ImprovementStrategy, error) {
	strategies := []ImprovementStrategy{}

	// 短期策略
	shortTermFocus := []string{}
	for i, area := range weakAreas {
		if i >= 2 {
			break
		}
		shortTermFocus = append(shortTermFocus, area.Dimension)
	}

	if len(shortTermFocus) > 0 {
		strategies = append(strategies, ImprovementStrategy{
			Type:        "short_term",
			Title:       "短期突破计划",
			Description: fmt.Sprintf("集中攻克%v等薄弱环节，快速提升分数", shortTermFocus),
			Duration:    "1-2周",
			Priority:    1,
			Steps: []string{
				fmt.Sprintf("每天专项练习%s相关题目30道", shortTermFocus[0]),
				"观看相关知识点精讲视频",
				"整理错题并分析错因",
				"每2天进行一次专项测试",
			},
			Expected: "预计正确率提升10-15个百分点",
		})
	}

	// 中期策略
	strategies = append(strategies, ImprovementStrategy{
		Type:        "medium_term",
		Title:       "中期巩固计划",
		Description: "系统复习各科目，构建完整知识体系",
		Duration:    "3-4周",
		Priority:    2,
		Steps: []string{
			"按科目制定复习计划",
			"每周完成1-2套模拟试卷",
			"建立知识点关联图",
			"定期复习错题本",
		},
		Expected: "综合能力稳步提升，总分提升15-20分",
	})

	// 长期策略
	strategies = append(strategies, ImprovementStrategy{
		Type:        "long_term",
		Title:       "长期提升规划",
		Description: "培养考试思维和答题技巧，形成稳定发挥能力",
		Duration:    "1-2月",
		Priority:    3,
		Steps: []string{
			"每周保持一定的学习量，形成习惯",
			"多做真题，熟悉考试风格",
			"学习时间管理和答题策略",
			"定期进行全真模拟考试",
		},
		Expected: "具备稳定发挥能力，目标分数达成率90%以上",
	})

	return strategies, nil
}

// =====================================================
// AI 学习周报
// =====================================================

// WeeklyReportData 周报数据
type WeeklyReportData struct {
	WeekStart      time.Time `json:"week_start"`
	WeekEnd        time.Time `json:"week_end"`
	TotalMinutes   int       `json:"total_minutes"`   // 总学习时长
	TotalDays      int       `json:"total_days"`      // 学习天数
	TotalQuestions int       `json:"total_questions"` // 做题数
	CorrectRate    float64   `json:"correct_rate"`    // 平均正确率
	Improvement    float64   `json:"improvement"`     // 相比上周提升
}

// AIWeeklyReport AI 周报
type AIWeeklyReport struct {
	Data                *WeeklyReportData `json:"data"`
	Summary             string            `json:"summary"`               // 本周总结
	Highlights          []string          `json:"highlights"`            // 本周亮点
	Improvements        []string          `json:"improvements"`          // 进步之处
	NeedsAttention      []string          `json:"needs_attention"`       // 需要注意的问题
	NextWeekSuggestions []string          `json:"next_week_suggestions"` // 下周建议
	TimeDistribution    []TimeDistItem    `json:"time_distribution"`     // 时间分布
	ScoreTrend          []DailyScoreItem  `json:"score_trend"`           // 分数趋势
}

// TimeDistItem 时间分布项
type TimeDistItem struct {
	Subject string  `json:"subject"`
	Minutes int     `json:"minutes"`
	Percent float64 `json:"percent"`
}

// DailyScoreItem 每日分数项
type DailyScoreItem struct {
	Date        string  `json:"date"`
	Score       float64 `json:"score"`
	CorrectRate float64 `json:"correct_rate"`
}

// GenerateWeeklyReport 生成 AI 周报
func (s *AILearningReportService) GenerateWeeklyReport(ctx context.Context, userID uint) (*AIWeeklyReport, error) {
	// 模拟数据
	now := time.Now()
	weekStart := now.AddDate(0, 0, -int(now.Weekday()))
	weekEnd := weekStart.AddDate(0, 0, 6)

	data := &WeeklyReportData{
		WeekStart:      weekStart,
		WeekEnd:        weekEnd,
		TotalMinutes:   420,
		TotalDays:      5,
		TotalQuestions: 180,
		CorrectRate:    67.5,
		Improvement:    3.2,
	}

	// 生成总结
	summary := s.generateWeeklySummary(data)

	// 生成亮点
	highlights := []string{
		"本周学习天数达到5天，保持了良好的学习连续性",
		"数量关系正确率提升8%，进步明显",
		"完成了2套完整模拟测试",
	}

	// 进步之处
	improvements := []string{
		"做题速度有所提升，平均每题用时减少10秒",
		"资料分析准确率提升至72%",
		"学习时长比上周增加1.5小时",
	}

	// 需要注意
	needsAttention := []string{
		"言语理解正确率略有下降，需要加强练习",
		"周末学习时间较少，建议合理安排",
		"错题回顾不够及时，建议每日复习",
	}

	// 下周建议
	nextWeekSuggestions := []string{
		"重点突破言语理解中的逻辑填空题型",
		"每天安排30分钟错题复习时间",
		"周末至少安排2小时集中学习",
		"尝试一次完整的限时模拟考试",
	}

	// 时间分布
	timeDistribution := []TimeDistItem{
		{Subject: "行测", Minutes: 180, Percent: 42.9},
		{Subject: "申论", Minutes: 120, Percent: 28.6},
		{Subject: "面试", Minutes: 60, Percent: 14.3},
		{Subject: "公基", Minutes: 60, Percent: 14.2},
	}

	// 分数趋势
	scoreTrend := []DailyScoreItem{
		{Date: weekStart.Format("01-02"), Score: 62, CorrectRate: 64.5},
		{Date: weekStart.AddDate(0, 0, 1).Format("01-02"), Score: 65, CorrectRate: 66.0},
		{Date: weekStart.AddDate(0, 0, 2).Format("01-02"), Score: 63, CorrectRate: 65.5},
		{Date: weekStart.AddDate(0, 0, 3).Format("01-02"), Score: 68, CorrectRate: 69.0},
		{Date: weekStart.AddDate(0, 0, 4).Format("01-02"), Score: 70, CorrectRate: 71.5},
		{Date: weekStart.AddDate(0, 0, 5).Format("01-02"), Score: 69, CorrectRate: 70.0},
		{Date: weekStart.AddDate(0, 0, 6).Format("01-02"), Score: 72, CorrectRate: 72.5},
	}

	return &AIWeeklyReport{
		Data:                data,
		Summary:             summary,
		Highlights:          highlights,
		Improvements:        improvements,
		NeedsAttention:      needsAttention,
		NextWeekSuggestions: nextWeekSuggestions,
		TimeDistribution:    timeDistribution,
		ScoreTrend:          scoreTrend,
	}, nil
}

// =====================================================
// AI 模考分析报告
// =====================================================

// MockExamResult 模考结果
type MockExamResult struct {
	ExamID         uint      `json:"exam_id"`
	ExamName       string    `json:"exam_name"`
	TotalScore     float64   `json:"total_score"`
	TotalQuestions int       `json:"total_questions"`
	CorrectCount   int       `json:"correct_count"`
	WrongCount     int       `json:"wrong_count"`
	SkippedCount   int       `json:"skipped_count"`
	TotalTime      int       `json:"total_time"` // 秒
	ExamDate       time.Time `json:"exam_date"`
}

// QuestionTypeScore 题型得分
type QuestionTypeScore struct {
	TypeName     string  `json:"type_name"`
	TotalCount   int     `json:"total_count"`
	CorrectCount int     `json:"correct_count"`
	Score        float64 `json:"score"`
	FullScore    float64 `json:"full_score"`
	AvgTime      float64 `json:"avg_time"`
	IsWeak       bool    `json:"is_weak"`
}

// KnowledgePointScore 知识点得分
type KnowledgePointScore struct {
	PointName    string  `json:"point_name"`
	TotalCount   int     `json:"total_count"`
	CorrectCount int     `json:"correct_count"`
	CorrectRate  float64 `json:"correct_rate"`
	IsWeak       bool    `json:"is_weak"`
}

// TimeAnalysis 时间分析
type TimeAnalysis struct {
	TotalTime         int            `json:"total_time"`         // 总用时（秒）
	AvgTimePerQ       float64        `json:"avg_time_per_q"`     // 每题平均用时
	RecommendedTime   int            `json:"recommended_time"`   // 建议用时
	OverTimeQuestions int            `json:"overtime_questions"` // 超时题目数
	TimeDistribution  []TimeDistItem `json:"time_distribution"`  // 时间分布
	Suggestion        string         `json:"suggestion"`
}

// AIExamDiagnosis AI 诊断
type AIExamDiagnosis struct {
	OverallAssessment   string   `json:"overall_assessment"`   // 总体评价
	LossReasons         []string `json:"loss_reasons"`         // 失分原因
	StrategySuggestions []string `json:"strategy_suggestions"` // 策略建议
	TimeSuggestions     []string `json:"time_suggestions"`     // 时间管理建议
	PriorityFocus       []string `json:"priority_focus"`       // 重点关注
}

// AIExamImprovement AI 提升方案
type AIExamImprovement struct {
	ImmediateActions []string `json:"immediate_actions"` // 立即行动
	WeeklyPlan       []string `json:"weekly_plan"`       // 周计划
	KeyBreakthroughs []string `json:"key_breakthroughs"` // 重点突破
	MockSuggestion   string   `json:"mock_suggestion"`   // 模拟建议
}

// AIMockExamReport AI 模考分析报告
type AIMockExamReport struct {
	ExamResult      *MockExamResult       `json:"exam_result"`
	TypeScores      []QuestionTypeScore   `json:"type_scores"`
	KnowledgeScores []KnowledgePointScore `json:"knowledge_scores"`
	TimeAnalysis    *TimeAnalysis         `json:"time_analysis"`
	Diagnosis       *AIExamDiagnosis      `json:"diagnosis"`
	ImprovementPlan *AIExamImprovement    `json:"improvement_plan"`
	CompareWithLast *ExamComparison       `json:"compare_with_last"`
}

// ExamComparison 考试对比
type ExamComparison struct {
	ScoreChange       float64 `json:"score_change"`
	CorrectRateChange float64 `json:"correct_rate_change"`
	TimeChange        int     `json:"time_change"`
	Trend             string  `json:"trend"` // improving/declining/stable
	Summary           string  `json:"summary"`
}

// GenerateMockExamReport 生成模考分析报告
func (s *AILearningReportService) GenerateMockExamReport(ctx context.Context, userID uint, examID uint) (*AIMockExamReport, error) {
	// 模拟数据
	examResult := &MockExamResult{
		ExamID:         examID,
		ExamName:       "2024年国考行测模拟卷（一）",
		TotalScore:     68.5,
		TotalQuestions: 135,
		CorrectCount:   92,
		WrongCount:     38,
		SkippedCount:   5,
		TotalTime:      7200,
		ExamDate:       time.Now().AddDate(0, 0, -1),
	}

	// 题型得分
	typeScores := []QuestionTypeScore{
		{TypeName: "常识判断", TotalCount: 20, CorrectCount: 14, Score: 10.5, FullScore: 15, AvgTime: 30, IsWeak: false},
		{TypeName: "言语理解", TotalCount: 40, CorrectCount: 30, Score: 18, FullScore: 24, AvgTime: 50, IsWeak: false},
		{TypeName: "数量关系", TotalCount: 15, CorrectCount: 8, Score: 6.4, FullScore: 12, AvgTime: 120, IsWeak: true},
		{TypeName: "判断推理", TotalCount: 40, CorrectCount: 28, Score: 21, FullScore: 30, AvgTime: 55, IsWeak: false},
		{TypeName: "资料分析", TotalCount: 20, CorrectCount: 12, Score: 12.6, FullScore: 21, AvgTime: 90, IsWeak: true},
	}

	// 知识点得分
	knowledgeScores := []KnowledgePointScore{
		{PointName: "工程问题", TotalCount: 5, CorrectCount: 2, CorrectRate: 40, IsWeak: true},
		{PointName: "增长率计算", TotalCount: 8, CorrectCount: 4, CorrectRate: 50, IsWeak: true},
		{PointName: "比重计算", TotalCount: 6, CorrectCount: 3, CorrectRate: 50, IsWeak: true},
		{PointName: "逻辑填空", TotalCount: 20, CorrectCount: 15, CorrectRate: 75, IsWeak: false},
		{PointName: "图形推理", TotalCount: 10, CorrectCount: 7, CorrectRate: 70, IsWeak: false},
	}

	// 时间分析
	timeAnalysis := &TimeAnalysis{
		TotalTime:         7200,
		AvgTimePerQ:       53.3,
		RecommendedTime:   7200,
		OverTimeQuestions: 12,
		TimeDistribution: []TimeDistItem{
			{Subject: "常识判断", Minutes: 10, Percent: 8.3},
			{Subject: "言语理解", Minutes: 33, Percent: 27.5},
			{Subject: "数量关系", Minutes: 30, Percent: 25.0},
			{Subject: "判断推理", Minutes: 37, Percent: 30.8},
			{Subject: "资料分析", Minutes: 30, Percent: 25.0},
		},
		Suggestion: "数量关系用时过长，建议控制在25分钟以内；资料分析可适当增加时间。",
	}

	// AI 诊断
	diagnosis := &AIExamDiagnosis{
		OverallAssessment: "本次模考总体表现中等偏上，言语理解和判断推理发挥稳定，但数量关系和资料分析是明显的薄弱环节，需要重点突破。",
		LossReasons: []string{
			"数量关系基础不扎实，工程问题等核心题型掌握不牢",
			"资料分析计算速度慢，导致部分题目未完成",
			"部分题目审题不够仔细，存在低级错误",
			"时间分配不够合理，后面题目作答仓促",
		},
		StrategySuggestions: []string{
			"优先提升数量关系和资料分析的正确率",
			"加强基础题型的训练，确保基础分不丢失",
			"培养规范的审题习惯，圈画关键词",
		},
		TimeSuggestions: []string{
			"常识判断控制在10分钟，不要恋战",
			"数量关系严格控制在25分钟，难题果断放弃",
			"资料分析保证30分钟，优先做简单题",
			"最后5分钟用于检查和填涂",
		},
		PriorityFocus: []string{
			"工程问题",
			"增长率计算",
			"比重计算",
		},
	}

	// AI 提升方案
	improvementPlan := &AIExamImprovement{
		ImmediateActions: []string{
			"今天复习本次模考的所有错题",
			"整理数量关系和资料分析的常用公式",
			"观看工程问题专项视频课程",
		},
		WeeklyPlan: []string{
			"每天专项练习数量关系20题",
			"每天专项练习资料分析15题",
			"每2天完成一套专项测试",
			"周末进行一次完整模考",
		},
		KeyBreakthroughs: []string{
			"掌握工程问题的特值法和比例法",
			"熟练运用资料分析的速算技巧",
			"培养合理的时间分配意识",
		},
		MockSuggestion: "建议3天后再进行一次同类型模考，检验学习效果。",
	}

	// 与上次对比
	compareWithLast := &ExamComparison{
		ScoreChange:       3.5,
		CorrectRateChange: 2.8,
		TimeChange:        -180,
		Trend:             "improving",
		Summary:           "相比上次模考，总分提升3.5分，正确率提升2.8%，用时减少3分钟，整体呈上升趋势，继续保持！",
	}

	return &AIMockExamReport{
		ExamResult:      examResult,
		TypeScores:      typeScores,
		KnowledgeScores: knowledgeScores,
		TimeAnalysis:    timeAnalysis,
		Diagnosis:       diagnosis,
		ImprovementPlan: improvementPlan,
		CompareWithLast: compareWithLast,
	}, nil
}

// =====================================================
// 辅助方法
// =====================================================

func (s *AILearningReportService) getLevel(percent float64) string {
	if percent >= 85 {
		return "excellent"
	} else if percent >= 70 {
		return "good"
	} else if percent >= 60 {
		return "average"
	}
	return "weak"
}

func (s *AILearningReportService) generateDimensionDescription(dimension string, percent float64, level string) string {
	levelDesc := map[string]string{
		"excellent": "表现出色，处于优秀水平",
		"good":      "表现良好，掌握较为扎实",
		"average":   "表现一般，还有提升空间",
		"weak":      "相对薄弱，需要重点加强",
	}
	return fmt.Sprintf("%s能力%s，得分率%.1f%%。", dimension, levelDesc[level], percent)
}

func (s *AILearningReportService) generateDimensionTips(dimension string, level string) string {
	if level == "weak" || level == "average" {
		return fmt.Sprintf("建议加强%s相关练习，每天至少完成20道专项题目。", dimension)
	}
	return fmt.Sprintf("继续保持%s的良好状态，可以适当挑战更高难度的题目。", dimension)
}

func (s *AILearningReportService) generateSummary(avgScore float64, strengthCount, weakCount int) string {
	if avgScore >= 75 {
		return fmt.Sprintf("总体能力优秀，平均得分率%.1f%%。有%d个优势领域，建议继续保持并挑战更高目标。", avgScore, strengthCount)
	} else if avgScore >= 60 {
		return fmt.Sprintf("总体能力中等偏上，平均得分率%.1f%%。有%d个优势领域和%d个需要加强的领域，建议重点突破薄弱环节。", avgScore, strengthCount, weakCount)
	}
	return fmt.Sprintf("总体能力有较大提升空间，平均得分率%.1f%%。有%d个薄弱领域需要重点关注，建议制定系统的学习计划。", avgScore, weakCount)
}

func (s *AILearningReportService) generateKeyInsights(strengths, weaknesses []DimensionAnalysis) []string {
	insights := []string{}

	if len(strengths) > 0 {
		areas := []string{}
		for _, s := range strengths {
			areas = append(areas, s.Dimension)
		}
		insights = append(insights, fmt.Sprintf("您的优势领域是%v，这是您的得分保障。", areas))
	}

	if len(weaknesses) > 0 {
		areas := []string{}
		for _, w := range weaknesses {
			areas = append(areas, w.Dimension)
		}
		insights = append(insights, fmt.Sprintf("需要重点提升的领域是%v，这是您的主要提分点。", areas))
	}

	if len(weaknesses) > len(strengths) {
		insights = append(insights, "薄弱领域较多，建议优先集中精力攻克1-2个薄弱点。")
	}

	return insights
}

func (s *AILearningReportService) generateImprovementSpace(weaknesses []DimensionAnalysis) string {
	if len(weaknesses) == 0 {
		return "您目前各项能力均衡发展，可以考虑向更高目标挑战，尝试攻克难题。"
	}

	potentialGain := 0.0
	for _, w := range weaknesses {
		potentialGain += (70 - w.Score/w.FullMark*100) * 0.1
	}

	return fmt.Sprintf("根据分析，如果能将薄弱领域提升至及格水平，预计总分可提升约%.1f分。", potentialGain)
}

func (s *AILearningReportService) generateSubjectSuggestion(subjectName string, gap float64, priority int) string {
	if gap > 10 {
		return fmt.Sprintf("%s差距较大，建议每天专项练习，重点突破。", subjectName)
	} else if gap > 5 {
		return fmt.Sprintf("%s存在一定差距，建议增加练习量。", subjectName)
	}
	return fmt.Sprintf("%s接近目标，保持当前学习节奏即可。", subjectName)
}

func (s *AILearningReportService) generateGapAnalysis(gap, gapPercent float64, days int) string {
	if gap <= 0 {
		return "恭喜！您已经达到目标分数，可以考虑设定更高的目标。"
	} else if gap <= 10 {
		return fmt.Sprintf("距离目标还差%.1f分（%.1f%%），通过约%d天的针对性训练有望达成。", gap, gapPercent, days)
	}
	return fmt.Sprintf("距离目标还有%.1f分的差距（%.1f%%），需要制定系统的学习计划，预计需要%d天左右。", gap, gapPercent, days)
}

func (s *AILearningReportService) generateGapRecommendations(subjectGaps []SubjectGap) []string {
	recommendations := []string{}

	for i, sg := range subjectGaps {
		if i >= 3 {
			break
		}
		if sg.Gap > 0 {
			recommendations = append(recommendations, sg.Suggestion)
		}
	}

	recommendations = append(recommendations, "建议每周进行一次模拟测试，检验学习效果。")

	return recommendations
}

func (s *AILearningReportService) generateWeeklySummary(data *WeeklyReportData) string {
	var trend string
	if data.Improvement > 0 {
		trend = fmt.Sprintf("相比上周提升了%.1f%%", data.Improvement)
	} else if data.Improvement < 0 {
		trend = fmt.Sprintf("相比上周下降了%.1f%%", -data.Improvement)
	} else {
		trend = "与上周持平"
	}

	return fmt.Sprintf("本周您共学习了%d天，总计%.1f小时，完成%d道题目，平均正确率%.1f%%，%s。",
		data.TotalDays, float64(data.TotalMinutes)/60, data.TotalQuestions, data.CorrectRate, trend)
}
