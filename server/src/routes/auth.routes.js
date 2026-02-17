import express from "express";
import {
  registerUser,
  loginUser
} from "../controllers/auth.controller.js";
import { verifyEmail } from '../controllers/auth.controller.js';
const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get('/verify/:token', verifyEmail);
export default router;
