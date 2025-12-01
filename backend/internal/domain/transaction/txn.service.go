package transaction

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type TxnService struct {
	s *server.Server
	r *TxnRepository
}

func NewTxnService(s *server.Server, r *TxnRepository) *TxnService {
	return &TxnService{
		s: s,
		r: r,
	}
}

func (s *TxnService) CreateTxn(c echo.Context, payload *CreateTxnReq, clerkId string) (*Trasaction, error) {
	log := middleware.GetLogger(c)
	log.Info().Msgf("Creating New Transaction for User %v", clerkId)
	return s.r.CreateTxns(c.Request().Context(), clerkId, payload)
}

func (s *TxnService) GetTxnsWithFilters(c echo.Context, payload *GetTxnsWithFiltersReq, clerkId string) ([]*Trasaction, error) {
	return s.r.GetTxnsWithFilters(c.Request().Context(), clerkId, payload)
}

func (s *TxnService) SoftDeleteTxns(c echo.Context, payload *SoftDeleteTxnsReq, clerkId string) error {
	log := middleware.GetLogger(c)
	log.Info().Msgf("Soft Deleting Transactions %v for User %v", payload.Ids, clerkId)
	return s.r.SoftDeleteTxns(c.Request().Context(), clerkId, payload)
}
