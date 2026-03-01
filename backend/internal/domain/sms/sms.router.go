package sms

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *SmsHandler
}
type Deps struct {
	Server  *server.Server
	Queries smsQuerier
}

func NewSmsModule(deps Deps) *Module {
	repo := NewSmsRepository(deps.Queries)
	service := NewSmsService(repo)
	handler := NewSmsHandler(deps.Server, service)

	return &Module{
		handler: handler,
	}
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	authMiddleware := middleware.NewAuthMiddleware(m.handler.server).RequireAuth
	g.GET("/sms", m.handler.GetSmses, authMiddleware)
	g.GET("/sms/:id", m.handler.GetSmsById, authMiddleware)
	g.POST("/sms", m.handler.CreateSms, authMiddleware)
	g.DELETE("/sms/:id", m.handler.DeleteSms, authMiddleware)
}
