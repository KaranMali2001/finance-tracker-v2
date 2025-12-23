package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/services"
	"github.com/hibiken/asynq"
	"github.com/rs/zerolog"
)

type TaskType string

const (
	TaskWelcomeEmail TaskType = "email:welcome"
)

type QueueName string

const (
	QueueCritical QueueName = "critical"
	QueueDefault  QueueName = "default"
	QueueLow      QueueName = "low"
)

type QueueConfig struct {
	QueueName  QueueName
	MaxRetries int
	Timeout    time.Duration
}

var (
	// CriticalQueueConfig is for urgent tasks that need immediate processing
	CriticalQueueConfig = QueueConfig{
		QueueName:  QueueCritical,
		MaxRetries: 5,
		Timeout:    30 * time.Second,
	}

	// DefaultQueueConfig is for normal priority tasks
	DefaultQueueConfig = QueueConfig{
		QueueName:  QueueDefault,
		MaxRetries: 3,
		Timeout:    30 * time.Second,
	}

	// LowQueueConfig is for low priority tasks that can be delayed
	LowQueueConfig = QueueConfig{
		QueueName:  QueueLow,
		MaxRetries: 2,
		Timeout:    60 * time.Second,
	}
)

type TaskConfig struct {
	Type        TaskType
	QueueConfig *QueueConfig
	Description string
}

var TaskRegistry = map[TaskType]TaskConfig{
	TaskWelcomeEmail: {
		Type:        TaskWelcomeEmail,
		QueueConfig: &DefaultQueueConfig,
		Description: "Sends welcome email to newly registered users",
	},
}

type TaskService struct {
	registry      map[TaskType]TaskConfig
	services      *services.Services
	jobRepository *jobs.JobRepository
	client        *asynq.Client
}

// NewTaskService creates a new TaskService instance
func NewTaskService(services *services.Services, jobRepository *jobs.JobRepository, client *asynq.Client) *TaskService {
	return &TaskService{
		registry:      TaskRegistry,
		services:      services,
		jobRepository: jobRepository,
		client:        client,
	}
}

func GetTaskConfig(taskType TaskType) (TaskConfig, bool) {
	config, exists := TaskRegistry[taskType]
	return config, exists
}

// NewTaskOptions creates asynq task options from QueueConfig
func NewTaskOptions(config TaskConfig) []asynq.Option {
	if config.QueueConfig == nil {
		// Fallback to default if queue config is nil
		config.QueueConfig = &DefaultQueueConfig
	}

	opts := []asynq.Option{
		asynq.Queue(string(config.QueueConfig.QueueName)),
		asynq.MaxRetry(config.QueueConfig.MaxRetries),
		asynq.Timeout(config.QueueConfig.Timeout),
	}
	return opts
}

// NewTaskWithConfig creates a new asynq task with the specified config
func NewTaskWithConfig(taskType TaskType, payload []byte) (*asynq.Task, error) {
	config, exists := GetTaskConfig(taskType)
	if !exists {
		return nil, fmt.Errorf("unknown task type: %s", taskType)
	}

	opts := NewTaskOptions(config)
	return asynq.NewTask(string(taskType), payload, opts...), nil
}

func (ts *TaskService) EnqueueTask(ctx context.Context, task *asynq.Task, userId string, logger *zerolog.Logger, jobType jobs.JobType) error {
	info, err := ts.client.EnqueueContext(ctx, task)
	if err != nil {
		return fmt.Errorf("failed to enqueue task: %w", err)
	}
	job, err := ts.jobRepository.CreateNewJob(ctx, &jobs.CreateJob{
		UserId:    userId,
		JobType:   jobType,
		JobId:     info.ID,
		Payload:   task.Payload(),
		Attempts:  0,
		QueueName: "default",
		Metadata:  nil,
		Status:    jobs.JobStatusPending,
	})
	if err != nil {
		return fmt.Errorf("failed to create job: %w", err)
	}
	logger.Info().Str("SuccessFully Created Job %s", job.JobId).Msg("Job created successfully")
	return nil
}

func (ts *TaskService) NewTask(taskType TaskType, payload any, userId string, logger *zerolog.Logger) (*asynq.Task, error) {
	// Marshal payload to JSON
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal task payload: %w", err)
	}

	// Use existing NewTaskWithConfig to create task with proper config
	task, err := NewTaskWithConfig(taskType, payloadBytes)
	if err != nil {
		return nil, fmt.Errorf("failed to create task: %w", err)
	}

	return task, nil
}
