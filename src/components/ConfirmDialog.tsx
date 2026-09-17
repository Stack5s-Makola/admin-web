import { useEffect, useRef, useState } from 'react';

/**
 * Confirmation for every state-changing admin action: approve, reject, suspend,
 * reinstate.
 *
 * No reason field: approve and reject take no body (Admin API contract, §6.4).
 * If a reason is added later, this is the one place to put it.
 *
 * The confirm button disables itself while the request is in flight, because
 * approve/reject are not idempotent-guarded - a double click would send two
 * PATCHes and the API would accept both.
 */

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  body?: string;
  confirmLabel: string;
  tone?: 'default' | 'danger';
  onConfirm: () => Promise<void>;
  onClose: () => void;
}

export function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  tone = 'default',
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) {
      setPending(false);
      setError(null);
      return;
    }

    confirmRef.current?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, pending, onClose]);

  if (!open) return null;

  const submit = async () => {
    if (pending) return;
    setPending(true);
    setError(null);
    try {
      await onConfirm();
      onClose();
    } catch (caught) {
      setError((caught as Error)?.message ?? 'The action could not be completed.');
      setPending(false);
    }
  };

  return (
    <div className="modal-overlay" role="presentation" onClick={() => !pending && onClose()}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id="confirm-title" className="modal__title">
          {title}
        </h2>
        {body && <p className="modal__body">{body}</p>}
        {error && <p className="modal__error">{error}</p>}

        <div className="modal__actions">
          <button type="button" className="button button--quiet" disabled={pending} onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            ref={confirmRef}
            className={tone === 'danger' ? 'button button--danger' : 'button button--dark'}
            disabled={pending}
            onClick={submit}
          >
            {pending ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
