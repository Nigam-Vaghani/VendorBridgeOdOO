import api from './axiosInstance';

export const getQuotations = (params) => api.get('/quotations', { params }).then(r => r.data);
export const getQuotationById = (id) => api.get(`/quotations/${id}`).then(r => r.data);
export const submitQuotation = (data) => api.post('/quotations', data).then(r => r.data);
export const updateQuotation = (id, data) => api.put(`/quotations/${id}`, data).then(r => r.data);
export const withdrawQuotation = (id) => api.delete(`/quotations/${id}`).then(r => r.data);

export const getComparisonMatrix = (rfqId, params) => api.get(`/quotations/compare/${rfqId}`, { params }).then(r => r.data);
export const getComparisonTable = (rfqId) => api.get(`/quotations/compare/${rfqId}/table`).then(r => r.data);
export const getComparisonChart = (rfqId, chartType) => api.get(`/quotations/compare/${rfqId}/chart`, { params: { chart_type: chartType } }).then(r => r.data);
export const getComparisonScoring = (rfqId, weights) => api.get(`/quotations/compare/${rfqId}/score`, { params: weights ? { weights: JSON.stringify(weights) } : {} }).then(r => r.data);
export const exportComparisonReport = (rfqId, format) => api.get(`/quotations/compare/${rfqId}/export`, { params: { format }, responseType: 'blob' }).then(r => r.data);

export const shortlistQuotation = (id, data) => api.post(`/quotations/${id}/shortlist`, data).then(r => r.data);
export const rejectQuotation = (id, data) => api.post(`/quotations/${id}/reject`, data).then(r => r.data);
export const acceptQuotation = (id, data) => api.post(`/quotations/${id}/accept`, data).then(r => r.data);
