'use client';

import { FormDatePicker, FormInput } from '@/components/shared/form';
import { useTransactions } from '@/components/shared/hooks/useTransaction';
import { useLinkTransaction } from '@/components/shared/hooks/useInvestment';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { format } from 'date-fns';
import { ChevronsUpDown, Search } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import type { internal_domain_transaction_Transaction } from '@/generated/api';

const linkSchema = z.object({
  transaction_id: z.string().min(1, 'Select a transaction'),
  amount: z.number({ message: 'Amount is required' }).positive('Amount must be greater than 0'),
  transaction_date: z.string().min(1, 'Date is required'),
  expected_amount: z.number().positive().optional().or(z.literal(undefined)),
  notes: z.string().optional(),
});

type LinkFormSchema = z.infer<typeof linkSchema>;

interface LinkTransactionFormProps {
  ruleId: string;
  accountId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function LinkTransactionForm({
  ruleId,
  accountId,
  onSuccess,
  onCancel,
}: LinkTransactionFormProps) {
  const link = useLinkTransaction();
  const { data: transactions, isLoading: txnsLoading } = useTransactions({ accountId });

  const [pickerOpen, setPickerOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedTxn, setSelectedTxn] = useState<internal_domain_transaction_Transaction | null>(
    null
  );

  const form = useForm<LinkFormSchema>({
    resolver: zodResolver(linkSchema),
    defaultValues: {
      transaction_id: '',
      amount: undefined,
      transaction_date: '',
      expected_amount: undefined,
      notes: '',
    },
  });

  const filtered = (transactions ?? []).filter((t) => {
    const q = search.toLowerCase();
    return (
      (t.merchant_name ?? '').toLowerCase().includes(q) ||
      (t.description ?? '').toLowerCase().includes(q) ||
      String(t.amount ?? '').includes(q)
    );
  });

  const handleSelect = (txn: internal_domain_transaction_Transaction) => {
    setSelectedTxn(txn);
    form.setValue('transaction_id', txn.id ?? '', { shouldValidate: true });
    if (txn.amount != null) {
      form.setValue('amount', txn.amount, { shouldValidate: true });
    }
    if (txn.transaction_date) {
      form.setValue('transaction_date', txn.transaction_date, { shouldValidate: true });
    }
    setPickerOpen(false);
    setSearch('');
  };

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

  const txnError = form.formState.errors.transaction_id;

  return (
    <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <label className="text-sm font-medium text-stone-700">Transaction</label>
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button type="button" variant="outline" className="w-full justify-between font-normal">
              {selectedTxn ? (
                <span className="flex items-center gap-2 truncate">
                  <span className="font-medium truncate">
                    {selectedTxn.merchant_name ?? selectedTxn.description ?? 'Transaction'}
                  </span>
                  <span className="text-stone-500 shrink-0">
                    ₹{selectedTxn.amount?.toLocaleString('en-IN')}
                  </span>
                  {selectedTxn.transaction_date && (
                    <span className="text-stone-400 shrink-0 text-xs">
                      {format(new Date(selectedTxn.transaction_date), 'dd MMM yyyy')}
                    </span>
                  )}
                </span>
              ) : (
                <span className="text-stone-400">Select a transaction…</span>
              )}
              <ChevronsUpDown className="h-4 w-4 shrink-0 text-stone-400" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[420px] p-0" align="start">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Search className="h-4 w-4 text-stone-400 shrink-0" />
              <Input
                className="border-0 shadow-none focus-visible:ring-0 h-8 px-0"
                placeholder="Search by merchant, description or amount…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="max-h-64 overflow-y-auto">
              {txnsLoading ? (
                <p className="py-6 text-center text-sm text-stone-400">Loading…</p>
              ) : filtered.length === 0 ? (
                <p className="py-6 text-center text-sm text-stone-400">No transactions found</p>
              ) : (
                filtered.map((txn) => (
                  <Button
                    key={txn.id}
                    type="button"
                    variant="ghost"
                    onClick={() => handleSelect(txn)}
                    className="w-full justify-between px-3 py-2.5 h-auto text-sm text-left gap-3 rounded-none"
                  >
                    <span className="flex flex-col min-w-0">
                      <span className="font-medium truncate text-stone-800">
                        {txn.merchant_name ?? txn.description ?? '—'}
                      </span>
                      {txn.merchant_name && txn.description && (
                        <span className="text-xs text-stone-400 truncate">{txn.description}</span>
                      )}
                    </span>
                    <span className="flex flex-col items-end shrink-0">
                      <span className="font-medium text-stone-900">
                        ₹{txn.amount?.toLocaleString('en-IN')}
                      </span>
                      {txn.transaction_date && (
                        <span className="text-xs text-stone-400">
                          {format(new Date(txn.transaction_date), 'dd MMM yyyy')}
                        </span>
                      )}
                    </span>
                  </Button>
                ))
              )}
            </div>
          </PopoverContent>
        </Popover>
        {txnError && <p className="text-xs text-red-500">{txnError.message}</p>}
      </div>

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
      <FormInput control={form.control} name="notes" label="Notes" placeholder="Optional notes" />
      <div className="flex justify-end gap-2 pt-2">
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={link.isPending || form.formState.isSubmitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={link.isPending || form.formState.isSubmitting}>
          {link.isPending || form.formState.isSubmitting ? 'Linking…' : 'Link Transaction'}
        </Button>
      </div>
    </form>
  );
}
