/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type internal_domain_investment_CreateGoalInvestmentReq = {
    account_id: string;
    auto_invest?: boolean;
    contribution_type: internal_domain_investment_CreateGoalInvestmentReq.contribution_type;
    contribution_value: number;
    current_value?: number;
    description_pattern?: string;
    goal_id?: string;
    investment_day?: number;
    investment_type: internal_domain_investment_CreateGoalInvestmentReq.investment_type;
    merchant_name_pattern?: string;
};
export namespace internal_domain_investment_CreateGoalInvestmentReq {
    export enum contribution_type {
        ONE_TIME = 'one_time',
        SIP = 'sip',
    }
    export enum investment_type {
        MUTUAL_FUND = 'mutual_fund',
        STOCK = 'stock',
        FD = 'fd',
        PPF = 'ppf',
        NPS = 'nps',
        GOLD = 'gold',
        REAL_ESTATE = 'real_estate',
        CRYPTO = 'crypto',
        OTHER = 'other',
    }
}

