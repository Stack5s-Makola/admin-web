import { http, httpEnvelope } from '../../../core/axios';
import type { Seller } from '../../../types/admin';
import type { PageQuery, Paginated } from '../../../types/api';

/** Sellers and the verification queue (Admin API contract, §6.4). */
export const sellersService = {
  list(query: PageQuery = {}): Promise<Paginated<Seller>> {
    return http.getPage<Seller>('/admin/sellers', { ...query });
  },

  /** The verification queue: sellers with status "pending". */
  listPending(query: PageQuery = {}): Promise<Paginated<Seller>> {
    return http.getPage<Seller>('/admin/sellers/pending', { ...query });
  },

  get(id: string): Promise<Seller> {
    return http.get<Seller>(`/admin/sellers/${id}`);
  },

  /**
   * Approve / reject take no body and return the updated seller.
   * Neither is guarded against re-running - approving an approved seller
   * succeeds and returns the same record, so disable the button optimistically
   * rather than relying on the API to reject a double click.
   */
  async approve(id: string): Promise<{ seller: Seller; message: string }> {
    const envelope = await httpEnvelope.patch<Seller>(`/admin/sellers/${id}/approve`);
    return { seller: envelope.data, message: envelope.message };
  },

  async reject(id: string): Promise<{ seller: Seller; message: string }> {
    const envelope = await httpEnvelope.patch<Seller>(`/admin/sellers/${id}/reject`);
    return { seller: envelope.data, message: envelope.message };
  },
};
