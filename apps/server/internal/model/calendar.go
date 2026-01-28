package model

import (
	"time"

	"gorm.io/gorm"
)

// CalendarEventType 日历事件类型
type CalendarEventType string

const (
	CalendarEventAnnouncement      CalendarEventType = "announcement"       // 公告发布
	CalendarEventRegistrationStart CalendarEventType = "registration_start" // 报名开始
	CalendarEventRegistrationEnd   CalendarEventType = "registration_end"   // 报名截止
	CalendarEventPaymentEnd        CalendarEventType = "payment_end"        // 缴费截止
	CalendarEventPrintTicket       CalendarEventType = "print_ticket"       // 准考证打印
	CalendarEventWrittenExam       CalendarEventType = "written_exam"       // 笔试
	CalendarEventWrittenResult     CalendarEventType = "written_result"     // 笔试成绩
	CalendarEventInterview         CalendarEventType = "interview"          // 面试
	CalendarEventFinalResult       CalendarEventType = "final_result"       // 最终结果
	CalendarEventCustom            CalendarEventType = "custom"             // 自定义
)

// CalendarEventTypeList 事件类型列表
var CalendarEventTypeList = []string{
	string(CalendarEventAnnouncement),
	string(CalendarEventRegistrationStart),
	string(CalendarEventRegistrationEnd),
	string(CalendarEventPaymentEnd),
	string(CalendarEventPrintTicket),
	string(CalendarEventWrittenExam),
	string(CalendarEventWrittenResult),
	string(CalendarEventInterview),
	string(CalendarEventFinalResult),
	string(CalendarEventCustom),
}

// CalendarEventStatus 事件状态
type CalendarEventStatus string

const (
	CalendarEventStatusPending   CalendarEventStatus = "pending"   // 待处理
	CalendarEventStatusNotified  CalendarEventStatus = "notified"  // 已提醒
	CalendarEventStatusCompleted CalendarEventStatus = "completed" // 已完成
	CalendarEventStatusCancelled CalendarEventStatus = "cancelled" // 已取消
)

// CalendarEventSource 事件来源
type CalendarEventSource string

const (
	CalendarEventSourceAuto   CalendarEventSource = "auto"   // 自动生成
	CalendarEventSourceManual CalendarEventSource = "manual" // 手动添加
)

// ExamCalendar 报考日历事件
type ExamCalendar struct {
	ID               uint                `gorm:"primaryKey" json:"id"`
	UserID           uint                `gorm:"index;not null" json:"user_id"`
	PositionID       *string             `gorm:"type:varchar(50);index" json:"position_id,omitempty"` // 关联职位ID（可选）
	AnnouncementID   *uint               `gorm:"index" json:"announcement_id,omitempty"`              // 关联公告ID（可选）
	EventType        CalendarEventType   `gorm:"type:varchar(30);index;not null" json:"event_type"`
	EventTitle       string              `gorm:"type:varchar(200);not null" json:"event_title"`
	EventDescription string              `gorm:"type:text" json:"event_description,omitempty"`
	EventDate        time.Time           `gorm:"type:date;index;not null" json:"event_date"`
	EventTime        *string             `gorm:"type:varchar(10)" json:"event_time,omitempty"` // HH:MM 格式
	AllDay           bool                `gorm:"default:true" json:"all_day"`
	ReminderEnabled  bool                `gorm:"default:true" json:"reminder_enabled"`
	ReminderTimes    string              `gorm:"type:varchar(100);default:'[24,2]'" json:"reminder_times"` // JSON数组，提前提醒小时数
	NotifyChannels   string              `gorm:"type:varchar(200);default:'[\"push\"]'" json:"notify_channels"`
	Status           CalendarEventStatus `gorm:"type:varchar(20);default:'pending';index" json:"status"`
	Color            string              `gorm:"type:varchar(20);default:'#3b82f6'" json:"color"` // 事件颜色
	Source           CalendarEventSource `gorm:"type:varchar(20);default:'manual'" json:"source"`
	CreatedAt        time.Time           `json:"created_at"`
	UpdatedAt        time.Time           `json:"updated_at"`
	DeletedAt        gorm.DeletedAt      `gorm:"index" json:"-"`

	// Relations loaded dynamically
	Position     *Position     `gorm:"-" json:"position,omitempty"`
	Announcement *Announcement `gorm:"-" json:"announcement,omitempty"`
}

func (ExamCalendar) TableName() string {
	return "what_exam_calendars"
}

// CalendarEventResponse 日历事件响应
type CalendarEventResponse struct {
	ID               uint                `json:"id"`
	PositionID       *string             `json:"position_id,omitempty"`
	AnnouncementID   *uint               `json:"announcement_id,omitempty"`
	EventType        CalendarEventType   `json:"event_type"`
	EventTypeName    string              `json:"event_type_name"` // 事件类型中文名称
	EventTitle       string              `json:"event_title"`
	EventDescription string              `json:"event_description,omitempty"`
	EventDate        string              `json:"event_date"` // YYYY-MM-DD
	EventTime        *string             `json:"event_time,omitempty"`
	AllDay           bool                `json:"all_day"`
	ReminderEnabled  bool                `json:"reminder_enabled"`
	ReminderTimes    []int               `json:"reminder_times"`
	NotifyChannels   []string            `json:"notify_channels"`
	Status           CalendarEventStatus `json:"status"`
	Color            string              `json:"color"`
	Source           CalendarEventSource `json:"source"`
	DaysRemaining    int                 `json:"days_remaining"` // 距离事件天数
	IsOverdue        bool                `json:"is_overdue"`     // 是否已过期
	Position         interface{}         `json:"position,omitempty"`
	Announcement     interface{}         `json:"announcement,omitempty"`
	CreatedAt        time.Time           `json:"created_at"`
}

// GetEventTypeName 获取事件类型中文名称
func GetEventTypeName(eventType CalendarEventType) string {
	names := map[CalendarEventType]string{
		CalendarEventAnnouncement:      "公告发布",
		CalendarEventRegistrationStart: "报名开始",
		CalendarEventRegistrationEnd:   "报名截止",
		CalendarEventPaymentEnd:        "缴费截止",
		CalendarEventPrintTicket:       "准考证打印",
		CalendarEventWrittenExam:       "笔试",
		CalendarEventWrittenResult:     "笔试成绩公布",
		CalendarEventInterview:         "面试",
		CalendarEventFinalResult:       "最终结果公布",
		CalendarEventCustom:            "自定义",
	}
	if name, ok := names[eventType]; ok {
		return name
	}
	return "未知类型"
}

// GetEventTypeColor 获取事件类型默认颜色
func GetEventTypeColor(eventType CalendarEventType) string {
	colors := map[CalendarEventType]string{
		CalendarEventAnnouncement:      "#8b5cf6", // 紫色 - 公告
		CalendarEventRegistrationStart: "#22c55e", // 绿色 - 报名开始
		CalendarEventRegistrationEnd:   "#ef4444", // 红色 - 报名截止
		CalendarEventPaymentEnd:        "#f97316", // 橙色 - 缴费截止
		CalendarEventPrintTicket:       "#06b6d4", // 青色 - 打印准考证
		CalendarEventWrittenExam:       "#3b82f6", // 蓝色 - 笔试
		CalendarEventWrittenResult:     "#14b8a6", // 蓝绿色 - 笔试成绩
		CalendarEventInterview:         "#ec4899", // 粉色 - 面试
		CalendarEventFinalResult:       "#f59e0b", // 黄色 - 最终结果
		CalendarEventCustom:            "#6b7280", // 灰色 - 自定义
	}
	if color, ok := colors[eventType]; ok {
		return color
	}
	return "#6b7280"
}

// ToResponse converts ExamCalendar to CalendarEventResponse
func (e *ExamCalendar) ToResponse() *CalendarEventResponse {
	// Calculate days remaining
	now := time.Now().Truncate(24 * time.Hour)
	eventDate := e.EventDate.Truncate(24 * time.Hour)
	daysRemaining := int(eventDate.Sub(now).Hours() / 24)
	isOverdue := daysRemaining < 0

	// Parse reminder times
	var reminderTimes []int
	if e.ReminderTimes != "" {
		// Simple parsing for [24, 2] format
		reminderTimes = parseIntArray(e.ReminderTimes)
	}
	if reminderTimes == nil {
		reminderTimes = []int{24, 2}
	}

	// Parse notify channels
	var notifyChannels []string
	if e.NotifyChannels != "" {
		notifyChannels = parseStringArray(e.NotifyChannels)
	}
	if notifyChannels == nil {
		notifyChannels = []string{"push"}
	}

	resp := &CalendarEventResponse{
		ID:               e.ID,
		PositionID:       e.PositionID,
		AnnouncementID:   e.AnnouncementID,
		EventType:        e.EventType,
		EventTypeName:    GetEventTypeName(e.EventType),
		EventTitle:       e.EventTitle,
		EventDescription: e.EventDescription,
		EventDate:        e.EventDate.Format("2006-01-02"),
		EventTime:        e.EventTime,
		AllDay:           e.AllDay,
		ReminderEnabled:  e.ReminderEnabled,
		ReminderTimes:    reminderTimes,
		NotifyChannels:   notifyChannels,
		Status:           e.Status,
		Color:            e.Color,
		Source:           e.Source,
		DaysRemaining:    daysRemaining,
		IsOverdue:        isOverdue,
		CreatedAt:        e.CreatedAt,
	}

	if e.Position != nil {
		resp.Position = e.Position.ToBriefResponse()
	}
	if e.Announcement != nil {
		resp.Announcement = map[string]interface{}{
			"id":    e.Announcement.ID,
			"title": e.Announcement.Title,
		}
	}

	return resp
}

// Helper functions to parse JSON arrays
func parseIntArray(s string) []int {
	// Simple parser for [24, 2] format
	var result []int
	if len(s) < 2 {
		return nil
	}
	// Remove brackets
	s = s[1 : len(s)-1]
	if s == "" {
		return result
	}
	// Split by comma
	start := 0
	for i := 0; i <= len(s); i++ {
		if i == len(s) || s[i] == ',' {
			num := 0
			for j := start; j < i; j++ {
				if s[j] >= '0' && s[j] <= '9' {
					num = num*10 + int(s[j]-'0')
				}
			}
			result = append(result, num)
			start = i + 1
		}
	}
	return result
}

func parseStringArray(s string) []string {
	// Simple parser for ["push", "email"] format
	var result []string
	if len(s) < 2 {
		return nil
	}
	// Remove brackets
	s = s[1 : len(s)-1]
	if s == "" {
		return result
	}
	// Parse quoted strings
	inQuote := false
	start := 0
	for i := 0; i < len(s); i++ {
		if s[i] == '"' {
			if !inQuote {
				start = i + 1
				inQuote = true
			} else {
				result = append(result, s[start:i])
				inQuote = false
			}
		}
	}
	return result
}
