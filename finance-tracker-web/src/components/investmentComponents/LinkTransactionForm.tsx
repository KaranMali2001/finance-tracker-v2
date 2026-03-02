'use client';

import { Form, FormDatePicker, FormInput } from '@/components/shared/form';
import { useLinkTransaction } from '@/components/shared/hooks/useInvestment';
import { Button } from '@/components/ui/button';
import * as z from 'zod';

const linkSchema = z.object({
  transaction_id: z.string().min(1, 'Transaction ID is required'),
  amount: z.number({ message: 'Amount is required' }).positive('Amount must be greater than 0'),
  transaction_date: z.string().min(1, 'Date is required'),
  expected_amount: z.number().positive().optional().or(z.literal(undefined)),
  notes: z.string().optional(),
});

type LinkFormSchema = z.infer<typeof linkSchema>;

interface LinkTransactionFormProps {
  ruleId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LinkTransactionForm({ ruleId, onSuccess, onCancel }: LinkTransactionFormProps) {
  const link = useLinkTransaction();

  const handleSubmit = async (data: LinkFormSchema) => {
    try {
      await link.mutateAsync({
        investment_id: ruleId,
        transaction_id: data.transaction_id,
        amount: data.amount,
        transaction_date: data.transaction_date,
        expected_amount: data.expected_amount,
        notes: data.notes || undefined,
      });
      onSuccess?.();
    } catch {
      // handled by hook
    }
  };

  return (
    <Form
      schema={linkSchema}
      defaultValues={{
        transaction_id: '',
        amount: undefined,
        transaction_date: '',
        expected_amount: undefined,
        notes: '',
      }}
      onSubmit={handleSubmit}
      showToastOnSuccess={false}
      showToastOnError={false}
    >
      {({ form, isSubmitting: formIsSubmitting }) => (
        <div className="space-y-4">
          <FormInput
            control={form.control}
            name="transaction_id"
            label="Transaction ID"
            placeholder="Paste transaction UUID"
            required
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              control={form.control}
              name="amount"
              label="Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Actual amount"
              required
            />
            <FormInput
              control={form.control}
              name="expected_amount"
              label="Expected Amount (₹)"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="Optional"
            />
          </div>
          <FormDatePicker
            control={form.control}
            name="transaction_date"
            label="Transaction Date"
            required
          />
          <FormInput
            control={form.control}
            name="notes"
            label="Notes"
            placeholder="Optional notes"
          />
          <div className="flex justify-end gap-2 pt-2">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={link.isPending || formIsSubmitting}
              >
                Cancel
              </Button>
            )}
            <Button type="submit" disabled={link.isPending || formIsSubmitting}>
              {link.isPending || formIsSubmitting ? 'Linking...' : 'Link Transaction'}
            </Button>
          </div>
        </div>
      )}
    </Form>
  );
}
