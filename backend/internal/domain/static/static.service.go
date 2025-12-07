package static

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type StaticService struct {
	server *server.Server
	repo   *StaticRepository
}

func NewStaticService(s *server.Server, r *StaticRepository) *StaticService {
	return &StaticService{
		server: s,
		repo:   r,
	}
}

func (s *StaticService) GetBanks(c echo.Context) ([]Bank, error) {
	logger := middleware.GetLogger(c)
	banks, err := s.repo.GetBanks(c.Request().Context())
	if err != nil {
		logger.Error().Err(err).Msg("error in Get Banks service while fetching the banks")
		return nil, err
	}
	return banks, nil
}

func (s *StaticService) GetCategories(c echo.Context) ([]Categories, error) {
	logger := middleware.GetLogger(c)
	categories, err := s.repo.GetCategories(c.Request().Context())
	if err != nil {
		logger.Error().Err(err).Msg("error in Getting categories service while fetching the banks")
		return nil, err
	}
	return categories, nil
}

func (s *StaticService) GetMerchants(c echo.Context) ([]Merchants, error) {
	logger := middleware.GetLogger(c)
	merchanats, err := s.repo.GetMerchants(c.Request().Context())
	if err != nil {
		logger.Error().Err(err).Msg("error in Gettting Merchants service while fetching the banks")
		return nil, err
	}
	return merchanats, nil
}
