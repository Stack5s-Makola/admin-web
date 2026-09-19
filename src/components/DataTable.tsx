import type { ReactNode } from 'react';
import type { ApiError, PageMeta } from '../types/api';

/**
 * The one table the admin screens are built on. Sellers, Buyers and (next task)
 * Listings are a column config over this - resist writing per-screen table markup.
 */

export interface Column<T> {
  key: string;
  header: ReactNode;
  /** Any CSS track value: '1fr', '180px', 'minmax(200px, 2fr)'. */
  width?: string;
  align?: 'left' | 'center' | 'right';
  render: (row: T) => ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  rows: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: ApiError | null;
  onRetry?: () => void;
  emptyTitle?: string;
  emptyNote?: string;
  onRowClick?: (row: T) => void;
  meta?: PageMeta;
  onPageChange?: (page: number) => void;
  skeletonRows?: number;
}

export function DataTable<T>({
  columns,
  rows,
  rowKey,
  loading = false,
  error = null,
  onRetry,
  emptyTitle = 'Nothing here yet',
  emptyNote,
  onRowClick,
  meta,
  onPageChange,
  skeletonRows = 8,
}: DataTableProps<T>) {
  const gridTemplate = columns.map((column) => column.width ?? '1fr').join(' ');

  if (error) {
    return (
      <div className="table table--state">
        <p className="table__state-title">
          {/* core/axios has already turned this into a human message. */}
          {error.isForbidden ? 'You do not have access to this' : 'Could not load this list'}
        </p>
        <p className="table__state-note">{error.message}</p>
        {onRetry && !error.isForbidden && (
          <button type="button" className="button button--dark" onClick={onRetry}>
            Try again
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="table">
      <div className="table__scroll">
        <div className="table__grid" role="table">
          <div className="table__head" role="row" style={{ gridTemplateColumns: gridTemplate }}>
            {columns.map((column) => (
              <div
                key={column.key}
                role="columnheader"
                className={`table__cell table__cell--${column.align ?? 'left'}`}
              >
                {column.header}
              </div>
            ))}
          </div>

          {loading &&
            Array.from({ length: skeletonRows }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="table__row"
                style={{ gridTemplateColumns: gridTemplate }}
                aria-hidden="true"
              >
                {columns.map((column) => (
                  <div key={column.key} className="table__cell">
                    <span className="table__skeleton" />
                  </div>
                ))}
              </div>
            ))}

          {!loading &&
            rows.map((row) => (
              <div
                key={rowKey(row)}
                role="row"
                className={onRowClick ? 'table__row table__row--clickable' : 'table__row'}
                style={{ gridTemplateColumns: gridTemplate }}
                tabIndex={onRowClick ? 0 : undefined}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                onKeyDown={
                  onRowClick
                    ? (event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          onRowClick(row);
                        }
                      }
                    : undefined
                }
              >
                {columns.map((column) => (
                  <div
                    key={column.key}
                    role="cell"
                    className={`table__cell table__cell--${column.align ?? 'left'}`}
                  >
                    {column.render(row)}
                  </div>
                ))}
              </div>
            ))}
        </div>
      </div>

      {!loading && rows.length === 0 && (
        <div className="table__state">
          <p className="table__state-title">{emptyTitle}</p>
          {emptyNote && <p className="table__state-note">{emptyNote}</p>}
        </div>
      )}

      {meta && onPageChange && meta.pages > 1 && (
        <Pager meta={meta} onPageChange={onPageChange} disabled={loading} />
      )}
    </div>
  );
}

function Pager({
  meta,
  onPageChange,
  disabled,
}: {
  meta: PageMeta;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}) {
  const first = (meta.page - 1) * meta.limit + 1;
  const last = Math.min(meta.page * meta.limit, meta.total);

  return (
    <div className="table__foot">
      <span className="table__count">
        {meta.total > 0 ? `${first}–${last} of ${meta.total}` : 'No results'}
      </span>
      <div className="table__pager">
        <button
          type="button"
          className="button button--quiet"
          disabled={disabled || meta.page <= 1}
          onClick={() => onPageChange(meta.page - 1)}
        >
          Previous
        </button>
        <span className="table__page">
          Page {meta.page} of {meta.pages}
        </span>
        <button
          type="button"
          className="button button--quiet"
          disabled={disabled || meta.page >= meta.pages}
          onClick={() => onPageChange(meta.page + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
}
