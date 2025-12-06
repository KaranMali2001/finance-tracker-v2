package user

import (
	"time"

	"github.com/go-playground/validator/v10"
)

type UpdateUserReq struct {
	UseLlmParsing   *bool    `json:"use_llm_parsing,omitempty" `
	DatabaseUrl     *string  `json:"database_url,omitempty"`
	LifetimeExpense *float64 `json:"lifetime_expense,omitempty"`
	LifetimeIncome  *float64 `json:"lifetime_income,omitempty"`
}

func (u *UpdateUserReq) Validate() error {
	return validator.New().Struct(u)
}

type User struct {
	Email                        string    `json:"email,omitempty"`
	IsActive                     bool      `json:"is_active,omitempty"`
	ClerkId                      string    `json:"clerk_id,omitempty"`
	CreatedAt                    time.Time `json:"created_at,omitempty"`
	UpdatedAt                    time.Time `json:"updated_at,omitempty"`
	LifetimeExpense              float64   `json:"lifetime_expense,omitempty"`
	LifetimeIncome               float64   `json:"lifetime_income,omitempty"`
	UseLlmParsing                bool      `json:"user_llm_parsing,omitempty"`
	DatabaseUrl                  string    `json:"database_url,omitempty"`
	TransactionImageParseAttempt uint      `json:"transaction_image_parse_attempt,omitempty"`
	TransactionImageParseSuccess uint      `json:"transaction_image_parse_success,omitempty"`
	ApiKey                       string    `json:"api_key,omitempty"`
	QrString                     string    `json:"qr_string,omitempty"`
}

type UpdateUserInternal struct {
	TransactionImageParseAttempt *uint   `json:"transaction_image_parse_attempt,omitempty" validate:"omitempty,min=0"`
	TransactionImageParseSuccess *uint   `json:"transaction_image_parse_success,omitempty" validate:"omitempty,min=0"`
	ApiKey                       *string `json:"api_key,omitempty"`
	QrString                     *string `json:"qr_string,omitempty"`
}
type GenerateApiKeyReq struct{}

func (u *GenerateApiKeyReq) Validate() error {
	return nil
}
