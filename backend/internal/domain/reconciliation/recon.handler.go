package reconciliation

import (
	"net/http"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type ReconHandler struct {
	server  *server.Server
	base    handler.Handler
	service *ReconService
}

func NewReconHandler(s *server.Server, svc *ReconService) *ReconHandler {

	return &ReconHandler{
		server:  s,
		base:    handler.NewHandler(s),
		service: svc,
	}
}

// UploadAndProcessBankStatement godoc
// @Summary Upload bank statement for reconciliation
// @Description Uploads a bank statement Excel file and starts reconciliation processing
// @Tags Reconciliation
// @Accept multipart/form-data
// @Produce json
// @Name UploadAndProcessBankStatement
// @Param statement formData file true "Bank statement Excel file (.xls, .xlsx)"
// @Param statement_period_start formData string true "Statement period start" format(date-time)
// @Param statement_period_end formData string true "Statement period end" format(date-time)
// @Param account_id formData string true "Account ID" format(uuid)
// @Param user_id formData string true "User ID (Clerk ID)"
// @Param file_name formData string true "Original file name"
// @Success 202 {object} UploadStatementRes
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /reconciliation/upload [post]
func (h *ReconHandler) UploadAndProcessBankStatement(c echo.Context) error {
	return handler.HandleUploadStatementExcel(h.base, func(c echo.Context, payload *ParseExcelReq) (any, error) {
		return h.service.ParseAndProcessStatement(c, payload)
	},
		http.StatusAccepted,
		&ParseExcelReq{},
	)(c)
}
