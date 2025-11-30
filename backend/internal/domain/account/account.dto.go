package account

import (
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type CreateAccountReq struct {
	AccountNumber string    `json:"account_number" validate:"required"`
	AccountName   string    `json:"account_name" validate:"required"`
	AccountType   string    `json:"account_type" validate:"required"`
	IsPrimary     *bool     `json:"is_primary" validate:"required"`
	BankId        uuid.UUID `json:"bank_id" validate:"required"`
}
type GetAccountReq struct {
	AccountId uuid.UUID `param:"account_id" validate:"required"`
}
type DeleteAccountReq struct {
	AccountId uuid.UUID `param:"account_id" validate:"required"`
}
type GetAccountByUserId struct{}
type UpdateAccountReq struct {
	AccountId      uuid.UUID  `json:"account_id" validate:"required"`
	AccountNumber  *string    `json:"account_number,omitempty"`
	AccountName    *string    `json:"account_name,omitempty"`
	AccountType    *string    `json:"account_type,omitempty"`
	BankId         *uuid.UUID `json:"bank_id,omitempty"`
	IsPrimary      *bool      `json:"is_primary,omitempty"`
	CurrentBalence *float64   `json:"current_balence,omitempty"`
}
type Bank struct {
	Id        string    `json:"id,omitempty"`
	Name      string    `json:"name,omitempty"`
	Code      string    `json:"code,omitempty"`
	IsActive  bool      `json:"is_active,omitempty"`
	CreatedAt time.Time `json:"created_at,omitempty"`
	UpdatedAt time.Time `json:"updated_at,omitempty"`
}
type Account struct {
	Id             string    `json:"id,omitempty"`
	AccountNumber  string    `json:"account_number,omitempty"`
	AccountName    string    `json:"account_name,omitempty"`
	AccountType    string    `json:"account_type,omitempty"`
	IsPrimary      bool      `json:"is_primary,omitempty"`
	IsActive       bool      `json:"is_active,omitempty"`
	BankId         string    `json:"bank_id,omitempty"`
	UserId         string    `json:"user_id,omitempty"`
	CurrentBalence float64   `json:"current_balence"`
	Bank           *Bank     `json:"bank,omitempty"`
	CreatedAt      time.Time `json:"created_at,omitempty"`
	UpdatedAt      time.Time `json:"updated_at,omitempty"`
}

func (c *CreateAccountReq) Validate() error {
	return validator.New().Struct(c)
}
func (u *GetAccountReq) Validate() error {
	return validator.New().Struct(u)
}
func (u *GetAccountByUserId) Validate() error {
	return nil
}
func (u *UpdateAccountReq) Validate() error {
	return validator.New().Struct(u)
}
func (u *DeleteAccountReq) Validate() error {
	return validator.New().Struct(u)
}
