export interface RawSms {
  _id: string;
  address: string;
  body: string;
  date: string;
  date_sent: string;
}

export interface ParsedSms {
  raw: RawSms;
  parsed: {
    account: {
      type: string | null;
      number: string | null;
      name: string | null;
    };
    balance: {
      available: string | null;
      outstanding: string | null;
    } | null;
    transaction: {
      type: "debit" | "credit" | null;
      amount: string | null;
      merchant: string | null;
      referenceNo: string | null;
    };
  };
  isTransaction: boolean;
}
