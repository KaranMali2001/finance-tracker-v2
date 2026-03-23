package dashboard

import (
	"net/http"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type DashboardHandler struct {
	server  *server.Server
	base    handler.Handler
	service *DashboardService
}

func NewDashboardHandler(s *server.Server, service *DashboardService) *DashboardHandler {
	return &DashboardHandler{server: s, base: handler.NewHandler(), service: service}
}

// GetDashboard godoc
// @Summary      Get all dashboard data
// @Description  Returns all dashboard cards data in a single JSON response. Queries run in parallel.
// @Tags         Dashboard
// @Produce      json
// @Param        date_from  query  string  true  "Start date (YYYY-MM-DD)"
// @Param        date_to    query  string  true  "End date (YYYY-MM-DD)"
// @Success      200  {object}  DashboardRes
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /dashboard/stream [get]
func (h *DashboardHandler) GetDashboard(c echo.Context) error {
	return handler.Handle(
		h.base,
		func(c echo.Context, req *GetDashboardReq) (*DashboardRes, error) {
			clerkID := middleware.GetUserID(c)
			return h.service.GetDashboard(c.Request().Context(), clerkID, req.DateFrom, req.DateTo)
		}, http.StatusOK, &GetDashboardReq{},
	)(c)
}
