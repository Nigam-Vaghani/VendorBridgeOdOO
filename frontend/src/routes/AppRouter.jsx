import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { ROLES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

import LoginPage from '../pages/Auth/LoginPage';
import SignupPage from '../pages/Auth/SignupPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';

// Placeholders for other pages
const Dashboard = () => <div>Dashboard Content</div>;
const Vendors = () => <div>Vendors List</div>;
const RFQs = () => <div>RFQs and Tenders</div>;
const Quotations = () => <div>Your Quotations</div>;
const Approvals = () => <div>Pending Approvals</div>;
const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-4xl font-bold text-red-600 mb-2">403</h1>
    <p className="text-xl text-slate-600 font-semibold mb-4">Unauthorized Access</p>
    <p className="text-slate-500 mb-6 text-center max-w-md">
      You don't have permission to view this page. If you believe this is an error, please contact your administrator.
    </p>
  </div>
);

const HomeRedirect = () => {
  const { user } = useAuth();
  
  if (!user) return <Navigate to="/login" replace />;
  
  if (user.role === ROLES.VENDOR) {
    return <Navigate to="/rfqs" replace />;
  } else if (user.role === ROLES.MANAGER) {
    return <Navigate to="/approvals" replace />;
  } else {
    return <Navigate to="/dashboard" replace />;
  }
};

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/unauthorized" element={<Unauthorized />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomeRedirect />} />
          
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
