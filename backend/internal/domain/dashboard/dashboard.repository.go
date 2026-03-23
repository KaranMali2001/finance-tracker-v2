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

func (r *DashboardRepository) GetDashboard(ctx context.Context, clerkID string, dateFrom, dateTo string) (*DashboardRes, error) {
	fromTs, err := time.Parse("2006-01-02", dateFrom)
	if err != nil {
		return nil, fmt.Errorf("invalid date_from: %w", err)
	}
	toTs, err := time.Parse("2006-01-02", dateTo)
	if err != nil {
		return nil, fmt.Errorf("invalid date_to: %w", err)
	}

	from := utils.TimestampToPgtype(fromTs)
	to := utils.TimestampToPgtype(toTs)

	var (
		wg       sync.WaitGroup
		mu       sync.Mutex
		firstErr error
		res      DashboardRes
	)

	setErr := func(err error) {
		mu.Lock()
		if firstErr == nil {
			firstErr = err
		}
		mu.Unlock()
	}

	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := r.queries.GetNetWorthTrend(ctx, generated.GetNetWorthTrendParams{
			UserID: clerkID, TransactionDate: from, TransactionDate_2: to,
		})
		if err != nil {
			setErr(err)
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
		mu.Lock()
		res.NetWorthTrend = points
		mu.Unlock()
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := r.queries.GetSpendByCategory(ctx, generated.GetSpendByCategoryParams{
			UserID: clerkID, TransactionDate: from, TransactionDate_2: to,
		})
		if err != nil {
			setErr(err)
			return
		}
		cats := make([]CategorySpend, 0, len(rows))
		for _, row := range rows {
			cats = append(cats, CategorySpend{CategoryName: row.CategoryName, TotalAmount: utils.NumericToFloat64(row.TotalAmount)})
		}
		mu.Lock()
		res.SpendByCategory = cats
		mu.Unlock()
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		row, err := r.queries.GetBudgetHealth(ctx, generated.GetBudgetHealthParams{
			ClerkID: clerkID, TransactionDate: from, TransactionDate_2: to,
		})
		if err != nil {
			setErr(err)
			return
		}
		monthlyBudget := utils.NumericToFloat64(row.MonthlyBudget)
		months := int32(1)
		if row.MonthsInRange > 0 {
			months = row.MonthsInRange
		}
		mu.Lock()
		res.BudgetHealth = BudgetHealthData{
			TotalSpent:       utils.NumericToFloat64(row.TotalSpent),
			TransactionCount: row.TransactionCount,
			MonthsInRange:    row.MonthsInRange,
			MonthlyBudget:    monthlyBudget,
			ScaledBudget:     monthlyBudget * float64(months),
		}
		mu.Unlock()
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := r.queries.GetGoalProgress(ctx, generated.GetGoalProgressParams{
			UserID: clerkID, TransactionDate: from, TransactionDate_2: to,
		})
		if err != nil {
			setErr(err)
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
		mu.Lock()
		res.GoalProgress = items
		mu.Unlock()
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := r.queries.GetAccountBalances(ctx, generated.GetAccountBalancesParams{
			UserID: clerkID, TransactionDate: from, TransactionDate_2: to,
		})
		if err != nil {
			setErr(err)
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
		mu.Lock()
		res.AccountBalances = items
		mu.Unlock()
	}()

	wg.Add(1)
	go func() {
		defer wg.Done()
		rows, err := r.queries.GetPortfolioMix(ctx, clerkID)
		if err != nil {
			setErr(err)
			return
		}
		items := make([]PortfolioItem, 0, len(rows))
		for _, p := range rows {
			items = append(items, PortfolioItem{InvestmentType: p.InvestmentType, TotalValue: utils.NumericToFloat64(p.TotalValue)})
		}
		mu.Lock()
		res.PortfolioMix = items
		mu.Unlock()
	}()

	wg.Wait()

	if firstErr != nil {
		return nil, firstErr
	}
	return &res, nil
}
