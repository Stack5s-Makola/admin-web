import { mockSellers } from './sellers';
import type { Listing } from '../../types/admin';

const listingRows = [
  ['Kente Fabric', 0, 'Kumasi', 'approved'],
  ['Tomatoes', 1, 'Nkwakwaw', 'pending'],
  ['Refurbished Phone', 1, 'Nkwakwaw', 'rejected'],
  ['Kente', 0, 'Kumasi', 'approved'],
  ['Tomatoes', 1, 'Nkwakwaw', 'pending'],
  ['Tomatoes', 1, 'Nkwakwaw', 'rejected'],
  ['Kente', 0, 'Kumasi', 'approved'],
  ['Tomatoes', 1, 'Nkwakwaw', 'pending'],
  ['Tomatoes', 1, 'Nkwakwaw', 'rejected'],
  ['Tomatoes', 1, 'Nkwakwaw', 'rejected'],
] as const;

export const mockListings: Listing[] = listingRows.map(([title, sellerIndex, location, status], index) => ({
  id: `mock-listing-${index + 1}`,
  title,
  imageUrl: null,
  status,
  createdAt: new Date(Date.UTC(2026, 8, 12)).toISOString(),
  seller: {
    ...mockSellers[sellerIndex],
    user: { ...mockSellers[sellerIndex].user, fullName: sellerIndex === 0 ? 'Ama Mensah' : 'Esi Akoemah' },
    businessName: location,
  },
}));
