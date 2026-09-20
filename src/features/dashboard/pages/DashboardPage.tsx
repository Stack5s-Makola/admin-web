import { useEffect, useState } from 'react';
import { Alert } from '../../../components/Alert';
import { formatDate } from '../../../core/format';
import type { DashboardData } from '../../../types/admin';
import { dashboardService } from '../services/dashboard.service';

const summaryCards = [
  { key: 'totalUsers', label: 'Users' },
  { key: 'totalSellers', label: 'Sellers' },
  { key: 'totalBuyers', label: 'Buyers' },
  { key: 'totalListings', label: 'Listings' },
] as const;

export function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    dashboardService.get().then(setData).catch(() => setError('Could not load dashboard data.'));
  }, []);

  if (error) return <section className="dashboard-page"><Alert tone="error" message={error} /></section>;
  if (!data) return <section className="dashboard-page dashboard-page--loading" aria-busy="true" />;

  return (
    <section className="dashboard-page">
      <header className="dashboard-page__head"><h1 className="dashboard-page__title">Overview</h1></header>
      <section className="listing-summary" aria-labelledby="listing-summary-title">
        <h2 id="listing-summary-title">Platform Summary</h2>
        <div className="listing-summary__grid">
          {summaryCards.map(({ key, label }) => (
            <article key={key} className="summary-card summary-card--total">
              <div className="summary-card__label">{label}</div>
              <div className="summary-card__value">{data[key].toLocaleString()}</div>
            </article>
          ))}
        </div>
      </section>
      <section className="recent-activities" aria-labelledby="recent-activities-title">
        <h2 id="recent-activities-title">Recent Activities</h2>
        <div className="recent-activities__body"><div className="recent-activities__list">
          {data.recentActivities.map((activity, index) => (
            <div key={typeof activity === 'string' ? `${activity}-${index}` : activity.id ?? `${activity.message ?? activity.type ?? 'activity'}-${index}`} className="activity-row">
              <span>{typeof activity === 'string' ? activity : activity.message ?? activity.type ?? 'Recent activity'}</span>
              <time>{typeof activity !== 'string' && activity.createdAt ? formatDate(activity.createdAt) : 'Recently'}</time>
            </div>
          ))}
          {data.recentActivities.length === 0 && <div className="activity-row"><span>No recent activity</span></div>}
        </div></div>
      </section>
    </section>
  );
}
