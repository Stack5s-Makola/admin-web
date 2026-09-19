import { http, httpEnvelope } from '../../../core/axios';
import { tokenStorage } from '../../../core/storage';
import type { User } from '../../../types/user';
import type {
  LoginCredentials,
  LoginResult,
  ResetPasswordPayload,
} from '../types';

/**
 * Every auth endpoint the admin app touches.
 * Endpoints follow the architecture doc, section 45.
 */
export const authService = {
  login(credentials: LoginCredentials): Promise<LoginResult> {
    return http.post<LoginResult>('/auth/login', credentials);
  },

  /**
   * GET /api/users/me loads the account after login and on page reload.
   */
  me(): Promise<User> {
    return http.get<User>('/users/me');
  },

  async logout(): Promise<void> {
    try {
      await http.post<null>('/auth/logout', {
        refreshToken: tokenStorage.getRefreshToken(),
      });
    } catch {
      // Signing out locally must succeed even if the call fails.
    } finally {
      tokenStorage.clear();
    }
  },

  async forgotPassword(email: string): Promise<string> {
    const envelope = await httpEnvelope.post<null>('/auth/forgot-password', { email });
    return envelope.message;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<string> {
    const envelope = await httpEnvelope.post<null>('/auth/reset-password', payload);
    return envelope.message;
  },
};
