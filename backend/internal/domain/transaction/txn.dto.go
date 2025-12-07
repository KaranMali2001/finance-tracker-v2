package transaction

import (
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type TxnType string

const (
	TxnTypeDebit        TxnType = "DEBIT"
	TxnTypeCredit       TxnType = "CREDIT"
	TxnTypeSubscription TxnType = "SUBSCRIPTION"
	TxnTypeInvestment   TxnType = "INVESTMENT"
	TxnTypeIncome       TxnType = "INCOME"
	TxnTypeRefund       TxnType = "REFUND"
)

type Trasaction struct {
	Id              string  `json:"id,omitempty"`
	UserId          string  `json:"user_id,omitempty"`
	AccountId       string  `json:"account_id,omitempty"`
	AccountNumber   string  `json:"account_number,omitempty"`
	AccountType     string  `json:"account_type,omitempty"`
	AccountName     string  `json:"account_name,omitempty"`
	ToAccountId     *string `json:"to_account_id,omitempty"`
	ToAccountNumber string  `json:"to_account_number,omitempty"`

	ToAccountName string `json:"to_account_name,omitempty"`

	CategoryId   *string `json:"category_id,omitempty"`
	CategoryName *string `json:"category_name,omitempty"`

	MerchantId      *string    `json:"merchant_id,omitempty"`
	MerchantName    *string    `json:"merchant_name,omitempty"`
	Type            TxnType    `json:"type,omitempty"`
	Amount          float64    `json:"amount,omitempty"`
	Description     *string    `json:"description,omitempty"`
	Notes           *string    `json:"notes,omitempty"`
	Tags            *string    `json:"tags,omitempty"`
	SmsId           *string    `json:"sms_id,omitempty"`
	SmsMessage      *string    `json:"sms_message,omitempty"`
	PaymentMethod   *string    `json:"payment_method,omitempty"`
	ReferenceNumber *string    `json:"reference_number,omitempty"`
	IsRecurring     bool       `json:"is_recurring,omitempty"`
	IsExcluded      *bool      `json:"is_excluded,omitempty"`
	IsCash          *bool      `json:"is_cash,omitempty"`
	DeletedAt       *time.Time `json:"deleted_at,omitempty"`
	DeletedBy       *string    `json:"deleted_by,omitempty"`
	CreatedAt       time.Time  `json:"created_at,omitempty"`
	UpdatedAt       time.Time  `json:"updated_at,omitempty"`
}

type CreateTxnReq struct {
	UserId          string     `json:"user_id,omitempty"`
	AccountId       uuid.UUID  `json:"account_id" validate:"required"`
	CategoryId      *uuid.UUID `json:"category_id,omitempty"`
	MerchantId      *uuid.UUID `json:"merchant_id,omitempty"`
	Type            TxnType    `json:"type,omitempty"`
	Amount          float64    `json:"amount,omitempty"`
	Description     *string    `json:"description,omitempty"`
	Notes           *string    `json:"notes,omitempty"`
	Tags            *string    `json:"tags,omitempty"`
	SmsId           *uuid.UUID `json:"sms_id,omitempty"`
	PaymentMethod   *string    `json:"payment_method,omitempty"`
	ReferenceNumber *string    `json:"reference_number,omitempty"`
	IsRecurring     bool       `json:"is_recurring,omitempty"`
	TransactionDate *time.Time `json:"transaction_date,omitempty"`
}

func (c *CreateTxnReq) Validate() error {
	return validator.New().Struct(c)
}

type GetTxnsWithFiltersReq struct {
	AccountId  uuid.UUID `query:"account_id"`
	CategoryId uuid.UUID `query:"category_id"`
	MerchantId uuid.UUID `query:"merchant_id"`
}

func (g *GetTxnsWithFiltersReq) Validate() error {
	return validator.New().Struct(g)
}

type SoftDeleteTxnsReq struct {
	DeletedBy string   `json:"deleted_by,omitempty"`
	Ids       []string `json:"ids" validate:"required,min=1,dive,required"`
}

func (s *SoftDeleteTxnsReq) Validate() error {
	return validator.New().Struct(s)
}

type ParseTxnImgReq struct{}

func (s *ParseTxnImgReq) Validate() error {
	return nil
}

type UpdateTxnReq struct {
	Id              string     `json:"id" validate:"required"`
	CategoryId      *uuid.UUID `json:"category_id,omitempty"`
	MerchantId      *uuid.UUID `json:"merchant_id,omitempty"`
	Amount          *float64   `json:"amount,omitempty"`
	Description     *string    `json:"description,omitempty"`
	TransactionDate *time.Time `json:"transaction_date,omitempty"`
	Type            *TxnType   `json:"type,omitempty"`
}

func (u *UpdateTxnReq) Validate() error {
	return validator.New().Struct(u)
}

type ParsedTxnRes struct {
	Amount            float64    `json:"amount,omitempty"`
	AccountNum        *string    `json:"account_num,omitempty"`
	CategoryId        *string    `json:"category_id,omitempty"`
	MerchantId        *string    `json:"merchant_id,omitempty"`
	Type              string     `json:"type,omitempty"`
	Description       *string    `json:"description,omitempty"`
	Notes             *string    `json:"notes,omitempty"`
	Tags              *string    `json:"tags,omitempty"`
	PaymentMethod     *string    `json:"payment_method,omitempty"`
	ReferenceNumber   *string    `json:"reference_number,omitempty"`
	TransactionDate   *time.Time `json:"transaction_date,omitempty"`
	TransactionTime   *time.Time `json:"transaction_time,omitempty"`
	TransactionType   *string    `json:"transaction_type,omitempty"`
	TransactionAmount *float64   `json:"transaction_amount,omitempty"`
}
