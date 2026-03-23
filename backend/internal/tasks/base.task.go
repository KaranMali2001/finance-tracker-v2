package tasks

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/dispatcher"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/jobs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/services"
	"github.com/google/uuid"
	"github.com/rs/zerolog"
)

type TaskType string

const (
	TaskWelcomeEmail       TaskType = "email:welcome"
	TaskBankReconciliation TaskType = "reconciliation:process"
	TaskPing               TaskType = "system:ping"
)

type TaskService struct {
	services      *services.Services
	jobRepository *jobs.JobRepository
	dispatcher    dispatcher.Dispatcher
}

func NewTaskService(svcs *services.Services, jobRepository *jobs.JobRepository, disp dispatcher.Dispatcher) *TaskService {
	return &TaskService{
		services:      svcs,
		jobRepository: jobRepository,
		dispatcher:    disp,
	}
}

func (ts *TaskService) EnqueueTask(ctx context.Context, jobType jobs.JobType, dispatchType TaskType, payload any, userId string, logger *zerolog.Logger) error {
	payloadBytes, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("failed to marshal task payload: %w", err)
	}

	jobID := uuid.NewString()

	payloadWithID, err := injectJobID(payloadBytes, jobID)
	if err != nil {
		return fmt.Errorf("failed to inject job_id into payload: %w", err)
	}

	_, err = ts.jobRepository.CreateNewJob(ctx, &jobs.CreateJob{
		UserId:    userId,
		JobType:   jobType,
		JobId:     jobID,
		Payload:   payloadWithID,
		Attempts:  0,
		QueueName: "default",
		Metadata:  nil,
		Status:    jobs.JobStatusPending,
	})
	if err != nil {
		return fmt.Errorf("failed to create job record: %w", err)
	}

	logger.Info().Str("job_id", jobID).Str("job_type", string(jobType)).Msg("job created, dispatching")

	return ts.dispatcher.Dispatch(ctx, dispatcher.JobPayload{
		Type:    string(dispatchType),
		Payload: payloadWithID,
	})
}

// injectJobID merges job_id into an already-marshalled JSON object payload.
func injectJobID(payloadBytes []byte, jobID string) (json.RawMessage, error) {
	var m map[string]json.RawMessage
	if err := json.Unmarshal(payloadBytes, &m); err != nil {
		return nil, err
	}
	idBytes, _ := json.Marshal(jobID)
	m["job_id"] = idBytes
	result, err := json.Marshal(m)
	return result, err
}
