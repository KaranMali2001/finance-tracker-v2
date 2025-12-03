'use client';

import { PageShell } from '@/components/shared/layout';
import { ReceiptUpload } from '@/components/transactionComponents/ReceiptUpload/ReceiptUpload';
import { TransactionCreateForm } from '@/components/transactionComponents/TransactionCreateForm/TransactionCreateForm';
import type { internal_domain_transaction_ParsedTxnRes } from '@/generated/api';
import { internal_domain_transaction_TxnType } from '@/generated/api';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

export default function NewTransactionPage() {
  const router = useRouter();
  const [parsedTxn, setParsedTxn] = useState<internal_domain_transaction_ParsedTxnRes | null>(null);

  const initialValues = useMemo(() => {
    if (!parsedTxn) {
      return {};
    }

    const values: {
      amount?: number;
      category_id?: string;
      merchant_id?: string;
      type?: internal_domain_transaction_TxnType;
      description?: string;
      notes?: string;
      tags?: string;
      payment_method?: string;
      reference_number?: string;
      transaction_date?: string;
    } = {};

    if (parsedTxn.amount && parsedTxn.amount > 0) {
      values.amount = parsedTxn.amount;
    }

    if (parsedTxn.category_id) {
      values.category_id = parsedTxn.category_id;
    }

    if (parsedTxn.merchant_id) {
      values.merchant_id = parsedTxn.merchant_id;
    }

    if (parsedTxn.description) {
      values.description = parsedTxn.description;
    }

    if (parsedTxn.notes) {
      values.notes = parsedTxn.notes;
    }

    if (parsedTxn.tags) {
      values.tags = parsedTxn.tags;
    }

    if (parsedTxn.payment_method) {
      values.payment_method = parsedTxn.payment_method;
    }

    if (parsedTxn.reference_number) {
      values.reference_number = parsedTxn.reference_number;
    }

    if (parsedTxn.transaction_date) {
      values.transaction_date = parsedTxn.transaction_date;
    }

    // Map parsed type string to TxnType enum
    if (parsedTxn.type) {
      const typeUpper = parsedTxn.type.toUpperCase();
      if (typeUpper === 'DEBIT') {
        values.type = internal_domain_transaction_TxnType.TxnTypeDebit;
      } else if (typeUpper === 'CREDIT') {
        values.type = internal_domain_transaction_TxnType.TxnTypeCredit;
      } else if (typeUpper === 'SUBSCRIPTION') {
        values.type = internal_domain_transaction_TxnType.TxnTypeSubscription;
      } else if (typeUpper === 'INVESTMENT') {
        values.type = internal_domain_transaction_TxnType.TxnTypeInvestment;
      } else if (typeUpper === 'INCOME') {
        values.type = internal_domain_transaction_TxnType.TxnTypeIncome;
      } else if (typeUpper === 'REFUND') {
        values.type = internal_domain_transaction_TxnType.TxnTypeRefund;
      }
    }

    // Default to DEBIT if no type is set
    if (!values.type) {
      values.type = internal_domain_transaction_TxnType.TxnTypeDebit;
    }

    return values;
  }, [parsedTxn]);

  return (
    <PageShell
      title="Create Transaction"
      description="Create a new transaction manually or upload a receipt to auto-fill details."
    >
      <div className="space-y-6">
        <ReceiptUpload
          onParsed={(parsed) => {
            setParsedTxn(parsed);
          }}
        />
        <TransactionCreateForm
          initialValues={initialValues}
          onSuccess={() => {
            router.push('/dashboard/transactions');
          }}
        />
      </div>
    </PageShell>
  );
}
