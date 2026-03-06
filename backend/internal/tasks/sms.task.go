package tasks

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/google/uuid"
	"github.com/hibiken/asynq"
	"github.com/rs/zerolog"
)

const TaskLlmSmsParse TaskType = "sms:llm_parse"

func init() {
	TaskRegistry[TaskLlmSmsParse] = TaskConfig{
		Type:        TaskLlmSmsParse,
		QueueConfig: &DefaultQueueConfig,
		Description: "Calls LLM to parse a failed SMS and create a transaction if successful",
	}
}

type LlmSmsParsePayload struct {
	SmsID  uuid.UUID `json:"sms_id"`
	UserID string    `json:"user_id"`
}

func (ts *TaskService) NewLlmSmsParseTask(payload LlmSmsParsePayload) (*asynq.Task, error) {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal LLM SMS parse payload: %w", err)
	}
	return NewTaskWithConfig(TaskLlmSmsParse, payloadBytes)
}

func (ts *TaskService) EnqueueLlmSmsParse(ctx context.Context, smsID uuid.UUID, clerkID string) error {
	log := zerolog.Ctx(ctx)
	task, err := ts.NewLlmSmsParseTask(LlmSmsParsePayload{SmsID: smsID, UserID: clerkID})
	if err != nil {
		return err
	}
	return ts.EnqueueTask(ctx, task, clerkID, log, jobs.JobTypeLLMSMSPARSE)
}
