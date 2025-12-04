'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { useSmses } from '@/components/shared/hooks/useSms';
import { EmptyState, ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatDate } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { SmsCreateForm } from '../../../../components/smsComponents/SmsCreateForm/SmsCreateForm';

export default function SmsPage() {
  const { data: smses, isLoading, error, refetch, isFetching } = useSmses();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Show loading state while fetching or when data hasn't been loaded yet
  // Only show error if we've attempted to fetch and it failed (not just when query is disabled)
  if (isLoading || isFetching || (smses === undefined && !error)) {
    return (
      <PageShell title="SMS Logs">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  // Only show error state if we have an actual error and data is undefined
  // This prevents showing error when query is just disabled (Clerk not loaded)
  if (error && smses === undefined) {
    return (
      <PageShell title="SMS Logs">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  // Only show empty state when data has been fetched and is actually empty
  if (smses?.length === 0) {
    return (
      <PageShell title="SMS Logs">
        <EmptyState
          icon={MessageSquare}
          title="No SMS logs found"
          description="Get started by creating your first SMS log to track your SMS transactions."
          action={{
            label: 'Create SMS Log',
            onClick: () => {
              setIsCreateDialogOpen(true);
            },
          }}
        />
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New SMS Log</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new SMS log entry.
              </DialogDescription>
            </DialogHeader>
            <SmsCreateForm
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
      title="SMS Logs"
      description="View and manage your SMS transaction logs"
      actions={
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Create SMS Log
        </Button>
      }
    >
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New SMS Log</DialogTitle>
            <DialogDescription>
              Fill in the details to create a new SMS log entry.
            </DialogDescription>
          </DialogHeader>
          <SmsCreateForm
            onSuccess={() => {
              setIsCreateDialogOpen(false);
            }}
            onCancel={() => {
              setIsCreateDialogOpen(false);
            }}
          />
        </DialogContent>
      </Dialog>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {smses?.map((sms) => (
          <Link key={sms.id} href={`/dashboard/sms/${sms.id}`}>
            <div className="group rounded-lg border border-border bg-card p-6 transition-colors hover:bg-accent">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <MessageSquare className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-card-foreground">
                        {sms.sender || 'Unknown Sender'}
                      </h3>
                      {sms.parsing_status && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                            sms.parsing_status === 'success'
                              ? 'bg-green-500/10 text-green-500'
                              : sms.parsing_status === 'failed'
                                ? 'bg-red-500/10 text-red-500'
                                : 'bg-yellow-500/10 text-yellow-500'
                          }`}
                        >
                          {sms.parsing_status}
                        </span>
                      )}
                    </div>
                    {sms.received_at && (
                      <p className="text-sm text-muted-foreground">{formatDate(sms.received_at)}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                {sms.raw_message && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Message: </span>
                    <span className="font-medium text-card-foreground line-clamp-2">
                      {sms.raw_message}
                    </span>
                  </div>
                )}
                {sms.error_message && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Error: </span>
                    <span className="font-medium text-destructive line-clamp-1">
                      {sms.error_message}
                    </span>
                  </div>
                )}
                {sms.llm_parsed !== undefined && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">LLM Parsed</span>
                    <span
                      className={`font-medium ${
                        sms.llm_parsed ? 'text-green-500' : 'text-muted-foreground'
                      }`}
                    >
                      {sms.llm_parsed ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
                {sms.retry_count !== undefined && sms.retry_count > 0 && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Retry Count</span>
                    <span className="font-medium text-card-foreground">{sms.retry_count}</span>
                  </div>
                )}
                {sms.created_at && (
                  <div className="flex items-center justify-between border-t border-border pt-2">
                    <span className="text-sm font-medium text-muted-foreground">Created</span>
                    <span className="text-sm text-card-foreground">
                      {formatDate(sms.created_at)}
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
