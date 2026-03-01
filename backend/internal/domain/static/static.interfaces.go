package static

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
)

// staticQuerier is the narrow slice of generated.Queries that StaticRepository needs.
type staticQuerier interface {
	GetBanks(ctx context.Context) ([]generated.Bank, error)
	GetCategories(ctx context.Context) ([]generated.Category, error)
	GetMerchants(ctx context.Context) ([]generated.Merchant, error)
}

// Compile-time check: *generated.Queries must satisfy staticQuerier.
var _ staticQuerier = (*generated.Queries)(nil)

// staticRepository is the interface StaticService depends on.
type staticRepository interface {
	GetBanks(ctx context.Context) ([]Bank, error)
	GetCategories(ctx context.Context) ([]Categories, error)
	GetMerchants(ctx context.Context) ([]Merchants, error)
}
