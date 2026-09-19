import { Navigate, Route, Routes } from 'react-router-dom';
import { PlaceholderPage } from '../components/PlaceholderPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { BuyersPage } from '../features/buyers/pages/BuyersPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { ListingsPage } from '../features/listings/pages/ListingsPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';
import { SellersPage } from '../features/sellers/pages/SellersPage';
import { AdminLayout } from '../layouts/AdminLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { ProtectedRoute, PublicOnlyRoute } from './ProtectedRoute';
import { paths } from './paths';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicOnlyRoute />}>
        <Route element={<AuthLayout />}>
          <Route path={paths.login} element={<LoginPage />} />
        </Route>
      </Route>

      {/* Admin only */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={paths.dashboard} element={<DashboardPage />} />
          <Route path={paths.sellers} element={<SellersPage />} />
          <Route path={paths.buyers} element={<BuyersPage />} />
          <Route path={paths.settings} element={<SettingsPage />} />
          <Route path={paths.listings} element={<ListingsPage />} />
          <Route path={paths.listingsPending} element={<ListingsPage />} />
        </Route>
      </Route>

      <Route path="/" element={<Navigate to={paths.dashboard} replace />} />
      <Route
        path="*"
        element={<PlaceholderPage title="Page not found" note="That page does not exist." />}
      />
    </Routes>
  );
}
