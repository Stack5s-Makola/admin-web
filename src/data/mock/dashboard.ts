import { mockBuyers } from './buyers';
import { mockListings } from './listings';
import { mockSellers } from './sellers';
import type { DashboardData } from '../../types/admin';

export const mockDashboard: DashboardData = {
  stats: {
    users: mockBuyers.length,
    buyers: mockBuyers.length,
    sellerAccounts: mockSellers.length,
    sellers: mockSellers.length,
    pendingSellers: mockSellers.filter((seller) => seller.status === 'pending').length,
    listings: mockListings.length,
    pendingListings: mockListings.filter((listing) => listing.status === 'pending').length,
    activeListings: mockListings.filter((listing) => listing.status === 'approved').length,
    reports: 0,
  },
  recent: {
    users: mockBuyers,
    sellers: mockSellers,
    listings: mockListings,
    reports: [],
    reviews: [],
  },
};
