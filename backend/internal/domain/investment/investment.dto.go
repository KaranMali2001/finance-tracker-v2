package investment

import (
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

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

func (c *CreateGoalReq) Validate() error {
	return validator.New().Struct(c)
}

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

func (c *UpdateGoals) Validate() error {
	return validator.New().Struct(c)
}

func (c *GetGoalsWithFilter) Validate() error {
	return validator.New().Struct(c)
}

func (c *GetGoalById) Validate() error {
	return validator.New().Struct(c)
}
