package transaction

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/static"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/user"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	aiservices "github.com/KaranMali2001/finance-tracker-v2-backend/internal/services/aiServices"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *TxnHandler
}

type Deps struct {
	Server    *server.Server
	Queries   *generated.Queries
	UserSvc   *user.UserService
	GeminiSvc *aiservices.GeminiService
	StaticSvc *static.StaticService
}

func NewTxnModule(deps Deps) *Module {
	repo := NewTxnRepository(deps.Server, deps.Queries)
	service := NewTxnService(deps.Server, repo, deps.UserSvc, deps.GeminiSvc, deps.StaticSvc)
	handler := NewTxnHandler(deps.Server, service)

	return &Module{
		handler: handler,
	}
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server).RequireAuth
	g.POST("/transaction", m.handler.CreateTxn, authMiddleware)
	g.GET("/transaction", m.handler.GetTxnsWithFilters, authMiddleware)
	g.PUT("/transaction/:id", m.handler.UpdateTxn, authMiddleware)
	g.DELETE("/transaction", m.handler.SoftDeleteTxns, authMiddleware)
	g.POST("/transaction/image-parse", m.handler.ParseTxn, authMiddleware)
}
