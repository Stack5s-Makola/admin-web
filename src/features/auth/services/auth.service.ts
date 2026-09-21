import { http, httpEnvelope } from '../../../core/axios';
import { config } from '../../../core/config';
import { tokenStorage } from '../../../core/storage';
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
    return http.post<LoginResult>('/api/admin/login', credentials, authRequestOptions);
  },

  async logout(): Promise<void> {
    try {
      await http.post<null>(
        '/auth/logout',
        { refreshToken: tokenStorage.getRefreshToken() },
        authRequestOptions,
      );
    } catch {
      // Signing out locally must succeed even if the call fails.
    } finally {
      tokenStorage.clear();
    }
  },

  async forgotPassword(email: string): Promise<string> {
    const envelope = await httpEnvelope.post<null>(
      '/auth/forgot-password',
      { email },
      authRequestOptions,
    );
    return envelope.message;
  },

  async resetPassword(payload: ResetPasswordPayload): Promise<string> {
    const envelope = await httpEnvelope.post<null>(
      '/auth/reset-password',
      payload,
      authRequestOptions,
    );
    return envelope.message;
  },
};

const authRequestOptions = { baseURL: config.apiBaseUrl };
