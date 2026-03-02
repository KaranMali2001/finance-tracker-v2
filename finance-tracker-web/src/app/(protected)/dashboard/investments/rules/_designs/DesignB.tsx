'use client';

import { AutoLinkButton, InvestmentRuleForm } from '@/components/investmentComponents';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import {
  useDeleteInvestmentRule,
  useInvestmentRules,
} from '@/components/shared/hooks/useInvestment';
import { EmptyState, ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import type { internal_domain_investment_GoalInvestment } from '@/generated/api';
import { ArrowRight, Plus, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const INVESTMENT_TYPE_COLORS: Record<string, { bg: string; badge: string; dot: string }> = {
  mutual_fund: {
    bg: 'from-blue-50 to-blue-100/50',
    badge: 'bg-blue-100 text-blue-700 border-blue-200',
    dot: 'bg-blue-500',
  },
  stock: {
    bg: 'from-green-50 to-green-100/50',
    badge: 'bg-green-100 text-green-700 border-green-200',
    dot: 'bg-green-500',
  },
  fd: {
    bg: 'from-amber-50 to-amber-100/50',
    badge: 'bg-amber-100 text-amber-700 border-amber-200',
    dot: 'bg-amber-500',
  },
  ppf: {
    bg: 'from-purple-50 to-purple-100/50',
    badge: 'bg-purple-100 text-purple-700 border-purple-200',
    dot: 'bg-purple-500',
  },
  nps: {
    bg: 'from-indigo-50 to-indigo-100/50',
    badge: 'bg-indigo-100 text-indigo-700 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  gold: {
    bg: 'from-yellow-50 to-yellow-100/50',
    badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    dot: 'bg-yellow-500',
  },
  real_estate: {
    bg: 'from-orange-50 to-orange-100/50',
    badge: 'bg-orange-100 text-orange-700 border-orange-200',
    dot: 'bg-orange-500',
  },
  crypto: {
    bg: 'from-rose-50 to-rose-100/50',
    badge: 'bg-rose-100 text-rose-700 border-rose-200',
    dot: 'bg-rose-500',
  },
  other: {
    bg: 'from-stone-50 to-stone-100/50',
    badge: 'bg-stone-100 text-stone-700 border-stone-200',
    dot: 'bg-stone-500',
  },
};

const CONTRIBUTION_TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'sip', label: 'SIP' },
  { value: 'one_time', label: 'One-Time' },
];

const INVESTMENT_TYPE_FILTERS = [
  { value: '', label: 'All Types' },
  { value: 'mutual_fund', label: 'Mutual Fund' },
  { value: 'stock', label: 'Stock' },
  { value: 'fd', label: 'FD' },
  { value: 'ppf', label: 'PPF' },
  { value: 'nps', label: 'NPS' },
  { value: 'gold', label: 'Gold' },
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'crypto', label: 'Crypto' },
  { value: 'other', label: 'Other' },
];

function formatLabel(val?: string) {
  if (!val) return '—';
  return val
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function RuleCard({ rule }: { rule: internal_domain_investment_GoalInvestment }) {
  const colors = INVESTMENT_TYPE_COLORS[rule.investment_type ?? ''] ?? INVESTMENT_TYPE_COLORS.other;

  return (
    <Link href={`/dashboard/investments/rules/${rule.id}`}>
      <Card
        className={`group flex flex-col rounded-xl border border-stone-200 bg-gradient-to-br ${colors.bg} p-5 shadow-sm transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 cursor-pointer`}
      >
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${colors.dot}`} />
            <span
              className={`rounded-full px-2.5 py-0.5 text-xs font-medium border ${colors.badge}`}
            >
              {rule.contribution_type === 'sip' ? 'SIP' : 'One-Time'}
            </span>
          </div>
          <ArrowRight className="h-4 w-4 text-stone-400 group-hover:text-stone-600 transition-colors" />
        </div>
        <h3 className="font-semibold text-stone-900 text-base mb-1">
          {formatLabel(rule.investment_type)}
        </h3>
        <p className="text-2xl font-bold text-stone-800 mb-1">
          ₹{rule.contribution_value?.toLocaleString('en-IN') ?? '—'}
          {rule.contribution_type === 'sip' && (
            <span className="text-sm font-normal text-stone-500">/mo</span>
          )}
        </p>
        {rule.contribution_type === 'sip' && rule.investment_day && (
          <p className="text-xs text-stone-500 mb-3">SIP day: {rule.investment_day}</p>
        )}
        <div className="mt-auto pt-3 border-t border-stone-200/70 flex items-center justify-between text-xs text-stone-500">
          <span>{rule.auto_invest ? 'Auto-invest on' : 'Manual'}</span>
          <span className="text-amber-700 font-medium group-hover:underline">View →</span>
        </div>
      </Card>
    </Link>
  );
}

export function DesignBCardsGrid() {
  const [contributionFilter, setContributionFilter] = useState('');
  const [investmentTypeFilter, setInvestmentTypeFilter] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const deleteRule = useDeleteInvestmentRule();

  const {
    data: rules,
    isLoading,
    error,
    refetch,
  } = useInvestmentRules({
    contributionType: contributionFilter || undefined,
    investmentType: investmentTypeFilter || undefined,
  });

  if (isLoading) {
    return (
      <PageShell title="My Investments" description="Track and manage your investments">
        <LoadingState />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="My Investments" description="Track and manage your investments">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="My Investments"
      description="Track and manage your investments"
      actions={
        <div className="flex gap-2">
          <Link href="/dashboard/investments">
            <Button variant="outline" size="sm">
              Goals
            </Button>
          </Link>
          <AutoLinkButton size="sm" label="Run Auto-Link" />
          <Button size="sm" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Investment
          </Button>
        </div>
      }
    >
      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-6">
        {CONTRIBUTION_TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setContributionFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              contributionFilter === f.value
                ? 'bg-amber-600 text-white border-amber-600'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            {f.label}
          </button>
        ))}
        <div className="w-px bg-stone-200 mx-1" />
        {INVESTMENT_TYPE_FILTERS.map((f) => (
          <button
            key={f.value}
            type="button"
            onClick={() => setInvestmentTypeFilter(f.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium border transition-colors ${
              investmentTypeFilter === f.value
                ? 'bg-stone-800 text-white border-stone-800'
                : 'bg-white text-stone-600 border-stone-200 hover:border-stone-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {!rules || rules.length === 0 ? (
        <EmptyState
          icon={TrendingUp}
          title="No investments found"
          description={
            contributionFilter || investmentTypeFilter
              ? 'No investments match the selected filters.'
              : 'Add your first investment to start tracking.'
          }
          action={
            !contributionFilter && !investmentTypeFilter
              ? {
                  label: 'Add Investment',
                  onClick: () => setIsCreateDialogOpen(true),
                }
              : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {/* Add card */}
          <Card
            onClick={() => setIsCreateDialogOpen(true)}
            className="group flex min-h-[180px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-white p-5 transition-all duration-200 hover:border-amber-600 hover:bg-amber-50/50 hover:shadow-md cursor-pointer"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-amber-600 to-yellow-600 shadow-sm group-hover:shadow-md transition-all">
              <Plus className="h-5 w-5 text-white" />
            </div>
            <p className="mt-3 font-medium text-stone-700 text-sm">Add Investment</p>
          </Card>
          {rules.map((rule) => (
            <RuleCard key={rule.id} rule={rule} />
          ))}
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Investment</DialogTitle>
            <DialogDescription>Add a new one-time or recurring SIP investment.</DialogDescription>
          </DialogHeader>
          <InvestmentRuleForm
            onSuccess={() => setIsCreateDialogOpen(false)}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
