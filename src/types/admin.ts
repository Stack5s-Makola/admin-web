import type { User } from './user';

/** Entity shapes returned by /api/admin (contract, §5). */

export type SellerStatus = 'pending' | 'approved' | 'rejected';
export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'removed';
export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface Seller {
  id: string;
  businessName: string;
  imageUrl: string | null;
  status: SellerStatus;
  createdAt: string;
  /** Included on every seller endpoint. */
  user: User;
}

export interface Listing {
  id: string;
  title: string;
  imageUrl: string | null;
  status: ListingStatus;
  createdAt: string;
  /** Included on every listing endpoint. */
  seller: Seller;
}

export interface Report {
  id: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
  /** Included on every report endpoint. */
  reporter: User;
}

export interface Review {
  id: string;
  rating: number;
  createdAt: string;
  author: User;
  seller: Seller;
}

/** GET /api/admin/dashboard -> data (contract, §6.1). */
export interface DashboardData {
  stats: DashboardStats;
  recent: DashboardRecent;
}

export interface DashboardStats {
  /** All user accounts. */
  users: number;
  /** Users with the BUYER role. */
  buyers: number;
  /** Users with the SELLER role. */
  sellerAccounts: number;
  /** Seller profiles (a SELLER user may not have one yet). */
  sellers: number;
  /** Seller profiles awaiting verification. */
  pendingSellers: number;
  listings: number;
  pendingListings: number;
  /** Listings with status "approved". */
  activeListings: number;
  /** Open reports only. */
  reports: number;
}

/** The 10 newest rows of each kind, newest first. No `meta` on this endpoint. */
export interface DashboardRecent {
  users: User[];
  sellers: Seller[];
  listings: Listing[];
  reports: Report[];
  reviews: Review[];
}
