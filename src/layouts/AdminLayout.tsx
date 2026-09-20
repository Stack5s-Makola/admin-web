import { Icon } from '@iconify/react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { Avatar } from '../components/Avatar';
import { Logo } from '../components/Logo';
import { useAuth } from '../features/auth/hooks/useAuth';
import { paths } from '../routes/paths';

/** Nav matches the Figma design: Dashboard, Sellers, Buyers, listings. */
const navItems = [
  { to: paths.dashboard, label: 'Dashboard', icon: 'grid' },
  { to: paths.sellers, label: 'Sellers', icon: 'store' },
  { to: paths.buyers, label: 'Buyers', icon: 'users' },
  { to: paths.listings, label: 'Listings', icon: 'tag' },
  { to: paths.settings, label: 'Settings', icon: 'settings' },
] as const;

const icons: Record<(typeof navItems)[number]['icon'], string> = {
  grid: 'hugeicons:dashboard-square-03',
  store: 'uil:money-withdraw',
  users: 'ci:users',
  tag: 'bx:purchase-tag',
  settings: 'mingcute:settings-3-fill',
};

const logoutIcon = 'basil:logout-solid';

function NavIcon({ name }: { name: (typeof navItems)[number]['icon'] }) {
  return <Icon className="admin-nav-link__icon" icon={icons[name]} width={18} aria-hidden="true" />;
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar__brand">
          <Logo />
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive ? 'admin-nav-link admin-nav-link--active' : 'admin-nav-link'
              }
            >
              <NavIcon name={item.icon} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/*
          Figma: card 252 x 106 (radius 15) with the marble artwork, and a 76px
          avatar straddling its top edge - half in, half out.
        */}
        <div className="admin-account">
          <div className="admin-account__card">
            <Avatar name={user?.email ?? 'Administrator'} />
            <button
              type="button"
              className="button button--accent button--block admin-account__logout"
              onClick={logout}
            >
              <Icon className="admin-account__logout-icon" icon={logoutIcon} width={18} aria-hidden="true" />
              Logout
            </button>
          </div>
        </div>
      </aside>

      <main className="admin-content">
        {location.pathname === paths.dashboard && (
          <header className="admin-topbar">
            <label className="admin-search">
              <Icon icon="basil:search-outline" width={24} aria-hidden="true" />
              <span className="sr-only">Search</span>
              <input type="search" placeholder="Search sellers..." aria-label="Search sellers" />
            </label>
            <button type="button" className="admin-notifications" aria-label="Notifications">
              <Icon icon="hugeicons:notification-01" width={28} aria-hidden="true" />
            </button>
          </header>
        )}
        <Outlet />
      </main>
    </div>
  );
}
