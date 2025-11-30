package static

import (
	"net/http"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type StaticHandler struct {
	server  *server.Server
	service *StaticService
	base    handler.Handler
}

func NewStaticHandler(s *server.Server, svc *StaticService) *StaticHandler {
	return &StaticHandler{
		server:  s,
		service: svc,
		base:    handler.NewHandler(s),
	}
}

// GetBanks godoc
// @Summary Get all banks
// @Description Retrieves a list of all available banks
// @Tags Static
// @Produce json
// @Success 200 {array} Bank
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /static/bank [get]
func (h *StaticHandler) GetBanks(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *EmptyStruct) ([]Bank, error) {
			return h.service.GetBanks(c)
		},
		http.StatusOK,
		&EmptyStruct{},
	)(c)
}

// GetCategories godoc
// @Summary Get all categories
// @Description Retrieves a list of all available transaction categories
// @Tags Static
// @Produce json
// @Success 200 {array} Categories
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /static/categories [get]
func (h *StaticHandler) GetCategories(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *EmptyStruct) ([]Categories, error) {
			return h.service.GetCategories(c)
		},
		http.StatusOK,
		&EmptyStruct{},
	)(c)
}

// GetMerchants godoc
// @Summary Get all merchants
// @Description Retrieves a list of all available merchants
// @Tags Static
// @Produce json
// @Success 200 {array} Merchants
// @Failure 401 {object} map[string]string "Unauthorized"
// @Failure 500 {object} map[string]string "Internal Server Error"
// @Router /static/merchants [get]
func (h *StaticHandler) GetMerchants(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, payload *EmptyStruct) ([]Merchants, error) {
			return h.service.GetMerchants(c)
		},
		http.StatusOK,
		&EmptyStruct{},
	)(c)
}
