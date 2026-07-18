import axios from "axios";
import { API_BASE_URL } from "../utils/runtimeConfig";
import { refreshToken as refreshTokenApi } from "./auth.api";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

// Automatically attach token
API.interceptors.request.use((req) => {
  const token = localStorage.getItem("token");
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

// Global 401 handler
let onSessionExpired = null;
export function setSessionExpiredHandler(fn) {
  onSessionExpired = fn;
}


let isRefreshing = false;
let refreshSubscribers = [];

const publicAuthPaths = [
  "/auth/login",
  "/auth/register",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify",
];

function isPublicAuthRequest(url = "") {
  return publicAuthPaths.some((path) => String(url).includes(path));
}

function subscribeTokenRefresh(cb) {
  refreshSubscribers.push(cb);
}
function onRefreshed(token) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

API.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config || {};
    const isRefreshRequest = String(originalRequest.url || "").includes("/auth/refresh");
    const isPublicAuthRequestCall = isPublicAuthRequest(originalRequest.url || "");

    // Never attempt to refresh the refresh call itself.
    if (isRefreshRequest) {
      return Promise.reject(error);
    }

    // Public auth calls should surface their own backend errors directly.
    if (isPublicAuthRequestCall) {
      return Promise.reject(error);
    }

    if (
      error.response &&
      error.response.status === 401 &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        // Wait for refresh to finish
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((token) => {
            if (token) {
              originalRequest.headers["Authorization"] = `Bearer ${token}`;
              resolve(API(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }
      originalRequest._retry = true;
      isRefreshing = true;
      try {
        const data = await refreshTokenApi();
        const newToken = data.token;
        localStorage.setItem("token", newToken);
        onRefreshed(newToken);
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return API(originalRequest);
      } catch (refreshErr) {
        onRefreshed(null);
        if (typeof onSessionExpired === "function") {
          onSessionExpired();
        }
        return Promise.reject(refreshErr);
      } finally {
        isRefreshing = false;
      }
    }
    return Promise.reject(error);
  }
);

export default API;
