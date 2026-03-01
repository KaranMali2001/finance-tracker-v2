package account

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
)

type BalanceUpdater struct {
	queries balanceQuerier
}

func NewBalanceUpdater(q balanceQuerier) *BalanceUpdater {
	return &BalanceUpdater{queries: q}
}

func (b *BalanceUpdater) Apply(ctx context.Context, userID string, accountID uuid.UUID, txnType string, amount float64) error {
	incomeDelta, expenseDelta, balanceDelta := computeDeltas(txnType, amount)
	if err := b.queries.AdjustUserLifetimeMetrics(ctx, generated.AdjustUserLifetimeMetricsParams{
		ClerkID:      userID,
		IncomeDelta:  utils.Float64PtrToNum(&incomeDelta),
		ExpenseDelta: utils.Float64PtrToNum(&expenseDelta),
	}); err != nil {
		return err
	}
	return b.queries.AdjustAccountBalance(ctx, generated.AdjustAccountBalanceParams{
		ID:     utils.UUIDToPgtype(accountID),
		UserID: userID,
		Delta:  utils.Float64PtrToNum(&balanceDelta),
	})
}

func (b *BalanceUpdater) ApplyBatch(ctx context.Context, userID string, accountID uuid.UUID, incomeDelta, expenseDelta, balanceDelta float64) error {
	if incomeDelta == 0 && expenseDelta == 0 && balanceDelta == 0 {
		return nil
	}
	if err := b.queries.AdjustUserLifetimeMetrics(ctx, generated.AdjustUserLifetimeMetricsParams{
		ClerkID:      userID,
		IncomeDelta:  utils.Float64PtrToNum(&incomeDelta),
		ExpenseDelta: utils.Float64PtrToNum(&expenseDelta),
	}); err != nil {
		return err
	}
	return b.queries.AdjustAccountBalance(ctx, generated.AdjustAccountBalanceParams{
		ID:     utils.UUIDToPgtype(accountID),
		UserID: userID,
		Delta:  utils.Float64PtrToNum(&balanceDelta),
	})
}

func computeDeltas(txnType string, amount float64) (incomeDelta, expenseDelta, balanceDelta float64) {
	switch txnType {
	case "CREDIT", "INCOME", "REFUND", "INVESTMENT":
		return amount, 0, amount
	case "DEBIT", "SUBSCRIPTION":
		return 0, amount, -amount
	}
	return 0, 0, 0
}
