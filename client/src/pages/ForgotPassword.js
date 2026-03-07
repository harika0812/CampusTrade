import { useState } from "react";
import { Link } from "react-router-dom";
import { forgotPassword } from "../api/auth.api";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setIsSubmitting(true);

    try {
      const response = await forgotPassword(email);
      setSuccessMessage(response?.message || "If an account exists for this email, a reset link has been sent.");
    } catch (error) {
      const apiMessage = error?.response?.data?.message || "Unable to process request right now";
      setErrorMessage(apiMessage.replace(/https?:\/\/localhost:\\d+/gi, "this app"));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page page">
      <div className="auth-card">
        <h2 className="auth-title">Forgot password</h2>
        <p className="auth-subtitle">Enter your college email to receive a password reset link.</p>

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
            name="email"
            type="email"
            placeholder="College email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            className="auth-input"
            required
          />

          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Sending link..." : "Send reset link"}
          </button>
        </form>

        <p className="auth-footer">
          Remembered password? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
