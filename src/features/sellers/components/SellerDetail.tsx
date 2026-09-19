import { DetailRow, Drawer } from '../../../components/Drawer';
import { StatusChip } from '../../../components/StatusChip';
import { Thumb } from '../../../components/Thumb';
import { formatDate } from '../../../core/format';
import type { Seller } from '../../../types/admin';

/**
 * Seller detail panel.
 *
 * No extra fetch: GET /admin/sellers/:id returns the same Seller shape the list
 * already gave us (contract §6.4), so the row data is the whole record. The
 * panel earns its place by showing the nested owner account, which the table
 * only summarises.
 */

interface SellerDetailProps {
  seller: Seller | null;
  onClose: () => void;
  onApprove: (seller: Seller) => void;
  onReject: (seller: Seller) => void;
  onSuspend: (seller: Seller) => void;
  onReinstate: (seller: Seller) => void;
}

export function SellerDetail({
  seller,
  onClose,
  onApprove,
  onReject,
  onSuspend,
  onReinstate,
}: SellerDetailProps) {
  if (!seller) return null;

  const isPending = seller.status === 'pending';
  const isSuspended = seller.user.status === 'suspended';

  return (
    <Drawer
      open
      title={seller.businessName}
      subtitle={
        <span className="drawer__chips">
          <StatusChip status={seller.status} />
          <StatusChip status={seller.user.status} />
        </span>
      }
      onClose={onClose}
      footer={
        <div className="drawer__actions">
          {isPending && (
            <>
              <button
                type="button"
                className="button button--dark"
                onClick={() => onApprove(seller)}
              >
                Approve
              </button>
              <button
                type="button"
                className="button button--danger"
                onClick={() => onReject(seller)}
              >
                Reject
              </button>
            </>
          )}
          {isSuspended ? (
            <button
              type="button"
              className="button button--quiet"
              onClick={() => onReinstate(seller)}
            >
              Reinstate account
            </button>
          ) : (
            <button
              type="button"
              className="button button--quiet"
              onClick={() => onSuspend(seller)}
            >
              Suspend account
            </button>
          )}
        </div>
      }
    >
      <div className="drawer__media">
        <Thumb src={seller.imageUrl} name={seller.businessName} shape="square" />
      </div>

      <h3 className="drawer__section">Business</h3>
      <DetailRow label="Name">{seller.businessName}</DetailRow>
      <DetailRow label="Verification">
        <StatusChip status={seller.status} />
      </DetailRow>
      <DetailRow label="Registered">{formatDate(seller.createdAt)}</DetailRow>

      <h3 className="drawer__section">Owner</h3>
      <DetailRow label="Name">{seller.user.fullName}</DetailRow>
      <DetailRow label="Email">{seller.user.email}</DetailRow>
      <DetailRow label="Role">
        <StatusChip status={seller.user.role} />
      </DetailRow>
      <DetailRow label="Account">
        <StatusChip status={seller.user.status} />
      </DetailRow>
      <DetailRow label="Joined">{formatDate(seller.user.createdAt)}</DetailRow>
    </Drawer>
  );
}
