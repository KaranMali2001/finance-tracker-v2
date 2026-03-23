package dashboard

import (
	"context"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
)

type dashboardQuerier interface {
	GetNetWorthTrend(ctx context.Context, arg generated.GetNetWorthTrendParams) ([]generated.GetNetWorthTrendRow, error)
	GetSpendByCategory(ctx context.Context, arg generated.GetSpendByCategoryParams) ([]generated.GetSpendByCategoryRow, error)
	GetBudgetHealth(ctx context.Context, arg generated.GetBudgetHealthParams) (generated.GetBudgetHealthRow, error)
	GetGoalProgress(ctx context.Context, arg generated.GetGoalProgressParams) ([]generated.GetGoalProgressRow, error)
	GetAccountBalances(ctx context.Context, arg generated.GetAccountBalancesParams) ([]generated.GetAccountBalancesRow, error)
	GetPortfolioMix(ctx context.Context, userID string) ([]generated.GetPortfolioMixRow, error)
}

type dashboardRepository interface {
	GetDashboard(ctx context.Context, clerkID string, dateFrom, dateTo string) (*DashboardRes, error)
}

var _ dashboardQuerier = (*generated.Queries)(nil)
