package auth

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *AuthHandler
}

type Dependencies struct {
	Server      *server.Server
	Queries     authQuerier
	TaskService authTaskService
}

func NewModule(deps Dependencies) *Module {
	repo := NewAuthRepository(deps.Queries)
	service := NewAuthService(repo, deps.TaskService)
	handler := NewAuthHandler(deps.Server, service)

	return &Module{handler: handler}
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server)
	g.POST("/webhook/clerk", m.handler.CreateUser)
	g.GET("/auth/user", m.handler.GetAuthUser, authMiddleware.RequireAuth)
}
