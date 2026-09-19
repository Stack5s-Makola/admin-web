import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Alert } from '../../../components/Alert';
import { DataTable, type Column } from '../../../components/DataTable';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { StatusChip } from '../../../components/StatusChip';
import { config } from '../../../core/config';
import { mockSellers } from '../../../data/mock/sellers';
import { useAdminList } from '../../../hooks/useAdminList';
import type { Seller } from '../../../types/admin';
import { usersService } from '../../buyers/services/users.service';
import { sellersService } from '../services/sellers.service';
import { SellerDetail } from '../components/SellerDetail';

/**
 * Seller Management (Week 2, Assignment 1).
 *
 * Two tabs, because those are the two endpoints that exist: all sellers and the
 * verification queue. There is no status filter or search on /admin/sellers in
 * the contract - a box that only filtered the current page would lie about the
 * totals, so it is left out until the API supports it.
 *
 * Suspension is not a seller endpoint: it goes through the owning user account
 * (usersService.setStatus on seller.user.id).
 */

type Action =
  | { kind: 'approve' | 'reject' | 'suspend' | 'reinstate'; seller: Seller }
  | null;

const mockSellerList = ({ page, limit, q }: { page: number; limit: number; q: string }) => {
  const query = q.trim().toLowerCase();
  const filtered = query
    ? mockSellers.filter((seller) =>
        `${seller.user.fullName} ${seller.businessName} Madina`.toLowerCase().includes(query),
      )
    : mockSellers;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return Promise.resolve({
    data,
    meta: { total: filtered.length, page, limit, pages: Math.max(1, Math.ceil(filtered.length / limit)) },
  });
};

export function SellersPage() {
  const list = useAdminList<Seller>(({ page, limit, q, tab }) => {
    if (config.devMockData) {
      return mockSellerList({ page, limit, q }).then((result) => ({
        ...result,
        data: tab === 'pending' ? result.data.filter((seller) => seller.status === 'pending') : result.data,
      }));
    }
    return tab === 'pending'
      ? sellersService.listPending({ page, limit })
      : sellersService.list({ page, limit });
  });

  const [selected, setSelected] = useState<Seller | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const runAction = async () => {
    if (!action) return;
    const { kind, seller } = action;

    if (config.devMockData) {
      const nextStatus = kind === 'approve' ? 'approved' : kind === 'reject' ? 'rejected' : seller.status;
      const updated = nextStatus === seller.status ? seller : { ...seller, status: nextStatus };
      list.updateRows((rows) => rows.map((row) => (row.id === seller.id ? updated : row)));
      setSelected((current) => (current?.id === seller.id ? updated : current));
      setNotice(`Seller ${kind === 'approve' ? 'approved' : kind === 'reject' ? 'rejected' : 'updated'}.`);
      setAction(null);
      return;
    }

    if (kind === 'approve' || kind === 'reject') {
      const result =
        kind === 'approve'
          ? await sellersService.approve(seller.id)
          : await sellersService.reject(seller.id);

      setNotice(result.message);
      // On the verification queue the row no longer belongs; elsewhere it just
      // changes status. Either way the response is the new truth - no refetch.
      list.updateRows((rows) =>
        list.tab === 'pending'
          ? rows.filter((row) => row.id !== result.seller.id)
          : rows.map((row) => (row.id === result.seller.id ? result.seller : row)),
      );
      setSelected((current) => (current?.id === result.seller.id ? result.seller : current));
      return;
    }

    const { user, message } = await usersService.setStatus(
      seller.user.id,
      kind === 'suspend' ? 'suspended' : 'active',
    );
    setNotice(message);
    list.updateRows((rows) =>
      rows.map((row) => (row.id === seller.id ? { ...row, user } : row)),
    );
    setSelected((current) => (current?.id === seller.id ? { ...current, user } : current));
  };

  const columns: Column<Seller>[] = [
    {
      key: 'number',
      header: '',
      width: '36px',
      render: (seller) => <span className="seller-table__number">{mockSellers.findIndex((row) => row.id === seller.id) + 1}.</span>,
    },
    {
      key: 'seller',
      header: 'Seller',
      width: 'minmax(150px, 1fr)',
      render: (seller) => (
        <span className="seller-table__text">{seller.user.fullName}</span>
      ),
    },
    {
      key: 'business',
      header: 'Business Name',
      width: 'minmax(180px, 1.35fr)',
      render: (seller) => <span className="seller-table__text">{seller.businessName}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      width: 'minmax(140px, 1fr)',
      render: () => <span className="seller-table__text">Madina</span>,
    },
    {
      key: 'status',
      header: 'Status',
      width: '140px',
      render: (seller) => <StatusChip status={seller.status === 'approved' ? 'Verified' : seller.status} />,
    },
    {
      key: 'actions',
      header: 'Action',
      width: '100px',
      render: (seller) => (
        <button type="button" className="seller-table__view" onClick={() => setSelected(seller)}>
          View
        </button>
      ),
    },
  ];

  const target = action?.seller;

  return (
    <section className="seller-management page">
      <header className="seller-management__header">
        <h1 className="seller-management__title">Seller's Management</h1>
        <p className="seller-management__subtitle">Manage seller and their verification status</p>
        <label className="seller-management__search">
          <Icon icon="basil:search-outline" width={24} aria-hidden="true" />
          <span className="sr-only">Search sellers</span>
          <input
            type="search"
            placeholder="Search sellers..."
            value={list.searchInput}
            onChange={(event) => list.setSearch(event.target.value)}
            aria-label="Search sellers"
          />
        </label>
      </header>

      {notice && <Alert tone="success" message={notice} />}

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(seller) => seller.id}
        loading={list.loading}
        error={list.error}
        onRetry={list.refetch}
        onRowClick={setSelected}
        meta={list.meta}
        onPageChange={list.setPage}
        emptyTitle={
          list.tab === 'pending' ? 'Nothing waiting on verification' : 'No sellers yet'
        }
        emptyNote={
          list.tab === 'pending'
            ? 'New seller profiles appear here as soon as they register.'
            : undefined
        }
      />

      <SellerDetail
        seller={selected}
        onClose={() => setSelected(null)}
        onApprove={(seller) => setAction({ kind: 'approve', seller })}
        onReject={(seller) => setAction({ kind: 'reject', seller })}
        onSuspend={(seller) => setAction({ kind: 'suspend', seller })}
        onReinstate={(seller) => setAction({ kind: 'reinstate', seller })}
      />

      <ConfirmDialog
        open={action?.kind === 'approve'}
        title="Approve this seller?"
        body={`${target?.businessName ?? ''} becomes a verified seller and their listings can go live.`}
        confirmLabel="Approve seller"
        onConfirm={runAction}
        onClose={() => setAction(null)}
      />

      <ConfirmDialog
        open={action?.kind === 'reject'}
        title="Reject this seller?"
        body={`${target?.businessName ?? ''} will not be verified. They keep their account.`}
        confirmLabel="Reject seller"
        tone="danger"
        onConfirm={runAction}
        onClose={() => setAction(null)}
      />

      <ConfirmDialog
        open={action?.kind === 'suspend'}
        title="Suspend this account?"
        body={`${target?.user.fullName ?? ''} will not be able to sign in until the account is reinstated.`}
        confirmLabel="Suspend account"
        tone="danger"
        onConfirm={runAction}
        onClose={() => setAction(null)}
      />

      <ConfirmDialog
        open={action?.kind === 'reinstate'}
        title="Reinstate this account?"
        body={`${target?.user.fullName ?? ''} regains access immediately.`}
        confirmLabel="Reinstate account"
        onConfirm={runAction}
        onClose={() => setAction(null)}
      />
    </section>
  );
}
