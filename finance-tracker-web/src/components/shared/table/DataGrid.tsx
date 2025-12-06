'use client';

import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';
import { EmptyState } from '../layout/EmptyState';
import { LoadingState } from '../layout/LoadingState';
import type { DataGridProps } from '../types/table';

/**
 * Reusable DataGrid component wrapping AG Grid
 *
 * Features:
 * - Native pagination with configurable page sizes
 * - Loading and empty states
 * - Flexible height (100% by default)
 * - Type-safe with generics
 * - Extensible via AG Grid props
 */
export function DataGrid<TData = any>({
  columns,
  data,
  loading = false,
  height = '100%',
  className = '',
  defaultColDef,
  rowHeight = 50,
  pageSizeOptions = [50, 100, 500, 1000],
  defaultPageSize = 100,
  theme = 'ag-theme-quartz',
  emptyState,
  ...agGridProps
}: DataGridProps<TData>) {
  // Show loading state
  if (loading) {
    return <LoadingState variant="spinner" className={className} />;
  }

  // Show empty state
  if (!data || data.length === 0) {
    const defaultEmptyState = {
      title: 'No data available',
      description: 'There is no data to display.',
    };

    const emptyStateConfig = emptyState || defaultEmptyState;

    return (
      <div className={className} style={{ height }}>
        <EmptyState
          title={emptyStateConfig.title}
          description={emptyStateConfig.description}
          icon={emptyStateConfig.icon}
          action={emptyStateConfig.action}
        />
      </div>
    );
  }

  // Merge default column definition with provided one
  const mergedDefaultColDef: ColDef<TData> = {
    flex: 1,
    minWidth: 100,
    ...defaultColDef,
  };

  return (
    <div className={`${theme} ${className}`} style={{ height, width: '100%' }}>
      <AgGridReact<TData>
        theme="legacy"
        rowData={data}
        columnDefs={columns}
        defaultColDef={mergedDefaultColDef}
        rowHeight={rowHeight}
        pagination={true}
        paginationPageSize={defaultPageSize}
        paginationPageSizeSelector={pageSizeOptions}
        {...agGridProps}
      />
    </div>
  );
}
