package user

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"encoding/hex"
	"fmt"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/labstack/echo/v4"
	"github.com/skip2/go-qrcode"
)

type UserService struct {
	repository userRepository
}

func NewUserService(r userRepository) *UserService {
	return &UserService{
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

func (s *UserService) GetUserByClerkId(c echo.Context, clerkId string) (*User, error) {
	return s.repository.GetUserByClerkId(c.Request().Context(), clerkId)
}

func (s *UserService) UpdateUserInternal(c echo.Context, payload *UpdateUserInternal, clerkId string) (*User, error) {
	log := middleware.GetLogger(c)
	currUser, err := s.repository.GetUserByClerkId(c.Request().Context(), clerkId)
	if err != nil {
		log.Error().Err(err).Msgf("Error while fetching user in UpdateUserInternal Service")
		return nil, err
	}
	if currUser.ApiKey != "" {
		return nil, fmt.Errorf("api Key is already generated and cant be regenerated")
	}

	apiKeyBytes := make([]byte, 32)
	if _, err := rand.Read(apiKeyBytes); err != nil {
		log.Error().Err(err).Msg("Failed to generate API key")
		return nil, err
	}
	apiKey := hex.EncodeToString(apiKeyBytes)
	log.Info().Msgf("Updating API key for user %v", clerkId)
	payload.ApiKey = &apiKey
	qrContent := fmt.Sprintf("financeapp://setup?api_key=%s", apiKey)
	qrCodeBytes, err := qrcode.Encode(qrContent, qrcode.Medium, 256)
	if err != nil {
		log.Error().Err(err).Msgf("error while Generating QR string for api key of user and continue to save just api key for now %v", clerkId)
	}
	qrCodeBase64 := base64.StdEncoding.EncodeToString(qrCodeBytes)
	qrCodeDataURL := fmt.Sprintf("data:image/png;base64,%s", qrCodeBase64)
	payload.QrString = &qrCodeDataURL
	return s.repository.UpdateUserInternal(c.Request().Context(), payload, clerkId)
}

func (s *UserService) GetUserByApiKey(c echo.Context, apiKey string) (*User, error) {
	return s.repository.GetUserByApiKey(c.Request().Context(), apiKey)
}

func (s *UserService) GetClerkIdByApiKey(c echo.Context, apiKey string) (string, error) {
	u, err := s.repository.GetUserByApiKey(c.Request().Context(), apiKey)
	if err != nil {
		return "", err
	}
	return u.ClerkId, nil
}

func (s *UserService) GetReconciliationThreshold(ctx context.Context, clerkId string) (int, error) {
	return s.repository.GetReconciliationThreshold(ctx, clerkId)
}

func (s *UserService) GetUseLlmParsing(ctx context.Context, clerkId string) (bool, error) {
	u, err := s.repository.GetUserByClerkId(ctx, clerkId)
	if err != nil {
		return false, err
	}
	return u.UseLlmParsing, nil
}
