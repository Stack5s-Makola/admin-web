/**
 * Standard API response envelope (Admin API contract, §2).
 * List endpoints add `meta`; validation failures add `errors`.
 */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PageMeta;
}

/** Pagination block returned by every list endpoint. */
export interface PageMeta {
  total: number;
  page: number;
  limit: number;
  /** Total number of pages - drives a pager directly. */
  pages: number;
}

/** What list calls resolve to: the rows plus their pagination. */
export interface Paginated<T> {
  data: T[];
  meta: PageMeta;
}

/** Query accepted by every list endpoint (contract §4). */
export interface PageQuery {
  /** >= 1, default 1 */
  page?: number;
  /** >= 1, max 100, default 20 */
  limit?: number;
}

/** Field-level validation errors: { status: "status must be one of: ..." } */
export type FieldErrors = Record<string, string>;

/**
 * Normalised error shape every failed request is converted into,
 * so screens never have to inspect raw axios errors.
 */
export class ApiError extends Error {
  status: number;
  errors?: FieldErrors;

  constructor(message: string, status: number, errors?: FieldErrors) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
  }

  /** 403: signed in but not an admin. Never retry, never redirect to login. */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** 404: that specific record does not exist (an empty list is a 200). */
  get isNotFound(): boolean {
    return this.status === 404;
  }
}
