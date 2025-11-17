package auth

import (
	"time"

	"github.com/go-playground/validator/v10"
)

type ClerkUserCreatedWebhook struct {
	Data struct {
		ID             string `json:"id"`
		EmailAddresses []struct {
			EmailAddress string `json:"email_address"`
		} `json:"email_addresses"`
	} `json:"data"`
	EventType string `json:"type"`
}

type UserResponse struct {
	Id        string    `json:"id"`
	Email     string    `json:"email"`
	IsActive  bool      `json:"is_active"`
	ClerkId   string    `json:"clerk_id,omitempty"`
	CreatedAt time.Time `json:"created_at,omitempty"`
	UpdatedAt time.Time `json:"updated_at,omitempty"`
}
type UserCreateRequest struct {
	Email   string `json:"email" validate:"required,email"`
	ClerkId string `json:"clerk_id" validate:"required"`
}

func (u *UserCreateRequest) Validate() error {
	validate := validator.New()
	return validate.Struct(u)
}

type GetAuthUserRequest struct{}

// GetAuthUserResponse represents the authenticated user's information
type GetAuthUserResponse struct {
	Id              string    `json:"id,omitempty" example:"123e4567-e89b-12d3-a456-426614174000"`
	Email           string    `json:"email,omitempty" example:"user@example.com"`
	LifetimeIncome  *float64  `json:"lifetime_income,omitempty" example:"50000.00"`
	LifetimeExpense *float64  `json:"lifetime_expense,omitempty" example:"30000.00"`
	UseLlmParsing   *bool     `json:"use_llm_parsing,omitempty" example:"true"`
	LlmParseCredits *int      `json:"llm_parse_credits,omitempty" example:"100"`
	IsActive        *bool     `json:"is_active,omitempty" example:"true"`
	DatabaseUrl     *string   `json:"database_url,omitempty" example:"postgresql://user:pass@localhost/db"`
	CreatedAt       time.Time `json:"created_at,omitempty" example:"2025-01-02T15:04:05Z"`
	UpdatedAt       time.Time `json:"updated_at,omitempty" example:"2025-01-02T15:04:05Z"`
}

func (u *GetAuthUserRequest) Validate() error {
	return nil
}
