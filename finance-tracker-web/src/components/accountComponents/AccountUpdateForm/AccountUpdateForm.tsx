'use client';

import { Form, FormInput, FormOption, FormSelect, FormSwitch } from '@/components/shared/form';
import { useUpdateAccount } from '@/components/shared/hooks/useAccount';
import { useBanks } from '@/components/shared/hooks/useStatic';
import { Button } from '@/components/ui/button';
import type {
  internal_domain_account_Account,
  internal_domain_account_UpdateAccountReq,
} from '@/generated/api';
import { useRouter } from 'next/navigation';
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

const updateAccountSchema = z.object({
  account_name: z.string().min(1, 'Account name is required'),
  account_number: z.string().optional(),
  account_type: z.string().optional(),
  current_balence: z.number().nullable().optional(),
  bank_id: z.string().optional(),
  is_primary: z.boolean().optional(),
});

interface AccountUpdateFormProps {
  account: internal_domain_account_Account;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function AccountUpdateForm({ account, onSuccess, onCancel }: AccountUpdateFormProps) {
  const router = useRouter();
  const updateAccount = useUpdateAccount();
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

  const handleSubmit = async (data: z.infer<typeof updateAccountSchema>) => {
    if (!account.id) {
      return;
    }

    // Only include fields that have changed from the original account values
    const updateData: internal_domain_account_UpdateAccountReq = {
      account_id: account.id,
    };

    // Only add fields that have changed
    if (data.account_name !== account.account_name) {
      updateData.account_name = data.account_name;
    }

    if (data.account_number !== (account.account_number || '')) {
      updateData.account_number = data.account_number || undefined;
    }

    if (data.account_type !== (account.account_type || '')) {
      updateData.account_type = data.account_type || undefined;
    }

    // Handle current_balence comparison - account.current_balence might be undefined
    const currentBalance = account.current_balence ?? null;
    const formBalance = data.current_balence ?? null;
    if (formBalance !== currentBalance) {
      updateData.current_balence = data.current_balence ?? undefined;
    }

    // Handle bank_id comparison
    const currentBankId = account.bank_id || '';
    if (data.bank_id && data.bank_id !== currentBankId) {
      updateData.bank_id = data.bank_id;
    }

    // Handle is_primary comparison
    if (data.is_primary !== undefined && data.is_primary !== account.is_primary) {
      updateData.is_primary = data.is_primary;
    }

    // Only submit if there are changes (besides account_id)
    if (Object.keys(updateData).length === 1) {
      // No changes, just call onSuccess
      onSuccess?.();
      return;
    }

    try {
      await updateAccount.mutateAsync(updateData);
      router.refresh();
      onSuccess?.();
    } catch (error) {
      // Error handling is done by the mutation hook
    }
  };

  const defaultValues: Partial<z.infer<typeof updateAccountSchema>> = {
    account_name: account.account_name || '',
    account_number: account.account_number || '',
    account_type: account.account_type || '',
    current_balence: account.current_balence ?? null,
    bank_id: account.bank_id || '',
    is_primary: account.is_primary ?? false,
  };

  return (
    <Form
      schema={updateAccountSchema}
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
            placeholder="Enter account number"
          />
          <FormSelect
            control={form.control}
            name="account_type"
            label="Account Type"
            options={ACCOUNT_TYPES as unknown as FormOption[]}
            placeholder="Select account type"
          />
          <FormInput
            control={form.control}
            name="current_balence"
            label="Current Balance"
            type="number"
            step="0.01"
            placeholder="Enter current balance"
          />
          <FormSelect
            control={form.control}
            name="bank_id"
            label="Bank"
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
          />
          <div className="flex justify-end gap-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting || updateAccount.isPending}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={isSubmitting || updateAccount.isPending}>
              {isSubmitting || updateAccount.isPending ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
