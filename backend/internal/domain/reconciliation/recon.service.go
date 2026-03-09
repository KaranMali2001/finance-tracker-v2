package reconciliation

import (
	"context"
	"errors"
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/errs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/tasks"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog"
	"github.com/xuri/excelize/v2"
)

const (
	colTxnDate     = 1
	colDescription = 3
	colChqRefNo    = 4
	colAmount      = 5
	colDrCr        = 6
)

type ReconService struct {
	repo           reconRepository
	tm             *database.TxManager
	taskService    reconTaskService
	balanceUpdater balanceApplier
	userService    userThresholdProvider
}

func NewReconService(repo reconRepository, tm *database.TxManager, taskService reconTaskService, balanceUpdater balanceApplier, userService userThresholdProvider) *ReconService {
	return &ReconService{
		repo:           repo,
		tm:             tm,
		taskService:    taskService,
		balanceUpdater: balanceUpdater,
		userService:    userService,
	}
}

func (s *ReconService) ListUploads(c echo.Context, payload *ListUploadsReq, clerkId string) ([]UploadListItem, error) {
	return s.repo.ListUploadsByUser(c.Request().Context(), clerkId)
}

func (s *ReconService) GetUploadByID(c echo.Context, payload *GetUploadByIDReq, clerkId string) (*UploadDetail, error) {
	return s.repo.GetUploadByID(c.Request().Context(), payload, clerkId)
}

func (s *ReconService) GetUploadDetail(c echo.Context, payload *GetUploadDetailReq, clerkId string) (*UploadFullDetailPaginated, error) {
	pageSize := payload.PageSize
	if pageSize <= 0 {
		pageSize = 25
	}
	page := payload.Page
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * pageSize
	return s.repo.GetUploadDetail(c.Request().Context(), payload.UploadId, clerkId, pageSize, offset)
}

func (s *ReconService) GetResults(c echo.Context, payload *GetResultsReq, clerkId string) (*PaginatedReconciliationResults, error) {
	pageSize := payload.PageSize
	if pageSize <= 0 {
		pageSize = 25
	}
	page := payload.Page
	if page <= 0 {
		page = 1
	}
	offset := (page - 1) * pageSize
	return s.repo.GetResultsByUploadID(c.Request().Context(), payload.UploadId, pageSize, offset)
}

func (s *ReconService) BulkUpdateResultStatus(c echo.Context, payload *BulkUpdateResultStatusReq, clerkId string) (*BulkUpdateResultStatusRes, error) {
	updated, err := s.repo.BulkUpdateResultStatus(c.Request().Context(), payload.ResultIds, payload.UserAction, clerkId, payload.UploadId)
	if err != nil {
		return nil, err
	}
	return &BulkUpdateResultStatusRes{Updated: updated}, nil
}

func (s *ReconService) DeleteUpload(c echo.Context, payload *DeleteUploadReq, clerkId string) error {
	if s.tm == nil {
		return fmt.Errorf("tx manager not configured")
	}
	ctx := c.Request().Context()
	_, err := s.repo.GetUploadByID(ctx, &GetUploadByIDReq{UploadId: payload.UploadId}, clerkId)
	if err != nil {
		return err
	}
	log := middleware.GetLogger(c)
	return s.tm.WithTx(ctx, func(ctx context.Context) error {
		return s.repo.DeleteUpload(ctx, payload.UploadId, clerkId)
	}, log)
}

func (s *ReconService) ParseAndProcessStatement(c echo.Context, payload *ParseExcelReq) (*UploadStatementRes, error) {
	log := middleware.GetLogger(c)
	ctx := c.Request().Context()

	f, ok := c.Get(handler.StatementContextKey).(*multipart.FileHeader)
	if !ok || f == nil {
		return nil, fmt.Errorf("statement file not found")
	}

	r, err := f.Open()
	if err != nil {
		log.Error().Err(err).Msg("Error opening statement file")
		return nil, err
	}
	defer r.Close()

	ext := strings.ToLower(filepath.Ext(f.Filename))
	switch ext {
	case ".xlsx":
		rows, parseErrors, err := parseXlsxRows(r, payload.AccountId, uuid.Nil)
		if err != nil {
			return nil, err
		}
		if len(rows) == 0 && len(parseErrors) == 0 {
			return &UploadStatementRes{
				UploadId: uuid.Nil,
				JobId:    uuid.Nil,
				Status:   "PARSED",
				Summary:  UploadSummary{},
				Txns:     []ParsedTxns{},
			}, nil
		}
		insertedHashes := make(map[string]struct{})
		var uploadID uuid.UUID

		err = s.tm.WithTx(ctx, func(ctx context.Context) error {
			uploadID, err = s.repo.CreateUpload(ctx, payload.UserId, payload.AccountId, payload.FileName, "", "", 0, payload.StatementPeriodStart, payload.StatementPeriodEnd)
			if err != nil {
				log.Error().Err(err).Msg("Failed to create bank statement upload")
				return err
			}
			for i := range rows {
				rows[i].UploadId = uploadID
				rows[i].AccountId = payload.AccountId
			}

			insertedHashes, err = s.repo.InsertStatementTransactions(ctx, rows)
			if err != nil {
				log.Error().Err(err).Msg("Failed to insert statement transactions")
				return err
			}
			return nil
		}, log)
		if err != nil {
			log.Error().Err(err).Msg("Failed to create bank statement upload")
			return nil, err
		}
		MarkDuplicatesFromInsertedSet(rows, insertedHashes)
		summary := SummaryFromRows(rows, parseErrors)

		if err := s.repo.UpdateParseSummary(ctx, uploadID, summary); err != nil {
			log.Error().Err(err).Msg("Failed to update parse summary")
		}

		threshold := 70
		if s.userService != nil {
			if t, err := s.userService.GetReconciliationThreshold(ctx, payload.UserId); err == nil {
				threshold = t
			}
		}

		// Enqueue the background reconciliation job (non-fatal if it fails)
		jobID := uuid.Nil
		if s.taskService != nil {
			jobPayload := tasks.BankReconciliationPayload{
				UploadID:                uploadID,
				AccountID:               payload.AccountId,
				UserID:                  payload.UserId,
				ReconciliationThreshold: threshold,
			}
			if err := s.taskService.EnqueueBankReconciliation(ctx, jobPayload, log); err != nil {
				log.Error().Err(err).Msg("Failed to enqueue reconciliation task")
			}
		}

		return &UploadStatementRes{
			UploadId: uploadID,
			JobId:    jobID,
			Status:   "PARSED",
			Summary:  summary,
			Txns:     rows,
		}, nil

	case ".csv":
		return nil, errs.NewBadRequestError("CSV parsing not implemented; please upload .xlsx", false, nil, nil, nil)

	case ".xls":
		return nil, errs.NewBadRequestError("Unsupported statement format: .xls. Please upload .xlsx or .csv", false, nil, nil, nil)

	default:
		return nil, errs.NewBadRequestError("Unsupported statement format. Please upload .xlsx or .csv", false, nil, nil, nil)
	}
}

func (s *ReconService) RunReconciliationJob(ctx context.Context, payload tasks.BankReconciliationPayload, log *zerolog.Logger) ([]uuid.UUID, error) {
	utils.LogMem("start", log)

	if err := s.repo.UpdateUploadProcessingStatus(ctx, payload.UploadID, generated.UploadProcessingStatusPROCESSING, uuid.Nil); err != nil {
		log.Error().Err(err).Msg("[recon] failed to mark upload PROCESSING")
	}

	stmtTxns, err := s.repo.GetStatementTransactionsForProcessing(ctx, payload.UploadID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch statement transactions: %w", err)
	}
	if len(stmtTxns) == 0 {
		log.Info().Str("upload_id", payload.UploadID.String()).Msg("[recon] no statement transactions to process")
		return nil, s.repo.UpdateUploadProcessingStatus(ctx, payload.UploadID, generated.UploadProcessingStatusCOMPLETED, uuid.Nil)
	}
	utils.LogMem("after_stmt_fetch", log)
	log.Info().Int("stmt_count", len(stmtTxns)).Msg("[recon] fetched statement transactions")

	maxAppDate, err := s.repo.GetMaxAppTransactionDate(ctx, payload.AccountID)
	if err != nil {
		return nil, fmt.Errorf("failed to get max app transaction date: %w", err)
	}

	var tailRows, overlapRows []StatementTransaction
	if maxAppDate == nil {
		tailRows = stmtTxns
	} else {
		for _, st := range stmtTxns {
			if st.TransactionDate == nil {
				continue
			}
			if st.TransactionDate.After(*maxAppDate) {
				tailRows = append(tailRows, st)
			} else {
				overlapRows = append(overlapRows, st)
			}
		}
	}
	log.Info().
		Int("tail_rows", len(tailRows)).
		Int("overlap_rows", len(overlapRows)).
		Msg("[recon] partitioned statement rows")

	var appTxns []AppTransaction
	if len(overlapRows) > 0 {
		minDate, maxDate, err := s.repo.GetStatementDateRange(ctx, payload.UploadID)
		if errors.Is(err, ErrNoDateRange) {
			log.Warn().Str("upload_id", payload.UploadID.String()).
				Msg("[recon] no date range for overlap rows, skipping app-txn fetch")
		} else if err != nil {
			return nil, fmt.Errorf("failed to get statement date range: %w", err)
		} else {
			from := minDate.AddDate(0, 0, -2)
			to := maxDate.AddDate(0, 0, 2)
			appTxns, err = s.repo.GetAppTransactionsInDateRange(ctx, payload.AccountID, from, to)
			if err != nil {
				return nil, fmt.Errorf("failed to fetch app transactions: %w", err)
			}
			log.Info().Int("app_txn_count", len(appTxns)).Msg("[recon] fetched app transactions")
			utils.LogMem("after_app_fetch", log)
		}
	}

	dateMap := make(map[string][]AppTransaction, len(appTxns))
	exactMap := make(map[string]*AppTransaction, len(appTxns))
	for i := range appTxns {
		at := &appTxns[i]
		dateKey := at.TransactionDate.Format("2006-01-02") + "|" + at.Type
		dateMap[dateKey] = append(dateMap[dateKey], *at)
		exactKey := fmt.Sprintf("%.2f|%s|%s", at.Amount, at.Type, at.TransactionDate.Format("2006-01-02"))
		exactMap[exactKey] = at
	}
	utils.LogMem("after_indexing", log)

	results := make([]ReconciliationResult, 0, len(overlapRows)+len(tailRows))
	var highConfMatches []ReconciliationResult

	for _, st := range overlapRows {
		if st.TransactionDate == nil {
			continue
		}
		stmtDate := st.TransactionDate.Format("2006-01-02")
		stmtDesc := ""
		if st.Description != nil {
			stmtDesc = *st.Description
		}
		stmtRef := ""
		if st.ReferenceNumber != nil {
			stmtRef = *st.ReferenceNumber
		}

		exactKey := fmt.Sprintf("%.2f|%s|%s", st.Amount, st.Type, stmtDate)
		if match, ok := exactMap[exactKey]; ok {
			appID := match.ID
			res := ReconciliationResult{
				UploadID:               payload.UploadID,
				StatementTransactionID: st.ID,
				AppTransactionID:       &appID,
				ResultType:             string(generated.ReconciliationResultTypeHIGHCONFIDENCEMATCH),
				ConfidenceScore:        95,
				MatchSignals: MatchSignals{
					DateDiffDays: 0, AmountDiff: 0, AmountDiffPct: 0,
					DescriptionSimilarity: utils.TokenJaccard(stmtDesc, match.Description),
					ReferenceMatch:        stmtRef != "" && stmtRef == match.ReferenceNumber,
					DateScore:             40, AmountScore: 35, DescriptionScore: 0, ReferenceScore: 0,
				},
				MatchStatus: "auto_accepted",
			}
			results = append(results, res)
			highConfMatches = append(highConfMatches, res)
			delete(exactMap, exactKey)
			continue
		}

		var bestMatch *AppTransaction
		var bestScore int
		var bestSignals MatchSignals

		for dayDelta := -2; dayDelta <= 2; dayDelta++ {
			candidate := st.TransactionDate.AddDate(0, 0, dayDelta)
			key := candidate.Format("2006-01-02") + "|" + st.Type
			for i := range dateMap[key] {
				at := &dateMap[key][i]
				signals, score := scoreMatch(st.Amount, stmtDesc, stmtRef, *st.TransactionDate, at)
				if score > bestScore {
					bestScore = score
					bestMatch = at
					bestSignals = signals
				}
			}
		}

		res := ReconciliationResult{
			UploadID:               payload.UploadID,
			StatementTransactionID: st.ID,
			MatchSignals:           bestSignals,
			MatchStatus:            "pending",
		}

		switch {
		case bestMatch != nil && bestScore >= payload.ReconciliationThreshold:
			appID := bestMatch.ID
			res.AppTransactionID = &appID
			res.ResultType = string(generated.ReconciliationResultTypeHIGHCONFIDENCEMATCH)
			res.ConfidenceScore = float64(bestScore)
			res.MatchStatus = "auto_accepted"
			results = append(results, res)
			highConfMatches = append(highConfMatches, res)

		case bestMatch != nil && bestScore > 0:
			appID := bestMatch.ID
			res.AppTransactionID = &appID
			res.ResultType = string(generated.ReconciliationResultTypeLOWCONFIDENCEMATCH)
			res.ConfidenceScore = float64(bestScore)
			results = append(results, res)

		default:
			res.ResultType = string(generated.ReconciliationResultTypeMISSINGINAPP)
			res.ConfidenceScore = 0
			results = append(results, res)
		}
	}
	utils.LogMem("after_scoring", log)
	log.Info().Int("results_so_far", len(results)).Msg("[recon] scoring complete")

	autoCreateParams := make([]generated.CreateTxnBatchParams, 0)
	autoCreateResultIdxs := make([]int, 0)

	for _, st := range tailRows {
		if st.TransactionDate == nil {
			continue
		}
		params := stmtTxnToCreateParams(payload.UserID, payload.AccountID, st)
		autoCreateParams = append(autoCreateParams, params)
		results = append(results, ReconciliationResult{
			UploadID:               payload.UploadID,
			StatementTransactionID: st.ID,
			AppTransactionID:       nil,
			ResultType:             string(generated.ReconciliationResultTypeMISSINGINAPP),
			ConfidenceScore:        100,
			MatchStatus:            "pending",
		})
		autoCreateResultIdxs = append(autoCreateResultIdxs, len(results)-1)
	}

	for i, res := range results {
		if res.ResultType == string(generated.ReconciliationResultTypeMISSINGINAPP) && res.AppTransactionID == nil {
			for _, st := range overlapRows {
				if st.ID == res.StatementTransactionID && st.TransactionDate != nil {
					params := stmtTxnToCreateParams(payload.UserID, payload.AccountID, st)
					autoCreateParams = append(autoCreateParams, params)
					autoCreateResultIdxs = append(autoCreateResultIdxs, i)
					break
				}
			}
		}
	}

	var createdIDs []uuid.UUID
	if len(autoCreateParams) > 0 {
		newIDs, err := s.repo.CreateAutoTransactionsBatch(ctx, autoCreateParams)
		if err != nil {
			return nil, fmt.Errorf("failed to auto-create transactions: %w", err)
		}
		createdIDs = newIDs
		for i, resultIdx := range autoCreateResultIdxs {
			if i < len(newIDs) && resultIdx >= 0 && resultIdx < len(results) {
				id := newIDs[i]
				results[resultIdx].AppTransactionID = &id
			}
		}
		log.Info().Int("auto_created", len(newIDs)).Msg("[recon] auto-created transactions")

		if s.balanceUpdater != nil {
			var totalIncome, totalExpense, totalBalance float64
			for _, p := range autoCreateParams {
				amt := utils.NumericToFloat64(p.Amount)
				switch p.Type {
				case generated.TxnTypeCREDIT, generated.TxnTypeINCOME,
					generated.TxnTypeREFUND, generated.TxnTypeINVESTMENT:
					totalIncome += amt
					totalBalance += amt
				case generated.TxnTypeDEBIT, generated.TxnTypeSUBSCRIPTION:
					totalExpense += amt
					totalBalance -= amt
				}
			}
			if err := s.balanceUpdater.ApplyBatch(ctx, payload.UserID, payload.AccountID, totalIncome, totalExpense, totalBalance); err != nil {
				log.Error().Err(err).Msg("[recon] failed to update balances after auto-create")
			}
		}
	}
	utils.LogMem("after_auto_create", log)

	for _, res := range highConfMatches {
		if res.AppTransactionID != nil {
			if err := s.repo.MarkTransactionAutoVerified(ctx, *res.AppTransactionID, res.StatementTransactionID); err != nil {
				log.Error().Err(err).Str("app_txn_id", res.AppTransactionID.String()).Msg("[recon] failed to mark transaction auto-verified")
			}
		}
	}
	utils.LogMem("after_auto_verify", log)

	if err := s.repo.InsertReconciliationResults(ctx, results); err != nil {
		return nil, fmt.Errorf("failed to insert reconciliation results: %w", err)
	}
	utils.LogMem("after_batch_insert", log)
	log.Info().Int("total_results", len(results)).Msg("[recon] inserted all reconciliation results")

	if err := s.repo.UpdateUploadProcessingStatus(ctx, payload.UploadID, generated.UploadProcessingStatusCOMPLETED, uuid.Nil); err != nil {
		log.Error().Err(err).Msg("[recon] failed to mark upload COMPLETED")
	}
	utils.LogMem("done", log)
	return createdIDs, nil
}

func scoreMatch(stmtAmount float64, stmtDesc, stmtRef string, stmtDate time.Time, at *AppTransaction) (MatchSignals, int) {
	signals := MatchSignals{}

	daysDiff := int(stmtDate.Sub(at.TransactionDate).Hours() / 24)
	if daysDiff < 0 {
		daysDiff = -daysDiff
	}
	signals.DateDiffDays = daysDiff
	switch {
	case daysDiff == 0:
		signals.DateScore = 40
	case daysDiff == 1:
		signals.DateScore = 30
	case daysDiff == 2:
		signals.DateScore = 20
	}

	amountDiff := stmtAmount - at.Amount
	if amountDiff < 0 {
		amountDiff = -amountDiff
	}
	var amountDiffPct float64
	if stmtAmount != 0 {
		amountDiffPct = (amountDiff / stmtAmount) * 100
	}
	signals.AmountDiff = amountDiff
	signals.AmountDiffPct = amountDiffPct
	switch {
	case amountDiff == 0:
		signals.AmountScore = 35
		signals.AmountDiff = 0
	case amountDiffPct <= 1:
		signals.AmountScore = 25
	case amountDiffPct <= 3:
		signals.AmountScore = 15
	}

	similarity := utils.TokenJaccard(stmtDesc, at.Description)
	signals.DescriptionSimilarity = similarity
	switch {
	case similarity >= 0.7:
		signals.DescriptionScore = 15
	case similarity >= 0.5:
		signals.DescriptionScore = 10
	case similarity >= 0.3:
		signals.DescriptionScore = 5
	}

	if stmtRef != "" && at.ReferenceNumber != "" && stmtRef == at.ReferenceNumber {
		signals.ReferenceScore = 10
		signals.ReferenceMatch = true
	}

	total := signals.DateScore + signals.AmountScore + signals.DescriptionScore + signals.ReferenceScore
	return signals, total
}

func stmtTxnToCreateParams(userID string, accountID uuid.UUID, st StatementTransaction) generated.CreateTxnBatchParams {
	source := generated.NullTransactionSource{
		TransactionSource: generated.TransactionSourceSTATEMENTAUTO,
		Valid:             true,
	}
	return generated.CreateTxnBatchParams{
		UserID:          userID,
		AccountID:       utils.UUIDToPgtype(accountID),
		ToAccountID:     utils.UUIDPtrToPgtype(nil),
		CategoryID:      utils.UUIDPtrToPgtype(nil),
		MerchantID:      utils.UUIDPtrToPgtype(nil),
		Type:            generated.TxnType(st.Type),
		Amount:          utils.Float64PtrToNum(&st.Amount),
		Description:     utils.StringPtrToText(st.Description),
		Tags:            utils.StringPtrToText(nil),
		SmsID:           utils.UUIDPtrToPgtype(nil),
		PaymentMethod:   utils.StringPtrToText(nil),
		ReferenceNumber: utils.StringPtrToText(st.ReferenceNumber),
		IsRecurring:     utils.BoolPtrToBool(nil),
		Notes:           utils.StringPtrToText(nil),
		TransactionDate: utils.TimestampToPgtype(*st.TransactionDate),
		Source:          source,
		StatementTxnID:  utils.UUIDToPgtype(st.ID),
	}
}

func parseXlsxRows(r interface {
	Read(p []byte) (n int, err error)
}, accountID uuid.UUID, uploadID uuid.UUID,
) ([]ParsedTxns, []ParseError, error) {
	ef, err := excelize.OpenReader(r)
	if err != nil {
		return nil, nil, err
	}
	defer ef.Close()

	sheets := ef.GetSheetList()
	if len(sheets) == 0 {
		return nil, nil, fmt.Errorf("no sheet found")
	}
	sheet := sheets[0]

	rowsIter, err := ef.Rows(sheet)
	if err != nil {
		return nil, nil, err
	}
	defer rowsIter.Close()

	var out []ParsedTxns
	var parseErrors []ParseError
	rowNum := 0

	for rowsIter.Next() {
		row, err := rowsIter.Columns()
		if err != nil {
			return nil, nil, err
		}
		rowNum++

		if rowNum == 1 {
			continue
		}
		if len(row) <= colDrCr {
			parseErrors = append(parseErrors, ParseError{Row: rowNum, Error: "insufficient columns", Data: map[string]interface{}{"cells": len(row)}})
			continue
		}

		txnDate, err := ParseExcelDate(row, colTxnDate)
		if err != nil {
			parseErrors = append(parseErrors, ParseError{Row: rowNum, Error: "invalid transaction date", Data: map[string]interface{}{"value": SafeCell(row, colTxnDate)}})
			continue
		}

		amount, err := ParseExcelAmount(row, colAmount)
		if err != nil {
			parseErrors = append(parseErrors, ParseError{Row: rowNum, Error: "invalid amount", Data: map[string]interface{}{"value": SafeCell(row, colAmount)}})
			continue
		}

		drCr := strings.TrimSpace(strings.ToUpper(SafeCell(row, colDrCr)))
		if drCr != "DR" && drCr != "CR" {
			parseErrors = append(parseErrors, ParseError{Row: rowNum, Error: "invalid Dr/Cr", Data: map[string]interface{}{"value": SafeCell(row, colDrCr)}})
			continue
		}

		desc := strings.TrimSpace(SafeCell(row, colDescription))
		hash := RowHash(txnDate, amount, drCr, desc)
		txnType := DEBIT
		if drCr == "CR" {
			txnType = CREDIT
		}

		out = append(out, ParsedTxns{
			UploadId:        uploadID,
			AccountId:       accountID,
			TxnDate:         txnDate,
			Description:     utils.PtrString(desc),
			Amount:          amount,
			Type:            txnType,
			ReferenceNumber: utils.PtrString(strings.TrimSpace(SafeCell(row, colChqRefNo))),
			RawRowHash:      &hash,
			RowNumber:       uint32(rowNum),
		})
	}

	return out, parseErrors, nil
}
