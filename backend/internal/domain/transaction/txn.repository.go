package transaction

import (
	"context"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type TxnRepository struct {
	server  *server.Server
	queries *generated.Queries
	tm      *database.TxManager
}

func NewTxnRepository(s *server.Server, q *generated.Queries, tm *database.TxManager) *TxnRepository {
	return &TxnRepository{
		server:  s,
		queries: q,
		tm:      tm,
	}
}

func (r *TxnRepository) CreateTxns(c context.Context, clerkId string, payload *CreateTxnReq) (*Transaction, error) {
	// Default to today's date if TransactionDate is not provided
	queries := r.queries
	if tx := r.tm.GetTx(c); tx != nil {
		queries = queries.WithTx(tx)
	}
	data := generated.CreateTxnParams{
		AccountID:       utils.UUIDToPgtype(payload.AccountId),
		UserID:          clerkId,
		Amount:          utils.Float64PtrToNum(&payload.Amount),
		Description:     utils.StringPtrToText(payload.Description),
		Notes:           utils.StringPtrToText(payload.Notes),
		MerchantID:      utils.UUIDPtrToPgtype(payload.MerchantId),
		CategoryID:      utils.UUIDPtrToPgtype(payload.CategoryId),
		Type:            generated.TxnType(payload.Type),
		Tags:            utils.StringPtrToText(payload.Tags),
		SmsID:           utils.UUIDPtrToPgtype(payload.SmsId),
		PaymentMethod:   utils.StringPtrToText(payload.PaymentMethod),
		ReferenceNumber: utils.StringPtrToText(payload.ReferenceNumber),
		IsRecurring:     utils.ToPgBool(&payload.IsRecurring),
		TransactionDate: utils.TimestampPtrToPgtype(payload.TransactionDate),
	}
	dbTxn, err := queries.CreateTxn(c, data)
	if err != nil {
		return nil, err
	}

	return &Transaction{
		Id:              utils.UUIDToString(dbTxn.ID),
		UserId:          dbTxn.UserID,
		AccountId:       utils.UUIDToString(dbTxn.AccountID),
		ToAccountId:     utils.UUIDToStringPtr(dbTxn.ToAccountID),
		CategoryId:      utils.UUIDToStringPtr(dbTxn.CategoryID),
		MerchantId:      utils.UUIDToStringPtr(dbTxn.MerchantID),
		Type:            TxnType(dbTxn.Type),
		Amount:          utils.NumericToFloat64(dbTxn.Amount),
		Description:     utils.TextToStringPtr(dbTxn.Description),
		Notes:           utils.TextToStringPtr(dbTxn.Notes),
		Tags:            utils.TextToStringPtr(dbTxn.Tags),
		SmsId:           utils.UUIDToStringPtr(dbTxn.SmsID),
		PaymentMethod:   utils.TextToStringPtr(dbTxn.PaymentMethod),
		ReferenceNumber: utils.TextToStringPtr(dbTxn.ReferenceNumber),
		IsRecurring:     utils.BoolToBool(dbTxn.IsRecurring),

		CreatedAt: utils.TimestampToTime(dbTxn.CreatedAt),
		UpdatedAt: utils.TimestampToTime(dbTxn.UpdatedAt),
	}, nil
}

func (r *TxnRepository) GetTxnsWithFilters(c context.Context, clerkId string, filters *GetTxnsWithFiltersReq) ([]*Transaction, error) {
	queries := r.queries
	if tx := r.tm.GetTx(c); tx != nil {
		queries = queries.WithTx(tx)
	}
	params := generated.GetTxnsWithFiltersParams{
		UserID:  clerkId,
		Column2: utils.UUIDToPgtype(filters.AccountId),
		Column3: utils.UUIDToPgtype(filters.CategoryId),
		Column4: utils.UUIDToPgtype(filters.MerchantId),
	}
	dbTxns, err := queries.GetTxnsWithFilters(c, params)
	if err != nil {
		return nil, err
	}

	txns := make([]*Transaction, len(dbTxns))
	for i, dbTxn := range dbTxns {
		txns[i] = &Transaction{
			Id: utils.UUIDToString(dbTxn.ID),

			AccountId:     utils.UUIDToString(dbTxn.AccountID),
			AccountNumber: utils.TextToString(dbTxn.AccountNumber),
			AccountName:   utils.TextToString(dbTxn.AccountName),
			AccountType:   utils.TextToString(dbTxn.AccountType),

			ToAccountId: utils.UUIDToStringPtr(dbTxn.ToAccountID),

			ToAccountNumber: utils.TextToString(dbTxn.ToAccountNumber),
			ToAccountName:   utils.TextToString(dbTxn.ToAccountName),

			CategoryId:   utils.UUIDToStringPtr(dbTxn.CategoryID),
			CategoryName: utils.TextToStringPtr(dbTxn.CategoryName),

			MerchantId:      utils.UUIDToStringPtr(dbTxn.MerchantID),
			MerchantName:    utils.TextToStringPtr(dbTxn.MerchantName),
			Type:            TxnType(dbTxn.Type),
			Amount:          utils.NumericToFloat64(dbTxn.Amount),
			Description:     utils.TextToStringPtr(dbTxn.Description),
			Notes:           utils.TextToStringPtr(dbTxn.Notes),
			Tags:            utils.TextToStringPtr(dbTxn.Tags),
			SmsId:           utils.UUIDToStringPtr(dbTxn.SmsID),
			SmsMessage:      utils.TextToStringPtr(dbTxn.SmsMessage),
			PaymentMethod:   utils.TextToStringPtr(dbTxn.PaymentMethod),
			ReferenceNumber: utils.TextToStringPtr(dbTxn.ReferenceNumber),
			IsRecurring:     utils.BoolToBool(dbTxn.IsRecurring),
		}
	}
	return txns, nil
}

func (r *TxnRepository) SoftDeleteTxns(c context.Context, clerkId string, payload *SoftDeleteTxnsReq) ([]*Transaction, error) {
	queries := r.queries
	if tx := r.tm.GetTx(c); tx != nil {
		queries = queries.WithTx(tx)
	}
	ids := make([]pgtype.UUID, len(payload.Ids))
	for i, idStr := range payload.Ids {
		id, err := uuid.Parse(idStr)
		if err != nil {
			return nil, err
		}
		ids[i] = utils.UUIDToPgtype(id)
	}
	dbTxns, err := queries.SoftDeleteTxns(c, generated.SoftDeleteTxnsParams{
		DeletedAt: utils.TimestampToPgtype(time.Now().UTC()),
		DeletedBy: utils.StringToPgtypeText(payload.DeletedBy),
		UserID:    clerkId,
		Column4:   ids,
	})
	if err != nil {
		return nil, err
	}
	txns := make([]*Transaction, len(dbTxns))
	for i, dbTxn := range dbTxns {
		txns[i] = &Transaction{
			Id:              utils.UUIDToString(dbTxn.ID),
			UserId:          dbTxn.UserID,
			AccountId:       utils.UUIDToString(dbTxn.AccountID),
			ToAccountId:     utils.UUIDToStringPtr(dbTxn.ToAccountID),
			CategoryId:      utils.UUIDToStringPtr(dbTxn.CategoryID),
			MerchantId:      utils.UUIDToStringPtr(dbTxn.MerchantID),
			Type:            TxnType(dbTxn.Type),
			Amount:          utils.NumericToFloat64(dbTxn.Amount),
			Description:     utils.TextToStringPtr(dbTxn.Description),
			Notes:           utils.TextToStringPtr(dbTxn.Notes),
			Tags:            utils.TextToStringPtr(dbTxn.Tags),
			SmsId:           utils.UUIDToStringPtr(dbTxn.SmsID),
			PaymentMethod:   utils.TextToStringPtr(dbTxn.PaymentMethod),
			ReferenceNumber: utils.TextToStringPtr(dbTxn.ReferenceNumber),
			IsRecurring:     utils.BoolToBool(dbTxn.IsRecurring),
			CreatedAt:       utils.TimestampToTime(dbTxn.CreatedAt),
			UpdatedAt:       utils.TimestampToTime(dbTxn.UpdatedAt),
		}
	}
	return txns, nil
}

func (r *TxnRepository) UpdateTxn(c context.Context, clerkId string, payload *UpdateTxnReq) (*Transaction, error) {
	id, err := uuid.Parse(payload.Id)
	if err != nil {
		return nil, err
	}
	queries := r.queries
	if tx := r.tm.GetTx(c); tx != nil {
		queries = queries.WithTx(tx)
	}
	var txnType generated.TxnType
	if payload.Type != nil && string(*payload.Type) != "" {
		txnType = generated.TxnType(*payload.Type)
	}

	params := generated.UpdateTxnParams{
		ID:              utils.UUIDToPgtype(id),
		CategoryID:      utils.UUIDPtrToPgtype(payload.CategoryId),
		MerchantID:      utils.UUIDPtrToPgtype(payload.MerchantId),
		Amount:          utils.Float64PtrToNum(payload.Amount),
		Description:     utils.StringPtrToText(payload.Description),
		TransactionDate: utils.TimestampPtrToPgtype(payload.TransactionDate),
		Column7:         string(txnType),
		UserID:          clerkId,
	}

	dbTxnId, err := queries.UpdateTxn(c, params)
	if err != nil {
		return nil, err
	}

	return &Transaction{
		Id: utils.UUIDToString(dbTxnId),
	}, nil
}
