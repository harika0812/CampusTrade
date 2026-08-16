import axios from "axios";
import { API_BASE_URL } from "../utils/runtimeConfig.js";
import { refreshToken as refreshTokenApi } from "./auth.api.js";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

const NETWORK_ERROR_MESSAGE = "Unable to connect to the CampusTrade network right now. Please check your connection and try again.";
const INVALID_CREDENTIALS_MESSAGE = "The password or email entered is incorrect. Please try again or reset your password.";

const normalizeApiError = (error) => {
  const responseData = error?.response?.data || {};
  const status = error?.response?.status;
  const friendlyMessage =
    responseData?.details ||
    responseData?.message ||
    (status === 401 ? INVALID_CREDENTIALS_MESSAGE : "");

  return {
    ...error,
    friendlyMessage:
      friendlyMessage ||
      (error?.code === "ERR_NETWORK" ? NETWORK_ERROR_MESSAGE : NETWORK_ERROR_MESSAGE),
  };
};

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

export const handleUnauthorizedError = async (
  error,
  requestClient = API,
  options = {}
) => {
  const refreshTokenRequest = options.refreshTokenRequest || refreshTokenApi;
  const onSessionExpiredHandler = options.onSessionExpiredHandler || onSessionExpired;
  const normalizedError = normalizeApiError(error);
  const originalRequest = normalizedError.config || {};
  const isRefreshRequest = String(originalRequest.url || "").includes("/auth/refresh");
  const isPublicAuthRequestCall = isPublicAuthRequest(originalRequest.url || "");

  if (isRefreshRequest || isPublicAuthRequestCall) {
    return Promise.reject(normalizedError);
  }

  if (normalizedError.response && normalizedError.response.status === 401 && !originalRequest._retry) {
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((token) => {
          if (token) {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            resolve(requestClient(originalRequest));
          } else {
            reject(normalizedError);
          }
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const data = await refreshTokenRequest();
      const newToken = data?.token || data?.accessToken;
      if (!newToken) {
        throw new Error("Refresh response did not include a token");
      }

      localStorage.setItem("token", newToken);
      onRefreshed(newToken);
      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
      return requestClient(originalRequest);
    } catch (refreshErr) {
      onRefreshed(null);
      if (typeof onSessionExpiredHandler === "function") {
        onSessionExpiredHandler();
      }
      return Promise.reject(normalizeApiError(refreshErr));
    } finally {
      isRefreshing = false;
    }
  }

  return Promise.reject(normalizedError);
};

API.interceptors.response.use(
  (response) => response,
  (error) => handleUnauthorizedError(error, API)
);

export default API;
