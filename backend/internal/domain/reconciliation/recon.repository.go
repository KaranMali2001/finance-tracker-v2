package reconciliation

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type ReconRepository struct {
	queries *generated.Queries
	tm      *database.TxManager
}

func NewReconRepository(queries *generated.Queries, tm *database.TxManager) *ReconRepository {
	return &ReconRepository{queries: queries, tm: tm}
}

func (r *ReconRepository) CreateUpload(
	ctx context.Context,
	userID string,
	accountID uuid.UUID,
	fileName string,
	fileURL string,
	fileType string,
	fileSize int,
	periodStart, periodEnd time.Time,
) (uuid.UUID, error) {
	var fileTypePg pgtype.Text
	if fileType != "" {
		fileTypePg = utils.StringPtrToText(&fileType)
	}
	var fileSizePg pgtype.Int4
	if fileSize > 0 {
		fileSizePg = utils.IntToInt4(fileSize)
	}
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	row, err := queries.CreateBankStatementUpload(ctx, generated.CreateBankStatementUploadParams{
		UserID:               userID,
		AccountID:            utils.UUIDToPgtype(accountID),
		FileName:             fileName,
		FileType:             fileTypePg,
		FileSize:             fileSizePg,
		StatementPeriodStart: utils.TimeToDate(periodStart),
		StatementPeriodEnd:   utils.TimeToDate(periodEnd),
		UploadStatus:         utils.StringToPgtypeText(string(UploadStatusProcessing)),
	})
	if err != nil {
		return uuid.Nil, err
	}
	if !row.Valid {
		return uuid.Nil, errors.New("upload id not returned")
	}
	return row.Bytes, nil
}

func (r *ReconRepository) ListUploadsByUser(ctx context.Context, userID string) ([]UploadListItem, error) {
	rows, err := r.queries.ListBankStatementUploadsByUser(ctx, userID)
	if err != nil {
		return nil, err
	}
	out := make([]UploadListItem, 0, len(rows))
	for _, row := range rows {
		out = append(out, rowToUploadListItem(row.ID, row.AccountID, row.FileName, row.UploadStatus, row.ProcessingStatus, row.StatementPeriodStart, row.StatementPeriodEnd, row.CreatedAt))
	}
	return out, nil
}

func (r *ReconRepository) GetUploadByID(ctx context.Context, payload *GetUploadByIDReq, clerkId string) (*UploadDetail, error) {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	row, err := queries.GetBankStatementUploadByID(ctx, generated.GetBankStatementUploadByIDParams{
		ID:     utils.UUIDToPgtype(payload.UploadId),
		UserID: clerkId,
	})
	if err != nil {
		return nil, err
	}
	item := rowToUploadListItem(row.ID, row.AccountID, row.FileName, row.UploadStatus, row.ProcessingStatus, row.StatementPeriodStart, row.StatementPeriodEnd, row.CreatedAt)
	return &UploadDetail{UploadListItem: item, UpdatedAt: utils.TimestampToTimePtr(row.UpdatedAt)}, nil
}

// DeleteUpload deletes the upload and all related data in one transaction: nullifies transactions.statement_txn_id, deletes transaction_reconciliation, statement_transactions, then bank_statement_uploads.
func (r *ReconRepository) DeleteUpload(ctx context.Context, uploadID uuid.UUID, userID string) error {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	uploadIDPg := utils.UUIDToPgtype(uploadID)
	// if err := queries.NullifyTransactionsStatementTxnByUploadID(ctx, uploadIDPg); err != nil {
	// 	return err
	// }
	if err := queries.DeleteTransactionReconciliationByUploadID(ctx, uploadIDPg); err != nil {
		return err
	}
	if err := queries.DeleteStatementTransactionsByUploadID(ctx, uploadIDPg); err != nil {
		return err
	}
	if err := queries.DeleteBankStatementUploadByID(ctx, generated.DeleteBankStatementUploadByIDParams{
		ID:     uploadIDPg,
		UserID: userID,
	}); err != nil {
		return err
	}
	return nil
}

func rowToUploadListItem(id, accountID pgtype.UUID, fileName string, uploadStatus pgtype.Text, processingStatus generated.NullUploadProcessingStatus, periodStart, periodEnd pgtype.Date, createdAt pgtype.Timestamp) UploadListItem {
	var createdAtPtr *time.Time
	if createdAt.Valid {
		createdAtPtr = &createdAt.Time
	}
	var periodStartPtr *time.Time
	if periodStart.Valid {
		periodStartPtr = &periodStart.Time
	}
	var periodEndPtr *time.Time
	if periodEnd.Valid {
		periodEndPtr = &periodEnd.Time
	}
	statusStr := ""
	if uploadStatus.Valid {
		statusStr = uploadStatus.String
	}
	procStr := ""
	if processingStatus.Valid {
		procStr = string(processingStatus.UploadProcessingStatus)
	}
	return UploadListItem{
		ID:                   utils.UUIDToUUID(id),
		AccountID:            utils.UUIDToUUID(accountID),
		FileName:             fileName,
		UploadStatus:         statusStr,
		ProcessingStatus:     procStr,
		StatementPeriodStart: periodStartPtr,
		StatementPeriodEnd:   periodEndPtr,
		CreatedAt:            createdAtPtr,
	}
}

func (r *ReconRepository) InsertStatementTransactions(ctx context.Context, rows []ParsedTxns) (map[string]struct{}, error) {
	inserted := make(map[string]struct{})
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	args := make([]generated.InsertStatementTransactionsBatchParams, 0, len(rows))
	for i := range rows {
		if rows[i].RawRowHash == nil || *rows[i].RawRowHash == "" {
			continue
		}
		args = append(args, parsedTxnToBatchParam(rows[i]))
	}
	if len(args) == 0 {
		return inserted, nil
	}
	br := queries.InsertStatementTransactionsBatch(ctx, args)
	var batchErr error
	br.QueryRow(func(_ int, rawRowHash string, err error) {
		if err != nil {
			if !errors.Is(err, pgx.ErrNoRows) {
				batchErr = err
			}
			return
		}
		inserted[rawRowHash] = struct{}{}
	})
	if batchErr != nil {
		return nil, batchErr
	}
	return inserted, nil
}

func (r *ReconRepository) GetUploadDetail(ctx context.Context, uploadID uuid.UUID, userID string) (*UploadFullDetail, error) {
	row, err := r.queries.GetUploadWithSummary(ctx, generated.GetUploadWithSummaryParams{
		ID:     utils.UUIDToPgtype(uploadID),
		UserID: userID,
	})
	if err != nil {
		return nil, err
	}

	txnRows, err := r.queries.ListStatementTransactionsByUploadID(ctx, row.ID)
	if err != nil {
		return nil, err
	}

	var parseErrors []ParseError
	if len(row.ParsingErrors) > 0 {
		if err := json.Unmarshal(row.ParsingErrors, &parseErrors); err != nil {
			parseErrors = []ParseError{}
		}
	}
	if parseErrors == nil {
		parseErrors = []ParseError{}
	}

	txns := make([]StatementTransaction, 0, len(txnRows))
	for _, t := range txnRows {
		var txnDate *time.Time
		if t.TransactionDate.Valid {
			txnDate = &t.TransactionDate.Time
		}
		isDup := utils.BoolToBoolPtr(t.IsDuplicate)
		txns = append(txns, StatementTransaction{
			ID:              utils.UUIDToUUID(t.ID),
			UploadID:        utils.UUIDToUUID(t.UploadID),
			AccountID:       utils.UUIDToUUID(t.AccountID),
			TransactionDate: txnDate,
			Description:     utils.TextToStringPtr(t.Description),
			Amount:          utils.NumericToFloat64(t.Amount),
			Type:            t.Type,
			ReferenceNumber: utils.TextToStringPtr(t.ReferenceNumber),
			RawRowHash:      t.RawRowHash,
			RowNumber:       t.RowNumber,
			IsDuplicate:     isDup,
		})
	}

	item := rowToUploadListItem(row.ID, row.AccountID, row.FileName, row.UploadStatus, row.ProcessingStatus, row.StatementPeriodStart, row.StatementPeriodEnd, row.CreatedAt)
	return &UploadFullDetail{
		ID:                   item.ID,
		AccountID:            item.AccountID,
		FileName:             item.FileName,
		UploadStatus:         item.UploadStatus,
		ProcessingStatus:     item.ProcessingStatus,
		StatementPeriodStart: item.StatementPeriodStart,
		StatementPeriodEnd:   item.StatementPeriodEnd,
		ValidRows:            utils.Int4ToInt(row.ValidRows),
		DuplicateRows:        utils.Int4ToInt(row.DuplicateRows),
		ErrorRows:            utils.Int4ToInt(row.ErrorRows),
		ParsingErrors:        parseErrors,
		Transactions:         txns,
		CreatedAt:            item.CreatedAt,
		UpdatedAt:            utils.TimestampToTimePtr(row.UpdatedAt),
	}, nil
}

func (r *ReconRepository) UpdateParseSummary(ctx context.Context, uploadID uuid.UUID, summary UploadSummary) error {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	errorsJSON, err := json.Marshal(summary.Errors)
	if err != nil {
		return err
	}
	return queries.UpdateUploadSummary(ctx, generated.UpdateUploadSummaryParams{
		ID:            utils.UUIDToPgtype(uploadID),
		ValidRows:     pgtype.Int4{Int32: int32(summary.ValidRows), Valid: true},
		DuplicateRows: pgtype.Int4{Int32: int32(summary.DuplicateRows), Valid: true},
		ErrorRows:     pgtype.Int4{Int32: int32(summary.ErrorRows), Valid: true},
		ParsingErrors: errorsJSON,
	})
}

func parsedTxnToBatchParam(row ParsedTxns) generated.InsertStatementTransactionsBatchParams {
	isDup := false
	return generated.InsertStatementTransactionsBatchParams{
		UploadID:        utils.UUIDToPgtype(row.UploadId),
		AccountID:       utils.UUIDToPgtype(row.AccountId),
		TransactionDate: utils.TimeToTimestamptz(row.TxnDate),
		Description:     utils.StringPtrToText(row.Description),
		Amount:          utils.Float64PtrToNum(&row.Amount),
		Type:            string(row.Type),
		Balance:         pgtype.Numeric{Valid: false},
		ReferenceNumber: utils.StringPtrToText(row.ReferenceNumber),
		RawRowHash:      *row.RawRowHash,
		RowNumber:       int32(row.RowNumber),
		IsDuplicate:     utils.ToPgBool(&isDup),
	}
}
