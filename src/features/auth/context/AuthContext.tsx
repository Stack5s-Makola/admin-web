import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { setSessionExpiredHandler } from '../../../core/axios';
import { config } from '../../../core/config';
import { tokenStorage } from '../../../core/storage';
import { ApiError } from '../../../types/api';
import type { User } from '../../../types/user';
import { authService } from '../services/auth.service';
import type {
  LoginCredentials,
  LoginOutcome,
  SessionTokens,
  VerifyOtpPayload,
} from '../types';

interface AuthContextValue {
  user: User | null;
  /** True while the session is being restored on first load. */
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<LoginOutcome>;
  verifyOtp: (payload: VerifyOtpPayload) => Promise<void>;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Stand-in account used only when VITE_DEV_FAKE_AUTH is on. */
const DEV_ADMIN: User = {
  id: 'dev-admin',
  email: 'dev@makola.local',
  fullName: 'Dev Admin',
  imageUrl: null,
  role: 'ADMIN',
  status: 'active',
  createdAt: new Date().toISOString(),
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore the session on reload: a stored token plus /users/me.
  useEffect(() => {
    let cancelled = false;

    async function restore() {
      if (config.devFakeAuth) {
        setUser(DEV_ADMIN);
        setIsLoading(false);
        return;
      }
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

  /**
   * Stores the tokens, loads the account through GET /users/me
   * (no endpoint returns the user alongside tokens), and rejects non-admins.
   */
  const establishSession = useCallback(async (tokens: SessionTokens) => {
    tokenStorage.setTokens(tokens.accessToken, tokens.refreshToken);

    const account = await authService.me();

    // The admin app is for administrators only (architecture doc, section 58).
    if (account.role !== 'ADMIN') {
      tokenStorage.clear();
      throw new ApiError('This account does not have administrator access.', 403);
    }

    setUser(account);
  }, []);

  /**
   * Password check only. Every admin login sends an OTP, so this never
   * establishes a session - the OTP screen does.
   */
  const login = useCallback(
    async (credentials: LoginCredentials): Promise<LoginOutcome> => {
      if (config.devFakeAuth) {
        setUser(DEV_ADMIN);
        return { status: 'authenticated' };
      }

      const result = await authService.login(credentials);
      return { status: 'otp_required', email: credentials.email, userId: result?.userId };
    },
    [],
  );

  const verifyOtp = useCallback(
    async (payload: VerifyOtpPayload) => {
      const tokens = await authService.verifyOtp(payload);
      if (!tokens?.accessToken) {
        throw new ApiError('Verification did not return a session. Try signing in again.', 500);
      }
      await establishSession(tokens);
    },
    [establishSession],
  );

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, isLoading, isAuthenticated: !!user, login, verifyOtp, logout }),
    [user, isLoading, login, verifyOtp, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
