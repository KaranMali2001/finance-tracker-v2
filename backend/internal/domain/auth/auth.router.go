package auth

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

// Module wires repository → service → handler and registers routes.
type Module struct {
	handler *AuthHandler
}

// Dependencies captures whatever infrastructure Auth needs.
// Expand this struct as you add actual dependencies (DB, Redis, JWT, etc.).
type Dependencies struct {
	Server *server.Server
}

func NewModule(deps Dependencies) *Module {
	// repo := NewAuthRepository(deps.Server)
	// service := NewAuthService(deps.Server) // later: pass repo into service
	handler := NewAuthHandler(deps.Server) // later: pass service into handler

	return &Module{handler: handler}
}

// RegisterRoutes attaches the auth endpoints.
func (m *Module) RegisterRoutes(e *echo.Echo) {

}
