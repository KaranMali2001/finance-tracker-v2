/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DashboardService {
    /**
     * Stream dashboard data via SSE
     * Opens a Server-Sent Events stream. Each card's data is emitted as a separate event as soon as the query finishes. Event names: net_worth_trend, spend_by_category, budget_health, goal_progress, account_balances, portfolio_mix, done.
     * @param dateFrom Start date (YYYY-MM-DD)
     * @param dateTo End date (YYYY-MM-DD)
     * @returns any OK
     * @throws ApiError
     */
    public static getDashboardStream(
        dateFrom: string,
        dateTo: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/dashboard/stream',
            query: {
                'date_from': dateFrom,
                'date_to': dateTo,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
            },
        });
    }
}
