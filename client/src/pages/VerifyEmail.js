import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { verifyEmail } from '../api/auth.api';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const [message, setMessage] = useState('Verifying...');

  useEffect(() => {
    const token = searchParams.get('token');
    console.log('Token received:', token); // DEBUG
    
    if (token) {
      verifyEmail(token)
        .then((response) => {
          console.log('Verification success:', response); // DEBUG
          setMessage(response.message);
        })
        .catch((error) => {
          console.error('Verification error:', error); // DEBUG
          setMessage(error.response?.data?.message || 'Verification failed');
        });
    } else {
      setMessage('Invalid verification link');
    }
  }, [searchParams]);
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h2>Email Verification</h2>
      <p>{message}</p>
    </div>
  );
};

export default VerifyEmail;