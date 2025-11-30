'use client';

import { useAccount, useDeleteAccount } from '@/components/shared/hooks/useAccount';
import { ConfirmDialog } from '@/components/shared/dialog';
import { ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatRupees } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Edit2, Trash2 } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { AccountUpdateForm } from '../../../../../components/accountComponents/AccountUpdateForm/AccountUpdateForm';

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.accountId as string;
  const { data: account, isLoading, error, refetch } = useAccount(accountId);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const deleteAccount = useDeleteAccount();

  if (isLoading) {
    return (
      <PageShell title="Account Details">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Account Details">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  if (!account) {
    return (
      <PageShell title="Account Details">
        <ErrorState error={new Error('Account not found')} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={
        <div className="flex items-center gap-2">
          <span>{account.account_name || 'Account Details'}</span>
          {account.is_primary && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Primary
            </span>
          )}
        </div>
      }
      description="View and update account information"
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-card-foreground">Account Information</h2>
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
                  disabled={deleteAccount.isPending}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </div>
            )}
          </div>
          {!isEditing ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <span className="text-sm font-medium text-muted-foreground">Account Name</span>
                <p className="mt-1 text-card-foreground">{account.account_name || 'N/A'}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-muted-foreground">Account Type</span>
                <p className="mt-1 text-card-foreground">{account.account_type || 'N/A'}</p>
              </div>
              {account.account_number && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Account Number</span>
                  <p className="mt-1 font-mono text-card-foreground">{account.account_number}</p>
                </div>
              )}
              {account.bank && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Bank</span>
                  <p className="mt-1 text-card-foreground">{account.bank.name}</p>
                  {account.bank.code && (
                    <p className="mt-1 text-sm text-muted-foreground">Code: {account.bank.code}</p>
                  )}
                </div>
              )}
              {account.current_balence !== undefined && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Current Balance</span>
                  <p className="mt-1 text-xl font-bold text-card-foreground">
                    {formatRupees(account.current_balence)}
                  </p>
                </div>
              )}
              {account.is_primary && (
                <div>
                  <span className="text-sm font-medium text-muted-foreground">Primary Account</span>
                  <p className="mt-1 text-card-foreground">
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-sm font-medium text-primary">
                      This is your primary account
                    </span>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <AccountUpdateForm
              account={account}
              onSuccess={() => {
                setIsEditing(false);
                refetch();
              }}
              onCancel={() => {
                setIsEditing(false);
              }}
            />
          )}
        </div>
      </div>
      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete Account"
        description={`Are you sure you want to delete "${account.account_name}"? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={async () => {
          if (accountId) {
            await deleteAccount.mutateAsync(accountId);
            router.push('/dashboard/accounts');
          }
        }}
      />
    </PageShell>
  );
}
