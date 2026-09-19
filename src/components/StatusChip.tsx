/**
 * Status pills.
 *
 * Statuses are lowercase and roles are UPPERCASE (Admin API contract, §5).
 * The axes stay in separate columns - a seller's verification status and their
 * account status are different things and merging them hides moderation state.
 *
 *   SellerStatus   pending | approved | rejected
 *   ListingStatus  pending | approved | rejected | removed
 *   ReportStatus   open    | resolved | dismissed
 *   UserStatus     active  | suspended
 */

type Tone = 'ok' | 'warn' | 'bad' | 'muted' | 'info';

const TONES: Record<string, Tone> = {
  pending: 'warn',
  approved: 'ok',
  rejected: 'bad',
  // "removed" is a published listing taken down - not the same as "rejected",
  // which never went live. Different tone on purpose.
  removed: 'muted',
  open: 'warn',
  resolved: 'ok',
  dismissed: 'muted',
  active: 'ok',
  suspended: 'warn',
  BUYER: 'info',
  SELLER: 'info',
  ADMIN: 'info',
  Verified: 'ok',
  Active: 'ok',
  Inactive: 'bad',
  Approved: 'ok',
  Pending: 'warn',
  Rejected: 'bad',
};

function toLabel(status: string): string {
  if (status === status.toUpperCase()) return status;
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function StatusChip({ status }: { status?: string | null }) {
  if (!status) return <span className="chip chip--muted">Unknown</span>;
  return <span className={`chip chip--${TONES[status] ?? 'muted'}`}>{toLabel(status)}</span>;
}
