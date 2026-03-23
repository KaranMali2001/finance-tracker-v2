package dashboard

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *DashboardHandler
}

type Deps struct {
	Server  *server.Server
	Queries dashboardQuerier
}

func NewDashboardModule(deps Deps) *Module {
	repo := NewDashboardRepository(deps.Queries)
	service := NewDashboardService(repo)
	handler := NewDashboardHandler(deps.Server, service)
	return &Module{handler: handler}
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server).RequireAuth
	g.GET("/dashboard/stream", m.handler.GetDashboard, authMiddleware)
}
