package auth

import "github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"

type AuthRepository struct{}

func NewAuthRepository(s *server.Server) *AuthRepository {
	return &AuthRepository{}
}
