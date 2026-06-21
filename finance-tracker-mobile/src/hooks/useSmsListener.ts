import { requireOptionalNativeModule } from "expo-modules-core";
import { useEffect, useRef } from "react";
import { Platform } from "react-native";
import { getTransactionInfo } from "transaction-sms-parser";
import type { ParsedSms, RawSms } from "../types/sms";
import { normalizeSmsBody } from "../utils/normalizeSmsBody";

const SmsReceiver = requireOptionalNativeModule("SmsReceiver");

const BANK_SENDER_PATTERN =
  /^[A-Z]{2}-[A-Z0-9]{4,6}$|^VM-|^BW-|^AX-|^JD-|HDFC|ICICI|SBI|AXIS|KOTAK|BOB|PNB|INDUS|YES|PAYTM|GPAY|PHONEPE/i;

const TRANSACTION_KEYWORDS =
  /debited|credited|spent|paid|payment|transaction|balance|rs\.|inr|transferred/i;

interface SmsEvent {
  address: string;
  body: string;
  date: number;
}

export function useSmsListener(onSms: (sms: ParsedSms) => void) {
  const onSmsRef = useRef(onSms);
  onSmsRef.current = onSms;

  useEffect(() => {
    if (Platform.OS !== "android" || !SmsReceiver) return;

    SmsReceiver.startListening();

    const subscription = SmsReceiver.addListener(
      "onSmsReceived",
      (event: SmsEvent) => {
        const raw: RawSms = {
          _id: String(event.date),
          address: event.address,
          body: event.body,
          date: String(event.date),
          date_sent: String(event.date),
        };

        const isTransaction =
          BANK_SENDER_PATTERN.test(raw.address) ||
          TRANSACTION_KEYWORDS.test(raw.body);

        if (!isTransaction) return;

        const parsed = getTransactionInfo(normalizeSmsBody(raw.body));

        onSmsRef.current({
          raw,
          parsed,
          isTransaction,
        });
      }
    );

    return () => {
      subscription.remove();
      SmsReceiver.stopListening();
    };
  }, []);
}
