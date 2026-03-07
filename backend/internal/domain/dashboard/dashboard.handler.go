package dashboard

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/validation"
	"github.com/labstack/echo/v4"
)

type DashboardHandler struct {
	server  *server.Server
	service *DashboardService
}

func NewDashboardHandler(s *server.Server, service *DashboardService) *DashboardHandler {
	return &DashboardHandler{server: s, service: service}
}

// StreamDashboard godoc
// @Summary      Stream dashboard data via SSE
// @Description  Opens a Server-Sent Events stream. Each card's data is emitted as a separate event as soon as the query finishes. Event names: net_worth_trend, spend_by_category, budget_health, goal_progress, account_balances, portfolio_mix, done.
// @Tags         Dashboard
// @Produce      text/event-stream
// @Param        date_from  query  string  true  "Start date (YYYY-MM-DD)"
// @Param        date_to    query  string  true  "End date (YYYY-MM-DD)"
// @Success      200
// @Failure      400  {object}  map[string]string
// @Failure      401  {object}  map[string]string
// @Router       /dashboard/stream [get]
func (h *DashboardHandler) StreamDashboard(c echo.Context) error {
	req := &GetDashboardReq{}
	if err := validation.BindAndValidate(c, req); err != nil {
		return err
	}

	clerkID := middleware.GetUserID(c)

	w := c.Response()
	w.Header().Set("Content-Type", "text/event-stream")
	w.Header().Set("Cache-Control", "no-cache")
	w.Header().Set("Connection", "keep-alive")
	w.Header().Set("X-Accel-Buffering", "no")
	w.WriteHeader(http.StatusOK)

	writeSSE := func(event string, data any) {
		payload, _ := json.Marshal(data)
		fmt.Fprintf(w, "event: %s\ndata: %s\n\n", event, payload)
		w.Flush()
	}

	events := make(chan DashboardEvent, 6)
	ctx := c.Request().Context()

	go func() {
		h.service.StreamDashboard(ctx, clerkID, req.DateFrom, req.DateTo, events)
		close(events)
	}()

	timeout := time.After(30 * time.Second)
	for {
		select {
		case ev, ok := <-events:
			if !ok {
				writeSSE("done", map[string]bool{"done": true})
				return nil
			}
			writeSSE(ev.Card, map[string]any{"data": ev.Data, "error": ev.Error})
		case <-ctx.Done():
			return nil
		case <-timeout:
			writeSSE("done", map[string]bool{"done": true})
			return nil
		}
	}
}
