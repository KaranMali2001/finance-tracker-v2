import type { ParsedSms } from "../types/sms";

export function getParseFailureReason(sms: ParsedSms): string | null {
  const txn = sms.parsed.transaction;
  const account = sms.parsed.account;

  if (!sms.isTransaction) {
    return "Not detected as transaction SMS";
  }

  const missing: string[] = [];
  if (txn.amount == null || txn.amount === "") {
    missing.push("amount");
  }
  if (account.number == null || account.number === "") {
    missing.push("account number");
  }

  if (missing.length === 0) {
    return null;
  }

  return `Parse failed: missing ${missing.join(" & ")}`;
}

export function wouldParseSucceed(sms: ParsedSms): boolean {
  const txn = sms.parsed.transaction;
  const account = sms.parsed.account;
  return (
    sms.isTransaction &&
    txn.amount != null &&
    txn.amount !== "" &&
    account.number != null &&
    account.number !== ""
  );
}
