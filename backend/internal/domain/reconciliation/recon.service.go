package reconciliation

import (
	"encoding/csv"
	"fmt"
	"io"
	"mime/multipart"
	"path/filepath"
	"strings"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/errs"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
	"github.com/rs/zerolog"
	"github.com/xuri/excelize/v2"
)

type ReconService struct {
	server *server.Server
}

func NewReconService(s *server.Server) *ReconService {
	return &ReconService{
		server: s,
	}
}

// this func will just parse the xlss file and return it
func (s *ReconService) ParseAndProcessStatement(c echo.Context, payload *ParseExcelReq) ([]ParsedTxns, error) {
	log := middleware.GetLogger(c)

	txns, err := ParseStatement(c, log)
	if err != nil {
		return nil, err
	}
	return txns, nil
	//here we will call two services , one is to parse the excel and update bank_statement_upload

	//we will take that array and put it into different service create a hash and try to put it in statement_transaction
}
func ParseStatement(c echo.Context, logger *zerolog.Logger) ([]ParsedTxns, error) {
	f, ok := c.Get(handler.StatementContextKey).(*multipart.FileHeader)
	if !ok || f == nil {
		return nil, fmt.Errorf("Statement File not found")
	}

	r, err := f.Open()

	if err != nil {
		logger.Error().Err(err).Msg("Error while opening the file")
		return nil, err
	}
	defer r.Close()

	ext := strings.ToLower(filepath.Ext(f.Filename))

	switch ext {
	case ".csv": {
		reader := csv.NewReader(r)
		reader.FieldsPerRecord = -1

		rowIndex := 0
		for {
			record, readErr := reader.Read()
			if readErr == io.EOF {
				break
			}
			if readErr != nil {
				logger.Error().Err(readErr).Int("row_index", rowIndex).Msg("Error reading CSV row")
				return nil, readErr
			}

			logger.Debug().
				Int("row_index", rowIndex).
				Interface("row", record).
				Msg("Statement row (csv)")
			rowIndex++
		}

		logger.Info().Int("row_count", rowIndex).Msg("Statement parsed (csv)")
	}

	case ".xlsx": {
		ef, openErr := excelize.OpenReader(r)
		if openErr != nil {
			logger.Error().Err(openErr).Msg("Error opening file with excelize")
			return nil, openErr
		}
		defer ef.Close()

		sheets := ef.GetSheetList()
		if len(sheets) == 0 {
			return nil, fmt.Errorf("No sheet Found")
		}
		sheet := sheets[0]
		logger.Debug().Str("sheet", sheet).Msg("Selected sheet")

		rows, rowsErr := ef.Rows(sheet)
		if rowsErr != nil {
			logger.Error().Err(rowsErr).Msg("Error creating row iterator")
			return nil, rowsErr
		}
		defer rows.Close()

		rowIndex := 0
		for rows.Next() {
			cols, colErr := rows.Columns()
			if colErr != nil {
				logger.Error().Err(colErr).Int("row_index", rowIndex).Msg("Error reading XLSX row columns")
				return nil, colErr
			}

			logger.Debug().
				Int("row_index", rowIndex).
				Interface("row", cols).
				Msg("Statement row (xlsx)")
			rowIndex++
		}

		logger.Info().Int("row_count", rowIndex).Msg("Statement parsed (xlsx)")
	}

	case ".xls": {
		// excelize does not support the legacy binary .xls format.
		// If you want .xls support, you'll need a converter to .xlsx (e.g. LibreOffice headless)
		// or a dedicated .xls parser library.
		return nil, errs.NewBadRequestError("Unsupported statement format: .xls. Please upload .xlsx or .csv", false, nil, nil, nil)
	}

	default: {
		return nil, errs.NewBadRequestError("Unsupported statement format. Please upload .xlsx or .csv", false, nil, nil, nil)
	}
	}

	parsedTxn := make([]ParsedTxns, 0, 1024)
	return parsedTxn, nil
}
