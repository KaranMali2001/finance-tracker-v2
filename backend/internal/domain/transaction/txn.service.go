package transaction

import (
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"path/filepath"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/static"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/user"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	aiservices "github.com/KaranMali2001/finance-tracker-v2-backend/internal/services/aiServices"
	"github.com/labstack/echo/v4"
)

type TxnService struct {
	s          *server.Server
	r          *TxnRepository
	userRepo   *user.UserRepository
	geminiSvc  *aiservices.GeminiService
	staticRepo *static.StaticRepository
}

func NewTxnService(s *server.Server, r *TxnRepository, userRepo *user.UserRepository, geminiSvc *aiservices.GeminiService, staticRepo *static.StaticRepository) *TxnService {
	return &TxnService{
		s:          s,
		r:          r,
		userRepo:   userRepo,
		geminiSvc:  geminiSvc,
		staticRepo: staticRepo,
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
	userData, err := s.userRepo.GetUserByClerkId(c.Request().Context(), clerkId)
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
	_, err = s.userRepo.UpdateUser(c.Request().Context(), updateUserReq, clerkId)
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
	userData, err := s.userRepo.GetUserByClerkId(c.Request().Context(), clerkId)
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

	_, err = s.userRepo.UpdateUser(c.Request().Context(), updateUserReq, clerkId)
	if err != nil {
		return err
	}
	log.Info().
		Msg("User Lifetime balence updated successfully ")
	return nil
}

func (s *TxnService) UpdateTxn(c echo.Context, payload *UpdateTxnReq, clerkId string) (*Trasaction, error) {
	log := middleware.GetLogger(c)
	log.Info().Msgf("Updating Transaction %v for User %v", payload.Id, clerkId)
	return s.r.UpdateTxn(c.Request().Context(), clerkId, payload)
}

func (s *TxnService) ParseTxnImage(c echo.Context, payload *ParseTxnImgReq, clerkId string) (*ParsedTxnRes, error) {
	log := middleware.GetLogger(c)
	// getting user
	currUser, err := s.userRepo.GetUserByClerkId(c.Request().Context(), clerkId)
	if err != nil {
		log.Error().Err(err).Msg("Error while getting user in ParseTxnImage from userService")
		return nil, err
	}
	// updating the attempt
	newAttempt := currUser.TransactionImageParseAttempt + 1
	newSuccess := currUser.TransactionImageParseSuccess + 1
	_, err = s.userRepo.UpdateUserInternal(c.Request().Context(), &user.UpdateUserInternal{
		TransactionImageParseAttempt: &newAttempt,
	}, clerkId)
	if err != nil {
		log.Error().Err(err).Msgf("Error while updating the Attempt of user ID %v", clerkId)
		return nil, err
	}
	// TODO:FallBack to Global Category Object,Same for merchant
	cats, err := s.staticRepo.GetCategories(c.Request().Context())
	if err != nil {
		log.Error().Err(err).Msg("Error while getting Categories from the static service")

		return nil, err
	}
	merchants, err := s.staticRepo.GetMerchants(c.Request().Context())
	if err != nil {
		log.Error().Err(err).Msg("Error while getting Merchants from the static service")

		return nil, err
	}

	categoryMap := make(map[string]string, len(cats))
	for _, v := range cats {
		categoryMap[v.Id] = v.Name
	}
	merchantMap := make(map[string]string, len(merchants))
	for _, v := range merchants {
		merchantMap[v.Id] = v.Name
	}
	fileHeader, ok := c.Get(handler.ImageContextKey).(*multipart.FileHeader)
	if !ok || fileHeader == nil {
		log.Error().Err(err).Msg("Error while geting file from context")
		return nil, fmt.Errorf("image file not found or courrpted")
	}
	file, err := fileHeader.Open()
	if err != nil {
		log.Error().Err(err).Msg("error while opening the file")
		return nil, err
	}
	defer file.Close()
	mimeType := fileHeader.Header.Get("Content-Type")
	if mimeType == "" {
		mimeType = mime.TypeByExtension(filepath.Ext(fileHeader.Filename))
	}
	imageData, err := io.ReadAll(file)
	if err != nil {
		log.Error().Err(err).Msg("error while reading the File")
		return nil, err
	}
	parseTxn, err := s.geminiSvc.ParseTxn(c.Request().Context(), imageData, categoryMap, merchantMap, mimeType, log)
	if err != nil {
		log.Error().Err(err).Msg("error while parsing txn through gemini")
		return nil, err
	}
	log.Debug().Msgf("Parsed Txn before updating the User %v", parseTxn)
	_, err = s.userRepo.UpdateUserInternal(c.Request().Context(), &user.UpdateUserInternal{
		TransactionImageParseSuccess: &newSuccess,
	}, clerkId)
	if err != nil {
		log.Error().Err(err).Msgf("Error while updating the Success Parse Txn of user ID %v", clerkId)
		return nil, err
	}
	return (*ParsedTxnRes)(parseTxn), nil
}
