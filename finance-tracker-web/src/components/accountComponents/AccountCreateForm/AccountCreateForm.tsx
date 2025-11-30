'use client';

import { Form, FormInput, FormOption, FormSelect, FormSwitch } from '@/components/shared/form';
import { useCreateAccount } from '@/components/shared/hooks/useAccount';
import { useBanks } from '@/components/shared/hooks/useStatic';
import { Button } from '@/components/ui/button';
import type { internal_domain_account_CreateAccountReq } from '@/generated/api';
import { useMemo } from 'react';
import * as z from 'zod';

// Account Type Enum
const ACCOUNT_TYPES = [
  { value: 'Savings', label: 'Savings' },
  { value: 'Current', label: 'Current' },
  { value: 'Credit Card', label: 'Credit Card' },
  { value: 'Debit Card', label: 'Debit Card' },
  { value: 'Fixed Deposit', label: 'Fixed Deposit' },
  { value: 'Recurring Deposit', label: 'Recurring Deposit' },
  { value: 'Loan', label: 'Loan' },
  { value: 'Investment', label: 'Investment' },
] as const;

const createAccountSchema = z.object({
  account_name: z.string().min(1, 'Account name is required'),
  account_number: z.string().min(1, 'Account number is required'),
  account_type: z.string().min(1, 'Account type is required'),
  bank_id: z.string().min(1, 'Bank is required'),
  is_primary: z.boolean(),
});

interface AccountCreateFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AccountCreateForm({ onSuccess, onCancel }: AccountCreateFormProps) {
  const createAccount = useCreateAccount();
  const { data: banks, isLoading: isLoadingBanks } = useBanks();

  const bankOptions = useMemo(() => {
    if (!banks) {
      return [];
    }
    return banks
      .filter((bank) => bank.id && bank.name)
      .map((bank) => ({
        value: bank.id!,
        label: bank.name!,
      }));
  }, [banks]);

  const handleSubmit = async (data: z.infer<typeof createAccountSchema>) => {
    try {
      const submitData: internal_domain_account_CreateAccountReq = {
        account_name: data.account_name,
        account_number: data.account_number,
        account_type: data.account_type,
        bank_id: data.bank_id,
        is_primary: data.is_primary,
      };
      await createAccount.mutateAsync(submitData);
      onSuccess?.();
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  };

  const defaultValues: Partial<internal_domain_account_CreateAccountReq> = {
    account_name: '',
    account_number: '',
    account_type: '',
    bank_id: '',
    is_primary: false,
  };

  return (
    <Form
      schema={createAccountSchema}
      defaultValues={defaultValues}
      onSubmit={handleSubmit}
      showToastOnSuccess={false}
      showToastOnError={false}
    >
      {({ form, isSubmitting }) => (
        <div className="space-y-4">
          <FormInput
            control={form.control}
            name="account_name"
            label="Account Name"
            required
            placeholder="Enter account name"
          />
          <FormInput
            control={form.control}
            name="account_number"
            label="Account Number"
            type="text"
            required
            placeholder="Enter account number"
          />
          <FormSelect
            control={form.control}
            name="account_type"
            label="Account Type"
            required
            options={ACCOUNT_TYPES as unknown as FormOption[]}
            placeholder="Select account type"
          />
          <FormSelect
            control={form.control}
            name="bank_id"
            label="Bank"
            required
            options={bankOptions}
            placeholder={isLoadingBanks ? 'Loading banks...' : 'Select a bank'}
            disabled={isLoadingBanks}
            searchable={true}
          />
          <FormSwitch
            control={form.control}
            name="is_primary"
            label="Primary Account"
            switchLabel="Set as primary account"
            description="Primary accounts are used as default for transactions"
            required
          />
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || createAccount.isPending}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || createAccount.isPending}>
              {isSubmitting || createAccount.isPending ? 'Creating...' : 'Create Account'}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
