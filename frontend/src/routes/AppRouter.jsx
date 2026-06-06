import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { ROLES } from '../utils/constants';

import LoginPage from '../pages/Auth/LoginPage';
import SignupPage from '../pages/Auth/SignupPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';

import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Vendors } from '../pages/Vendors/Vendors';
import { RFQs } from '../pages/RFQs/RFQs';
import { Quotations } from '../pages/Quotations/Quotations';
import { QuotationComparison } from '../pages/Quotations/QuotationComparison';
import { Approvals } from '../pages/Approvals/Approvals';
import { Invoices } from '../pages/Invoices/Invoices';
import { ActivityLogs } from '../pages/Logs/ActivityLogs';
import { PurchaseOrders } from '../pages/PurchaseOrders/PurchaseOrders';
import { Analytics } from '../pages/Analytics/Analytics';

// Placeholders for other pages
const Unauthorized = () => <div className="p-10 text-red-600">Unauthorized Access</div>;

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER, ROLES.VENDOR]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rfqs" element={<RFQs />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/invoices" element={<Invoices />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER]} />}>
            <Route path="/vendors" element={<Vendors />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER, ROLES.VENDOR]} />}>
            <Route path="/quotations" element={<Quotations />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER]} />}>
            <Route path="/compare-quotes" element={<QuotationComparison />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/logs" element={<ActivityLogs />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};
