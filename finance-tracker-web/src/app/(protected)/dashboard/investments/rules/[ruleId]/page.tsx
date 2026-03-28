'use client';

import {
  AutoLinkButton,
  InvestmentRuleForm,
  LinkTransactionForm,
  LinkedTransactionsTable,
} from '@/components/investmentComponents';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import {
  useDeleteInvestmentRule,
  useInvestmentRuleById,
  useRuleTransactions,
} from '@/components/shared/hooks/useInvestment';
import { useTransactions } from '@/components/shared/hooks/useTransaction';
import { ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Edit, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { use, useState } from 'react';

const INVESTMENT_TYPE_COLORS: Record<string, string> = {
  mutual_fund: 'bg-blue-100 text-blue-700 border-blue-200',
  stock: 'bg-green-100 text-green-700 border-green-200',
  fd: 'bg-amber-100 text-amber-700 border-amber-200',
  ppf: 'bg-purple-100 text-purple-700 border-purple-200',
  nps: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  gold: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  real_estate: 'bg-orange-100 text-orange-700 border-orange-200',
  crypto: 'bg-rose-100 text-rose-700 border-rose-200',
  other: 'bg-stone-100 text-stone-700 border-stone-200',
};

function formatLabel(val?: string) {
  if (!val) return '—';
  return val
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

export default function RuleDetailPage({ params }: { params: Promise<{ ruleId: string }> }) {
  const { ruleId } = use(params);
  const router = useRouter();
  const { data: rule, isLoading, error, refetch } = useInvestmentRuleById(ruleId);
  const { data: transactions, isLoading: txnLoading } = useRuleTransactions(ruleId);
  const deleteRule = useDeleteInvestmentRule();
  const { data: accountTxns } = useTransactions({ accountId: rule?.account_id?.toString() });
  const accountTxnIds = (accountTxns ?? []).map((t) => t.id as string);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isLinkDialogOpen, setIsLinkDialogOpen] = useState(false);

  if (isLoading) {
    return (
      <PageShell
        title="Investment Details"
        description="Investment details and linked transactions"
      >
        <LoadingState />
      </PageShell>
    );
  }

  if (error || !rule) {
    return (
      <PageShell
        title="Investment Details"
        description="Investment details and linked transactions"
      >
        <ErrorState error={error ?? new Error('Investment not found')} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  const colorClass =
    INVESTMENT_TYPE_COLORS[rule.investment_type ?? ''] ?? INVESTMENT_TYPE_COLORS.other;

  const handleDelete = async () => {
    await deleteRule.mutateAsync(ruleId);
    router.push('/dashboard/investments/rules');
  };

  return (
    <PageShell
      title={`${formatLabel(rule.investment_type)} — ${rule.contribution_type === 'sip' ? 'SIP' : 'One-Time'}`}
      description="Investment details and linked transactions"
      actions={
        <div className="flex gap-2">
          <Link href="/dashboard/investments/rules">
            <Button variant="outline" size="sm">
              ← My Investments
            </Button>
          </Link>
          <Button size="sm" variant="outline" onClick={() => setIsEditDialogOpen(true)}>
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="text-red-600 border-red-200 hover:bg-red-50"
            onClick={handleDelete}
            disabled={deleteRule.isPending}
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Delete
          </Button>
        </div>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary card */}
        <Card className="lg:col-span-1 p-6 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${colorClass}`}>
              {rule.contribution_type === 'sip' ? 'SIP' : 'One-Time'}
            </span>
          </div>
          <p className="text-3xl font-bold text-stone-900 mb-1">
            ₹{rule.contribution_value?.toLocaleString('en-IN') ?? '—'}
            {rule.contribution_type === 'sip' && (
              <span className="text-base font-normal text-stone-500">/mo</span>
            )}
          </p>
          <p className="text-sm text-stone-600 mb-6">{formatLabel(rule.investment_type)}</p>
          <Separator className="mb-4" />
          <div className="space-y-3 text-sm">
            {rule.investment_day !== undefined && (
              <div className="flex justify-between">
                <span className="text-stone-500">SIP Day</span>
                <span className="font-medium text-stone-800">{rule.investment_day}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-stone-500">Auto-invest</span>
              <span className="font-medium text-stone-800">{rule.auto_invest ? 'On' : 'Off'}</span>
            </div>
            {rule.current_value !== undefined && (
              <div className="flex justify-between">
                <span className="text-stone-500">Current Value</span>
                <span className="font-medium text-emerald-700">
                  ₹{rule.current_value?.toLocaleString('en-IN')}
                </span>
              </div>
            )}
            {rule.goal_id && (
              <div className="flex justify-between items-center">
                <span className="text-stone-500">Linked Goal</span>
                <Link
                  href={`/dashboard/investments/${rule.goal_id}`}
                  className="text-amber-700 hover:underline font-medium"
                >
                  View Goal →
                </Link>
              </div>
            )}
          </div>
          {(rule.merchant_name_pattern || rule.description_pattern) && (
            <>
              <Separator className="my-4" />
              <div className="space-y-3 text-sm">
                {rule.merchant_name_pattern && (
                  <div>
                    <p className="text-stone-500 text-xs mb-1">Merchant Pattern</p>
                    <p className="font-mono text-xs bg-stone-50 border border-stone-200 px-2 py-1.5 rounded text-stone-700">
                      {rule.merchant_name_pattern}
                    </p>
                  </div>
                )}
                {rule.description_pattern && (
                  <div>
                    <p className="text-stone-500 text-xs mb-1">Description Pattern</p>
                    <p className="font-mono text-xs bg-stone-50 border border-stone-200 px-2 py-1.5 rounded text-stone-700">
                      {rule.description_pattern}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}
        </Card>

        {/* Transactions panel */}
        <Card className="lg:col-span-2 p-6 rounded-xl border border-stone-200 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-stone-800">
              Linked Transactions ({transactions?.length ?? 0})
            </h2>
            <div className="flex gap-2">
              <AutoLinkButton size="sm" label="Auto-Link" transactionIds={accountTxnIds} />
              <Button size="sm" onClick={() => setIsLinkDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" />
                Link
              </Button>
            </div>
          </div>
          <LinkedTransactionsTable
            transactions={transactions ?? []}
            ruleId={ruleId}
            isLoading={txnLoading}
          />
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Investment</DialogTitle>
            <DialogDescription>Update the investment details.</DialogDescription>
          </DialogHeader>
          <InvestmentRuleForm
            isEdit
            ruleId={ruleId}
            initialValues={rule}
            onSuccess={() => setIsEditDialogOpen(false)}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Link a Transaction</DialogTitle>
            <DialogDescription>Manually link a transaction to this investment.</DialogDescription>
          </DialogHeader>
          <LinkTransactionForm
            ruleId={ruleId}
            accountId={rule.account_id?.toString() ?? ''}
            onSuccess={() => setIsLinkDialogOpen(false)}
            onCancel={() => setIsLinkDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
