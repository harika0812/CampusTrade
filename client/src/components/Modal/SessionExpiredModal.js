import React, { useEffect, useRef } from "react";

const modalStyle = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 9999,
};

const boxStyle = {
  background: "#fff",
  borderRadius: 8,
  padding: 32,
  boxShadow: "0 2px 16px rgba(0,0,0,0.2)",
  textAlign: "center",
  minWidth: 300,
};

function SessionExpiredModal({ open, onLogin }) {
  const buttonRef = useRef();
  const modalRef = useRef();

  useEffect(() => {
    if (open && buttonRef.current) {
      buttonRef.current.focus();
    }
    function handleTab(e) {
      if (!open) return;
      const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        onLogin();
      }
    }
    if (open) {
      document.addEventListener('keydown', handleTab);
    }
    return () => document.removeEventListener('keydown', handleTab);
  }, [open, onLogin]);

  if (!open) return null;
  return (
    <div style={modalStyle}>
      <div style={boxStyle} ref={modalRef} aria-modal="true" role="dialog" tabIndex={-1}>
        <h2>Session Expired</h2>
        <p>Your session has expired. Please log in again.</p>
        <button
          ref={buttonRef}
          onClick={onLogin}
          style={{marginTop: 16, padding: "8px 24px", borderRadius: 4, background: "#1976d2", color: "#fff", border: "none", fontWeight: 600, cursor: "pointer"}}
        >
          Login
        </button>
      </div>
    </div>
  );
}

export default SessionExpiredModal;
