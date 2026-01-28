package service

import (
	"encoding/json"
	"errors"
	"time"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

var (
	ErrCalendarEventNotFound = errors.New("calendar event not found")
	ErrInvalidEventType      = errors.New("invalid event type")
	ErrInvalidEventDate      = errors.New("invalid event date")
	ErrEventAlreadyExists    = errors.New("event already exists for this position")
)

// CalendarService 日历服务
type CalendarService struct {
	calendarRepo     *repository.CalendarRepository
	positionRepo     *repository.PositionRepository
	announcementRepo *repository.AnnouncementRepository
}

// NewCalendarService creates a new calendar service
func NewCalendarService(
	calendarRepo *repository.CalendarRepository,
	positionRepo *repository.PositionRepository,
	announcementRepo *repository.AnnouncementRepository,
) *CalendarService {
	return &CalendarService{
		calendarRepo:     calendarRepo,
		positionRepo:     positionRepo,
		announcementRepo: announcementRepo,
	}
}

// CreateEventRequest 创建事件请求
type CreateEventRequest struct {
	PositionID       *string                 `json:"position_id"`
	AnnouncementID   *uint                   `json:"announcement_id"`
	EventType        model.CalendarEventType `json:"event_type" validate:"required"`
	EventTitle       string                  `json:"event_title" validate:"required"`
	EventDescription string                  `json:"event_description"`
	EventDate        string                  `json:"event_date" validate:"required"` // YYYY-MM-DD
	EventTime        *string                 `json:"event_time"`                     // HH:MM
	AllDay           *bool                   `json:"all_day"`
	ReminderEnabled  *bool                   `json:"reminder_enabled"`
	ReminderTimes    []int                   `json:"reminder_times"`
	NotifyChannels   []string                `json:"notify_channels"`
	Color            string                  `json:"color"`
}

// CreateEvent creates a new calendar event
func (s *CalendarService) CreateEvent(userID uint, req *CreateEventRequest) (*model.ExamCalendar, error) {
	// Validate event type
	validType := false
	for _, t := range model.CalendarEventTypeList {
		if t == string(req.EventType) {
			validType = true
			break
		}
	}
	if !validType {
		return nil, ErrInvalidEventType
	}

	// Parse event date
	eventDate, err := time.Parse("2006-01-02", req.EventDate)
	if err != nil {
		return nil, ErrInvalidEventDate
	}

	// Verify position exists if provided
	if req.PositionID != nil && *req.PositionID != "" {
		_, err := s.positionRepo.FindByPositionID(*req.PositionID)
		if err != nil {
			return nil, ErrPositionNotFound
		}
	}

	// Set defaults
	allDay := true
	if req.AllDay != nil {
		allDay = *req.AllDay
	}

	reminderEnabled := true
	if req.ReminderEnabled != nil {
		reminderEnabled = *req.ReminderEnabled
	}

	reminderTimes := []int{24, 2}
	if len(req.ReminderTimes) > 0 {
		reminderTimes = req.ReminderTimes
	}
	reminderTimesJSON, _ := json.Marshal(reminderTimes)

	notifyChannels := []string{"push"}
	if len(req.NotifyChannels) > 0 {
		notifyChannels = req.NotifyChannels
	}
	notifyChannelsJSON, _ := json.Marshal(notifyChannels)

	color := req.Color
	if color == "" {
		color = model.GetEventTypeColor(req.EventType)
	}

	event := &model.ExamCalendar{
		UserID:           userID,
		PositionID:       req.PositionID,
		AnnouncementID:   req.AnnouncementID,
		EventType:        req.EventType,
		EventTitle:       req.EventTitle,
		EventDescription: req.EventDescription,
		EventDate:        eventDate,
		EventTime:        req.EventTime,
		AllDay:           allDay,
		ReminderEnabled:  reminderEnabled,
		ReminderTimes:    string(reminderTimesJSON),
		NotifyChannels:   string(notifyChannelsJSON),
		Status:           model.CalendarEventStatusPending,
		Color:            color,
		Source:           model.CalendarEventSourceManual,
	}

	if err := s.calendarRepo.Create(event); err != nil {
		return nil, err
	}

	return event, nil
}

// UpdateEventRequest 更新事件请求
type UpdateEventRequest struct {
	EventTitle       *string                    `json:"event_title"`
	EventDescription *string                    `json:"event_description"`
	EventDate        *string                    `json:"event_date"`
	EventTime        *string                    `json:"event_time"`
	AllDay           *bool                      `json:"all_day"`
	ReminderEnabled  *bool                      `json:"reminder_enabled"`
	ReminderTimes    []int                      `json:"reminder_times"`
	NotifyChannels   []string                   `json:"notify_channels"`
	Color            *string                    `json:"color"`
	Status           *model.CalendarEventStatus `json:"status"`
}

// UpdateEvent updates a calendar event
func (s *CalendarService) UpdateEvent(userID, eventID uint, req *UpdateEventRequest) error {
	// Verify event exists
	_, err := s.calendarRepo.GetByID(userID, eventID)
	if err != nil {
		return ErrCalendarEventNotFound
	}

	updates := make(map[string]interface{})

	if req.EventTitle != nil {
		updates["event_title"] = *req.EventTitle
	}
	if req.EventDescription != nil {
		updates["event_description"] = *req.EventDescription
	}
	if req.EventDate != nil {
		eventDate, err := time.Parse("2006-01-02", *req.EventDate)
		if err != nil {
			return ErrInvalidEventDate
		}
		updates["event_date"] = eventDate
	}
	if req.EventTime != nil {
		updates["event_time"] = req.EventTime
	}
	if req.AllDay != nil {
		updates["all_day"] = *req.AllDay
	}
	if req.ReminderEnabled != nil {
		updates["reminder_enabled"] = *req.ReminderEnabled
	}
	if len(req.ReminderTimes) > 0 {
		reminderTimesJSON, _ := json.Marshal(req.ReminderTimes)
		updates["reminder_times"] = string(reminderTimesJSON)
	}
	if len(req.NotifyChannels) > 0 {
		notifyChannelsJSON, _ := json.Marshal(req.NotifyChannels)
		updates["notify_channels"] = string(notifyChannelsJSON)
	}
	if req.Color != nil {
		updates["color"] = *req.Color
	}
	if req.Status != nil {
		updates["status"] = *req.Status
	}

	if len(updates) == 0 {
		return nil
	}

	return s.calendarRepo.Update(userID, eventID, updates)
}

// DeleteEvent deletes a calendar event
func (s *CalendarService) DeleteEvent(userID, eventID uint) error {
	return s.calendarRepo.Delete(userID, eventID)
}

// GetEvent gets a calendar event by ID
func (s *CalendarService) GetEvent(userID, eventID uint) (*model.CalendarEventResponse, error) {
	event, err := s.calendarRepo.GetByID(userID, eventID)
	if err != nil {
		return nil, ErrCalendarEventNotFound
	}
	return event.ToResponse(), nil
}

// CalendarEventsResponse 日历事件列表响应
type CalendarEventsResponse struct {
	Events   []*model.CalendarEventResponse `json:"events"`
	Total    int64                          `json:"total"`
	Page     int                            `json:"page"`
	PageSize int                            `json:"page_size"`
}

// GetEvents gets calendar events with pagination
func (s *CalendarService) GetEvents(userID uint, params *repository.CalendarQueryParams) (*CalendarEventsResponse, error) {
	events, total, err := s.calendarRepo.GetEvents(userID, params)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.CalendarEventResponse, len(events))
	for i, e := range events {
		responses[i] = e.ToResponse()
	}

	return &CalendarEventsResponse{
		Events:   responses,
		Total:    total,
		Page:     params.Page,
		PageSize: params.PageSize,
	}, nil
}

// CalendarMonthResponse 月视图响应
type CalendarMonthResponse struct {
	Year      int                                       `json:"year"`
	Month     int                                       `json:"month"`
	Events    []*model.CalendarEventResponse            `json:"events"`
	EventDays map[string][]*model.CalendarEventResponse `json:"event_days"` // 按日期分组
}

// GetEventsByMonth gets events for a specific month
func (s *CalendarService) GetEventsByMonth(userID uint, year, month int) (*CalendarMonthResponse, error) {
	events, err := s.calendarRepo.GetEventsByMonth(userID, year, month)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.CalendarEventResponse, len(events))
	eventDays := make(map[string][]*model.CalendarEventResponse)

	for i, e := range events {
		resp := e.ToResponse()
		responses[i] = resp
		dateKey := e.EventDate.Format("2006-01-02")
		eventDays[dateKey] = append(eventDays[dateKey], resp)
	}

	return &CalendarMonthResponse{
		Year:      year,
		Month:     month,
		Events:    responses,
		EventDays: eventDays,
	}, nil
}

// UpcomingEventsResponse 即将到来的事件响应
type UpcomingEventsResponse struct {
	Events        []*model.CalendarEventResponse `json:"events"`
	Days          int                            `json:"days"`
	UpcomingCount int                            `json:"upcoming_count"`
}

// GetUpcomingEvents gets upcoming events within specified days
func (s *CalendarService) GetUpcomingEvents(userID uint, days int) (*UpcomingEventsResponse, error) {
	if days <= 0 {
		days = 7
	}
	if days > 90 {
		days = 90
	}

	events, err := s.calendarRepo.GetUpcomingEvents(userID, days)
	if err != nil {
		return nil, err
	}

	responses := make([]*model.CalendarEventResponse, len(events))
	for i, e := range events {
		responses[i] = e.ToResponse()
	}

	return &UpcomingEventsResponse{
		Events:        responses,
		Days:          days,
		UpcomingCount: len(responses),
	}, nil
}

// AutoCreateEventsRequest 自动创建事件请求
type AutoCreateEventsRequest struct {
	PositionID string `json:"position_id" validate:"required"`
}

// AutoCreateEvents automatically creates events from position data
func (s *CalendarService) AutoCreateEvents(userID uint, positionID string) ([]model.ExamCalendar, error) {
	// Get position
	position, err := s.positionRepo.FindByPositionID(positionID)
	if err != nil {
		return nil, ErrPositionNotFound
	}

	var events []model.ExamCalendar
	now := time.Now()

	// Create registration start event
	if position.RegistrationStart != nil && !position.RegistrationStart.IsZero() && position.RegistrationStart.After(now) {
		if !s.calendarRepo.ExistsForPosition(userID, positionID, model.CalendarEventRegistrationStart) {
			events = append(events, model.ExamCalendar{
				UserID:           userID,
				PositionID:       &positionID,
				EventType:        model.CalendarEventRegistrationStart,
				EventTitle:       "报名开始 - " + position.PositionName,
				EventDescription: position.DepartmentName,
				EventDate:        *position.RegistrationStart,
				AllDay:           true,
				ReminderEnabled:  true,
				ReminderTimes:    "[24, 2]",
				NotifyChannels:   "[\"push\"]",
				Status:           model.CalendarEventStatusPending,
				Color:            model.GetEventTypeColor(model.CalendarEventRegistrationStart),
				Source:           model.CalendarEventSourceAuto,
			})
		}
	}

	// Create registration end event
	if position.RegistrationEnd != nil && !position.RegistrationEnd.IsZero() && position.RegistrationEnd.After(now) {
		if !s.calendarRepo.ExistsForPosition(userID, positionID, model.CalendarEventRegistrationEnd) {
			events = append(events, model.ExamCalendar{
				UserID:           userID,
				PositionID:       &positionID,
				EventType:        model.CalendarEventRegistrationEnd,
				EventTitle:       "报名截止 - " + position.PositionName,
				EventDescription: position.DepartmentName + " - 请及时完成报名",
				EventDate:        *position.RegistrationEnd,
				AllDay:           true,
				ReminderEnabled:  true,
				ReminderTimes:    "[72, 24, 2]", // 提前3天、1天、2小时
				NotifyChannels:   "[\"push\"]",
				Status:           model.CalendarEventStatusPending,
				Color:            model.GetEventTypeColor(model.CalendarEventRegistrationEnd),
				Source:           model.CalendarEventSourceAuto,
			})
		}
	}

	// Create exam date event
	if position.ExamDate != nil && !position.ExamDate.IsZero() && position.ExamDate.After(now) {
		if !s.calendarRepo.ExistsForPosition(userID, positionID, model.CalendarEventWrittenExam) {
			events = append(events, model.ExamCalendar{
				UserID:           userID,
				PositionID:       &positionID,
				EventType:        model.CalendarEventWrittenExam,
				EventTitle:       "笔试 - " + position.PositionName,
				EventDescription: position.DepartmentName,
				EventDate:        *position.ExamDate,
				AllDay:           true,
				ReminderEnabled:  true,
				ReminderTimes:    "[168, 72, 24]", // 提前7天、3天、1天
				NotifyChannels:   "[\"push\"]",
				Status:           model.CalendarEventStatusPending,
				Color:            model.GetEventTypeColor(model.CalendarEventWrittenExam),
				Source:           model.CalendarEventSourceAuto,
			})
		}
	}

	// Create interview date event if available
	if position.InterviewDate != nil && !position.InterviewDate.IsZero() && position.InterviewDate.After(now) {
		if !s.calendarRepo.ExistsForPosition(userID, positionID, model.CalendarEventInterview) {
			events = append(events, model.ExamCalendar{
				UserID:           userID,
				PositionID:       &positionID,
				EventType:        model.CalendarEventInterview,
				EventTitle:       "面试 - " + position.PositionName,
				EventDescription: position.DepartmentName,
				EventDate:        *position.InterviewDate,
				AllDay:           true,
				ReminderEnabled:  true,
				ReminderTimes:    "[168, 72, 24]",
				NotifyChannels:   "[\"push\"]",
				Status:           model.CalendarEventStatusPending,
				Color:            model.GetEventTypeColor(model.CalendarEventInterview),
				Source:           model.CalendarEventSourceAuto,
			})
		}
	}

	if len(events) == 0 {
		return events, nil
	}

	// Batch create events
	if err := s.calendarRepo.BatchCreate(events); err != nil {
		return nil, err
	}

	return events, nil
}

// MarkEventCompleted marks an event as completed
func (s *CalendarService) MarkEventCompleted(userID, eventID uint) error {
	return s.calendarRepo.UpdateStatus(userID, eventID, model.CalendarEventStatusCompleted)
}

// MarkEventCancelled marks an event as cancelled
func (s *CalendarService) MarkEventCancelled(userID, eventID uint) error {
	return s.calendarRepo.UpdateStatus(userID, eventID, model.CalendarEventStatusCancelled)
}

// GetEventStats gets statistics of user's calendar events
func (s *CalendarService) GetEventStats(userID uint) (map[string]interface{}, error) {
	return s.calendarRepo.GetEventStats(userID)
}

// DeletePositionEvents deletes all auto-generated events for a position
func (s *CalendarService) DeletePositionEvents(userID uint, positionID string) error {
	return s.calendarRepo.DeleteByPosition(userID, positionID)
}

// SyncFromAnnouncementResponse 从公告同步的响应
type SyncFromAnnouncementResponse struct {
	AnnouncementID    uint                 `json:"announcement_id"`
	AnnouncementTitle string               `json:"announcement_title"`
	PositionsCount    int                  `json:"positions_count"`
	EventsCreated     int                  `json:"events_created"`
	Events            []model.ExamCalendar `json:"events"`
}

// SyncFromAnnouncement 从公告同步日历事件
// 获取公告关联的所有职位，并为每个职位创建相关日历事件
func (s *CalendarService) SyncFromAnnouncement(userID uint, announcementID uint) (*SyncFromAnnouncementResponse, error) {
	// 检查公告仓库是否可用
	if s.announcementRepo == nil {
		return nil, errors.New("announcement repository not configured")
	}

	// 获取公告及关联职位
	announcement, err := s.announcementRepo.FindWithPositions(announcementID)
	if err != nil {
		return nil, errors.New("announcement not found")
	}

	response := &SyncFromAnnouncementResponse{
		AnnouncementID:    announcement.ID,
		AnnouncementTitle: announcement.Title,
		PositionsCount:    len(announcement.Positions),
		EventsCreated:     0,
		Events:            []model.ExamCalendar{},
	}

	if len(announcement.Positions) == 0 {
		return response, nil
	}

	now := time.Now()
	var allEvents []model.ExamCalendar

	// 为每个职位创建日历事件
	for _, position := range announcement.Positions {
		positionID := position.PositionID

		// 创建报名开始事件
		if position.RegistrationStart != nil && !position.RegistrationStart.IsZero() && position.RegistrationStart.After(now) {
			if !s.calendarRepo.ExistsForPosition(userID, positionID, model.CalendarEventRegistrationStart) {
				allEvents = append(allEvents, model.ExamCalendar{
					UserID:           userID,
					PositionID:       &positionID,
					AnnouncementID:   &announcementID,
					EventType:        model.CalendarEventRegistrationStart,
					EventTitle:       "报名开始 - " + position.PositionName,
					EventDescription: position.DepartmentName + " | 来源：" + announcement.Title,
					EventDate:        *position.RegistrationStart,
					AllDay:           true,
					ReminderEnabled:  true,
					ReminderTimes:    "[24, 2]",
					NotifyChannels:   "[\"push\"]",
					Status:           model.CalendarEventStatusPending,
					Color:            model.GetEventTypeColor(model.CalendarEventRegistrationStart),
					Source:           model.CalendarEventSourceAuto,
				})
			}
		}

		// 创建报名截止事件
		if position.RegistrationEnd != nil && !position.RegistrationEnd.IsZero() && position.RegistrationEnd.After(now) {
			if !s.calendarRepo.ExistsForPosition(userID, positionID, model.CalendarEventRegistrationEnd) {
				allEvents = append(allEvents, model.ExamCalendar{
					UserID:           userID,
					PositionID:       &positionID,
					AnnouncementID:   &announcementID,
					EventType:        model.CalendarEventRegistrationEnd,
					EventTitle:       "报名截止 - " + position.PositionName,
					EventDescription: position.DepartmentName + " | 请及时完成报名",
					EventDate:        *position.RegistrationEnd,
					AllDay:           true,
					ReminderEnabled:  true,
					ReminderTimes:    "[72, 24, 2]",
					NotifyChannels:   "[\"push\"]",
					Status:           model.CalendarEventStatusPending,
					Color:            model.GetEventTypeColor(model.CalendarEventRegistrationEnd),
					Source:           model.CalendarEventSourceAuto,
				})
			}
		}

		// 创建笔试事件
		if position.ExamDate != nil && !position.ExamDate.IsZero() && position.ExamDate.After(now) {
			if !s.calendarRepo.ExistsForPosition(userID, positionID, model.CalendarEventWrittenExam) {
				allEvents = append(allEvents, model.ExamCalendar{
					UserID:           userID,
					PositionID:       &positionID,
					AnnouncementID:   &announcementID,
					EventType:        model.CalendarEventWrittenExam,
					EventTitle:       "笔试 - " + position.PositionName,
					EventDescription: position.DepartmentName,
					EventDate:        *position.ExamDate,
					AllDay:           true,
					ReminderEnabled:  true,
					ReminderTimes:    "[168, 72, 24]",
					NotifyChannels:   "[\"push\"]",
					Status:           model.CalendarEventStatusPending,
					Color:            model.GetEventTypeColor(model.CalendarEventWrittenExam),
					Source:           model.CalendarEventSourceAuto,
				})
			}
		}

		// 创建面试事件
		if position.InterviewDate != nil && !position.InterviewDate.IsZero() && position.InterviewDate.After(now) {
			if !s.calendarRepo.ExistsForPosition(userID, positionID, model.CalendarEventInterview) {
				allEvents = append(allEvents, model.ExamCalendar{
					UserID:           userID,
					PositionID:       &positionID,
					AnnouncementID:   &announcementID,
					EventType:        model.CalendarEventInterview,
					EventTitle:       "面试 - " + position.PositionName,
					EventDescription: position.DepartmentName,
					EventDate:        *position.InterviewDate,
					AllDay:           true,
					ReminderEnabled:  true,
					ReminderTimes:    "[168, 72, 24]",
					NotifyChannels:   "[\"push\"]",
					Status:           model.CalendarEventStatusPending,
					Color:            model.GetEventTypeColor(model.CalendarEventInterview),
					Source:           model.CalendarEventSourceAuto,
				})
			}
		}
	}

	// 批量创建事件
	if len(allEvents) > 0 {
		if err := s.calendarRepo.BatchCreate(allEvents); err != nil {
			return nil, err
		}
	}

	response.EventsCreated = len(allEvents)
	response.Events = allEvents

	return response, nil
}
