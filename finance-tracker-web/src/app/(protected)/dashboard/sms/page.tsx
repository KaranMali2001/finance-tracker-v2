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
import { formatDate } from '@/components/shared/utils';
import { Button } from '@/components/ui/button';
import { MessageSquare, Plus, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { SmsCreateForm } from '../../../../components/smsComponents/SmsCreateForm/SmsCreateForm';

export default function SmsPage() {
  const { data: smses, isLoading, error, refetch } = useSmses();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  const getParsingStatusColor = (status?: string) => {
    if (!status) return 'bg-stone-100 text-stone-600 border-stone-200';
    if (status === 'success') return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    if (status === 'failed') return 'bg-red-50 text-red-700 border-red-200';
    return 'bg-amber-50 text-amber-700 border-amber-200';
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
          <input
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
      <div className="rounded-xl border border-stone-200 overflow-hidden bg-white shadow-sm">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-4 px-6 py-3 text-xs font-semibold border-b bg-stone-50 border-stone-200 text-stone-600">
          <div className="col-span-2">SENDER</div>
          <div className="col-span-5">MESSAGE</div>
          <div className="col-span-2">STATUS</div>
          <div className="col-span-2">LLM PARSED</div>
          <div className="col-span-1">DATE</div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-stone-100">
          {filteredSmses.length > 0 ? (
            filteredSmses.map((sms, index) => (
              <div
                key={sms.id}
                className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-amber-50/50 border-stone-100 transition-all duration-200 hover:translate-x-1 elegant-fade"
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="col-span-2 text-sm font-medium text-stone-700">
                  {sms.sender || 'Unknown'}
                </div>
                <div
                  className="col-span-5 text-sm text-stone-600 line-clamp-2"
                  title={sms.raw_message}
                >
                  {sms.raw_message || 'No message'}
                </div>
                <div className="col-span-2">
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${getParsingStatusColor(sms.parsing_status)}`}
                  >
                    {sms.parsing_status || 'N/A'}
                  </span>
                </div>
                <div className="col-span-2 text-sm text-stone-600">
                  {sms.llm_parsed ? 'Yes' : 'No'}
                </div>
                <div className="col-span-1 text-xs text-stone-500 font-mono">
                  {formatDate(sms.received_at || sms.created_at || '')}
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <MessageSquare className="h-12 w-12 text-stone-300 mx-auto mb-4" />
              <p className="text-sm text-stone-500 mb-4">
                {searchFilter ? 'No SMS logs match your search' : 'No SMS logs found'}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)} variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add SMS
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-600">Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="px-3 py-1.5 text-sm rounded-lg border border-stone-300 bg-white text-stone-900 focus:border-amber-600 focus:outline-none focus:ring-1 focus:ring-amber-600 transition-colors"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              className={`p-2 rounded-lg transition-all ${
                page === 1
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-white text-stone-900 hover:bg-amber-600 hover:text-white border border-stone-300'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </button>

            <span className="text-sm text-stone-700">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
              className={`p-2 rounded-lg transition-all ${
                page === totalPages
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-white text-stone-900 hover:bg-amber-600 hover:text-white border border-stone-300'
              }`}
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      )}

      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add SMS Log</DialogTitle>
            <DialogDescription>Manually add an SMS transaction log for parsing.</DialogDescription>
          </DialogHeader>
          <SmsCreateForm onSuccess={() => setIsCreateDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </PageShell>
  );
}
