/** Small display helpers shared by the admin screens. */

/** ISO timestamp -> "14 Sep 2026". Returns an em dash for missing values. */
export function formatDate(iso?: string | null): string {
  if (!iso) return '—';
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}
