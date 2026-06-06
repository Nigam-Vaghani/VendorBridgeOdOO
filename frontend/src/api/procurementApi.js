import api from './axiosInstance';

export const getVendors = async () => {
  const { data } = await api.get('/procurement/vendors');
  return data;
};

export const getProcurementRFQs = async () => {
  const { data } = await api.get('/procurement/rfqs');
  return data;
};

export const createRFQ = async (rfqData) => {
  const { data } = await api.post('/procurement/rfqs', rfqData);
  return data;
};

export const getQuotationsByRFQ = async (rfqId) => {
  const { data } = await api.get(`/procurement/rfqs/${rfqId}/quotations`);
  return data;
};

export const initiateApproval = async (quotationId) => {
  const { data } = await api.post(`/procurement/quotations/${quotationId}/initiate_approval`);
  return data;
};

export const getApprovals = async () => {
  const { data } = await api.get('/procurement/approvals');
  return data;
};

export const approveRequest = async (approvalId) => {
  const { data } = await api.post(`/procurement/approvals/${approvalId}/approve`);
  return data;
};

export const rejectRequest = async (approvalId) => {
  const { data } = await api.post(`/procurement/approvals/${approvalId}/reject`);
  return data;
};

export const getPurchaseOrders = async () => {
  const { data } = await api.get('/procurement/purchase-orders');
  return data;
};

export const generateInvoice = async (poId) => {
  const { data } = await api.post(`/procurement/purchase-orders/${poId}/invoice`);
  return data;
};

export const getInvoices = async () => {
  const { data } = await api.get('/procurement/invoices');
  return data;
};

export const markInvoicePaid = async (invoiceId) => {
  const { data } = await api.post(`/procurement/invoices/${invoiceId}/pay`);
  return data;
};

export const getDashboardAnalytics = async () => {
  const { data } = await api.get('/procurement/analytics/dashboard');
  return data;
};

export const getFullAnalytics = async () => {
  const { data } = await api.get('/procurement/analytics/full');
  return data;
};

export const getActivityLogs = async (entityType = null) => {
  const url = entityType ? `/procurement/logs?entity_type=${entityType}` : '/procurement/logs';
  const { data } = await api.get(url);
  return data;
};
