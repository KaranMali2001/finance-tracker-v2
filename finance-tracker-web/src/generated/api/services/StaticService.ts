/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_static_Bank } from '../models/internal_domain_static_Bank';
import type { internal_domain_static_Categories } from '../models/internal_domain_static_Categories';
import type { internal_domain_static_Merchants } from '../models/internal_domain_static_Merchants';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class StaticService {
    /**
     * Get all banks
     * Retrieves a list of all available banks
     * @returns internal_domain_static_Bank OK
     * @throws ApiError
     */
    public static getStaticBank(): CancelablePromise<Array<internal_domain_static_Bank>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/static/bank',
            errors: {
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get all categories
     * Retrieves a list of all available transaction categories
     * @returns internal_domain_static_Categories OK
     * @throws ApiError
     */
    public static getStaticCategories(): CancelablePromise<Array<internal_domain_static_Categories>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/static/categories',
            errors: {
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
    /**
     * Get all merchants
     * Retrieves a list of all available merchants
     * @returns internal_domain_static_Merchants OK
     * @throws ApiError
     */
    public static getStaticMerchants(): CancelablePromise<Array<internal_domain_static_Merchants>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/static/merchants',
            errors: {
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
}
