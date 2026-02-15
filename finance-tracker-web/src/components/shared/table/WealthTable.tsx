'use client';

import { ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react';
import { useState, useMemo } from 'react';

export interface WealthTableColumn<T> {
  key: string;
  header: string;
  width?: string; // e.g., "col-span-2"
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
}

export interface WealthTableProps<T> {
  data: T[];
  columns: WealthTableColumn<T>[];
  page?: number;
  pageSize?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onSort?: (key: string, direction: 'asc' | 'desc') => void;
  emptyMessage?: string;
  className?: string;
}

export function WealthTable<T extends Record<string, any>>({
  data,
  columns,
  page = 1,
  pageSize = 25,
  totalPages = 1,
  onPageChange,
  onPageSizeChange,
  onSort,
  emptyMessage = 'No data found',
  className = '',
}: WealthTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Calculate grid columns based on column widths
  const gridCols = useMemo(() => {
    const totalSpan = columns.reduce((sum, col) => {
      const match = col.width?.match(/col-span-(\d+)/);
      return sum + (match ? parseInt(match[1]) : 1);
    }, 0);
    return `grid-cols-${totalSpan}`;
  }, [columns]);

  const handleSort = (key: string) => {
    const column = columns.find((col) => col.key === key);
    if (!column?.sortable) return;

    const newDirection = sortKey === key && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortKey(key);
    setSortDirection(newDirection);
    onSort?.(key, newDirection);
  };

  return (
    <div className={`wealth-table ${className}`}>
      {/* Table Container */}
      <div className="rounded-xl border border-stone-200 overflow-hidden backdrop-blur-sm bg-white shadow-sm">
        {/* Table Header */}
        <div
          className={`grid ${gridCols} gap-4 px-6 py-3 text-xs font-semibold border-b bg-stone-50 border-stone-200 text-stone-600`}
        >
          {columns.map((column) => (
            <div
              key={column.key}
              className={`${column.width || 'col-span-1'} ${
                column.align === 'right'
                  ? 'text-right'
                  : column.align === 'center'
                    ? 'text-center'
                    : ''
              } ${column.sortable ? 'cursor-pointer hover:text-amber-700 transition-colors' : ''}`}
              onClick={() => column.sortable && handleSort(column.key)}
            >
              <div className="flex items-center gap-1">
                {column.header}
                {column.sortable && sortKey === column.key && (
                  <>
                    {sortDirection === 'asc' ? (
                      <ChevronUp className="h-3 w-3" />
                    ) : (
                      <ChevronDown className="h-3 w-3" />
                    )}
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Table Body */}
        <div className="divide-y divide-stone-100">
          {data.length > 0 ? (
            data.map((row, index) => (
              <div
                key={index}
                className={`grid ${gridCols} gap-4 px-6 py-4 hover:bg-amber-50/50 border-stone-100 transition-all duration-200 hover:translate-x-1 elegant-fade`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    className={`${column.width || 'col-span-1'} text-sm ${
                      column.align === 'right'
                        ? 'text-right'
                        : column.align === 'center'
                          ? 'text-center'
                          : ''
                    } text-stone-700`}
                  >
                    {column.render ? column.render(row) : (row[column.key] ?? 'N/A')}
                  </div>
                ))}
              </div>
            ))
          ) : (
            <div className="py-12 text-center">
              <p className="text-sm text-stone-500">{emptyMessage}</p>
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
              onChange={(e) => onPageSizeChange?.(Number(e.target.value))}
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
              onClick={() => onPageChange?.(page - 1)}
              disabled={page === 1}
              className={`p-2 rounded-lg transition-all duration-300 ${
                page === 1
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-white text-stone-900 hover:bg-amber-600 hover:text-white border border-stone-300'
              }`}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="text-sm text-stone-700">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              onClick={() => onPageChange?.(page + 1)}
              disabled={page === totalPages}
              className={`p-2 rounded-lg transition-all duration-300 ${
                page === totalPages
                  ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                  : 'bg-white text-stone-900 hover:bg-amber-600 hover:text-white border border-stone-300'
              }`}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
