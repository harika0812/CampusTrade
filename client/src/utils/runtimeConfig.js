const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

const envApiBase = trimTrailingSlash(process.env.REACT_APP_API_URL || "");

const deriveServerOrigin = () => {
  const explicitServer = trimTrailingSlash(process.env.REACT_APP_SERVER_URL || "");
  if (explicitServer) return explicitServer;

  if (envApiBase && /^https?:\/\//i.test(envApiBase)) {
    try {
      const parsed = new URL(envApiBase);
      return `${parsed.protocol}//${parsed.host}`;
    } catch {
      // Fall through to runtime origin.
    }
  }

  if (typeof window !== "undefined" && window.location?.origin) {
    return trimTrailingSlash(window.location.origin);
  }

  return "http://localhost:5000";
};

export const API_BASE_URL = envApiBase || "/api";
export const SERVER_ORIGIN = deriveServerOrigin();
export const SOCKET_URL = trimTrailingSlash(process.env.REACT_APP_SOCKET_URL || SERVER_ORIGIN);

export const resolveServerAssetUrl = (assetPath) => {
  if (!assetPath) return "";

  const normalizedPath = String(assetPath).replace(/\\/g, "/").trim();
  if (!normalizedPath) return "";
  if (/^https?:\/\//i.test(normalizedPath)) return normalizedPath;

  return `${SERVER_ORIGIN}/${normalizedPath.replace(/^\/+/, "")}`;
};
