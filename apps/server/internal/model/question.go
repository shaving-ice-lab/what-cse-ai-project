package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// =====================================================
// 题目相关枚举和常量
// =====================================================

// QuestionType 题目类型
type QuestionType string

const (
	QuestionTypeSingleChoice QuestionType = "single_choice" // 单选题
	QuestionTypeMultiChoice  QuestionType = "multi_choice"  // 多选题
	QuestionTypeFillBlank    QuestionType = "fill_blank"    // 填空题
	QuestionTypeEssay        QuestionType = "essay"         // 简答题/申论题
	QuestionTypeMaterial     QuestionType = "material"      // 材料题
	QuestionTypeJudge        QuestionType = "judge"         // 判断题
)

// QuestionSourceType 题目来源类型
type QuestionSourceType string

const (
	QuestionSourceRealExam QuestionSourceType = "real_exam" // 真题
	QuestionSourceMock     QuestionSourceType = "mock"      // 模拟题
	QuestionSourceOriginal QuestionSourceType = "original"  // 原创题
)

// QuestionStatus 题目状态
type QuestionStatus int

const (
	QuestionStatusDraft     QuestionStatus = 0 // 草稿
	QuestionStatusPublished QuestionStatus = 1 // 已发布
	QuestionStatusArchived  QuestionStatus = 2 // 已归档
)

// PaperType 试卷类型
type PaperType string

const (
	PaperTypeRealExam PaperType = "real_exam" // 真题卷
	PaperTypeMock     PaperType = "mock"      // 模拟卷
	PaperTypeDaily    PaperType = "daily"     // 每日练习
	PaperTypeCustom   PaperType = "custom"    // 自定义组卷
)

// PaperStatus 试卷状态
type PaperStatus int

const (
	PaperStatusDraft     PaperStatus = 0 // 草稿
	PaperStatusPublished PaperStatus = 1 // 已发布
	PaperStatusArchived  PaperStatus = 2 // 已归档
)

// PracticeType 练习类型
type PracticeType string

const (
	PracticeTypeRandom    PracticeType = "random"     // 随机练习
	PracticeTypeCategory  PracticeType = "category"   // 分类练习
	PracticeTypePaper     PracticeType = "paper"      // 试卷模式
	PracticeTypeWrongRedo PracticeType = "wrong_redo" // 错题重做
	PracticeTypeDaily     PracticeType = "daily"      // 每日一练
)

// UserPaperStatus 用户试卷状态
type UserPaperStatus string

const (
	UserPaperStatusInProgress UserPaperStatus = "in_progress" // 进行中
	UserPaperStatusSubmitted  UserPaperStatus = "submitted"   // 已提交
	UserPaperStatusScored     UserPaperStatus = "scored"      // 已评分
)

// =====================================================
// 题目表
// =====================================================

// Question 题目
type Question struct {
	ID              uint               `gorm:"primaryKey" json:"id"`
	CategoryID      uint               `gorm:"index;not null" json:"category_id"`                        // 所属分类（关联知识点）
	QuestionType    QuestionType       `gorm:"type:varchar(20);not null;index" json:"question_type"`     // 题型
	Difficulty      int                `gorm:"default:3;index" json:"difficulty"`                        // 难度 1-5
	SourceType      QuestionSourceType `gorm:"type:varchar(20);default:'mock';index" json:"source_type"` // 来源类型
	SourceYear      *int               `gorm:"index" json:"source_year,omitempty"`                       // 来源年份
	SourceRegion    string             `gorm:"type:varchar(50);index" json:"source_region,omitempty"`    // 来源地区
	SourceExam      string             `gorm:"type:varchar(200)" json:"source_exam,omitempty"`           // 来源考试名称
	Content         string             `gorm:"type:mediumtext;not null" json:"content"`                  // 题目内容
	MaterialID      *uint              `gorm:"index" json:"material_id,omitempty"`                       // 关联材料ID
	Options         QuestionOptions    `gorm:"type:json" json:"options,omitempty"`                       // 选项
	Answer          string             `gorm:"type:text" json:"answer"`                                  // 正确答案
	Analysis        string             `gorm:"type:mediumtext" json:"analysis,omitempty"`                // 答案解析
	Tips            string             `gorm:"type:text" json:"tips,omitempty"`                          // 解题技巧
	KnowledgePoints JSONIntArray       `gorm:"type:json" json:"knowledge_points,omitempty"`              // 关联知识点ID
	Tags            JSONStringArray    `gorm:"type:json" json:"tags,omitempty"`                          // 标签（高频/易错/典型等）
	AttemptCount    int                `gorm:"default:0" json:"attempt_count"`                           // 作答次数
	CorrectCount    int                `gorm:"default:0" json:"correct_count"`                           // 正确次数
	CorrectRate     float64            `gorm:"type:decimal(5,2);default:0" json:"correct_rate"`          // 正确率
	AvgTime         int                `gorm:"default:0" json:"avg_time"`                                // 平均用时（秒）
	IsVIP           bool               `gorm:"default:false;index" json:"is_vip"`                        // 是否VIP题目
	Status          QuestionStatus     `gorm:"type:tinyint;default:0;index" json:"status"`               // 状态
	SortOrder       int                `gorm:"default:0" json:"sort_order"`                              // 排序
	CreatedAt       time.Time          `json:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at"`
	DeletedAt       gorm.DeletedAt     `gorm:"index" json:"-"`

	// 关联
	Category *CourseCategory   `gorm:"foreignKey:CategoryID" json:"category,omitempty"`
	Material *QuestionMaterial `gorm:"foreignKey:MaterialID" json:"material,omitempty"`
}

func (Question) TableName() string {
	return "what_questions"
}

// QuestionOption 题目选项
type QuestionOption struct {
	Key     string `json:"key"`     // A, B, C, D...
	Content string `json:"content"` // 选项内容
}

// QuestionOptions 题目选项数组
type QuestionOptions []QuestionOption

// Value 实现 driver.Valuer 接口
func (o QuestionOptions) Value() (driver.Value, error) {
	if o == nil {
		return "[]", nil
	}
	return json.Marshal(o)
}

// Scan 实现 sql.Scanner 接口
func (o *QuestionOptions) Scan(value interface{}) error {
	if value == nil {
		*o = []QuestionOption{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for QuestionOptions")
	}

	return json.Unmarshal(bytes, o)
}

// QuestionBriefResponse 题目简要信息
type QuestionBriefResponse struct {
	ID           uint               `json:"id"`
	CategoryID   uint               `json:"category_id"`
	QuestionType QuestionType       `json:"question_type"`
	Difficulty   int                `json:"difficulty"`
	SourceType   QuestionSourceType `json:"source_type"`
	SourceYear   *int               `json:"source_year,omitempty"`
	SourceRegion string             `json:"source_region,omitempty"`
	Content      string             `json:"content"`
	Options      []QuestionOption   `json:"options,omitempty"`
	Tags         []string           `json:"tags,omitempty"`
	AttemptCount int                `json:"attempt_count"`
	CorrectRate  float64            `json:"correct_rate"`
	IsVIP        bool               `json:"is_vip"`
	Status       QuestionStatus     `json:"status"`
}

// ToBriefResponse 转换为简要响应
func (q *Question) ToBriefResponse() *QuestionBriefResponse {
	return &QuestionBriefResponse{
		ID:           q.ID,
		CategoryID:   q.CategoryID,
		QuestionType: q.QuestionType,
		Difficulty:   q.Difficulty,
		SourceType:   q.SourceType,
		SourceYear:   q.SourceYear,
		SourceRegion: q.SourceRegion,
		Content:      q.Content,
		Options:      q.Options,
		Tags:         q.Tags,
		AttemptCount: q.AttemptCount,
		CorrectRate:  q.CorrectRate,
		IsVIP:        q.IsVIP,
		Status:       q.Status,
	}
}

// QuestionDetailResponse 题目详情响应
type QuestionDetailResponse struct {
	QuestionBriefResponse
	SourceExam      string `json:"source_exam,omitempty"`
	MaterialID      *uint  `json:"material_id,omitempty"`
	Answer          string `json:"answer"`
	Analysis        string `json:"analysis,omitempty"`
	Tips            string `json:"tips,omitempty"`
	KnowledgePoints []int  `json:"knowledge_points,omitempty"`
	AvgTime         int    `json:"avg_time"`
	CategoryName    string `json:"category_name,omitempty"`
	UserAnswer      string `json:"user_answer,omitempty"` // 用户答案（做题时返回）
	IsCorrect       *bool  `json:"is_correct,omitempty"`  // 是否正确
	IsCollected     bool   `json:"is_collected"`          // 是否已收藏
}

// ToDetailResponse 转换为详情响应
func (q *Question) ToDetailResponse() *QuestionDetailResponse {
	resp := &QuestionDetailResponse{
		QuestionBriefResponse: *q.ToBriefResponse(),
		SourceExam:            q.SourceExam,
		MaterialID:            q.MaterialID,
		Answer:                q.Answer,
		Analysis:              q.Analysis,
		Tips:                  q.Tips,
		KnowledgePoints:       q.KnowledgePoints,
		AvgTime:               q.AvgTime,
	}
	if q.Category != nil {
		resp.CategoryName = q.Category.Name
	}
	return resp
}

// =====================================================
// 材料表
// =====================================================

// MaterialContentType 材料内容类型
type MaterialContentType string

const (
	MaterialContentText  MaterialContentType = "text"  // 文本
	MaterialContentTable MaterialContentType = "table" // 表格
	MaterialContentChart MaterialContentType = "chart" // 图表
)

// QuestionMaterial 题目材料
type QuestionMaterial struct {
	ID          uint                `gorm:"primaryKey" json:"id"`
	Title       string              `gorm:"type:varchar(200);not null" json:"title"`
	Content     string              `gorm:"type:mediumtext;not null" json:"content"`
	ContentType MaterialContentType `gorm:"type:varchar(20);default:'text'" json:"content_type"`
	SourceYear  *int                `gorm:"index" json:"source_year,omitempty"`
	SourceExam  string              `gorm:"type:varchar(200)" json:"source_exam,omitempty"`
	CreatedAt   time.Time           `json:"created_at"`
	UpdatedAt   time.Time           `json:"updated_at"`
	DeletedAt   gorm.DeletedAt      `gorm:"index" json:"-"`

	// 关联
	Questions []Question `gorm:"foreignKey:MaterialID" json:"questions,omitempty"`
}

func (QuestionMaterial) TableName() string {
	return "what_question_materials"
}

// QuestionMaterialResponse 材料响应
type QuestionMaterialResponse struct {
	ID          uint                `json:"id"`
	Title       string              `json:"title"`
	Content     string              `json:"content"`
	ContentType MaterialContentType `json:"content_type"`
	SourceYear  *int                `json:"source_year,omitempty"`
	SourceExam  string              `json:"source_exam,omitempty"`
}

// ToResponse 转换为响应
func (m *QuestionMaterial) ToResponse() *QuestionMaterialResponse {
	return &QuestionMaterialResponse{
		ID:          m.ID,
		Title:       m.Title,
		Content:     m.Content,
		ContentType: m.ContentType,
		SourceYear:  m.SourceYear,
		SourceExam:  m.SourceExam,
	}
}

// =====================================================
// 试卷表
// =====================================================

// ExamPaper 试卷
type ExamPaper struct {
	ID             uint           `gorm:"primaryKey" json:"id"`
	Title          string         `gorm:"type:varchar(200);not null" json:"title"`
	PaperType      PaperType      `gorm:"type:varchar(20);not null;index" json:"paper_type"`
	ExamType       string         `gorm:"type:varchar(50);index" json:"exam_type,omitempty"` // 考试类型（国考/省考/事业单位）
	Subject        string         `gorm:"type:varchar(50);index" json:"subject,omitempty"`   // 科目（行测/申论）
	Year           *int           `gorm:"index" json:"year,omitempty"`
	Region         string         `gorm:"type:varchar(50);index" json:"region,omitempty"`
	TotalQuestions int            `gorm:"default:0" json:"total_questions"`
	TotalScore     float64        `gorm:"type:decimal(5,1);default:100" json:"total_score"`
	TimeLimit      int            `gorm:"default:120" json:"time_limit"` // 时间限制（分钟）
	Questions      PaperQuestions `gorm:"type:json" json:"questions"`    // 题目列表
	Sections       PaperSections  `gorm:"type:json" json:"sections"`     // 试卷分区
	IsFree         bool           `gorm:"default:false;index" json:"is_free"`
	AttemptCount   int            `gorm:"default:0" json:"attempt_count"` // 作答人次
	AvgScore       float64        `gorm:"type:decimal(5,1);default:0" json:"avg_score"`
	Status         PaperStatus    `gorm:"type:tinyint;default:0;index" json:"status"`
	SortOrder      int            `gorm:"default:0" json:"sort_order"`
	Description    string         `gorm:"type:text" json:"description,omitempty"`
	CoverImage     string         `gorm:"type:varchar(500)" json:"cover_image,omitempty"`
	CreatedAt      time.Time      `json:"created_at"`
	UpdatedAt      time.Time      `json:"updated_at"`
	DeletedAt      gorm.DeletedAt `gorm:"index" json:"-"`
}

func (ExamPaper) TableName() string {
	return "what_exam_papers"
}

// PaperQuestion 试卷题目
type PaperQuestion struct {
	QuestionID uint    `json:"question_id"`
	Score      float64 `json:"score"`
	Order      int     `json:"order"`
}

// PaperQuestions 试卷题目列表
type PaperQuestions []PaperQuestion

// Value 实现 driver.Valuer 接口
func (p PaperQuestions) Value() (driver.Value, error) {
	if p == nil {
		return "[]", nil
	}
	return json.Marshal(p)
}

// Scan 实现 sql.Scanner 接口
func (p *PaperQuestions) Scan(value interface{}) error {
	if value == nil {
		*p = []PaperQuestion{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for PaperQuestions")
	}

	return json.Unmarshal(bytes, p)
}

// PaperSection 试卷分区
type PaperSection struct {
	Name        string `json:"name"`
	QuestionIDs []uint `json:"question_ids"`
}

// PaperSections 试卷分区列表
type PaperSections []PaperSection

// Value 实现 driver.Valuer 接口
func (p PaperSections) Value() (driver.Value, error) {
	if p == nil {
		return "[]", nil
	}
	return json.Marshal(p)
}

// Scan 实现 sql.Scanner 接口
func (p *PaperSections) Scan(value interface{}) error {
	if value == nil {
		*p = []PaperSection{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for PaperSections")
	}

	return json.Unmarshal(bytes, p)
}

// ExamPaperBriefResponse 试卷简要响应
type ExamPaperBriefResponse struct {
	ID             uint        `json:"id"`
	Title          string      `json:"title"`
	PaperType      PaperType   `json:"paper_type"`
	ExamType       string      `json:"exam_type,omitempty"`
	Subject        string      `json:"subject,omitempty"`
	Year           *int        `json:"year,omitempty"`
	Region         string      `json:"region,omitempty"`
	TotalQuestions int         `json:"total_questions"`
	TotalScore     float64     `json:"total_score"`
	TimeLimit      int         `json:"time_limit"`
	IsFree         bool        `json:"is_free"`
	AttemptCount   int         `json:"attempt_count"`
	AvgScore       float64     `json:"avg_score"`
	Status         PaperStatus `json:"status"`
	CoverImage     string      `json:"cover_image,omitempty"`
	MyScore        *float64    `json:"my_score,omitempty"` // 我的成绩
}

// ToBriefResponse 转换为简要响应
func (p *ExamPaper) ToBriefResponse() *ExamPaperBriefResponse {
	return &ExamPaperBriefResponse{
		ID:             p.ID,
		Title:          p.Title,
		PaperType:      p.PaperType,
		ExamType:       p.ExamType,
		Subject:        p.Subject,
		Year:           p.Year,
		Region:         p.Region,
		TotalQuestions: p.TotalQuestions,
		TotalScore:     p.TotalScore,
		TimeLimit:      p.TimeLimit,
		IsFree:         p.IsFree,
		AttemptCount:   p.AttemptCount,
		AvgScore:       p.AvgScore,
		Status:         p.Status,
		CoverImage:     p.CoverImage,
	}
}

// ExamPaperDetailResponse 试卷详情响应
type ExamPaperDetailResponse struct {
	ExamPaperBriefResponse
	Questions   []PaperQuestion `json:"questions"`
	Sections    []PaperSection  `json:"sections"`
	Description string          `json:"description,omitempty"`
}

// ToDetailResponse 转换为详情响应
func (p *ExamPaper) ToDetailResponse() *ExamPaperDetailResponse {
	return &ExamPaperDetailResponse{
		ExamPaperBriefResponse: *p.ToBriefResponse(),
		Questions:              p.Questions,
		Sections:               p.Sections,
		Description:            p.Description,
	}
}

// =====================================================
// 用户做题记录表
// =====================================================

// UserQuestionRecord 用户做题记录
type UserQuestionRecord struct {
	ID           uint         `gorm:"primaryKey" json:"id"`
	UserID       uint         `gorm:"index:idx_user_question;not null" json:"user_id"`
	QuestionID   uint         `gorm:"index:idx_user_question;not null" json:"question_id"`
	UserAnswer   string       `gorm:"type:text" json:"user_answer"`
	IsCorrect    bool         `gorm:"default:false;index" json:"is_correct"`
	TimeSpent    int          `gorm:"default:0" json:"time_spent"` // 用时（秒）
	PracticeType PracticeType `gorm:"type:varchar(20);index" json:"practice_type"`
	PracticeID   *uint        `gorm:"index" json:"practice_id,omitempty"` // 练习/试卷ID
	CreatedAt    time.Time    `gorm:"index" json:"created_at"`

	// 关联
	User     *User     `gorm:"foreignKey:UserID" json:"-"`
	Question *Question `gorm:"foreignKey:QuestionID" json:"question,omitempty"`
}

func (UserQuestionRecord) TableName() string {
	return "what_user_question_records"
}

// UserQuestionRecordResponse 用户做题记录响应
type UserQuestionRecordResponse struct {
	ID           uint                   `json:"id"`
	QuestionID   uint                   `json:"question_id"`
	UserAnswer   string                 `json:"user_answer"`
	IsCorrect    bool                   `json:"is_correct"`
	TimeSpent    int                    `json:"time_spent"`
	PracticeType PracticeType           `json:"practice_type"`
	CreatedAt    time.Time              `json:"created_at"`
	Question     *QuestionBriefResponse `json:"question,omitempty"`
}

// ToResponse 转换为响应
func (r *UserQuestionRecord) ToResponse() *UserQuestionRecordResponse {
	resp := &UserQuestionRecordResponse{
		ID:           r.ID,
		QuestionID:   r.QuestionID,
		UserAnswer:   r.UserAnswer,
		IsCorrect:    r.IsCorrect,
		TimeSpent:    r.TimeSpent,
		PracticeType: r.PracticeType,
		CreatedAt:    r.CreatedAt,
	}
	if r.Question != nil {
		resp.Question = r.Question.ToBriefResponse()
	}
	return resp
}

// =====================================================
// 用户试卷记录表
// =====================================================

// UserPaperRecord 用户试卷记录
type UserPaperRecord struct {
	ID              uint            `gorm:"primaryKey" json:"id"`
	UserID          uint            `gorm:"index:idx_user_paper;not null" json:"user_id"`
	PaperID         uint            `gorm:"index:idx_user_paper;not null" json:"paper_id"`
	StartTime       time.Time       `gorm:"type:datetime" json:"start_time"`
	EndTime         *time.Time      `gorm:"type:datetime" json:"end_time,omitempty"`
	TimeSpent       int             `gorm:"default:0" json:"time_spent"` // 总用时（秒）
	Score           float64         `gorm:"type:decimal(5,1);default:0" json:"score"`
	CorrectCount    int             `gorm:"default:0" json:"correct_count"`
	WrongCount      int             `gorm:"default:0" json:"wrong_count"`
	UnansweredCount int             `gorm:"default:0" json:"unanswered_count"`
	Answers         PaperAnswers    `gorm:"type:json" json:"answers"` // 答题详情
	Status          UserPaperStatus `gorm:"type:varchar(20);default:'in_progress';index" json:"status"`
	CreatedAt       time.Time       `json:"created_at"`
	UpdatedAt       time.Time       `json:"updated_at"`

	// 关联
	User  *User      `gorm:"foreignKey:UserID" json:"-"`
	Paper *ExamPaper `gorm:"foreignKey:PaperID" json:"paper,omitempty"`
}

func (UserPaperRecord) TableName() string {
	return "what_user_paper_records"
}

// PaperAnswer 试卷答题详情
type PaperAnswer struct {
	QuestionID uint   `json:"question_id"`
	UserAnswer string `json:"user_answer"`
	IsCorrect  bool   `json:"is_correct"`
	TimeSpent  int    `json:"time_spent"` // 单题用时（秒）
}

// PaperAnswers 试卷答题详情列表
type PaperAnswers []PaperAnswer

// Value 实现 driver.Valuer 接口
func (p PaperAnswers) Value() (driver.Value, error) {
	if p == nil {
		return "[]", nil
	}
	return json.Marshal(p)
}

// Scan 实现 sql.Scanner 接口
func (p *PaperAnswers) Scan(value interface{}) error {
	if value == nil {
		*p = []PaperAnswer{}
		return nil
	}

	var bytes []byte
	switch v := value.(type) {
	case []byte:
		bytes = v
	case string:
		bytes = []byte(v)
	default:
		return errors.New("invalid type for PaperAnswers")
	}

	return json.Unmarshal(bytes, p)
}

// UserPaperRecordResponse 用户试卷记录响应
type UserPaperRecordResponse struct {
	ID              uint                    `json:"id"`
	PaperID         uint                    `json:"paper_id"`
	StartTime       time.Time               `json:"start_time"`
	EndTime         *time.Time              `json:"end_time,omitempty"`
	TimeSpent       int                     `json:"time_spent"`
	Score           float64                 `json:"score"`
	CorrectCount    int                     `json:"correct_count"`
	WrongCount      int                     `json:"wrong_count"`
	UnansweredCount int                     `json:"unanswered_count"`
	Status          UserPaperStatus         `json:"status"`
	Paper           *ExamPaperBriefResponse `json:"paper,omitempty"`
}

// ToResponse 转换为响应
func (r *UserPaperRecord) ToResponse() *UserPaperRecordResponse {
	resp := &UserPaperRecordResponse{
		ID:              r.ID,
		PaperID:         r.PaperID,
		StartTime:       r.StartTime,
		EndTime:         r.EndTime,
		TimeSpent:       r.TimeSpent,
		Score:           r.Score,
		CorrectCount:    r.CorrectCount,
		WrongCount:      r.WrongCount,
		UnansweredCount: r.UnansweredCount,
		Status:          r.Status,
	}
	if r.Paper != nil {
		resp.Paper = r.Paper.ToBriefResponse()
	}
	return resp
}

// UserPaperResultResponse 试卷结果响应
type UserPaperResultResponse struct {
	UserPaperRecordResponse
	Answers         []PaperAnswer `json:"answers"`
	TotalQuestions  int           `json:"total_questions"`
	TotalScore      float64       `json:"total_score"`
	ScorePercentage float64       `json:"score_percentage"` // 得分百分比
}

// ToResultResponse 转换为结果响应
func (r *UserPaperRecord) ToResultResponse() *UserPaperResultResponse {
	resp := &UserPaperResultResponse{
		UserPaperRecordResponse: *r.ToResponse(),
		Answers:                 r.Answers,
	}
	if r.Paper != nil {
		resp.TotalQuestions = r.Paper.TotalQuestions
		resp.TotalScore = r.Paper.TotalScore
		if r.Paper.TotalScore > 0 {
			resp.ScorePercentage = r.Score / r.Paper.TotalScore * 100
		}
	}
	return resp
}

// =====================================================
// 用户题目收藏表
// =====================================================

// UserQuestionCollect 用户题目收藏
type UserQuestionCollect struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	UserID     uint      `gorm:"uniqueIndex:uk_user_question_collect;not null" json:"user_id"`
	QuestionID uint      `gorm:"uniqueIndex:uk_user_question_collect;not null" json:"question_id"`
	Note       string    `gorm:"type:text" json:"note,omitempty"` // 笔记
	CreatedAt  time.Time `json:"created_at"`

	// 关联
	User     *User     `gorm:"foreignKey:UserID" json:"-"`
	Question *Question `gorm:"foreignKey:QuestionID" json:"question,omitempty"`
}

func (UserQuestionCollect) TableName() string {
	return "what_user_question_collects"
}

// =====================================================
// 用户学习统计
// =====================================================

// UserQuestionStats 用户做题统计
type UserQuestionStats struct {
	TotalAttempts    int     `json:"total_attempts"`     // 总做题数
	TodayAttempts    int     `json:"today_attempts"`     // 今日做题数
	CorrectCount     int     `json:"correct_count"`      // 正确数
	WrongCount       int     `json:"wrong_count"`        // 错误数
	TotalCorrectRate float64 `json:"total_correct_rate"` // 总正确率
	TodayCorrectRate float64 `json:"today_correct_rate"` // 今日正确率
	ConsecutiveDays  int     `json:"consecutive_days"`   // 连续打卡天数
	TotalStudyTime   int     `json:"total_study_time"`   // 总学习时长（分钟）
}
