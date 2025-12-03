package transaction

import (
	"net/http"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type TxnHandler struct {
	server  *server.Server
	base    handler.Handler
	service *TxnService
}

func NewTxnHandler(s *server.Server, service *TxnService) *TxnHandler {
	return &TxnHandler{
		server:  s,
		base:    handler.NewHandler(s),
		service: service,
	}
}

// CreateTxn godoc
// @Summary Create a new transaction
// @Description Creates a new financial transaction for the authenticated user
// @Tags Transaction
// @Accept json
// @Produce json
// @Name CreateTxn
// @Param transaction body CreateTxnReq true "Transaction creation request"
// @Success 201 {object} Trasaction
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /transaction [post]
func (h *TxnHandler) CreateTxn(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *CreateTxnReq) (*Trasaction, error) {
			clerkId := middleware.GetUserID(c)
			return h.service.CreateTxn(c, payload, clerkId)
		}, http.StatusCreated, &CreateTxnReq{},
	)(c)
}

// GetTxnsWithFilters godoc
// @Summary Get transactions with filters
// @Description Retrieves transactions for the authenticated user with optional filters
// @Tags Transaction
// @Produce json
// @Name GetTxnsWithFilters
// @Param account_id query string false "Account ID" format(uuid)
// @Param category_id query string false "Category ID" format(uuid)
// @Param merchant_id query string false "Merchant ID" format(uuid)
// @Success 200 {array} Trasaction
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /transaction [get]
func (h *TxnHandler) GetTxnsWithFilters(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetTxnsWithFiltersReq) ([]*Trasaction, error) {
			clerkId := middleware.GetUserID(c)
			return h.service.GetTxnsWithFilters(c, payload, clerkId)
		},
		http.StatusOK,
		&GetTxnsWithFiltersReq{},
	)(c)
}

// SoftDeleteTxns godoc
// @Summary Soft delete transactions
// @Description Soft deletes multiple transactions for the authenticated user
// @Tags Transaction
// @Accept json
// @Produce json
// @Name SoftDeleteTxns
// @Param transaction body SoftDeleteTxnsReq true "Soft delete request"
// @Success 204 "No Content"
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /transaction [delete]
func (h *TxnHandler) SoftDeleteTxns(c echo.Context) error {
	return handler.HandleNoContent(
		h.base,
		func(c echo.Context, payload *SoftDeleteTxnsReq) error {
			clerkId := middleware.GetUserID(c)
			return h.service.SoftDeleteTxns(c, payload, clerkId)
		},
		http.StatusNoContent,
		&SoftDeleteTxnsReq{},
	)(c)
}

// ParseTxn godoc
// @Summary Parse transaction from image
// @Description Parses transaction information from an uploaded image using AI/OCR for the authenticated user
// @Tags Transaction
// @Accept multipart/form-data
// @Produce json
// @Name ParseTxn
// @Param image formData file true "Transaction image file (JPEG, PNG, GIF, WEBP)"
// @Success 200 {object} ParsedTxnRes
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /transaction/image-parse [post]
func (h *TxnHandler) ParseTxn(c echo.Context) error {
	return handler.HandleUpload(h.base, func(c echo.Context, payload *ParseTxnImgReq) (*ParsedTxnRes, error) {
		return h.service.ParseTxnImage(c, payload, middleware.GetUserID(c))
	},
		http.StatusOK,
		&ParseTxnImgReq{},
	)(c)
}
