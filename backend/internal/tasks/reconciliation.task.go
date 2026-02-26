package tasks

import (
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
)

// BankReconciliationPayload is the job payload for reconciliation:process tasks.
// Mirrors reconciliation.BankReconciliationPayload — same JSON tags so it
// round-trips cleanly through Asynq.
type BankReconciliationPayload struct {
	UploadID                uuid.UUID `json:"upload_id"`
	AccountID               uuid.UUID `json:"account_id"`
	UserID                  string    `json:"user_id"`
	ReconciliationThreshold int       `json:"reconciliation_threshold"`
}

// NewBankReconciliationTask creates an asynq task for the reconciliation job.
func (ts *TaskService) NewBankReconciliationTask(payload BankReconciliationPayload) (*asynq.Task, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal reconciliation payload: %w", err)
	}
	return NewTaskWithConfig(TaskBankReconciliation, payloadBytes)
}
