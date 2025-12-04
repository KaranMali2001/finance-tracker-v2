'use client';

import { useSms } from '@/components/shared/hooks/useSms';
import { ErrorState, LoadingState, PageShell } from '@/components/shared/layout';
import { formatDate } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';

export default function SmsDetailPage() {
  const params = useParams();
  const router = useRouter();
  const smsId = params.id as string;
  const { data: sms, isLoading, error, refetch } = useSms(smsId);

  if (isLoading) {
    return (
      <PageShell title="SMS Log Details">
        <LoadingState variant="skeleton" count={5} />
      </PageShell>
    );
  }

  if (error || !sms) {
    return (
      <PageShell title="SMS Log Details">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  return (
    <PageShell
      title={
        <div className="flex items-center gap-2">
          <span>SMS Log Details</span>
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
      }
      description="View detailed information about this SMS log"
      actions={
        <Button variant="outline" size="sm" onClick={() => router.push('/dashboard/sms')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to SMS Logs
        </Button>
      }
    >
      <div className="space-y-6">
        <div className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-card-foreground">SMS Information</h2>
              <p className="text-sm text-muted-foreground">Complete details of the SMS log</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {sms.id && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">SMS ID</span>
                <p className="mt-1 font-mono text-sm text-card-foreground">{sms.id}</p>
              </div>
            )}
            {sms.sender && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Sender</span>
                <p className="mt-1 text-card-foreground">{sms.sender}</p>
              </div>
            )}
            {sms.received_at && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Received At</span>
                <p className="mt-1 text-card-foreground">{formatDate(sms.received_at)}</p>
              </div>
            )}
            {sms.parsing_status && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Parsing Status</span>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
                      sms.parsing_status === 'success'
                        ? 'bg-green-500/10 text-green-500'
                        : sms.parsing_status === 'failed'
                          ? 'bg-red-500/10 text-red-500'
                          : 'bg-yellow-500/10 text-yellow-500'
                    }`}
                  >
                    {sms.parsing_status}
                  </span>
                </p>
              </div>
            )}
            {sms.llm_parsed !== undefined && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">LLM Parsed</span>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
                      sms.llm_parsed
                        ? 'bg-green-500/10 text-green-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}
                  >
                    {sms.llm_parsed ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            )}
            {sms.llm_parsed_attempted !== undefined && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">
                  LLM Parsed Attempted
                </span>
                <p className="mt-1">
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
                      sms.llm_parsed_attempted
                        ? 'bg-blue-500/10 text-blue-500'
                        : 'bg-gray-500/10 text-gray-500'
                    }`}
                  >
                    {sms.llm_parsed_attempted ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            )}
            {sms.retry_count !== undefined && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Retry Count</span>
                <p className="mt-1 text-card-foreground">{sms.retry_count}</p>
              </div>
            )}
            {sms.user_id && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">User ID</span>
                <p className="mt-1 font-mono text-sm text-card-foreground">{sms.user_id}</p>
              </div>
            )}
            {sms.created_at && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Created At</span>
                <p className="mt-1 text-card-foreground">{formatDate(sms.created_at)}</p>
              </div>
            )}
            {sms.updated_at && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Updated At</span>
                <p className="mt-1 text-card-foreground">{formatDate(sms.updated_at)}</p>
              </div>
            )}
            {sms.last_retry_at && (
              <div>
                <span className="text-sm font-medium text-muted-foreground">Last Retry At</span>
                <p className="mt-1 text-card-foreground">{formatDate(sms.last_retry_at)}</p>
              </div>
            )}
          </div>
        </div>

        {sms.raw_message && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">Raw Message</h3>
            <div className="rounded-md border border-border bg-muted/50 p-4">
              <p className="whitespace-pre-wrap font-mono text-sm text-card-foreground">
                {sms.raw_message}
              </p>
            </div>
          </div>
        )}

        {sms.error_message && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/5 p-6">
            <h3 className="mb-4 text-lg font-semibold text-destructive">Error Message</h3>
            <div className="rounded-md border border-destructive/50 bg-destructive/10 p-4">
              <p className="whitespace-pre-wrap text-sm text-destructive">{sms.error_message}</p>
            </div>
          </div>
        )}

        {sms.llm_response && (
          <div className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 text-lg font-semibold text-card-foreground">LLM Response</h3>
            <div className="rounded-md border border-border bg-muted/50 p-4">
              <pre className="whitespace-pre-wrap font-mono text-sm text-card-foreground">
                {sms.llm_response}
              </pre>
            </div>
          </div>
        )}
      </div>
    </PageShell>
  );
}
