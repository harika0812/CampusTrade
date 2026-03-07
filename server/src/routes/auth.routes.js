import express from "express";
import {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
} from "../controllers/auth.controller.js";
import { verifyEmail } from '../controllers/auth.controller.js';
import { validateRegister, validateLogin, validateForgotPassword, validateResetPassword } from "../middlewares/validate.js";
import { authLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.post("/register", authLimiter, validateRegister, registerUser);
router.post("/login", authLimiter, validateLogin, loginUser);
router.post("/forgot-password", authLimiter, validateForgotPassword, forgotPassword);
router.post("/reset-password/:token", authLimiter, validateResetPassword, resetPassword);
router.get('/verify/:token', verifyEmail);

export default router;
