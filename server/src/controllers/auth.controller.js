// Logout endpoint
export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      let payload;
      try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
      } catch {
        // Ignore invalid token
      }
      if (payload) {
        const user = await User.findById(payload.userId);
        if (user) {
          user.refreshToken = null;
          await user.save();
        }
      }
    }
    res.clearCookie("refreshToken", refreshTokenCookieOptions);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("LOGOUT ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
// Refresh token endpoint
export const refreshToken = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ message: "No refresh token provided" });
    }
    let payload;
    try {
      payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    const user = await User.findById(payload.userId);
    if (!user || user.refreshToken !== token) {
      return res.status(401).json({ message: "Invalid refresh token" });
    }
    // Optionally rotate refresh token here for extra security
    const newAccessToken = generateToken(user._id, "1h");
    res.status(200).json({ token: newAccessToken });
  } catch (error) {
    console.error("REFRESH TOKEN ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import crypto from 'crypto';
import { sendPasswordResetEmail, sendVerificationEmail } from '../services/email.service.js';


const generateToken = (userId, expiresIn = "1h") => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

const REFRESH_TOKEN_LIFETIME_MS = 5 * 24 * 60 * 60 * 1000;

const generateRefreshToken = (userId) => {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "5d" });
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  rollNo: user.rollNo || "",
  className: user.className || "",
  branch: user.branch || "",
  year: user.year || "",
  isVerified: !!user.isVerified,
  isSeller: !!user.isSeller,
  razorpayAccountId: user.razorpayAccountId || "",
});

export const registerUser = async (req, res) => {
  try {
    const name = String(req.body?.name || "").trim();
    const email = String(req.body?.email || "").trim().toLowerCase();
    const password = String(req.body?.password || "");

    if (!email.endsWith("@gnits.ac.in")) {
      return res.status(400).json({ message: "Use your college email ending with @gnits.ac.in" });
    }
    const rollNo = email.split('@')[0];
    const rollNoRegex = /^[a-z0-9._-]{3,32}$/i;
    if (!rollNoRegex.test(rollNo)) {
      return res.status(400).json({
        message: "Use a valid college email format like rollnumber@gnits.ac.in",
      });
    }
    if (!name || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "Email is already registered" });
    }


    const user = await User.create({ name, email, password });
    const token = crypto.randomBytes(32).toString('hex');
    user.verificationToken = token;
    user.verificationTokenExpires = Date.now() + 3600000; // 1 hour expiry
    await user.save();

    try {
      await sendVerificationEmail(user.email, token);
    } catch (emailError) {
      console.error("REGISTER EMAIL ERROR:", emailError);
      // Roll back newly created account when verification email cannot be sent.
      await User.deleteOne({ _id: user._id });
      return res.status(502).json({
        message: "Could not send verification email right now. Please try again.",
      });
    }

    res.status(201).json({
      message: "Registered successfully. Check your email to verify.",
      user: buildUserPayload(user),
    });
  } catch (error) {
    console.error("REGISTER ERROR:", error);
    if (error?.code === 11000 && error?.keyPattern?.email) {
      return res.status(409).json({ message: "Email is already registered" });
    }
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

    // Generate tokens
    const accessToken = generateToken(user._id, "1h");
    const refreshToken = generateRefreshToken(user._id);

    // Store refresh token in DB
    user.refreshToken = refreshToken;
    await user.save();

    // Send refresh token as HTTP-only, Secure cookie
    res.cookie("refreshToken", refreshToken, {
      ...refreshTokenCookieOptions,
      maxAge: REFRESH_TOKEN_LIFETIME_MS
    });

    res.status(200).json({
      message: "Login successful",
      token: accessToken,
      user: buildUserPayload(user)
    });
  } catch (error) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).json({ message: 'Invalid verification token' });
    }

    if (!user.verificationTokenExpires || user.verificationTokenExpires.getTime() <= Date.now()) {
      return res.status(400).json({ message: 'Verification link expired. Please request a new one.' });
    }

    const alreadyVerified = !!user.isVerified;

    if (!alreadyVerified) {
      user.isVerified = true;
      await user.save();
    }

    const authToken = generateToken(user._id);

    res.json({
      message: alreadyVerified ? 'Email already verified' : 'Email verified successfully',
      token: authToken,
      user: buildUserPayload(user)
    });
  } catch (error) {
    console.error("VERIFY ERROR:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const email = String(req.body?.email || "").trim().toLowerCase();
    const genericMessage = "If an account exists for this email, a reset link has been sent.";

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(200).json({ message: genericMessage });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();

    await sendPasswordResetEmail(user.email, rawToken);

    return res.status(200).json({ message: genericMessage });
  } catch (error) {
    console.error("FORGOT PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const rawToken = String(req.params?.token || "").trim();
    const password = String(req.body?.password || "");

    if (!rawToken) {
      return res.status(400).json({ message: "Invalid reset link" });
    }

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: "Reset link is invalid or expired" });
    }

    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    return res.status(200).json({ message: "Password reset successful. Please login." });
  } catch (error) {
    console.error("RESET PASSWORD ERROR:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
