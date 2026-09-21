import type { User } from '../../types/user';

const buyerNames = [
  'Ama Mensah',
  'Kofi Bediako',
  'Adwoa Appiah',
  'Yaw Asante',
  'Efua Djan',
  'Kwame Boateng',
  'Akosua Tetteh',
  'Nana Owusu',
  'Mabel Osei',
  'Michael Quayson',
  'Grace Agyemang',
  'Prince Armah',
  'Joana Sarpong',
  'Kojo Mensah',
  'Linda Boakye',
];

export const mockBuyers: User[] = buyerNames.map((fullName, index) => ({
  id: `mock-buyer-${index + 1}`,
  email: `buyer${index + 1}@makola.local`,
  fullName,
  imageUrl: null,
  role: 'BUYER',
  status: index === 3 || index === 8 || index === 12 ? 'suspended' : 'active',
  createdAt: new Date(Date.UTC(2025, 0, index + 1)).toISOString(),
}));
