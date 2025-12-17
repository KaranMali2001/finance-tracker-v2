'use client';

import { InvestmentGoalForm } from '@/components/investmentComponents';
import { ConfirmDialog } from '@/components/shared/dialog';
import {
  useInvestmentGoalById,
  useUpdateInvestmentGoal,
} from '@/components/shared/hooks/useInvestment';
import { ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatDate, formatRupees } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
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

export default function InvestmentGoalDetailPage() {
  const params = useParams();
  const router = useRouter();
  const goalId = params.id as string;
  const { data: goal, isLoading, isFetching, error, refetch } = useInvestmentGoalById(goalId);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const updateGoal = useUpdateInvestmentGoal();

  // Show loading state while initial load or refetching
  if (isLoading || isFetching) {
    return (
      <PageShell title="Investment Goal Details">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  // Only show error if we're not loading and there's an actual error
  if (error && !isLoading && !isFetching) {
    return (
      <PageShell title="Investment Goal Details">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  // Only show "not found" if we're not loading, no error, but no data
  if (!goal && !isLoading && !isFetching && !error) {
    return (
      <PageShell title="Investment Goal Details">
        <ErrorState error={new Error('Investment goal not found')} />
      </PageShell>
    );
  }

  // If we still don't have goal data at this point, show loading (shouldn't happen, but safety check)
  if (!goal) {
    return (
      <PageShell title="Investment Goal Details">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  const progressPercentage =
    goal.target_amount && goal.current_amount !== undefined
      ? Math.min((goal.current_amount / goal.target_amount) * 100, 100)
      : 0;

  return (
    <PageShell
      title={
        <div className="flex items-center gap-2">
          <Link href="/dashboard/investments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <span>{goal.name || 'Investment Goal'}</span>
          {goal.status && (
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${getStatusBadgeColor(goal.status)}`}
            >
              {getStatusLabel(goal.status)}
            </span>
          )}
        </div>
      }
      description="View and update investment goal information"
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Goal Information</CardTitle>
              {!isEditing && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(true);
                    }}
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setIsDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Goal Name</span>
                    <p className="mt-1 text-lg font-semibold text-card-foreground">
                      {goal.name || 'N/A'}
                    </p>
                  </div>
                  {goal.status && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Status</span>
                      <p className="mt-1">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${getStatusBadgeColor(goal.status)}`}
                        >
                          {getStatusLabel(goal.status)}
                        </span>
                      </p>
                    </div>
                  )}
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Target Amount</span>
                    <p className="mt-1 text-xl font-bold text-card-foreground">
                      {goal.target_amount ? formatRupees(goal.target_amount) : 'N/A'}
                    </p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">
                      Current Amount
                    </span>
                    <p className="mt-1 text-xl font-bold text-card-foreground">
                      {goal.current_amount !== undefined
                        ? formatRupees(goal.current_amount)
                        : formatRupees(0)}
                    </p>
                  </div>
                  {goal.target_date && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Target Date</span>
                      <p className="mt-1 text-card-foreground">{formatDate(goal.target_date)}</p>
                    </div>
                  )}
                  {goal.priority && (
                    <div>
                      <span className="text-sm font-medium text-muted-foreground">Priority</span>
                      <p className="mt-1 text-card-foreground">
                        {goal.priority}{' '}
                        {goal.priority === 1 ? '(Highest)' : goal.priority === 5 ? '(Lowest)' : ''}
                      </p>
                    </div>
                  )}
                </div>
                {goal.target_amount && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-muted-foreground">Progress</span>
                      <span className="font-bold text-card-foreground">
                        {progressPercentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="h-4 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {goal.current_amount !== undefined
                        ? formatRupees(goal.current_amount)
                        : formatRupees(0)}{' '}
                      of {formatRupees(goal.target_amount)}
                    </p>
                  </div>
                )}
                {(goal.created_at || goal.updated_at) && (
                  <div className="border-t border-border pt-4">
                    <div className="grid gap-2 text-sm">
                      {goal.created_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Created At</span>
                          <span className="text-card-foreground">
                            {formatDate(goal.created_at)}
                          </span>
                        </div>
                      )}
                      {goal.updated_at && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Updated At</span>
                          <span className="text-card-foreground">
                            {formatDate(goal.updated_at)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <InvestmentGoalForm
                initialValues={goal}
                isEdit={true}
                goalId={goalId}
                onSuccess={() => {
                  setIsEditing(false);
                  refetch();
                }}
                onCancel={() => {
                  setIsEditing(false);
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Investment Goal"
        description={`Are you sure you want to delete "${goal.name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={async () => {
          // TODO: Implement delete functionality when backend supports it
          // For now, just close the dialog
          setIsDeleteDialogOpen(false);
          // await deleteGoal.mutateAsync(goalId);
          // router.push('/dashboard/investments');
        }}
      />
    </PageShell>
  );
}
