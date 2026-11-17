package tasks

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

const TaskStatementParse TaskType = "statement:parse"

// StatementParsePayload is the job payload for statement:parse tasks — the async
// LLM extraction gate that runs before reconciliation.
type StatementParsePayload struct {
	JobID     string    `json:"job_id"`
	UploadID  uuid.UUID `json:"upload_id"`
	AccountID uuid.UUID `json:"account_id"`
	UserID    string    `json:"user_id"`
}

func (ts *TaskService) EnqueueStatementParse(ctx context.Context, payload StatementParsePayload, logger *zerolog.Logger) error {
	return ts.EnqueueTask(ctx, jobs.JobTypeSTATEMENTPARSE, TaskStatementParse, payload, payload.UserID, logger)
}
