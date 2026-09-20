import { http } from '../../../core/axios';
import type { Buyer } from '../../../types/admin';

/** Read-only buyer directory. */
export const usersService = {
  listBuyers(): Promise<Buyer[]> {
    return http.get<Buyer[]>('/admin/buyers');
  },
};
