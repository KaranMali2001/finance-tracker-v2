package account

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *AccHandler
}
type Deps struct {
	Server  *server.Server
	Queries *generated.Queries
}

func NewAccountModule(deps Deps) *Module {
	repo := NewAccRepo(deps.Server, deps.Queries)
	service := NewAccountService(deps.Server, repo)
	handler := NewAccountHandler(deps.Server, service)

	return &Module{
		handler: handler,
	}
}
func (m *Module) RegisterRoutes(g *echo.Group) {

	authMiddleware := middleware.NewAuthMiddleware(m.handler.server).RequireAuth
	g.POST("/account", m.handler.CreateAccount, authMiddleware)
	g.GET("/account/:account_id", m.handler.GetAccountById, authMiddleware)
	g.GET("/account", m.handler.GetAccountsByUserId, authMiddleware)
	g.PUT("/account", m.handler.UpdateAccount, authMiddleware)
}
