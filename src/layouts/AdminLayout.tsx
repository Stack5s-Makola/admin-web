import { Icon } from '@iconify/react';
import { NavLink, Outlet } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { useAuth } from '../features/auth/hooks/useAuth';
import { paths } from '../routes/paths';

/** Nav matches the Figma design: Dashboard, Sellers, Buyers, Map. */
const navItems = [
  { to: paths.dashboard, label: 'Dashboard', icon: 'grid' },
  { to: paths.sellers, label: 'Sellers', icon: 'store' },
  { to: paths.buyers, label: 'Buyers', icon: 'users' },
  { to: paths.map, label: 'Map', icon: 'pin' },
] as const;

const icons: Record<(typeof navItems)[number]['icon'], string> = {
  grid: 'hugeicons:dashboard-square-03',
  store: 'uil:money-withdraw',
  users: 'ci:users',
  pin: 'f7:map-pin-ellipse',
};

const logoutIcon = 'basil:logout-solid';

function NavIcon({ name }: { name: (typeof navItems)[number]['icon'] }) {
  return <Icon className="admin-nav-link__icon" icon={icons[name]} width={18} aria-hidden="true" />;
}

export function AdminLayout() {
  const { user, logout } = useAuth();
  const initials = (user?.name ?? 'A')
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

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

        <div className="admin-account">
          <div className="admin-account__card">
            <span className="admin-account__avatar" aria-hidden="true">
              {initials}
            </span>
            <span className="admin-account__name">{user?.name ?? 'Administrator'}</span>
          </div>
          <button type="button" className="button button--accent button--block" onClick={logout}>
            <Icon className="admin-account__logout-icon" icon={logoutIcon} width={18} aria-hidden="true" />
            Logout
          </button>
        </div>
      </aside>

      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}
