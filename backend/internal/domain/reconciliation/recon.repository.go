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
	queries reconQuerier
	tm      *database.TxManager
}

func NewReconRepository(queries reconQuerier, tm *database.TxManager) *ReconRepository {
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

func (r *ReconRepository) DeleteUpload(ctx context.Context, uploadID uuid.UUID, userID string) error {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	uploadIDPg := utils.UUIDToPgtype(uploadID)
	if err := queries.DeleteTransactionReconciliationByUploadID(ctx, uploadIDPg); err != nil {
		return err
	}
	if err := queries.SoftDeleteStatementTransactionsByUploadID(ctx, uploadIDPg); err != nil {
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

func (r *ReconRepository) GetUploadDetail(ctx context.Context, uploadID uuid.UUID, userID string, limit, offset int32) (*UploadFullDetailPaginated, error) {
	row, err := r.queries.GetUploadWithSummary(ctx, generated.GetUploadWithSummaryParams{
		ID:     utils.UUIDToPgtype(uploadID),
		UserID: userID,
	})
	if err != nil {
		return nil, err
	}

	total, err := r.queries.CountStatementTransactionsByUploadID(ctx, row.ID)
	if err != nil {
		return nil, err
	}

	txnRows, err := r.queries.ListStatementTransactionsByUploadID(ctx, generated.ListStatementTransactionsByUploadIDParams{
		UploadID: row.ID,
		Limit:    limit,
		Offset:   offset,
	})
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

	totalPages := int32(1)
	if limit > 0 && total > 0 {
		totalPages = int32((total + int64(limit) - 1) / int64(limit))
	}
	page := int32(1)
	if limit > 0 {
		page = offset/limit + 1
	}

	item := rowToUploadListItem(row.ID, row.AccountID, row.FileName, row.UploadStatus, row.ProcessingStatus, row.StatementPeriodStart, row.StatementPeriodEnd, row.CreatedAt)
	return &UploadFullDetailPaginated{
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
		Total:                total,
		Page:                 page,
		PageSize:             limit,
		TotalPages:           totalPages,
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

var ErrNoDateRange = errors.New("no statement transactions with a valid date found for upload")

func (r *ReconRepository) GetStatementDateRange(ctx context.Context, uploadID uuid.UUID) (minDate, maxDate time.Time, err error) {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	row, err := queries.GetStatementDateRange(ctx, utils.UUIDToPgtype(uploadID))
	if err != nil {
		return time.Time{}, time.Time{}, err
	}
	if row.MinDate == nil || row.MaxDate == nil {
		return time.Time{}, time.Time{}, ErrNoDateRange
	}
	minT, ok1 := row.MinDate.(time.Time)
	maxT, ok2 := row.MaxDate.(time.Time)
	if !ok1 || !ok2 {
		return time.Time{}, time.Time{}, errors.New("could not parse statement date range")
	}
	return minT, maxT, nil
}

func (r *ReconRepository) GetStatementTransactionsForProcessing(ctx context.Context, uploadID uuid.UUID) ([]StatementTransaction, error) {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	rows, err := queries.GetStatementTransactionsForProcessing(ctx, utils.UUIDToPgtype(uploadID))
	if err != nil {
		return nil, err
	}
	out := make([]StatementTransaction, 0, len(rows))
	for _, t := range rows {
		var txnDate *time.Time
		if t.TransactionDate.Valid {
			txnDate = &t.TransactionDate.Time
		}
		out = append(out, StatementTransaction{
			ID:              utils.UUIDToUUID(t.ID),
			UploadID:        utils.UUIDToUUID(t.UploadID),
			AccountID:       utils.UUIDToUUID(t.AccountID),
			TransactionDate: txnDate,
			Description:     utils.TextToStringPtr(t.Description),
			Amount:          utils.NumericToFloat64(t.Amount),
			Type:            t.Type,
			ReferenceNumber: utils.TextToStringPtr(t.ReferenceNumber),
			RawRowHash:      t.RawRowHash,
		})
	}
	return out, nil
}

func (r *ReconRepository) GetMaxAppTransactionDate(ctx context.Context, accountID uuid.UUID) (*time.Time, error) {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	raw, err := queries.GetMaxAppTransactionDate(ctx, utils.UUIDToPgtype(accountID))
	if err != nil {
		return nil, err
	}
	if raw == nil {
		return nil, nil
	}
	t, ok := raw.(time.Time)
	if !ok {
		return nil, nil
	}
	return &t, nil
}

func (r *ReconRepository) GetAppTransactionsInDateRange(ctx context.Context, accountID uuid.UUID, from, to time.Time) ([]AppTransaction, error) {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	rows, err := queries.GetAppTransactionsInDateRange(ctx, generated.GetAppTransactionsInDateRangeParams{
		AccountID:         utils.UUIDToPgtype(accountID),
		TransactionDate:   utils.TimestampToPgtype(from),
		TransactionDate_2: utils.TimestampToPgtype(to),
	})
	if err != nil {
		return nil, err
	}
	out := make([]AppTransaction, 0, len(rows))
	for _, row := range rows {
		out = append(out, AppTransaction{
			ID:              utils.UUIDToUUID(row.ID),
			Amount:          utils.NumericToFloat64(row.Amount),
			TransactionDate: utils.TimestampToTime(row.TransactionDate),
			Type:            string(row.Type),
			Description:     utils.TextToString(row.Description),
			ReferenceNumber: utils.TextToString(row.ReferenceNumber),
		})
	}
	return out, nil
}

func (r *ReconRepository) CreateAutoTransactionsBatch(ctx context.Context, params []generated.CreateTxnBatchParams) ([]uuid.UUID, error) {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	ids := make([]uuid.UUID, 0, len(params))
	var batchErr error
	br := queries.CreateTxnBatch(ctx, params)
	br.QueryRow(func(_ int, row generated.CreateTxnBatchRow, err error) {
		if err != nil {
			batchErr = err
			return
		}
		ids = append(ids, utils.UUIDToUUID(row.ID))
	})
	if batchErr != nil {
		return nil, batchErr
	}
	return ids, nil
}

func (r *ReconRepository) InsertReconciliationResults(ctx context.Context, results []ReconciliationResult) error {
	if len(results) == 0 {
		return nil
	}
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	args := make([]generated.InsertReconciliationResultBatchParams, 0, len(results))
	for _, res := range results {
		signalsJSON, err := json.Marshal(res.MatchSignals)
		if err != nil {
			return err
		}
		appTxnID := utils.UUIDPtrToPgtype(res.AppTransactionID)
		args = append(args, generated.InsertReconciliationResultBatchParams{
			UploadID:               utils.UUIDToPgtype(res.UploadID),
			StatementTransactionID: utils.UUIDToPgtype(res.StatementTransactionID),
			AppTransactionID:       appTxnID,
			ResultType:             generated.ReconciliationResultType(res.ResultType),
			ConfidenceScore:        utils.Float64PtrToNum(&res.ConfidenceScore),
			MatchSignals:           signalsJSON,
			MatchStatus:            res.MatchStatus,
		})
	}
	var batchErr error
	br := queries.InsertReconciliationResultBatch(ctx, args)
	br.Exec(func(_ int, err error) {
		if err != nil {
			batchErr = err
		}
	})
	return batchErr
}

func (r *ReconRepository) UpdateUploadProcessingStatus(ctx context.Context, uploadID uuid.UUID, status generated.UploadProcessingStatus, jobID uuid.UUID) error {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	return queries.UpdateUploadProcessingStatus(ctx, generated.UpdateUploadProcessingStatusParams{
		ID: utils.UUIDToPgtype(uploadID),
		ProcessingStatus: generated.NullUploadProcessingStatus{
			UploadProcessingStatus: status,
			Valid:                  true,
		},
		JobID: utils.UUIDToPgtype(jobID),
	})
}

func (r *ReconRepository) MarkTransactionAutoVerified(ctx context.Context, txnID, stmtTxnID uuid.UUID) error {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}
	return queries.MarkTransactionAutoVerified(ctx, generated.MarkTransactionAutoVerifiedParams{
		ID:             utils.UUIDToPgtype(txnID),
		StatementTxnID: utils.UUIDToPgtype(stmtTxnID),
	})
}

func (r *ReconRepository) GetResultsByUploadID(ctx context.Context, uploadID uuid.UUID, limit, offset int32) (*PaginatedReconciliationResults, error) {
	uploadIDPg := utils.UUIDToPgtype(uploadID)
	total, err := r.queries.CountReconciliationResultsByUploadID(ctx, uploadIDPg)
	if err != nil {
		return nil, err
	}
	rows, err := r.queries.GetReconciliationResultsByUploadID(ctx, generated.GetReconciliationResultsByUploadIDParams{
		UploadID: uploadIDPg,
		Limit:    limit,
		Offset:   offset,
	})
	if err != nil {
		return nil, err
	}
	out := make([]ReconciliationResultRow, 0, len(rows))
	for _, row := range rows {
		var appTxnID *uuid.UUID
		if row.AppTransactionID.Valid {
			id := uuid.UUID(row.AppTransactionID.Bytes)
			appTxnID = &id
		}
		var signals *MatchSignals
		if len(row.MatchSignals) > 0 {
			var s MatchSignals
			if err := json.Unmarshal(row.MatchSignals, &s); err == nil {
				signals = &s
			}
		}
		var stmtDate *time.Time
		if row.StmtDate.Valid && !row.StmtDate.Time.IsZero() {
			stmtDate = &row.StmtDate.Time
		}
		out = append(out, ReconciliationResultRow{
			ID:                     utils.UUIDToUUID(row.ID),
			UploadID:               utils.UUIDToUUID(row.UploadID),
			StatementTransactionID: utils.UUIDToUUID(row.StatementTransactionID),
			AppTransactionID:       appTxnID,
			ResultType:             string(row.ResultType),
			ConfidenceScore:        utils.NumericToFloat64(row.ConfidenceScore),
			MatchSignals:           signals,
			MatchStatus:            row.MatchStatus,
			UserAction:             utils.TextToString(row.UserAction),
			CreatedAt:              utils.TimestampToTimePtr(row.CreatedAt),
			StmtDate:               stmtDate,
			StmtDescription:        utils.TextToStringPtr(row.StmtDescription),
			StmtAmount:             utils.NumericToFloat64(row.StmtAmount),
			StmtType:               row.StmtType,
			StmtReferenceNumber:    utils.TextToStringPtr(row.StmtReferenceNumber),
			StmtRowNumber:          row.StmtRowNumber,
		})
	}

	totalPages := int32(1)
	if limit > 0 && total > 0 {
		totalPages = int32((total + int64(limit) - 1) / int64(limit))
	}
	page := int32(1)
	if limit > 0 {
		page = offset/limit + 1
	}

	return &PaginatedReconciliationResults{
		Results:    out,
		Total:      total,
		Page:       page,
		PageSize:   limit,
		TotalPages: totalPages,
	}, nil
}

func (r *ReconRepository) BulkUpdateResultStatus(ctx context.Context, resultIDs []uuid.UUID, userAction string, clerkID string, uploadID uuid.UUID) ([]UpdateResultStatusRes, error) {
	pgIDs := make([]pgtype.UUID, len(resultIDs))
	for i, id := range resultIDs {
		pgIDs[i] = utils.UUIDToPgtype(id)
	}
	rows, err := r.queries.BulkUpdateReconciliationResultStatus(ctx, generated.BulkUpdateReconciliationResultStatusParams{
		Column1:    pgIDs,
		UserAction: utils.StringToPgtypeText(userAction),
		UserID:     clerkID,
		UploadID:   utils.UUIDToPgtype(uploadID),
	})
	if err != nil {
		return nil, err
	}
	out := make([]UpdateResultStatusRes, 0, len(rows))
	for _, row := range rows {
		out = append(out, UpdateResultStatusRes{
			ID:         utils.UUIDToUUID(row.ID),
			UserAction: utils.TextToString(row.UserAction),
		})
	}
	return out, nil
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
		Balance:         utils.Float64PtrToNum(nil),
		ReferenceNumber: utils.StringPtrToText(row.ReferenceNumber),
		RawRowHash:      *row.RawRowHash,
		RowNumber:       int32(row.RowNumber),
		IsDuplicate:     utils.ToPgBool(&isDup),
	}
}
