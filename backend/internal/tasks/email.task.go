package tasks

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/config"

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
	if err := json.Unmarshal(t.Payload(), &payload); err != nil {
		return fmt.Errorf("failed to unmarshal welcome email Data %v", err)
	}
	logger.Info().
		Str("email", payload.UserEmail).
		Msg("Processing welcome email task")

	// Send welcome email
	err := ts.services.EmailService.SendWelcomeEmail(ctx, payload.UserEmail)
	if err != nil {
		logger.Error().
			Err(err).
			Str("email", payload.UserEmail).
			Msg("Failed to process welcome email task")
		return err
	}

	logger.Info().
		Str("email", payload.UserEmail).
		Msg("Welcome email task completed successfully")

	return nil
}
