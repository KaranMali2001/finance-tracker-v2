'use client';

import type { ReconciliationResultRow } from '@/components/shared/hooks/useReconciliation';
import { useUpdateReconciliationResultStatus } from '@/components/shared/hooks/useReconciliation';
import { TanStackTable, type TanStackTableColumn } from '@/components/shared/table';
import { Button } from '@/components/ui/button';
import { internal_domain_reconciliation_BulkUpdateResultStatusReq } from '@/generated/api';
import { format } from 'date-fns';
import {
  CheckCircle2,
  ChevronDown,
  CircleDashed,
  SlidersHorizontal,
  X,
  XCircle,
} from 'lucide-react';
import { useMemo, useState } from 'react';

const UA = internal_domain_reconciliation_BulkUpdateResultStatusReq.user_action;
const PAGE_SIZE = 10;

// ─── Types ────────────────────────────────────────────────────────────────────

type StatusFilter = 'all' | 'needs_review' | 'accepted' | 'rejected' | 'auto_accepted';
type TypeFilter = 'all' | 'DEBIT' | 'CREDIT';
type MatchFilter =
  | 'all'
  | 'HIGH_CONFIDENCE_MATCH'
  | 'LOW_CONFIDENCE_MATCH'
  | 'MISSING_IN_APP'
  | 'UNMATCHED';

interface Filters {
  status: StatusFilter;
  txnType: TypeFilter;
  match: MatchFilter;
  confMin: number;
  confMax: number;
}

const DEFAULT_FILTERS: Filters = {
  status: 'all',
  txnType: 'all',
  match: 'all',
  confMin: 0,
  confMax: 100,
};

const RESULT_TYPE_STYLE: Record<string, string> = {
  HIGH_CONFIDENCE_MATCH: 'bg-emerald-100 text-emerald-700',
  LOW_CONFIDENCE_MATCH: 'bg-orange-100 text-orange-700',
  MATCHED: 'bg-emerald-100 text-emerald-700',
  MISSING_IN_APP: 'bg-amber-100 text-amber-700',
  UNMATCHED: 'bg-rose-100 text-rose-700',
};

const RESULT_TYPE_LABEL: Record<string, string> = {
  HIGH_CONFIDENCE_MATCH: 'High conf',
  LOW_CONFIDENCE_MATCH: 'Low conf',
  MISSING_IN_APP: 'Missing',
  MATCHED: 'Matched',
  UNMATCHED: 'Unmatched',
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isSettledRow(row: ReconciliationResultRow) {
  return (
    row.user_action === 'accepted' ||
    row.user_action === 'rejected' ||
    row.match_status === 'auto_accepted'
  );
}

function needsReview(row: ReconciliationResultRow) {
  return (
    row.match_status !== 'auto_accepted' &&
    row.user_action !== 'accepted' &&
    row.user_action !== 'rejected'
  );
}

function applyFilters(rows: ReconciliationResultRow[], f: Filters): ReconciliationResultRow[] {
  return rows.filter((r) => {
    if (f.status === 'needs_review' && !needsReview(r)) return false;
    if (f.status === 'accepted' && r.user_action !== 'accepted') return false;
    if (f.status === 'rejected' && r.user_action !== 'rejected') return false;
    if (f.status === 'auto_accepted' && r.match_status !== 'auto_accepted') return false;
    if (f.txnType !== 'all' && r.stmt_type !== f.txnType) return false;
    if (f.match !== 'all' && r.result_type !== f.match) return false;
    if (r.app_transaction_id) {
      const pct = Math.round(r.confidence_score ?? 0);
      if (pct < f.confMin || pct > f.confMax) return false;
    }
    return true;
  });
}

function hasActiveFilters(f: Filters) {
  return (
    f.status !== 'all' ||
    f.txnType !== 'all' ||
    f.match !== 'all' ||
    f.confMin !== 0 ||
    f.confMax !== 100
  );
}

// ─── Filter panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filters,
  onChange,
  onReset,
  results,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
  onReset: () => void;
  results: ReconciliationResultRow[];
}) {
  const counts = useMemo(
    () =>
      results.reduce(
        (acc, r) => {
          if (needsReview(r)) acc.needs_review++;
          if (r.user_action === 'accepted') acc.accepted++;
          if (r.user_action === 'rejected') acc.rejected++;
          if (r.match_status === 'auto_accepted') acc.auto_accepted++;
          if (r.stmt_type === 'DEBIT') acc.DEBIT++;
          if (r.stmt_type === 'CREDIT') acc.CREDIT++;
          if (r.result_type === 'HIGH_CONFIDENCE_MATCH') acc.HIGH_CONFIDENCE_MATCH++;
          if (r.result_type === 'LOW_CONFIDENCE_MATCH') acc.LOW_CONFIDENCE_MATCH++;
          if (r.result_type === 'MISSING_IN_APP') acc.MISSING_IN_APP++;
          if (r.result_type === 'UNMATCHED') acc.UNMATCHED++;
          return acc;
        },
        {
          needs_review: 0,
          accepted: 0,
          rejected: 0,
          auto_accepted: 0,
          DEBIT: 0,
          CREDIT: 0,
          HIGH_CONFIDENCE_MATCH: 0,
          LOW_CONFIDENCE_MATCH: 0,
          MISSING_IN_APP: 0,
          UNMATCHED: 0,
        }
      ),
    [results]
  );

  function set<K extends keyof Filters>(key: K, val: Filters[K]) {
    onChange({ ...filters, [key]: val });
  }

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-4 space-y-5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
          Filters
        </span>
        {hasActiveFilters(filters) && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-amber-600 hover:text-amber-700 font-medium"
          >
            <X className="h-3 w-3" />
            Reset all
          </button>
        )}
      </div>

      {/* Status */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">Status</p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: 'all', label: 'All', count: results.length },
              { key: 'needs_review', label: 'Needs Review', count: counts.needs_review },
              { key: 'accepted', label: 'Accepted', count: counts.accepted },
              { key: 'rejected', label: 'Rejected', count: counts.rejected },
              { key: 'auto_accepted', label: 'Auto-accepted', count: counts.auto_accepted },
            ] as { key: StatusFilter; label: string; count: number }[]
          ).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => set('status', key)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                filters.status === key
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 text-[10px] font-bold ${
                  filters.status === key
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Type */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
          Transaction Type
        </p>
        <div className="flex gap-1.5">
          {(
            [
              { key: 'all', label: 'All' },
              { key: 'DEBIT', label: `Debit (${counts.DEBIT})` },
              { key: 'CREDIT', label: `Credit (${counts.CREDIT})` },
            ] as { key: TypeFilter; label: string }[]
          ).map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => set('txnType', key)}
              className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                filters.txnType === key
                  ? key === 'DEBIT'
                    ? 'border-rose-400 bg-rose-50 text-rose-700'
                    : key === 'CREDIT'
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                      : 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Match type */}
      <div className="space-y-2">
        <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
          Match Type
        </p>
        <div className="flex flex-wrap gap-1.5">
          {(
            [
              { key: 'all', label: 'All', count: results.length },
              {
                key: 'HIGH_CONFIDENCE_MATCH',
                label: 'High Conf',
                count: counts.HIGH_CONFIDENCE_MATCH,
              },
              {
                key: 'LOW_CONFIDENCE_MATCH',
                label: 'Low Conf',
                count: counts.LOW_CONFIDENCE_MATCH,
              },
              { key: 'MISSING_IN_APP', label: 'Missing', count: counts.MISSING_IN_APP },
              { key: 'UNMATCHED', label: 'Unmatched', count: counts.UNMATCHED },
            ] as { key: MatchFilter; label: string; count: number }[]
          ).map(({ key, label, count }) => (
            <button
              key={key}
              type="button"
              onClick={() => set('match', key)}
              className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium transition-all ${
                filters.match === key
                  ? 'border-amber-500 bg-amber-50 text-amber-800'
                  : 'border-stone-200 bg-white text-stone-500 hover:border-stone-300'
              }`}
            >
              {label}
              <span
                className={`rounded-full px-1.5 text-[10px] font-bold ${
                  filters.match === key
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-stone-100 text-stone-400'
                }`}
              >
                {count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Confidence range */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
            Confidence Range
          </p>
          <span className="text-xs font-mono text-stone-500">
            {filters.confMin}% – {filters.confMax}%
          </span>
        </div>
        <div className="space-y-2 px-1">
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-stone-400 w-6">Min</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={filters.confMin}
              onChange={(e) => set('confMin', Math.min(Number(e.target.value), filters.confMax))}
              className="flex-1 h-1.5 accent-amber-500 cursor-pointer"
            />
          </div>
          <div className="flex items-center gap-3">
            <span className="text-[10px] text-stone-400 w-6">Max</span>
            <input
              type="range"
              min={0}
              max={100}
              step={5}
              value={filters.confMax}
              onChange={(e) => set('confMax', Math.max(Number(e.target.value), filters.confMin))}
              className="flex-1 h-1.5 accent-amber-500 cursor-pointer"
            />
          </div>
        </div>
        <div className="relative h-1.5 rounded-full bg-stone-100 overflow-hidden">
          <div
            className="absolute h-full bg-amber-300 rounded-full"
            style={{
              left: `${filters.confMin}%`,
              width: `${filters.confMax - filters.confMin}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

// ─── Row modal ────────────────────────────────────────────────────────────────

function RowModal({
  row,
  uploadId,
  onClose,
}: {
  row: ReconciliationResultRow;
  uploadId: string;
  onClose: () => void;
}) {
  const { mutate, isPending } = useUpdateReconciliationResultStatus();
  const settled = isSettledRow(row);
  const signals = row.match_signals as Record<string, boolean> | null | undefined;
  const confPct = Math.round(row.confidence_score ?? 0);
  const amountStr = (row.stmt_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 });

  function handleAction(action: typeof UA.ACCEPTED | typeof UA.REJECTED) {
    mutate({ uploadId, body: { upload_id: uploadId, result_ids: [row.id!], user_action: action } });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-[2px]"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                RESULT_TYPE_STYLE[row.result_type ?? ''] ?? 'bg-stone-100 text-stone-600'
              }`}
            >
              {RESULT_TYPE_LABEL[row.result_type ?? ''] ?? row.result_type?.replace(/_/g, ' ')}
            </span>
            <span className="text-xs font-mono text-stone-400">Row {row.stmt_row_number}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5 max-h-[70vh] overflow-y-auto">
          <div className="rounded-xl border border-stone-100 bg-stone-50 p-4">
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest mb-3">
              Bank Statement
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-xs text-stone-400">Date</p>
                <p className="text-sm font-medium text-stone-800">
                  {row.stmt_date ? format(new Date(row.stmt_date), 'dd MMM yyyy') : '—'}
                </p>
              </div>
              <div>
                <p className="text-xs text-stone-400">Amount</p>
                <p
                  className={`text-base font-bold font-mono ${
                    row.stmt_type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'
                  }`}
                >
                  {row.stmt_type === 'DEBIT' ? '−' : '+'}₹{amountStr}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-stone-400">Description</p>
                <p className="text-sm text-stone-700">{row.stmt_description ?? '—'}</p>
              </div>
              {row.stmt_reference_number && (
                <div className="col-span-2">
                  <p className="text-xs text-stone-400">Reference</p>
                  <p className="text-xs font-mono text-stone-500">{row.stmt_reference_number}</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-widest">
                App Match
              </p>
              <span className="text-xs font-mono text-stone-400">{confPct}% confidence</span>
            </div>
            {row.app_transaction_id ? (
              <div className="space-y-3">
                <p className="text-xs font-mono text-stone-500 break-all">
                  {row.app_transaction_id}
                </p>
                <div className="h-1.5 w-full rounded-full bg-stone-100 overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      confPct >= 75
                        ? 'bg-emerald-400'
                        : confPct >= 40
                          ? 'bg-amber-400'
                          : 'bg-rose-400'
                    }`}
                    style={{ width: `${confPct}%` }}
                  />
                </div>
                {signals && Object.keys(signals).length > 0 && (
                  <div className="grid grid-cols-2 gap-1.5 mt-2">
                    {Object.entries(signals).map(([key, hit]) => (
                      <div key={key} className="flex items-center gap-1.5">
                        {hit ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                        ) : (
                          <X className="h-3 w-3 text-stone-300 shrink-0" />
                        )}
                        <span
                          className={`text-xs ${hit ? 'text-stone-700' : 'text-stone-300 line-through'}`}
                        >
                          {key.replace(/_/g, ' ')}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-4 text-center">
                <CircleDashed className="h-5 w-5 text-amber-400 mx-auto mb-1" />
                <p className="text-sm text-amber-700">No app transaction matched</p>
              </div>
            )}
          </div>
        </div>

        <div className="border-t border-stone-100 px-6 py-4 bg-stone-50/60 flex items-center justify-between">
          {settled ? (
            <div className="flex items-center gap-1.5 text-sm">
              {row.match_status === 'auto_accepted' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-stone-500">Auto-accepted</span>
                </>
              ) : row.user_action === 'accepted' ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  <span className="text-stone-500">Accepted</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-rose-400" />
                  <span className="text-stone-500">Rejected</span>
                </>
              )}
            </div>
          ) : (
            <div className="flex gap-3 ml-auto">
              <Button
                variant="outline"
                className="border-rose-300 text-rose-600 hover:bg-rose-50"
                disabled={isPending}
                onClick={() => handleAction(UA.REJECTED)}
              >
                <XCircle className="h-4 w-4 mr-1.5" />
                Reject
              </Button>
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                disabled={isPending}
                onClick={() => handleAction(UA.ACCEPTED)}
              >
                <CheckCircle2 className="h-4 w-4 mr-1.5" />
                Accept
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Bulk action bar ──────────────────────────────────────────────────────────

function BulkBar({
  selectedIds,
  uploadId,
  onClear,
}: {
  selectedIds: string[];
  uploadId: string;
  onClear: () => void;
}) {
  const { mutate, isPending } = useUpdateReconciliationResultStatus();

  function handleBulk(action: typeof UA.ACCEPTED | typeof UA.REJECTED) {
    mutate({
      uploadId,
      body: { upload_id: uploadId, result_ids: selectedIds, user_action: action },
    });
    onClear();
  }

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-3 shadow-xl">
      <span className="text-sm font-medium text-stone-700">{selectedIds.length} selected</span>
      <div className="h-4 w-px bg-stone-200" />
      <Button
        variant="outline"
        size="sm"
        className="border-rose-300 text-rose-600 hover:bg-rose-50 h-8"
        disabled={isPending}
        onClick={() => handleBulk(UA.REJECTED)}
      >
        <XCircle className="h-3.5 w-3.5 mr-1.5" />
        Reject all
      </Button>
      <Button
        size="sm"
        className="bg-emerald-600 hover:bg-emerald-700 text-white h-8"
        disabled={isPending}
        onClick={() => handleBulk(UA.ACCEPTED)}
      >
        <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
        Accept all
      </Button>
      <button
        type="button"
        onClick={onClear}
        className="flex h-7 w-7 items-center justify-center rounded-lg text-stone-400 hover:bg-stone-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

// ─── Column definitions ───────────────────────────────────────────────────────

function buildColumns(
  selected: Set<string>,
  pageRows: ReconciliationResultRow[],
  onToggleRow: (id: string) => void,
  onToggleAll: () => void,
  onOpenModal: (row: ReconciliationResultRow) => void
): TanStackTableColumn<ReconciliationResultRow>[] {
  const pageIds = pageRows.map((r) => r.id!).filter(Boolean);
  const allSelected = pageIds.length > 0 && pageIds.every((id) => selected.has(id));

  return [
    {
      id: 'checkbox',
      header: '',
      span: 1,
      cell: (row) => (
        <div onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={selected.has(row.id!)}
            onChange={() => onToggleRow(row.id!)}
            className="h-3.5 w-3.5 rounded accent-amber-500 cursor-pointer"
          />
        </div>
      ),
    },
    {
      id: 'stmt_row_number',
      header: '#',
      span: 1,
      cell: (row) => (
        <span className="text-xs font-mono text-stone-400">{row.stmt_row_number}</span>
      ),
    },
    {
      id: 'stmt_date',
      header: 'Date',
      span: 2,
      sortable: true,
      cell: (row) => (
        <span className="text-sm text-stone-600 whitespace-nowrap">
          {row.stmt_date ? format(new Date(row.stmt_date), 'dd MMM yy') : '—'}
        </span>
      ),
    },
    {
      id: 'stmt_description',
      header: 'Description',
      span: 5,
      cell: (row) => (
        <button
          type="button"
          className="w-full text-left text-sm text-stone-800 truncate hover:text-amber-700 transition-colors"
          title={row.stmt_description ?? ''}
          onClick={() => onOpenModal(row)}
        >
          {row.stmt_description ?? '—'}
        </button>
      ),
    },
    {
      id: 'stmt_amount',
      header: 'Amount',
      span: 2,
      align: 'right',
      sortable: true,
      cell: (row) => (
        <span
          className={`text-sm font-mono font-semibold ${
            row.stmt_type === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'
          }`}
        >
          {row.stmt_type === 'DEBIT' ? '−' : '+'}₹
          {(row.stmt_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </span>
      ),
    },
    {
      id: 'stmt_type',
      header: 'Type',
      span: 1,
      cell: (row) => (
        <span
          className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            row.stmt_type === 'CREDIT'
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700'
          }`}
        >
          {row.stmt_type}
        </span>
      ),
    },
    {
      id: 'result_type',
      header: 'Match',
      span: 2,
      cell: (row) => (
        <span
          className={`inline-flex rounded-full px-1.5 py-0.5 text-[10px] font-medium ${
            RESULT_TYPE_STYLE[row.result_type ?? ''] ?? 'bg-stone-100 text-stone-500'
          }`}
        >
          {RESULT_TYPE_LABEL[row.result_type ?? ''] ?? row.result_type ?? '—'}
        </span>
      ),
    },
    {
      id: 'confidence_score',
      header: 'Conf.',
      span: 2,
      sortable: true,
      cell: (row) => {
        const pct = Math.round(row.confidence_score ?? 0);
        return (
          <div className="flex items-center gap-1.5">
            <div className="h-1 w-14 rounded-full bg-stone-100 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  pct >= 75 ? 'bg-emerald-400' : pct >= 40 ? 'bg-amber-400' : 'bg-rose-400'
                }`}
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="text-[10px] font-mono text-stone-400">{pct}%</span>
          </div>
        );
      },
    },
    {
      id: 'status',
      header: 'Status',
      span: 1,
      align: 'right',
      cell: (row) => {
        const settled = isSettledRow(row);
        return (
          <button
            type="button"
            onClick={() => onOpenModal(row)}
            className="flex items-center justify-end w-full"
            title="View details"
          >
            {!settled ? (
              <ChevronDown className="h-3.5 w-3.5 text-stone-300" />
            ) : row.match_status === 'auto_accepted' ? (
              <span className="text-[10px] text-emerald-600 font-medium">Auto ✓</span>
            ) : row.user_action === 'accepted' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            ) : (
              <XCircle className="h-4 w-4 text-rose-400" />
            )}
          </button>
        );
      },
    },
  ];
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ReconciliationReviewTable({
  results,
  uploadId,
  page,
  pageSize,
  totalPages,
  total,
  onPageChange,
  onPageSizeChange,
}: {
  results: ReconciliationResultRow[];
  uploadId: string;
  page: number;
  pageSize: number;
  totalPages: number;
  total: number;
  onPageChange: (p: number) => void;
  onPageSizeChange: (s: number) => void;
}) {
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [showFilters, setShowFilters] = useState(false);
  const [modalRow, setModalRow] = useState<ReconciliationResultRow | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  // Client-side filter applied on the current page only
  const pageRows = useMemo(() => applyFilters(results, filters), [results, filters]);

  function toggleRow(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function toggleAll() {
    const pageIds = pageRows.map((r) => r.id!).filter(Boolean);
    const allSelected = pageIds.every((id) => selected.has(id));
    if (allSelected) {
      setSelected((prev) => {
        const next = new Set(prev);
        pageIds.forEach((id) => next.delete(id));
        return next;
      });
    } else {
      setSelected((prev) => new Set([...prev, ...pageIds]));
    }
  }

  function handleFilterChange(f: Filters) {
    setFilters(f);
    setSelected(new Set());
  }

  const columns = useMemo(
    () => buildColumns(selected, pageRows, toggleRow, toggleAll, setModalRow),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selected, pageRows]
  );

  const activeFilterCount = [
    filters.status !== 'all',
    filters.txnType !== 'all',
    filters.match !== 'all',
    filters.confMin !== 0 || filters.confMax !== 100,
  ].filter(Boolean).length;

  const selectedIds = [...selected];

  return (
    <div className="space-y-3 pb-20">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowFilters((v) => !v)}
            className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-medium transition-all ${
              showFilters || activeFilterCount > 0
                ? 'border-amber-500 bg-amber-50 text-amber-700'
                : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300'
            }`}
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
            {activeFilterCount > 0 && (
              <span className="ml-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold px-1.5">
                {activeFilterCount}
              </span>
            )}
          </button>
          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={() => handleFilterChange(DEFAULT_FILTERS)}
              className="flex items-center gap-1 text-xs text-stone-400 hover:text-stone-600"
            >
              <X className="h-3 w-3" />
              Clear
            </button>
          )}
        </div>
        <span className="text-xs text-stone-400">{total} total rows</span>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <FilterPanel
          filters={filters}
          onChange={handleFilterChange}
          onReset={() => handleFilterChange(DEFAULT_FILTERS)}
          results={results}
        />
      )}

      {/* Table */}
      <TanStackTable<ReconciliationResultRow>
        data={pageRows}
        columns={columns}
        page={page}
        pageSize={pageSize}
        totalPages={totalPages}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        getRowId={(row) => row.id ?? ''}
        emptyMessage="No results match the current filters"
        emptyIcon={CircleDashed}
        minTableWidth="700px"
        pageSizeOptions={[10, 25, 50, 100]}
      />

      {/* Row detail modal */}
      {modalRow && (
        <RowModal row={modalRow} uploadId={uploadId} onClose={() => setModalRow(null)} />
      )}

      {/* Bulk action bar */}
      {selectedIds.length > 0 && (
        <BulkBar
          selectedIds={selectedIds}
          uploadId={uploadId}
          onClear={() => setSelected(new Set())}
        />
      )}
    </div>
  );
}
