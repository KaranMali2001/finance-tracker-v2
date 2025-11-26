import { computed, signal, Signal } from '@angular/core';
import { finalize, Observable } from 'rxjs';
import { parseApiError, ParsedApiError } from '../models/api-error.model';

/**
 * Async state interface representing loading, data, and error states
 */
export interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: ParsedApiError | null;
}

/**
 * Options for configuring async state behavior
 */
export interface AsyncStateOptions<T> {
  /**
   * Callback executed when data is successfully loaded
   * @param data - The successfully loaded data
   */
  onSuccess?: (data: T) => void;

  /**
   * Callback executed when an error occurs
   * @param error - The parsed API error
   */
  onError?: (error: ParsedApiError) => void;

  /**
   * Initial data value (useful for cached data)
   */
  initialData?: T | null;
}

/**
 * Return type of useAsyncState - provides reactive state and load function
 */
export interface UseAsyncStateReturn<T> {
  /**
   * Read-only signal containing the full async state
   */
  state: Signal<AsyncState<T>>;

  /**
   * Computed signal for just the data (null when loading/error)
   */
  data: Signal<T | null>;

  /**
   * Computed signal for loading state
   */
  loading: Signal<boolean>;

  /**
   * Computed signal for error state (null when no error)
   */
  error: Signal<ParsedApiError | null>;

  /**
   * Function to load data from an Observable
   * @param source$ - Observable that emits the data
   */
  load: (source$: Observable<T>) => void;

  /**
   * Function to manually reset the state
   */
  reset: () => void;
}

export function useAsyncState<T>(options?: AsyncStateOptions<T>): UseAsyncStateReturn<T> {
  // Create signal with initial state
  const state = signal<AsyncState<T>>({
    data: options?.initialData ?? null,
    loading: false,
    error: null,
  });

  /**
   * Loads data from an Observable
   * Automatically manages loading state and error handling
   */
  const load = (source$: Observable<T>) => {
    // Set loading state
    state.set({ data: null, loading: true, error: null });

    // Subscribe to the observable
    source$
      .pipe(
        // Ensure loading is set to false when complete (success or error)
        finalize(() => {
          state.update((current) => ({ ...current, loading: false }));
        }),
      )
      .subscribe({
        // Success handler
        next: (data) => {
          state.set({ data, loading: false, error: null });
          // Execute success callback if provided
          options?.onSuccess?.(data);
        },
        // Error handler
        error: (err: unknown) => {
          const parsedError = parseApiError(err);
          state.set({
            data: null,
            loading: false,
            error: parsedError,
          });
          // Execute error callback if provided
          options?.onError?.(parsedError);
        },
      });
  };

  /**
   * Resets the state to initial values
   */
  const reset = () => {
    state.set({
      data: options?.initialData ?? null,
      loading: false,
      error: null,
    });
  };

  return {
    // Return read-only signal
    state: state.asReadonly(),
    // Computed signals for easy access
    data: computed(() => state().data),
    loading: computed(() => state().loading),
    error: computed(() => state().error),
    load,
    reset,
  };
}
