import { http, httpEnvelope } from '../../../core/axios';
import type { PageQuery, Paginated } from '../../../types/api';
import type { Role, User, UserStatus } from '../../../types/user';

interface UserListQuery extends PageQuery {
  role?: Role;
}

interface UserSearchQuery extends UserListQuery {
  /** Required. Case-insensitive partial match on name or email. */
  q: string;
}

/**
 * Users and buyers (Admin API contract, §6.2 and §6.3).
 * /buyers is the same data pre-filtered to role BUYER; it rejects `role`.
 * Suspending a buyer still goes through /users/:id/status.
 */
export const usersService = {
  list(query: UserListQuery = {}): Promise<Paginated<User>> {
    return http.getPage<User>('/admin/users', { ...query });
  },

  /** An empty result is a 200 with data: [] - never a 404. */
  search(query: UserSearchQuery): Promise<Paginated<User>> {
    return http.getPage<User>('/admin/users/search', { ...query });
  },

  get(id: string): Promise<User> {
    return http.get<User>(`/admin/users/${id}`);
  },

  listBuyers(query: PageQuery = {}): Promise<Paginated<User>> {
    return http.getPage<User>('/admin/buyers', { ...query });
  },

  /** 404 here also means "the id exists but belongs to a seller or admin". */
  getBuyer(id: string): Promise<User> {
    return http.get<User>(`/admin/buyers/${id}`);
  },

  /**
   * Suspend or reinstate any user. Returns the updated record and the API's
   * message ("User suspended" / "User active"), so update local state from
   * the response instead of refetching the list.
   */
  async setStatus(
    id: string,
    status: UserStatus,
  ): Promise<{ user: User; message: string }> {
    const envelope = await httpEnvelope.patch<User>(`/admin/users/${id}/status`, { status });
    return { user: envelope.data, message: envelope.message };
  },
};
