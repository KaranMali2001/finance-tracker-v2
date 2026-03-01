package investment

import (
	"context"
	"fmt"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
)

type InvestmentRepository struct {
	queries investmentQuerier
	tm      *database.TxManager
}

func NewInvestMentRepository(q investmentQuerier, tm *database.TxManager) *InvestmentRepository {
	return &InvestmentRepository{
		queries: q,
		tm:      tm,
	}
}

func goalFromDb(goal *generated.Goal) *Goal {
	return &Goal{
		Id:            utils.UUIDToUUID(goal.ID),
		Name:          goal.Name,
		Status:        utils.TextToString(goal.Status),
		TargetAmount:  utils.NumericToFloat64(goal.TargetAmount),
		TargetDate:    utils.DateToTime(goal.TargetDate),
		Priority:      uint8(utils.Int4ToInt(goal.Priority)),
		CurrentAmount: utils.NumericToFloat64(goal.CurrentAmount),
		CreatedAt:     utils.TimestampToTime(goal.CreatedAt),
		AchievedAt:    utils.TimestampToTime(goal.AchievedAt),
	}
}

func (r *InvestmentRepository) CreateNewGoal(c context.Context, payload *CreateGoalReq, clerkId string) (*Goal, error) {
	queries := r.queries
	if tx := r.tm.GetTx(c); tx != nil {
		queries = r.queries.WithTx(tx)
	}

	var targetDate time.Time
	var err error
	dateFormats := []string{
		"2006-01-02",               // YYYY-MM-DD
		time.RFC3339,               // 2006-01-02T15:04:05Z07:00
		"2006-01-02T15:04:05Z",     // 2006-01-02T15:04:05Z
		"2006-01-02T15:04:05.000Z", // 2006-01-02T15:04:05.000Z
		"2006-01-02 15:04:05",      // 2006-01-02 15:04:05
	}
	for _, format := range dateFormats {
		targetDate, err = time.Parse(format, payload.TargetDate)
		if err == nil {
			break
		}
	}
	if err != nil {
		return nil, fmt.Errorf("invalid target_date format: %w", err)
	}

	body := generated.CreateGoalParams{
		Name:          payload.Name,
		TargetAmount:  utils.Float64PtrToNum(&payload.TargetAmount),
		TargetDate:    utils.TimeToDate(targetDate),
		CurrentAmount: utils.Float64PtrToNum(payload.CurrentAmount),
		Status:        utils.StringPtrToText(payload.Status),
		Priority:      utils.UintPtrToInt4(payload.Priority),
		UserID:        clerkId,
	}

	goal, err := queries.CreateGoal(c, body)
	if err != nil {
		return nil, err
	}
	return goalFromDb(&goal), nil
}

func (r *InvestmentRepository) GetGoalsWithFilter(c context.Context, params *GetGoalsWithFilter, clerkID string) ([]Goal, error) {
	queries := r.queries
	if tx := r.tm.GetTx(c); tx != nil {
		queries = r.queries.WithTx(tx)
	}
	body := generated.GetGoalsParams{
		UserID: clerkID,
	}

	if params.Status != nil {
		body.Status = utils.StringPtrToText(params.Status)
	}

	if params.Priority != nil {
		body.Priority = utils.UintToInt4(uint(*params.Priority))
	}

	if params.TargetAmountLessThan != nil {
		body.MaxAmount = utils.Float64PtrToNum(params.TargetAmountLessThan)
	}

	if params.TargetAmountGreaterThan != nil {
		body.MinAmount = utils.Float64PtrToNum(params.TargetAmountGreaterThan)
	}

	if params.CreatedAtAfter != nil {
		body.CreatedAfter = utils.TimestampToPgtype(*params.CreatedAtAfter)
	}

	if params.TargetDateBefore != nil {
		body.TargetBefore = utils.TimeToDate(*params.TargetDateBefore)
	}

	if params.TargetDateAfter != nil {
		body.TargetAfter = utils.TimeToDate(*params.TargetDateAfter)
	}

	rows, err := queries.GetGoals(c, body)
	if err != nil {
		return nil, err
	}

	goals := make([]Goal, len(rows))

	for i, row := range rows {
		goals[i] = *goalFromDb(&row)
	}

	return goals, nil
}

func (r *InvestmentRepository) GetGoalById(c context.Context, param *GetGoalById, clerkID string) (*Goal, error) {
	queries := r.queries
	if tx := r.tm.GetTx(c); tx != nil {
		queries = r.queries.WithTx(tx)
	}
	goal, err := queries.GetGoalById(c, generated.GetGoalByIdParams{
		ID:     utils.UUIDToPgtype(param.Id),
		UserID: clerkID,
	})
	if err != nil {
		return nil, err
	}
	return goalFromDb(&goal), nil
}

func (r *InvestmentRepository) DeleteGoal(ctx context.Context, goalID uuid.UUID, clerkID string) error {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = r.queries.WithTx(tx)
	}
	return queries.DeleteGoal(ctx, generated.DeleteGoalParams{
		ID:     utils.UUIDToPgtype(goalID),
		UserID: clerkID,
	})
}

func (r *InvestmentRepository) UpdateGoal(
	ctx context.Context,
	goalID uuid.UUID,
	userID string,
	params *UpdateGoals,
) (*Goal, error) {
	queries := r.queries
	if tx := r.tm.GetTx(ctx); tx != nil {
		queries = queries.WithTx(tx)
	}

	body := generated.UpdateGoalParams{
		ID:     utils.UUIDToPgtype(goalID),
		UserID: userID,
	}

	if params != nil && params.Name != nil {
		body.Column1 = *params.Name
	}

	if params != nil {
		body.Column2 = utils.Float64PtrToNum(params.TargetAmount)
	}

	if params != nil && params.TargetDate != nil {
		var targetDate time.Time
		var err error
		dateFormats := []string{
			"2006-01-02",               // YYYY-MM-DD
			time.RFC3339,               // 2006-01-02T15:04:05Z07:00
			"2006-01-02T15:04:05Z",     // 2006-01-02T15:04:05Z
			"2006-01-02T15:04:05.000Z", // 2006-01-02T15:04:05.000Z
			"2006-01-02 15:04:05",      // 2006-01-02 15:04:05
		}
		for _, format := range dateFormats {
			targetDate, err = time.Parse(format, *params.TargetDate)
			if err == nil {
				break
			}
		}
		if err != nil {
			return nil, fmt.Errorf("invalid target_date format: %w", err)
		}
		body.Column3 = utils.TimeToDate(targetDate)
	}

	if params != nil && params.Status != nil {
		body.Column4 = *params.Status
	}

	if params != nil && params.Priority != nil {
		body.Column5 = int32(*params.Priority)
	}

	if params != nil {
		body.Column6 = utils.Float64PtrToNum(params.CurrentAmount)
	}

	if params != nil {
		body.Column7 = utils.TimestampPtrToPgtype(params.AchievedAt)
	}

	row, err := queries.UpdateGoal(ctx, body)
	if err != nil {
		return nil, err
	}

	return goalFromDb(&row), nil
}
