package auth

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/queue"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/tasks"
	"github.com/labstack/echo/v4"
)

// Module wires repository → service → handler and registers routes.
type Module struct {
	handler *AuthHandler
}

// Dependencies captures whatever infrastructure Auth needs.
// Expand this struct as you add actual dependencies (DB, Redis, JWT, etc.).
type Dependencies struct {
	Server       *server.Server
	Queries      *generated.Queries
	TaskService  *tasks.TaskService
	QueueService *queue.JobService
}

func NewModule(deps Dependencies) *Module {
	repo := NewAuthRepository(deps.Server, deps.Queries)
	service := NewAuthService(deps.Server, repo, deps.TaskService, deps.QueueService)
	handler := NewAuthHandler(deps.Server, service)

	return &Module{handler: handler}
}

// RegisterRoutes attaches the auth endpoints.
func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server)
	g.POST("/webhook/clerk", m.handler.CreateUser)
	g.GET("/auth/user", m.handler.GetAuthUser, authMiddleware.RequireAuth)

}
