import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { addToCart, clearCart, getCart, removeFromCart } from "../controllers/cart.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", getCart);
router.post("/items", addToCart);
router.delete("/items/:productId", removeFromCart);
router.delete("/", clearCart);

export default router;
