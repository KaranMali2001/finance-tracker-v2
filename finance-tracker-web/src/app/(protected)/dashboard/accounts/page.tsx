'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { useAccounts } from '@/components/shared/hooks/useAccount';
import { EmptyState, ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatRupees } from '@/components/shared/utils';
import { Wallet } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { AccountCreateForm } from '../../../../components/accountComponents/AccountCreateForm/AccountCreateForm';

export default function AccountsPage() {
  const { data: accounts, isLoading, error, refetch, isFetching } = useAccounts();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Show loading state while fetching or when data hasn't been loaded yet
  if (isLoading || isFetching || accounts === undefined) {
    return (
      <PageShell title="Accounts">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  if (error) {
    return (
      <PageShell title="Accounts">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  // Only show empty state when data has been fetched and is actually empty
  if (accounts.length === 0) {
    return (
      <PageShell title="Accounts">
        <EmptyState
          icon={Wallet}
          title="No accounts found"
          description="Get started by creating your first account to track your finances."
          action={{
            label: 'Create Account',
            onClick: () => {
              setIsCreateDialogOpen(true);
            },
          }}
        />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Account</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new financial account.
              </DialogDescription>
            </DialogHeader>
            <AccountCreateForm
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
    <PageShell title="Accounts" description="View and manage your financial accounts">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Link key={account.id} href={`/dashboard/accounts/${account.id}`}>
            <div className="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <Wallet className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-card-foreground">{account.account_name}</h3>
                      {account.is_primary && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {account.account_type || 'Account'}
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {account.bank && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Bank</span>
                    <span className="font-medium text-card-foreground">{account.bank.name}</span>
                  </div>
                )}
                {account.account_number && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Account Number</span>
                    <span className="font-mono text-card-foreground">{account.account_number}</span>
                  </div>
                )}
                {account.current_balence !== undefined && (
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-sm font-medium text-muted-foreground">Balance</span>
                    <span className="text-lg font-bold text-card-foreground">
                      {formatRupees(account.current_balence)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </PageShell>
  );
}
