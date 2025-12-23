package tasks

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"

	"github.com/hibiken/asynq"
	"github.com/rs/zerolog"
)

type WelcomeEmailPayload struct {
	UserEmail string `json:"user_email"`
}

func (ts *TaskService) NewWelcomeEmailTask(userEmail string) (*asynq.Task, error) {
	payload := WelcomeEmailPayload{
		UserEmail: userEmail,
	}
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal the welcome email payload %v", err)
	}
	return NewTaskWithConfig(TaskWelcomeEmail, payloadBytes)
}

func (ts *TaskService) HandleWelcomeEmailTask(ctx context.Context, t *asynq.Task, cfg *config.IntegrationConfig, logger *zerolog.Logger) error {
	var payload WelcomeEmailPayload
	job, err := ts.jobRepository.GetJobById(ctx, t.ResultWriter().TaskID())
	if err != nil {
		logger.Error().Err(err).Msg("Not able to find the job,creating new job")
		// todo create new job
	} else {
		status := jobs.JobStatusProcessing
		attempt := job.Attempts + 1
		updatedJob, err := ts.jobRepository.UpdateJob(ctx, &jobs.UpdateJob{
			ID:       job.ID,
			Status:   &status,
			Attempts: &attempt,
		})
		if err != nil {
			logger.Error().Err(err).Msgf("Not able to update the job with status %v", status)
		}
		logger.Info().Msgf("Job updated successfully , update job is %v", updatedJob)
	}
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		errormsg := err.Error()
		status := jobs.JobStatusFailed
		if job != nil {
			_, err := ts.jobRepository.UpdateJob(ctx, &jobs.UpdateJob{
				ID:         job.ID,
				FinishedAt: func() *time.Time { t := time.Now(); return &t }(),
				Status:     &status,
				LastError:  &errormsg,
			})
			if err != nil {
				logger.Error().Err(err).Msgf("Failed to update job status %v in database ", status)
			}
		} else {
			logger.Error().Msgf("JOB NOT FOUND IN DATABASE %v", t.ResultWriter().TaskID())
		}
		logger.Warn().Err(err).Msg("Job failed unable to unmarshal data ")
		return fmt.Errorf("failed to unmarshal welcome email Data %v", err)
	}
	logger.Info().
		Str("email", payload.UserEmail).
		Msg("Processing welcome email task")

	// Send welcome email
	err = ts.services.EmailService.SendWelcomeEmail(ctx, payload.UserEmail)
	if err != nil {
		errormsg := err.Error()
		if job != nil {
			status := jobs.JobStatusFailed
			_, err := ts.jobRepository.UpdateJob(ctx, &jobs.UpdateJob{
				ID:         job.ID,
				FinishedAt: func() *time.Time { t := time.Now(); return &t }(),
				Status:     &status,
				LastError:  &errormsg,
			})
			if err != nil {
				logger.Error().Err(err).Msgf("Failed to update job status %v in database ", status)
			}
		} else {
			logger.Error().Err(err).Msgf("JOB NOT FOUND IN DATABASE %v", t.ResultWriter().TaskID())
		}

		logger.Error().
			Err(err).
			Str("email", payload.UserEmail).
			Msg("Failed to process welcome email task")
		return err
	}
	status := jobs.JobStatusCompleted
	resultString := fmt.Sprintf("Email has been sent successfully to user %v", payload.UserEmail)

	if job != nil {
		_, err = ts.jobRepository.UpdateJob(ctx, &jobs.UpdateJob{
			ID:         job.ID,
			FinishedAt: func() *time.Time { t := time.Now(); return &t }(),
			Status:     &status,
			Result:     &resultString,
		})
		if err != nil {
			logger.Error().Err(err).Msgf("Failed to update job status %v in database ", status)
		}
	} else {
		logger.Error().Msgf("JOB NOT FOUND IN DATABASE %v", t.ResultWriter().TaskID())
	}
	logger.Info().
		Str("email", payload.UserEmail).
		Msg("Welcome email task completed successfully")

	return nil
}
