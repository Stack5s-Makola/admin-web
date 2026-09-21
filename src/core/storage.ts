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

interface StoredAdmin {
  email: string;
  role: 'ADMIN';
}

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

  getAdmin(): StoredAdmin | null {
    const stored = localStorage.getItem(ADMIN_KEY);
    if (!stored) return null;

    try {
      const admin = JSON.parse(stored) as StoredAdmin;
      return admin.email && admin.role === 'ADMIN' ? admin : null;
    } catch {
      return null;
    }
  },

  setAdmin(admin: StoredAdmin): void {
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
