package tasks

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

const TaskLlmSmsParse TaskType = "sms:llm_parse"

type LlmSmsParsePayload struct {
	SmsID  uuid.UUID `json:"sms_id"`
	UserID string    `json:"user_id"`
}

func (ts *TaskService) EnqueueLlmSmsParse(ctx context.Context, smsID uuid.UUID, clerkID string) error {
	log := zerolog.Ctx(ctx)
	return ts.EnqueueTask(ctx, jobs.JobTypeLLMSMSPARSE, TaskLlmSmsParse, LlmSmsParsePayload{SmsID: smsID, UserID: clerkID}, clerkID, log)
}
