package reconciliation

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *ReconHandler
	service *ReconService
}

type Deps struct {
	Server         *server.Server
	Queries        reconQuerier
	TxnManager     *database.TxManager
	TaskService    reconTaskService
	BalanceUpdater balanceApplier
	UserService    userThresholdProvider
}

func NewReconiliationModule(deps Deps) *Module {
	repo := NewReconRepository(deps.Queries, deps.TxnManager)
	service := NewReconService(repo, deps.TxnManager, deps.TaskService, deps.BalanceUpdater, deps.UserService)
	handler := NewReconHandler(deps.Server, service)

	return &Module{
		handler: handler,
		service: service,
	}
}

func (m *Module) GetService() *ReconService {
	return m.service
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server).RequireAuth
	g.POST("/reconciliation/upload", m.handler.UploadAndProcessBankStatement, authMiddleware)
	g.GET("/reconciliation/uploads", m.handler.ListUploads, authMiddleware)
	g.GET("/reconciliation/uploads/:upload_id", m.handler.GetUploadByID, authMiddleware)
	g.GET("/reconciliation/uploads/:upload_id/detail", m.handler.GetUploadDetail, authMiddleware)
	g.GET("/reconciliation/uploads/:upload_id/results", m.handler.GetResults, authMiddleware)
	g.PATCH("/reconciliation/results/status", m.handler.BulkUpdateResultStatus, authMiddleware)
	g.DELETE("/reconciliation/uploads/:upload_id", m.handler.DeleteUpload, authMiddleware)
}
