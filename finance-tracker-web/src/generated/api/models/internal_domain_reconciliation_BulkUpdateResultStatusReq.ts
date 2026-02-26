/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type internal_domain_reconciliation_BulkUpdateResultStatusReq = {
    result_ids: Array<string>;
    upload_id: string;
    user_action: internal_domain_reconciliation_BulkUpdateResultStatusReq.user_action;
};
export namespace internal_domain_reconciliation_BulkUpdateResultStatusReq {
    export enum user_action {
        ACCEPTED = 'accepted',
        REJECTED = 'rejected',
    }
}

