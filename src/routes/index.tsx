import { Navigate, Route, Routes } from 'react-router-dom';
import { PlaceholderPage } from '../components/PlaceholderPage';
import { ForgotPasswordPage } from '../features/auth/pages/ForgotPasswordPage';
import { LoginPage } from '../features/auth/pages/LoginPage';
import { ResetPasswordPage } from '../features/auth/pages/ResetPasswordPage';
import { VerifyOtpPage } from '../features/auth/pages/VerifyOtpPage';
import { BuyersPage } from '../features/buyers/pages/BuyersPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { MapPage } from '../features/map/pages/MapPage';
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
          <Route path={paths.verifyOtp} element={<VerifyOtpPage />} />
          <Route path={paths.forgotPassword} element={<ForgotPasswordPage />} />
          <Route path={paths.resetPassword} element={<ResetPasswordPage />} />
        </Route>
      </Route>

      {/* Admin only */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={paths.dashboard} element={<DashboardPage />} />
          <Route path={paths.sellers} element={<SellersPage />} />
          <Route path={paths.buyers} element={<BuyersPage />} />
          <Route path={paths.map} element={<MapPage />} />
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
