import { useEffect, useState } from 'react';
import { DataTable, type Column } from '../../../components/DataTable';
import { StatusChip } from '../../../components/StatusChip';
import { Thumb } from '../../../components/Thumb';
import type { Seller } from '../../../types/admin';
import { sellersService } from '../services/sellers.service';

export function SellersPage() {
  const [rows, setRows] = useState<Seller[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const load = () => {
    setLoading(true); setFailed(false);
    sellersService.list().then(setRows).catch(() => setFailed(true)).finally(() => setLoading(false));
  };
  useEffect(load, []);
  const columns: Column<Seller>[] = [
    { key: 'photo', header: '', width: '64px', render: (row) => <Thumb src={row.profilePicture} name={row.name ?? row.email} /> },
    { key: 'name', header: 'Name', width: 'minmax(160px, 1fr)', render: (row) => row.name ?? row.email },
    { key: 'email', header: 'Email', width: 'minmax(200px, 1.2fr)', render: (row) => row.email },
    { key: 'business', header: 'Business Name', width: 'minmax(180px, 1.2fr)', render: (row) => row.businessName },
    { key: 'location', header: 'Location', width: 'minmax(140px, 1fr)', render: (row) => row.location ?? '—' },
    { key: 'status', header: 'Status', width: '130px', render: (row) => <StatusChip status={row.status} /> },
  ];
  return <section className="seller-management page"><header className="seller-management__header"><div><h1 className="seller-management__title">Sellers</h1><p className="seller-management__subtitle">All seller accounts</p></div></header><DataTable columns={columns} rows={rows} rowKey={(row) => row.id ?? row.email} loading={loading} error={failed ? { name: 'ApiError', message: 'Could not load sellers.', status: 0, isForbidden: false, isNotFound: false } : null} onRetry={load} emptyTitle="No sellers yet" /></section>;
}
