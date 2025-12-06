'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { useSmses } from '@/components/shared/hooks/useSms';
import { ErrorState, PageShell } from '@/components/shared/layout';
import { DataGrid } from '@/components/shared/table';
import type { internal_domain_sms_SmsLogs } from '@/generated/api';
import { formatDate } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import type { ColDef } from 'ag-grid-community';
import { MessageSquare, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SmsCreateForm } from '../../../../components/smsComponents/SmsCreateForm/SmsCreateForm';

export default function SmsPage() {
  const { data: smses, isLoading, error, refetch, isFetching } = useSmses();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  const getParsingStatusColor = (status?: string) => {
    if (!status) {
      return 'bg-gray-500/10 text-gray-500';
    }
    if (status === 'success') {
      return 'bg-green-500/10 text-green-500';
    }
    if (status === 'failed') {
      return 'bg-red-500/10 text-red-500';
    }
    return 'bg-yellow-500/10 text-yellow-500';
  };

  const columnDefs = useMemo<ColDef<internal_domain_sms_SmsLogs>[]>(
    () => [
      {
        field: 'id',
        headerName: 'ID',
        width: 100,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return <span className="font-mono text-xs">{params.value.substring(0, 8)}...</span>;
        },
      },
      {
        field: 'sender',
        headerName: 'Sender',
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          return params.value || 'Unknown';
        },
      },
      {
        field: 'raw_message',
        headerName: 'Message',
        width: 300,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return (
            <span className="line-clamp-2" title={params.value}>
              {params.value}
            </span>
          );
        },
      },
      {
        field: 'parsing_status',
        headerName: 'Status',
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return (
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${getParsingStatusColor(params.value)}`}
            >
              {params.value}
            </span>
          );
        },
      },
      {
        field: 'llm_parsed',
        headerName: 'LLM Parsed',
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: boolean }) => {
          if (params.value === undefined || params.value === null) {
            return 'N/A';
          }
          return (
            <span className={params.value ? 'text-green-500' : 'text-muted-foreground'}>
              {params.value ? 'Yes' : 'No'}
            </span>
          );
        },
      },
      {
        field: 'llm_parsed_attempted',
        headerName: 'LLM Attempted',
        width: 130,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: boolean }) => {
          if (params.value === undefined || params.value === null) {
            return 'N/A';
          }
          return params.value ? 'Yes' : 'No';
        },
      },
      {
        field: 'retry_count',
        headerName: 'Retry Count',
        width: 120,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: number }) => {
          if (params.value === undefined || params.value === null) {
            return '0';
          }
          return params.value.toString();
        },
        comparator: (valueA, valueB) => {
          const a = valueA ?? 0;
          const b = valueB ?? 0;
          return a - b;
        },
      },
      {
        field: 'error_message',
        headerName: 'Error',
        width: 250,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return (
            <span className="line-clamp-1 text-destructive" title={params.value}>
              {params.value}
            </span>
          );
        },
      },
      {
        field: 'received_at',
        headerName: 'Received At',
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return formatDate(params.value);
        },
        comparator: (valueA, valueB) => {
          const a = valueA ? new Date(valueA).getTime() : 0;
          const b = valueB ? new Date(valueB).getTime() : 0;
          return a - b;
        },
      },
      {
        field: 'created_at',
        headerName: 'Created At',
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return formatDate(params.value);
        },
        comparator: (valueA, valueB) => {
          const a = valueA ? new Date(valueA).getTime() : 0;
          const b = valueB ? new Date(valueB).getTime() : 0;
          return a - b;
        },
      },
      {
        field: 'last_retry_at',
        headerName: 'Last Retry',
        width: 150,
        sortable: true,
        filter: true,
        cellRenderer: (params: { value?: string }) => {
          if (!params.value) {
            return 'N/A';
          }
          return formatDate(params.value);
        },
        comparator: (valueA, valueB) => {
          const a = valueA ? new Date(valueA).getTime() : 0;
          const b = valueB ? new Date(valueB).getTime() : 0;
          return a - b;
        },
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef<internal_domain_sms_SmsLogs>>(
    () => ({
      flex: 1,
      minWidth: 100,
    }),
    []
  );

  if (error) {
    return (
      <PageShell title="SMS Logs">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  return (
    <div className="flex flex-1 flex-col min-h-0">
      <PageShell
        title="SMS Logs"
        description="View and manage your SMS transaction logs"
        actions={
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create SMS Log
          </Button>
        }
        className="flex flex-col flex-1 min-h-0"
      >
        <div className="flex-1 min-h-0">
          <DataGrid<internal_domain_sms_SmsLogs>
            columns={columnDefs}
            data={smses || []}
            loading={isLoading || isFetching || smses === undefined}
            defaultColDef={defaultColDef}
            height="100%"
            emptyState={{
              title: 'No SMS logs found',
              description:
                'Get started by creating your first SMS log to track your SMS transactions.',
              icon: MessageSquare,
              action: {
                label: 'Create SMS Log',
                onClick: () => {
                  setIsCreateDialogOpen(true);
                },
              },
            }}
          />
        </div>
      </PageShell>
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
    </div>
  );
}
