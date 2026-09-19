/** Roles are UPPERCASE, statuses are lowercase (Admin API contract, §5). */
export type Role = 'BUYER' | 'SELLER' | 'ADMIN';
export type UserStatus = 'active' | 'suspended';

/** Exactly the fields the API returns - no password or auth fields. */
export interface User {
  id: string;
  email: string;
  fullName: string;
  imageUrl: string | null;
  role: Role;
  status: UserStatus;
  createdAt: string;
}
