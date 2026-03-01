package user

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

// userQuerier is the narrow slice of generated.Queries that UserRepository needs.
// WithTx is included because the repository creates tx-scoped queriers internally.
type userQuerier interface {
	WithTx(tx pgx.Tx) *generated.Queries
	UpdateUser(ctx context.Context, arg generated.UpdateUserParams) (generated.User, error)
	GetAuthUser(ctx context.Context, clerkID string) (generated.User, error)
	UpdateUserInternal(ctx context.Context, arg generated.UpdateUserInternalParams) (generated.User, error)
	GetUserByApiKey(ctx context.Context, apiKey pgtype.Text) (generated.User, error)
}

// userRepository is the interface UserService depends on.
type userRepository interface {
	UpdateUser(ctx context.Context, updateUser *UpdateUserReq, clerkId string) (*User, error)
	GetUserByClerkId(ctx context.Context, clerkId string) (*User, error)
	UpdateUserInternal(ctx context.Context, payload *UpdateUserInternal, clerkId string) (*User, error)
	GetReconciliationThreshold(ctx context.Context, clerkId string) (int, error)
	GetUserByApiKey(ctx context.Context, apiKey string) (*User, error)
}

// Compile-time check: *generated.Queries must satisfy userQuerier.
var _ userQuerier = (*generated.Queries)(nil)
