package transaction

import (
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/user"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/labstack/echo/v4"
)

type TxnService struct {
	s       *server.Server
	r       *TxnRepository
	userSvc *user.UserService
}

func NewTxnService(s *server.Server, r *TxnRepository, userSvc *user.UserService) *TxnService {
	return &TxnService{
		s:       s,
		r:       r,
		userSvc: userSvc,
	}
}

// TODO -> put this in TXN for atomicity
func (s *TxnService) CreateTxn(c echo.Context, payload *CreateTxnReq, clerkId string) (*Trasaction, error) {
	log := middleware.GetLogger(c)
	log.Info().Msgf("Creating New Transaction for User %v", clerkId)
	txn, err := s.r.CreateTxns(c.Request().Context(), clerkId, payload)
	if err != nil {
		return nil, err
	}
	userData, err := s.userSvc.GetUserByClerkId(c, clerkId)
	if err != nil {
		return nil, err
	}
	updateUserReq := &user.UpdateUserReq{}

	switch txn.Type {
	case TxnTypeCredit, TxnTypeIncome, TxnTypeRefund, TxnTypeInvestment:
		newIncome := txn.Amount + userData.LifetimeIncome
		updateUserReq.LifetimeIncome = &newIncome
	case TxnTypeDebit, TxnTypeSubscription:
		newExpense := userData.LifetimeExpense + txn.Amount
		updateUserReq.LifetimeExpense = &newExpense
	}
	if updateUserReq.LifetimeExpense == nil && updateUserReq.LifetimeIncome == nil {
		return txn, nil
	}
	_, err = s.userSvc.UpdateUser(c, updateUserReq, clerkId)
	if err != nil {
		return nil, err
	}
	log.Info().
		Msg("User Lifetime balence updated successfully ")
	return txn, nil
}

func (s *TxnService) GetTxnsWithFilters(c echo.Context, payload *GetTxnsWithFiltersReq, clerkId string) ([]*Trasaction, error) {
	return s.r.GetTxnsWithFilters(c.Request().Context(), clerkId, payload)
}

// TODO -> put this in TXN for atomicity
func (s *TxnService) SoftDeleteTxns(c echo.Context, payload *SoftDeleteTxnsReq, clerkId string) error {
	log := middleware.GetLogger(c)
	log.Info().Msgf("Soft Deleting Transactions %v for User %v", payload.Ids, clerkId)
	userData, err := s.userSvc.GetUserByClerkId(c, clerkId)
	if err != nil {
		return err
	}
	updateUserReq := &user.UpdateUserReq{}
	totalExpToSubstract := 0.0
	totalIncToSubstract := 0.0
	txns, err := s.r.SoftDeleteTxns(c.Request().Context(), clerkId, payload)
	if err != nil {
		return err
	}
	for _, txn := range txns {
		switch txn.Type {
		case TxnTypeCredit, TxnTypeIncome, TxnTypeRefund, TxnTypeInvestment:
			totalIncToSubstract += txn.Amount
		case TxnTypeDebit, TxnTypeSubscription:
			totalExpToSubstract += txn.Amount

		}
	}
	if totalIncToSubstract == 0 && totalExpToSubstract == 0 {
		return nil
	}

	newIncome := userData.LifetimeIncome - totalIncToSubstract
	newExpense := userData.LifetimeExpense - totalExpToSubstract
	updateUserReq.LifetimeExpense = &newExpense
	updateUserReq.LifetimeIncome = &newIncome

	_, err = s.userSvc.UpdateUser(c, updateUserReq, clerkId)
	if err != nil {
		return err
	}
	log.Info().
		Msg("User Lifetime balence updated successfully ")
	return nil
}
