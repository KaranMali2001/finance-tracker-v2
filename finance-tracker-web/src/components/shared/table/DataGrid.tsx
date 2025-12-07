'use client';

import type { ColDef } from 'ag-grid-community';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-quartz.css';
import { AgGridReact } from 'ag-grid-react';
import { forwardRef } from 'react';
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
export const DataGrid = forwardRef<AgGridReact, DataGridProps<any>>(function DataGrid(
  {
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
    editable = false,
    editType = 'singleCell',
    onCellValueChanged,
    stopEditingWhenCellsLoseFocus = true,
    enterNavigatesVertically = false,
    enterNavigatesVerticallyAfterEdit = true,
    singleClickEdit = false,
    ...agGridProps
  },
  ref
) {
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
    // Apply global editable setting to default column definition
    // Individual columns can override this
    editable: editable,
    ...defaultColDef,
  };

  return (
    <div className={`${theme} ${className}`} style={{ height, width: '100%' }}>
      <AgGridReact<TData>
        ref={ref}
        theme="legacy"
        rowData={data}
        columnDefs={columns}
        defaultColDef={mergedDefaultColDef}
        rowHeight={rowHeight}
        pagination={true}
        paginationPageSize={defaultPageSize}
        paginationPageSizeSelector={pageSizeOptions}
        editType={editType}
        onCellValueChanged={onCellValueChanged}
        stopEditingWhenCellsLoseFocus={stopEditingWhenCellsLoseFocus}
        enterNavigatesVertically={enterNavigatesVertically}
        enterNavigatesVerticallyAfterEdit={enterNavigatesVerticallyAfterEdit}
        singleClickEdit={singleClickEdit}
        {...agGridProps}
      />
    </div>
  );
}) as <TData = any>(
  props: DataGridProps<TData> & { ref?: React.Ref<AgGridReact> }
) => JSX.Element;

DataGrid.displayName = 'DataGrid';
