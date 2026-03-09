package auth

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/labstack/echo/v4"
)

type AuthService struct {
	repository      authRepository
	authTaskService authTaskService
}

func NewAuthService(r authRepository, ts authTaskService) *AuthService {
	return &AuthService{
		repository:      r,
		authTaskService: ts,
	}
}

func (s *AuthService) CreateUser(c echo.Context, user *UserCreateRequest) (*UserResponse, error) {
	logger := middleware.GetLogger(c)
	logger.Info().Msg("Creating user through clerk webhook")
	userData, err := s.repository.CreateUser(c.Request().Context(), user)
	if err != nil {
		logger.Error().Err(err).Msg("Failed to create user")
		return nil, err
	}

	logger.Info().Str("event", "user_created").Str("user_id", userData.Id).Msg("User created successfully")
	if err := s.authTaskService.EnqueueWelcomeEmail(c.Request().Context(), userData.Email, userData.Id, logger); err != nil {
		logger.Error().Err(err).Msg("failed to enqueue welcome email job")
	} else {
		logger.Info().Msg("successfully enqueued welcome email job")
	}
	return userData, nil
}

func (s *AuthService) GetAuthUser(c echo.Context, clerkId string) (*GetAuthUserResponse, error) {
	return s.repository.GetAuthUser(c.Request().Context(), clerkId)
}
