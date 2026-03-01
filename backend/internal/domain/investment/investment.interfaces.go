package investment

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
)

// investmentQuerier is the narrow slice of generated.Queries that InvestmentRepository needs.
// WithTx is included because the repository creates tx-scoped queriers internally.
type investmentQuerier interface {
	WithTx(tx pgx.Tx) *generated.Queries
	CreateGoal(ctx context.Context, arg generated.CreateGoalParams) (generated.Goal, error)
	GetGoals(ctx context.Context, arg generated.GetGoalsParams) ([]generated.Goal, error)
	GetGoalById(ctx context.Context, arg generated.GetGoalByIdParams) (generated.Goal, error)
	DeleteGoal(ctx context.Context, arg generated.DeleteGoalParams) error
	UpdateGoal(ctx context.Context, arg generated.UpdateGoalParams) (generated.Goal, error)
}

// investmentRepository is the interface InvestmentService depends on.
type investmentRepository interface {
	CreateNewGoal(ctx context.Context, payload *CreateGoalReq, clerkId string) (*Goal, error)
	GetGoalsWithFilter(ctx context.Context, params *GetGoalsWithFilter, clerkID string) ([]Goal, error)
	GetGoalById(ctx context.Context, param *GetGoalById, clerkID string) (*Goal, error)
	DeleteGoal(ctx context.Context, goalID uuid.UUID, clerkID string) error
	UpdateGoal(ctx context.Context, goalID uuid.UUID, userID string, params *UpdateGoals) (*Goal, error)
}

// Compile-time check: *generated.Queries must satisfy investmentQuerier.
var _ investmentQuerier = (*generated.Queries)(nil)
