import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setSessionExpiredHandler } from '../../../core/axios';
import { tokenStorage } from '../../../core/storage';
import { ApiError } from '../../../types/api';
import { authService } from '../services/auth.service';
import type {
  AuthenticatedAdmin,
  LoginCredentials,
  LoginOutcome,
} from '../types';

interface AuthContextValue {
  user: AuthenticatedAdmin | null;
  /** True while the session is being restored on first load. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginOutcome>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/**
 * Dev-only bypass: signs in a fake admin so screens can be clicked through
 * before the API is live. Stripped from production builds by the
 * `!import.meta.env.PROD` guard below, on top of the env flag itself.
 */
const FAKE_AUTH_ENABLED =
  import.meta.env.VITE_DEV_FAKE_AUTH === 'true' && !import.meta.env.PROD;

/**
 * The cached identity comes back from localStorage, which anyone at the
 * browser can edit, so it is re-checked rather than trusted. A tampered or
 * non-admin entry reads as no session at all.
 */
function readStoredAdmin(): AuthenticatedAdmin | null {
  const stored = tokenStorage.getAdmin<Partial<AuthenticatedAdmin>>();
  if (!stored || typeof stored.email !== 'string' || stored.role !== 'ADMIN') {
    return null;
  }
  return { email: stored.email, role: 'ADMIN' };
}

const FAKE_ADMIN_USER: AuthenticatedAdmin = {
  email: 'dev-admin@makola.test',
  role: 'ADMIN',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthenticatedAdmin | null>(
    FAKE_AUTH_ENABLED ? FAKE_ADMIN_USER : null,
  );
  const [isLoading, setIsLoading] = useState(!FAKE_AUTH_ENABLED);

  // Restore the compact admin identity stored with the session tokens.
  // Skipped entirely in fake-auth mode - there's no real token to restore.
  useEffect(() => {
    if (FAKE_AUTH_ENABLED) return;

    let cancelled = false;

    async function restore() {
      if (!tokenStorage.getAccessToken()) {
        setIsLoading(false);
        return;
      }
      const admin = readStoredAdmin();
      if (!admin) tokenStorage.clear();
      if (!cancelled) {
        setUser(admin);
        setIsLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh failed anywhere in the app -> drop the user.
  useEffect(() => {
    if (FAKE_AUTH_ENABLED) return;
    setSessionExpiredHandler(() => setUser(null));
  }, []);

  /** Login validates seeded backend credentials and establishes the admin session. */
  const establishSession = useCallback(async (loginResult: Awaited<ReturnType<typeof authService.login>>) => {
    if (!loginResult?.accessToken || !loginResult.admin) {
      throw new ApiError('Login did not return a session token.', 500);
    }

    if (loginResult.admin.role !== 'ADMIN') {
      tokenStorage.clear();
      throw new ApiError('This account does not have administrator access.', 403);
    }

    tokenStorage.setTokens(loginResult.accessToken, loginResult.refreshToken);
    tokenStorage.setAdmin(loginResult.admin);
    setUser(loginResult.admin);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginOutcome> => {
      const loginResult = await authService.login(credentials);
      await establishSession(loginResult);
      return { status: 'authenticated' };
    },
    [establishSession],
  );

  const logout = useCallback(async () => {
    if (FAKE_AUTH_ENABLED) {
   
      setUser(null);
      return;
    }
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}