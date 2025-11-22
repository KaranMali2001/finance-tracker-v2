package system

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	echoSwagger "github.com/swaggo/echo-swagger"

	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *SystemHandler
}

type Dependencies struct {
	Server *server.Server
}

func NewModule(deps Dependencies) *Module {
	handler := NewSystemHandler(deps.Server)
	return &Module{handler: handler}
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	g.GET("/health", m.handler.CheckHealth)

	g.GET("/swagger/*", echoSwagger.WrapHandler)
	g.Static("/static", "static")
}
