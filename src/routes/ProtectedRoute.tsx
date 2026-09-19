import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../features/auth/hooks/useAuth';
import { paths } from './paths';

/** Guards every admin screen: signed in AND role ADMIN. */
export function ProtectedRoute() {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div className="page-loader">Loading…</div>;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={`${paths.login}?next=${encodeURIComponent(location.pathname)}`}
        replace
      />
    );
  }

  return <Outlet />;
}

/** Keeps a signed-in admin out of the login screen. */
export function PublicOnlyRoute() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return <div className="page-loader">Loading…</div>;
  }

  return isAuthenticated ? <Navigate to={paths.dashboard} replace /> : <Outlet />;
}
