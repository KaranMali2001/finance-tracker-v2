package jobs

import (
	"github.com/labstack/echo/v4"
)

type Module struct {
	repo *JobRepository
}

type Deps struct {
	Queries jobQuerier
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
}
