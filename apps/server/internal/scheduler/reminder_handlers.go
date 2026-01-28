package scheduler

import (
	"context"
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"go.uber.org/zap"

	"github.com/what-cse/server/internal/model"
	"github.com/what-cse/server/internal/repository"
)

// ReminderHandlers holds reminder task handlers and their dependencies
type ReminderHandlers struct {
	Logger           *zap.Logger
	NotificationRepo *repository.NotificationRepository
	CalendarRepo     CalendarRepository
	PositionRepo     PositionRepository
	SubscriptionRepo SubscriptionRepository
	UserRepo         UserRepository
}

// CalendarRepository interface for calendar operations
type CalendarRepository interface {
	GetUpcomingEvents(start, end time.Time) ([]CalendarEvent, error)
	GetEventByID(id uint) (*CalendarEvent, error)
}

// PositionRepository interface for position operations
type PositionRepository interface {
	GetPositionsWithUpcomingDeadline(deadlineDate time.Time) ([]PositionDeadline, error)
	GetByID(positionID string) (*model.Position, error)
}

// SubscriptionRepository interface for subscription operations
type SubscriptionRepository interface {
	GetActiveSubscriptions() ([]model.UserSubscription, error)
	GetMatchingPositions(subscription *model.UserSubscription, since time.Time) ([]string, error)
}

// UserRepository interface for user operations
type UserRepository interface {
	GetAllActiveUserIDs() ([]uint, error)
	GetUserByID(id uint) (*model.User, error)
}

// CalendarEvent represents a calendar event for reminders
type CalendarEvent struct {
	ID        uint
	UserID    uint
	Title     string
	EventTime time.Time
	Reminder  int // 提前提醒分钟数
}

// PositionDeadline represents a position with upcoming deadline
type PositionDeadline struct {
	PositionID       string
	PositionName     string
	DepartmentName   string
	RegistrationEnd  time.Time
	FavoritedUserIDs []uint
}

// NewReminderHandlers creates a new reminder handlers instance
func NewReminderHandlers(
	logger *zap.Logger,
	notificationRepo *repository.NotificationRepository,
	calendarRepo CalendarRepository,
	positionRepo PositionRepository,
	subscriptionRepo SubscriptionRepository,
	userRepo UserRepository,
) *ReminderHandlers {
	return &ReminderHandlers{
		Logger:           logger,
		NotificationRepo: notificationRepo,
		CalendarRepo:     calendarRepo,
		PositionRepo:     positionRepo,
		SubscriptionRepo: subscriptionRepo,
		UserRepo:         userRepo,
	}
}

// HandleCalendarReminder handles calendar event reminder tasks
func (h *ReminderHandlers) HandleCalendarReminder(ctx context.Context, task *asynq.Task) error {
	payload, err := ParseCalendarReminderPayload(task)
	if err != nil {
		return fmt.Errorf("failed to parse payload: %w", err)
	}

	h.Logger.Info("Processing calendar reminder",
		zap.Uint("event_id", payload.EventID),
		zap.Uint("user_id", payload.UserID),
		zap.String("event_title", payload.EventTitle),
	)

	// Create notification for the user
	notification := &model.UserNotification{
		UserID:     payload.UserID,
		Type:       string(model.NotificationTypeCalendar),
		Title:      fmt.Sprintf("日历提醒：%s", payload.EventTitle),
		Content:    fmt.Sprintf("您有一个日程即将开始：%s，时间：%s", payload.EventTitle, payload.EventTime),
		Link:       fmt.Sprintf("/calendar?event=%d", payload.EventID),
		SourceType: string(model.NotificationSourceCalendar),
		SourceID:   fmt.Sprintf("%d", payload.EventID),
	}

	if err := h.NotificationRepo.Create(notification); err != nil {
		h.Logger.Error("Failed to create calendar reminder notification",
			zap.Uint("event_id", payload.EventID),
			zap.Error(err),
		)
		return err
	}

	h.Logger.Info("Calendar reminder notification created",
		zap.Uint("notification_id", notification.ID),
	)

	return nil
}

// HandleRegistrationReminder handles registration deadline reminder tasks
func (h *ReminderHandlers) HandleRegistrationReminder(ctx context.Context, task *asynq.Task) error {
	payload, err := ParseRegistrationReminderPayload(task)
	if err != nil {
		return fmt.Errorf("failed to parse payload: %w", err)
	}

	h.Logger.Info("Processing registration reminder",
		zap.String("position_id", payload.PositionID),
		zap.Uint("user_id", payload.UserID),
	)

	// Create notification for the user
	notification := &model.UserNotification{
		UserID:     payload.UserID,
		Type:       string(model.NotificationTypeRegistration),
		Title:      fmt.Sprintf("报名截止提醒：%s", payload.PositionName),
		Content:    fmt.Sprintf("您收藏的职位「%s」即将截止报名，截止时间：%s，请尽快完成报名！", payload.PositionName, payload.DeadlineTime),
		Link:       fmt.Sprintf("/positions/%s", payload.PositionID),
		SourceType: string(model.NotificationSourcePosition),
		SourceID:   payload.PositionID,
	}

	if err := h.NotificationRepo.Create(notification); err != nil {
		h.Logger.Error("Failed to create registration reminder notification",
			zap.String("position_id", payload.PositionID),
			zap.Error(err),
		)
		return err
	}

	h.Logger.Info("Registration reminder notification created",
		zap.Uint("notification_id", notification.ID),
	)

	return nil
}

// HandleAnnouncementPush handles new announcement push tasks
func (h *ReminderHandlers) HandleAnnouncementPush(ctx context.Context, task *asynq.Task) error {
	payload, err := ParseAnnouncementPushPayload(task)
	if err != nil {
		return fmt.Errorf("failed to parse payload: %w", err)
	}

	h.Logger.Info("Processing announcement push",
		zap.Uint("announcement_id", payload.AnnouncementID),
		zap.String("title", payload.Title),
	)

	// Get users who subscribed to this type of announcement
	if h.SubscriptionRepo == nil {
		h.Logger.Warn("Subscription repository not available, skipping announcement push")
		return nil
	}

	subscriptions, err := h.SubscriptionRepo.GetActiveSubscriptions()
	if err != nil {
		return fmt.Errorf("failed to get subscriptions: %w", err)
	}

	// Filter subscriptions that match this announcement
	var targetUserIDs []uint
	for _, sub := range subscriptions {
		// Check if subscription matches the announcement criteria
		if matchesAnnouncement(sub, payload) {
			targetUserIDs = append(targetUserIDs, sub.UserID)
		}
	}

	if len(targetUserIDs) == 0 {
		h.Logger.Info("No matching subscriptions for announcement",
			zap.Uint("announcement_id", payload.AnnouncementID),
		)
		return nil
	}

	// Create notifications for all matching users
	var notifications []model.UserNotification
	for _, userID := range targetUserIDs {
		notifications = append(notifications, model.UserNotification{
			UserID:     userID,
			Type:       string(model.NotificationTypeAnnouncement),
			Title:      fmt.Sprintf("新公告：%s", payload.Title),
			Content:    fmt.Sprintf("您订阅的考试类型有新公告发布：%s", payload.Title),
			Link:       fmt.Sprintf("/announcements/%d", payload.AnnouncementID),
			SourceType: string(model.NotificationSourceAnnouncement),
			SourceID:   fmt.Sprintf("%d", payload.AnnouncementID),
		})
	}

	if err := h.NotificationRepo.BatchCreate(notifications); err != nil {
		h.Logger.Error("Failed to batch create announcement notifications",
			zap.Uint("announcement_id", payload.AnnouncementID),
			zap.Error(err),
		)
		return err
	}

	h.Logger.Info("Announcement push notifications created",
		zap.Uint("announcement_id", payload.AnnouncementID),
		zap.Int("notification_count", len(notifications)),
	)

	return nil
}

// HandleSubscriptionPush handles subscription content push tasks
func (h *ReminderHandlers) HandleSubscriptionPush(ctx context.Context, task *asynq.Task) error {
	payload, err := ParseSubscriptionPushPayload(task)
	if err != nil {
		return fmt.Errorf("failed to parse payload: %w", err)
	}

	h.Logger.Info("Processing subscription push",
		zap.Uint("subscription_id", payload.SubscriptionID),
		zap.Uint("user_id", payload.UserID),
		zap.Int("position_count", len(payload.PositionIDs)),
	)

	if len(payload.PositionIDs) == 0 {
		return nil
	}

	// Create notification for the user
	notification := &model.UserNotification{
		UserID:     payload.UserID,
		Type:       string(model.NotificationTypeSubscription),
		Title:      fmt.Sprintf("订阅更新：发现 %d 个新职位", len(payload.PositionIDs)),
		Content:    fmt.Sprintf("您的订阅内容有更新，共发现 %d 个符合条件的新职位，点击查看详情。", len(payload.PositionIDs)),
		Link:       "/subscriptions",
		SourceType: string(model.NotificationSourceSubscription),
		SourceID:   fmt.Sprintf("%d", payload.SubscriptionID),
	}

	if err := h.NotificationRepo.Create(notification); err != nil {
		h.Logger.Error("Failed to create subscription push notification",
			zap.Uint("subscription_id", payload.SubscriptionID),
			zap.Error(err),
		)
		return err
	}

	h.Logger.Info("Subscription push notification created",
		zap.Uint("notification_id", notification.ID),
	)

	return nil
}

// HandleDailyReminderCheck handles the daily reminder check task
func (h *ReminderHandlers) HandleDailyReminderCheck(ctx context.Context, task *asynq.Task) error {
	payload, err := ParseDailyReminderCheckPayload(task)
	if err != nil {
		return fmt.Errorf("failed to parse payload: %w", err)
	}

	h.Logger.Info("Starting daily reminder check",
		zap.String("check_date", payload.CheckDate),
	)

	checkDate, err := time.Parse("2006-01-02", payload.CheckDate)
	if err != nil {
		checkDate = time.Now()
	}

	// 1. Check calendar events for today and tomorrow
	tomorrow := checkDate.Add(24 * time.Hour)
	if h.CalendarRepo != nil {
		events, err := h.CalendarRepo.GetUpcomingEvents(checkDate, tomorrow.Add(24*time.Hour))
		if err != nil {
			h.Logger.Error("Failed to get upcoming calendar events", zap.Error(err))
		} else {
			h.Logger.Info("Found upcoming calendar events", zap.Int("count", len(events)))
			// Schedule individual calendar reminder tasks for each event
			// This would require access to the scheduler client
		}
	}

	// 2. Check registration deadlines (positions expiring in next 3 days)
	if h.PositionRepo != nil {
		deadline := checkDate.Add(72 * time.Hour) // 3 days from now
		positions, err := h.PositionRepo.GetPositionsWithUpcomingDeadline(deadline)
		if err != nil {
			h.Logger.Error("Failed to get positions with upcoming deadline", zap.Error(err))
		} else {
			h.Logger.Info("Found positions with upcoming deadlines", zap.Int("count", len(positions)))

			// Create registration reminder notifications
			for _, pos := range positions {
				for _, userID := range pos.FavoritedUserIDs {
					notification := &model.UserNotification{
						UserID:     userID,
						Type:       string(model.NotificationTypeRegistration),
						Title:      fmt.Sprintf("报名截止提醒：%s", pos.PositionName),
						Content:    fmt.Sprintf("您收藏的职位「%s - %s」将于 %s 截止报名，请尽快报名！", pos.DepartmentName, pos.PositionName, pos.RegistrationEnd.Format("2006-01-02 15:04")),
						Link:       fmt.Sprintf("/positions/%s", pos.PositionID),
						SourceType: string(model.NotificationSourcePosition),
						SourceID:   pos.PositionID,
					}

					if err := h.NotificationRepo.Create(notification); err != nil {
						h.Logger.Error("Failed to create registration reminder",
							zap.String("position_id", pos.PositionID),
							zap.Uint("user_id", userID),
							zap.Error(err),
						)
					}
				}
			}
		}
	}

	// 3. Check subscriptions for new matching content
	if h.SubscriptionRepo != nil {
		subscriptions, err := h.SubscriptionRepo.GetActiveSubscriptions()
		if err != nil {
			h.Logger.Error("Failed to get active subscriptions", zap.Error(err))
		} else {
			h.Logger.Info("Checking subscriptions for new content", zap.Int("count", len(subscriptions)))

			yesterday := checkDate.Add(-24 * time.Hour)
			for _, sub := range subscriptions {
				positionIDs, err := h.SubscriptionRepo.GetMatchingPositions(&sub, yesterday)
				if err != nil {
					h.Logger.Error("Failed to get matching positions for subscription",
						zap.Uint("subscription_id", sub.ID),
						zap.Error(err),
					)
					continue
				}

				if len(positionIDs) > 0 {
					notification := &model.UserNotification{
						UserID:     sub.UserID,
						Type:       string(model.NotificationTypeSubscription),
						Title:      fmt.Sprintf("订阅更新：发现 %d 个新职位", len(positionIDs)),
						Content:    fmt.Sprintf("您的订阅「%s」有新内容，共发现 %d 个符合条件的新职位。", sub.SubscribeName, len(positionIDs)),
						Link:       "/subscriptions",
						SourceType: string(model.NotificationSourceSubscription),
						SourceID:   fmt.Sprintf("%d", sub.ID),
					}

					if err := h.NotificationRepo.Create(notification); err != nil {
						h.Logger.Error("Failed to create subscription notification",
							zap.Uint("subscription_id", sub.ID),
							zap.Error(err),
						)
					}
				}
			}
		}
	}

	h.Logger.Info("Daily reminder check completed",
		zap.String("check_date", payload.CheckDate),
	)

	return nil
}

// RegisterReminderHandlers registers all reminder task handlers with the scheduler
func (h *ReminderHandlers) RegisterReminderHandlers(scheduler *Scheduler) {
	scheduler.RegisterHandler(TypeCalendarReminder, asynq.HandlerFunc(h.HandleCalendarReminder))
	scheduler.RegisterHandler(TypeRegistrationReminder, asynq.HandlerFunc(h.HandleRegistrationReminder))
	scheduler.RegisterHandler(TypeAnnouncementPush, asynq.HandlerFunc(h.HandleAnnouncementPush))
	scheduler.RegisterHandler(TypeSubscriptionPush, asynq.HandlerFunc(h.HandleSubscriptionPush))
	scheduler.RegisterHandler(TypeDailyReminderCheck, asynq.HandlerFunc(h.HandleDailyReminderCheck))

	h.Logger.Info("Reminder handlers registered",
		zap.Strings("types", []string{
			TypeCalendarReminder,
			TypeRegistrationReminder,
			TypeAnnouncementPush,
			TypeSubscriptionPush,
			TypeDailyReminderCheck,
		}),
	)
}

// Helper function to check if subscription matches announcement
func matchesAnnouncement(sub model.UserSubscription, announcement *AnnouncementPushPayload) bool {
	switch sub.SubscribeType {
	case model.SubscribeTypeExamType:
		return sub.SubscribeValue == announcement.ExamType
	case model.SubscribeTypeProvince:
		return sub.SubscribeValue == announcement.Province
	default:
		return false
	}
}
