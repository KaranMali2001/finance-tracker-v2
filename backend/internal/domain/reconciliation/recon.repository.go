package reconciliation

import (
	"context"
	"errors"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"
)

type ReconRepository struct {
	queries *generated.Queries
}

func NewReconRepository(queries *generated.Queries) *ReconRepository {
	return &ReconRepository{queries: queries}
}

func (r *ReconRepository) CreateUpload(
	ctx context.Context,
	userID string,
	accountID uuid.UUID,
	fileName string,
	fileURL string,
	fileType string,
	fileSize int,
	periodStart, periodEnd time.Time,
) (uuid.UUID, error) {
	var fileTypePg pgtype.Text
	if fileType != "" {
		fileTypePg = utils.StringPtrToText(&fileType)
	}
	var fileSizePg pgtype.Int4
	if fileSize > 0 {
		fileSizePg = utils.IntToInt4(fileSize)
	}
	row, err := r.queries.CreateBankStatementUpload(ctx, generated.CreateBankStatementUploadParams{
		UserID:               userID,
		AccountID:            utils.UUIDToPgtype(accountID),
		FileName:             fileName,
		FileType:             fileTypePg,
		FileSize:             fileSizePg,
		StatementPeriodStart: utils.TimeToDate(periodStart),
		StatementPeriodEnd:   utils.TimeToDate(periodEnd),
		UploadStatus:         utils.StringToPgtypeText(string(UploadStatusProcessing)),
	})
	if err != nil {
		return uuid.Nil, err
	}
	if !row.Valid {
		return uuid.Nil, errors.New("upload id not returned")
	}
	return row.Bytes, nil
}

func (r *ReconRepository) InsertStatementTransactions(ctx context.Context, rows []ParsedTxns) (map[string]struct{}, error) {
	inserted := make(map[string]struct{})
	isDup := false
	for _, row := range rows {
		if row.RawRowHash == nil || *row.RawRowHash == "" {
			continue
		}
		arg := generated.InsertStatementTransactionParams{
			UploadID:        utils.UUIDToPgtype(row.UploadId),
			AccountID:       utils.UUIDToPgtype(row.AccountId),
			TransactionDate: utils.TimeToDate(row.TxnDate),
			Description:     utils.StringPtrToText(row.Description),
			Amount:          utils.Float64PtrToNum(&row.Amount),
			Type:            string(row.Type),
			Balance:         pgtype.Numeric{Valid: false},
			ReferenceNumber: utils.StringPtrToText(row.ReferenceNumber),
			RawRowHash:      *row.RawRowHash,
			RowNumber:       int32(row.RowNumber),
			IsDuplicate:     utils.ToPgBool(&isDup),
		}
		ret, err := r.queries.InsertStatementTransaction(ctx, arg)
		if err != nil {
			if errors.Is(err, pgx.ErrNoRows) {
				continue
			}
			return nil, err
		}
		inserted[ret] = struct{}{}
	}
	return inserted, nil
}
