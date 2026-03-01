package user

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *UserHandler
	service *UserService
	repo    *UserRepository
}
type Deps struct {
	Server     *server.Server
	Queries    userQuerier
	TxnManager *database.TxManager
}

func NewModule(deps Deps) *Module {
	repo := NewUserRepository(deps.Queries, deps.TxnManager)
	service := NewUserService(repo)
	handler := NewUserHandler(deps.Server, service)
	return &Module{
		handler: handler,
		service: service,
		repo:    repo,
	}
}

func (m *Module) GetUserRepository() *UserRepository {
	return m.repo
}

func (m *Module) GetUserService() *UserService {
	return m.service
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server).RequireAuth
	g.PUT("/user", m.handler.UpdateUser, authMiddleware)
	g.GET("/user/generate-api-key", m.handler.GenerateApiKey, authMiddleware)
}
