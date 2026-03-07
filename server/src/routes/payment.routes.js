import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import {
  getPaymentConfigStatus,
  setupRazorpayAccount,
  createOrder,
  createOfflineOrders,
  verifyPayment,
  getMyOrders,
  getSellerOrders,
  updateOfflineOrderStatus
} from "../controllers/payment.controller.js";
import { paymentLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

// Protected routes - user must be logged in
router.use(protect);

// Setup Razorpay account for selling
router.post("/setup-razorpay", setupRazorpayAccount);

// Check payment gateway configuration status
router.get("/config-status", getPaymentConfigStatus);

// Create order from cart
router.post("/create-order", paymentLimiter, createOrder);

// Create offline orders for items without online payment support
router.post("/create-offline-orders", paymentLimiter, createOfflineOrders);

// Verify payment and transfer to sellers
router.post("/verify-payment", paymentLimiter, verifyPayment);

// Get user's orders
router.get("/orders", getMyOrders);

// Get seller's incoming orders
router.get("/seller-orders", getSellerOrders);

// Update offline order status
router.patch("/orders/:orderId/offline-status", updateOfflineOrderStatus);

export default router;
