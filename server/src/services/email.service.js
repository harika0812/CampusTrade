import nodemailer from 'nodemailer';
import { EMAIL_CONFIG, env } from '../config/env.js';

const transporter = nodemailer.createTransport(EMAIL_CONFIG);

// email.service.js
export const sendVerificationEmail = async (email, token) => {
  const verificationUrl = `${env.clientUrl}/verify?token=${token}`;
  
  await transporter.sendMail({
    from: EMAIL_CONFIG.auth.user,
    to: email,
    subject: 'Verify your GNITS CampusTrade account',
    html: `<p>Click <a href="${verificationUrl}">here</a> to verify your email.</p>`
  });
};

export const sendPasswordResetEmail = async (email, token) => {
  const resetUrl = `${env.clientUrl}/reset-password?token=${token}`;

  await transporter.sendMail({
    from: EMAIL_CONFIG.auth.user,
    to: email,
    subject: 'Reset your CampusTrade password',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password.</p><p>This link expires in 1 hour.</p>`
  });
};