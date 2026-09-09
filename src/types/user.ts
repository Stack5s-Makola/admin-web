export type Role = 'BUYER' | 'SELLER' | 'ADMIN';

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: Role;
  /**
   * Cloudinary URL from the users.profile_image column (architecture doc, section 18).
   * CONFIRM the JSON key with the backend: profileImage vs profile_image.
   */
  profileImage?: string | null;
}
