import { useCallback, useRef, useState } from "react";
import { submitSms } from "../api/sms";
import type { ParsedSms } from "../types/sms";
import { wouldParseSucceed } from "../utils/parseFailureReason";

export type SmsSubmitStatus = "sending" | "sent" | "error";

export function useSubmitSms() {
  const statusMap = useRef<Map<string, SmsSubmitStatus>>(new Map());
  const [, forceRender] = useState(0);

  const getStatus = useCallback((id: string): SmsSubmitStatus | undefined => {
    return statusMap.current.get(id);
  }, []);

  const submit = useCallback(async (sms: ParsedSms): Promise<void> => {
    const existing = statusMap.current.get(sms.raw._id);
    if (existing === "sending" || existing === "sent") return;

    statusMap.current.set(sms.raw._id, "sending");
    forceRender((n) => n + 1);

    const isSuccess = wouldParseSucceed(sms);

    try {
      const txn = sms.parsed.transaction;
      const account = sms.parsed.account;
      await submitSms({
        sender: sms.raw.address,
        raw_message: sms.raw.body,
        received_at: new Date(Number(sms.raw.date)).toISOString(),
        parse_status: isSuccess ? "success" : "failed",
        ...(isSuccess && {
          amount: parseFloat(txn.amount!),
          account_number: account.number!,
          transaction_type: txn.type ?? undefined,
          merchant: txn.merchant ?? undefined,
          reference_number: txn.referenceNo ?? undefined,
        }),
      });
      statusMap.current.set(sms.raw._id, "sent");
    } catch {
      statusMap.current.set(sms.raw._id, "error");
    } finally {
      forceRender((n) => n + 1);
    }
  }, []);

  const reset = useCallback(() => {
    statusMap.current.clear();
    forceRender((n) => n + 1);
  }, []);

  return { submit, reset, getStatus };
}
