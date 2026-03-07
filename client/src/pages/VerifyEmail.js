import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth.api';
import { useAuth } from '../app/authContext';

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying...');
  const [isError, setIsError] = useState(false);
  const { login, user } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');

    if (token) {
      verifyEmail(token)
        .then((response) => {
          if (response?.token && response?.user) {
            login(response.user, response.token);
          }
          setIsError(false);
          setMessage('Verification completed. Redirecting to Marketplace...');
          navigate('/marketplace');
        })
        .catch((error) => {
          const status = error?.response?.status;
          const apiMessage = error?.response?.data?.message || 'Verification failed';
          const looksLikeConsumedLink = status === 400 && /invalid verification token/i.test(apiMessage);

          if (looksLikeConsumedLink && user) {
            setIsError(false);
            setMessage('Email already verified. Redirecting to Marketplace...');
            navigate('/marketplace');
            return;
          }

          setIsError(true);
          setMessage(apiMessage);
        });
    } else {
      setIsError(true);
      setMessage('Invalid verification link');
    }

  }, [searchParams, navigate, login, user]);

  return (
    <div className="auth-page page">
      <div className="auth-card">
        <h2 className="auth-title">Email verification</h2>
        {isError ? (
          <div className="auth-error-banner" role="alert" aria-live="polite">
            {message}
          </div>
        ) : (
          <div className="auth-success-banner" role="status" aria-live="polite">
            <p className="auth-success-text">{message}</p>
          </div>
        )}

        <p className="auth-footer">
          Go to <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;