import React from "react";

const overlayStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(255,255,255,0.6)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 99999,
};

const spinnerStyle = {
  width: 60,
  height: 60,
  border: "6px solid #1976d2",
  borderTop: "6px solid #fff",
  borderRadius: "50%",
  animation: "spin 1s linear infinite"
};

export default function GlobalLoader({ open }) {
  if (!open) return null;
  return (
    <div style={overlayStyle}>
      <div style={spinnerStyle} />
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
