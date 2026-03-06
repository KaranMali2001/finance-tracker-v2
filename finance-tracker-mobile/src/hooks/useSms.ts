import { useCallback, useState } from "react";
import SmsAndroid from "react-native-get-sms-android";
import { getTransactionInfo } from "transaction-sms-parser";
import type { ParsedSms, RawSms } from "../types/sms";

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

  const fetchSms = useCallback(
    (maxCount = 200) => {
      setLoading(true);
      setError(null);

      const filter = {
        box: "inbox",
        maxCount,
      };

      SmsAndroid.list(
        JSON.stringify(filter),
        (err: string) => {
          setLoading(false);
          setError(`Failed to read SMS: ${err}`);
        },
        (_count: number, rawSmsList: string) => {
          try {
            const messages: RawSms[] = JSON.parse(rawSmsList);

            const parsed: ParsedSms[] = messages.map((sms) => {
              const parsedInfo = getTransactionInfo(sms.body);
              const isTransaction = isTransactionSms(sms);
              return {
                raw: sms,
                parsed: parsedInfo,
                isTransaction,
              };
            });

            const transactionOnly = parsed.filter((s) => s.isTransaction);
            setSmsList(transactionOnly);
          } catch (e) {
            setError("Failed to parse SMS list");
          } finally {
            setLoading(false);
          }
        }
      );
    },
    []
  );

  return { smsList, loading, error, fetchSms };
}
