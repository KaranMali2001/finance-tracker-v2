'use client';

import { TanStackTable, type TanStackTableColumn } from '@/components/shared/table';
import { LoadingState } from '@/components/shared/layout';
import { useUnlinkTransaction } from '@/components/shared/hooks/useInvestment';
import type { internal_domain_investment_GoalTransaction } from '@/generated/api';
import { format } from 'date-fns';

interface LinkedTransactionsTableProps {
  transactions: internal_domain_investment_GoalTransaction[];
  ruleId?: string;
  isLoading?: boolean;
}

const columns: TanStackTableColumn<internal_domain_investment_GoalTransaction>[] = [
  {
    id: 'transaction_date',
    header: 'Date',
    accessorKey: 'transaction_date',
    sortable: true,
    cell: (row) =>
      row.transaction_date ? format(new Date(row.transaction_date), 'dd MMM yyyy') : '—',
  },
  {
    id: 'amount',
    header: 'Amount',
    accessorKey: 'amount',
    align: 'right',
    cell: (row) =>
      row.amount != null
        ? `₹${row.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
        : '—',
  },
  {
    id: 'source',
    header: 'Source',
    accessorKey: 'source',
    cell: (row) => row.source ?? '—',
  },
  {
    id: 'notes',
    header: 'Notes',
    accessorKey: 'notes',
    cell: (row) => row.notes ?? '—',
  },
];

export function LinkedTransactionsTable({
  transactions,
  ruleId,
  isLoading,
}: LinkedTransactionsTableProps) {
  const unlink = useUnlinkTransaction();

  if (isLoading) return <LoadingState />;

  return (
    <TanStackTable
      data={transactions}
      columns={columns}
      rowActions={{
        span: 1,
        onDelete: (row) => {
          if (row.id) {
            unlink.mutate({ linkId: row.id, ruleId });
          }
        },
      }}
    />
  );
}
