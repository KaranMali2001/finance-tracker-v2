/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_sms_CreateSmsReq } from '../models/internal_domain_sms_CreateSmsReq';
import type { internal_domain_sms_SmsLogs } from '../models/internal_domain_sms_SmsLogs';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class SmsService {
  /**
   * Get all SMS logs
   * Retrieves all SMS logs for the authenticated user
   * @returns internal_domain_sms_SmsLogs OK
   * @throws ApiError
   */
  public static getSms(): CancelablePromise<Array<internal_domain_sms_SmsLogs>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/sms',
      errors: {
        401: `Unauthorized`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Create a new SMS log
   * Creates a new SMS log entry
   * @param sms SMS creation request
   * @returns internal_domain_sms_SmsLogs Created
   * @throws ApiError
   */
  public static postSms(
    sms: internal_domain_sms_CreateSmsReq
  ): CancelablePromise<internal_domain_sms_SmsLogs> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/sms',
      body: sms,
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Get SMS log by ID
   * Retrieves a specific SMS log by its ID for the authenticated user
   * @param id SMS ID
   * @returns internal_domain_sms_SmsLogs OK
   * @throws ApiError
   */
  public static getSms1(id: string): CancelablePromise<internal_domain_sms_SmsLogs> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/sms/{id}',
      path: {
        id: id,
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
