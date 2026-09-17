import { useCallback, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiError, type PageMeta, type Paginated } from '../types/api';

/**
 * List state for every admin table: page, search term and one tab, all held in
 * the URL query string so a refresh - or a link pasted into the team chat -
 * restores the exact view.
 *
 * The services don't take an AbortSignal, so instead of cancelling requests we
 * stamp each one and ignore any response that isn't the newest. Same effect for
 * the user: a fast tab switch never shows the previous tab's rows.
 */

export interface ListQuery {
  page: number;
  limit: number;
  /** Debounced search term; '' when the box is empty. */
  q: string;
  /** Active tab, e.g. 'all' | 'pending'. */
  tab: string;
}

export interface UseAdminListResult<T> {
  rows: T[];
  meta: PageMeta;
  loading: boolean;
  error: ApiError | null;
  page: number;
  q: string;
  tab: string;
  /** Live value of the search box, before debouncing. */
  searchInput: string;
  setSearch: (value: string) => void;
  setTab: (value: string) => void;
  setPage: (value: number) => void;
  refetch: () => void;
  /**
   * Patch the loaded rows in place. Approve/reject/suspend all return the
   * updated record, so screens apply it here instead of refetching the list
   * (Admin API contract, §7).
   */
  updateRows: (updater: (rows: T[]) => T[]) => void;
}

const SEARCH_DEBOUNCE_MS = 350;
const DEFAULT_LIMIT = 20;

export function useAdminList<T>(
  fetcher: (query: ListQuery) => Promise<Paginated<T>>,
  options: { defaultLimit?: number; defaultTab?: string } = {},
): UseAdminListResult<T> {
  const { defaultLimit = DEFAULT_LIMIT, defaultTab = 'all' } = options;

  const [params, setParams] = useSearchParams();
  const page = Math.max(1, Number(params.get('page') ?? 1) || 1);
  const q = params.get('q') ?? '';
  const tab = params.get('tab') ?? defaultTab;
  const limit = defaultLimit;

  const [searchInput, setSearchInput] = useState(q);
  const [rows, setRows] = useState<T[]>([]);
  const [meta, setMeta] = useState<PageMeta>({
    total: 0,
    page: 1,
    limit: defaultLimit,
    pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [nonce, setNonce] = useState(0);

  // Keeps an inline arrow fetcher from re-running the effect on every render.
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const requestId = useRef(0);

  const patch = useCallback(
    (next: Record<string, string | number | undefined>) => {
      const search = new URLSearchParams(params);
      Object.entries(next).forEach(([key, value]) => {
        if (value === undefined || value === '') search.delete(key);
        else search.set(key, String(value));
      });
      setParams(search, { replace: true });
    },
    [params, setParams],
  );

  // Debounce the search box into the URL.
  useEffect(() => {
    if (searchInput === q) return;
    const timer = setTimeout(
      () => patch({ q: searchInput || undefined, page: undefined }),
      SEARCH_DEBOUNCE_MS,
    );
    return () => clearTimeout(timer);
  }, [searchInput, q, patch]);

  // Follow the URL when it changes from outside (back button, a pasted link).
  useEffect(() => {
    setSearchInput((current) => (current === q ? current : q));
  }, [q]);

  useEffect(() => {
    const id = requestId.current + 1;
    requestId.current = id;

    setLoading(true);
    setError(null);

    fetcherRef
      .current({ page, limit, q, tab })
      .then((result) => {
        if (id !== requestId.current) return;
        setRows(result.data);
        setMeta(result.meta);
      })
      .catch((caught: unknown) => {
        if (id !== requestId.current) return;
        setError(
          caught instanceof ApiError
            ? caught
            : new ApiError('Something went wrong loading this list.', 0),
        );
        setRows([]);
      })
      .finally(() => {
        if (id === requestId.current) setLoading(false);
      });
  }, [page, limit, q, tab, nonce]);

  return {
    rows,
    meta,
    loading,
    error,
    page,
    q,
    tab,
    searchInput,
    setSearch: setSearchInput,
    setTab: (value: string) =>
      patch({ tab: value === defaultTab ? undefined : value, page: undefined }),
    setPage: (value: number) => patch({ page: value <= 1 ? undefined : value }),
    refetch: () => setNonce((current) => current + 1),
    updateRows: (updater) => setRows((current) => updater(current)),
  };
}
