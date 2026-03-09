package tasks

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

const TaskInvestmentAutoLink TaskType = "investment:autolink"

// InvestmentAutoLinkPayload is the job payload for investment:autolink tasks.
type InvestmentAutoLinkPayload struct {
	JobID          string      `json:"job_id"`
	UserID         string      `json:"user_id"`
	TransactionIDs []uuid.UUID `json:"transaction_ids"`
}

func (ts *TaskService) EnqueueInvestmentAutoLink(ctx context.Context, payload InvestmentAutoLinkPayload, logger *zerolog.Logger) error {
	return ts.EnqueueTask(ctx, jobs.JobTypeINVESTMENTAUTOLINK, payload, payload.UserID, logger)
}
