'use client';

import { InvestmentGoalForm } from '@/components/investmentComponents';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { useInvestmentGoals } from '@/components/shared/hooks/useInvestment';
import { EmptyState, ErrorState, PageShell } from '@/components/shared/layout';
import { formatDate, formatRupees } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function getStatusBadgeColor(status?: string) {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-emerald-50 text-emerald-700 border border-emerald-200';
    case 'completed':
      return 'bg-amber-50 text-amber-700 border border-amber-200';
    case 'on_hold':
      return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    case 'cancelled':
      return 'bg-red-50 text-red-700 border border-red-200';
    default:
      return 'bg-stone-50 text-stone-700 border border-stone-200';
  }
}

function getStatusLabel(status?: string) {
  if (!status) {
    return null;
  }
  return status
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

export default function InvestmentsPage() {
  const { data: goals, isLoading, error, refetch, isFetching } = useInvestmentGoals();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Show loading state while fetching or when data hasn't been loaded yet
  if (isLoading || isFetching || goals === undefined) {
    return (
      <PageShell
        title="Investment Portfolio"
        description="Track and achieve your wealth milestones"
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mx-auto mb-4" />
            <p className="text-sm font-medium text-stone-600">Loading investment goals...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell
        title="Investment Portfolio"
        description="Track and achieve your wealth milestones"
      >
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  // Only show empty state when data has been fetched and is actually empty
  if (goals.length === 0) {
    return (
      <PageShell
        title="Investment Portfolio"
        description="Track and achieve your wealth milestones"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Goal
          </Button>
        }
      >
        <EmptyState
          icon={Target}
          title="No investment goals found"
          description="Get started by creating your first investment goal to track your progress."
          action={{
            label: 'Create Goal',
            onClick: () => {
              setIsCreateDialogOpen(true);
            },
          }}
        />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Investment Goal</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new investment goal.
              </DialogDescription>
            </DialogHeader>
            <InvestmentGoalForm
              onSuccess={() => {
                setIsCreateDialogOpen(false);
              }}
              onCancel={() => {
                setIsCreateDialogOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Investment Portfolio"
      description="Track and achieve your wealth milestones"
      actions={
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Goal
        </Button>
      }
    >
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Add New Goal Card */}
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="group flex min-h-[240px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-amber-300 bg-white p-6 transition-all duration-300 hover:border-amber-600 hover:bg-amber-50/50 hover:shadow-lg hover:shadow-amber-500/10 elegant-fade"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/40 group-hover:scale-110">
            <Plus className="h-7 w-7 text-white" />
          </div>
          <h3 className="mt-4 font-semibold text-stone-800">Add New Goal</h3>
          <p className="mt-1 text-sm text-stone-600">Create a new investment goal</p>
        </button>

        {goals.map((goal, index) => {
          const progressPercentage =
            goal.target_amount && goal.current_amount !== undefined
              ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
              : 0;

          return (
            <Link key={goal.id} href={`/dashboard/investments/${goal.id}`}>
              <div
                className="luxury-card group relative overflow-hidden rounded-xl border border-stone-200 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1 elegant-fade"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 shadow-md transition-all duration-300 group-hover:shadow-lg group-hover:shadow-amber-500/40">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-stone-800 truncate">
                          {goal.name || 'Untitled Goal'}
                        </h3>
                        {goal.status && (
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${getStatusBadgeColor(goal.status)}`}
                          >
                            {getStatusLabel(goal.status)}
                          </span>
                        )}
                      </div>
                      {goal.priority && (
                        <p className="text-sm text-stone-600 mt-0.5">Priority: {goal.priority}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-stone-600">Target</span>
                      <span className="font-semibold text-stone-800 font-mono">
                        {goal.target_amount ? formatRupees(goal.target_amount) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-3">
                      <span className="text-stone-600">Current</span>
                      <span className="font-semibold text-emerald-700 font-mono">
                        {goal.current_amount !== undefined
                          ? formatRupees(goal.current_amount)
                          : formatRupees(0)}
                      </span>
                    </div>
                    {goal.target_amount && (
                      <div className="mt-3 p-3 bg-amber-50/50 rounded-lg border border-amber-100">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <span className="text-stone-600 font-medium">Progress</span>
                          <span className="font-bold text-amber-700">
                            {progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2.5 w-full overflow-hidden rounded-full bg-stone-200">
                          <div
                            className="h-full bg-gradient-to-r from-amber-600 to-yellow-600 transition-all duration-500 ease-out shadow-sm"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {goal.target_date && (
                    <div className="flex items-center justify-between border-t border-stone-200 pt-3 text-sm">
                      <span className="text-stone-600">Target Date</span>
                      <span className="font-medium text-stone-800 font-mono">
                        {formatDate(goal.target_date)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Investment Goal</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new investment goal.
            </DialogDescription>
          </DialogHeader>
          <InvestmentGoalForm
            onSuccess={() => {
              setIsCreateDialogOpen(false);
            }}
            onCancel={() => {
              setIsCreateDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
