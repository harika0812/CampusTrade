import axios from "../app/axiosConfig";

export const loginUser = async (data) => {
  const response = await axios.post("/auth/login", data);
  return response.data;
};
export const registerUser = async (data) => {
  const response = await axios.post("/auth/register", data);
  return response.data;
};
export const verifyEmail = async (token) => {
  const response = await axios.get(`/auth/verify/${token}`);
  return response.data;
};