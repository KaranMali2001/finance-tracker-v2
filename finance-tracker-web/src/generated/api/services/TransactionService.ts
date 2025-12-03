/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { internal_domain_transaction_CreateTxnReq } from '../models/internal_domain_transaction_CreateTxnReq';
import type { internal_domain_transaction_ParsedTxnRes } from '../models/internal_domain_transaction_ParsedTxnRes';
import type { internal_domain_transaction_SoftDeleteTxnsReq } from '../models/internal_domain_transaction_SoftDeleteTxnsReq';
import type { internal_domain_transaction_Trasaction } from '../models/internal_domain_transaction_Trasaction';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class TransactionService {
  /**
   * Get transactions with filters
   * Retrieves transactions for the authenticated user with optional filters
   * @param accountId Account ID
   * @param categoryId Category ID
   * @param merchantId Merchant ID
   * @returns internal_domain_transaction_Trasaction OK
   * @throws ApiError
   */
  public static getTransaction(
    accountId?: string,
    categoryId?: string,
    merchantId?: string
  ): CancelablePromise<Array<internal_domain_transaction_Trasaction>> {
    return __request(OpenAPI, {
      method: 'GET',
      url: '/transaction',
      query: {
        account_id: accountId,
        category_id: categoryId,
        merchant_id: merchantId,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Create a new transaction
   * Creates a new financial transaction for the authenticated user
   * @param transaction Transaction creation request
   * @returns internal_domain_transaction_Trasaction Created
   * @throws ApiError
   */
  public static postTransaction(
    transaction: internal_domain_transaction_CreateTxnReq
  ): CancelablePromise<internal_domain_transaction_Trasaction> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/transaction',
      body: transaction,
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Soft delete transactions
   * Soft deletes multiple transactions for the authenticated user
   * @param transaction Soft delete request
   * @returns void
   * @throws ApiError
   */
  public static deleteTransaction(
    transaction: internal_domain_transaction_SoftDeleteTxnsReq
  ): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: 'DELETE',
      url: '/transaction',
      body: transaction,
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        500: `Internal Server Error`,
      },
    });
  }
  /**
   * Parse transaction from image
   * Parses transaction information from an uploaded image using AI/OCR for the authenticated user
   * @param image Transaction image file (JPEG, PNG, GIF, WEBP)
   * @returns internal_domain_transaction_ParsedTxnRes OK
   * @throws ApiError
   */
  public static postTransactionImageParse(
    image: Blob
  ): CancelablePromise<internal_domain_transaction_ParsedTxnRes> {
    return __request(OpenAPI, {
      method: 'POST',
      url: '/transaction/image-parse',
      formData: {
        image: image,
      },
      errors: {
        400: `Bad Request`,
        401: `Unauthorized`,
        500: `Internal Server Error`,
      },
    });
  }
}
