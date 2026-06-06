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

// Placeholders for other pages
const Quotations = () => <div>Quotations</div>;
const Approvals = () => <div>Approvals</div>;
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
          
          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/vendors" element={<Vendors />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER, ROLES.VENDOR]} />}>
            <Route path="/rfqs" element={<RFQs />} />
            <Route path="/purchase-orders" element={<div>Purchase Orders</div>} />
            <Route path="/invoices" element={<div>Invoices</div>} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.OFFICER, ROLES.VENDOR]} />}>
            <Route path="/quotations" element={<Quotations />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.MANAGER]} />}>
            <Route path="/approvals" element={<Approvals />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER]} />}>
            <Route path="/analytics" element={<div>Analytics</div>} />
            <Route path="/logs" element={<div>Activity Logs</div>} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};
