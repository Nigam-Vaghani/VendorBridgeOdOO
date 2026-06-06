import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';
import { AppLayout } from '../components/layout/AppLayout';
import { ROLES } from '../utils/constants';
import { useAuth } from '../hooks/useAuth';

import LoginPage from '../pages/Auth/LoginPage';
import SignupPage from '../pages/Auth/SignupPage';
import ForgotPasswordPage from '../pages/Auth/ForgotPasswordPage';

import { Dashboard } from '../pages/Dashboard/Dashboard';
import { Vendors } from '../pages/Vendors/Vendors';
import VendorForm from '../components/vendors/VendorForm';
import VendorDetail from '../components/vendors/VendorDetail';
import { RFQs } from '../pages/RFQs/RFQs';
import RFQForm from '../components/rfqs/RFQForm';
import RFQDetail from '../components/rfqs/RFQDetail';
import { Quotations } from '../pages/Quotations/Quotations';
import QuotationForm from '../components/quotations/QuotationForm';
import QuotationDetail from '../components/quotations/QuotationDetail';
import { QuotationComparison } from '../pages/Quotations/QuotationComparison';
import { Approvals } from '../pages/Approvals/Approvals';
import { Invoices } from '../pages/Invoices/Invoices';
import { ActivityLogs } from '../pages/Logs/ActivityLogs';
import { PurchaseOrders } from '../pages/PurchaseOrders/PurchaseOrders';
import { Analytics } from '../pages/Analytics/Analytics';

// Home Redirect logic based on roles
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

const Unauthorized = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh]">
    <h1 className="text-4xl font-bold text-red-600 mb-2">403</h1>
    <p className="text-xl text-slate-600 font-semibold mb-4">Unauthorized Access</p>
    <p className="text-slate-500 mb-6 text-center max-w-md">
      You don't have permission to view this page. If you believe this is an error, please contact your administrator.
    </p>
  </div>
);

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
          
          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER, ROLES.VENDOR]} />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/rfqs" element={<RFQs />} />
            <Route path="/rfqs/:id" element={<RFQDetail />} />
            <Route path="/purchase-orders" element={<PurchaseOrders />} />
            <Route path="/invoices" element={<Invoices />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER]} />}>
            <Route path="/rfqs/new" element={<RFQForm />} />
            <Route path="/rfqs/:id/edit" element={<RFQForm />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER]} />}>
            <Route path="/vendors" element={<Vendors />} />
            <Route path="/vendors/new" element={<VendorForm />} />
            <Route path="/vendors/:id/edit" element={<VendorForm />} />
            <Route path="/vendors/:id" element={<VendorDetail />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER, ROLES.VENDOR]} />}>
            <Route path="/quotations" element={<Quotations />} />
            <Route path="/quotations/:id" element={<QuotationDetail />} />
          </Route>
          
          <Route element={<RoleRoute roles={[ROLES.VENDOR]} />}>
            <Route path="/quotations/new/:rfqId" element={<QuotationForm />} />
            <Route path="/quotations/:id/edit" element={<QuotationForm />} />
          </Route>

          <Route element={<RoleRoute roles={[ROLES.ADMIN, ROLES.OFFICER, ROLES.MANAGER]} />}>
            <Route path="/rfqs/:rfqId/compare" element={<QuotationComparison />} />
            <Route path="/approvals" element={<Approvals />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/logs" element={<ActivityLogs />} />
          </Route>
        </Route>
      </Route>
    </Routes>
  );
};
