import { useEffect, useState } from 'react';
import { DataTable, type Column } from '../../../components/DataTable';
import { StatusChip } from '../../../components/StatusChip';
import { Thumb } from '../../../components/Thumb';
import { formatDate } from '../../../core/format';
import type { Listing } from '../../../types/admin';
import { listingsService } from '../services/listings.service';

export function ListingsPage() {
  const [rows, setRows] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); listingsService.list().then(setRows).finally(() => setLoading(false)); };
  useEffect(load, []);
  const columns: Column<Listing>[] = [
    { key: 'image', header: '', width: '64px', render: (row) => <Thumb src={row.image} name={row.product} /> },
    { key: 'product', header: 'Product', width: 'minmax(180px, 1.2fr)', render: (row) => row.product },
    { key: 'seller', header: 'Seller', width: 'minmax(160px, 1fr)', render: (row) => row.seller },
    { key: 'location', header: 'Location', width: 'minmax(140px, 1fr)', render: (row) => row.location ?? '—' },
    { key: 'date', header: 'Date', width: '150px', render: (row) => formatDate(row.date) },
    { key: 'status', header: 'Status', width: '130px', render: (row) => <StatusChip status={row.status} /> },
  ];
  return <section className="seller-management listing-management page"><header className="seller-management__header"><div><h1 className="seller-management__title">Listings</h1><p className="seller-management__subtitle">All marketplace listings</p></div></header><DataTable columns={columns} rows={rows} rowKey={(row) => row.id ?? `${row.product}-${row.seller}-${row.date}`} loading={loading} emptyTitle="No listings yet" /></section>;
}
