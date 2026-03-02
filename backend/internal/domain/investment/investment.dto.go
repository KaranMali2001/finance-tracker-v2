package investment

import (
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

// ── Investment types (app-layer constants, no DB enum) ───────────────────────

type InvestmentType string

const (
	InvestmentTypeMutualFund InvestmentType = "mutual_fund"
	InvestmentTypeStock      InvestmentType = "stock"
	InvestmentTypeFD         InvestmentType = "fd"
	InvestmentTypePPF        InvestmentType = "ppf"
	InvestmentTypeNPS        InvestmentType = "nps"
	InvestmentTypeGold       InvestmentType = "gold"
	InvestmentTypeRealEstate InvestmentType = "real_estate"
	InvestmentTypeCrypto     InvestmentType = "crypto"
	InvestmentTypeOther      InvestmentType = "other"
)

type ContributionType string

const (
	ContributionTypeOneTime ContributionType = "one_time"
	ContributionTypeSIP     ContributionType = "sip"
)

// ── Goal DTOs ────────────────────────────────────────────────────────────────

type Goal struct {
	Id            uuid.UUID `json:"id,omitempty"`
	Name          string    `json:"name,omitempty"`
	TargetAmount  float64   `json:"target_amount,omitempty"`
	CurrentAmount float64   `json:"current_amount,omitempty"`
	TargetDate    time.Time `json:"target_date,omitempty"`
	Status        string    `json:"status,omitempty"`
	Priority      uint8     `json:"priority,omitempty"`
	CreatedAt     time.Time `json:"created_at,omitempty"`
	UpdatedAt     time.Time `json:"updated_at,omitempty"`
	AchievedAt    time.Time `json:"achieved_at,omitempty"`
}

type CreateGoalReq struct {
	Name          string   `json:"name" validate:"required"`
	TargetAmount  float64  `json:"target_amount" validate:"required"`
	CurrentAmount *float64 `json:"current_amount,omitempty"`
	TargetDate    string   `json:"target_date" validate:"required"`
	Status        *string  `json:"status,omitempty"`
	Priority      *uint    `json:"priority,omitempty"`
}

func (c *CreateGoalReq) Validate() error { return validator.New().Struct(c) }

type GetGoalsWithFilter struct {
	Status                  *string    `query:"status"`
	TargetDateBefore        *time.Time `query:"target_date_before"`
	TargetDateAfter         *time.Time `query:"target_date_after"`
	TargetAmountLessThan    *float64   `query:"target_amount_less_than"`
	TargetAmountGreaterThan *float64   `query:"target_amount_greater_than"`
	Priority                *uint8     `query:"priority"`
	CreatedAtBefore         *time.Time `query:"created_at_before"`
	CreatedAtAfter          *time.Time `query:"created_at_after"`
}

type GetGoalById struct {
	Id uuid.UUID `param:"id" validate:"required"`
}

type UpdateGoals struct {
	Id            uuid.UUID  `param:"id" validate:"required"`
	Status        *string    `json:"status,omitempty"`
	TargetDate    *string    `json:"target_date,omitempty"`
	Priority      *uint8     `json:"priority,omitempty"`
	TargetAmount  *float64   `json:"target_amount,omitempty"`
	CurrentAmount *float64   `json:"current_amount,omitempty"`
	AchievedAt    *time.Time `json:"achieved_at,omitempty"`
	Name          *string    `json:"name,omitempty"`
}

type DeleteGoalReq struct {
	Id uuid.UUID `param:"id" validate:"required"`
}

func (c *UpdateGoals) Validate() error        { return validator.New().Struct(c) }
func (c *GetGoalsWithFilter) Validate() error { return validator.New().Struct(c) }
func (c *GetGoalById) Validate() error        { return validator.New().Struct(c) }
func (c *DeleteGoalReq) Validate() error      { return validator.New().Struct(c) }

// ── GoalInvestment DTOs ──────────────────────────────────────────────────────

type GoalInvestment struct {
	ID                  uuid.UUID  `json:"id"`
	GoalID              *uuid.UUID `json:"goal_id,omitempty"`
	UserID              string     `json:"user_id"`
	InvestmentType      string     `json:"investment_type"`
	ContributionType    string     `json:"contribution_type"`
	ContributionValue   float64    `json:"contribution_value"`
	CurrentValue        float64    `json:"current_value"`
	AccountID           uuid.UUID  `json:"account_id"`
	AutoInvest          bool       `json:"auto_invest"`
	InvestmentDay       *int       `json:"investment_day,omitempty"`
	MerchantNamePattern *string    `json:"merchant_name_pattern,omitempty"`
	DescriptionPattern  *string    `json:"description_pattern,omitempty"`
	CreatedAt           time.Time  `json:"created_at"`
	UpdatedAt           time.Time  `json:"updated_at"`
}

type CreateGoalInvestmentReq struct {
	GoalID              *uuid.UUID `json:"goal_id,omitempty"`
	AccountID           uuid.UUID  `json:"account_id" validate:"required"`
	InvestmentType      string     `json:"investment_type" validate:"required,oneof=mutual_fund stock fd ppf nps gold real_estate crypto other"`
	ContributionType    string     `json:"contribution_type" validate:"required,oneof=one_time sip"`
	ContributionValue   float64    `json:"contribution_value" validate:"required,gt=0"`
	CurrentValue        *float64   `json:"current_value,omitempty"`
	AutoInvest          *bool      `json:"auto_invest,omitempty"`
	InvestmentDay       *int       `json:"investment_day,omitempty"`
	MerchantNamePattern *string    `json:"merchant_name_pattern,omitempty"`
	DescriptionPattern  *string    `json:"description_pattern,omitempty"`
}

func (c *CreateGoalInvestmentReq) Validate() error { return validator.New().Struct(c) }

type GetGoalInvestmentsReq struct {
	GoalID           *uuid.UUID `query:"goal_id"`
	ContributionType *string    `query:"contribution_type"`
	InvestmentType   *string    `query:"investment_type"`
}

func (c *GetGoalInvestmentsReq) Validate() error { return validator.New().Struct(c) }

type GetGoalInvestmentByIDReq struct {
	ID uuid.UUID `param:"id" validate:"required"`
}

func (c *GetGoalInvestmentByIDReq) Validate() error { return validator.New().Struct(c) }

type UpdateGoalInvestmentReq struct {
	ID                  uuid.UUID `param:"id" validate:"required"`
	InvestmentType      *string   `json:"investment_type,omitempty" validate:"omitempty,oneof=mutual_fund stock fd ppf nps gold real_estate crypto other"`
	ContributionType    *string   `json:"contribution_type,omitempty" validate:"omitempty,oneof=one_time sip"`
	ContributionValue   *float64  `json:"contribution_value,omitempty" validate:"omitempty,gt=0"`
	CurrentValue        *float64  `json:"current_value,omitempty"`
	AutoInvest          *bool     `json:"auto_invest,omitempty"`
	InvestmentDay       *int      `json:"investment_day,omitempty"`
	MerchantNamePattern *string   `json:"merchant_name_pattern,omitempty"`
	DescriptionPattern  *string   `json:"description_pattern,omitempty"`
}

func (c *UpdateGoalInvestmentReq) Validate() error { return validator.New().Struct(c) }

type DeleteGoalInvestmentReq struct {
	ID uuid.UUID `param:"id" validate:"required"`
}

func (c *DeleteGoalInvestmentReq) Validate() error { return validator.New().Struct(c) }

// ── GoalTransaction DTOs ─────────────────────────────────────────────────────

type GoalTransaction struct {
	ID              uuid.UUID  `json:"id"`
	GoalID          *uuid.UUID `json:"goal_id,omitempty"`
	InvestmentID    uuid.UUID  `json:"investment_id"`
	TransactionID   uuid.UUID  `json:"transaction_id"`
	Amount          float64    `json:"amount"`
	ExpectedAmount  *float64   `json:"expected_amount,omitempty"`
	Source          string     `json:"source"`
	TransactionDate time.Time  `json:"transaction_date"`
	Notes           *string    `json:"notes,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}

type LinkTransactionReq struct {
	InvestmentID    uuid.UUID `json:"investment_id" validate:"required"`
	TransactionID   uuid.UUID `json:"transaction_id" validate:"required"`
	Amount          float64   `json:"amount" validate:"required,gt=0"`
	ExpectedAmount  *float64  `json:"expected_amount,omitempty"`
	TransactionDate string    `json:"transaction_date" validate:"required"`
	Notes           *string   `json:"notes,omitempty"`
}

func (c *LinkTransactionReq) Validate() error { return validator.New().Struct(c) }

type UnlinkTransactionReq struct {
	ID uuid.UUID `param:"id" validate:"required"`
}

func (c *UnlinkTransactionReq) Validate() error { return validator.New().Struct(c) }

type GetGoalTransactionsByInvestmentReq struct {
	InvestmentID uuid.UUID `param:"investment_id" validate:"required"`
}

func (c *GetGoalTransactionsByInvestmentReq) Validate() error { return validator.New().Struct(c) }

type GetGoalTransactionsByGoalReq struct {
	GoalID uuid.UUID `param:"goal_id" validate:"required"`
}

func (c *GetGoalTransactionsByGoalReq) Validate() error { return validator.New().Struct(c) }

// ── Auto-link job DTOs ───────────────────────────────────────────────────────

type InvestmentAutoLinkPayload struct {
	UserID         string      `json:"user_id"`
	TransactionIDs []uuid.UUID `json:"transaction_ids"`
}

type InvestmentAutoLinkItemResult struct {
	TransactionID string  `json:"transaction_id"`
	Status        string  `json:"status"`
	MatchedRuleID *string `json:"matched_rule_id,omitempty"`
	MatchScore    float64 `json:"match_score,omitempty"`
	Error         *string `json:"error,omitempty"`
}

type InvestmentAutoLinkResult struct {
	TotalProcessed int                            `json:"total_processed"`
	Matched        int                            `json:"matched"`
	Unmatched      int                            `json:"unmatched"`
	Errors         int                            `json:"errors"`
	Items          []InvestmentAutoLinkItemResult `json:"items"`
}

type EnqueueAutoLinkReq struct {
	TransactionIDs []uuid.UUID `json:"transaction_ids" validate:"required,min=1"`
}

func (c *EnqueueAutoLinkReq) Validate() error { return validator.New().Struct(c) }
