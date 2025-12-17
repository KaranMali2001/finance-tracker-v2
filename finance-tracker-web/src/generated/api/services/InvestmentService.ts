/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_investment_CreateGoalReq } from '../models/internal_domain_investment_CreateGoalReq';
import type { internal_domain_investment_Goal } from '../models/internal_domain_investment_Goal';
import type { internal_domain_investment_UpdateGoals } from '../models/internal_domain_investment_UpdateGoals';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class InvestmentService {
    /**
     * Get investment goals with filters
     * Retrieves investment goals for the authenticated user with optional filters
     * @param status Goal status
     * @param targetDateBefore Target date before (YYYY-MM-DD)
     * @param targetDateAfter Target date after (YYYY-MM-DD)
     * @param targetAmountLessThan Target amount less than
     * @param targetAmountGreaterThan Target amount greater than
     * @param priority Priority level
     * @param createdAtBefore Created at before (ISO 8601)
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
        createdAtBefore?: string,
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
                'created_at_before': createdAtBefore,
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
     * Get investment goal by ID
     * Retrieves a specific investment goal by ID for the authenticated user
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
     * Updates an existing investment goal for the authenticated user
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
}
