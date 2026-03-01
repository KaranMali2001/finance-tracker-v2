package jobs

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/jackc/pgx/v5/pgtype"
)

var _ jobQuerier = (*generated.Queries)(nil)

type jobQuerier interface {
	CreateNewJob(ctx context.Context, arg generated.CreateNewJobParams) (generated.Job, error)
	GetJobById(ctx context.Context, jobID pgtype.Text) (generated.Job, error)
	UpdateJob(ctx context.Context, arg generated.UpdateJobParams) (generated.Job, error)
}
