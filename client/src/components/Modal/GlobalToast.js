import React, { useEffect } from "react";

const toastStyle = {
  position: "fixed",
  bottom: 32,
  left: "50%",
  transform: "translateX(-50%)",
  minWidth: 240,
  maxWidth: 400,
  background: "#222",
  color: "#fff",
  borderRadius: 8,
  padding: "16px 32px",
  boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
  zIndex: 99999,
  fontWeight: 500,
  fontSize: 16,
  display: "flex",
  alignItems: "center",
  gap: 12,
};

const typeColors = {
  success: "#43a047",
  error: "#e53935",
  info: "#1976d2"
};

export default function GlobalToast({ open, message, type = "info", onClose }) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div
      style={{ ...toastStyle, background: typeColors[type] || toastStyle.background }}
      role="status"
      aria-live="polite"
    >
      {type === "success" && <span aria-hidden="true">✅</span>}
      {type === "error" && <span aria-hidden="true">⚠️</span>}
      {type === "info" && <span aria-hidden="true">ℹ️</span>}
      <span>{message}</span>
    </div>
  );
}
