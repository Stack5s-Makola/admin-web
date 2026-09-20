export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken?: string;
}

/** The compact identity returned for the currently authenticated admin. */
export interface AuthenticatedAdmin {
  email: string;
  role: 'ADMIN';
}

/** POST /api/admin/login -> data. */
export interface LoginResult extends SessionTokens {
  admin: AuthenticatedAdmin;
}

/** What the login screen does next. */
export type LoginOutcome = { status: 'authenticated' };

export interface ResetPasswordPayload {
  token: string;
  password: string;
}
