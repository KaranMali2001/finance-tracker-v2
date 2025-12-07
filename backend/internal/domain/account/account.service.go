package account

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type AccService struct {
	s *server.Server
	r *AccRepo
}

func NewAccountService(s *server.Server, r *AccRepo) *AccService {
	return &AccService{
		s: s,
		r: r,
	}
}

func (s *AccService) CreateAccount(c echo.Context, payload *CreateAccountReq, clerkId string) (*Account, error) {
	log := middleware.GetLogger(c)
	log.Info().Msgf("Creating New Account for User %v", clerkId)
	return s.r.CreateAccount(c.Request().Context(), payload, clerkId)
}

func (s *AccService) GetAccountById(c echo.Context, payload *GetAccountReq, clerkId string) (*Account, error) {
	return s.r.GetAccountById(c.Request().Context(), payload, clerkId)
}

func (s *AccService) GetAccountsByUserId(c echo.Context, clerkId string) ([]Account, error) {
	return s.r.GetAccountsByUserId(c.Request().Context(), clerkId)
}

func (s *AccService) UpdateAccount(c echo.Context, payload *UpdateAccountReq, clerkId string) (*Account, error) {
	return s.r.UpdateAccount(c.Request().Context(), payload, clerkId)
}

func (s *AccService) DeleteAccount(c echo.Context, payload *DeleteAccountReq, clerkId string) (*Account, error) {
	log := middleware.GetLogger(c)
	log.Info().Msgf("Deleting Account %v for User %v", payload.AccountId, clerkId)
	return s.r.DeleteAccount(c.Request().Context(), payload, clerkId)
}
