import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { Alert } from '../../../components/Alert';
import { ConfirmDialog } from '../../../components/ConfirmDialog';
import { DataTable, type Column } from '../../../components/DataTable';
import { StatusChip } from '../../../components/StatusChip';
import { config } from '../../../core/config';
import { formatDate } from '../../../core/format';
import { mockListings } from '../../../data/mock/listings';
import { useAdminList } from '../../../hooks/useAdminList';
import type { Listing, ListingStatus } from '../../../types/admin';
import { listingsService } from '../services/listings.service';

type Action = { kind: 'approve' | 'reject'; listing: Listing } | null;

interface ListingPresentation {
  price: string;
  description: string;
  category: string;
  sellerName: string;
  location: string;
}

function getListingPresentation(listing: Listing): ListingPresentation {
  if (!config.devMockData) {
    return {
      price: 'Price unavailable',
      description: 'No description provided.',
      category: 'Category unavailable',
      sellerName: listing.seller.businessName,
      location: 'Location unavailable',
    };
  }

  const details: Record<string, ListingPresentation> = {
    'Kente Fabric': {
      price: 'GHS 250.00',
      description: 'Quality handwoven Kente fabric suitable for traditional and contemporary wear.',
      category: 'Fashion',
      sellerName: "Ama's Fruits And Veges",
      location: 'Madina',
    },
    Tomatoes: {
      price: 'GHS 45.00',
      description: 'Fresh market tomatoes sourced from local growers.',
      category: 'Farm Product',
      sellerName: "Ama's Fruits And Veges",
      location: 'Madina',
    },
    'Refurbished Phone': {
      price: 'GHS 1,200.00',
      description: 'Tested refurbished phone in good working condition.',
      category: 'Electronics',
      sellerName: "Ama's Fruits And Veges",
      location: 'Madina',
    },
    Kente: {
      price: 'GHS 300.00',
      description: 'Traditional Kente textile with a bright woven pattern.',
      category: 'Fashion',
      sellerName: "Ama's Fruits And Veges",
      location: 'Madina',
    },
  };

  return details[listing.title] ?? {
    price: 'GHS 0.00',
    description: 'No description provided.',
    category: 'Farm Product',
    sellerName: listing.seller.businessName,
    location: 'Madina',
  };
}

const mockListingList = ({ page, limit, q }: { page: number; limit: number; q: string }) => {
  const query = q.trim().toLowerCase();
  const filtered = query
    ? mockListings.filter((listing) =>
        `${listing.title} ${listing.seller.user.fullName}`.toLowerCase().includes(query),
      )
    : mockListings;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return Promise.resolve({
    data,
    meta: { total: filtered.length, page, limit, pages: Math.max(1, Math.ceil(filtered.length / limit)) },
  });
};

export function ListingsPage() {
  const list = useAdminList<Listing>(({ page, limit, q, tab }) => {
    if (config.devMockData) {
      const result = mockListingList({ page: 1, limit: mockListings.length, q });
      return result.then((all) => {
        const filtered = tab === 'pending' ? all.data.filter((listing) => listing.status === 'pending') : all.data;
        const start = (page - 1) * limit;
        return {
          data: filtered.slice(start, start + limit),
          meta: { total: filtered.length, page, limit, pages: Math.max(1, Math.ceil(filtered.length / limit)) },
        };
      });
    }
    return tab === 'pending'
      ? listingsService.listPending({ page, limit })
      : listingsService.list({ page, limit });
  });

  const [selected, setSelected] = useState<Listing | null>(null);
  const [action, setAction] = useState<Action>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;
    const timer = setTimeout(() => setNotice(null), 4000);
    return () => clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!selected) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelected(null);
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [selected]);

  const runAction = async () => {
    if (!action) return;
    const { kind, listing } = action;

    if (config.devMockData) {
      const nextStatus: ListingStatus = kind === 'approve' ? 'approved' : 'rejected';
      const updated = { ...listing, status: nextStatus };
      list.updateRows((rows) => rows.map((row) => (row.id === listing.id ? updated : row)));
      setSelected((current) => (current?.id === listing.id ? updated : current));
      setNotice(`Listing ${kind === 'approve' ? 'approved' : 'rejected'}.`);
      setAction(null);
      return;
    }

    const result =
      kind === 'approve'
        ? await listingsService.approve(listing.id)
        : await listingsService.reject(listing.id);
    list.updateRows((rows) =>
      list.tab === 'pending'
        ? rows.filter((row) => row.id !== result.listing.id)
        : rows.map((row) => (row.id === result.listing.id ? result.listing : row)),
    );
    setSelected((current) => (current?.id === result.listing.id ? result.listing : current));
    setNotice(result.message);
    setAction(null);
  };

  const selectedPresentation = selected ? getListingPresentation(selected) : null;

  const columns: Column<Listing>[] = [
    {
      key: 'number',
      header: '',
      width: '36px',
      render: (listing) => <span className="seller-table__number">{mockListings.findIndex((row) => row.id === listing.id) + 1}.</span>,
    },
    {
      key: 'product',
      header: 'Product',
      width: 'minmax(180px, 1.3fr)',
      render: (listing) => <span className="seller-table__text">{listing.title}</span>,
    },
    {
      key: 'seller',
      header: 'Seller',
      width: 'minmax(150px, 1fr)',
      render: (listing) => <span className="seller-table__text">{listing.seller.user.fullName}</span>,
    },
    {
      key: 'location',
      header: 'Location',
      width: 'minmax(140px, 1fr)',
      render: (listing) => <span className="seller-table__text">{listing.seller.businessName}</span>,
    },
    {
      key: 'date',
      header: 'Date',
      width: 'minmax(160px, 1fr)',
      render: (listing) => (
        <span className="seller-table__text">{config.devMockData ? 'Sep 12,2026' : formatDate(listing.createdAt)}</span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      width: '140px',
      render: (listing) => (
        <StatusChip status={listing.status === 'approved' ? 'Approved' : listing.status} />
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      width: '100px',
      render: (listing) => (
        <button type="button" className="seller-table__view" onClick={() => setSelected(listing)}>
          View
        </button>
      ),
    },
  ];

  return (
    <section className="seller-management listing-management page">
      <header className="seller-management__header">
        <div>
          <h1 className="seller-management__title">Listing Management</h1>
          <p className="seller-management__subtitle">Manage listings and their approval status</p>
        </div>
        <label className="seller-management__search">
          <Icon icon="basil:search-outline" width={24} aria-hidden="true" />
          <span className="sr-only">Search listings</span>
          <input
            type="search"
            placeholder="Search listings..."
            value={list.searchInput}
            onChange={(event) => list.setSearch(event.target.value)}
            aria-label="Search listings"
          />
        </label>
      </header>

      {notice && <Alert tone="success" message={notice} />}

      <DataTable
        columns={columns}
        rows={list.rows}
        rowKey={(listing) => listing.id}
        loading={list.loading}
        error={list.error}
        onRetry={list.refetch}
        onRowClick={setSelected}
        meta={list.meta}
        onPageChange={list.setPage}
        emptyTitle={list.q ? 'No listings match that search' : 'No listings yet'}
      />

      {selected && (
        <div className="listing-modal-overlay" role="presentation" onMouseDown={() => setSelected(null)}>
          <section
            className="listing-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="listing-modal-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <header className="listing-modal__header">
              <div className="listing-modal__header-copy">
                <h2 id="listing-modal-title">Listing Details</h2>
              </div>
              <button type="button" className="listing-modal__close" aria-label="Close listing details" onClick={() => setSelected(null)}>
                <Icon icon="lucide:x" width={22} aria-hidden="true" />
              </button>
            </header>

            <div className="listing-modal__body">
              {selected.imageUrl ? (
                <img className="listing-modal__image" src={selected.imageUrl} alt="" />
              ) : (
                <div className="listing-modal__image listing-modal__image--placeholder" aria-hidden="true">
                  <Icon icon="bx:image" width={34} />
                </div>
              )}
              <div className="listing-modal__status"><StatusChip status={selected.status} /></div>
              <div className="listing-modal__item-heading">
                <h3>{selected.title}</h3>
                <strong>{selectedPresentation?.price}</strong>
              </div>
              <div className="listing-modal__field listing-modal__field--description">
                <span className="listing-modal__field-label">Description</span>
                <span className="listing-modal__field-value">{selectedPresentation?.description}</span>
              </div>
              <div className="listing-modal__field">
                <span className="listing-modal__field-label">Categories</span>
                <span className="listing-modal__field-value">{selectedPresentation?.category}</span>
              </div>
              <div className="listing-modal__seller">
                <div className="listing-modal__seller-avatar">
                  <Icon icon="solar:shop-2-bold" width={21} aria-hidden="true" />
                </div>
                <div>
                  <strong>{selectedPresentation?.sellerName}</strong>
                  <span>{selectedPresentation?.location}</span>
                </div>
              </div>
            </div>

            <footer className="listing-modal__actions">
              <button type="button" className="button button--danger" onClick={() => setAction({ kind: 'reject', listing: selected })}>Reject</button>
              <button type="button" className="button button--dark" onClick={() => setAction({ kind: 'approve', listing: selected })}>Approve</button>
            </footer>
          </section>
        </div>
      )}

      <ConfirmDialog
        open={!!action}
        title={`${action?.kind === 'approve' ? 'Approve' : 'Reject'} this listing?`}
        body={`${action?.listing.title ?? ''} will be updated in the listing queue.`}
        confirmLabel={action?.kind === 'approve' ? 'Approve listing' : 'Reject listing'}
        tone={action?.kind === 'approve' ? 'default' : 'danger'}
        onConfirm={runAction}
        onClose={() => setAction(null)}
      />
    </section>
  );
}
