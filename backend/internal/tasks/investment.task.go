package tasks

import (
	"encoding/json"
	"fmt"

	"github.com/google/uuid"
	"github.com/hibiken/asynq"
)

const TaskInvestmentAutoLink TaskType = "investment:autolink"

func init() {
	TaskRegistry[TaskInvestmentAutoLink] = TaskConfig{
		Type:        TaskInvestmentAutoLink,
		QueueConfig: &DefaultQueueConfig,
		Description: "Fuzzy-matches a batch of transactions against the user's active SIP investment rules",
	}
}

// InvestmentAutoLinkPayload is the job payload for investment:autolink tasks.
type InvestmentAutoLinkPayload struct {
	UserID         string      `json:"user_id"`
	TransactionIDs []uuid.UUID `json:"transaction_ids"`
}

// NewInvestmentAutoLinkTask creates an asynq task for the investment auto-link job.
func (ts *TaskService) NewInvestmentAutoLinkTask(payload InvestmentAutoLinkPayload) (*asynq.Task, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal investment auto-link payload: %w", err)
	}
	return NewTaskWithConfig(TaskInvestmentAutoLink, payloadBytes)
}
