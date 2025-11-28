package auth

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type AuthService struct {
	server     *server.Server
	repository *AuthRepository
}

func NewAuthService(s *server.Server, r *AuthRepository) *AuthService {
	return &AuthService{
		server:     s,
		repository: r,
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
	task, err := s.server.TaskService.NewWelcomeEmailTask(userData.Email)
	if err != nil {
		logger.Error().Err(err).Msg("failed to create new email task")
	}
	info, err := s.server.Queue.Client.EnqueueContext(c.Request().Context(), task)
	if err != nil {
		logger.Error().Err(err).Msg("failed to Enqueue the Welcome Email Job")
	}
	logger.Info().Str("SuccessFully Enqueued Welcome Email Job %s", info.ID)
	return userData, nil
}
func (s *AuthService) GetAuthUser(c echo.Context, clerkId string) (*GetAuthUserResponse, error) {
	return s.repository.GetAuthUser(c.Request().Context(), clerkId)
}
