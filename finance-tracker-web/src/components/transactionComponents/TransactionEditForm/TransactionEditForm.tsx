'use client';

import { Form, FormDatePicker, FormInput, FormOption, FormSelect } from '@/components/shared/form';
import { useCategories, useMerchants } from '@/components/shared/hooks/useStatic';
import { useUpdateTransaction } from '@/components/shared/hooks/useTransaction';
import { Button } from '@/components/ui/button';
import type { internal_domain_transaction_Transaction } from '@/generated/api';
import { internal_domain_transaction_TxnType } from '@/generated/api';
import { useMemo } from 'react';
import * as z from 'zod';

const TXN_TYPE_OPTIONS: FormOption[] = [
  { value: internal_domain_transaction_TxnType.TxnTypeDebit, label: 'Debit' },
  { value: internal_domain_transaction_TxnType.TxnTypeCredit, label: 'Credit' },
  { value: internal_domain_transaction_TxnType.TxnTypeSubscription, label: 'Subscription' },
  { value: internal_domain_transaction_TxnType.TxnTypeInvestment, label: 'Investment' },
  { value: internal_domain_transaction_TxnType.TxnTypeIncome, label: 'Income' },
  { value: internal_domain_transaction_TxnType.TxnTypeRefund, label: 'Refund' },
];

const editTransactionSchema = z.object({
  type: z.nativeEnum(internal_domain_transaction_TxnType, { message: 'Type is required' }),
  amount: z
    .number({ message: 'Amount is required' })
    .positive('Amount must be greater than 0')
    .min(0.01),
  description: z.string().optional(),
  category_id: z.string().optional(),
  merchant_id: z.string().optional(),
  transaction_date: z.string().min(1, 'Transaction date is required'),
});

type EditTransactionFormSchema = z.infer<typeof editTransactionSchema>;

interface TransactionEditFormProps {
  transaction: internal_domain_transaction_Transaction;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function TransactionEditForm({
  transaction,
  onSuccess,
  onCancel,
}: TransactionEditFormProps) {
  const updateTransaction = useUpdateTransaction();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: merchants, isLoading: isLoadingMerchants } = useMerchants();

  const categoryOptions = useMemo(
    () =>
      (categories ?? [])
        .filter((c) => c.id && c.name)
        .map((c) => ({ value: c.id!, label: c.name! })),
    [categories]
  );

  const merchantOptions = useMemo(
    () =>
      (merchants ?? [])
        .filter((m) => m.id && m.name)
        .map((m) => ({ value: m.id!, label: m.name! })),
    [merchants]
  );

  const defaultValues: EditTransactionFormSchema = {
    type:
      (transaction.type as internal_domain_transaction_TxnType) ??
      internal_domain_transaction_TxnType.TxnTypeDebit,
    amount: transaction.amount ?? 0,
    description: transaction.description ?? '',
    category_id: transaction.category_id ?? '',
    merchant_id: transaction.merchant_id ?? '',
    transaction_date: transaction.transaction_date ?? transaction.created_at ?? '',
  };

  const handleSubmit = async (data: EditTransactionFormSchema) => {
    try {
      await updateTransaction.mutateAsync({
        id: transaction.id!,
        type: data.type,
        amount: data.amount,
        description: data.description || undefined,
        category_id: data.category_id || undefined,
        merchant_id: data.merchant_id || undefined,
        transaction_date: data.transaction_date || undefined,
      });
      onSuccess?.();
    } catch {
      // handled by mutation hook
    }
  };

  return (
    <Form
      schema={editTransactionSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      showToastOnSuccess={false}
      showToastOnError={false}
    >
      {({ form, isSubmitting }) => (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="type"
              label="Type"
              required
              options={TXN_TYPE_OPTIONS}
              placeholder="Select type"
            />
            <FormInput
              control={form.control}
              name="amount"
              label="Amount"
              required
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Enter amount"
            />
          </div>

          <FormDatePicker
            control={form.control}
            name="transaction_date"
            label="Transaction Date"
            required
            placeholder="Select date"
            allowFutureDates={true}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="merchant_id"
              label="Merchant"
              options={merchantOptions}
              placeholder={isLoadingMerchants ? 'Loading...' : 'Select merchant'}
              disabled={isLoadingMerchants}
              searchable
            />
            <FormSelect
              control={form.control}
              name="category_id"
              label="Category"
              options={categoryOptions}
              placeholder={isLoadingCategories ? 'Loading...' : 'Select category'}
              disabled={isLoadingCategories}
              searchable
            />
          </div>

          <FormInput
            control={form.control}
            name="description"
            label="Description"
            placeholder="Enter description"
          />

          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || updateTransaction.isPending}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || updateTransaction.isPending}>
              {isSubmitting || updateTransaction.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
