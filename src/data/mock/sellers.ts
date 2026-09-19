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
  'Esi Kofi',
  'Kwame Boateng',
  'Abena Owusu',
  'Naa Adjeley',
  'Yaw Ofori',
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
  'approved',
  'pending',
  'approved',
  'rejected',
  'approved',
];

const businessNames = [
  "Ama's Fruits",
  "Ama's Fruits",
  "Ama's Fruits",
  "Ama's Fruits",
  "Ama's Fruits",
  "Ama's Fruits",
  "Ama's Fruits",
  "Ama's Fruits",
  "Ama's Fruits",
  "Ama's Fruits",
  'Esi Wellness Hub',
  'Kwame Agro Mart',
  'Abena Textile Studio',
  'Naa Artisan Market',
  'Yaw Fresh Produce',
];

export const mockSellers: Seller[] = sellerNames.map((name, index) => ({
  id: `mock-seller-${index + 1}`,
  businessName: businessNames[index],
  imageUrl: null,
  status: statuses[index],
  createdAt: new Date(Date.UTC(2025, 0, index + 1)).toISOString(),
  user: {
    id: `mock-user-${index + 1}`,
    email: `seller${index + 1}@makola.local`,
    fullName: name,
    imageUrl: null,
    role: 'SELLER',
    status: statuses[index] === 'approved' ? 'active' : 'suspended',
    createdAt: new Date(Date.UTC(2025, 0, index + 1)).toISOString(),
  },
}));
