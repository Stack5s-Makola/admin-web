import { useEffect, useState } from 'react';
import { Alert } from '../../../components/Alert';
import { DataTable, type Column } from '../../../components/DataTable';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { StatusChip } from '../../../components/StatusChip';
import { Thumb } from '../../../components/Thumb';
import { formatDate } from '../../../core/format';
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

const TABS = [
  { value: 'all', label: 'All sellers' },
  { value: 'pending', label: 'Pending verification' },
];

export function SellersPage() {
  const list = useAdminList<Seller>(({ page, limit, tab }) =>
    tab === 'pending'
      ? sellersService.listPending({ page, limit })
      : sellersService.list({ page, limit }),
  );

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
      key: 'business',
      header: 'Business',
      width: 'minmax(220px, 2fr)',
      render: (seller) => (
        <div className="cell-media">
          <Thumb src={seller.imageUrl} name={seller.businessName} shape="square" />
          <span className="cell-stack">
            <span className="cell-strong">{seller.businessName}</span>
            <span className="cell-sub">{seller.user.fullName}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Owner',
      width: 'minmax(180px, 1.5fr)',
      render: (seller) => <span className="cell-sub">{seller.user.email}</span>,
    },
    {
      key: 'status',
      header: 'Verification',
      width: '140px',
      render: (seller) => <StatusChip status={seller.status} />,
    },
    {
      key: 'account',
      header: 'Account',
      width: '120px',
      render: (seller) => <StatusChip status={seller.user.status} />,
    },
    {
      key: 'created',
      header: 'Registered',
      width: '130px',
      render: (seller) => <span className="cell-sub">{formatDate(seller.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '190px',
      align: 'right',
      render: (seller) => (
        <div className="row-actions" onClick={(event) => event.stopPropagation()}>
          {seller.status === 'pending' ? (
            <>
              <button
                type="button"
                className="button button--small button--dark"
                onClick={() => setAction({ kind: 'approve', seller })}
              >
                Approve
              </button>
              <button
                type="button"
                className="button button--small button--quiet"
                onClick={() => setAction({ kind: 'reject', seller })}
              >
                Reject
              </button>
            </>
          ) : seller.user.status === 'suspended' ? (
            <button
              type="button"
              className="button button--small button--dark"
              onClick={() => setAction({ kind: 'reinstate', seller })}
            >
              Reinstate
            </button>
          ) : (
            <button
              type="button"
              className="button button--small button--quiet"
              onClick={() => setAction({ kind: 'suspend', seller })}
            >
              Suspend
            </button>
          )}
        </div>
      ),
    },
  ];

  const target = action?.seller;

  return (
    <section className="page">
      <header className="page__head">
        <h1 className="page__title">Sellers</h1>
      </header>

      {notice && <Alert tone="success" message={notice} />}

      <nav className="tabs" aria-label="Filter sellers">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            className={list.tab === tab.value ? 'tab tab--active' : 'tab'}
            onClick={() => list.setTab(tab.value)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

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
