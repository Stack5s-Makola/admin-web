import { http } from '../../../core/axios';
import type { DashboardData } from '../../../types/admin';

/** GET /api/admin/dashboard - stats + the 10 newest rows of each kind. */
export const dashboardService = {
  get(): Promise<DashboardData> {
    // Avoid the backend's current 304 response, which has no JSON envelope for
    // Axios to unwrap. This is not pagination/filtering; it is cache busting.
    return http.get<DashboardData>('/admin/dashboard', { params: { _: Date.now() } });
  },
};
