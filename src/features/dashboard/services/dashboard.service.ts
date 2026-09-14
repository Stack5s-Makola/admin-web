import { http } from '../../../core/axios';
import type { DashboardData } from '../../../types/admin';

/** GET /api/admin/dashboard - stats + the 10 newest rows of each kind. */
export const dashboardService = {
  get(): Promise<DashboardData> {
    return http.get<DashboardData>('/admin/dashboard');
  },
};
