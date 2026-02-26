'use client';

import {
  type ColumnDef,
  type SortingState,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import React, { useCallback, useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { RowActions } from './RowActions';

export interface TanStackTableColumn<T> {
  id: string;
  header: string;
  /**
   * Number of grid columns to span (default 1).
   * Accepts either a number or a Tailwind "col-span-N" string – we extract
   * the number from either form. `span` takes precedence over `width`.
   */
  span?: number | string;
  /** @deprecated Use `span` instead. Kept for backwards compatibility. */
  width?: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  cell?: (row: T) => React.ReactNode;
  accessorKey?: keyof T | string;
}

export interface TanStackTableRowActionsProps<T> {
  /** Number of grid columns to span (default 1). Also accepts "col-span-N". */
  span?: number | string;
  /** @deprecated Use `span` instead. Kept for backwards compatibility. */
  width?: string;
  /** Called when the delete button is clicked */
  onDelete: (row: T) => void;
  /**
   * Custom renderer for full edit+delete support.
   * When provided, the default RowActions delete button is not rendered.
   */
  render?: (row: T) => React.ReactNode;
  /** Row ID currently being deleted – shows a loading spinner on its delete button */
  deletingRowId?: string;
}

export interface TanStackTableProps<T> {
  data: T[];
  columns: TanStackTableColumn<T>[];
  page?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<{ className?: string }>;
  emptyAction?: { label: string; onClick: () => void };
  className?: string;
  getRowId?: (row: T) => string;
  pageSizeOptions?: number[];
  /** Min width for horizontal scroll on small screens (e.g. "700px") */
  minTableWidth?: string;
  /** When true, removes outer border/shadow (for embedding in cards) */
  bare?: boolean;
  /** Optional actions column rendered via RowActions */
  rowActions?: TanStackTableRowActionsProps<T>;
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

/** Extract a numeric span from either a number or a "col-span-N" string */
function resolveSpan(value: number | string | undefined, fallback = 1): number {
  if (value == null) return fallback;
  if (typeof value === 'number') return value;
  const match = value.match(/col-span-(\d+)/);
  return match ? Number.parseInt(match[1], 10) : fallback;
}

function cellAlignClass(align?: 'left' | 'center' | 'right') {
  if (align === 'right') return 'text-right';
  if (align === 'center') return 'text-center';
  return '';
}

export function TanStackTable<T extends Record<string, unknown>>({
  data,
  columns,
  page = 1,
  pageSize = 25,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  onSort,
  emptyMessage = 'No data found',
  emptyIcon: EmptyIcon,
  emptyAction,
  className = '',
  getRowId,
  pageSizeOptions = PAGE_SIZE_OPTIONS,
  minTableWidth,
  bare = false,
  rowActions,
}: TanStackTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  // ─── Column defs (TanStack Table core) ────────────────────────────────────
  const columnDefs = useMemo<ColumnDef<T, unknown>[]>(
    () =>
      columns.map((col) => ({
        id: col.id,
        accessorKey: (col.accessorKey as string) ?? col.id,
        header: col.header,
        cell: ({ row }) => {
          const value = row.original;
          if (col.cell) return col.cell(value);
          const key = (col.accessorKey as keyof T) ?? col.id;
          const val = value[key as keyof T];
          return val != null ? String(val) : 'N/A';
        },
      })),
    [columns]
  );

  const table = useReactTable({
    data,
    columns: columnDefs,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onSortingChange: setSorting,
    state: { sorting },
    manualSorting: !!onSort,
    manualPagination: true,
    pageCount: totalPages,
    getRowId: getRowId ? (row) => getRowId(row.original as T) : undefined,
  });

  const handleSort = (columnId: string) => {
    const col = columns.find((c) => c.id === columnId);
    if (!col?.sortable) return;
    const currentSort = sorting.find((s) => s.id === columnId);
    const newDir: 'asc' | 'desc' = currentSort?.desc === false ? 'desc' : 'asc';
    setSorting([{ id: columnId, desc: newDir === 'desc' }]);
    onSort?.(columnId, newDir);
  };

  // ─── Grid geometry ─────────────────────────────────────────────────────────
  // Use inline CSS gridTemplateColumns so Tailwind JIT doesn't need to know
  // the total column count at build time.
  const { gridStyle } = useMemo(() => {
    let total = columns.reduce((sum, col) => sum + resolveSpan(col.span ?? col.width), 0);
    if (rowActions) total += resolveSpan(rowActions.span ?? rowActions.width);
    return {
      gridStyle: {
        display: 'grid' as const,
        gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))`,
        gap: '1rem',
      },
    };
  }, [columns, rowActions]);

  // ─── Memoised row ─────────────────────────────────────────────────────────
  const TableRow = useCallback(
    ({ row, index }: { row: T; index: number }) => {
      const rowId = getRowId ? getRowId(row) : index;
      const isDeletingThisRow =
        rowActions?.deletingRowId != null &&
        getRowId != null &&
        getRowId(row) === rowActions.deletingRowId;

      return (
        <div
          key={String(rowId)}
          className="px-6 py-4 hover:bg-amber-50/50 transition-all duration-200 hover:translate-x-1 elegant-fade group border-b border-stone-100 last:border-0"
          style={{
            ...gridStyle,
            animationDelay: `${index * 0.03}s`,
          }}
        >
          {columns.map((col) => (
            <div
              key={col.id}
              className={cn('text-sm text-stone-700 min-w-0', cellAlignClass(col.align))}
              style={{ gridColumn: `span ${resolveSpan(col.span ?? col.width)}` }}
            >
              {col.cell
                ? col.cell(row)
                : row[col.id as keyof T] != null
                  ? String(row[col.id as keyof T])
                  : 'N/A'}
            </div>
          ))}

          {rowActions && (
            <div
              className={cn(
                'flex items-center justify-center transition-opacity',
                !rowActions.render && 'opacity-0 group-hover:opacity-100',
                !rowActions.render && isDeletingThisRow && 'opacity-100'
              )}
              style={{ gridColumn: `span ${resolveSpan(rowActions.span ?? rowActions.width)}` }}
            >
              {rowActions.render ? (
                rowActions.render(row)
              ) : (
                <RowActions
                  isEditMode={false}
                  isModified={false}
                  onSave={() => {}}
                  onCancel={() => {}}
                  onDelete={() => rowActions.onDelete(row)}
                  isDeleting={isDeletingThisRow}
                />
              )}
            </div>
          )}
        </div>
      );
    },
    [columns, gridStyle, rowActions, getRowId]
  );

  const MemoizedTableRow = React.memo(TableRow);

  // ─── Table content ─────────────────────────────────────────────────────────
  const tableContent = (
    <>
      {/* Header */}
      <div
        className="px-6 py-3 text-xs font-semibold border-b bg-stone-50 border-stone-200 text-stone-600"
        style={gridStyle}
      >
        {columns.map((col) => (
          <div
            key={col.id}
            className={cn(
              cellAlignClass(col.align),
              col.sortable && 'cursor-pointer select-none hover:text-amber-700 transition-colors'
            )}
            style={{ gridColumn: `span ${resolveSpan(col.span ?? col.width)}` }}
            onClick={() => col.sortable && handleSort(col.id)}
          >
            <div className="flex items-center gap-1">
              {col.header}
              {col.sortable &&
                sorting.some((s) => s.id === col.id) &&
                (sorting.find((s) => s.id === col.id)?.desc ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronUp className="h-3 w-3" />
                ))}
            </div>
          </div>
        ))}

        {rowActions && (
          <div
            className="text-center"
            style={{ gridColumn: `span ${resolveSpan(rowActions.span ?? rowActions.width)}` }}
          >
            <span className="text-stone-400">Actions</span>
          </div>
        )}
      </div>

      {/* Body */}
      <div>
        {data.length > 0 ? (
          data.map((row, index) => (
            <MemoizedTableRow
              key={String(getRowId ? getRowId(row) : index)}
              row={row}
              index={index}
            />
          ))
        ) : (
          <div className="py-12 text-center">
            {EmptyIcon && <EmptyIcon className="mx-auto mb-4 h-12 w-12 text-stone-300" />}
            <p className="text-sm text-stone-500 mb-4">{emptyMessage}</p>
            {emptyAction && (
              <Button onClick={emptyAction.onClick} variant="outline">
                {emptyAction.label}
              </Button>
            )}
          </div>
        )}
      </div>
    </>
  );

  return (
    <div className={cn(className)}>
      <div
        className={cn(
          'overflow-hidden',
          !bare && 'rounded-xl border border-stone-200 backdrop-blur-sm bg-white shadow-sm'
        )}
      >
        {minTableWidth ? (
          <div className="overflow-x-auto">
            <div style={{ minWidth: minTableWidth }}>{tableContent}</div>
          </div>
        ) : (
          tableContent
        )}
      </div>

      {/* Pagination — always show when pageSizeOptions or multiple pages */}
      {(onPageChange || onPageSizeChange) && (
        <div className="mt-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-sm text-stone-600">Rows per page:</span>
            <Select
              value={String(pageSize)}
              onValueChange={(v) => {
                onPageSizeChange?.(Number(v));
              }}
            >
              <SelectTrigger className="w-[70px] h-8 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-stone-700">
              Page {page} of {totalPages}
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
