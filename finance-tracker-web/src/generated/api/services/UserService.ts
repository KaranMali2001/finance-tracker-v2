/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_user_UpdateUserReq } from '../models/internal_domain_user_UpdateUserReq';
import type { internal_domain_user_User } from '../models/internal_domain_user_User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class UserService {
    /**
     * Update user
     * Updates the authenticated user's information
     * @param user User update request
     * @returns internal_domain_user_User OK
     * @throws ApiError
     */
    public static putUser(
        user: internal_domain_user_UpdateUserReq,
    ): CancelablePromise<internal_domain_user_User> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/user',
            body: user,
            errors: {
                400: `Bad Request`,
                401: `Unauthorized`,
                500: `Internal Server Error`,
            },
        });
    }
}
