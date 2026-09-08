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

const icons: Record<(typeof navItems)[number]['icon'], JSX.Element> = {
  grid: (
    <>
      <rect x="2.5" y="2.5" width="6" height="6" rx="1.5" />
      <rect x="11.5" y="2.5" width="6" height="6" rx="1.5" />
      <rect x="2.5" y="11.5" width="6" height="6" rx="1.5" />
      <rect x="11.5" y="11.5" width="6" height="6" rx="1.5" />
    </>
  ),
  store: (
    <>
      <path d="M3 7.5h14V16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7.5Z" />
      <path d="M3 7.5 4.5 3h11L17 7.5" />
    </>
  ),
  users: (
    <>
      <circle cx="8" cy="7" r="3" />
      <path d="M2.5 16c0-2.5 2.5-4 5.5-4s5.5 1.5 5.5 4" />
      <path d="M14 5.5a2.5 2.5 0 0 1 0 5" />
    </>
  ),
  pin: (
    <>
      <path d="M10 17s5.5-5 5.5-9a5.5 5.5 0 1 0-11 0c0 4 5.5 9 5.5 9Z" />
      <circle cx="10" cy="8" r="2" />
    </>
  ),
};

function NavIcon({ name }: { name: (typeof navItems)[number]['icon'] }) {
  return (
    <svg
      className="admin-nav-link__icon"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icons[name]}
    </svg>
  );
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
