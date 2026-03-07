import axios from "axios";
import { API_BASE_URL } from "../utils/runtimeConfig";

const API = axios.create({
  baseURL: API_BASE_URL,
});

// Attach JWT automatically
API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export default API;
