
import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword,
  refreshToken,
  logoutUser
} from "../controllers/auth.controller.js";
import { verifyEmail } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Logout endpoint
router.post('/logout', logoutUser);

router.post("/register", authLimiter, validateRegister, registerUser);
router.post("/login", authLimiter, validateLogin, loginUser);
router.post("/forgot-password", authLimiter, validateForgotPassword, forgotPassword);
router.post("/reset-password/:token", authLimiter, validateResetPassword, resetPassword);

// Refresh token endpoint
router.post('/refresh', refreshToken);

router.get('/verify/:token', verifyEmail);

export default router;
