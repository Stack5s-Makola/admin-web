import axios, {
  AxiosError,
  AxiosHeaders,
  type AxiosRequestConfig,
  type AxiosInstance,
  type InternalAxiosRequestConfig,
} from 'axios';
import { apiUrl, config } from './config';
import { tokenStorage } from './storage';
import {
  ApiError,
  type ApiResponse,
  type FieldErrors,
  type Paginated,
} from '../types/api';

/**
 * The single HTTP client for the admin web app.
 * Feature services must import from here, never create their own instance.
 *
 * Responsibilities:
 *  1. Base URL + JSON defaults + timeout
 *  2. Attach the access token to every request
 *  3. Unwrap the standard { success, message, data } envelope
 *  4. Normalise every failure into ApiError
 *  5. Refresh once on 401 (single-flight) and retry the original request
 */

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

export const api: AxiosInstance = axios.create({
  baseURL: apiUrl,
  timeout: config.requestTimeoutMs,
  headers: { 'Content-Type': 'application/json' },
  // Needed only if refresh tokens move to httpOnly cookies.
  withCredentials: config.refreshTokenTransport === 'cookie',
});

/* ------------------------------------------------------------------ */
/* Session expiry notification                                         */
/* ------------------------------------------------------------------ */

type SessionExpiredHandler = () => void;
let onSessionExpired: SessionExpiredHandler = () => {};

/** AuthContext registers here so this file never imports React or the router. */
export function setSessionExpiredHandler(handler: SessionExpiredHandler): void {
  onSessionExpired = handler;
}

/* ------------------------------------------------------------------ */
/* Request interceptor                                                 */
/* ------------------------------------------------------------------ */

api.interceptors.request.use((request) => {
  const token = tokenStorage.getAccessToken();
  if (token) {
    const headers = AxiosHeaders.from(request.headers);
    headers.set('Authorization', `Bearer ${token}`);
    request.headers = headers;
  }
  return request;
});

/* ------------------------------------------------------------------ */
/* Refresh handling (single-flight)                                    */
/* ------------------------------------------------------------------ */

let refreshPromise: Promise<string> | null = null;

async function refreshAccessToken(): Promise<string> {
  // A bare axios call: it must not go through these interceptors.
  const body =
    config.refreshTokenTransport === 'body'
      ? { refreshToken: tokenStorage.getRefreshToken() }
      : {};

  const response = await axios.post<
    ApiResponse<{ accessToken: string; refreshToken?: string }>
  >(`${config.apiBaseUrl}/auth/refresh`, body, {
    withCredentials: config.refreshTokenTransport === 'cookie',
    timeout: config.requestTimeoutMs,
  });

  const { accessToken, refreshToken } = response.data.data;
  tokenStorage.setTokens(accessToken, refreshToken);
  return accessToken;
}

/* ------------------------------------------------------------------ */
/* Response interceptor                                                */
/* ------------------------------------------------------------------ */

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<ApiResponse<unknown> & { errors?: FieldErrors }>) => {
    const original = error.config as RetriableConfig | undefined;

    // No response at all: network down, CORS, timeout.
    if (!error.response) {
      return Promise.reject(
        new ApiError(
          error.code === 'ECONNABORTED'
            ? 'The request timed out. Please try again.'
            : 'Cannot reach the server. Check your connection.',
          0,
        ),
      );
    }

    const { status, data } = error.response;
    const isRefreshCall = original?.url?.includes('/auth/refresh');

    if (status === 401 && original && !original._retry && !isRefreshCall) {
      if (!tokenStorage.canRefresh()) {
        tokenStorage.clear();
        onSessionExpired();
      } else {
        original._retry = true;
        try {
          // Concurrent 401s share one refresh request.
          refreshPromise = refreshPromise ?? refreshAccessToken();
          const accessToken = await refreshPromise;
          refreshPromise = null;

          const headers = AxiosHeaders.from(original.headers);
          headers.set('Authorization', `Bearer ${accessToken}`);
          original.headers = headers;
          return api.request(original);
        } catch {
          refreshPromise = null;
          tokenStorage.clear();
          onSessionExpired();
        }
      }
    }

    return Promise.reject(
      new ApiError(
        data?.message ?? 'Something went wrong. Please try again.',
        status,
        data?.errors,
      ),
    );
  },
);

/* ------------------------------------------------------------------ */
/* Cold-start retry                                                    */
/* ------------------------------------------------------------------ */

/**
 * Neon suspends when idle, so the first request after a quiet period can come
 * back 500 while the database wakes (Admin API contract, §8). Retry reads only -
 * never a PATCH, which could apply twice.
 */
const COLD_START_RETRIES = 2;

function isColdStart(error: unknown): boolean {
  return error instanceof ApiError && (error.status === 500 || error.status === 0);
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function getWithRetry<T>(
  url: string,
  options?: AxiosRequestConfig,
): Promise<ApiResponse<T>> {
  let lastError: unknown;

  for (let attempt = 0; attempt <= COLD_START_RETRIES; attempt += 1) {
    try {
      const response = await api.get<ApiResponse<T>>(url, options);
      return response.data;
    } catch (error) {
      lastError = error;
      if (!isColdStart(error) || attempt === COLD_START_RETRIES) break;
      await wait(1000 * (attempt + 1));
    }
  }

  throw lastError;
}

/* ------------------------------------------------------------------ */
/* Typed helpers                                                       */
/* ------------------------------------------------------------------ */

/** Returns the envelope's `data`, which is what screens almost always want. */
export const http = {
  async get<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    const envelope = await getWithRetry<T>(url, options);
    return envelope.data;
  },

  /**
   * List endpoints: resolves to { data, meta } so pagination survives.
   * `query` is sent as page/limit plus any endpoint-specific filters.
   */
  async getPage<T>(
    url: string,
    query?: Record<string, string | number | undefined>,
    options?: AxiosRequestConfig,
  ): Promise<Paginated<T>> {
    const params = Object.fromEntries(
      Object.entries(query ?? {}).filter(([, value]) => value !== undefined && value !== ''),
    );

    const envelope = await getWithRetry<T[]>(url, { ...options, params });

    return {
      data: envelope.data,
      meta: envelope.meta ?? {
        total: envelope.data.length,
        page: 1,
        limit: envelope.data.length,
        pages: 1,
      },
    };
  },

  async post<T>(url: string, body?: unknown, options?: AxiosRequestConfig): Promise<T> {
    const response = await api.post<ApiResponse<T>>(url, body, options);
    return response.data.data;
  },
  async patch<T>(url: string, body?: unknown, options?: AxiosRequestConfig): Promise<T> {
    const response = await api.patch<ApiResponse<T>>(url, body, options);
    return response.data.data;
  },
  async delete<T>(url: string, options?: AxiosRequestConfig): Promise<T> {
    const response = await api.delete<ApiResponse<T>>(url, options);
    return response.data.data;
  },
};

/** Use when the success `message` matters (toasts, confirmations). */
export const httpEnvelope = {
  async get<T>(url: string, options?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return getWithRetry<T>(url, options);
  },
  async post<T>(
    url: string,
    body?: unknown,
    options?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await api.post<ApiResponse<T>>(url, body, options);
    return response.data;
  },
  async patch<T>(
    url: string,
    body?: unknown,
    options?: AxiosRequestConfig,
  ): Promise<ApiResponse<T>> {
    const response = await api.patch<ApiResponse<T>>(url, body, options);
    return response.data;
  },
};
