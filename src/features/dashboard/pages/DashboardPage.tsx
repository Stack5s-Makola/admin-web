import { useEffect, useState } from 'react';
import { Alert } from '../../../components/Alert';
import { formatDate } from '../../../core/format';
import type { DashboardData } from '../../../types/admin';
import { dashboardService } from '../services/dashboard.service';

const summaryCards = [
  { key: 'listings', label: 'Total', tone: 'total' },
  { key: 'pendingListings', label: 'Pending', tone: 'pending' },
  { key: 'rejectedListings', label: 'Rejected', tone: 'rejected' },
  { key: 'activeListings', label: 'Approved', tone: 'approved' },
] as const;

function getActivityLabel(data: DashboardData, index: number): string {
  const listing = data.recent.listings[index];
  if (listing) return `New listing submitted by ${listing.seller.user.fullName}`;

  const seller = data.recent.sellers[index];
  if (seller) return `Seller ${seller.businessName} was verified`;

  const buyer = data.recent.users[index];
  if (buyer) return `New buyer registered: ${buyer.fullName}`;

  return 'No recent activity';
}

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    dashboardService
      .get()
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load dashboard data.');
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <section className="dashboard-page">
        <h1 className="dashboard-page__title">Overview</h1>
        <Alert tone="error" message={error} />
      </section>
    );
  }

  if (!data) {
    return <section className="dashboard-page dashboard-page--loading" aria-busy="true" />;
  }

  const rejectedListings = data.stats.listings - data.stats.pendingListings - data.stats.activeListings;

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__head">
        <h1 className="dashboard-page__title">Overview</h1>
      </header>

      <section className="listing-summary" aria-labelledby="listing-summary-title">
        <h2 id="listing-summary-title">Listing Summary</h2>
        <div className="listing-summary__grid">
          {summaryCards.map((item) => {
            const values = {
              listings: data.stats.listings,
              pendingListings: data.stats.pendingListings,
              rejectedListings,
              activeListings: data.stats.activeListings,
            };

            return (
              <article key={item.label} className={`summary-card summary-card--${item.tone}`}>
                <div className="summary-card__label">{item.label}</div>
                <div className="summary-card__value">{values[item.key].toLocaleString()}</div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="recent-activities" aria-labelledby="recent-activities-title">
        <h2 id="recent-activities-title">Recent Activities</h2>
        <div className="recent-activities__body">
          <div className="recent-activities__list">
            {Array.from({ length: 10 }, (_, index) => {
              const date = data.recent.listings[index]?.createdAt ?? data.recent.users[index]?.createdAt;
              return (
                <div key={`${index}-${date ?? 'activity'}`} className="activity-row">
                  <span>{getActivityLabel(data, index)}</span>
                  <time>{date ? formatDate(date) : 'Recently'}</time>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </section>
  );
}
