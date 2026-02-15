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

// UploadListItem is a single row in the list of bank statement uploads.
type UploadListItem struct {
	ID                   uuid.UUID  `json:"id"`
	AccountID            uuid.UUID  `json:"account_id"`
	FileName             string     `json:"file_name"`
	UploadStatus         string     `json:"upload_status"`
	ProcessingStatus     string     `json:"processing_status"`
	StatementPeriodStart *time.Time `json:"statement_period_start,omitempty"`
	StatementPeriodEnd   *time.Time `json:"statement_period_end,omitempty"`
	CreatedAt            *time.Time `json:"created_at,omitempty"`
}

// UploadDetail is the full detail for a single upload (by ID).
type UploadDetail struct {
	UploadListItem
	UpdatedAt *time.Time `json:"updated_at,omitempty"`
}

// ListUploadsReq is used for listing uploads (no body/path params; user from auth).
type ListUploadsReq struct{}

func (ListUploadsReq) Validate() error {
	return nil
}

// GetUploadByIDReq is used for fetching a single upload by ID.
type GetUploadByIDReq struct {
	UploadId uuid.UUID `param:"upload_id" validate:"required"`
}

func (r *GetUploadByIDReq) Validate() error {
	return validator.New().Struct(r)
}

// DeleteUploadReq is used for deleting an upload by ID.
type DeleteUploadReq struct {
	UploadId uuid.UUID `param:"upload_id" validate:"required"`
}

func (r *DeleteUploadReq) Validate() error {
	return validator.New().Struct(r)
}
