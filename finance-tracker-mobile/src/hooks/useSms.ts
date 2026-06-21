import { requireOptionalNativeModule } from "expo-modules-core";
import { useCallback, useState } from "react";
import { getTransactionInfo } from "transaction-sms-parser";
import type { ParsedSms, RawSms } from "../types/sms";
import { normalizeSmsBody } from "../utils/normalizeSmsBody";

const SmsStore = requireOptionalNativeModule("SmsStore");

const BANK_SENDER_PATTERN =
  /^[A-Z]{2}-[A-Z0-9]{4,6}$|^VM-|^BW-|^AX-|^JD-|HDFC|ICICI|SBI|AXIS|KOTAK|BOB|PNB|INDUS|YES|PAYTM|GPAY|PHONEPE/i;

const TRANSACTION_KEYWORDS =
  /debited|credited|spent|paid|payment|transaction|balance|rs\.|inr|transferred/i;

function isTransactionSms(sms: RawSms): boolean {
  const senderMatch = BANK_SENDER_PATTERN.test(sms.address);
  const bodyMatch = TRANSACTION_KEYWORDS.test(sms.body);
  return senderMatch || bodyMatch;
}

export function useSms() {
  const [smsList, setSmsList] = useState<ParsedSms[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSms = useCallback((maxCount = 200) => {
    if (!SmsStore) {
      setError("SMS module unavailable on this platform");
      return;
    }

    setLoading(true);
    setError(null);

    SmsStore.listInbox(maxCount)
      .then((messages: RawSms[]) => {
        const parsed: ParsedSms[] = messages.map((sms) => ({
          raw: sms,
          parsed: getTransactionInfo(normalizeSmsBody(sms.body)),
          isTransaction: isTransactionSms(sms),
        }));
        setSmsList(parsed.filter((s) => s.isTransaction));
      })
      .catch((e: unknown) => {
        setError(
          `Failed to read SMS: ${e instanceof Error ? e.message : String(e)}`
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return { smsList, loading, error, fetchSms };
}
