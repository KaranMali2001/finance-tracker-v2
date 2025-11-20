package account

import (
	"net/http"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type AccHandler struct {
	server  *server.Server
	base    handler.Handler
	service *AccService
}

func NewAccountHandler(s *server.Server, service *AccService) *AccHandler {
	return &AccHandler{
		server:  s,
		base:    handler.NewHandler(s),
		service: service,
	}
}

// CreateAccount godoc
// @Summary Create a new account
// @Description Creates a new financial account for the authenticated user
// @Tags Account
// @Accept json
// @Produce json
// @Param account body CreateAccountReq true "Account creation request"
// @Success 201 {object} Account
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /api/v1/account [post]
func (h *AccHandler) CreateAccount(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *CreateAccountReq) (*Account, error) {
			clerkId := middleware.GetUserID(c)
			return h.service.CreateAccount(c, payload, clerkId)
		}, http.StatusCreated, &CreateAccountReq{},
	)(c)
}

// GetAccountById godoc
// @Summary Get account by ID
// @Description Retrieves a specific account by its ID for the authenticated user
// @Tags Account
// @Produce json
// @Param account_id path string true "Account ID" format(uuid)
// @Success 200 {object} Account
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Not Found"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /api/v1/account/{account_id} [get]
func (h *AccHandler) GetAccountById(c echo.Context) error {
	return handler.Handle(h.base, func(c echo.Context, payload *GetAccountReq) (*Account, error) {
		clerkId := middleware.GetUserID(c)
		return h.service.GetAccountById(c, payload, clerkId)
	}, http.StatusOK, &GetAccountReq{})(c)
}

// GetAccountByUserId godoc
// @Summary Get all accounts for authenticated user
// @Description Retrieves all accounts associated with the authenticated user
// @Tags Account
// @Produce json
// @Success 200 {array} Account
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /api/v1/account [get]
func (h *AccHandler) GetAccountByUserId(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetAccountByUserId) ([]Account, error) {
			return h.service.GetAccountByUserId(c, middleware.GetUserID(c))
		},
		http.StatusOK,
		&GetAccountByUserId{},
	)(c)
}

// UpdateAccount godoc
// @Summary Update an existing account
// @Description Updates an existing account's information for the authenticated user
// @Tags Account
// @Accept json
// @Produce json
// @Param account body UpdateAccountReq true "Account update request"
// @Success 200 {object} Account
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Not Found"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /api/v1/account [put]
func (h *AccHandler) UpdateAccount(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *UpdateAccountReq) (*Account, error) {
			return h.service.UpdateAccount(c, payload, middleware.GetUserID(c))
		},
		http.StatusOK,
		&UpdateAccountReq{},
	)(c)
}
