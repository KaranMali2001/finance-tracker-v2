import { useEffect } from "react";
import { NativeModules, Platform } from "react-native";
import { getTransactionInfo } from "transaction-sms-parser";
import type { ParsedSms, RawSms } from "../types/sms";
import { normalizeSmsBody } from "../utils/normalizeSmsBody";

const { SmsStoreModule } = NativeModules;

const BANK_SENDER_PATTERN =
  /^[A-Z]{2}-[A-Z0-9]{4,6}$|^VM-|^BW-|^AX-|^JD-|HDFC|ICICI|SBI|AXIS|KOTAK|BOB|PNB|INDUS|YES|PAYTM|GPAY|PHONEPE/i;

const TRANSACTION_KEYWORDS =
  /debited|credited|spent|paid|payment|transaction|balance|rs\.|inr|transferred/i;

interface StoredSms {
  address: string;
  body: string;
  date: number;
}

export function usePendingSms(onSms: (sms: ParsedSms) => void) {
  useEffect(() => {
    if (Platform.OS !== "android" || !SmsStoreModule) return;

    SmsStoreModule.drainPending()
      .then((items: StoredSms[]) => {
        for (const item of items) {
          const isTransaction =
            BANK_SENDER_PATTERN.test(item.address) ||
            TRANSACTION_KEYWORDS.test(item.body);

          if (!isTransaction) continue;

          const raw: RawSms = {
            _id: `pending_${item.date}_${Math.random()}`,
            address: item.address,
            body: item.body,
            date: String(item.date),
            date_sent: String(item.date),
          };

          onSms({
            raw,
            parsed: getTransactionInfo(normalizeSmsBody(raw.body)),
            isTransaction: true,
          });
        }
      })
      .catch(() => {});
  }, []);
}
