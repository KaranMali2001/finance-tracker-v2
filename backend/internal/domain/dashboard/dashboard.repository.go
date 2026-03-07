package dashboard

import (
	"context"
	"fmt"
	"sync"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
)

type DashboardRepository struct {
	queries dashboardQuerier
}

func NewDashboardRepository(q dashboardQuerier) *DashboardRepository {
	return &DashboardRepository{queries: q}
}

func send(events chan<- DashboardEvent, card string, data any, err error) {
	ev := DashboardEvent{Card: card, Data: data}
	if err != nil {
		ev.Error = err.Error()
	}
	events <- ev
}

func (r *DashboardRepository) StreamDashboard(ctx context.Context, clerkID string, dateFrom, dateTo string, events chan<- DashboardEvent) {
	fromTs, err := time.Parse("2006-01-02", dateFrom)
	if err != nil {
		send(events, "error", nil, fmt.Errorf("invalid date_from: %w", err))
		return
	}
	toTs, err := time.Parse("2006-01-02", dateTo)
	if err != nil {
		send(events, "error", nil, fmt.Errorf("invalid date_to: %w", err))
		return
	}

	from := utils.TimestampToPgtype(fromTs)
	to := utils.TimestampToPgtype(toTs)

	var wg sync.WaitGroup

	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := r.queries.GetNetWorthTrend(ctx, generated.GetNetWorthTrendParams{
			UserID: clerkID, TransactionDate: from, TransactionDate_2: to,
		})
		if err != nil {
			send(events, "net_worth_trend", nil, err)
			return
		}
		points := make([]NetWorthPoint, 0, len(rows))
		for _, row := range rows {
			var monthStr string
			if row.Month.Valid {
				monthStr = row.Month.Time.Format("2006-01")
			}
			points = append(points, NetWorthPoint{Month: monthStr, RunningNetWorth: utils.NumericToFloat64(row.RunningNetWorth)})
		}
		send(events, "net_worth_trend", points, nil)
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := r.queries.GetSpendByCategory(ctx, generated.GetSpendByCategoryParams{
			UserID: clerkID, TransactionDate: from, TransactionDate_2: to,
		})
		if err != nil {
			send(events, "spend_by_category", nil, err)
			return
		}
		cats := make([]CategorySpend, 0, len(rows))
		for _, row := range rows {
			cats = append(cats, CategorySpend{CategoryName: row.CategoryName, TotalAmount: utils.NumericToFloat64(row.TotalAmount)})
		}
		send(events, "spend_by_category", cats, nil)
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		row, err := r.queries.GetBudgetHealth(ctx, generated.GetBudgetHealthParams{
			ClerkID: clerkID, TransactionDate: from, TransactionDate_2: to,
		})
		if err != nil {
			send(events, "budget_health", nil, err)
			return
		}
		monthlyBudget := utils.NumericToFloat64(row.MonthlyBudget)
		months := int32(1)
		if row.MonthsInRange > 0 {
			months = row.MonthsInRange
		}
		send(events, "budget_health", BudgetHealthData{
			TotalSpent:       utils.NumericToFloat64(row.TotalSpent),
			TransactionCount: row.TransactionCount,
			MonthsInRange:    row.MonthsInRange,
			MonthlyBudget:    monthlyBudget,
			ScaledBudget:     monthlyBudget * float64(months),
		}, nil)
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := r.queries.GetGoalProgress(ctx, generated.GetGoalProgressParams{
			UserID: clerkID, TransactionDate: from, TransactionDate_2: to,
		})
		if err != nil {
			send(events, "goal_progress", nil, err)
			return
		}
		items := make([]GoalProgressItem, 0, len(rows))
		for _, g := range rows {
			var targetDate *time.Time
			if g.TargetDate.Valid {
				t := g.TargetDate.Time
				targetDate = &t
			}
			var status string
			if g.Status.Valid {
				status = g.Status.String
			}
			items = append(items, GoalProgressItem{
				ID:               utils.UUIDToString(g.ID),
				Name:             g.Name,
				TargetAmount:     utils.NumericToFloat64(g.TargetAmount),
				CurrentAmount:    utils.NumericToFloat64(g.CurrentAmount),
				TargetDate:       targetDate,
				Status:           status,
				InvestedInPeriod: utils.NumericToFloat64(g.InvestedInPeriod),
			})
		}
		send(events, "goal_progress", items, nil)
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := r.queries.GetAccountBalances(ctx, generated.GetAccountBalancesParams{
			UserID: clerkID, TransactionDate: from, TransactionDate_2: to,
		})
		if err != nil {
			send(events, "account_balances", nil, err)
			return
		}
		items := make([]AccountBalance, 0, len(rows))
		for _, a := range rows {
			var accName string
			if a.AccountName.Valid {
				accName = a.AccountName.String
			}
			items = append(items, AccountBalance{
				ID:             utils.UUIDToString(a.ID),
				AccountName:    accName,
				AccountType:    a.AccountType,
				CurrentBalance: utils.NumericToFloat64(a.CurrentBalance),
				PeriodIncome:   utils.NumericToFloat64(a.PeriodIncome),
				PeriodExpense:  utils.NumericToFloat64(a.PeriodExpense),
			})
		}
		send(events, "account_balances", items, nil)
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := r.queries.GetPortfolioMix(ctx, clerkID)
		if err != nil {
			send(events, "portfolio_mix", nil, err)
			return
		}
		items := make([]PortfolioItem, 0, len(rows))
		for _, p := range rows {
			items = append(items, PortfolioItem{InvestmentType: p.InvestmentType, TotalValue: utils.NumericToFloat64(p.TotalValue)})
		}
		send(events, "portfolio_mix", items, nil)
	}()

	wg.Wait()
}
