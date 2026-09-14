import { http, httpEnvelope } from '../../../core/axios';
import type { Listing } from '../../../types/admin';
import type { PageQuery, Paginated } from '../../../types/api';

/**
 * Listings and the approval queue (Admin API contract, §6.5).
 *
 * approve  -> status "approved"  publish a pending listing
 * reject   -> status "rejected"  turn down a pending listing
 * remove   -> status "removed"   take down a published listing
 */
export const listingsService = {
  list(query: PageQuery = {}): Promise<Paginated<Listing>> {
    return http.getPage<Listing>('/admin/listings', { ...query });
  },

  listPending(query: PageQuery = {}): Promise<Paginated<Listing>> {
    return http.getPage<Listing>('/admin/listings/pending', { ...query });
  },

  get(id: string): Promise<Listing> {
    return http.get<Listing>(`/admin/listings/${id}`);
  },

  async approve(id: string): Promise<{ listing: Listing; message: string }> {
    const envelope = await httpEnvelope.patch<Listing>(`/admin/listings/${id}/approve`);
    return { listing: envelope.data, message: envelope.message };
  },

  async reject(id: string): Promise<{ listing: Listing; message: string }> {
    const envelope = await httpEnvelope.patch<Listing>(`/admin/listings/${id}/reject`);
    return { listing: envelope.data, message: envelope.message };
  },

  async remove(id: string): Promise<{ listing: Listing; message: string }> {
    const envelope = await httpEnvelope.patch<Listing>(`/admin/listings/${id}/remove`);
    return { listing: envelope.data, message: envelope.message };
  },
};
