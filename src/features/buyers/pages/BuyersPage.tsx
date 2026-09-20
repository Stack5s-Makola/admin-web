import { useEffect, useState } from 'react';
import { DataTable, type Column } from '../../../components/DataTable';
import { StatusChip } from '../../../components/StatusChip';
import { Thumb } from '../../../components/Thumb';
import { formatDate } from '../../../core/format';
import type { Buyer } from '../../../types/admin';
import { usersService } from '../services/users.service';

export function BuyersPage() {
  const [rows, setRows] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState(true);
  const load = () => { setLoading(true); usersService.listBuyers().then(setRows).finally(() => setLoading(false)); };
  useEffect(load, []);
  const columns: Column<Buyer>[] = [
    { key: 'photo', header: '', width: '64px', render: (row) => <Thumb src={row.profilePicture} name={row.name ?? row.email} /> },
    { key: 'name', header: 'Name', width: 'minmax(160px, 1fr)', render: (row) => row.name ?? row.email },
    { key: 'email', header: 'Email', width: 'minmax(200px, 1.2fr)', render: (row) => row.email },
    { key: 'phone', header: 'Phone', width: '150px', render: (row) => row.phone ?? '—' },
    { key: 'joined', header: 'Joined', width: '150px', render: (row) => formatDate(row.joined) },
    { key: 'status', header: 'Status', width: '130px', render: (row) => <StatusChip status={row.status} /> },
  ];
  return <section className="seller-management buyer-management page"><header className="seller-management__header"><div><h1 className="seller-management__title">Buyers</h1><p className="seller-management__subtitle">All buyer accounts</p></div></header><DataTable columns={columns} rows={rows} rowKey={(row) => row.id ?? row.email} loading={loading} emptyTitle="No buyers yet" /></section>;
}
