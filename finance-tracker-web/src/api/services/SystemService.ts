/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_system_HealthResponse } from '../models/internal_domain_system_HealthResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SystemService {
    /**
     * Health status
     * Returns health information about infrastructure dependencies.
     * @returns internal_domain_system_HealthResponse OK
     * @throws ApiError
     */
    public static getHealth(): CancelablePromise<internal_domain_system_HealthResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/health',
            errors: {
                503: `Service Unavailable`,
            },
        });
    }
}
