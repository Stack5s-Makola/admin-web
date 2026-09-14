/** Every route path in one place - never hardcode a URL string in a component. */
export const paths = {
  login: '/login',
  verifyOtp: '/verify-otp',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',

  dashboard: '/dashboard',
  sellers: '/sellers',
  buyers: '/buyers',
  listings: '/listings',
  listingsPending: '/listings/pending',
} as const;
