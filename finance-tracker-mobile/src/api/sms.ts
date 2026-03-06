import { apiClient } from "./client";

export interface SubmitSmsPayload {
  sender: string;
  raw_message: string;
  received_at: string;
  parse_status: "success" | "failed";
  amount?: number;
  account_number?: string;
  transaction_type?: string;
  merchant?: string;
  reference_number?: string;
}

export async function submitSms(payload: SubmitSmsPayload): Promise<void> {
  await apiClient.post("/sms", payload);
}
