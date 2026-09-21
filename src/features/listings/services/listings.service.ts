import { http } from '../../../core/axios';
import type { Listing } from '../../../types/admin';

/**
 * Listings and the approval queue (Admin API contract, §6.5).
 *
 * approve  -> status "approved"  publish a pending listing
 * reject   -> status "rejected"  turn down a pending listing
 * remove   -> status "removed"   take down a published listing
 */
export const listingsService = {
  list(): Promise<Listing[]> {
    return http.get<Listing[]>('/admin/listings');
  },
};
