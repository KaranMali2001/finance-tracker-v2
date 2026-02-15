'use client';

import {
  Form,
  FormDatePicker,
  FormInput,
  FormOption,
  FormSelect,
  FormSwitch,
  FormTextarea,
} from '@/components/shared/form';
import { useAccounts } from '@/components/shared/hooks/useAccount';
import { useCategories, useMerchants } from '@/components/shared/hooks/useStatic';
import { useCreateTransaction } from '@/components/shared/hooks/useTransaction';
import { Button } from '@/components/ui/button';
import type { internal_domain_transaction_CreateTxnReq } from '@/generated/api';
import { internal_domain_transaction_TxnType } from '@/generated/api';
import { startOfDay } from 'date-fns';
import { useMemo } from 'react';
import * as z from 'zod';

// Transaction Type Options
const TXN_TYPE_OPTIONS: FormOption[] = [
  { value: internal_domain_transaction_TxnType.TxnTypeDebit, label: 'Debit' },
  { value: internal_domain_transaction_TxnType.TxnTypeCredit, label: 'Credit' },
  { value: internal_domain_transaction_TxnType.TxnTypeSubscription, label: 'Subscription' },
  { value: internal_domain_transaction_TxnType.TxnTypeInvestment, label: 'Investment' },
  { value: internal_domain_transaction_TxnType.TxnTypeIncome, label: 'Income' },
  { value: internal_domain_transaction_TxnType.TxnTypeRefund, label: 'Refund' },
];

const createTransactionSchema = z.object({
  account_id: z.string().min(1, 'Account is required'),
  type: z.nativeEnum(internal_domain_transaction_TxnType, {
    message: 'Transaction type is required',
  }),
  amount: z
    .number({ message: 'Amount is required' })
    .positive('Amount must be greater than 0')
    .min(0.01, 'Amount must be at least 0.01'),
  description: z.string().optional(),
  category_id: z.string().optional(),
  merchant_id: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
  payment_method: z.string().optional(),
  reference_number: z.string().optional(),
  is_recurring: z.boolean().optional(),
  transaction_date: z.string().min(1, 'Transaction date is required'),
});

type CreateTransactionFormSchema = z.infer<typeof createTransactionSchema>;

interface TransactionCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: Partial<CreateTransactionFormSchema>;
}

export function TransactionCreateForm({
  onSuccess,
  onCancel,
  initialValues,
}: TransactionCreateFormProps) {
  const createTransaction = useCreateTransaction();
  const { data: accounts, isLoading: isLoadingAccounts } = useAccounts();
  const { data: categories, isLoading: isLoadingCategories } = useCategories();
  const { data: merchants, isLoading: isLoadingMerchants } = useMerchants();

  const accountOptions = useMemo(() => {
    if (!accounts) {
      return [];
    }
    return accounts
      .filter((account) => account.id && account.account_name)
      .map((account) => ({
        value: account.id!,
        label: account.account_name!,
      }));
  }, [accounts]);

  const categoryOptions = useMemo(() => {
    if (!categories) {
      return [];
    }
    return categories
      .filter((category) => category.id && category.name)
      .map((category) => ({
        value: category.id!,
        label: category.name!,
      }));
  }, [categories]);

  const merchantOptions = useMemo(() => {
    if (!merchants) {
      return [];
    }
    return merchants
      .filter((merchant) => merchant.id && merchant.name)
      .map((merchant) => ({
        value: merchant.id!,
        label: merchant.name!,
      }));
  }, [merchants]);

  const handleSubmit = async (data: z.infer<typeof createTransactionSchema>) => {
    try {
      const submitData: internal_domain_transaction_CreateTxnReq = {
        account_id: data.account_id,
        type: data.type,
        amount: data.amount,
        description: data.description || undefined,
        category_id: data.category_id || undefined,
        merchant_id: data.merchant_id || undefined,
        notes: data.notes || undefined,
        tags: data.tags || undefined,
        payment_method: data.payment_method || undefined,
        reference_number: data.reference_number || undefined,
        is_recurring: data.is_recurring || false,
        transaction_date: data.transaction_date || undefined,
      };
      await createTransaction.mutateAsync(submitData);
      onSuccess?.();
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  };

  // Ensure transaction date is always today or earlier (never future)
  const getTodayDateString = () => {
    const today = startOfDay(new Date());
    return today.toISOString();
  };

  const defaultValues: Partial<CreateTransactionFormSchema> = {
    account_id: '',
    type: undefined,
    amount: undefined,
    description: '',
    category_id: '',
    merchant_id: '',
    notes: '',
    tags: '',
    payment_method: '',
    reference_number: '',
    is_recurring: false,
    transaction_date: getTodayDateString(),
  };

  const mergedDefaultValues: Partial<CreateTransactionFormSchema> = {
    ...defaultValues,
    ...(initialValues || {}),
  };

  return (
    <Form
      key={JSON.stringify(mergedDefaultValues)}
      schema={createTransactionSchema}
      defaultValues={mergedDefaultValues}
      onSubmit={handleSubmit}
      showToastOnSuccess={false}
      showToastOnError={false}
    >
      {({ form, isSubmitting }) => (
        <div className="space-y-4 flex flex-col gap-4">
          {/* Account + Transaction Type - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="account_id"
              label="Account"
              required
              options={accountOptions}
              placeholder={isLoadingAccounts ? 'Loading accounts...' : 'Select an account'}
              disabled={isLoadingAccounts}
              searchable={true}
            />
            <FormSelect
              control={form.control}
              name="type"
              label="Transaction Type"
              required
              options={TXN_TYPE_OPTIONS}
              placeholder="Select transaction type"
            />
          </div>

          {/* Merchant + Category - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormSelect
              control={form.control}
              name="merchant_id"
              label="Merchant"
              options={merchantOptions}
              placeholder={isLoadingMerchants ? 'Loading merchants...' : 'Select a merchant'}
              disabled={isLoadingMerchants}
              searchable={true}
            />
            <FormSelect
              control={form.control}
              name="category_id"
              label="Category"
              options={categoryOptions}
              placeholder={isLoadingCategories ? 'Loading categories...' : 'Select a category'}
              disabled={isLoadingCategories}
              searchable={true}
            />
          </div>

          {/* Transaction Date + Amount - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormDatePicker
              control={form.control}
              name="transaction_date"
              label="Transaction Date"
              required
              placeholder="Select transaction date"
              allowFutureDates={true}
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

          {/* Description + Merchant - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormTextarea
              control={form.control}
              name="description"
              label="Description"
              placeholder="Enter description"
            />
            <FormTextarea
              control={form.control}
              name="notes"
              label="Notes"
              placeholder="Enter notes"
            />
          </div>

          {/* Notes - Full Width */}

          {/* Tags + Payment Method - Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="tags"
              label="Tags"
              placeholder="Enter tags (comma separated)"
            />
            <FormInput
              control={form.control}
              name="payment_method"
              label="Payment Method"
              placeholder="Enter payment method"
            />
          </div>

          {/* Reference Number - Full Width */}
          <FormInput
            control={form.control}
            name="reference_number"
            label="Reference Number"
            placeholder="Enter reference number"
          />

          {/* Is Recurring - Full Width */}
          <FormSwitch
            control={form.control}
            name="is_recurring"
            label="Recurring Transaction"
            switchLabel="Mark as recurring transaction"
            description="Recurring transactions are automatically created on schedule"
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || createTransaction.isPending}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || createTransaction.isPending}>
              {isSubmitting || createTransaction.isPending ? 'Creating...' : 'Create Transaction'}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
