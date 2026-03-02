package queue

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/investment"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/reconciliation"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/tasks"
	"github.com/hibiken/asynq"
	"github.com/rs/zerolog"
)

type JobService struct {
	Client        *asynq.Client
	server        *asynq.Server
	logger        *zerolog.Logger
	config        *config.IntegrationConfig
	tasks         *tasks.TaskService
	jobRepo       *jobs.JobRepository
	reconService  *reconciliation.ReconService
	investService *investment.InvestmentService
}

func NewJobService(logger *zerolog.Logger, cfg *config.Config, taskSvc *tasks.TaskService, client *asynq.Client, jobRepo *jobs.JobRepository, reconService *reconciliation.ReconService, investService *investment.InvestmentService) *JobService {
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
		Client:        client,
		server:        server,
		logger:        logger,
		config:        &cfg.Integration,
		tasks:         taskSvc,
		jobRepo:       jobRepo,
		reconService:  reconService,
		investService: investService,
	}
}

func (j *JobService) Start() error {
	mux := asynq.NewServeMux()
	mux.HandleFunc(string(tasks.TaskWelcomeEmail), func(ctx context.Context, t *asynq.Task) error {
		return j.tasks.HandleWelcomeEmailTask(ctx, t, j.config, j.logger)
	})
	mux.HandleFunc(string(tasks.TaskBankReconciliation), func(ctx context.Context, t *asynq.Task) error {
		return j.handleBankReconciliationTask(ctx, t, j.logger)
	})
	mux.HandleFunc(string(tasks.TaskInvestmentAutoLink), func(ctx context.Context, t *asynq.Task) error {
		return j.handleInvestmentAutoLinkTask(ctx, t, j.logger)
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

func (j *JobService) handleBankReconciliationTask(ctx context.Context, t *asynq.Task, logger *zerolog.Logger) error {
	taskID := t.ResultWriter().TaskID()

	job, err := j.jobRepo.GetJobById(ctx, taskID)
	if err != nil {
		logger.Error().Err(err).Str("task_id", taskID).Msg("[recon] job not found in DB")
	} else {
		status := jobs.JobStatusProcessing
		attempt := job.Attempts + 1
		if _, err := j.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
			ID:       job.ID,
			Status:   &status,
			Attempts: &attempt,
		}); err != nil {
			logger.Error().Err(err).Msg("[recon] failed to update job to processing")
		}
	}

	var payload tasks.BankReconciliationPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		errMsg := err.Error()
		if job != nil {
			status := jobs.JobStatusFailed
			finishedAt := time.Now()
			_, _ = j.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
				ID:         job.ID,
				Status:     &status,
				LastError:  &errMsg,
				FinishedAt: &finishedAt,
			})
		}
		logger.Error().Err(err).Msg("[recon] failed to unmarshal payload")
		return fmt.Errorf("failed to unmarshal reconciliation payload: %w", err)
	}

	logger.Info().
		Str("upload_id", payload.UploadID.String()).
		Str("account_id", payload.AccountID.String()).
		Int("threshold", payload.ReconciliationThreshold).
		Msg("[recon] starting reconciliation job")

	if err := j.reconService.RunReconciliationJob(ctx, payload, logger); err != nil {
		errMsg := err.Error()
		if job != nil {
			status := jobs.JobStatusFailed
			finishedAt := time.Now()
			_, _ = j.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
				ID:         job.ID,
				Status:     &status,
				LastError:  &errMsg,
				FinishedAt: &finishedAt,
			})
		}
		logger.Error().Err(err).Str("upload_id", payload.UploadID.String()).Msg("[recon] reconciliation job failed")
		return err
	}

	if job != nil {
		status := jobs.JobStatusCompleted
		finishedAt := time.Now()
		result := fmt.Sprintf("Reconciliation completed for upload %s", payload.UploadID.String())
		_, _ = j.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
			ID:         job.ID,
			Status:     &status,
			Result:     &result,
			FinishedAt: &finishedAt,
		})
	}

	logger.Info().Str("upload_id", payload.UploadID.String()).Msg("[recon] reconciliation job completed successfully")
	return nil
}

func (j *JobService) handleInvestmentAutoLinkTask(ctx context.Context, t *asynq.Task, logger *zerolog.Logger) error {
	taskID := t.ResultWriter().TaskID()

	job, err := j.jobRepo.GetJobById(ctx, taskID)
	if err != nil {
		logger.Error().Err(err).Str("task_id", taskID).Msg("[invest-autolink] job not found in DB")
	} else {
		status := jobs.JobStatusProcessing
		attempt := job.Attempts + 1
		if _, err := j.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
			ID:       job.ID,
			Status:   &status,
			Attempts: &attempt,
		}); err != nil {
			logger.Error().Err(err).Msg("[invest-autolink] failed to update job to processing")
		}
	}

	var payload tasks.InvestmentAutoLinkPayload
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		errMsg := err.Error()
		if job != nil {
			status := jobs.JobStatusFailed
			finishedAt := time.Now()
			_, _ = j.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
				ID:         job.ID,
				Status:     &status,
				LastError:  &errMsg,
				FinishedAt: &finishedAt,
			})
		}
		logger.Error().Err(err).Msg("[invest-autolink] failed to unmarshal payload")
		return fmt.Errorf("failed to unmarshal investment auto-link payload: %w", err)
	}

	domainPayload := investment.InvestmentAutoLinkPayload{
		UserID:         payload.UserID,
		TransactionIDs: payload.TransactionIDs,
	}

	result, err := j.investService.RunAutoLinkJob(ctx, domainPayload, logger)
	if err != nil {
		errMsg := err.Error()
		if job != nil {
			status := jobs.JobStatusFailed
			finishedAt := time.Now()
			_, _ = j.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
				ID:         job.ID,
				Status:     &status,
				LastError:  &errMsg,
				FinishedAt: &finishedAt,
			})
		}
		logger.Error().Err(err).Str("user_id", payload.UserID).Msg("[invest-autolink] job failed")
		return err
	}

	if job != nil {
		status := jobs.JobStatusCompleted
		finishedAt := time.Now()
		resultBytes, _ := json.Marshal(result)
		resultStr := string(resultBytes)
		_, _ = j.jobRepo.UpdateJob(ctx, &jobs.UpdateJob{
			ID:         job.ID,
			Status:     &status,
			Result:     &resultStr,
			FinishedAt: &finishedAt,
		})
	}

	logger.Info().
		Str("user_id", payload.UserID).
		Int("matched", result.Matched).
		Int("unmatched", result.Unmatched).
		Int("errors", result.Errors).
		Msg("[invest-autolink] job completed")
	return nil
}
