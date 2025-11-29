/**
 * Dropdown option structure
 */
export interface DropdownOption<TValue = string> {
  label: string;
  value: TValue;
  disabled?: boolean;
  icon?: React.ReactNode;
}

/**
 * Base dropdown props
 */
export interface BaseDropdownProps<TValue = string> {
  options: DropdownOption<TValue>[];
  value?: TValue;
  onChange: (value: TValue) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  className?: string;
}

/**
 * Async dropdown fetch function
 */
export type AsyncDropdownFetchFn<TValue = string> = (
  search: string
) => Promise<DropdownOption<TValue>[]>;

/**
 * Async dropdown props
 */
export interface AsyncDropdownProps<TValue = string> extends Omit<
  BaseDropdownProps<TValue>,
  'options'
> {
  fetchOptions: AsyncDropdownFetchFn<TValue>;
  debounceMs?: number;
  minSearchLength?: number;
}
