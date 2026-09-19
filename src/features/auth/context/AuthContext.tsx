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
import type { User } from '../../../types/user';
import { authService } from '../services/auth.service';
import type {
  LoginCredentials,
  LoginOutcome,
  SessionTokens,
} from '../types';

interface AuthContextValue {
  user: User | null;
  /** True while the session is being restored on first load. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginOutcome>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session on reload: a stored token plus /users/me.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (!tokenStorage.getAccessToken()) {
        setIsLoading(false);
        return;
      }
      try {
        const me = await authService.me();
        if (me.role !== 'ADMIN') tokenStorage.clear();
        if (!cancelled) setUser(me.role === 'ADMIN' ? me : null);
      } catch {
        tokenStorage.clear();
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  // Refresh failed anywhere in the app -> drop the user.
  useEffect(() => {
    setSessionExpiredHandler(() => setUser(null));
  }, []);

  /** Login validates seeded backend credentials and establishes the admin session. */
  const establishSession = useCallback(async (tokens: SessionTokens) => {
    if (!tokens?.accessToken) {
      throw new ApiError('Login did not return a session token.', 500);
    }

    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);
    const account = await authService.me();

    if (account.role !== 'ADMIN') {
      tokenStorage.clear();
      throw new ApiError('This account does not have administrator access.', 403);
    }

    setUser(account);
  }, []);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginOutcome> => {
      const tokens = await authService.login(credentials);
      await establishSession(tokens);
      return { status: 'authenticated' };
    },
    [establishSession],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
