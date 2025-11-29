'use client';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo, useState } from 'react';
import { DEFAULT_PAGE, DEFAULT_PAGE_SIZE } from '../utils/constants';

interface UsePaginationOptions {
  pageSize?: number;
  syncWithUrl?: boolean;
}

interface UsePaginationReturn {
  page: number;
  setPage: (page: number) => void;
  limit: number;
  setLimit: (limit: number) => void;
  offset: number;
}

/**
 * Pagination hook with optional URL sync
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const { pageSize = DEFAULT_PAGE_SIZE, syncWithUrl = false } = options;

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get initial values from URL or defaults
  const initialPage = syncWithUrl
    ? parseInt(searchParams.get('page') || String(DEFAULT_PAGE), 10)
    : DEFAULT_PAGE;
  const initialLimit = syncWithUrl
    ? parseInt(searchParams.get('limit') || String(pageSize), 10)
    : pageSize;

  const [page, setPageState] = useState(initialPage);
  const [limit, setLimitState] = useState(initialLimit);

  const setPage = useCallback(
    (newPage: number) => {
      setPageState(newPage);
      if (syncWithUrl) {
        const params = new URLSearchParams(searchParams.toString());
        if (newPage === DEFAULT_PAGE) {
          params.delete('page');
        } else {
          params.set('page', String(newPage));
        }
        router.push(`${pathname}?${params.toString()}`);
      }
    },
    [syncWithUrl, searchParams, router, pathname]
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      setLimitState(newLimit);
      if (syncWithUrl) {
        const params = new URLSearchParams(searchParams.toString());
        if (newLimit === pageSize) {
          params.delete('limit');
        } else {
          params.set('limit', String(newLimit));
        }
        // Reset to page 1 when limit changes
        setPage(DEFAULT_PAGE);
        router.push(`${pathname}?${params.toString()}`);
      }
    },
    [syncWithUrl, searchParams, router, pathname, pageSize, setPage]
  );

  const offset = useMemo(() => (page - 1) * limit, [page, limit]);

  return {
    page,
    setPage,
    limit,
    setLimit,
    offset,
  };
}
