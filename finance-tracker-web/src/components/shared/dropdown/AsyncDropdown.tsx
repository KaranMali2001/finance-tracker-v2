'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Dropdown } from './Dropdown';
import { Spinner } from '@/components/ui/spinner';
import { useDebounce } from '../hooks/useDebounce';
import { DEFAULT_DEBOUNCE_MS, DEFAULT_MIN_SEARCH_LENGTH } from '../utils/constants';
import type { AsyncDropdownProps, DropdownOption } from '../types/dropdown';
import { toast } from '../feedback/Toast';

export function AsyncDropdown<TValue = string>({
  fetchOptions,
  debounceMs = DEFAULT_DEBOUNCE_MS,
  minSearchLength = DEFAULT_MIN_SEARCH_LENGTH,
  searchable = true,
  ...dropdownProps
}: AsyncDropdownProps<TValue>) {
  const [search, setSearch] = useState('');
  const [options, setOptions] = useState<DropdownOption<TValue>[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedSearch = useDebounce(search, debounceMs);

  // Fetch options when search changes
  useEffect(() => {
    const fetchData = async () => {
      // Don't fetch if search is too short
      if (
        minSearchLength > 0 &&
        debouncedSearch.length > 0 &&
        debouncedSearch.length < minSearchLength
      ) {
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const fetchedOptions = await fetchOptions(debouncedSearch);
        setOptions(fetchedOptions);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load options';
        setError(errorMessage);
        toast.error(errorMessage);
        setOptions([]);
      } finally {
        setIsLoading(false);
      }
    };

    // Initial load with empty search
    if (debouncedSearch.length === 0 || debouncedSearch.length >= minSearchLength) {
      fetchData();
    }
  }, [debouncedSearch, fetchOptions, minSearchLength]);

  return (
    <div className="relative">
      <Dropdown {...dropdownProps} options={options} searchable={searchable} />
      {isLoading && (
        <div className="absolute right-8 top-2.5">
          <Spinner size="sm" />
        </div>
      )}
    </div>
  );
}
