package transaction

import (
	"context"
	"fmt"
	"io"
	"mime"
	"mime/multipart"
	"path/filepath"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/domain/user"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/handler"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/middleware"
	aiservices "github.com/KaranMali2001/finance-tracker-v2-backend/internal/services/aiServices"
	"github.com/google/uuid"
	"github.com/labstack/echo/v4"
)

type TxnService struct {
	r              txnRepository
	userRepo       userProvider
	geminiSvc      *aiservices.GeminiService
	staticRepo     staticProvider
	tm             *database.TxManager
	balanceUpdater balanceApplier
}

func NewTxnService(r txnRepository, userRepo userProvider, geminiSvc *aiservices.GeminiService, staticRepo staticProvider, tm *database.TxManager, balanceUpdater balanceApplier) *TxnService {
	return &TxnService{
		r:              r,
		userRepo:       userRepo,
		geminiSvc:      geminiSvc,
		staticRepo:     staticRepo,
		tm:             tm,
		balanceUpdater: balanceUpdater,
	}
}

func (s *TxnService) CreateTxn(c echo.Context, payload *CreateTxnReq, clerkId string) (*Transaction, error) {
	log := middleware.GetLogger(c)
	log.Info().Msgf("Creating New Transaction for User %v", clerkId)
	var result *Transaction
	err := s.tm.WithTx(c.Request().Context(), func(c context.Context) error {
		txn, err := s.r.CreateTxns(c, clerkId, payload)
		if err != nil {
			return err
		}
		result = txn
		if err := s.balanceUpdater.Apply(c, clerkId, payload.AccountId, string(txn.Type), txn.Amount); err != nil {
			return err
		}
		return nil
	}, log)
	if err != nil {
		return nil, err
	}

	log.Info().Msg("User Lifetime balance and account balance updated successfully")
	return result, nil
}

func (s *TxnService) GetTxnsWithFilters(c echo.Context, payload *GetTxnsWithFiltersReq, clerkId string) ([]*Transaction, error) {
	return s.r.GetTxnsWithFilters(c.Request().Context(), clerkId, payload)
}

func (s *TxnService) SoftDeleteTxns(c echo.Context, payload *SoftDeleteTxnsReq, clerkId string) error {
	log := middleware.GetLogger(c)
	log.Info().Msgf("Soft Deleting Transactions %v for User %v", payload.Ids, clerkId)
	err := s.tm.WithTx(c.Request().Context(), func(c context.Context) error {
		txns, err := s.r.SoftDeleteTxns(c, clerkId, payload)
		if err != nil {
			return err
		}
		type accountDelta struct {
			incomeDelta  float64
			expenseDelta float64
			balanceDelta float64
		}
		deltasByAccount := make(map[uuid.UUID]*accountDelta)
		for _, txn := range txns {
			accountID, err := uuid.Parse(txn.AccountId)
			if err != nil {
				return err
			}
			d := deltasByAccount[accountID]
			if d == nil {
				d = &accountDelta{}
				deltasByAccount[accountID] = d
			}
			switch txn.Type {
			case TxnTypeCredit, TxnTypeIncome, TxnTypeRefund, TxnTypeInvestment:
				d.incomeDelta += txn.Amount
				d.balanceDelta -= txn.Amount
			case TxnTypeDebit, TxnTypeSubscription:
				d.expenseDelta += txn.Amount
				d.balanceDelta += txn.Amount
			}
		}
		for accountID, d := range deltasByAccount {
			if err := s.balanceUpdater.ApplyBatch(c, clerkId, accountID, -d.incomeDelta, -d.expenseDelta, d.balanceDelta); err != nil {
				return err
			}
		}
		log.Info().Msg("User Lifetime balance and account balance reversed successfully")
		return nil
	}, log)
	return err
}

func (s *TxnService) UpdateTxn(c echo.Context, payload *UpdateTxnReq, clerkId string) (*Transaction, error) {
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
