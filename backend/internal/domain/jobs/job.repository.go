package jobs

import (
	"context"
	"encoding/json"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
)

type JobRepository struct {
	queries jobQuerier
}

func NewJobRepository(q jobQuerier) *JobRepository {
	return &JobRepository{
		queries: q,
	}
}

func jobFromDb(job *generated.Job) *Job {
	var result *string
	if len(job.Result) > 0 {
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

	attempts := utils.UintPtrToInt4(body.Attempts)

	var result []byte
	if body.Result != nil {
		b, err := json.Marshal(*body.Result)
		if err != nil {
			return nil, err
		}
		result = b
	}

	lastError := utils.StringPtrToText(body.LastError)
	finishedAt := utils.TimestampPtrToPgtype(body.FinishedAt)

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
