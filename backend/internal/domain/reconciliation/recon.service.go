package reconciliation

import (
	"fmt"
	"mime/multipart"

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
	}
	defer r.Close()
	ef, err := excelize.OpenReader(r)
	if err != nil {
		logger.Error().Err(err).Msg("Error opening file withj excelize")
	}
	defer ef.Close()
	sheets := ef.GetSheetList()
	if len(sheets) == 0 {
		return nil, fmt.Errorf("No sheet Found")
	}
	sheet := sheets[0]
	logger.Debug().Msgf("RAW SHEET DATA %s", sheet)
	parsedTxn := make([]ParsedTxns, 0, 1024)
	return parsedTxn, nil
}
