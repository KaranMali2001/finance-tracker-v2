package jobs

import (
	"context"
	"encoding/json"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/jackc/pgx/v5/pgtype"
)

type JobRepository struct {
	queries *generated.Queries
}

func NewJobRepository(q *generated.Queries) *JobRepository {
	return &JobRepository{
		queries: q,
	}
}

func jobFromDb(job *generated.Job) *Job {
	var result *string
	if len(job.Result) > 0 {
		// result is stored as JSONB. If it's a JSON string, unwrap it.
		var decoded string
		if err := json.Unmarshal(job.Result, &decoded); err == nil {
			result = &decoded
		} else {
			resultStr := string(job.Result)
			result = &resultStr
		}
	}
	return &Job{
		ID:         utils.UUIDToUUID(job.ID),
		UserId:     job.UserID.String,
		JobType:    JobType(job.JobType.JobType),
		JobId:      utils.TextToString(job.JobID),
		Payload:    job.Payload,
		Attempts:   uint(job.Attempts.Int32),
		QueueName:  job.QueueName.String,
		Metadata:   job.Metadata,
		Status:     JobStatus(job.Status.JobStatus),
		Result:     result,
		LastError:  utils.TextToStringPtr(job.LastError),
		FinishedAt: utils.TimestampToTimePtr(job.FinishedAt),
		CreatedAt:  utils.TimestampToTime(job.CreatedAt),
	}
}

func (r *JobRepository) CreateNewJob(c context.Context, body *CreateJob) (*Job, error) {
	params := generated.CreateNewJobParams{
		JobID: utils.StringToPgtypeText(body.JobId),
		JobType: generated.NullJobType{
			JobType: generated.JobType(body.JobType),
			Valid:   true,
		},
		UserID: utils.StringToPgtypeText(body.UserId),
		Status: generated.NullJobStatus{
			JobStatus: generated.JobStatus(body.Status),
			Valid:     true,
		},
		Attempts: utils.IntPtrToInt4(&body.Attempts),
		Payload:  body.Payload,
		Metadata: body.Metadata,
	}
	job, err := r.queries.CreateNewJob(c, params)
	if err != nil {
		return nil, err
	}
	return jobFromDb(&job), nil
}

func (r *JobRepository) GetJobById(c context.Context, id string) (*Job, error) {
	job, err := r.queries.GetJobById(c, utils.StringToPgtypeText(id))
	if err != nil {
		return nil, err
	}
	return jobFromDb(&job), nil
}

func (r *JobRepository) UpdateJob(c context.Context, body *UpdateJob) (*Job, error) {
	var status generated.NullJobStatus
	if body.Status != nil {
		status = generated.NullJobStatus{
			JobStatus: generated.JobStatus(*body.Status),
			Valid:     true,
		}
	} else {
		status = generated.NullJobStatus{Valid: false}
	}

	var attempts pgtype.Int4
	if body.Attempts != nil {
		attempts = utils.UintPtrToInt4(body.Attempts)
	} else {
		attempts = pgtype.Int4{Valid: false}
	}

	var result []byte
	if body.Result != nil {
		// jobs.result is JSONB in DB, so ensure we always write valid JSON.
		// For a plain message, store it as a JSON string.
		b, err := json.Marshal(*body.Result)
		if err != nil {
			return nil, err
		}
		result = b
	}

	var lastError pgtype.Text
	if body.LastError != nil {
		lastError = utils.StringPtrToText(body.LastError)
	} else {
		lastError = pgtype.Text{Valid: false}
	}

	var finishedAt pgtype.Timestamp
	if body.FinishedAt != nil {
		finishedAt = utils.TimestampPtrToPgtype(body.FinishedAt)
	} else {
		finishedAt = pgtype.Timestamp{Valid: false}
	}

	params := generated.UpdateJobParams{
		ID:         utils.UUIDToPgtype(body.ID),
		Status:     status,
		Attempts:   attempts,
		Result:     result,
		LastError:  lastError,
		FinishedAt: finishedAt,
	}

	job, err := r.queries.UpdateJob(c, params)
	if err != nil {
		return nil, err
	}
	return jobFromDb(&job), nil
}
