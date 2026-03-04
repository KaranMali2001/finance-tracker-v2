package transaction

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/static"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/user"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rs/zerolog"
)

// txnQuerier is the narrow slice of generated.Queries that TxnRepository needs.
// WithTx is included because the repository creates tx-scoped queriers internally.
type txnQuerier interface {
	WithTx(tx pgx.Tx) *generated.Queries
	CreateTxn(ctx context.Context, arg generated.CreateTxnParams) (generated.Transaction, error)
	GetTxnsWithFilters(ctx context.Context, arg generated.GetTxnsWithFiltersParams) ([]generated.GetTxnsWithFiltersRow, error)
	SoftDeleteTxns(ctx context.Context, arg generated.SoftDeleteTxnsParams) ([]generated.Transaction, error)
	UpdateTxn(ctx context.Context, arg generated.UpdateTxnParams) (pgtype.UUID, error)
}

// txnRepository is the interface TxnService depends on.
type txnRepository interface {
	CreateTxns(ctx context.Context, clerkId string, payload *CreateTxnReq) (*Transaction, error)
	GetTxnsWithFilters(ctx context.Context, clerkId string, filters *GetTxnsWithFiltersReq) ([]*Transaction, error)
	SoftDeleteTxns(ctx context.Context, clerkId string, payload *SoftDeleteTxnsReq) ([]*Transaction, error)
	UpdateTxn(ctx context.Context, clerkId string, payload *UpdateTxnReq) (*Transaction, error)
}

// userProvider is the local interface for cross-module user dependency.
// Defined here so the transaction package owns its own contract.
// *user.UserRepository satisfies this implicitly.
type userProvider interface {
	GetUserByClerkId(ctx context.Context, clerkId string) (*user.User, error)
	UpdateUserInternal(ctx context.Context, payload *user.UpdateUserInternal, clerkId string) (*user.User, error)
}

// staticProvider is the local interface for cross-module static dependency.
// Defined here so the transaction package owns its own contract.
// *static.StaticRepository satisfies this implicitly.
type staticProvider interface {
	GetCategories(ctx context.Context) ([]static.Categories, error)
	GetMerchants(ctx context.Context) ([]static.Merchants, error)
}

// balanceApplier is the local interface for cross-module balance dependency.
// *account.BalanceUpdater satisfies this implicitly.
type balanceApplier interface {
	Apply(ctx context.Context, userID string, accountID uuid.UUID, txnType string, amount float64) error
	ApplyBatch(ctx context.Context, userID string, accountID uuid.UUID, incomeDelta, expenseDelta, balanceDelta float64) error
}

// txnAutoLinker is the subset of investment.InvestmentService used to enqueue
// investment auto-link jobs after a transaction is created.
type txnAutoLinker interface {
	EnqueueAutoLinkCtx(ctx context.Context, clerkID string, txnIDs []uuid.UUID, log *zerolog.Logger) error
}

// Compile-time check: *generated.Queries must satisfy txnQuerier.
var _ txnQuerier = (*generated.Queries)(nil)
