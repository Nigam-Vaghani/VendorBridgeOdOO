import api from './axiosInstance';

export const getDashboardStats = async () => {
  const { data } = await api.get('/vendor/dashboard');
  return data;
};

export const getRFQs = async () => {
  const { data } = await api.get('/vendor/rfqs');
  return data;
};

export const getQuotations = async () => {
  const { data } = await api.get('/vendor/quotations');
  return data;
};

export const createQuotation = async (quotationData) => {
  const { data } = await api.post('/vendor/quotations', quotationData);
  return data;
};

export const getPOs = async () => {
  const { data } = await api.get('/vendor/purchase-orders');
  return data;
};

export const getInvoices = async () => {
  const { data } = await api.get('/vendor/invoices');
  return data;
};

export const createInvoice = async (invoiceData) => {
  const { data } = await api.post('/vendor/invoices', invoiceData);
  return data;
};
