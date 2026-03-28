package investment

import (
	"context"
	"fmt"
	"math"
	"time"

	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/database/generated"
	"github.com/KaranMali2001/finance-tracker-v2-backend/internal/utils"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgtype"
)

const (
	sipMatchThreshold = 0.6
	sipDateWindowDays = 15.0
	sourceManual      = "manual"
	sourceAutoSIP     = "auto_sip"
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

// ── Helpers ──────────────────────────────────────────────────────────────────

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

func goalInvestmentFromDb(gi *generated.GoalInvestment) *GoalInvestment {
	result := &GoalInvestment{
		ID:                  utils.UUIDToUUID(gi.ID),
		UserID:              gi.UserID,
		InvestmentType:      gi.InvestmentType,
		ContributionType:    gi.ContributionType,
		ContributionValue:   utils.NumericToFloat64(gi.ContributionValue),
		CurrentValue:        utils.NumericToFloat64(gi.CurrentValue),
		AccountID:           utils.UUIDToUUID(gi.AccountID),
		AutoInvest:          utils.BoolToBool(gi.AutoInvest),
		InvestmentDay:       utils.Int4ToIntPtr(gi.InvestmentDay),
		MerchantNamePattern: utils.TextToStringPtr(gi.MerchantNamePattern),
		DescriptionPattern:  utils.TextToStringPtr(gi.DescriptionPattern),
		CreatedAt:           utils.TimestampToTime(gi.CreatedAt),
		UpdatedAt:           utils.TimestampToTime(gi.UpdatedAt),
	}
	if goalID := utils.UUIDToUUIDPtr(gi.GoalID); goalID != nil && *goalID != uuid.Nil {
		result.GoalID = goalID
	}
	return result
}

func goalTransactionFromDb(gt *generated.GoalTransaction) *GoalTransaction {
	result := &GoalTransaction{
		ID:              utils.UUIDToUUID(gt.ID),
		InvestmentID:    utils.UUIDToUUID(gt.InvestmentID),
		TransactionID:   utils.UUIDToUUID(gt.TransactionID),
		Amount:          utils.NumericToFloat64(gt.Amount),
		ExpectedAmount:  utils.NumericToFloat64Ptr(gt.ExpectedAmount),
		Source:          gt.Source,
		TransactionDate: utils.TimestampToTime(gt.TransactionDate),
		Notes:           utils.TextToStringPtr(gt.Notes),
		CreatedAt:       utils.TimestampToTime(gt.CreatedAt),
		UpdatedAt:       utils.TimestampToTime(gt.UpdatedAt),
	}
	if goalID := utils.UUIDToUUIDPtr(gt.GoalID); goalID != nil && *goalID != uuid.Nil {
		result.GoalID = goalID
	}
	return result
}

func txQueries(r *InvestmentRepository, ctx context.Context) investmentQuerier {
	if tx := r.tm.GetTx(ctx); tx != nil {
		return r.queries.WithTx(tx)
	}
	return r.queries
}

// ── Goal CRUD ────────────────────────────────────────────────────────────────

func (r *InvestmentRepository) CreateNewGoal(c context.Context, payload *CreateGoalReq, clerkId string) (*Goal, error) {
	q := txQueries(r, c)

	targetDate, err := utils.ParseMultiDate(payload.TargetDate)
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

	goal, err := q.CreateGoal(c, body)
	if err != nil {
		return nil, err
	}
	return goalFromDb(&goal), nil
}

func (r *InvestmentRepository) GetGoalsWithFilter(c context.Context, params *GetGoalsWithFilter, clerkID string) ([]Goal, error) {
	q := txQueries(r, c)
	body := generated.GetGoalsParams{UserID: clerkID}

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

	rows, err := q.GetGoals(c, body)
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
	q := txQueries(r, c)
	goal, err := q.GetGoalById(c, generated.GetGoalByIdParams{
		ID:     utils.UUIDToPgtype(param.Id),
		UserID: clerkID,
	})
	if err != nil {
		return nil, err
	}
	return goalFromDb(&goal), nil
}

func (r *InvestmentRepository) DeleteGoal(ctx context.Context, goalID uuid.UUID, clerkID string) error {
	q := txQueries(r, ctx)
	return q.DeleteGoal(ctx, generated.DeleteGoalParams{
		ID:     utils.UUIDToPgtype(goalID),
		UserID: clerkID,
	})
}

func (r *InvestmentRepository) UpdateGoal(ctx context.Context, goalID uuid.UUID, userID string, params *UpdateGoals) (*Goal, error) {
	q := txQueries(r, ctx)

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
		targetDate, err := utils.ParseMultiDate(*params.TargetDate)
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

	row, err := q.UpdateGoal(ctx, body)
	if err != nil {
		return nil, err
	}
	return goalFromDb(&row), nil
}

// ── GoalInvestment CRUD ──────────────────────────────────────────────────────

func (r *InvestmentRepository) CreateGoalInvestment(ctx context.Context, payload *CreateGoalInvestmentReq, clerkID string) (*GoalInvestment, error) {
	q := txQueries(r, ctx)

	arg := generated.CreateGoalInvestmentParams{
		UserID:              clerkID,
		InvestmentType:      string(payload.InvestmentType),
		ContributionType:    string(payload.ContributionType),
		ContributionValue:   utils.Float64PtrToNum(&payload.ContributionValue),
		CurrentValue:        utils.Float64PtrToNum(payload.CurrentValue),
		AccountID:           utils.UUIDToPgtype(payload.AccountID),
		AutoInvest:          utils.BoolPtrToBool(payload.AutoInvest),
		InvestmentDay:       utils.SignedIntPtrToInt4(payload.InvestmentDay),
		MerchantNamePattern: utils.StringPtrToText(payload.MerchantNamePattern),
		DescriptionPattern:  utils.StringPtrToText(payload.DescriptionPattern),
	}
	if payload.GoalID != nil {
		arg.GoalID = utils.UUIDToPgtype(*payload.GoalID)
	}

	gi, err := q.CreateGoalInvestment(ctx, arg)
	if err != nil {
		return nil, err
	}
	return goalInvestmentFromDb(&gi), nil
}

func (r *InvestmentRepository) GetGoalInvestments(ctx context.Context, params *GetGoalInvestmentsReq, clerkID string) ([]GoalInvestment, error) {
	q := txQueries(r, ctx)

	arg := generated.GetGoalInvestmentsByUserParams{UserID: clerkID}
	if params.GoalID != nil {
		arg.GoalID = utils.UUIDToPgtype(*params.GoalID)
	}
	if params.ContributionType != nil {
		arg.ContributionType = utils.StringToPgtypeText(*params.ContributionType)
	}
	if params.InvestmentType != nil {
		arg.InvestmentType = utils.StringToPgtypeText(*params.InvestmentType)
	}

	rows, err := q.GetGoalInvestmentsByUser(ctx, arg)
	if err != nil {
		return nil, err
	}

	result := make([]GoalInvestment, len(rows))
	for i, row := range rows {
		result[i] = *goalInvestmentFromDb(&row)
	}
	return result, nil
}

func (r *InvestmentRepository) GetGoalInvestmentById(ctx context.Context, id uuid.UUID, clerkID string) (*GoalInvestment, error) {
	q := txQueries(r, ctx)
	gi, err := q.GetGoalInvestmentById(ctx, generated.GetGoalInvestmentByIdParams{
		ID:     utils.UUIDToPgtype(id),
		UserID: clerkID,
	})
	if err != nil {
		return nil, err
	}
	return goalInvestmentFromDb(&gi), nil
}

func (r *InvestmentRepository) UpdateGoalInvestment(ctx context.Context, id uuid.UUID, clerkID string, payload *UpdateGoalInvestmentReq) (*GoalInvestment, error) {
	q := txQueries(r, ctx)

	arg := generated.UpdateGoalInvestmentParams{
		ID:     utils.UUIDToPgtype(id),
		UserID: clerkID,
	}
	if payload.InvestmentType != nil {
		arg.Column1 = *payload.InvestmentType
	}
	if payload.ContributionType != nil {
		arg.Column2 = *payload.ContributionType
	}
	if payload.ContributionValue != nil {
		arg.Column3 = utils.Float64PtrToNum(payload.ContributionValue)
	}
	if payload.CurrentValue != nil {
		arg.Column4 = utils.Float64PtrToNum(payload.CurrentValue)
	}
	if payload.AutoInvest != nil {
		arg.Column5 = *payload.AutoInvest
	}
	if payload.InvestmentDay != nil {
		arg.Column6 = int32(*payload.InvestmentDay)
	}
	if payload.MerchantNamePattern != nil {
		arg.Column7 = *payload.MerchantNamePattern
	}
	if payload.DescriptionPattern != nil {
		arg.Column8 = *payload.DescriptionPattern
	}

	gi, err := q.UpdateGoalInvestment(ctx, arg)
	if err != nil {
		return nil, err
	}
	return goalInvestmentFromDb(&gi), nil
}

func (r *InvestmentRepository) DeleteGoalInvestment(ctx context.Context, id uuid.UUID, clerkID string) error {
	q := txQueries(r, ctx)
	return q.DeleteGoalInvestment(ctx, generated.DeleteGoalInvestmentParams{
		ID:     utils.UUIDToPgtype(id),
		UserID: clerkID,
	})
}

// ── GoalTransaction CRUD ─────────────────────────────────────────────────────

func (r *InvestmentRepository) LinkTransaction(ctx context.Context, payload *LinkTransactionReq, clerkID string) (*GoalTransaction, error) {
	var result *GoalTransaction
	err := r.tm.WithTx(ctx, func(ctx context.Context) error {
		q := txQueries(r, ctx)

		gi, err := q.GetGoalInvestmentById(ctx, generated.GetGoalInvestmentByIdParams{
			ID:     utils.UUIDToPgtype(payload.InvestmentID),
			UserID: clerkID,
		})
		if err != nil {
			return fmt.Errorf("investment not found: %w", err)
		}

		txDate, err := utils.ParseMultiDate(payload.TransactionDate)
		if err != nil {
			return fmt.Errorf("invalid transaction_date: %w", err)
		}

		arg := generated.CreateGoalTransactionParams{
			GoalID:          gi.GoalID,
			InvestmentID:    utils.UUIDToPgtype(payload.InvestmentID),
			TransactionID:   utils.UUIDToPgtype(payload.TransactionID),
			Amount:          utils.Float64PtrToNum(&payload.Amount),
			ExpectedAmount:  utils.Float64PtrToNum(payload.ExpectedAmount),
			Source:          sourceManual,
			TransactionDate: utils.TimestampToPgtype(txDate),
			Notes:           utils.StringPtrToText(payload.Notes),
		}

		gt, err := q.CreateGoalTransaction(ctx, arg)
		if err != nil {
			return err
		}
		result = goalTransactionFromDb(&gt)

		totalPg, err := q.SumGoalTransactionsByInvestment(ctx, utils.UUIDToPgtype(payload.InvestmentID))
		if err != nil {
			return err
		}
		_, err = q.SetGoalInvestmentCurrentValue(ctx, generated.SetGoalInvestmentCurrentValueParams{
			CurrentValue: totalPg,
			ID:           utils.UUIDToPgtype(payload.InvestmentID),
			UserID:       clerkID,
		})
		return err
	}, nil)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func (r *InvestmentRepository) UnlinkTransaction(ctx context.Context, goalTransactionID uuid.UUID, clerkID string) error {
	return r.tm.WithTx(ctx, func(ctx context.Context) error {
		q := txQueries(r, ctx)

		txns, err := q.GetGoalTransactionsByInvestment(ctx, utils.UUIDToPgtype(goalTransactionID))
		if err != nil {
			return err
		}

		if err := q.DeleteGoalTransaction(ctx, utils.UUIDToPgtype(goalTransactionID)); err != nil {
			return err
		}

		if len(txns) == 0 {
			return nil
		}
		investmentID := utils.UUIDToUUID(txns[0].InvestmentID)

		totalPg, err := q.SumGoalTransactionsByInvestment(ctx, utils.UUIDToPgtype(investmentID))
		if err != nil {
			return err
		}
		_, err = q.SetGoalInvestmentCurrentValue(ctx, generated.SetGoalInvestmentCurrentValueParams{
			CurrentValue: totalPg,
			ID:           utils.UUIDToPgtype(investmentID),
			UserID:       clerkID,
		})
		return err
	}, nil)
}

func (r *InvestmentRepository) GetGoalTransactionsByInvestment(ctx context.Context, investmentID uuid.UUID) ([]GoalTransaction, error) {
	q := txQueries(r, ctx)
	rows, err := q.GetGoalTransactionsByInvestment(ctx, utils.UUIDToPgtype(investmentID))
	if err != nil {
		return nil, err
	}
	result := make([]GoalTransaction, len(rows))
	for i, row := range rows {
		result[i] = *goalTransactionFromDb(&row)
	}
	return result, nil
}

func (r *InvestmentRepository) GetGoalTransactionsByGoal(ctx context.Context, goalID uuid.UUID) ([]GoalTransaction, error) {
	q := txQueries(r, ctx)
	rows, err := q.GetGoalTransactionsByGoal(ctx, utils.UUIDToPgtype(goalID))
	if err != nil {
		return nil, err
	}
	result := make([]GoalTransaction, len(rows))
	for i, row := range rows {
		result[i] = *goalTransactionFromDb(&row)
	}
	return result, nil
}

// RecalculateInvestmentValue recomputes current_value as SUM of all linked goal_transactions.
func (r *InvestmentRepository) RecalculateInvestmentValue(ctx context.Context, investmentID uuid.UUID, clerkID string) error {
	q := txQueries(r, ctx)
	totalPg, err := q.SumGoalTransactionsByInvestment(ctx, utils.UUIDToPgtype(investmentID))
	if err != nil {
		return err
	}
	_, err = q.SetGoalInvestmentCurrentValue(ctx, generated.SetGoalInvestmentCurrentValueParams{
		CurrentValue: totalPg,
		ID:           utils.UUIDToPgtype(investmentID),
		UserID:       clerkID,
	})
	return err
}

func (r *InvestmentRepository) GetActiveSipRules(ctx context.Context, clerkID string) ([]generated.GetActiveSipRulesByUserRow, error) {
	q := txQueries(r, ctx)
	return q.GetActiveSipRulesByUser(ctx, clerkID)
}

// ── Auto-link (job handler) ──────────────────────────────────────────────────

// AutoLinkTransactions matches a batch of transaction IDs against the user's
// active SIP rules using fuzzy matching in memory.
// Called by the Asynq job handler — never inline from HTTP handlers.
func (r *InvestmentRepository) AutoLinkTransactions(ctx context.Context, clerkID string, txnIDs []uuid.UUID) (*InvestmentAutoLinkResult, error) {
	rules, err := r.GetActiveSipRules(ctx, clerkID)
	if err != nil {
		return nil, fmt.Errorf("failed to load SIP rules: %w", err)
	}

	pgIDs := make([]pgtype.UUID, len(txnIDs))
	for i, id := range txnIDs {
		pgIDs[i] = utils.UUIDToPgtype(id)
	}
	txnRows, err := r.queries.GetTxnsByIds(ctx, pgIDs)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch transactions for scoring: %w", err)
	}

	type txnMeta struct{ merchantName, description string }
	txnMap := make(map[uuid.UUID]txnMeta, len(txnRows))
	for _, row := range txnRows {
		txnMap[utils.UUIDToUUID(row.ID)] = txnMeta{
			merchantName: row.MerchantName,
			description:  utils.TextToString(row.Description),
		}
	}

	result := &InvestmentAutoLinkResult{
		TotalProcessed: len(txnIDs),
		Items:          make([]InvestmentAutoLinkItemResult, 0, len(txnIDs)),
	}

	for _, txnID := range txnIDs {
		meta := txnMap[txnID]
		item := r.matchAndLink(ctx, clerkID, txnID, rules, meta.merchantName, meta.description)
		switch item.Status {
		case "matched":
			result.Matched++
		case "unmatched":
			result.Unmatched++
		case "error":
			result.Errors++
		}
		result.Items = append(result.Items, item)
	}

	return result, nil
}

// matchAndLink scores a single transaction against all SIP rules and links on best match.
func (r *InvestmentRepository) matchAndLink(
	ctx context.Context,
	clerkID string,
	txnID uuid.UUID,
	rules []generated.GetActiveSipRulesByUserRow,
	merchantName, description string,
) InvestmentAutoLinkItemResult {
	txnIDStr := txnID.String()
	item := InvestmentAutoLinkItemResult{
		TransactionID: txnIDStr,
		Status:        "unmatched",
	}

	if len(rules) == 0 {
		return item
	}

	bestScore := 0.0
	var bestRule *generated.GetActiveSipRulesByUserRow

	for i := range rules {
		rule := &rules[i]
		score := scoreSIPRule(rule, merchantName, description)
		if score > bestScore {
			bestScore = score
			bestRule = rule
		}
	}

	if bestScore < sipMatchThreshold || bestRule == nil {
		return item
	}

	ruleIDStr := utils.UUIDToString(bestRule.ID)
	item.MatchedRuleID = &ruleIDStr
	item.MatchScore = bestScore

	linkErr := r.tm.WithTx(ctx, func(ctx context.Context) error {
		q := txQueries(r, ctx)

		arg := generated.CreateGoalTransactionParams{
			GoalID:          bestRule.GoalID,
			InvestmentID:    bestRule.ID,
			TransactionID:   utils.UUIDToPgtype(txnID),
			Amount:          bestRule.ExpectedAmount,
			ExpectedAmount:  bestRule.ExpectedAmount,
			Source:          sourceAutoSIP,
			TransactionDate: utils.TimestampToPgtype(time.Now()),
			Notes:           utils.StringPtrToText(nil),
		}

		if _, err := q.CreateGoalTransaction(ctx, arg); err != nil {
			return err
		}

		totalPg, err := q.SumGoalTransactionsByInvestment(ctx, bestRule.ID)
		if err != nil {
			return err
		}
		_, err = q.SetGoalInvestmentCurrentValue(ctx, generated.SetGoalInvestmentCurrentValueParams{
			CurrentValue: totalPg,
			ID:           bestRule.ID,
			UserID:       clerkID,
		})
		return err
	}, nil)

	if linkErr != nil {
		errStr := linkErr.Error()
		item.Status = "error"
		item.Error = &errStr
		return item
	}

	item.Status = "matched"
	return item
}

// scoreSIPRule scores a transaction against a SIP rule using date proximity and
// optional merchant/description pattern matching.
// If the rule has no patterns → score = dateScore only (no regression).
// If patterns exist → 0.5*dateScore + 0.3*merchantScore + 0.2*descScore.
func scoreSIPRule(rule *generated.GetActiveSipRulesByUserRow, merchantName, description string) float64 {
	due := utils.DateToTime(rule.NextDueDate)
	daysDiff := math.Abs(time.Since(due).Hours() / 24)
	if daysDiff > sipDateWindowDays {
		return 0
	}
	dateScore := 1.0 - (daysDiff / sipDateWindowDays)

	merchantPattern := utils.TextToString(rule.MerchantNamePattern)
	descPattern := utils.TextToString(rule.DescriptionPattern)

	if merchantPattern == "" && descPattern == "" {
		return dateScore
	}

	merchantScore := 0.0
	if merchantPattern != "" {
		merchantScore = utils.TokenJaccard(merchantPattern, merchantName)
	}
	descScore := 0.0
	if descPattern != "" {
		descScore = utils.TokenJaccard(descPattern, description)
	}

	return 0.5*dateScore + 0.3*merchantScore + 0.2*descScore
}
