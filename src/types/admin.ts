/** Read-only entity shapes returned by the current Admin API. */

export type ListingStatus = 'pending' | 'approved' | 'rejected' | 'removed';

export interface DashboardData {
  totalUsers: number;
  totalSellers: number;
  totalBuyers: number;
  totalListings: number;
  recentActivities: RecentActivity[];
}

export type RecentActivity = {
  id?: string;
  message?: string;
  type?: string;
  createdAt?: string;
} | string;

export interface Seller {
  id?: string;
  name: string | null;
  email: string;
  profilePicture: string | null;
  businessName: string;
  location: string | null;
  status: string;
}

export interface Buyer {
  id?: string;
  name: string | null;
  email: string;
  phone: string | null;
  profilePicture: string | null;
  joined: string;
  status: string;
}

export interface Listing {
  id?: string;
  product: string;
  seller: string;
  location: string | null;
  date: string;
  status: ListingStatus;
  image: string | null;
}
