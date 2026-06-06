import api from './axiosInstance';

export const getRFQs = (params) => api.get('/rfqs', { params }).then(r => r.data);
export const getRFQById = (id) => api.get(`/rfqs/${id}`).then(r => r.data);
export const createRFQ = (data) => api.post('/rfqs', data).then(r => r.data);
export const updateRFQ = (id, data) => api.put(`/rfqs/${id}`, data).then(r => r.data);
export const deleteRFQ = (id) => api.delete(`/rfqs/${id}`).then(r => r.data);

export const addRFQItem = (rfqId, data) => api.post(`/rfqs/${rfqId}/items`, data).then(r => r.data);
export const updateRFQItem = (rfqId, itemId, data) => api.put(`/rfqs/${rfqId}/items/${itemId}`, data).then(r => r.data);
export const deleteRFQItem = (rfqId, itemId) => api.delete(`/rfqs/${rfqId}/items/${itemId}`).then(r => r.data);

export const assignVendors = (rfqId, vendor_ids) => api.post(`/rfqs/${rfqId}/vendors`, { vendor_ids }).then(r => r.data);
export const removeVendorFromRFQ = (rfqId, vendorId) => api.delete(`/rfqs/${rfqId}/vendors/${vendorId}`).then(r => r.data);

export const sendRFQ = (id) => api.post(`/rfqs/${id}/send`).then(r => r.data);
export const closeRFQ = (id) => api.post(`/rfqs/${id}/close`).then(r => r.data);
export const cancelRFQ = (id, reason) => api.post(`/rfqs/${id}/cancel`, { reason }).then(r => r.data);
