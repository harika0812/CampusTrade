import { useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { resetPassword } from "../api/auth.api";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = useMemo(() => String(searchParams.get("token") || "").trim(), [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    if (!token) {
      setErrorMessage("Invalid reset link");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await resetPassword(token, password);
      setSuccessMessage(response?.message || "Password reset successful. Please login.");
      setTimeout(() => navigate("/login"), 1000);
    } catch (error) {
      const apiMessage = error?.response?.data?.message || "Could not reset password";
      setErrorMessage(apiMessage.replace(/https?:\/\/localhost:\\d+/gi, "this app"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-card">
        <h2 className="auth-title">Reset password</h2>
        <p className="auth-subtitle">Create a new password for your account.</p>

        {successMessage ? (
          <div className="auth-success-banner" role="status" aria-live="polite">
            <p className="auth-success-text">{successMessage}</p>
          </div>
        ) : null}

        {errorMessage ? (
          <div className="auth-error-banner" role="alert" aria-live="polite">
            {errorMessage}
          </div>
        ) : null}

        <form className="auth-form" onSubmit={handleSubmit}>
          <input
            name="password"
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="new-password"
            className="auth-input"
            required
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            autoComplete="new-password"
            className="auth-input"
            required
          />

          <p className="auth-field-help">Use at least 6 characters with uppercase, lowercase, and a number.</p>

          <button className="btn btn-primary" type="submit" disabled={isSubmitting || !token}>
            {isSubmitting ? "Updating..." : "Reset password"}
          </button>
        </form>

        <p className="auth-footer">
          Back to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
