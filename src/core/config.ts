/**
 * Single place where environment variables are read.
 * Never read import.meta.env anywhere else.
 */

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';

export const config = {
  /** Backend origin, e.g. https://makola-api.onrender.com */
  apiBaseUrl: rawBaseUrl.replace(/\/+$/, ''),
  /** All backend routes are prefixed with /api (architecture doc, section 44). */
  apiPrefix: '/api',
  /** Render + Neon both cold-start; 15s was not enough for the first call. */
  requestTimeoutMs: 30000,
  /**
   * Confirmed with the backend: tokens come back in the response body.
   * Kept as a switch in case this moves to an httpOnly cookie later -
   * nothing outside core/ would change.
   */
  refreshTokenTransport: 'body' as 'body' | 'cookie',
  /**
   * DEV ONLY. With VITE_DEV_FAKE_AUTH=true the app signs you in as a fake
   * admin so the screens can be clicked through before the API exists.
   * Never set this in a deployed environment.
   */
  devFakeAuth: import.meta.env.VITE_DEV_FAKE_AUTH === 'true' && import.meta.env.DEV,
} as const;

export const apiUrl = `${config.apiBaseUrl}${config.apiPrefix}`;
