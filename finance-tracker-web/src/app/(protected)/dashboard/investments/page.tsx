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
import { EmptyState, ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatDate, formatRupees } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Plus, Target } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

function getStatusBadgeColor(status?: string) {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'completed':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'on_hold':
      return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
    case 'cancelled':
      return 'bg-red-500/10 text-red-700 dark:text-red-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
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
      <PageShell title="Investment Goals">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Investment Goals">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  // Only show empty state when data has been fetched and is actually empty
  if (goals.length === 0) {
    return (
      <PageShell
        title="Investment Goals"
        description="Track and manage your investment goals"
        actionBar={
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
      title="Investment Goals"
      description="Track and manage your investment goals"
      actionBar={
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Goal
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Add New Goal Card */}
        <button
          onClick={() => setIsCreateDialogOpen(true)}
          className="group flex min-h-[200px] flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card p-6 transition-colors hover:border-primary hover:bg-accent"
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 transition-colors group-hover:bg-primary/20">
            <Plus className="h-6 w-6 text-primary" />
          </div>
          <h3 className="mt-4 font-semibold text-card-foreground">Add New Goal</h3>
          <p className="mt-1 text-sm text-muted-foreground">Create a new investment goal</p>
        </button>

        {goals.map((goal) => {
          const progressPercentage =
            goal.target_amount && goal.current_amount !== undefined
              ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
              : 0;

          return (
            <Link key={goal.id} href={`/dashboard/investments/${goal.id}`}>
              <div className="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Target className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-card-foreground">
                          {goal.name || 'Untitled Goal'}
                        </h3>
                        {goal.status && (
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeColor(goal.status)}`}
                          >
                            {getStatusLabel(goal.status)}
                          </span>
                        )}
                      </div>
                      {goal.priority && (
                        <p className="text-sm text-muted-foreground">Priority: {goal.priority}</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Target</span>
                      <span className="font-medium text-card-foreground">
                        {goal.target_amount ? formatRupees(goal.target_amount) : 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-muted-foreground">Current</span>
                      <span className="font-medium text-card-foreground">
                        {goal.current_amount !== undefined
                          ? formatRupees(goal.current_amount)
                          : formatRupees(0)}
                      </span>
                    </div>
                    {goal.target_amount && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium text-card-foreground">
                            {progressPercentage.toFixed(1)}%
                          </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                          <div
                            className="h-full bg-primary transition-all"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                  {goal.target_date && (
                    <div className="flex items-center justify-between border-t border-border pt-2 text-sm">
                      <span className="text-muted-foreground">Target Date</span>
                      <span className="font-medium text-card-foreground">
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
