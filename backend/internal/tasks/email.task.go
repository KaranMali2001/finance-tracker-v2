package tasks

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/rs/zerolog"
)

type WelcomeEmailPayload struct {
	JobID     string `json:"job_id"`
	UserEmail string `json:"user_email"`
}

func (ts *TaskService) EnqueueWelcomeEmail(ctx context.Context, userEmail string, userId string, logger *zerolog.Logger) error {
	return ts.EnqueueTask(ctx, jobs.JobTypeWELCOMEEMAIL, WelcomeEmailPayload{UserEmail: userEmail}, userId, logger)
}
