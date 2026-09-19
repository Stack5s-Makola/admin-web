import type { Seller } from '../../types/admin';

const sellerNames = [
  'Ama Mensah',
  'Ama Mensah',
  'Ama Mensah',
  'Ama Mensah',
  'Ama Mensah',
  'Ama Mensah',
  'Ama Mensah',
  'Ama Mensah',
  'Ama Mensah',
  'Ama Mensah',
];

const statuses: Seller['status'][] = [
  'pending',
  'approved',
  'rejected',
  'pending',
  'approved',
  'rejected',
  'pending',
  'approved',
  'rejected',
  'pending',
];

export const mockSellers: Seller[] = sellerNames.map((name, index) => ({
  id: `mock-seller-${index + 1}`,
  businessName: "Ama's Fruits",
  imageUrl: null,
  status: statuses[index],
  createdAt: new Date(Date.UTC(2025, 0, index + 1)).toISOString(),
  user: {
    id: `mock-user-${index + 1}`,
    email: `ama.mensah${index + 1}@makola.local`,
    fullName: name,
    imageUrl: null,
    role: 'SELLER',
    status: 'active',
    createdAt: new Date(Date.UTC(2025, 0, index + 1)).toISOString(),
  },
}));
