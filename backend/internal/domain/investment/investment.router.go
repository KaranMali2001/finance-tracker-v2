package investment

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *InvestmentHandler
}

type Deps struct {
	Server  *server.Server
	Queries *generated.Queries
	Tm      *database.TxManager
}

func NewInvestmentModule(deps Deps) *Module {
	repo := NewInvestMentRepository(deps.Queries, deps.Tm)
	service := NewInvestMentService(repo)
	handler := NewInvestmentHandler(deps.Server, service)

	return &Module{
		handler: handler,
	}
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server).RequireAuth
	g.POST("/investment/goal", m.handler.CreateNewGoal, authMiddleware)
	g.GET("/investment/goal", m.handler.GetGoalsWithFilter, authMiddleware)
	g.GET("/investment/goal/:id", m.handler.GetGoalById, authMiddleware)
	g.PUT("/investment/goal/:id", m.handler.UpdateGoals, authMiddleware)
}
