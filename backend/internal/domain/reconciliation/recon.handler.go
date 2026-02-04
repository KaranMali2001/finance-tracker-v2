package reconciliation

import (
	"net/http"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
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

// ListUploads godoc
// @Summary List bank statement uploads
// @Description Returns all bank statement uploads for the authenticated user
// @Tags Reconciliation
// @Produce json
// @Success 200 {array} UploadListItem
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /reconciliation/uploads [get]
func (h *ReconHandler) ListUploads(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *ListUploadsReq) ([]UploadListItem, error) {
			clerkId := middleware.GetUserID(c)
			return h.service.ListUploads(c, payload, clerkId)
		},
		http.StatusOK,
		&ListUploadsReq{},
	)(c)
}

// GetUploadByID godoc
// @Summary Get bank statement upload by ID
// @Description Returns details for a single bank statement upload
// @Tags Reconciliation
// @Produce json
// @Param upload_id path string true "Upload ID" format(uuid)
// @Success 200 {object} UploadDetail
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Not Found"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /reconciliation/uploads/{upload_id} [get]
func (h *ReconHandler) GetUploadByID(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetUploadByIDReq) (*UploadDetail, error) {
			clerkId := middleware.GetUserID(c)
			return h.service.GetUploadByID(c, payload, clerkId)
		},
		http.StatusOK,
		&GetUploadByIDReq{},
	)(c)
}

// DeleteUpload godoc
// @Summary Delete bank statement upload
// @Description Deletes a bank statement upload and all related statement transactions and reconciliation data. Unlinks any app transactions that were linked to this upload.
// @Tags Reconciliation
// @Param upload_id path string true "Upload ID" format(uuid)
// @Success 204 "No Content"
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Not Found"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /reconciliation/uploads/{upload_id} [delete]
func (h *ReconHandler) DeleteUpload(c echo.Context) error {
	return handler.HandleNoContent(
		h.base,
		func(c echo.Context, payload *DeleteUploadReq) error {
			clerkId := middleware.GetUserID(c)
			return h.service.DeleteUpload(c, payload, clerkId)
		},
		http.StatusNoContent,
		&DeleteUploadReq{},
	)(c)
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
