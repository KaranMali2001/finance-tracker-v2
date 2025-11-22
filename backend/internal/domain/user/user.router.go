package user

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *UserHandler
}
type Deps struct {
	Server  *server.Server
	Queries *generated.Queries
}

func NewModule(deps Deps) *Module {
	repo := NewUserRepository(deps.Server, deps.Queries)
	service := NewUserService(deps.Server, repo)
	handler := NewUserHandler(deps.Server, service)
	return &Module{
		handler: handler,
	}
}
func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server).RequireAuth
	g.PUT("/user", m.handler.UpdateUser, authMiddleware)
}
