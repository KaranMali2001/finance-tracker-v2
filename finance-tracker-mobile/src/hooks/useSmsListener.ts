import { useEffect, useRef } from "react";
import { NativeEventEmitter, NativeModules, Platform } from "react-native";
import { getTransactionInfo } from "transaction-sms-parser";
import type { ParsedSms, RawSms } from "../types/sms";

const { SmsReceiverModule } = NativeModules;

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
    if (Platform.OS !== "android" || !SmsReceiverModule) return;

    const emitter = new NativeEventEmitter(SmsReceiverModule);

    SmsReceiverModule.startListening();

    const subscription = emitter.addListener(
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

        const parsed = getTransactionInfo(raw.body);

        onSmsRef.current({
          raw,
          parsed,
          isTransaction,
        });
      }
    );

    return () => {
      subscription.remove();
      SmsReceiverModule.stopListening();
    };
  }, []);
}
