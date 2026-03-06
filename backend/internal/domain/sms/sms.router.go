package sms

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *SmsHandler
	server  *server.Server
	userSvc smsUserProvider
}

type Deps struct {
	Server     *server.Server
	Queries    smsQuerier
	AccQueries accountQuerier
	UserSvc    smsUserProvider

	TxnSvc     smsTxnCreator
	LlmTaskSvc smsLlmTaskEnqueuer
}

func NewSmsModule(deps Deps) *Module {
	repo := NewSmsRepository(deps.Queries, deps.AccQueries)
	service := NewSmsService(repo, deps.TxnSvc, deps.LlmTaskSvc, deps.UserSvc)
	handler := NewSmsHandler(deps.Server, service)

	return &Module{
		handler: handler,
		server:  deps.Server,
		userSvc: deps.UserSvc,
	}
}

func (m *Module) RegisterRoutes(g *echo.Group) {
	clerkAuth := middleware.NewAuthMiddleware(m.server).RequireAuth
	deviceAuth := middleware.NewDeviceAuthMiddleware(m.userSvc).RequireDeviceAuth

	g.GET("/sms", m.handler.GetSmses, clerkAuth)
	g.GET("/sms/:id", m.handler.GetSmsById, clerkAuth)
	g.POST("/sms", m.handler.CreateSms, deviceAuth)
	g.DELETE("/sms/:id", m.handler.DeleteSms, clerkAuth)
}
