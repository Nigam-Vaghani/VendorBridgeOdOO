import api from './axiosInstance';

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  return data;
};

export const signup = async (userData) => {
  const { data } = await api.post('/auth/signup', {
    first_name: userData.firstName,
    last_name: userData.lastName,
    email: userData.email,
    password: userData.password,
    role: userData.role,
    phone_number: userData.phoneNumber,
    country: userData.country,
    additional_info: userData.additionalInfo,
    photo_url: userData.photoUrl
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
