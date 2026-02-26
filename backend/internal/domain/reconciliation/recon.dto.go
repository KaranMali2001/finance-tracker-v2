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

// StatementTransaction is a single parsed row returned from an upload detail query.
type StatementTransaction struct {
	ID              uuid.UUID  `json:"id"`
	UploadID        uuid.UUID  `json:"upload_id"`
	AccountID       uuid.UUID  `json:"account_id"`
	TransactionDate *time.Time `json:"transaction_date"`
	Description     *string    `json:"description"`
	Amount          float64    `json:"amount"`
	Type            string     `json:"type"`
	ReferenceNumber *string    `json:"reference_number"`
	RawRowHash      string     `json:"raw_row_hash"`
	RowNumber       int32      `json:"row_number"`
	IsDuplicate     *bool      `json:"is_duplicate"`
}

// UploadFullDetail is the complete detail for a single upload: metadata, summary counts, parse errors, and all statement transactions.
type UploadFullDetail struct {
	ID                   uuid.UUID              `json:"id"`
	AccountID            uuid.UUID              `json:"account_id"`
	FileName             string                 `json:"file_name"`
	UploadStatus         string                 `json:"upload_status"`
	ProcessingStatus     string                 `json:"processing_status"`
	StatementPeriodStart *time.Time             `json:"statement_period_start,omitempty"`
	StatementPeriodEnd   *time.Time             `json:"statement_period_end,omitempty"`
	ValidRows            int                    `json:"valid_rows"`
	DuplicateRows        int                    `json:"duplicate_rows"`
	ErrorRows            int                    `json:"error_rows"`
	ParsingErrors        []ParseError           `json:"parsing_errors"`
	Transactions         []StatementTransaction `json:"transactions"`
	CreatedAt            *time.Time             `json:"created_at,omitempty"`
	UpdatedAt            *time.Time             `json:"updated_at,omitempty"`
}

// GetUploadDetailReq is used for fetching full upload detail by ID.
type GetUploadDetailReq struct {
	UploadId uuid.UUID `param:"upload_id" validate:"required"`
	Page     int32     `query:"page"`
	PageSize int32     `query:"page_size"`
}

func (r *GetUploadDetailReq) Validate() error {
	return validator.New().Struct(r)
}

// UploadFullDetailPaginated is the paginated version of UploadFullDetail.
type UploadFullDetailPaginated struct {
	ID                   uuid.UUID              `json:"id"`
	AccountID            uuid.UUID              `json:"account_id"`
	FileName             string                 `json:"file_name"`
	UploadStatus         string                 `json:"upload_status"`
	ProcessingStatus     string                 `json:"processing_status"`
	StatementPeriodStart *time.Time             `json:"statement_period_start,omitempty"`
	StatementPeriodEnd   *time.Time             `json:"statement_period_end,omitempty"`
	ValidRows            int                    `json:"valid_rows"`
	DuplicateRows        int                    `json:"duplicate_rows"`
	ErrorRows            int                    `json:"error_rows"`
	ParsingErrors        []ParseError           `json:"parsing_errors"`
	Transactions         []StatementTransaction `json:"transactions"`
	Total                int64                  `json:"total"`
	Page                 int32                  `json:"page"`
	PageSize             int32                  `json:"page_size"`
	TotalPages           int32                  `json:"total_pages"`
	CreatedAt            *time.Time             `json:"created_at,omitempty"`
	UpdatedAt            *time.Time             `json:"updated_at,omitempty"`
}

// AppTransaction is a lean in-memory struct fetched for reconciliation matching.
type AppTransaction struct {
	ID              uuid.UUID
	Amount          float64
	TransactionDate time.Time
	Type            string // "DEBIT" / "CREDIT"
	Description     string
	ReferenceNumber string
}

// MatchSignals stores the scoring breakdown — persisted as JSONB in match_signals column.
type MatchSignals struct {
	DateDiffDays          int     `json:"date_diff_days"`
	AmountDiff            float64 `json:"amount_diff"`
	AmountDiffPct         float64 `json:"amount_diff_pct"`
	DescriptionSimilarity float64 `json:"description_similarity"`
	ReferenceMatch        bool    `json:"reference_match"`
	DateScore             int     `json:"date_score"`
	AmountScore           int     `json:"amount_score"`
	DescriptionScore      int     `json:"description_score"`
	ReferenceScore        int     `json:"reference_score"`
}

// ReconciliationResult is a single result row built during the matching phase
// and batch-inserted into transaction_reconciliation.
type ReconciliationResult struct {
	UploadID               uuid.UUID
	StatementTransactionID uuid.UUID
	AppTransactionID       *uuid.UUID // nil for MISSING_IN_APP
	ResultType             string     // generated enum value string
	ConfidenceScore        float64
	MatchSignals           MatchSignals
	MatchStatus            string // "pending" — default user_action
}

// BankReconciliationPayload is the job payload enqueued to Asynq.
type BankReconciliationPayload struct {
	UploadID                uuid.UUID `json:"upload_id"`
	AccountID               uuid.UUID `json:"account_id"`
	UserID                  string    `json:"user_id"`
	ReconciliationThreshold int       `json:"reconciliation_threshold"`
}

// GetResultsReq is used for fetching reconciliation results for an upload.
type GetResultsReq struct {
	UploadId uuid.UUID `param:"upload_id" validate:"required"`
	Page     int32     `query:"page"`
	PageSize int32     `query:"page_size"`
}

func (r *GetResultsReq) Validate() error {
	return validator.New().Struct(r)
}

// PaginatedReconciliationResults wraps a page of results with total count metadata.
type PaginatedReconciliationResults struct {
	Results    []ReconciliationResultRow `json:"results"`
	Total      int64                     `json:"total"`
	Page       int32                     `json:"page"`
	PageSize   int32                     `json:"page_size"`
	TotalPages int32                     `json:"total_pages"`
}

// BulkUpdateResultStatusReq accepts an array of result IDs and a single user_action to apply to all of them.
// Single-item updates are handled by sending an array of length 1.
type BulkUpdateResultStatusReq struct {
	UploadId   uuid.UUID   `json:"upload_id" validate:"required"`
	ResultIds  []uuid.UUID `json:"result_ids" validate:"required,min=1"`
	UserAction string      `json:"user_action" validate:"required,oneof=accepted rejected"`
}

func (r *BulkUpdateResultStatusReq) Validate() error {
	return validator.New().Struct(r)
}

// ReconciliationResultRow is a single reconciliation result returned to the FE,
// including the statement transaction fields for side-by-side display.
type ReconciliationResultRow struct {
	ID                     uuid.UUID     `json:"id"`
	UploadID               uuid.UUID     `json:"upload_id"`
	StatementTransactionID uuid.UUID     `json:"statement_transaction_id"`
	AppTransactionID       *uuid.UUID    `json:"app_transaction_id,omitempty"`
	ResultType             string        `json:"result_type"`
	ConfidenceScore        float64       `json:"confidence_score"`
	MatchSignals           *MatchSignals `json:"match_signals,omitempty"`
	MatchStatus            string        `json:"match_status"`
	UserAction             string        `json:"user_action"`
	CreatedAt              *time.Time    `json:"created_at,omitempty"`
	// Statement transaction side
	StmtDate            *time.Time `json:"stmt_date,omitempty"`
	StmtDescription     *string    `json:"stmt_description,omitempty"`
	StmtAmount          float64    `json:"stmt_amount"`
	StmtType            string     `json:"stmt_type"`
	StmtReferenceNumber *string    `json:"stmt_reference_number,omitempty"`
	StmtRowNumber       int32      `json:"stmt_row_number"`
}

// UpdateResultStatusRes is a single updated row returned as part of BulkUpdateResultStatusRes.
type UpdateResultStatusRes struct {
	ID         uuid.UUID `json:"id"`
	UserAction string    `json:"user_action"`
}

// BulkUpdateResultStatusRes is the response after a bulk update.
type BulkUpdateResultStatusRes struct {
	Updated []UpdateResultStatusRes `json:"updated"`
}
