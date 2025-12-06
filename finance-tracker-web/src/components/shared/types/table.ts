import type { ColDef, AgGridReactProps } from 'ag-grid-react';

/**
 * Empty state configuration for DataGrid
 */
export interface DataGridEmptyState {
  title: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: {
    label: string;
    onClick: () => void;
  };
}

/**
 * Props for the DataGrid component
 */
export interface DataGridProps<TData = any> extends Omit<
  AgGridReactProps<TData>,
  'rowData' | 'columnDefs'
> {
  /**
   * Column definitions for the grid
   * Sorting is controlled by the `sortable` property in each column definition
   */
  columns: ColDef<TData>[];

  /**
   * Row data array
   */
  data: TData[];

  /**
   * Loading state - shows LoadingState component when true
   */
  loading?: boolean;

  /**
   * Table height (default: '100%')
   */
  height?: string;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Default column configuration
   */
  defaultColDef?: ColDef<TData>;

  /**
   * Row height in pixels (default: 50)
   */
  rowHeight?: number;

  /**
   * Pagination page size options (default: [50, 100, 500, 1000])
   */
  pageSizeOptions?: number[];

  /**
   * Default page size (default: 100)
   */
  defaultPageSize?: number;

  /**
   * AG Grid theme (default: 'ag-theme-quartz')
   */
  theme?: string;

  /**
   * Custom empty state configuration
   * If not provided, uses default empty state
   */
  emptyState?: DataGridEmptyState;
}
