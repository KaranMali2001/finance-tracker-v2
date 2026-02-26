'use client';

import {
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/shared/dialog';
import { useDeleteSms, useSmses } from '@/components/shared/hooks/useSms';
import { ErrorState, PageShell } from '@/components/shared/layout';
import { TanStackTable, type TanStackTableColumn } from '@/components/shared/table';
import { formatDate } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { internal_domain_sms_SmsLogs } from '@/generated/api';
import { MessageSquare, Plus, Search } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { SmsCreateForm } from '../../../../components/smsComponents/SmsCreateForm/SmsCreateForm';

export default function SmsPage() {
  const { data: smses, isLoading, error, refetch } = useSmses();
  const { mutate: deleteSms, isPending: isDeleting } = useDeleteSms();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [smsToDelete, setSmsToDelete] = useState<internal_domain_sms_SmsLogs | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const getParsingStatusColor = (status?: string) => {
    if (!status) return 'bg-stone-100 text-stone-600 border-stone-200';
    if (status === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'failed') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
  };

  const handleDeleteClick = useCallback((sms: internal_domain_sms_SmsLogs) => {
    setSmsToDelete(sms);
    setIsDeleteDialogOpen(true);
  }, []);

  const handleDeleteConfirm = () => {
    if (smsToDelete?.id) {
      deleteSms(
        { id: smsToDelete.id },
        {
          onSuccess: () => {
            setIsDeleteDialogOpen(false);
            setSmsToDelete(null);
          },
        }
      );
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteDialogOpen(false);
    setSmsToDelete(null);
  };

  const { filteredSmses, totalPages } = useMemo(() => {
    if (!smses) return { filteredSmses: [], totalPages: 0 };

    let filtered = [...smses];
    if (searchFilter) {
      const search = searchFilter.toLowerCase();
      filtered = filtered.filter(
        (sms) =>
          sms.sender?.toLowerCase().includes(search) ||
          sms.raw_message?.toLowerCase().includes(search) ||
          sms.parsing_status?.toLowerCase().includes(search)
      );
    }

    filtered.sort((a, b) => {
      const dateA = a.received_at || a.created_at || '';
      const dateB = b.received_at || b.created_at || '';
      return dateB.localeCompare(dateA);
    });

    const total = Math.ceil(filtered.length / pageSize);
    const start = (page - 1) * pageSize;
    const paginated = filtered.slice(start, start + pageSize);

    return { filteredSmses: paginated, totalPages: total || 1 };
  }, [smses, searchFilter, page, pageSize]);

  const smsColumns: TanStackTableColumn<internal_domain_sms_SmsLogs>[] = useMemo(
    () => [
      {
        id: 'sender',
        header: 'SENDER',
        width: 'col-span-2',
        cell: (sms) => (
          <span className="text-sm font-medium text-stone-700">{sms.sender || 'Unknown'}</span>
        ),
      },
      {
        id: 'message',
        header: 'MESSAGE',
        width: 'col-span-5',
        cell: (sms) => (
          <div className="col-span-5 text-sm text-stone-600 line-clamp-2" title={sms.raw_message}>
            {sms.raw_message || 'No message'}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'STATUS',
        width: 'col-span-2',
        cell: (sms) => (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getParsingStatusColor(sms.parsing_status)}`}
          >
            {sms.parsing_status || 'N/A'}
          </span>
        ),
      },
      {
        id: 'llm_parsed',
        header: 'LLM PARSED',
        width: 'col-span-2',
        cell: (sms) => (
          <span className="text-sm text-stone-600">{sms.llm_parsed ? 'Yes' : 'No'}</span>
        ),
      },
      {
        id: 'date',
        header: 'DATE',
        width: 'col-span-1',
        cell: (sms) => (
          <span className="text-xs text-stone-500 font-mono">
            {formatDate(sms.received_at || sms.created_at || '')}
          </span>
        ),
      },
    ],
    []
  );

  if (error) {
    return (
      <PageShell title="SMS Logs">
        <ErrorState error={error} onRetry={() => refetch()} />
      </PageShell>
    );
  }

  if (isLoading) {
    return (
      <PageShell title="SMS Logs" description="View and manage SMS transaction logs">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-amber-600 border-t-transparent mx-auto mb-4" />
            <p className="text-sm font-medium text-stone-600">Loading SMS logs...</p>
          </div>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="SMS Transaction Logs"
      description="Track and analyze SMS-based financial transactions"
      actions={
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add SMS
        </Button>
      }
    >
      {/* Search Filter */}
      <div className="mb-6 p-4 rounded-xl border border-stone-200 bg-white shadow-sm">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-500" />
          <Input
            type="text"
            placeholder="Search sender, message, or status..."
            value={searchFilter}
            onChange={(e) => {
              setSearchFilter(e.target.value);
              setPage(1);
            }}
            className="w-full pl-10 pr-3 py-2 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 placeholder:text-stone-400 focus:border-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-600/20 transition-all"
          />
        </div>
      </div>

      {/* SMS Table */}
      <TanStackTable<internal_domain_sms_SmsLogs>
        data={filteredSmses}
        columns={smsColumns}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={setPage}
        onPageSizeChange={(size) => {
          setPageSize(size);
          setPage(1);
        }}
        getRowId={(row) => row.id ?? ''}
        minTableWidth="600px"
        rowActions={{
          width: 'col-span-1',
          onDelete: handleDeleteClick,
          deletingRowId: isDeleting && smsToDelete ? smsToDelete.id : undefined,
        }}
        emptyMessage={searchFilter ? 'No SMS logs match your search' : 'No SMS logs found'}
        emptyIcon={MessageSquare}
        emptyAction={{
          label: 'Add SMS',
          onClick: () => setIsCreateDialogOpen(true),
        }}
      />

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add SMS Log</DialogTitle>
            <DialogDescription>Manually add an SMS transaction log for parsing.</DialogDescription>
          </DialogHeader>
          <SmsCreateForm onSuccess={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title="Delete SMS Log"
        description={
          smsToDelete
            ? `Are you sure you want to delete the SMS from "${smsToDelete.sender || 'Unknown'}"? This action cannot be undone.`
            : 'Are you sure you want to delete this SMS log? This action cannot be undone.'
        }
        confirmText="Delete"
        cancelText="Cancel"
        destructive
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </PageShell>
  );
}
