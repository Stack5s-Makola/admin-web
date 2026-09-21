import { http } from '../../../core/axios';
import type { Seller } from '../../../types/admin';

/** Read-only seller directory. */
export const sellersService = {
  list(): Promise<Seller[]> {
    return http.get<Seller[]>('/admin/sellers');
  },
};
