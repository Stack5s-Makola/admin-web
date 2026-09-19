/** Every route path in one place - never hardcode a URL string in a component. */
export const paths = {
  login: '/login',

  dashboard: '/dashboard',
  sellers: '/sellers',
  buyers: '/buyers',
  settings: '/settings',
  listings: '/listings',
  listingsPending: '/listings/pending',
} as const;
