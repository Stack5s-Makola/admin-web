import { http, httpEnvelope } from '../../../core/axios';
import type { Report } from '../../../types/admin';
import type { PageQuery, Paginated } from '../../../types/api';

/**
 * Reports (Admin API contract, §6.6).
 * The list returns every status - filter client-side for an open-only view.
 * The dashboard's `reports` stat counts open ones.
 */
export const reportsService = {
  list(query: PageQuery = {}): Promise<Paginated<Report>> {
    return http.getPage<Report>('/admin/reports', { ...query });
  },

  async resolve(id: string): Promise<{ report: Report; message: string }> {
    const envelope = await httpEnvelope.patch<Report>(`/admin/reports/${id}/resolve`);
    return { report: envelope.data, message: envelope.message };
  },

  async dismiss(id: string): Promise<{ report: Report; message: string }> {
    const envelope = await httpEnvelope.patch<Report>(`/admin/reports/${id}/dismiss`);
    return { report: envelope.data, message: envelope.message };
  },
};
