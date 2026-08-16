const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const envApiBase = trimTrailingSlash(process.env.REACT_APP_API_URL || "");
const explicitServerUrl = trimTrailingSlash(process.env.REACT_APP_SERVER_URL || "");
const explicitSocketUrl = trimTrailingSlash(process.env.REACT_APP_SOCKET_URL || "");

const getWindowOrigin = () => {
  if (typeof window === "undefined") return "";
  return trimTrailingSlash(window.location?.origin || "");
};

const isLocalDevOrigin = (origin = "") =>
  /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/i.test(origin);

const deriveApiBaseUrl = () => {
  if (envApiBase) return envApiBase;

  if (explicitServerUrl) return `${explicitServerUrl}/api`;

  const origin = getWindowOrigin();
  if (isLocalDevOrigin(origin)) {
    return "http://localhost:5000/api";
  }

  return "/api";
};

const deriveServerOrigin = () => {
  if (explicitServerUrl) return explicitServerUrl;

  if (envApiBase && /^https?:\/\//i.test(envApiBase)) {
    try {
      const parsed = new URL(envApiBase);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      // Fall through to runtime origin.
    }
  }

  const origin = getWindowOrigin();
  if (isLocalDevOrigin(origin)) {
    return "http://localhost:5000";
  }

  if (origin) {
    return origin;
  }

  return "http://localhost:5000";
};

export const API_BASE_URL = deriveApiBaseUrl();
export const SERVER_ORIGIN = deriveServerOrigin();
export const SOCKET_URL = explicitSocketUrl || SERVER_ORIGIN;

export const resolveServerAssetUrl = (assetPath) => {
  if (!assetPath) return "";

  const normalizedPath = String(assetPath).replace(/\\/g, "/").trim();
  if (!normalizedPath) return "";
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;

  return `${SERVER_ORIGIN}/${normalizedPath.replace(/^\/+/, "")}`;
};
