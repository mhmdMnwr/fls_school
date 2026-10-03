import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

export interface UseListParamsOptions<F = Record<string, string>> {
  defaultLimit?: number;
  defaultFilters?: Partial<F>;
}

export function useListParams<F extends Record<string, string> = Record<string, string>>(
  options: UseListParamsOptions<F> = {}
) {
  const [searchParams, setSearchParams] = useSearchParams();
  const defaultLimit = options.defaultLimit || 10;

  const page = useMemo(() => {
    const p = parseInt(searchParams.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  }, [searchParams]);

  const limit = useMemo(() => {
    const l = parseInt(searchParams.get('limit') || String(defaultLimit), 10);
    return isNaN(l) || l < 1 ? defaultLimit : l;
  }, [searchParams, defaultLimit]);

  const search = useMemo(() => {
    return searchParams.get('search') || '';
  }, [searchParams]);

  const filters = useMemo(() => {
    const result: Record<string, string> = {};
    for (const [key, value] of searchParams.entries()) {
      if (key !== 'page' && key !== 'limit' && key !== 'search' && key !== 'new') {
        result[key] = value;
      }
    }
    return result as F;
  }, [searchParams]);

  const setPage = useCallback(
    (newPage: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (newPage <= 1) {
            next.delete('page');
          } else {
            next.set('page', String(newPage));
          }
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          next.set('limit', String(newLimit));
          next.delete('page'); // reset to page 1
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setSearch = useCallback(
    (newSearch: string) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!newSearch || !newSearch.trim()) {
            next.delete('search');
          } else {
            next.set('search', newSearch.trim());
          }
          next.delete('page'); // reset to page 1
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setFilter = useCallback(
    (key: string, value: string | undefined | null) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          if (!value || value === 'all') {
            next.delete(key);
          } else {
            next.set(key, value);
          }
          next.delete('page'); // reset to page 1
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const setFilters = useCallback(
    (values: Record<string, string | undefined | null>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          Object.entries(values).forEach(([key, value]) => {
            if (!value || value === 'all') {
              next.delete(key);
            } else {
              next.set(key, value);
            }
          });
          next.delete('page'); // reset to page 1
          return next;
        },
        { replace: true }
      );
    },
    [setSearchParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams();
        const curLimit = prev.get('limit');
        if (curLimit && curLimit !== String(defaultLimit)) {
          next.set('limit', curLimit);
        }
        return next;
      },
      { replace: true }
    );
  }, [setSearchParams, defaultLimit]);

  const hasActiveFilters = useMemo(() => {
    return (
      !!search ||
      Object.keys(filters).some(
        (k) => filters[k] !== undefined && filters[k] !== '' && filters[k] !== 'all'
      )
    );
  }, [search, filters]);

  return {
    page,
    limit,
    search,
    filters,
    setPage,
    setLimit,
    setSearch,
    setFilter,
    setFilters,
    resetFilters,
    hasActiveFilters,
    searchParams,
    setSearchParams,
  };
}

export default useListParams;
