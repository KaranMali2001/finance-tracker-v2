package database

import (
	"context"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/rs/zerolog"
)

type ctxKey string

const txKey ctxKey = "db.tx"

type TxManager struct {
	Pool *pgxpool.Pool
}

func NewTxManager(pool *pgxpool.Pool) *TxManager {
	return &TxManager{
		Pool: pool,
	}
}

func (tm *TxManager) WithTx(c context.Context, fn func(c context.Context) error, log *zerolog.Logger) error {
	tx, err := tm.Pool.BeginTx(c, pgx.TxOptions{})
	if err != nil {
		return err
	}
	c = context.WithValue(c, txKey, tx)
	if err := fn(c); err != nil {
		txRollBackError := tx.Rollback(c)
		if txRollBackError != nil {
			log.Error().Stack().Err(txRollBackError).Msg("CRITICAL: rollback failed with stack trace")

			return err
		}
	}
	return tx.Commit(c)
}

func (tm *TxManager) GetTx(ctx context.Context) pgx.Tx {
	tx, _ := ctx.Value(txKey).(pgx.Tx)
	return tx
}
