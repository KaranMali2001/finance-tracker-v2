package reconciliation

import (
	"context"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/tasks"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
	"github.com/rs/zerolog"
)

// reconQuerier is the narrow slice of generated.Queries that ReconRepository needs.
// WithTx is included because the repository creates tx-scoped queriers internally.
type reconQuerier interface {
	WithTx(tx pgx.Tx) *generated.Queries
	CreateBankStatementUpload(ctx context.Context, arg generated.CreateBankStatementUploadParams) (pgtype.UUID, error)
	ListBankStatementUploadsByUser(ctx context.Context, userID string) ([]generated.ListBankStatementUploadsByUserRow, error)
	GetBankStatementUploadByID(ctx context.Context, arg generated.GetBankStatementUploadByIDParams) (generated.GetBankStatementUploadByIDRow, error)
	DeleteBankStatementUploadByID(ctx context.Context, arg generated.DeleteBankStatementUploadByIDParams) error
	DeleteTransactionReconciliationByUploadID(ctx context.Context, uploadID pgtype.UUID) error
	SoftDeleteStatementTransactionsByUploadID(ctx context.Context, uploadID pgtype.UUID) error
	InsertStatementTransactionsBatch(ctx context.Context, arg []generated.InsertStatementTransactionsBatchParams) *generated.InsertStatementTransactionsBatchBatchResults
	GetUploadWithSummary(ctx context.Context, arg generated.GetUploadWithSummaryParams) (generated.GetUploadWithSummaryRow, error)
	CountStatementTransactionsByUploadID(ctx context.Context, uploadID pgtype.UUID) (int64, error)
	ListStatementTransactionsByUploadID(ctx context.Context, arg generated.ListStatementTransactionsByUploadIDParams) ([]generated.ListStatementTransactionsByUploadIDRow, error)
	UpdateUploadSummary(ctx context.Context, arg generated.UpdateUploadSummaryParams) error
	GetStatementDateRange(ctx context.Context, uploadID pgtype.UUID) (generated.GetStatementDateRangeRow, error)
	GetStatementTransactionsForProcessing(ctx context.Context, uploadID pgtype.UUID) ([]generated.GetStatementTransactionsForProcessingRow, error)
	GetMaxAppTransactionDate(ctx context.Context, accountID pgtype.UUID) (interface{}, error)
	GetAppTransactionsInDateRange(ctx context.Context, arg generated.GetAppTransactionsInDateRangeParams) ([]generated.GetAppTransactionsInDateRangeRow, error)
	CreateTxnBatch(ctx context.Context, arg []generated.CreateTxnBatchParams) *generated.CreateTxnBatchBatchResults
	InsertReconciliationResultBatch(ctx context.Context, arg []generated.InsertReconciliationResultBatchParams) *generated.InsertReconciliationResultBatchBatchResults
	UpdateUploadProcessingStatus(ctx context.Context, arg generated.UpdateUploadProcessingStatusParams) error
	MarkTransactionAutoVerified(ctx context.Context, arg generated.MarkTransactionAutoVerifiedParams) error
	CountReconciliationResultsByUploadID(ctx context.Context, uploadID pgtype.UUID) (int64, error)
	GetReconciliationResultsByUploadID(ctx context.Context, arg generated.GetReconciliationResultsByUploadIDParams) ([]generated.GetReconciliationResultsByUploadIDRow, error)
	BulkUpdateReconciliationResultStatus(ctx context.Context, arg generated.BulkUpdateReconciliationResultStatusParams) ([]generated.BulkUpdateReconciliationResultStatusRow, error)
}

// reconRepository is the interface ReconService depends on.
type reconRepository interface {
	CreateUpload(ctx context.Context, userID string, accountID uuid.UUID, fileName, fileURL, fileType string, fileSize int, periodStart, periodEnd time.Time) (uuid.UUID, error)
	ListUploadsByUser(ctx context.Context, userID string) ([]UploadListItem, error)
	GetUploadByID(ctx context.Context, payload *GetUploadByIDReq, clerkId string) (*UploadDetail, error)
	DeleteUpload(ctx context.Context, uploadID uuid.UUID, userID string) error
	InsertStatementTransactions(ctx context.Context, rows []ParsedTxns) (map[string]struct{}, error)
	GetUploadDetail(ctx context.Context, uploadID uuid.UUID, userID string, limit, offset int32) (*UploadFullDetailPaginated, error)
	UpdateParseSummary(ctx context.Context, uploadID uuid.UUID, summary UploadSummary) error
	GetStatementDateRange(ctx context.Context, uploadID uuid.UUID) (minDate, maxDate time.Time, err error)
	GetStatementTransactionsForProcessing(ctx context.Context, uploadID uuid.UUID) ([]StatementTransaction, error)
	GetMaxAppTransactionDate(ctx context.Context, accountID uuid.UUID) (*time.Time, error)
	GetAppTransactionsInDateRange(ctx context.Context, accountID uuid.UUID, from, to time.Time) ([]AppTransaction, error)
	CreateAutoTransactionsBatch(ctx context.Context, params []generated.CreateTxnBatchParams) ([]uuid.UUID, error)
	InsertReconciliationResults(ctx context.Context, results []ReconciliationResult) error
	UpdateUploadProcessingStatus(ctx context.Context, uploadID uuid.UUID, status generated.UploadProcessingStatus, jobID uuid.UUID) error
	MarkTransactionAutoVerified(ctx context.Context, txnID, stmtTxnID uuid.UUID) error
	GetResultsByUploadID(ctx context.Context, uploadID uuid.UUID, limit, offset int32) (*PaginatedReconciliationResults, error)
	BulkUpdateResultStatus(ctx context.Context, resultIDs []uuid.UUID, userAction string, clerkID string, uploadID uuid.UUID) ([]UpdateResultStatusRes, error)
}

// reconTaskService is the narrow interface ReconService needs from tasks.TaskService.
type reconTaskService interface {
	EnqueueBankReconciliation(ctx context.Context, payload tasks.BankReconciliationPayload, logger *zerolog.Logger) error
}

// balanceApplier is the narrow interface ReconService needs from shared.BalanceUpdater.
type balanceApplier interface {
	ApplyBatch(ctx context.Context, userID string, accountID uuid.UUID, incomeDelta, expenseDelta, balanceDelta float64) error
}

// userThresholdProvider is the local interface for the cross-module user dependency.
// *user.UserService satisfies this implicitly.
type userThresholdProvider interface {
	GetReconciliationThreshold(ctx context.Context, clerkId string) (int, error)
}

// Compile-time check: *generated.Queries must satisfy reconQuerier.
var _ reconQuerier = (*generated.Queries)(nil)
