package repository

import (
	"time"

	"github.com/what-cse/server/internal/model"
	"gorm.io/gorm"
)

type CalendarRepository struct {
	db *gorm.DB
}

func NewCalendarRepository(db *gorm.DB) *CalendarRepository {
	return &CalendarRepository{db: db}
}

// CalendarQueryParams 日历查询参数
type CalendarQueryParams struct {
	StartDate  *time.Time                `query:"start_date"`
	EndDate    *time.Time                `query:"end_date"`
	EventType  model.CalendarEventType   `query:"event_type"`
	Status     model.CalendarEventStatus `query:"status"`
	PositionID *string                   `query:"position_id"`
	Page       int                       `query:"page"`
	PageSize   int                       `query:"page_size"`
}

// Create creates a new calendar event
func (r *CalendarRepository) Create(event *model.ExamCalendar) error {
	return r.db.Create(event).Error
}

// GetByID gets a calendar event by ID
func (r *CalendarRepository) GetByID(userID, eventID uint) (*model.ExamCalendar, error) {
	var event model.ExamCalendar
	err := r.db.Where("id = ? AND user_id = ?", eventID, userID).First(&event).Error
	if err != nil {
		return nil, err
	}
	return &event, nil
}

// GetEvents gets calendar events for a user within a date range
func (r *CalendarRepository) GetEvents(userID uint, params *CalendarQueryParams) ([]model.ExamCalendar, int64, error) {
	var events []model.ExamCalendar
	var total int64

	query := r.db.Model(&model.ExamCalendar{}).Where("user_id = ?", userID)

	// Apply date range filter
	if params.StartDate != nil {
		query = query.Where("event_date >= ?", params.StartDate)
	}
	if params.EndDate != nil {
		query = query.Where("event_date <= ?", params.EndDate)
	}

	// Apply other filters
	if params.EventType != "" {
		query = query.Where("event_type = ?", params.EventType)
	}
	if params.Status != "" {
		query = query.Where("status = ?", params.Status)
	}
	if params.PositionID != nil && *params.PositionID != "" {
		query = query.Where("position_id = ?", *params.PositionID)
	}

	// Count total
	query.Count(&total)

	// Pagination
	if params.Page <= 0 {
		params.Page = 1
	}
	if params.PageSize <= 0 || params.PageSize > 100 {
		params.PageSize = 50
	}
	offset := (params.Page - 1) * params.PageSize

	err := query.Order("event_date ASC, created_at ASC").
		Offset(offset).
		Limit(params.PageSize).
		Find(&events).Error

	if err != nil {
		return nil, 0, err
	}

	// Load relations
	if len(events) > 0 {
		r.loadEventRelations(&events)
	}

	return events, total, nil
}

// GetEventsByMonth gets all events for a specific month
func (r *CalendarRepository) GetEventsByMonth(userID uint, year, month int) ([]model.ExamCalendar, error) {
	var events []model.ExamCalendar

	// Calculate month start and end
	startDate := time.Date(year, time.Month(month), 1, 0, 0, 0, 0, time.Local)
	endDate := startDate.AddDate(0, 1, -1) // Last day of the month

	err := r.db.Where("user_id = ? AND event_date >= ? AND event_date <= ?", userID, startDate, endDate).
		Order("event_date ASC").
		Find(&events).Error

	if err != nil {
		return nil, err
	}

	// Load relations
	if len(events) > 0 {
		r.loadEventRelations(&events)
	}

	return events, nil
}

// GetUpcomingEvents gets upcoming events within specified days
func (r *CalendarRepository) GetUpcomingEvents(userID uint, days int) ([]model.ExamCalendar, error) {
	var events []model.ExamCalendar

	now := time.Now().Truncate(24 * time.Hour)
	endDate := now.AddDate(0, 0, days)

	err := r.db.Where("user_id = ? AND event_date >= ? AND event_date <= ? AND status = ?",
		userID, now, endDate, model.CalendarEventStatusPending).
		Order("event_date ASC").
		Find(&events).Error

	if err != nil {
		return nil, err
	}

	// Load relations
	if len(events) > 0 {
		r.loadEventRelations(&events)
	}

	return events, nil
}

// GetEventsForReminder gets events that need reminders
func (r *CalendarRepository) GetEventsForReminder(reminderHours int) ([]model.ExamCalendar, error) {
	var events []model.ExamCalendar

	now := time.Now()
	targetTime := now.Add(time.Duration(reminderHours) * time.Hour)
	targetDate := targetTime.Format("2006-01-02")

	// Find events on the target date that have reminder enabled and not yet notified
	err := r.db.Where("reminder_enabled = ? AND status = ? AND event_date = ?",
		true, model.CalendarEventStatusPending, targetDate).
		Find(&events).Error

	return events, err
}

// Update updates a calendar event
func (r *CalendarRepository) Update(userID, eventID uint, updates map[string]interface{}) error {
	return r.db.Model(&model.ExamCalendar{}).
		Where("id = ? AND user_id = ?", eventID, userID).
		Updates(updates).Error
}

// UpdateStatus updates the status of an event
func (r *CalendarRepository) UpdateStatus(userID, eventID uint, status model.CalendarEventStatus) error {
	return r.db.Model(&model.ExamCalendar{}).
		Where("id = ? AND user_id = ?", eventID, userID).
		Update("status", status).Error
}

// Delete deletes a calendar event
func (r *CalendarRepository) Delete(userID, eventID uint) error {
	return r.db.Where("id = ? AND user_id = ?", eventID, userID).
		Delete(&model.ExamCalendar{}).Error
}

// DeleteByPosition deletes all events related to a position
func (r *CalendarRepository) DeleteByPosition(userID uint, positionID string) error {
	return r.db.Where("user_id = ? AND position_id = ?", userID, positionID).
		Delete(&model.ExamCalendar{}).Error
}

// BatchCreate creates multiple calendar events
func (r *CalendarRepository) BatchCreate(events []model.ExamCalendar) error {
	return r.db.CreateInBatches(events, 100).Error
}

// ExistsForPosition checks if auto-generated events exist for a position
func (r *CalendarRepository) ExistsForPosition(userID uint, positionID string, eventType model.CalendarEventType) bool {
	var count int64
	r.db.Model(&model.ExamCalendar{}).
		Where("user_id = ? AND position_id = ? AND event_type = ? AND source = ?",
			userID, positionID, eventType, model.CalendarEventSourceAuto).
		Count(&count)
	return count > 0
}

// GetEventCount gets total event count for a user
func (r *CalendarRepository) GetEventCount(userID uint) int64 {
	var count int64
	r.db.Model(&model.ExamCalendar{}).Where("user_id = ?", userID).Count(&count)
	return count
}

// GetEventCountByStatus gets event count by status
func (r *CalendarRepository) GetEventCountByStatus(userID uint, status model.CalendarEventStatus) int64 {
	var count int64
	r.db.Model(&model.ExamCalendar{}).
		Where("user_id = ? AND status = ?", userID, status).
		Count(&count)
	return count
}

// GetEventsGroupedByDate gets events grouped by date
func (r *CalendarRepository) GetEventsGroupedByDate(userID uint, startDate, endDate time.Time) (map[string][]model.ExamCalendar, error) {
	var events []model.ExamCalendar

	err := r.db.Where("user_id = ? AND event_date >= ? AND event_date <= ?", userID, startDate, endDate).
		Order("event_date ASC, created_at ASC").
		Find(&events).Error

	if err != nil {
		return nil, err
	}

	// Group by date
	grouped := make(map[string][]model.ExamCalendar)
	for _, event := range events {
		dateKey := event.EventDate.Format("2006-01-02")
		grouped[dateKey] = append(grouped[dateKey], event)
	}

	return grouped, nil
}

// GetEventStats gets statistics of events
func (r *CalendarRepository) GetEventStats(userID uint) (map[string]interface{}, error) {
	type StatusCount struct {
		Status string
		Count  int64
	}
	type TypeCount struct {
		EventType string
		Count     int64
	}

	var statusCounts []StatusCount
	var typeCounts []TypeCount

	// Count by status
	r.db.Model(&model.ExamCalendar{}).
		Select("status, count(*) as count").
		Where("user_id = ?", userID).
		Group("status").
		Find(&statusCounts)

	// Count by event type
	r.db.Model(&model.ExamCalendar{}).
		Select("event_type, count(*) as count").
		Where("user_id = ?", userID).
		Group("event_type").
		Find(&typeCounts)

	// Get upcoming count (next 7 days)
	now := time.Now().Truncate(24 * time.Hour)
	nextWeek := now.AddDate(0, 0, 7)
	var upcomingCount int64
	r.db.Model(&model.ExamCalendar{}).
		Where("user_id = ? AND event_date >= ? AND event_date <= ? AND status = ?",
			userID, now, nextWeek, model.CalendarEventStatusPending).
		Count(&upcomingCount)

	// Get overdue count
	var overdueCount int64
	r.db.Model(&model.ExamCalendar{}).
		Where("user_id = ? AND event_date < ? AND status = ?",
			userID, now, model.CalendarEventStatusPending).
		Count(&overdueCount)

	stats := map[string]interface{}{
		"by_status":      statusCounts,
		"by_type":        typeCounts,
		"upcoming_count": upcomingCount,
		"overdue_count":  overdueCount,
	}

	return stats, nil
}

// loadEventRelations loads positions and announcements for events
func (r *CalendarRepository) loadEventRelations(events *[]model.ExamCalendar) {
	positionIDs := []string{}
	announcementIDs := []uint{}

	for _, e := range *events {
		if e.PositionID != nil && *e.PositionID != "" {
			positionIDs = append(positionIDs, *e.PositionID)
		}
		if e.AnnouncementID != nil && *e.AnnouncementID != 0 {
			announcementIDs = append(announcementIDs, *e.AnnouncementID)
		}
	}

	// Load positions
	positionMap := make(map[string]*model.Position)
	if len(positionIDs) > 0 {
		var positions []model.Position
		r.db.Where("position_id IN ?", positionIDs).Find(&positions)
		for i := range positions {
			positionMap[positions[i].PositionID] = &positions[i]
		}
	}

	// Load announcements
	announcementMap := make(map[uint]*model.Announcement)
	if len(announcementIDs) > 0 {
		var announcements []model.Announcement
		r.db.Where("id IN ?", announcementIDs).Find(&announcements)
		for i := range announcements {
			announcementMap[announcements[i].ID] = &announcements[i]
		}
	}

	// Associate
	for i := range *events {
		if (*events)[i].PositionID != nil {
			(*events)[i].Position = positionMap[*(*events)[i].PositionID]
		}
		if (*events)[i].AnnouncementID != nil {
			(*events)[i].Announcement = announcementMap[*(*events)[i].AnnouncementID]
		}
	}
}
