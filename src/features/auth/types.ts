export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * POST /api/auth/login -> data. Confirmed with the backend:
 * login never returns the user object, and an OTP is always sent, so any
 * tokens in this response are not used - the session starts after verify-otp.
 */
export interface LoginResult {
  userId?: string;
}

/** POST /api/auth/verify-otp -> data. Tokens arrive in the body. */
export interface SessionTokens {
  accessToken: string;
  refreshToken?: string;
}

/** What the login screen does next. */
export type LoginOutcome =
  | { status: 'authenticated' }
  | { status: 'otp_required'; email: string; userId?: string };

export interface VerifyOtpPayload {
  email: string;
  otp: string;
  userId?: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
}
