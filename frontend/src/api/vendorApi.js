import api from './axiosInstance';

// axiosInstance already has baseURL='/api', so paths here are relative to that

export const getVendors = async (params) => {
  const { data } = await api.get('/vendors', { params });
  return data;
};

export const getVendorById = async (id) => {
  const { data } = await api.get(`/vendors/${id}`);
  return data;
};

export const createVendor = async (vendorData) => {
  const { data } = await api.post('/vendors', vendorData);
  return data;
};

export const updateVendor = async (id, vendorData) => {
  const { data } = await api.put(`/vendors/${id}`, vendorData);
  return data;
};

export const deleteVendor = async (id, hard = false) => {
  const { data } = await api.delete(`/vendors/${id}`, { params: { hard } });
  return data;
};

export const getVendorPerformance = async (id) => {
  const { data } = await api.get(`/vendors/${id}/performance`);
  return data;
};

export const uploadVendorDocument = async (id, formData) => {
  const { data } = await api.post(`/vendors/${id}/documents`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteVendorDocument = async (vendorId, docId) => {
  const { data } = await api.delete(`/vendors/${vendorId}/documents/${docId}`);
  return data;
};

export const importVendors = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await api.post('/vendors/import', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};
