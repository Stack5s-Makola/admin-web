import { useEffect, type ReactNode } from 'react';

/**
 * Right-hand detail panel. The table keeps its place behind it, so an admin
 * working through the verification queue doesn't lose their scroll position.
 */

interface DrawerProps {
  open: boolean;
  title: string;
  subtitle?: ReactNode;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Drawer({ open, title, subtitle, onClose, children, footer }: DrawerProps) {
  useEffect(() => {
    if (!open) return;

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="drawer-overlay" role="presentation" onClick={onClose}>
      <aside
        className="drawer"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(event) => event.stopPropagation()}
      >
        <header className="drawer__head">
          <div>
            <h2 className="drawer__title">{title}</h2>
            {subtitle && <div className="drawer__subtitle">{subtitle}</div>}
          </div>
          <button type="button" className="drawer__close" onClick={onClose} aria-label="Close">
            &times;
          </button>
        </header>

        <div className="drawer__body">{children}</div>

        {footer && <footer className="drawer__foot">{footer}</footer>}
      </aside>
    </div>
  );
}

export function DetailRow({ label, children }: { label: string; children?: ReactNode }) {
  return (
    <div className="detail-row">
      <span className="detail-row__label">{label}</span>
      <span className="detail-row__value">{children ?? '—'}</span>
    </div>
  );
}
