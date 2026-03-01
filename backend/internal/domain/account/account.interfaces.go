package account

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
)

// balanceQuerier is the narrow slice of generated.Queries that BalanceUpdater needs.
type balanceQuerier interface {
	AdjustUserLifetimeMetrics(ctx context.Context, arg generated.AdjustUserLifetimeMetricsParams) error
	AdjustAccountBalance(ctx context.Context, arg generated.AdjustAccountBalanceParams) error
}

// accountQuerier is the narrow slice of generated.Queries that AccRepo needs.
type accountQuerier interface {
	CreateAccount(ctx context.Context, arg generated.CreateAccountParams) (generated.Account, error)
	GetAccountById(ctx context.Context, arg generated.GetAccountByIdParams) (generated.GetAccountByIdRow, error)
	GetAccountsByUserId(ctx context.Context, userID string) ([]generated.GetAccountsByUserIdRow, error)
	UpdateAccount(ctx context.Context, arg generated.UpdateAccountParams) (generated.UpdateAccountRow, error)
	DeleteAccount(ctx context.Context, arg generated.DeleteAccountParams) error
}

// accountRepository is the interface AccService depends on.
type accountRepository interface {
	CreateAccount(ctx context.Context, payload *CreateAccountReq, clerkId string) (*Account, error)
	GetAccountById(ctx context.Context, payload *GetAccountReq, clerkId string) (*Account, error)
	GetAccountsByUserId(ctx context.Context, clerkId string) ([]Account, error)
	UpdateAccount(ctx context.Context, payload *UpdateAccountReq, clerkId string) (*Account, error)
	DeleteAccount(ctx context.Context, payload *DeleteAccountReq, clerkId string) (*Account, error)
}

// Compile-time check: *generated.Queries must satisfy accountQuerier.
var _ accountQuerier = (*generated.Queries)(nil)
