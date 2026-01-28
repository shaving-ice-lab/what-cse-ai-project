package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"
)

// =====================================================
// 学习统计相关模型
// =====================================================

// UserDailyLearningStats 用户每日学习统计
type UserDailyLearningStats struct {
	ID               uint           `gorm:"primaryKey" json:"id"`
	UserID           uint           `gorm:"uniqueIndex:uk_user_date;not null" json:"user_id"`
	Date             time.Time      `gorm:"uniqueIndex:uk_user_date;type:date;not null" json:"date"`
	TotalMinutes     int            `gorm:"default:0" json:"total_minutes"`           // 总学习时长（分钟）
	CourseMinutes    int            `gorm:"default:0" json:"course_minutes"`          // 课程学习时长
	QuestionMinutes  int            `gorm:"default:0" json:"question_minutes"`        // 做题时长
	QuestionCount    int            `gorm:"default:0" json:"question_count"`          // 做题数量
	CorrectCount     int            `gorm:"default:0" json:"correct_count"`           // 正确数量
	WrongCount       int            `gorm:"default:0" json:"wrong_count"`             // 错误数量
	CourseCompleted  int            `gorm:"default:0" json:"course_completed"`        // 完成课程数
	ChapterCompleted int            `gorm:"default:0" json:"chapter_completed"`       // 完成章节数
	SubjectStats     JSONSubjectMap `gorm:"type:json" json:"subject_stats,omitempty"` // 按科目统计
	CreatedAt        time.Time      `json:"created_at"`
	UpdatedAt        time.Time      `json:"updated_at"`

	// 关联
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

func (UserDailyLearningStats) TableName() string {
	return "what_user_daily_learning_stats"
}

// SubjectLearningStats 科目学习统计
type SubjectLearningStats struct {
	Subject         string  `json:"subject"`          // 科目（xingce/shenlun/mianshi/gongji）
	Minutes         int     `json:"minutes"`          // 学习时长
	QuestionCount   int     `json:"question_count"`   // 做题数
	CorrectCount    int     `json:"correct_count"`    // 正确数
	CorrectRate     float64 `json:"correct_rate"`     // 正确率
	CourseCompleted int     `json:"course_completed"` // 完成课程数
}

// JSONSubjectMap JSON科目统计映射
type JSONSubjectMap map[string]SubjectLearningStats

// Value 实现 driver.Valuer 接口
func (j JSONSubjectMap) Value() (driver.Value, error) {
	if j == nil {
		return "{}", nil
	}
	return statsJSONMarshal(j)
}

// Scan 实现 sql.Scanner 接口
func (j *JSONSubjectMap) Scan(value interface{}) error {
	if value == nil {
		*j = make(JSONSubjectMap)
		return nil
	}
	return statsJSONUnmarshal(value, j)
}

// =====================================================
// 用户学习目标
// =====================================================

// UserLearningGoal 用户学习目标
type UserLearningGoal struct {
	ID                uint       `gorm:"primaryKey" json:"id"`
	UserID            uint       `gorm:"uniqueIndex;not null" json:"user_id"`
	DailyMinutes      int        `gorm:"default:60" json:"daily_minutes"`                 // 每日目标学习时长
	DailyQuestions    int        `gorm:"default:50" json:"daily_questions"`               // 每日目标做题数
	WeeklyCourseDays  int        `gorm:"default:5" json:"weekly_course_days"`             // 每周目标学习天数
	TargetExamDate    *time.Time `gorm:"type:date" json:"target_exam_date"`               // 目标考试日期
	TargetScore       float64    `gorm:"type:decimal(5,2);default:0" json:"target_score"` // 目标分数
	ConsecutiveDays   int        `gorm:"default:0" json:"consecutive_days"`               // 连续打卡天数
	TotalLearningDays int        `gorm:"default:0" json:"total_learning_days"`            // 总学习天数
	LongestStreak     int        `gorm:"default:0" json:"longest_streak"`                 // 最长连续天数
	LastCheckInDate   *time.Time `gorm:"type:date" json:"last_check_in_date"`             // 上次打卡日期
	CreatedAt         time.Time  `json:"created_at"`
	UpdatedAt         time.Time  `json:"updated_at"`

	// 关联
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

func (UserLearningGoal) TableName() string {
	return "what_user_learning_goals"
}

// =====================================================
// 学习成就
// =====================================================

// LearningAchievementType 成就类型
type LearningAchievementType string

const (
	AchievementConsecutiveDays LearningAchievementType = "consecutive_days" // 连续学习
	AchievementTotalQuestions  LearningAchievementType = "total_questions"  // 总做题数
	AchievementCorrectStreak   LearningAchievementType = "correct_streak"   // 连续正确
	AchievementCourseCompleted LearningAchievementType = "course_completed" // 完成课程
	AchievementDailyGoal       LearningAchievementType = "daily_goal"       // 完成每日目标
	AchievementHighScore       LearningAchievementType = "high_score"       // 模考高分
	AchievementSpeedRecord     LearningAchievementType = "speed_record"     // 做题速度记录
	AchievementSubjectMaster   LearningAchievementType = "subject_master"   // 某科目达人
)

// UserLearningAchievement 用户学习成就
type UserLearningAchievement struct {
	ID              uint                    `gorm:"primaryKey" json:"id"`
	UserID          uint                    `gorm:"index;not null" json:"user_id"`
	AchievementType LearningAchievementType `gorm:"type:varchar(50);not null;index" json:"achievement_type"`
	AchievementID   string                  `gorm:"type:varchar(100);not null" json:"achievement_id"` // 具体成就ID
	Title           string                  `gorm:"type:varchar(100);not null" json:"title"`
	Description     string                  `gorm:"type:varchar(500)" json:"description,omitempty"`
	Icon            string                  `gorm:"type:varchar(200)" json:"icon,omitempty"`
	Value           int                     `gorm:"default:0" json:"value"` // 成就数值（如连续天数、题数等）
	UnlockedAt      time.Time               `gorm:"type:datetime;not null" json:"unlocked_at"`
	CreatedAt       time.Time               `json:"created_at"`

	// 关联
	User *User `gorm:"foreignKey:UserID" json:"-"`
}

func (UserLearningAchievement) TableName() string {
	return "what_user_learning_achievements"
}

// =====================================================
// 学习排行榜
// =====================================================

// LeaderboardType 排行榜类型
type LeaderboardType string

const (
	LeaderboardDaily   LeaderboardType = "daily"    // 今日排行
	LeaderboardWeekly  LeaderboardType = "weekly"   // 本周排行
	LeaderboardMonthly LeaderboardType = "monthly"  // 本月排行
	LeaderboardAllTime LeaderboardType = "all_time" // 总排行
)

// LeaderboardMetric 排行榜指标
type LeaderboardMetric string

const (
	MetricStudyTime     LeaderboardMetric = "study_time"     // 学习时长
	MetricQuestionCount LeaderboardMetric = "question_count" // 做题数量
	MetricConsecutive   LeaderboardMetric = "consecutive"    // 连续打卡
	MetricMockScore     LeaderboardMetric = "mock_score"     // 模考分数
	MetricCorrectRate   LeaderboardMetric = "correct_rate"   // 正确率
)

// LearningLeaderboard 学习排行榜缓存表
type LearningLeaderboard struct {
	ID              uint                `gorm:"primaryKey" json:"id"`
	LeaderboardType LeaderboardType     `gorm:"type:varchar(20);not null;uniqueIndex:uk_type_metric_date" json:"leaderboard_type"`
	Metric          LeaderboardMetric   `gorm:"type:varchar(30);not null;uniqueIndex:uk_type_metric_date" json:"metric"`
	Date            time.Time           `gorm:"type:date;not null;uniqueIndex:uk_type_metric_date" json:"date"` // 统计日期
	Data            JSONLeaderboardData `gorm:"type:json" json:"data"`                                          // 排行榜数据
	CreatedAt       time.Time           `json:"created_at"`
	UpdatedAt       time.Time           `json:"updated_at"`
}

func (LearningLeaderboard) TableName() string {
	return "what_learning_leaderboards"
}

// LeaderboardEntry 排行榜条目
type LeaderboardEntry struct {
	Rank      int     `json:"rank"`
	UserID    uint    `json:"user_id"`
	Username  string  `json:"username,omitempty"`
	Avatar    string  `json:"avatar,omitempty"`
	Value     float64 `json:"value"`      // 具体数值
	ValueUnit string  `json:"value_unit"` // 单位（如"分钟"、"题"）
	Change    int     `json:"change"`     // 排名变化（正数上升，负数下降）
}

// JSONLeaderboardData JSON排行榜数据
type JSONLeaderboardData []LeaderboardEntry

// Value 实现 driver.Valuer 接口
func (j JSONLeaderboardData) Value() (driver.Value, error) {
	if j == nil {
		return "[]", nil
	}
	return statsJSONMarshal(j)
}

// Scan 实现 sql.Scanner 接口
func (j *JSONLeaderboardData) Scan(value interface{}) error {
	if value == nil {
		*j = []LeaderboardEntry{}
		return nil
	}
	return statsJSONUnmarshal(value, j)
}

// =====================================================
// 响应结构体
// =====================================================

// DailyLearningReportResponse 每日学习报告响应
type DailyLearningReportResponse struct {
	Date                    string                    `json:"date"`
	Overview                DailyOverview             `json:"overview"`
	SubjectBreakdown        []SubjectLearningStats    `json:"subject_breakdown"`
	HourlyDistribution      []HourlyLearning          `json:"hourly_distribution,omitempty"`
	ComparisonWithYesterday *LearningComparison       `json:"comparison_with_yesterday,omitempty"`
	ComparisonWithGoal      *GoalComparison           `json:"comparison_with_goal,omitempty"`
	Achievements            []UserLearningAchievement `json:"achievements,omitempty"`
}

// DailyOverview 每日概览
type DailyOverview struct {
	TotalMinutes     int     `json:"total_minutes"`
	QuestionCount    int     `json:"question_count"`
	CorrectRate      float64 `json:"correct_rate"`
	CourseCompleted  int     `json:"course_completed"`
	ChapterCompleted int     `json:"chapter_completed"`
}

// HourlyLearning 每小时学习分布
type HourlyLearning struct {
	Hour    int `json:"hour"`
	Minutes int `json:"minutes"`
}

// LearningComparison 学习对比
type LearningComparison struct {
	TotalMinutesChange  int     `json:"total_minutes_change"`  // 学习时长变化
	QuestionCountChange int     `json:"question_count_change"` // 做题数变化
	CorrectRateChange   float64 `json:"correct_rate_change"`   // 正确率变化
}

// GoalComparison 目标对比
type GoalComparison struct {
	MinutesGoal      int     `json:"minutes_goal"`
	MinutesActual    int     `json:"minutes_actual"`
	MinutesPercent   float64 `json:"minutes_percent"`
	QuestionsGoal    int     `json:"questions_goal"`
	QuestionsActual  int     `json:"questions_actual"`
	QuestionsPercent float64 `json:"questions_percent"`
	IsGoalAchieved   bool    `json:"is_goal_achieved"`
}

// WeeklyLearningReportResponse 每周学习报告响应
type WeeklyLearningReportResponse struct {
	WeekStart        string                 `json:"week_start"`
	WeekEnd          string                 `json:"week_end"`
	Overview         WeeklyOverview         `json:"overview"`
	DailyTrend       []DailyTrendItem       `json:"daily_trend"`
	SubjectBreakdown []SubjectLearningStats `json:"subject_breakdown"`
	KnowledgePoints  KnowledgeAnalysis      `json:"knowledge_points"`
	Achievements     []AchievementSummary   `json:"achievements,omitempty"`
	ConsecutiveDays  int                    `json:"consecutive_days"`
}

// WeeklyOverview 每周概览
type WeeklyOverview struct {
	TotalMinutes    int     `json:"total_minutes"`
	TotalQuestions  int     `json:"total_questions"`
	AvgDailyMinutes int     `json:"avg_daily_minutes"`
	AvgCorrectRate  float64 `json:"avg_correct_rate"`
	LearningDays    int     `json:"learning_days"`
	CourseCompleted int     `json:"course_completed"`
}

// DailyTrendItem 每日趋势项
type DailyTrendItem struct {
	Date           string  `json:"date"`
	DayOfWeek      string  `json:"day_of_week"`
	Minutes        int     `json:"minutes"`
	QuestionCount  int     `json:"question_count"`
	CorrectRate    float64 `json:"correct_rate"`
	IsGoalAchieved bool    `json:"is_goal_achieved"`
}

// KnowledgeAnalysis 知识点分析
type KnowledgeAnalysis struct {
	StrongPoints []KnowledgePointStat `json:"strong_points"` // 强项知识点
	WeakPoints   []KnowledgePointStat `json:"weak_points"`   // 薄弱知识点
}

// KnowledgePointStat 知识点统计
type KnowledgePointStat struct {
	ID          uint    `json:"id"`
	Name        string  `json:"name"`
	Subject     string  `json:"subject"`
	CorrectRate float64 `json:"correct_rate"`
	TotalCount  int     `json:"total_count"`
	Trend       string  `json:"trend"` // "up", "down", "stable"
}

// AchievementSummary 成就摘要
type AchievementSummary struct {
	Title       string `json:"title"`
	Description string `json:"description"`
	Icon        string `json:"icon"`
	UnlockedAt  string `json:"unlocked_at"`
}

// AbilityReportResponse 能力分析报告响应
type AbilityReportResponse struct {
	OverallScore      float64            `json:"overall_score"`                 // 综合能力分
	SubjectScores     []SubjectAbility   `json:"subject_scores"`                // 各科目能力
	RadarData         []RadarDataPoint   `json:"radar_data"`                    // 雷达图数据
	KnowledgeMastery  []KnowledgeMastery `json:"knowledge_mastery"`             // 知识点掌握度
	QuestionTypeStats []QuestionTypeStat `json:"question_type_stats"`           // 题型统计
	ProgressCurve     []ProgressPoint    `json:"progress_curve"`                // 进步曲线
	PredictedScore    *PredictedScore    `json:"predicted_score,omitempty"`     // 预测分数
	ComparisonWithAvg *AvgComparison     `json:"comparison_with_avg,omitempty"` // 与平均水平对比
}

// SubjectAbility 科目能力
type SubjectAbility struct {
	Subject        string  `json:"subject"`
	SubjectName    string  `json:"subject_name"`
	Score          float64 `json:"score"`        // 能力分（0-100）
	CorrectRate    float64 `json:"correct_rate"` // 正确率
	TotalQuestions int     `json:"total_questions"`
	Rank           string  `json:"rank"`  // 等级：A/B/C/D/E
	Trend          string  `json:"trend"` // 趋势：up/down/stable
}

// RadarDataPoint 雷达图数据点
type RadarDataPoint struct {
	Dimension string  `json:"dimension"`
	Value     float64 `json:"value"`
	FullMark  float64 `json:"full_mark"`
}

// KnowledgeMastery 知识点掌握度
type KnowledgeMastery struct {
	CategoryID     uint    `json:"category_id"`
	CategoryName   string  `json:"category_name"`
	Subject        string  `json:"subject"`
	MasteryLevel   float64 `json:"mastery_level"` // 0-100
	TotalPoints    int     `json:"total_points"`
	MasteredPoints int     `json:"mastered_points"`
}

// QuestionTypeStat 题型统计
type QuestionTypeStat struct {
	QuestionType string  `json:"question_type"`
	TypeName     string  `json:"type_name"`
	TotalCount   int     `json:"total_count"`
	CorrectCount int     `json:"correct_count"`
	CorrectRate  float64 `json:"correct_rate"`
	AvgTime      int     `json:"avg_time"` // 平均用时（秒）
	IsWeak       bool    `json:"is_weak"`  // 是否为薄弱题型
}

// ProgressPoint 进步曲线点
type ProgressPoint struct {
	Date        string  `json:"date"`
	Score       float64 `json:"score"`        // 能力分
	CorrectRate float64 `json:"correct_rate"` // 正确率
}

// PredictedScore 预测分数
type PredictedScore struct {
	MinScore    float64 `json:"min_score"`
	MaxScore    float64 `json:"max_score"`
	MostLikely  float64 `json:"most_likely"`
	Confidence  float64 `json:"confidence"` // 置信度
	LastUpdated string  `json:"last_updated"`
}

// AvgComparison 与平均水平对比
type AvgComparison struct {
	OverallVsAvg     float64 `json:"overall_vs_avg"`      // 综合能力vs平均
	StudyTimeVsAvg   float64 `json:"study_time_vs_avg"`   // 学习时长vs平均
	CorrectRateVsAvg float64 `json:"correct_rate_vs_avg"` // 正确率vs平均
	Percentile       int     `json:"percentile"`          // 百分位排名
}

// =====================================================
// AI 能力分析相关
// =====================================================

// AIAbilityAnalysis AI能力分析
type AIAbilityAnalysis struct {
	RadarInterpretation *RadarInterpretation `json:"radar_interpretation,omitempty"` // 雷达图解读
	ComparisonAnalysis  *ComparisonAnalysis  `json:"comparison_analysis,omitempty"`  // 对标分析
	ImprovementPlan     *ImprovementPlan     `json:"improvement_plan,omitempty"`     // 提升建议
	GeneratedAt         string               `json:"generated_at,omitempty"`         // 生成时间
}

// RadarInterpretation AI雷达图解读
type RadarInterpretation struct {
	DimensionAnalysis []DimensionAnalysis `json:"dimension_analysis"` // 各维度分析
	StrengthAnalysis  string              `json:"strength_analysis"`  // 优势能力分析
	WeaknessAnalysis  string              `json:"weakness_analysis"`  // 提升空间分析
	OverallSummary    string              `json:"overall_summary"`    // 综合评价
}

// DimensionAnalysis 维度分析
type DimensionAnalysis struct {
	Dimension   string `json:"dimension"`   // 维度名称
	Score       int    `json:"score"`       // 得分
	Level       string `json:"level"`       // 等级：优秀/良好/中等/待提升
	Description string `json:"description"` // 能力描述
	Tips        string `json:"tips"`        // 提升建议
}

// ComparisonAnalysis AI对标分析
type ComparisonAnalysis struct {
	TargetGap     *TargetGapAnalysis  `json:"target_gap,omitempty"`  // 与目标差距
	AverageGap    *AverageGapAnalysis `json:"average_gap,omitempty"` // 与平均水平差距
	TopGap        *TopGapAnalysis     `json:"top_gap,omitempty"`     // 与优秀者差距
	QuantifiedGap string              `json:"quantified_gap"`        // 量化差距描述
	KeyGapAreas   []string            `json:"key_gap_areas"`         // 主要差距领域
}

// TargetGapAnalysis 目标差距分析
type TargetGapAnalysis struct {
	TargetScore    float64      `json:"target_score"`    // 目标分数
	CurrentScore   float64      `json:"current_score"`   // 当前分数
	GapValue       float64      `json:"gap_value"`       // 差距值
	GapDescription string       `json:"gap_description"` // 差距描述
	SubjectGaps    []SubjectGap `json:"subject_gaps"`    // 各科目差距
	EstimatedDays  int          `json:"estimated_days"`  // 预计达标天数
}

// SubjectGap 科目差距
type SubjectGap struct {
	Subject      string  `json:"subject"`
	SubjectName  string  `json:"subject_name"`
	TargetScore  float64 `json:"target_score"`
	CurrentScore float64 `json:"current_score"`
	GapValue     float64 `json:"gap_value"`
	Priority     int     `json:"priority"`   // 优先级 1-5
	Suggestion   string  `json:"suggestion"` // 建议
}

// AverageGapAnalysis 平均水平差距分析
type AverageGapAnalysis struct {
	AverageScore   float64 `json:"average_score"`
	CurrentScore   float64 `json:"current_score"`
	GapValue       float64 `json:"gap_value"`
	PercentileRank int     `json:"percentile_rank"` // 百分位排名
	GapDescription string  `json:"gap_description"`
}

// TopGapAnalysis 优秀者差距分析
type TopGapAnalysis struct {
	TopScore       float64 `json:"top_score"` // 优秀者分数（前10%平均）
	CurrentScore   float64 `json:"current_score"`
	GapValue       float64 `json:"gap_value"`
	GapDescription string  `json:"gap_description"`
}

// ImprovementPlan AI提升建议
type ImprovementPlan struct {
	ShortTermStrategy  *ImprovementStrategy `json:"short_term_strategy"`  // 短期提升策略（1-2周）
	MediumTermStrategy *ImprovementStrategy `json:"medium_term_strategy"` // 中期提升规划（1-2月）
	LongTermStrategy   *ImprovementStrategy `json:"long_term_strategy"`   // 长期提升规划（3-6月）
	FocusAreas         []FocusArea          `json:"focus_areas"`          // 重点突破方向
	WeeklyPlan         []WeeklyPlanItem     `json:"weekly_plan"`          // 周计划建议
	MotivationalTips   []string             `json:"motivational_tips"`    // 激励建议
}

// ImprovementStrategy 提升策略
type ImprovementStrategy struct {
	Period       string   `json:"period"`        // 时间段
	Goals        []string `json:"goals"`         // 目标
	Actions      []string `json:"actions"`       // 行动建议
	ExpectedGain float64  `json:"expected_gain"` // 预期提升分数
}

// FocusArea 重点突破方向
type FocusArea struct {
	Area           string   `json:"area"`            // 领域名称
	Priority       int      `json:"priority"`        // 优先级
	CurrentLevel   string   `json:"current_level"`   // 当前水平
	TargetLevel    string   `json:"target_level"`    // 目标水平
	RecommendTasks []string `json:"recommend_tasks"` // 推荐任务
	EstimatedTime  int      `json:"estimated_time"`  // 预计所需时间（小时）
}

// WeeklyPlanItem 周计划项
type WeeklyPlanItem struct {
	Week            int      `json:"week"`             // 第几周
	Theme           string   `json:"theme"`            // 主题
	MainTasks       []string `json:"main_tasks"`       // 主要任务
	TargetMinutes   int      `json:"target_minutes"`   // 目标学习时长
	TargetQuestions int      `json:"target_questions"` // 目标做题数
}

// AIAbilityReportResponse 增强的能力分析报告响应（包含AI分析）
type AIAbilityReportResponse struct {
	AbilityReportResponse                    // 继承基础能力报告
	AIAnalysis            *AIAbilityAnalysis `json:"ai_analysis,omitempty"` // AI分析内容
}

// LeaderboardResponse 排行榜响应
type LeaderboardResponse struct {
	Type       LeaderboardType    `json:"type"`
	Metric     LeaderboardMetric  `json:"metric"`
	Date       string             `json:"date"`
	Entries    []LeaderboardEntry `json:"entries"`
	MyRank     *LeaderboardEntry  `json:"my_rank,omitempty"`
	TotalUsers int                `json:"total_users"`
}

// =====================================================
// 辅助函数
// =====================================================

// statsJSONMarshal 学习统计JSON序列化
func statsJSONMarshal(v interface{}) (driver.Value, error) {
	return json.Marshal(v)
}

// statsJSONUnmarshal 学习统计JSON反序列化
func statsJSONUnmarshal(value interface{}, target interface{}) error {
	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for JSON field")
	}
	return json.Unmarshal(bytes, target)
}

// =====================================================
// 迁移用
// =====================================================

// LearningStatsTables 返回所有学习统计相关表
func LearningStatsTables() []interface{} {
	return []interface{}{
		&UserDailyLearningStats{},
		&UserLearningGoal{},
		&UserLearningAchievement{},
		&LearningLeaderboard{},
	}
}
