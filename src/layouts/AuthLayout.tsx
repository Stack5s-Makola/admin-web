import { Outlet } from 'react-router-dom';
import artwork from '../assets/auth-artwork.png';

/** Split card: brand panel on the left, form on the right. */
export function AuthLayout() {
  return (
    <div className="auth-layout">
      <div className="auth-card">
        <aside className="auth-brand">
          <img className="auth-brand__artwork" src={artwork} alt="" aria-hidden="true" />
          <div className="auth-brand__text">
            <p className="auth-brand__name">Makola</p>
            <p className="auth-brand__role">Admin dashboard</p>
          </div>
        </aside>

        <section className="auth-panel">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
