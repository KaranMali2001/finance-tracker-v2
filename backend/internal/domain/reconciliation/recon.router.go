package reconciliation

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *ReconHandler
}

type Deps struct {
	Server     *server.Server
	Queries    *generated.Queries
	TxnManager *database.TxManager
}

func NewReconiliationModule(deps Deps) *Module {
	repo := NewReconRepository(deps.Queries, deps.TxnManager)
	service := NewReconService(deps.Server, repo, deps.TxnManager)
	handler := NewReconHandler(deps.Server, service)

	return &Module{
		handler: handler,
	}
}
func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server).RequireAuth
	g.POST("/reconciliation/upload", m.handler.UploadAndProcessBankStatement, authMiddleware)
	g.GET("/reconciliation/uploads", m.handler.ListUploads, authMiddleware)
	g.GET("/reconciliation/uploads/:upload_id", m.handler.GetUploadByID, authMiddleware)
	g.DELETE("/reconciliation/uploads/:upload_id", m.handler.DeleteUpload, authMiddleware)
}
