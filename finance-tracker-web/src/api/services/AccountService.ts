/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_account_Account } from '../models/internal_domain_account_Account';
import type { internal_domain_account_CreateAccountReq } from '../models/internal_domain_account_CreateAccountReq';
import type { internal_domain_account_UpdateAccountReq } from '../models/internal_domain_account_UpdateAccountReq';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AccountService {
    /**
     * Get all accounts for authenticated user
     * Retrieves all accounts associated with the authenticated user
     * @returns internal_domain_account_Account OK
     * @throws ApiError
     */
    public static getApiV1Account(): CancelablePromise<Array<internal_domain_account_Account>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/account',
            errors: {
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Update an existing account
     * Updates an existing account's information for the authenticated user
     * @param account Account update request
     * @returns internal_domain_account_Account OK
     * @throws ApiError
     */
    public static putApiV1Account(
        account: internal_domain_account_UpdateAccountReq,
    ): CancelablePromise<internal_domain_account_Account> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/v1/account',
            body: account,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Create a new account
     * Creates a new financial account for the authenticated user
     * @param account Account creation request
     * @returns internal_domain_account_Account Created
     * @throws ApiError
     */
    public static postApiV1Account(
        account: internal_domain_account_CreateAccountReq,
    ): CancelablePromise<internal_domain_account_Account> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/v1/account',
            body: account,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get account by ID
     * Retrieves a specific account by its ID for the authenticated user
     * @param accountId Account ID
     * @returns internal_domain_account_Account OK
     * @throws ApiError
     */
    public static getApiV1Account1(
        accountId: string,
    ): CancelablePromise<internal_domain_account_Account> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/v1/account/{account_id}',
            path: {
                'account_id': accountId,
            },
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                404: `Not Found`,
                500: `Internal Server Error`,
            },
        });
    }
}
