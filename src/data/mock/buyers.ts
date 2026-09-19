import type { User } from '../../types/user';

export const mockBuyers: User[] = Array.from({ length: 10 }, (_, index) => ({
  id: `mock-buyer-${index + 1}`,
  email: `buyer${index + 1}@makola.local`,
  fullName: 'Ama Mensah',
  imageUrl: null,
  role: 'BUYER',
  status: index === 3 || index === 8 ? 'suspended' : 'active',
  createdAt: new Date(Date.UTC(2025, 0, index + 1)).toISOString(),
}));
