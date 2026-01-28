package model

import (
	"database/sql/driver"
	"encoding/json"
	"errors"
	"time"

	"gorm.io/gorm"
)

// =====================================================
// 错题本相关枚举和常量
// =====================================================

// WrongQuestionStatus 错题状态
type WrongQuestionStatus string

const (
	WrongQuestionStatusActive   WrongQuestionStatus = "active"   // 待复习
	WrongQuestionStatusMastered WrongQuestionStatus = "mastered" // 已掌握
	WrongQuestionStatusRemoved  WrongQuestionStatus = "removed"  // 已移除
)

// =====================================================
// 错题本表
// =====================================================

// WrongQuestion 错题记录
type WrongQuestion struct {
	ID           uint                `gorm:"primaryKey" json:"id"`
	UserID       uint                `gorm:"index:idx_user_question_wrong;not null" json:"user_id"`
	QuestionID   uint                `gorm:"index:idx_user_question_wrong;not null" json:"question_id"`
	CategoryID   uint                `gorm:"index" json:"category_id,omitempty"`                    // 题目所属分类
	FirstWrongAt time.Time           `gorm:"type:datetime;not null" json:"first_wrong_at"`          // 首次做错时间
	LastWrongAt  time.Time           `gorm:"type:datetime;not null" json:"last_wrong_at"`           // 最近做错时间
	WrongCount   int                 `gorm:"default:1" json:"wrong_count"`                          // 错误次数
	CorrectCount int                 `gorm:"default:0" json:"correct_count"`                        // 做对次数（重做时）
	UserNote     string              `gorm:"type:text" json:"user_note,omitempty"`                  // 用户笔记
	ErrorReason  string              `gorm:"type:varchar(50)" json:"error_reason,omitempty"`        // 错误原因分类
	Status       WrongQuestionStatus `gorm:"type:varchar(20);default:'active';index" json:"status"` // 状态
	LastReviewAt *time.Time          `gorm:"type:datetime" json:"last_review_at,omitempty"`         // 最近复习时间
	ReviewCount  int                 `gorm:"default:0" json:"review_count"`                         // 复习次数
	NextReviewAt *time.Time          `gorm:"type:datetime;index" json:"next_review_at,omitempty"`   // 下次建议复习时间
	CreatedAt    time.Time           `json:"created_at"`
	UpdatedAt    time.Time           `json:"updated_at"`
	DeletedAt    gorm.DeletedAt      `gorm:"index" json:"-"`

	// 关联
	User     *User     `gorm:"foreignKey:UserID" json:"-"`
	Question *Question `gorm:"foreignKey:QuestionID" json:"question,omitempty"`
}

func (WrongQuestion) TableName() string {
	return "what_wrong_questions"
}

// WrongQuestionResponse 错题响应
type WrongQuestionResponse struct {
	ID           uint                   `json:"id"`
	QuestionID   uint                   `json:"question_id"`
	CategoryID   uint                   `json:"category_id,omitempty"`
	FirstWrongAt time.Time              `json:"first_wrong_at"`
	LastWrongAt  time.Time              `json:"last_wrong_at"`
	WrongCount   int                    `json:"wrong_count"`
	CorrectCount int                    `json:"correct_count"`
	UserNote     string                 `json:"user_note,omitempty"`
	ErrorReason  string                 `json:"error_reason,omitempty"`
	Status       WrongQuestionStatus    `json:"status"`
	LastReviewAt *time.Time             `json:"last_review_at,omitempty"`
	ReviewCount  int                    `json:"review_count"`
	NextReviewAt *time.Time             `json:"next_review_at,omitempty"`
	CreatedAt    time.Time              `json:"created_at"`
	Question     *QuestionBriefResponse `json:"question,omitempty"`
	CategoryName string                 `json:"category_name,omitempty"`
}

// ToResponse 转换为响应
func (w *WrongQuestion) ToResponse() *WrongQuestionResponse {
	resp := &WrongQuestionResponse{
		ID:           w.ID,
		QuestionID:   w.QuestionID,
		CategoryID:   w.CategoryID,
		FirstWrongAt: w.FirstWrongAt,
		LastWrongAt:  w.LastWrongAt,
		WrongCount:   w.WrongCount,
		CorrectCount: w.CorrectCount,
		UserNote:     w.UserNote,
		ErrorReason:  w.ErrorReason,
		Status:       w.Status,
		LastReviewAt: w.LastReviewAt,
		ReviewCount:  w.ReviewCount,
		NextReviewAt: w.NextReviewAt,
		CreatedAt:    w.CreatedAt,
	}
	if w.Question != nil {
		resp.Question = w.Question.ToBriefResponse()
		if w.Question.Category != nil {
			resp.CategoryName = w.Question.Category.Name
		}
	}
	return resp
}

// WrongQuestionStats 错题统计
type WrongQuestionStats struct {
	TotalCount       int            `json:"total_count"`        // 总错题数
	ActiveCount      int            `json:"active_count"`       // 待复习数
	MasteredCount    int            `json:"mastered_count"`     // 已掌握数
	TodayNewCount    int            `json:"today_new_count"`    // 今日新增错题
	NeedReviewCount  int            `json:"need_review_count"`  // 需要复习的数量
	CategoryStats    []CategoryStat `json:"category_stats"`     // 分类统计
	ErrorReasonStats []ReasonStat   `json:"error_reason_stats"` // 错误原因统计
}

// CategoryStat 分类统计
type CategoryStat struct {
	CategoryID   uint   `json:"category_id"`
	CategoryName string `json:"category_name"`
	Count        int    `json:"count"`
}

// ReasonStat 错误原因统计
type ReasonStat struct {
	Reason string `json:"reason"`
	Count  int    `json:"count"`
}

// =====================================================
// 笔记相关枚举和常量
// =====================================================

// NoteType 笔记类型
type NoteType string

const (
	NoteTypeCourse    NoteType = "course"    // 课程笔记
	NoteTypeChapter   NoteType = "chapter"   // 章节笔记
	NoteTypeQuestion  NoteType = "question"  // 题目笔记
	NoteTypeKnowledge NoteType = "knowledge" // 知识点笔记
	NoteTypeFree      NoteType = "free"      // 自由笔记
	NoteTypeVideo     NoteType = "video"     // 视频笔记
)

// =====================================================
// 笔记表
// =====================================================

// StudyNote 学习笔记
type StudyNote struct {
	ID        uint            `gorm:"primaryKey" json:"id"`
	UserID    uint            `gorm:"index;not null" json:"user_id"`
	NoteType  NoteType        `gorm:"type:varchar(20);not null;index" json:"note_type"` // 笔记类型
	RelatedID *uint           `gorm:"index" json:"related_id,omitempty"`                // 关联ID（课程/章节/题目/知识点ID）
	Title     string          `gorm:"type:varchar(200);not null" json:"title"`          // 笔记标题
	Content   string          `gorm:"type:mediumtext" json:"content"`                   // 笔记内容（富文本/Markdown）
	Summary   string          `gorm:"type:varchar(500)" json:"summary,omitempty"`       // 摘要
	Tags      JSONStringArray `gorm:"type:json" json:"tags,omitempty"`                  // 标签
	IsPublic  bool            `gorm:"default:false;index" json:"is_public"`             // 是否公开
	LikeCount int             `gorm:"default:0" json:"like_count"`                      // 点赞数
	ViewCount int             `gorm:"default:0" json:"view_count"`                      // 浏览数
	VideoTime *int            `gorm:"" json:"video_time,omitempty"`                     // 视频时间点（秒），用于视频笔记
	SortOrder int             `gorm:"default:0" json:"sort_order"`                      // 排序
	CreatedAt time.Time       `json:"created_at"`
	UpdatedAt time.Time       `json:"updated_at"`
	DeletedAt gorm.DeletedAt  `gorm:"index" json:"-"`

	// 关联
	User *User `gorm:"foreignKey:UserID" json:"user,omitempty"`
}

func (StudyNote) TableName() string {
	return "what_study_notes"
}

// StudyNoteResponse 笔记响应
type StudyNoteResponse struct {
	ID          uint        `json:"id"`
	UserID      uint        `json:"user_id"`
	NoteType    NoteType    `json:"note_type"`
	RelatedID   *uint       `json:"related_id,omitempty"`
	Title       string      `json:"title"`
	Content     string      `json:"content"`
	Summary     string      `json:"summary,omitempty"`
	Tags        []string    `json:"tags,omitempty"`
	IsPublic    bool        `json:"is_public"`
	LikeCount   int         `json:"like_count"`
	ViewCount   int         `json:"view_count"`
	VideoTime   *int        `json:"video_time,omitempty"`
	CreatedAt   time.Time   `json:"created_at"`
	UpdatedAt   time.Time   `json:"updated_at"`
	Author      *NoteAuthor `json:"author,omitempty"`
	IsLiked     bool        `json:"is_liked"`               // 当前用户是否已点赞
	IsOwner     bool        `json:"is_owner"`               // 是否为笔记所有者
	RelatedName string      `json:"related_name,omitempty"` // 关联对象名称
}

// NoteAuthor 笔记作者信息
type NoteAuthor struct {
	ID       uint   `json:"id"`
	Nickname string `json:"nickname"`
	Avatar   string `json:"avatar,omitempty"`
}

// ToResponse 转换为响应
func (n *StudyNote) ToResponse(isLiked, isOwner bool) *StudyNoteResponse {
	resp := &StudyNoteResponse{
		ID:        n.ID,
		UserID:    n.UserID,
		NoteType:  n.NoteType,
		RelatedID: n.RelatedID,
		Title:     n.Title,
		Content:   n.Content,
		Summary:   n.Summary,
		Tags:      n.Tags,
		IsPublic:  n.IsPublic,
		LikeCount: n.LikeCount,
		ViewCount: n.ViewCount,
		VideoTime: n.VideoTime,
		CreatedAt: n.CreatedAt,
		UpdatedAt: n.UpdatedAt,
		IsLiked:   isLiked,
		IsOwner:   isOwner,
	}
	if n.User != nil {
		resp.Author = &NoteAuthor{
			ID:       n.User.ID,
			Nickname: n.User.Nickname,
			Avatar:   n.User.Avatar,
		}
	}
	return resp
}

// ToBriefResponse 转换为简要响应（列表用）
func (n *StudyNote) ToBriefResponse() *StudyNoteResponse {
	return n.ToResponse(false, false)
}

// StudyNoteBriefResponse 笔记简要响应（列表用）
type StudyNoteBriefResponse struct {
	ID        uint        `json:"id"`
	UserID    uint        `json:"user_id"`
	NoteType  NoteType    `json:"note_type"`
	RelatedID *uint       `json:"related_id,omitempty"`
	Title     string      `json:"title"`
	Summary   string      `json:"summary,omitempty"`
	Tags      []string    `json:"tags,omitempty"`
	IsPublic  bool        `json:"is_public"`
	LikeCount int         `json:"like_count"`
	ViewCount int         `json:"view_count"`
	VideoTime *int        `json:"video_time,omitempty"`
	CreatedAt time.Time   `json:"created_at"`
	Author    *NoteAuthor `json:"author,omitempty"`
}

// =====================================================
// 笔记点赞表
// =====================================================

// NoteLike 笔记点赞
type NoteLike struct {
	ID        uint           `gorm:"primaryKey" json:"id"`
	UserID    uint           `gorm:"uniqueIndex:uk_user_note_like;not null" json:"user_id"`
	NoteID    uint           `gorm:"uniqueIndex:uk_user_note_like;not null" json:"note_id"`
	CreatedAt time.Time      `json:"created_at"`
	DeletedAt gorm.DeletedAt `gorm:"index" json:"-"`
}

func (NoteLike) TableName() string {
	return "what_note_likes"
}

// =====================================================
// 用户笔记统计
// =====================================================

// UserNoteStats 用户笔记统计
type UserNoteStats struct {
	TotalNotes     int `json:"total_notes"`     // 总笔记数
	PublicNotes    int `json:"public_notes"`    // 公开笔记数
	TotalLikes     int `json:"total_likes"`     // 获得的总点赞数
	TotalViews     int `json:"total_views"`     // 获得的总浏览数
	CourseNotes    int `json:"course_notes"`    // 课程笔记数
	QuestionNotes  int `json:"question_notes"`  // 题目笔记数
	KnowledgeNotes int `json:"knowledge_notes"` // 知识点笔记数
	FreeNotes      int `json:"free_notes"`      // 自由笔记数
	VideoNotes     int `json:"video_notes"`     // 视频笔记数
}

// =====================================================
// JSON 辅助类型（如果未定义）
// =====================================================

// ErrorReasons 预定义的错误原因
var ErrorReasons = []string{
	"粗心大意",
	"概念不清",
	"知识遗忘",
	"计算错误",
	"审题不清",
	"方法不当",
	"时间不够",
	"知识盲点",
	"其他",
}

// VideoNoteMarker 视频笔记时间标记
type VideoNoteMarker struct {
	NoteID  uint   `json:"note_id"`
	Time    int    `json:"time"`     // 秒
	TimeStr string `json:"time_str"` // 格式化时间 HH:MM:SS
	Title   string `json:"title"`
}

// =====================================================
// 错题导出相关
// =====================================================

// WrongQuestionExportFormat 导出格式
type WrongQuestionExportFormat string

const (
	ExportFormatJSON WrongQuestionExportFormat = "json"
	ExportFormatCSV  WrongQuestionExportFormat = "csv"
	ExportFormatMD   WrongQuestionExportFormat = "markdown"
	ExportFormatHTML WrongQuestionExportFormat = "html"
)

// WrongQuestionExportRequest 错题导出请求
type WrongQuestionExportRequest struct {
	Format       WrongQuestionExportFormat `json:"format"`                // 导出格式
	CategoryID   uint                      `json:"category_id,omitempty"` // 筛选分类
	Status       string                    `json:"status,omitempty"`      // 筛选状态
	IncludeNote  bool                      `json:"include_note"`          // 是否包含笔记
	IncludeStats bool                      `json:"include_stats"`         // 是否包含统计
	StartDate    string                    `json:"start_date,omitempty"`  // 开始日期
	EndDate      string                    `json:"end_date,omitempty"`    // 结束日期
	IDs          []uint                    `json:"ids,omitempty"`         // 指定错题ID列表
}

// WrongQuestionExportItem 导出的单个错题项
type WrongQuestionExportItem struct {
	QuestionID   uint   `json:"question_id"`
	CategoryName string `json:"category_name"`
	Content      string `json:"content"`
	Options      string `json:"options,omitempty"`
	Answer       string `json:"answer"`
	Analysis     string `json:"analysis,omitempty"`
	WrongCount   int    `json:"wrong_count"`
	CorrectCount int    `json:"correct_count"`
	UserNote     string `json:"user_note,omitempty"`
	ErrorReason  string `json:"error_reason,omitempty"`
	FirstWrongAt string `json:"first_wrong_at"`
	LastWrongAt  string `json:"last_wrong_at"`
	Difficulty   int    `json:"difficulty"`
	QuestionType string `json:"question_type"`
}

// WrongQuestionExportData 导出数据
type WrongQuestionExportData struct {
	ExportTime string                    `json:"export_time"`
	TotalCount int                       `json:"total_count"`
	UserStats  *WrongQuestionStats       `json:"user_stats,omitempty"`
	Items      []WrongQuestionExportItem `json:"items"`
}

// VideoNoteMarkers 视频笔记标记列表
type VideoNoteMarkers []VideoNoteMarker

// Value 实现 driver.Valuer 接口
func (v VideoNoteMarkers) Value() (driver.Value, error) {
	if v == nil {
		return "[]", nil
	}
	return json.Marshal(v)
}

// Scan 实现 sql.Scanner 接口
func (v *VideoNoteMarkers) Scan(value interface{}) error {
	if value == nil {
		*v = []VideoNoteMarker{}
		return nil
	}

	var bytes []byte
	switch val := value.(type) {
	case []byte:
		bytes = val
	case string:
		bytes = []byte(val)
	default:
		return errors.New("invalid type for VideoNoteMarkers")
	}

	return json.Unmarshal(bytes, v)
}
