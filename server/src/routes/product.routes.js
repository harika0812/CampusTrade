import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import upload from "../middlewares/upload.middleware.js";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getMyProducts,
  markProductAsSold,
  deleteProduct
} from "../controllers/product.controller.js";

const router = express.Router();

// PUBLIC
router.get("/", getAllProducts);

// PROTECTED
router.post("/", protect, upload.single("image"), createProduct);
router.get("/mine", protect, getMyProducts); // Move this before /:id
router.put("/:id/sold", protect, markProductAsSold);
router.delete("/:id", protect, deleteProduct);

// PUBLIC (after protected to avoid conflicts)
router.get("/:id", getProductById); // Move this last

export default router;