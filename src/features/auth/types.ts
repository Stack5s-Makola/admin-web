export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SessionTokens {
  accessToken: string;
  refreshToken?: string;
}

/** POST /api/auth/login -> data. Tokens arrive directly in the body. */
export type LoginResult = SessionTokens;

/** What the login screen does next. */
export type LoginOutcome = { status: 'authenticated' };

export interface ResetPasswordPayload {
  token: string;
  password: string;
}
