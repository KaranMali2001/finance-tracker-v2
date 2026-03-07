package dashboard

import (
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/validation"
)

type GetDashboardReq struct {
	DateFrom string `query:"date_from"`
	DateTo   string `query:"date_to"`
}

func (r *GetDashboardReq) Validate() error {
	var errs validation.CustomValidationErrors
	if r.DateFrom == "" {
		errs = append(errs, validation.CustomValidationError{Field: "date_from", Message: "is required"})
	} else if _, err := time.Parse("2006-01-02", r.DateFrom); err != nil {
		errs = append(errs, validation.CustomValidationError{Field: "date_from", Message: "must be in YYYY-MM-DD format"})
	}
	if r.DateTo == "" {
		errs = append(errs, validation.CustomValidationError{Field: "date_to", Message: "is required"})
	} else if _, err := time.Parse("2006-01-02", r.DateTo); err != nil {
		errs = append(errs, validation.CustomValidationError{Field: "date_to", Message: "must be in YYYY-MM-DD format"})
	}
	if len(errs) > 0 {
		return errs
	}
	from, _ := time.Parse("2006-01-02", r.DateFrom)
	to, _ := time.Parse("2006-01-02", r.DateTo)
	if from.After(to) {
		return validation.CustomValidationErrors{{Field: "date_from", Message: "must not be after date_to"}}
	}
	return nil
}

type NetWorthPoint struct {
	Month           string  `json:"month"`
	RunningNetWorth float64 `json:"running_net_worth"`
}

type CategorySpend struct {
	CategoryName string  `json:"category_name"`
	TotalAmount  float64 `json:"total_amount"`
}

type BudgetHealthData struct {
	TotalSpent       float64 `json:"total_spent"`
	TransactionCount int32   `json:"transaction_count"`
	MonthsInRange    int32   `json:"months_in_range"`
	MonthlyBudget    float64 `json:"monthly_budget"`
	ScaledBudget     float64 `json:"scaled_budget"`
}

type GoalProgressItem struct {
	ID               string     `json:"id"`
	Name             string     `json:"name"`
	TargetAmount     float64    `json:"target_amount"`
	CurrentAmount    float64    `json:"current_amount"`
	TargetDate       *time.Time `json:"target_date"`
	Status           string     `json:"status"`
	InvestedInPeriod float64    `json:"invested_in_period"`
}

type AccountBalance struct {
	ID             string  `json:"id"`
	AccountName    string  `json:"account_name"`
	AccountType    string  `json:"account_type"`
	CurrentBalance float64 `json:"current_balance"`
	PeriodIncome   float64 `json:"period_income"`
	PeriodExpense  float64 `json:"period_expense"`
}

type PortfolioItem struct {
	InvestmentType string  `json:"investment_type"`
	TotalValue     float64 `json:"total_value"`
}

type DashboardRes struct {
	NetWorthTrend   []NetWorthPoint    `json:"net_worth_trend"`
	SpendByCategory []CategorySpend    `json:"spend_by_category"`
	BudgetHealth    BudgetHealthData   `json:"budget_health"`
	GoalProgress    []GoalProgressItem `json:"goal_progress"`
	AccountBalances []AccountBalance   `json:"account_balances"`
	PortfolioMix    []PortfolioItem    `json:"portfolio_mix"`
}

type DashboardEvent struct {
	Card  string `json:"card"`
	Data  any    `json:"data"`
	Error string `json:"error,omitempty"`
}
