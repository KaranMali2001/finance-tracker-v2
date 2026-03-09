package investment

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/tasks"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rs/zerolog"
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
	CreateGoalInvestment(ctx context.Context, arg generated.CreateGoalInvestmentParams) (generated.GoalInvestment, error)
	GetGoalInvestmentsByUser(ctx context.Context, arg generated.GetGoalInvestmentsByUserParams) ([]generated.GoalInvestment, error)
	GetGoalInvestmentById(ctx context.Context, arg generated.GetGoalInvestmentByIdParams) (generated.GoalInvestment, error)
	UpdateGoalInvestment(ctx context.Context, arg generated.UpdateGoalInvestmentParams) (generated.GoalInvestment, error)
	DeleteGoalInvestment(ctx context.Context, arg generated.DeleteGoalInvestmentParams) error
	GetActiveSipRulesByUser(ctx context.Context, userID string) ([]generated.GetActiveSipRulesByUserRow, error)
	SetGoalInvestmentCurrentValue(ctx context.Context, arg generated.SetGoalInvestmentCurrentValueParams) (generated.GoalInvestment, error)
	SumCurrentValueByGoal(ctx context.Context, goalID pgtype.UUID) (pgtype.Numeric, error)
	CreateGoalTransaction(ctx context.Context, arg generated.CreateGoalTransactionParams) (generated.GoalTransaction, error)
	GetGoalTransactionsByInvestment(ctx context.Context, investmentID pgtype.UUID) ([]generated.GoalTransaction, error)
	GetGoalTransactionsByGoal(ctx context.Context, goalID pgtype.UUID) ([]generated.GoalTransaction, error)
	DeleteGoalTransaction(ctx context.Context, id pgtype.UUID) error
	SumGoalTransactionsByInvestment(ctx context.Context, investmentID pgtype.UUID) (pgtype.Numeric, error)
	SumGoalTransactionsByGoal(ctx context.Context, goalID pgtype.UUID) (pgtype.Numeric, error)
}

// investmentRepository is the interface InvestmentService depends on.
type investmentRepository interface {
	CreateNewGoal(ctx context.Context, payload *CreateGoalReq, clerkId string) (*Goal, error)
	GetGoalsWithFilter(ctx context.Context, params *GetGoalsWithFilter, clerkID string) ([]Goal, error)
	GetGoalById(ctx context.Context, param *GetGoalById, clerkID string) (*Goal, error)
	DeleteGoal(ctx context.Context, goalID uuid.UUID, clerkID string) error
	UpdateGoal(ctx context.Context, goalID uuid.UUID, userID string, params *UpdateGoals) (*Goal, error)
	CreateGoalInvestment(ctx context.Context, payload *CreateGoalInvestmentReq, clerkID string) (*GoalInvestment, error)
	GetGoalInvestments(ctx context.Context, params *GetGoalInvestmentsReq, clerkID string) ([]GoalInvestment, error)
	GetGoalInvestmentById(ctx context.Context, id uuid.UUID, clerkID string) (*GoalInvestment, error)
	UpdateGoalInvestment(ctx context.Context, id uuid.UUID, clerkID string, payload *UpdateGoalInvestmentReq) (*GoalInvestment, error)
	DeleteGoalInvestment(ctx context.Context, id uuid.UUID, clerkID string) error
	LinkTransaction(ctx context.Context, payload *LinkTransactionReq, clerkID string) (*GoalTransaction, error)
	UnlinkTransaction(ctx context.Context, goalTransactionID uuid.UUID, clerkID string) error
	GetGoalTransactionsByInvestment(ctx context.Context, investmentID uuid.UUID) ([]GoalTransaction, error)
	GetGoalTransactionsByGoal(ctx context.Context, goalID uuid.UUID) ([]GoalTransaction, error)
	RecalculateInvestmentValue(ctx context.Context, investmentID uuid.UUID, clerkID string) error
	GetActiveSipRules(ctx context.Context, clerkID string) ([]generated.GetActiveSipRulesByUserRow, error)
	AutoLinkTransactions(ctx context.Context, clerkID string, txnIDs []uuid.UUID) (*InvestmentAutoLinkResult, error)
}

// investmentTaskService is the narrow interface InvestmentService needs from tasks.TaskService.
type investmentTaskService interface {
	EnqueueInvestmentAutoLink(ctx context.Context, payload tasks.InvestmentAutoLinkPayload, logger *zerolog.Logger) error
}

// Compile-time check: *generated.Queries must satisfy investmentQuerier.
var _ investmentQuerier = (*generated.Queries)(nil)
