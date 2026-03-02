/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_investment_CreateGoalInvestmentReq } from '../models/internal_domain_investment_CreateGoalInvestmentReq';
import type { internal_domain_investment_CreateGoalReq } from '../models/internal_domain_investment_CreateGoalReq';
import type { internal_domain_investment_EnqueueAutoLinkReq } from '../models/internal_domain_investment_EnqueueAutoLinkReq';
import type { internal_domain_investment_Goal } from '../models/internal_domain_investment_Goal';
import type { internal_domain_investment_GoalInvestment } from '../models/internal_domain_investment_GoalInvestment';
import type { internal_domain_investment_GoalTransaction } from '../models/internal_domain_investment_GoalTransaction';
import type { internal_domain_investment_LinkTransactionReq } from '../models/internal_domain_investment_LinkTransactionReq';
import type { internal_domain_investment_UpdateGoalInvestmentReq } from '../models/internal_domain_investment_UpdateGoalInvestmentReq';
import type { internal_domain_investment_UpdateGoals } from '../models/internal_domain_investment_UpdateGoals';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InvestmentService {
    /**
     * Enqueue an auto-link job for a batch of transactions
     * Enqueues a background job that fuzzy-matches the given transactions against active SIP rules
     * @param body Transaction IDs to match
     * @returns void
     * @throws ApiError
     */
    public static postInvestmentAutolink(
        body: internal_domain_investment_EnqueueAutoLinkReq,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/investment/autolink',
            body: body,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * List investment goals with optional filters
     * Retrieves investment goals for the authenticated user
     * @param status Goal status
     * @param targetDateBefore Target date before (YYYY-MM-DD)
     * @param targetDateAfter Target date after (YYYY-MM-DD)
     * @param targetAmountLessThan Target amount less than
     * @param targetAmountGreaterThan Target amount greater than
     * @param priority Priority level
     * @param createdAtAfter Created at after (ISO 8601)
     * @returns internal_domain_investment_Goal OK
     * @throws ApiError
     */
    public static getInvestmentGoal(
        status?: string,
        targetDateBefore?: string,
        targetDateAfter?: string,
        targetAmountLessThan?: number,
        targetAmountGreaterThan?: number,
        priority?: number,
        createdAtAfter?: string,
    ): CancelablePromise<Array<internal_domain_investment_Goal>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/investment/goal',
            query: {
                'status': status,
                'target_date_before': targetDateBefore,
                'target_date_after': targetDateAfter,
                'target_amount_less_than': targetAmountLessThan,
                'target_amount_greater_than': targetAmountGreaterThan,
                'priority': priority,
                'created_at_after': createdAtAfter,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Create a new investment goal
     * Creates a new investment goal for the authenticated user
     * @param goal Goal creation request
     * @returns internal_domain_investment_Goal Created
     * @throws ApiError
     */
    public static postInvestmentGoal(
        goal: internal_domain_investment_CreateGoalReq,
    ): CancelablePromise<internal_domain_investment_Goal> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/investment/goal',
            body: goal,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * List goal transactions for a goal
     * Returns all linked transactions for the given goal
     * @param goalId Goal ID
     * @returns internal_domain_investment_GoalTransaction OK
     * @throws ApiError
     */
    public static getInvestmentGoalTransactions(
        goalId: string,
    ): CancelablePromise<Array<internal_domain_investment_GoalTransaction>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/investment/goal/{goal_id}/transactions',
            path: {
                'goal_id': goalId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get investment goal by ID
     * Retrieves a specific investment goal by ID
     * @param id Goal ID
     * @returns internal_domain_investment_Goal OK
     * @throws ApiError
     */
    public static getInvestmentGoal1(
        id: string,
    ): CancelablePromise<internal_domain_investment_Goal> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/investment/goal/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Update an investment goal
     * Updates an existing investment goal
     * @param id Goal ID
     * @param goal Goal update request
     * @returns internal_domain_investment_Goal OK
     * @throws ApiError
     */
    public static putInvestmentGoal(
        id: string,
        goal: internal_domain_investment_UpdateGoals,
    ): CancelablePromise<internal_domain_investment_Goal> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/investment/goal/{id}',
            path: {
                'id': id,
            },
            body: goal,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Delete an investment goal
     * Deletes an investment goal by ID
     * @param id Goal ID
     * @returns void
     * @throws ApiError
     */
    public static deleteInvestmentGoal(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/investment/goal/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Manually link a transaction to an investment rule
     * Creates a goal_transaction record linking a transaction to an investment
     * @param link Link request
     * @returns internal_domain_investment_GoalTransaction Created
     * @throws ApiError
     */
    public static postInvestmentLink(
        link: internal_domain_investment_LinkTransactionReq,
    ): CancelablePromise<internal_domain_investment_GoalTransaction> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/investment/link',
            body: link,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Unlink a goal transaction
     * Removes a goal_transaction link and recalculates the investment current_value
     * @param id GoalTransaction ID
     * @returns void
     * @throws ApiError
     */
    public static deleteInvestmentLink(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/investment/link/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * List investment rules
     * Lists investment rules for the authenticated user with optional filters
     * @param goalId Filter by goal ID
     * @param contributionType Filter by contribution type (one_time|sip)
     * @param investmentType Filter by investment type
     * @returns internal_domain_investment_GoalInvestment OK
     * @throws ApiError
     */
    public static getInvestmentRule(
        goalId?: string,
        contributionType?: string,
        investmentType?: string,
    ): CancelablePromise<Array<internal_domain_investment_GoalInvestment>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/investment/rule',
            query: {
                'goal_id': goalId,
                'contribution_type': contributionType,
                'investment_type': investmentType,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Create a goal investment rule
     * Creates a new investment rule (one-time or SIP) optionally linked to a goal
     * @param investment Investment rule
     * @returns internal_domain_investment_GoalInvestment Created
     * @throws ApiError
     */
    public static postInvestmentRule(
        investment: internal_domain_investment_CreateGoalInvestmentReq,
    ): CancelablePromise<internal_domain_investment_GoalInvestment> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/investment/rule',
            body: investment,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get investment rule by ID
     * Returns a single investment rule
     * @param id Investment rule ID
     * @returns internal_domain_investment_GoalInvestment OK
     * @throws ApiError
     */
    public static getInvestmentRule1(
        id: string,
    ): CancelablePromise<internal_domain_investment_GoalInvestment> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/investment/rule/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Update an investment rule
     * Updates an existing investment rule
     * @param id Investment rule ID
     * @param investment Investment update
     * @returns internal_domain_investment_GoalInvestment OK
     * @throws ApiError
     */
    public static putInvestmentRule(
        id: string,
        investment: internal_domain_investment_UpdateGoalInvestmentReq,
    ): CancelablePromise<internal_domain_investment_GoalInvestment> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/investment/rule/{id}',
            path: {
                'id': id,
            },
            body: investment,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Delete an investment rule
     * Deletes an investment rule by ID
     * @param id Investment rule ID
     * @returns void
     * @throws ApiError
     */
    public static deleteInvestmentRule(
        id: string,
    ): CancelablePromise<void> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/investment/rule/{id}',
            path: {
                'id': id,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * List goal transactions for an investment rule
     * Returns all linked transactions for the given investment rule
     * @param investmentId Investment rule ID
     * @returns internal_domain_investment_GoalTransaction OK
     * @throws ApiError
     */
    public static getInvestmentRuleTransactions(
        investmentId: string,
    ): CancelablePromise<Array<internal_domain_investment_GoalTransaction>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/investment/rule/{investment_id}/transactions',
            path: {
                'investment_id': investmentId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
}
