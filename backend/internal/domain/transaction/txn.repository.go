package transaction

import (
	"context"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/server"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

type TxnRepository struct {
	server  *server.Server
	queries *generated.Queries
}

func NewTxnRepository(s *server.Server, q *generated.Queries) *TxnRepository {
	return &TxnRepository{
		server:  s,
		queries: q,
	}
}
func (r *TxnRepository) CreateTxns(c context.Context, clerkId string, payload *CreateTxnReq) (*Trasaction, error) {
	// Default to today's date if TransactionDate is not provided

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
	dbTxn, err := r.queries.CreateTxn(c, data)
	if err != nil {
		return nil, err
	}

	return &Trasaction{
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
func (r *TxnRepository) GetTxnsWithFilters(c context.Context, clerkId string, filters *GetTxnsWithFiltersReq) ([]*Trasaction, error) {
	params := generated.GetTxnsWithFiltersParams{
		UserID:  clerkId,
		Column2: utils.UUIDToPgtype(filters.AccountId),
		Column3: utils.UUIDToPgtype(filters.CategoryId),
		Column4: utils.UUIDToPgtype(filters.MerchantId),
	}
	dbTxns, err := r.queries.GetTxnsWithFilters(c, params)
	if err != nil {
		return nil, err
	}

	txns := make([]*Trasaction, len(dbTxns))
	for i, dbTxn := range dbTxns {
		txns[i] = &Trasaction{
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
func (r *TxnRepository) SoftDeleteTxns(c context.Context, clerkId string, payload *SoftDeleteTxnsReq) error {
	ids := make([]pgtype.UUID, len(payload.Ids))
	for i, idStr := range payload.Ids {
		id, err := uuid.Parse(idStr)
		if err != nil {
			return err
		}
		ids[i] = utils.UUIDToPgtype(id)
	}
	err := r.queries.SoftDeleteTxns(c, generated.SoftDeleteTxnsParams{
		DeletedAt: utils.TimestampToPgtype(time.Now().UTC()),
		DeletedBy: utils.StringToPgtypeText(payload.DeletedBy),
		UserID:    clerkId,
		Column4:   ids,
	})
	if err != nil {
		return err
	}
	return nil
}
