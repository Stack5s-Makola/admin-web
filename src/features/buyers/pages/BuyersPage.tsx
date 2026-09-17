import { useEffect, useState } from 'react';
import { Alert } from '../../../components/Alert';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DataTable, type Column } from '../../../components/DataTable';
import { DetailRow, Drawer } from '../../../components/Drawer';
import { StatusChip } from '../../../components/StatusChip';
import { Thumb } from '../../../components/Thumb';
import { formatDate } from '../../../core/format';
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
  const list = useAdminList<User>(({ page, limit, q }) =>
    q
      ? usersService.search({ q, role: 'BUYER', page, limit })
      : usersService.listBuyers({ page, limit }),
  );

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
    const { user, message } = await usersService.setStatus(action.user.id, action.next);
    setNotice(message);
    // The PATCH returns the updated record, so patch the row rather than refetch.
    list.updateRows((rows) => rows.map((row) => (row.id === user.id ? user : row)));
    setSelected((current) => (current?.id === user.id ? user : current));
  };

  const columns: Column<User>[] = [
    {
      key: 'buyer',
      header: 'Buyer',
      width: 'minmax(220px, 2fr)',
      render: (user) => (
        <div className="cell-media">
          <Thumb src={user.imageUrl} name={user.fullName} />
          <span className="cell-stack">
            <span className="cell-strong">{user.fullName}</span>
            <span className="cell-sub">{user.email}</span>
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'Account',
      width: '130px',
      render: (user) => <StatusChip status={user.status} />,
    },
    {
      key: 'joined',
      header: 'Joined',
      width: '140px',
      render: (user) => <span className="cell-sub">{formatDate(user.createdAt)}</span>,
    },
    {
      key: 'actions',
      header: '',
      width: '150px',
      align: 'right',
      render: (user) => (
        <div className="row-actions" onClick={(event) => event.stopPropagation()}>
          {user.status === 'suspended' ? (
            <button
              type="button"
              className="button button--small button--dark"
              onClick={() => setAction({ user, next: 'active' })}
            >
              Reinstate
            </button>
          ) : (
            <button
              type="button"
              className="button button--small button--quiet"
              onClick={() => setAction({ user, next: 'suspended' })}
            >
              Suspend
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <section className="page">
      <header className="page__head">
        <h1 className="page__title">Buyers</h1>
        <input
          className="search"
          type="search"
          placeholder="Search name or email"
          value={list.searchInput}
          onChange={(event) => list.setSearch(event.target.value)}
          aria-label="Search buyers"
        />
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
