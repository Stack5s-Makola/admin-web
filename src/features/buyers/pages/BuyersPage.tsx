import { useEffect, useState } from 'react';
import { Icon } from '@iconify/react';
import { Alert } from '../../../components/Alert';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DataTable, type Column } from '../../../components/DataTable';
import { DetailRow, Drawer } from '../../../components/Drawer';
import { StatusChip } from '../../../components/StatusChip';
import { Thumb } from '../../../components/Thumb';
import { formatDate } from '../../../core/format';
import { config } from '../../../core/config';
import { mockBuyers } from '../../../data/mock/buyers';
import { useAdminList } from '../../../hooks/useAdminList';
import type { User } from '../../../types/user';
import { usersService } from '../services/users.service';

/**
 * Buyer Management (Week 2, Assignment 1).
 *
 * Intentionally thin - view, search, open a profile, suspend or reinstate.
 *
 * Two endpoints back it: /admin/buyers for the list (already filtered to role
 * BUYER, and it rejects a `role` param) and /admin/users/search when there's a
 * search term, which does accept `role`. There is no status filter in the
 * contract, so there are no status tabs - a client-side filter would disagree
 * with the pagination totals.
 */

type Action = { user: User; next: 'suspended' | 'active' } | null;

export function BuyersPage() {
  const list = useAdminList<User>(({ page, limit, q }) => {
    if (config.devMockData) {
      const query = q.trim().toLowerCase();
      const filtered = query
        ? mockBuyers.filter((buyer) => `${buyer.fullName} ${buyer.email} Madina`.toLowerCase().includes(query))
        : mockBuyers;
      const start = (page - 1) * limit;
      const data = filtered.slice(start, start + limit);
      return Promise.resolve({
        data,
        meta: { total: filtered.length, page, limit, pages: Math.max(1, Math.ceil(filtered.length / limit)) },
      });
    }
    return q
      ? usersService.search({ q, role: 'BUYER', page, limit })
      : usersService.listBuyers({ page, limit });
  });

  const [selected, setSelected] = useState<User | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  const runAction = async () => {
    if (!action) return;
    if (config.devMockData) {
      const updated = { ...action.user, status: action.next };
      list.updateRows((rows) => rows.map((row) => (row.id === updated.id ? updated : row)));
      setSelected((current) => (current?.id === updated.id ? updated : current));
      setNotice(`Buyer ${action.next === 'active' ? 'reinstated' : 'suspended'}.`);
      setAction(null);
      return;
    }
    const { user, message } = await usersService.setStatus(action.user.id, action.next);
    setNotice(message);
    // The PATCH returns the updated record, so patch the row rather than refetch.
    list.updateRows((rows) => rows.map((row) => (row.id === user.id ? user : row)));
    setSelected((current) => (current?.id === user.id ? user : current));
  };

  const columns: Column<User>[] = [
    {
      key: 'number',
      header: '',
      width: '36px',
      render: (user) => <span className="seller-table__number">{mockBuyers.findIndex((row) => row.id === user.id) + 1}.</span>,
    },
    {
      key: 'buyer',
      header: 'Buyer',
      width: 'minmax(180px, 1fr)',
      render: (user) => <span className="seller-table__text">{user.fullName}</span>,
    },
    {
      key: 'phone',
      header: 'Phone Number',
      width: 'minmax(220px, 1.35fr)',
      render: () => <span className="seller-table__text">024456906</span>,
    },
    {
      key: 'joined',
      header: 'Joined',
      width: 'minmax(140px, 1fr)',
      render: (user) => (
        <span className="seller-table__text">
          {config.devMockData ? 'Sep 12,2026' : formatDate(user.createdAt)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '140px',
      render: (user) => <StatusChip status={user.status === 'active' ? 'Active' : 'Inactive'} />,
    },
    {
      key: 'actions',
      header: 'Action',
      width: '100px',
      render: (user) => (
        <button type="button" className="seller-table__view" onClick={() => setSelected(user)}>
          View
        </button>
      ),
    },
  ];

  return (
    <section className="seller-management buyer-management page">
      <header className="seller-management__header">
        <div>
          <h1 className="seller-management__title">Buyer's Management</h1>
          <p className="seller-management__subtitle">Manage buyer and their account status</p>
        </div>
        <label className="seller-management__search">
          <Icon icon="basil:search-outline" width={24} aria-hidden="true" />
          <span className="sr-only">Search buyers</span>
          <input
            type="search"
            placeholder="Search buyers..."
          value={list.searchInput}
          onChange={(event) => list.setSearch(event.target.value)}
          aria-label="Search buyers"
          />
        </label>
      </header>

      {notice && <Alert tone="success" message={notice} />}

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(user) => user.id}
        loading={list.loading}
        error={list.error}
        onRetry={list.refetch}
        onRowClick={setSelected}
        meta={list.meta}
        onPageChange={list.setPage}
        emptyTitle={list.q ? 'No buyers match that search' : 'No buyers yet'}
        emptyNote={list.q ? 'Try part of a name or an email address.' : undefined}
      />

      {selected && (
        <Drawer
          open
          title={selected.fullName}
          subtitle={<StatusChip status={selected.status} />}
          onClose={() => setSelected(null)}
          footer={
            <div className="drawer__actions">
              {selected.status === 'suspended' ? (
                <button
                  type="button"
                  className="button button--dark"
                  onClick={() => setAction({ user: selected, next: 'active' })}
                >
                  Reinstate account
                </button>
              ) : (
                <button
                  type="button"
                  className="button button--danger"
                  onClick={() => setAction({ user: selected, next: 'suspended' })}
                >
                  Suspend account
                </button>
              )}
            </div>
          }
        >
          <div className="drawer__media">
            <Thumb src={selected.imageUrl} name={selected.fullName} />
          </div>

          <DetailRow label="Email">{selected.email}</DetailRow>
          <DetailRow label="Role">
            <StatusChip status={selected.role} />
          </DetailRow>
          <DetailRow label="Account">
            <StatusChip status={selected.status} />
          </DetailRow>
          <DetailRow label="Joined">{formatDate(selected.createdAt)}</DetailRow>
        </Drawer>
      )}

      <ConfirmDialog
        open={action?.next === 'suspended'}
        title="Suspend this buyer?"
        body={`${action?.user.fullName ?? ''} will not be able to sign in until the account is reinstated.`}
        confirmLabel="Suspend account"
        tone="danger"
        onConfirm={runAction}
        onClose={() => setAction(null)}
      />

      <ConfirmDialog
        open={action?.next === 'active'}
        title="Reinstate this buyer?"
        body={`${action?.user.fullName ?? ''} regains access immediately.`}
        confirmLabel="Reinstate account"
        onConfirm={runAction}
        onClose={() => setAction(null)}
      />
    </section>
  );
}
