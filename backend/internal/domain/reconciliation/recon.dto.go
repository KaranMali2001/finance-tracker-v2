package reconciliation

import (
	"time"

	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type TxnType string

const (
	CREDIT TxnType = "CREDIT"
	DEBIT  TxnType = "DEBIT"
)

type ParseExcelReq struct {
	StatementPeriodStart time.Time `json:"statement_period_start" validate:"required"`
	StatementPeriodEnd   time.Time `json:"statement_period_end" validate:"required"`
	AccountId            uuid.UUID `json:"account_id" validate:"required"`
	UserId               string    `json:"user_id" validate:"required"`
	FileName             string    `json:"file_name" validate:"required"`
}

func (p *ParseExcelReq) Validate() error {
	return validator.New().Struct(p)
}

type ParsedTxns struct {
	UploadId        uuid.UUID  `json:"upload_id"`
	AccountId       uuid.UUID  `json:"account_id"`
	TxnDate         time.Time  `json:"txn_date"`
	Description     *string    `json:"description"`
	Amount          uint32     `json:"amount"`
	Type            TxnType    `json:"type"`
	ReferenceNumber *string    `json:"reference_number"`
	RawRowHash      *string    `json:"raw_row_hash"`
	RowNumber       uint32     `json:"row_number"`
	IsDuplicate     *bool      `json:"is_duplicate"`
	CreatedAt       *time.Time `json:"created_at"`
	UpdatedAt       *time.Time `json:"updated_at"`
}
