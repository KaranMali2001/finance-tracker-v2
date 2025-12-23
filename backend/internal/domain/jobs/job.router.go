package jobs

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	repo *JobRepository
}

type Deps struct {
	Server  *server.Server
	Queries *generated.Queries
}

func NewModule(deps Deps) *Module {
	repo := NewJobRepository(deps.Queries)
	return &Module{
		repo: repo,
	}
}

func (m *Module) GetJobRepository() *JobRepository {
	return m.repo
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	// Jobs module doesn't expose HTTP endpoints directly
	// Jobs are managed internally through the queue system
}
