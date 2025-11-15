package auth

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
)

type AuthHandler struct {
	base   handler.Handler
	server *server.Server
}

func NewAuthHandler(s *server.Server) *AuthHandler {
	return &AuthHandler{
		base:   handler.NewHandler(s),
		server: s,
	}
}
