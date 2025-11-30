package static

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *StaticHandler
}
type Dependencies struct {
	Server  *server.Server
	Queries *generated.Queries
}

func NewModule(deps Dependencies) *Module {
	repo := NewStaticRepository(deps.Server, deps.Queries)
	service := NewStaticService(deps.Server, repo)
	handler := NewStaticHandler(deps.Server, service)

	return &Module{handler: handler}
}
func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server)
	g.GET("/static/bank", m.handler.GetBanks, authMiddleware.RequireAuth)
	g.GET("/static/categories", m.handler.GetCategories, authMiddleware.RequireAuth)
	g.GET("/static/merchants", m.handler.GetMerchants, authMiddleware.RequireAuth)

}
