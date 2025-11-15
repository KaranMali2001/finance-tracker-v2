package auth

import "github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"

type AuthService struct {
	server *server.Server
}

func NewAuthService(s *server.Server) *AuthService {
	return &AuthService{
		server: s,
	}
}
