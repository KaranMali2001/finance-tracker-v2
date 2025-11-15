/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { system_HealthCheckResult } from './system_HealthCheckResult';
export type system_HealthResponse = {
    checks?: Record<string, system_HealthCheckResult>;
    environment?: string;
    status?: string;
    timestamp?: string;
};

