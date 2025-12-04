package sms

import (
	"net/http"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type SmsHandler struct {
	server  *server.Server
	service *SmsService
	base    handler.Handler
}

func NewSmsHanlder(server *server.Server, svc *SmsService) *SmsHandler {
	return &SmsHandler{
		server:  server,
		service: svc,
		base:    handler.NewHandler(server),
	}
}

// GetSmses godoc
// @Summary Get all SMS logs
// @Description Retrieves all SMS logs for the authenticated user
// @Tags SMS
// @Produce json
// @Name GetSmses
// @Success 200 {array} SmsLogs
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /sms [get]
func (h *SmsHandler) GetSmses(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetSmsesReq) ([]SmsLogs, error) {
			return h.service.GetSmses(c, payload, middleware.GetUserID(c))
		},
		http.StatusOK,
		&GetSmsesReq{},
	)(c)
}

// GetSmsById godoc
// @Summary Get SMS log by ID
// @Description Retrieves a specific SMS log by its ID for the authenticated user
// @Tags SMS
// @Produce json
// @Name GetSmsById
// @Param id path string true "SMS ID" format(uuid)
// @Success 200 {object} SmsLogs
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 404 {object} map[string]string "Not Found"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /sms/{id} [get]
func (h *SmsHandler) GetSmsById(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *GetSmsByIdReq) (*SmsLogs, error) {

			return h.service.GetSmsById(c, payload, middleware.GetUserID(c))
		},
		http.StatusOK,
		&GetSmsByIdReq{},
	)(c)
}

// CreateSms godoc
// @Summary Create a new SMS log
// @Description Creates a new SMS log entry
// @Tags SMS
// @Accept json
// @Produce json
// @Name CreateSms
// @Param sms body CreateSmsReq true "SMS creation request"
// @Success 201 {object} SmsLogs
// @Failure 400 {object} map[string]string "Bad Request"
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /sms [post]
func (h *SmsHandler) CreateSms(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *CreateSmsReq) (*SmsLogs, error) {
			return h.service.CreateSms(c, payload, middleware.GetUserID(c))
		},
		http.StatusCreated,
		&CreateSmsReq{},
	)(c)
}
