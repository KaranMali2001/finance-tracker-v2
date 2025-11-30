package account

import (
	"context"
	"fmt"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
)

type AccRepo struct {
	s *server.Server
	q *generated.Queries
}

func NewAccRepo(s *server.Server, q *generated.Queries) *AccRepo {
	return &AccRepo{
		s: s,
		q: q,
	}
}
func (r *AccRepo) CreateAccount(c context.Context, payload *CreateAccountReq, clerkId string) (*Account, error) {
	acc := generated.CreateAccountParams{
		BankID:        utils.UUIDToPgtype(payload.BankId),
		AccountNumber: payload.AccountNumber,
		AccountType:   payload.AccountType,
		AccountName:   utils.StringToPgtypeText(payload.AccountName),
		IsPrimary:     utils.ToPgBool(payload.IsPrimary),
		UserID:        clerkId,
	}

	account, err := r.q.CreateAccount(c, acc)
	if err != nil {

		return nil, err
	}
	return &Account{
		BankId:         utils.UUIDToString(account.BankID),
		AccountNumber:  account.AccountNumber,
		AccountName:    utils.TextToString(account.AccountName),
		AccountType:    account.AccountType,
		IsPrimary:      utils.BoolToBool(account.IsPrimary),
		UserId:         account.UserID,
		CurrentBalence: utils.NumericToFloat64(account.CurrentBalance),
		CreatedAt:      utils.TimestampToTime(account.CreatedAt),
		UpdatedAt:      utils.TimestampToTime(account.UpdatedAt),
	}, nil
}

func (r *AccRepo) GetAccountById(c context.Context, payload *GetAccountReq, clerkId string) (*Account, error) {
	account, err := r.q.GetAccountById(c, generated.GetAccountByIdParams{
		ID:     utils.UUIDToPgtype(payload.AccountId),
		UserID: clerkId,
	})
	if err != nil {
		return nil, err
	}

	return &Account{
		Id:             utils.UUIDToString(account.ID),
		AccountNumber:  account.AccountNumber,
		AccountName:    utils.TextToString(account.AccountName),
		AccountType:    account.AccountType,
		UserId:         account.UserID,
		CurrentBalence: utils.NumericToFloat64(account.CurrentBalance),
		IsPrimary:      utils.BoolToBool(account.IsPrimary),
		IsActive:       utils.BoolToBool(account.IsActive),
		CreatedAt:      utils.TimestampToTime(account.CreatedAt),
		UpdatedAt:      utils.TimestampToTime(account.UpdatedAt),
		Bank: &Bank{
			Name:      utils.TextToString(account.Name),
			Code:      utils.TextToString(account.Code),
			IsActive:  utils.BoolToBool(account.IsActive_2),
			CreatedAt: utils.TimestampToTime(account.CreatedAt_2),
			UpdatedAt: utils.TimestampToTime(account.UpdatedAt_2),
		},
	}, nil
}
func (r *AccRepo) GetAccountsByUserId(c context.Context, clerkId string) ([]Account, error) {
	dbAccounts, err := r.q.GetAccountsByUserId(c, clerkId)
	if err != nil {
		return nil, err
	}
	accounts := make([]Account, len(dbAccounts))
	for i, account := range dbAccounts {
		accounts[i] = Account{
			Id:             utils.UUIDToString(account.ID),
			AccountNumber:  account.AccountNumber,
			AccountName:    utils.TextToString(account.AccountName),
			AccountType:    account.AccountType,
			UserId:         account.UserID,
			CurrentBalence: utils.NumericToFloat64(account.CurrentBalance),
			IsPrimary:      utils.BoolToBool(account.IsPrimary),
			IsActive:       utils.BoolToBool(account.IsActive),
			CreatedAt:      utils.TimestampToTime(account.CreatedAt),
			UpdatedAt:      utils.TimestampToTime(account.UpdatedAt),
			Bank: &Bank{
				Name:      utils.TextToString(account.Name),
				Code:      utils.TextToString(account.Code),
				IsActive:  utils.BoolToBool(account.IsActive_2),
				CreatedAt: utils.TimestampToTime(account.CreatedAt_2),
				UpdatedAt: utils.TimestampToTime(account.UpdatedAt_2),
			},
		}
	}
	return accounts, nil
}
func (r *AccRepo) UpdateAccount(c context.Context, payload *UpdateAccountReq, clerkId string) (*Account, error) {
	fmt.Println("payload recevied in update account", payload)
	account, err := r.q.UpdateAccount(c, generated.UpdateAccountParams{
		ID:             utils.UUIDToPgtype(payload.AccountId),
		UserID:         clerkId,
		AccountNumber:  utils.StringPtrToText(payload.AccountNumber),
		AccountName:    utils.StringPtrToText(payload.AccountName),
		CurrentBalance: utils.Float64PtrToNum(payload.CurrentBalence),
		IsPrimary:      utils.BoolPtrToBool(payload.IsPrimary),
		BankID:         utils.UUIDPtrToPgtype(payload.BankId),
	})
	if err != nil {
		return nil, err
	}
	return &Account{
		Id:             utils.UUIDToString(account.ID),
		AccountNumber:  account.AccountNumber,
		AccountName:    utils.TextToString(account.AccountName),
		AccountType:    account.AccountType,
		UserId:         account.UserID,
		CurrentBalence: utils.NumericToFloat64(account.CurrentBalance),
		Bank: &Bank{
			Name:      (account.BankName),
			Code:      utils.TextToString(account.BankCode),
			IsActive:  utils.BoolToBool(account.BankIsActive),
			CreatedAt: utils.TimestampToTime(account.BankCreatedAt),
			UpdatedAt: utils.TimestampToTime(account.BankUpdatedAt),
		},
	}, nil
}
func (r *AccRepo) DeleteAccount(c context.Context, payload *DeleteAccountReq, clerkId string) (*Account, error) {
	err := r.q.DeleteAccount(c, generated.DeleteAccountParams{
		ID:     utils.UUIDToPgtype(payload.AccountId),
		UserID: clerkId,
	})
	if err != nil {
		return nil, err
	}
	return &Account{}, err
}
