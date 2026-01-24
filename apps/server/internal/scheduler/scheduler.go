// Package scheduler provides task scheduling functionality using asynq
package scheduler

import (
	"context"
	"fmt"
	"time"

	"github.com/hibiken/asynq"
	"go.uber.org/zap"
)

// SchedulerConfig holds configuration for the scheduler
type SchedulerConfig struct {
	RedisAddr     string `mapstructure:"redis_addr"`
	RedisPassword string `mapstructure:"redis_password"`
	RedisDB       int    `mapstructure:"redis_db"`
	Concurrency   int    `mapstructure:"concurrency"`
	RetryMax      int    `mapstructure:"retry_max"`
}

// DefaultSchedulerConfig returns default scheduler configuration
func DefaultSchedulerConfig() *SchedulerConfig {
	return &SchedulerConfig{
		RedisAddr:   "localhost:6379",
		RedisDB:     0,
		Concurrency: 10,
		RetryMax:    3,
	}
}

// Scheduler manages task scheduling and processing
type Scheduler struct {
	Config    *SchedulerConfig
	Client    *asynq.Client
	Server    *asynq.Server
	Scheduler *asynq.Scheduler
	Logger    *zap.Logger
	handlers  map[string]asynq.Handler
}

// NewScheduler creates a new scheduler
func NewScheduler(config *SchedulerConfig, logger *zap.Logger) *Scheduler {
	if config == nil {
		config = DefaultSchedulerConfig()
	}

	redisOpt := asynq.RedisClientOpt{
		Addr:     config.RedisAddr,
		Password: config.RedisPassword,
		DB:       config.RedisDB,
	}

	client := asynq.NewClient(redisOpt)

	server := asynq.NewServer(
		redisOpt,
		asynq.Config{
			Concurrency: config.Concurrency,
			Queues: map[string]int{
				"critical": 6,
				"default":  3,
				"low":      1,
			},
			RetryDelayFunc: func(n int, e error, t *asynq.Task) time.Duration {
				return time.Duration(n) * time.Minute
			},
			Logger: &asynqLogger{logger: logger},
		},
	)

	scheduler := asynq.NewScheduler(
		redisOpt,
		&asynq.SchedulerOpts{
			Logger: &asynqLogger{logger: logger},
		},
	)

	return &Scheduler{
		Config:    config,
		Client:    client,
		Server:    server,
		Scheduler: scheduler,
		Logger:    logger,
		handlers:  make(map[string]asynq.Handler),
	}
}

// RegisterHandler registers a task handler
func (s *Scheduler) RegisterHandler(taskType string, handler asynq.Handler) {
	s.handlers[taskType] = handler
}

// Start starts the scheduler server
func (s *Scheduler) Start() error {
	mux := asynq.NewServeMux()

	for taskType, handler := range s.handlers {
		mux.Handle(taskType, handler)
	}

	s.Logger.Info("Starting scheduler server",
		zap.Int("concurrency", s.Config.Concurrency),
		zap.Int("handlers", len(s.handlers)),
	)

	return s.Server.Start(mux)
}

// Stop stops the scheduler server
func (s *Scheduler) Stop() {
	s.Server.Shutdown()
	s.Client.Close()
	s.Scheduler.Shutdown()
	s.Logger.Info("Scheduler stopped")
}

// EnqueueTask enqueues a task for processing
func (s *Scheduler) EnqueueTask(ctx context.Context, task *asynq.Task, opts ...asynq.Option) (*asynq.TaskInfo, error) {
	info, err := s.Client.EnqueueContext(ctx, task, opts...)
	if err != nil {
		s.Logger.Error("Failed to enqueue task",
			zap.String("type", task.Type()),
			zap.Error(err),
		)
		return nil, err
	}

	s.Logger.Info("Task enqueued",
		zap.String("id", info.ID),
		zap.String("type", task.Type()),
		zap.String("queue", info.Queue),
	)

	return info, nil
}

// ScheduleTask schedules a recurring task
func (s *Scheduler) ScheduleTask(cronSpec string, task *asynq.Task, opts ...asynq.Option) (string, error) {
	entryID, err := s.Scheduler.Register(cronSpec, task, opts...)
	if err != nil {
		s.Logger.Error("Failed to schedule task",
			zap.String("type", task.Type()),
			zap.String("cron", cronSpec),
			zap.Error(err),
		)
		return "", err
	}

	s.Logger.Info("Task scheduled",
		zap.String("entry_id", entryID),
		zap.String("type", task.Type()),
		zap.String("cron", cronSpec),
	)

	return entryID, nil
}

// StartScheduler starts the cron scheduler
func (s *Scheduler) StartScheduler() error {
	s.Logger.Info("Starting cron scheduler")
	return s.Scheduler.Start()
}

// GetTaskInfo retrieves information about a task
func (s *Scheduler) GetTaskInfo(queue, taskID string) (*asynq.TaskInfo, error) {
	inspector := asynq.NewInspector(asynq.RedisClientOpt{
		Addr:     s.Config.RedisAddr,
		Password: s.Config.RedisPassword,
		DB:       s.Config.RedisDB,
	})
	defer inspector.Close()

	return inspector.GetTaskInfo(queue, taskID)
}

// CancelTask cancels a pending task
func (s *Scheduler) CancelTask(taskID string) error {
	inspector := asynq.NewInspector(asynq.RedisClientOpt{
		Addr:     s.Config.RedisAddr,
		Password: s.Config.RedisPassword,
		DB:       s.Config.RedisDB,
	})
	defer inspector.Close()

	return inspector.CancelProcessing(taskID)
}

// GetQueueInfo retrieves information about a queue
func (s *Scheduler) GetQueueInfo(queue string) (*asynq.QueueInfo, error) {
	inspector := asynq.NewInspector(asynq.RedisClientOpt{
		Addr:     s.Config.RedisAddr,
		Password: s.Config.RedisPassword,
		DB:       s.Config.RedisDB,
	})
	defer inspector.Close()

	return inspector.GetQueueInfo(queue)
}

// ListPendingTasks lists pending tasks in a queue
func (s *Scheduler) ListPendingTasks(queue string, page, pageSize int) ([]*asynq.TaskInfo, error) {
	inspector := asynq.NewInspector(asynq.RedisClientOpt{
		Addr:     s.Config.RedisAddr,
		Password: s.Config.RedisPassword,
		DB:       s.Config.RedisDB,
	})
	defer inspector.Close()

	return inspector.ListPendingTasks(queue, asynq.PageSize(pageSize), asynq.Page(page))
}

// ListActiveTasks lists active (running) tasks in a queue
func (s *Scheduler) ListActiveTasks(queue string, page, pageSize int) ([]*asynq.TaskInfo, error) {
	inspector := asynq.NewInspector(asynq.RedisClientOpt{
		Addr:     s.Config.RedisAddr,
		Password: s.Config.RedisPassword,
		DB:       s.Config.RedisDB,
	})
	defer inspector.Close()

	return inspector.ListActiveTasks(queue, asynq.PageSize(pageSize), asynq.Page(page))
}

// asynqLogger adapts zap.Logger to asynq.Logger interface
type asynqLogger struct {
	logger *zap.Logger
}

func (l *asynqLogger) Debug(args ...interface{}) {
	l.logger.Debug(fmt.Sprint(args...))
}

func (l *asynqLogger) Info(args ...interface{}) {
	l.logger.Info(fmt.Sprint(args...))
}

func (l *asynqLogger) Warn(args ...interface{}) {
	l.logger.Warn(fmt.Sprint(args...))
}

func (l *asynqLogger) Error(args ...interface{}) {
	l.logger.Error(fmt.Sprint(args...))
}

func (l *asynqLogger) Fatal(args ...interface{}) {
	l.logger.Fatal(fmt.Sprint(args...))
}
