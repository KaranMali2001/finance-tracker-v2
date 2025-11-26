/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_auth_GetAuthUserResponse } from '../models/internal_domain_auth_GetAuthUserResponse';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class AuthService {
    /**
     * Get authenticated user
     * Returns the current authenticated user's information
     * @returns internal_domain_auth_GetAuthUserResponse OK
     * @throws ApiError
     */
    public static getAuthUser(): CancelablePromise<internal_domain_auth_GetAuthUserResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/auth/user',
            errors: {
                401: `Unauthorized`,
            },
        });
    }
}
