'use client';

import { useAccount, useDeleteAccount } from '@/components/shared/hooks/useAccount';
import { ConfirmDialog } from '@/components/shared/dialog';
import { ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatRupees } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Trash2, Landmark } from 'lucide-react';
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
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-600 to-yellow-600 shadow-md shadow-amber-600/20">
            <Landmark className="h-5 w-5 text-white" />
          </div>
          <span className="text-stone-800">{account.account_name || 'Account Details'}</span>
          {account.is_primary && (
            <span className="rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs font-semibold text-amber-700">
              Primary
            </span>
          )}
        </div>
      }
      description="View and update your account information"
    >
      <div className="space-y-6">
        <Card className="luxury-card group relative overflow-hidden bg-white border-stone-200 shadow-sm transition-all duration-300 hover:shadow-lg">
          <CardHeader className="border-b border-stone-100 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-stone-800">
                <span className="h-1 w-1 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600" />
                Account Information
              </CardTitle>
              {!isEditing && (
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => setIsEditing(true)}
                    className="bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-700 hover:to-yellow-700 text-white shadow-md hover:shadow-lg hover:shadow-amber-500/30 transition-all duration-300"
                  >
                    <Edit2 className="mr-2 h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setIsDeleteDialogOpen(true)}
                    disabled={deleteAccount.isPending}
                    className="shadow-md hover:shadow-lg transition-all duration-300"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            {!isEditing ? (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-stone-600">Account Name</span>
                  <p className="text-stone-800 font-medium">{account.account_name || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-sm font-semibold text-stone-600">Account Type</span>
                  <p className="text-stone-800 font-medium">{account.account_type || 'N/A'}</p>
                </div>
                {account.account_number && (
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-stone-600">Account Number</span>
                    <p className="font-mono text-stone-800 font-medium tracking-wide">
                      {account.account_number}
                    </p>
                  </div>
                )}
                {account.bank && (
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-stone-600">Bank</span>
                    <p className="text-stone-800 font-medium">{account.bank.name}</p>
                    {account.bank.code && (
                      <p className="text-sm text-stone-500 font-mono">Code: {account.bank.code}</p>
                    )}
                  </div>
                )}
                {account.current_balence !== undefined && (
                  <div className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-stone-600">Current Balance</span>
                    <div className="p-4 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 shadow-sm">
                      <p className="text-3xl font-bold bg-gradient-to-r from-amber-700 to-yellow-700 bg-clip-text text-transparent font-mono tracking-tight">
                        {formatRupees(account.current_balence)}
                      </p>
                    </div>
                  </div>
                )}
                {account.is_primary && (
                  <div className="space-y-2 md:col-span-2">
                    <span className="text-sm font-semibold text-stone-600">Primary Account</span>
                    <div className="inline-flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 shadow-sm">
                      <div className="h-2 w-2 rounded-full bg-gradient-to-r from-amber-600 to-yellow-600 animate-pulse" />
                      <span className="text-sm font-semibold text-amber-700">
                        This is your primary account
                      </span>
                    </div>
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
          </CardContent>
        </Card>
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
