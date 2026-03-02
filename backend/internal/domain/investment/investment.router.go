package investment

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *InvestmentHandler
}

type Deps struct {
	Server      *server.Server
	Queries     investmentQuerier
	Tm          *database.TxManager
	TaskService investmentTaskService
}

func NewInvestmentModule(deps Deps) *Module {
	repo := NewInvestMentRepository(deps.Queries, deps.Tm)
	service := NewInvestMentService(repo, deps.TaskService)
	h := NewInvestmentHandler(deps.Server, service)
	return &Module{handler: h}
}

func (m *Module) GetService() *InvestmentService {
	return m.handler.service
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	auth := middleware.NewAuthMiddleware(m.handler.server).RequireAuth

	// Goals
	g.POST("/investment/goal", m.handler.CreateNewGoal, auth)
	g.GET("/investment/goal", m.handler.GetGoalsWithFilter, auth)
	g.GET("/investment/goal/:id", m.handler.GetGoalById, auth)
	g.PUT("/investment/goal/:id", m.handler.UpdateGoals, auth)
	g.DELETE("/investment/goal/:id", m.handler.DeleteGoal, auth)
	g.GET("/investment/goal/:goal_id/transactions", m.handler.GetGoalTransactionsByGoal, auth)

	// Investment rules
	g.POST("/investment/rule", m.handler.CreateGoalInvestment, auth)
	g.GET("/investment/rule", m.handler.GetGoalInvestments, auth)
	g.GET("/investment/rule/:id", m.handler.GetGoalInvestmentById, auth)
	g.PUT("/investment/rule/:id", m.handler.UpdateGoalInvestment, auth)
	g.DELETE("/investment/rule/:id", m.handler.DeleteGoalInvestment, auth)
	g.GET("/investment/rule/:investment_id/transactions", m.handler.GetGoalTransactionsByInvestment, auth)

	// Transaction linking
	g.POST("/investment/link", m.handler.LinkTransaction, auth)
	g.DELETE("/investment/link/:id", m.handler.UnlinkTransaction, auth)

	// Auto-link job
	g.POST("/investment/autolink", m.handler.EnqueueAutoLink, auth)
}
