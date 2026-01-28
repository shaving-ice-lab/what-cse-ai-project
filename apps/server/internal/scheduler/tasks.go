package scheduler

import (
	"encoding/json"

	"github.com/hibiken/asynq"
)

// Task type constants
const (
	TypeListMonitor       = "crawler:list_monitor"
	TypeListDiscovery     = "crawler:list_discovery"
	TypeAnnouncementCrawl = "crawler:announcement"
	TypePositionExtract   = "crawler:positions"
	TypeScheduledMonitor  = "crawler:scheduled_monitor"

	// Notification reminder task types
	TypeCalendarReminder     = "reminder:calendar"     // 日历事件提醒
	TypeRegistrationReminder = "reminder:registration" // 报名截止提醒
	TypeAnnouncementPush     = "reminder:announcement" // 新公告推送
	TypeSubscriptionPush     = "reminder:subscription" // 订阅内容推送
	TypeDailyReminderCheck   = "reminder:daily_check"  // 每日提醒检查任务
)

// ListMonitorPayload holds the payload for list monitor task
type ListMonitorPayload struct {
	ListPageIDs []uint `json:"list_page_ids,omitempty"`
}

// NewListMonitorTask creates a new list monitor task
func NewListMonitorTask(listPageIDs []uint) (*asynq.Task, error) {
	payload, err := json.Marshal(ListMonitorPayload{ListPageIDs: listPageIDs})
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeListMonitor, payload), nil
}

// ListDiscoveryPayload holds the payload for list discovery task
type ListDiscoveryPayload struct {
	AggregatorURLs []string `json:"aggregator_urls"`
}

// NewListDiscoveryTask creates a new list discovery task
func NewListDiscoveryTask(urls []string) (*asynq.Task, error) {
	payload, err := json.Marshal(ListDiscoveryPayload{AggregatorURLs: urls})
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeListDiscovery, payload), nil
}

// AnnouncementCrawlPayload holds the payload for announcement crawl task
type AnnouncementCrawlPayload struct {
	URL          string `json:"url"`
	Title        string `json:"title"`
	SourceListID uint   `json:"source_list_id"`
	SourceName   string `json:"source_name"`
	Category     string `json:"category,omitempty"`
}

// NewAnnouncementCrawlTask creates a new announcement crawl task
func NewAnnouncementCrawlTask(payload *AnnouncementCrawlPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeAnnouncementCrawl, data), nil
}

// PositionExtractPayload holds the payload for position extract task
type PositionExtractPayload struct {
	AnnouncementID uint `json:"announcement_id"`
}

// NewPositionExtractTask creates a new position extract task
func NewPositionExtractTask(announcementID uint) (*asynq.Task, error) {
	payload, err := json.Marshal(PositionExtractPayload{AnnouncementID: announcementID})
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypePositionExtract, payload), nil
}

// ScheduledMonitorPayload holds the payload for scheduled monitor task
type ScheduledMonitorPayload struct {
	Frequency string `json:"frequency"` // hourly, daily, weekly
}

// NewScheduledMonitorTask creates a new scheduled monitor task
func NewScheduledMonitorTask(frequency string) (*asynq.Task, error) {
	payload, err := json.Marshal(ScheduledMonitorPayload{Frequency: frequency})
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeScheduledMonitor, payload), nil
}

// ParseListMonitorPayload parses the list monitor task payload
func ParseListMonitorPayload(task *asynq.Task) (*ListMonitorPayload, error) {
	var payload ListMonitorPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// ParseListDiscoveryPayload parses the list discovery task payload
func ParseListDiscoveryPayload(task *asynq.Task) (*ListDiscoveryPayload, error) {
	var payload ListDiscoveryPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// ParseAnnouncementCrawlPayload parses the announcement crawl task payload
func ParseAnnouncementCrawlPayload(task *asynq.Task) (*AnnouncementCrawlPayload, error) {
	var payload AnnouncementCrawlPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// ParsePositionExtractPayload parses the position extract task payload
func ParsePositionExtractPayload(task *asynq.Task) (*PositionExtractPayload, error) {
	var payload PositionExtractPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// ParseScheduledMonitorPayload parses the scheduled monitor task payload
func ParseScheduledMonitorPayload(task *asynq.Task) (*ScheduledMonitorPayload, error) {
	var payload ScheduledMonitorPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// =====================================================
// Notification Reminder Task Payloads
// =====================================================

// CalendarReminderPayload 日历提醒任务载荷
type CalendarReminderPayload struct {
	EventID        uint   `json:"event_id"`
	UserID         uint   `json:"user_id"`
	EventTitle     string `json:"event_title"`
	EventTime      string `json:"event_time"`
	ReminderBefore int    `json:"reminder_before"` // 提前多少分钟提醒
}

// NewCalendarReminderTask 创建日历提醒任务
func NewCalendarReminderTask(payload *CalendarReminderPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeCalendarReminder, data), nil
}

// ParseCalendarReminderPayload 解析日历提醒载荷
func ParseCalendarReminderPayload(task *asynq.Task) (*CalendarReminderPayload, error) {
	var payload CalendarReminderPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// RegistrationReminderPayload 报名截止提醒任务载荷
type RegistrationReminderPayload struct {
	PositionID     string `json:"position_id"`
	UserID         uint   `json:"user_id"`
	PositionName   string `json:"position_name"`
	DeadlineTime   string `json:"deadline_time"`
	ReminderBefore int    `json:"reminder_before"` // 提前多少小时提醒
}

// NewRegistrationReminderTask 创建报名截止提醒任务
func NewRegistrationReminderTask(payload *RegistrationReminderPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeRegistrationReminder, data), nil
}

// ParseRegistrationReminderPayload 解析报名截止提醒载荷
func ParseRegistrationReminderPayload(task *asynq.Task) (*RegistrationReminderPayload, error) {
	var payload RegistrationReminderPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// AnnouncementPushPayload 新公告推送任务载荷
type AnnouncementPushPayload struct {
	AnnouncementID uint   `json:"announcement_id"`
	Title          string `json:"title"`
	ExamType       string `json:"exam_type"`
	Province       string `json:"province"`
}

// NewAnnouncementPushTask 创建新公告推送任务
func NewAnnouncementPushTask(payload *AnnouncementPushPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeAnnouncementPush, data), nil
}

// ParseAnnouncementPushPayload 解析新公告推送载荷
func ParseAnnouncementPushPayload(task *asynq.Task) (*AnnouncementPushPayload, error) {
	var payload AnnouncementPushPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// SubscriptionPushPayload 订阅推送任务载荷
type SubscriptionPushPayload struct {
	SubscriptionID uint     `json:"subscription_id"`
	UserID         uint     `json:"user_id"`
	PositionIDs    []string `json:"position_ids"`
}

// NewSubscriptionPushTask 创建订阅推送任务
func NewSubscriptionPushTask(payload *SubscriptionPushPayload) (*asynq.Task, error) {
	data, err := json.Marshal(payload)
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeSubscriptionPush, data), nil
}

// ParseSubscriptionPushPayload 解析订阅推送载荷
func ParseSubscriptionPushPayload(task *asynq.Task) (*SubscriptionPushPayload, error) {
	var payload SubscriptionPushPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}

// DailyReminderCheckPayload 每日提醒检查任务载荷
type DailyReminderCheckPayload struct {
	CheckDate string `json:"check_date"` // 检查日期 YYYY-MM-DD
}

// NewDailyReminderCheckTask 创建每日提醒检查任务
func NewDailyReminderCheckTask(checkDate string) (*asynq.Task, error) {
	payload, err := json.Marshal(DailyReminderCheckPayload{CheckDate: checkDate})
	if err != nil {
		return nil, err
	}
	return asynq.NewTask(TypeDailyReminderCheck, payload), nil
}

// ParseDailyReminderCheckPayload 解析每日提醒检查载荷
func ParseDailyReminderCheckPayload(task *asynq.Task) (*DailyReminderCheckPayload, error) {
	var payload DailyReminderCheckPayload
	if err := json.Unmarshal(task.Payload(), &payload); err != nil {
		return nil, err
	}
	return &payload, nil
}
