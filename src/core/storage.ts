import { config } from './config';

/**
 * Token transport lives here and nowhere else.
 *
 * Today: the backend returns accessToken + refreshToken in the response body
 * and we keep them in localStorage.
 *
 * If the team agrees on httpOnly cookies instead, set
 * config.refreshTokenTransport = 'cookie'. Then the refresh token is never
 * touched by JavaScript, and core/axios.ts sends the refresh request with
 * credentials instead of a body. No screen or feature service changes.
 */

const ACCESS_TOKEN_KEY = 'makola.admin.accessToken';
const REFRESH_TOKEN_KEY = 'makola.admin.refreshToken';
const ADMIN_KEY = 'makola.admin.identity';

export const tokenStorage = {
  getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY);
  },

  getRefreshToken(): string | null {
    if (config.refreshTokenTransport === 'cookie') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    if (config.refreshTokenTransport === 'body' && refreshToken) {
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },

  /**
   * The compact admin identity is cached beside the tokens so a reload
   * restores the session without a round trip. It is typed at the call site
   * so core/ stays free of feature types - and validated there too, because
   * localStorage is writable by whoever is sitting at the browser.
   */
  getAdmin<T>(): T | null {
    const raw = localStorage.getItem(ADMIN_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  setAdmin(admin: unknown): void {
    localStorage.setItem(ADMIN_KEY, JSON.stringify(admin));
  },

  clear(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(ADMIN_KEY);
  },

  /** True when a refresh attempt is worth making. */
  canRefresh(): boolean {
    return config.refreshTokenTransport === 'cookie' || !!this.getRefreshToken();
  },
};
