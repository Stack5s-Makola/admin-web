import { http } from '../../../core/axios';
import { config } from '../../../core/config';
import { mockDashboard } from '../../../data/mock/dashboard';
import type { DashboardData } from '../../../types/admin';

/** GET /api/admin/dashboard - stats + the 10 newest rows of each kind. */
export const dashboardService = {
  get(): Promise<DashboardData> {
    if (config.devMockData) return Promise.resolve(mockDashboard);
    return http.get<DashboardData>('/admin/dashboard');
  },
};
