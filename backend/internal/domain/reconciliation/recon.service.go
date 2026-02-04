package reconciliation

import (
	"fmt"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/errs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
	"github.com/xuri/excelize/v2"
)

// Bank statement Excel column indices (0-based). Header: Sl. No. | Transaction Date | Value Date | Description | Chq/Ref No. | Amount | Dr/Cr | Balance
const (
	colTxnDate     = 1
	colDescription = 3
	colChqRefNo    = 4
	colAmount      = 5
	colDrCr        = 6
)

type ReconService struct {
	server *server.Server
	repo   *ReconRepository
}

func NewReconService(s *server.Server, repo *ReconRepository) *ReconService {
	return &ReconService{
		server: s,
		repo:   repo,
	}
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

		uploadID, err := s.repo.CreateUpload(ctx, payload.UserId, payload.AccountId, payload.FileName, "", "", 0, payload.StatementPeriodStart, payload.StatementPeriodEnd)
		if err != nil {
			log.Error().Err(err).Msg("Failed to create bank statement upload")
			return nil, err
		}

		for i := range rows {
			rows[i].UploadId = uploadID
			rows[i].AccountId = payload.AccountId
		}

		insertedHashes, err := s.repo.InsertStatementTransactions(ctx, rows)
		if err != nil {
			log.Error().Err(err).Msg("Failed to insert statement transactions")
			return nil, err
		}

		MarkDuplicatesFromInsertedSet(rows, insertedHashes)
		summary := SummaryFromRows(rows, parseErrors)

		return &UploadStatementRes{
			UploadId: uploadID,
			JobId:    uuid.Nil,
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

func parseXlsxRows(r interface {
	Read(p []byte) (n int, err error)
}, accountID uuid.UUID, uploadID uuid.UUID) ([]ParsedTxns, []ParseError, error) {
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

		hash := RowHash(txnDate, amount, drCr)
		txnType := DEBIT
		if drCr == "CR" {
			txnType = CREDIT
		}

		out = append(out, ParsedTxns{
			UploadId:        uploadID,
			AccountId:       accountID,
			TxnDate:         txnDate,
			Description:     PtrString(strings.TrimSpace(SafeCell(row, colDescription))),
			Amount:          amount,
			Type:            txnType,
			ReferenceNumber: PtrString(strings.TrimSpace(SafeCell(row, colChqRefNo))),
			RawRowHash:      &hash,
			RowNumber:       uint32(rowNum),
		})
	}

	return out, parseErrors, nil
}
