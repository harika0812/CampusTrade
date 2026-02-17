import nodemailer from 'nodemailer';
import { EMAIL_CONFIG } from '../config/env.js';

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// email.service.js
export const sendVerificationEmail = async (email, token) => {
  // Use /api/auth/verify/ (or whatever your backend route is) instead of a query param
  const verificationUrl = `http://localhost:5000/api/auth/verify/${token}`; 
  
  await transporter.sendMail({
    from: EMAIL_CONFIG.auth.user,
    to: email,
    subject: 'Verify your GNITS CampusTrade account',
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
  });
};