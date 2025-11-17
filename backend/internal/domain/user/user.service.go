package user

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type UserService struct {
	server     *server.Server
	repository *UserRepository
}

func NewUserService(s *server.Server, r *UserRepository) *UserService {
	return &UserService{
		server:     s,
		repository: r,
	}

}

func (s *UserService) UpdateUser(c echo.Context, payload *UpdateUserReq, clerkId string) (*User, error) {
	log := middleware.GetLogger(c)
	log.Info().Msgf("updating user with clerkID %v", clerkId)
	updatedUser, err := s.repository.UpdateUser(c.Request().Context(), payload, clerkId)
	if err != nil {
		log.Error().Err(err).Msgf("Failed to update the user with payload %v", payload)
		return nil, err
	}
	return updatedUser, nil
}
