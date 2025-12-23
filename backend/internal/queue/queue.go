package queue

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/tasks"
	"github.com/hibiken/asynq"
	"github.com/rs/zerolog"
)

type JobService struct {
	Client *asynq.Client
	server *asynq.Server
	logger *zerolog.Logger
	config *config.IntegrationConfig
	tasks  *tasks.TaskService
}

func NewJobService(logger *zerolog.Logger, cfg *config.Config, tasks *tasks.TaskService, client *asynq.Client) *JobService {
	redisAddr := cfg.Redis.Address

	server := asynq.NewServer(
		asynq.RedisClientOpt{Addr: redisAddr},
		asynq.Config{
			Concurrency: 10,
			Queues: map[string]int{
				"critical": 6,
				"default":  3,
				"low":      1,
			},
		},
	)

	return &JobService{
		Client: client,
		server: server,
		logger: logger,
		config: &cfg.Integration,
		tasks:  tasks,
	}
}

func (j *JobService) Start() error {
	// Register task handlers
	mux := asynq.NewServeMux()
	mux.HandleFunc(string(tasks.TaskWelcomeEmail), func(ctx context.Context, t *asynq.Task) error {
		return j.tasks.HandleWelcomeEmailTask(ctx, t, j.config, j.logger)
	})

	j.logger.Info().
		Int("registered_tasks", len(tasks.TaskRegistry)).
		Msg("Starting background job server")
	if err := j.server.Start(mux); err != nil {
		return err
	}

	return nil
}

func (j *JobService) Stop() {
	j.logger.Info().Msg("Stopping background job server")
	j.server.Shutdown()
	j.Client.Close()
}
