import API from "./axios.js";

export const loginUser = async (data) => {
  const response = await API.post("/auth/login", data, { withCredentials: true });
  return response.data;
};

export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response.data;
};

export const verifyEmail = async (token) => {
  const response = await API.get(`/auth/verify/${token}`);
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await API.post("/auth/forgot-password", { email });
  return response.data;
};

export const resetPassword = async (token, password) => {
  const response = await API.post(`/auth/reset-password/${token}`, { password });
  return response.data;
};

export const refreshToken = async () => {
  const response = await API.post("/auth/refresh", {}, { withCredentials: true });
  return response.data;
};

export const logoutUser = async () => {
  await API.post("/auth/logout", {}, { withCredentials: true });
};