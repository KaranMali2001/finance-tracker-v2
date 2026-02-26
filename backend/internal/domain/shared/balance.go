package shared

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
)

// BalanceUpdater applies account balance and user lifetime metric changes
// atomically for a transaction or a batch of transactions.
// It is safe to share between TxnService and ReconService.
type BalanceUpdater struct {
	queries *generated.Queries
}

func NewBalanceUpdater(q *generated.Queries) *BalanceUpdater {
	return &BalanceUpdater{queries: q}
}

// Apply updates lifetime metrics + account balance for a single transaction.
// Must be called inside a TxManager.WithTx block when atomicity is required.
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

// ApplyBatch applies balance effects for multiple transactions in exactly 2 DB
// calls regardless of batch size. The caller pre-computes the three totals by
// ranging over autoCreateParams before calling this function.
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

// Reverse undoes a single transaction's balance effects (used on soft-delete).
func (b *BalanceUpdater) Reverse(ctx context.Context, userID string, accountID uuid.UUID, txnType string, amount float64) error {
	return b.Apply(ctx, userID, accountID, txnType, -amount)
}

// computeDeltas returns the income, expense, and account balance deltas for a
// given transaction type and amount.
func computeDeltas(txnType string, amount float64) (incomeDelta, expenseDelta, balanceDelta float64) {
	switch txnType {
	case "CREDIT", "INCOME", "REFUND", "INVESTMENT":
		return amount, 0, amount
	case "DEBIT", "SUBSCRIPTION":
		return 0, amount, -amount
	}
	return 0, 0, 0
}
