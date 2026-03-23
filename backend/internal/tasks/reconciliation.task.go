package tasks

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

// BankReconciliationPayload is the job payload for reconciliation:process tasks.
type BankReconciliationPayload struct {
	JobID                   string    `json:"job_id"`
	UploadID                uuid.UUID `json:"upload_id"`
	AccountID               uuid.UUID `json:"account_id"`
	UserID                  string    `json:"user_id"`
	ReconciliationThreshold int       `json:"reconciliation_threshold"`
}

func (ts *TaskService) EnqueueBankReconciliation(ctx context.Context, payload BankReconciliationPayload, logger *zerolog.Logger) error {
	return ts.EnqueueTask(ctx, jobs.JobTypeBANKRECONCILIATION, TaskBankReconciliation, payload, payload.UserID, logger)
}
