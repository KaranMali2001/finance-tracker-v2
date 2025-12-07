package static

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler   *StaticHandler
	staticSvc *StaticService
}
type Dependencies struct {
	Server  *server.Server
	Queries *generated.Queries
}

func NewModule(deps Dependencies) *Module {
	repo := NewStaticRepository(deps.Server, deps.Queries)
	service := NewStaticService(deps.Server, repo)
	handler := NewStaticHandler(deps.Server, service)

	return &Module{
		handler:   handler,
		staticSvc: service,
	}
}

func (m *Module) GetService() *StaticService {
	return m.staticSvc
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server)
	g.GET("/static/bank", m.handler.GetBanks, authMiddleware.RequireAuth)
	g.GET("/static/categories", m.handler.GetCategories, authMiddleware.RequireAuth)
	g.GET("/static/merchants", m.handler.GetMerchants, authMiddleware.RequireAuth)
}
