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

type UploadStatus string

const (
	UploadStatusProcessing UploadStatus = "processing"
	UploadStatusUploaded   UploadStatus = "UPLOADED"
)

type ParseExcelReq struct {
	StatementPeriodStart time.Time `json:"statement_period_start" form:"statement_period_start" validate:"required"`
	StatementPeriodEnd   time.Time `json:"statement_period_end" form:"statement_period_end" validate:"required"`
	AccountId            uuid.UUID `json:"account_id" form:"account_id" validate:"required"`
	UserId               string    `json:"user_id" form:"user_id" validate:"required"`
	FileName             string    `json:"file_name" form:"file_name" validate:"required"`
}

func (p *ParseExcelReq) Validate() error {
	return validator.New().Struct(p)
}

type ParsedTxns struct {
	UploadId        uuid.UUID  `json:"upload_id"`
	AccountId       uuid.UUID  `json:"account_id"`
	TxnDate         time.Time  `json:"txn_date"`
	Description     *string    `json:"description"`
	Amount          float64    `json:"amount"`
	Type            TxnType    `json:"type"`
	ReferenceNumber *string    `json:"reference_number"`
	RawRowHash      *string    `json:"raw_row_hash"`
	RowNumber       uint32     `json:"row_number"`
	IsDuplicate     *bool      `json:"is_duplicate"`
	CreatedAt       *time.Time `json:"created_at,omitempty"`
	UpdatedAt       *time.Time `json:"updated_at,omitempty"`
}
type ParseError struct {
	Row   int                    `json:"row"`
	Error string                 `json:"error"`
	Data  map[string]interface{} `json:"data"`
}
type UploadSummary struct {
	TotalRows     int          `json:"total_rows"`
	DuplicateRows int          `json:"duplicate_rows"`
	ErrorRows     int          `json:"error_rows"`
	ValidRows     int          `json:"valid_rows"`
	Errors        []ParseError `json:"errors"`
}

type UploadStatementRes struct {
	UploadId uuid.UUID     `json:"upload_id"`
	JobId    uuid.UUID     `json:"job_id"`
	Status   string        `json:"status"`
	Summary  UploadSummary `json:"summary"`
	Txns     []ParsedTxns  `json:"txns"`
}
