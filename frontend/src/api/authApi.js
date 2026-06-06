import api from './axiosInstance';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const signup = async (userData) => {
  const { data } = await api.post('/auth/signup', {
    name: `${userData.firstName} ${userData.lastName}`.trim(),
    email: userData.email,
    password: userData.password,
    role: userData.role
  });
  return data;
};

export const forgotPassword = async (email) => {
  const { data } = await api.post('/auth/forgot-password', { email });
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const { data } = await api.post('/auth/reset-password', { token, new_password: newPassword });
  return data;
};

export const refreshToken = async (refreshToken) => {
  const { data } = await api.post('/auth/refresh', { refresh_token: refreshToken });
  return data;
};
