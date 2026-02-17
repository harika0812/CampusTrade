import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from 'crypto';
import { sendVerificationEmail } from '../services/email.service.js';

const generateToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });
};

export const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!email.endsWith("@gnits.ac.in")) {
      return res.status(400).json({ message: "Only GNITS emails allowed" });
    }
const rollNo = email.split('@')[0];
    const rollNoRegex = /^23\d{3}[a-z]\d{2}[a-z]\d$/;
    if (!rollNoRegex.test(rollNo)) {
      return res.status(400).json({ message: 'Invalid roll number format' });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "User already exists" });
    }


    const user = await User.create({ name, email, password });
const token = crypto.randomBytes(32).toString('hex');
user.verificationToken = token;
user.verificationTokenExpires = Date.now() + 3600000;  // 1 hour expiry
await user.save();
await sendVerificationEmail(user.email, token);
res.status(201).json({
  message: "Registered successfully. Check your email to verify.",
  user: { id: user._id, name: user.name, email: user.email }
});
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
  return res.status(401).json({ message: "Invalid credentials" });
}
   if (!user.isVerified) return res.status(403).json({ message: 'Please verify your email first' });
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      message: "Login successful",
      token,
      user: { id: user._id, name: user.name, email: user.email }
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token, verificationTokenExpires: { $gt: Date.now() } });
    if (!user) return res.status(400).json({ message: 'Invalid or expired token' });
    user.isVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await user.save();
    res.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
