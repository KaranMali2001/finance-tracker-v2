package jobs

import (
	"encoding/json"
	"time"

	"github.com/google/uuid"
)

type JobType string

const (
	JobTypeWELCOMEEMAIL       JobType = "WELCOME_EMAIL"
	JobTypeWEBHOOK            JobType = "WEBHOOK"
	JobTypeBANKRECONCILIATION JobType = "BANK_RECONCILIATION"
	JobTypeREPORTS            JobType = "REPORTS"
)

type JobStatus string

const (
	JobStatusPending    JobStatus = "pending"
	JobStatusProcessing JobStatus = "processing"
	JobStatusFailed     JobStatus = "failed"
	JobStatusCompleted  JobStatus = "completed"
)

type Job struct {
	ID         uuid.UUID
	UserId     string
	JobType    JobType
	JobId      string
	Payload    json.RawMessage
	QueueName  string
	Status     JobStatus
	Attempts   uint
	Result     *string
	LastError  *string
	Metadata   json.RawMessage
	FinishedAt *time.Time
	CreatedAt  time.Time
}
type CreateJob struct {
	UserId    string
	JobType   JobType
	JobId     string
	Payload   json.RawMessage
	Attempts  uint
	QueueName string
	Metadata  json.RawMessage
	Status    JobStatus
}

type UpdateJob struct {
	ID         uuid.UUID
	Status     *JobStatus
	Attempts   *uint
	Result     *string
	LastError  *string
	FinishedAt *time.Time
}
