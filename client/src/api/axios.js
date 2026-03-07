import axios from "axios";
import { API_BASE_URL } from "../utils/runtimeConfig";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Automatically attach token (later useful)
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
