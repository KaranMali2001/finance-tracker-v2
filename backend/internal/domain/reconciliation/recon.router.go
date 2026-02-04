package reconciliation

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *ReconHandler
}

type Deps struct {
	Server  *server.Server
	Queries *generated.Queries
}

func NewReconiliationModule(deps Deps) *Module {
	repo := NewReconRepository(deps.Queries)
	service := NewReconService(deps.Server, repo)
	handler := NewReconHandler(deps.Server, service)

	return &Module{
		handler: handler,
	}
}
func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server).RequireAuth
	g.POST("/reconciliation/upload", m.handler.UploadAndProcessBankStatement, authMiddleware)
}
