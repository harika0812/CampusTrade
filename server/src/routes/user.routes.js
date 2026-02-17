// const express = require('express');
// const router = express.Router();
// const auth = require('../middlewares/auth.middleware');
// const User = require('../models/User');
// const Product = require('../models/Product');

// /* CART ROUTES */
// // Get user's cart
// router.get('/cart', auth, async (req, res) => {
//     try {
//         await req.user.populate('cart.product', 'title price images sellerId');
//         res.json({ cart: req.user.cart });
//     } catch (err) { res.status(500).json({ message: err.message }); }
// });

// // Add item to cart or increment
// router.post('/cart', auth, async (req, res) => {
//     try {
//         const { productId, quantity = 1 } = req.body;
//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: 'Product not found' });

//         const existing = req.user.cart.find(c => c.product.toString() === productId);
//         if (existing) {
//             existing.quantity = Math.max(1, existing.quantity + Number(quantity));
//             existing.addedAt = new Date();
//         } else {
//             req.user.cart.push({ product: productId, quantity, addedAt: new Date() });
//         }
//         await req.user.save();
//         await req.user.populate('cart.product', 'title price images sellerId');
//         res.status(201).json({ cart: req.user.cart });
//     } catch (err) { console.error(err); res.status(500).json({ message: err.message }); }
// });

// // Update quantity for a cart item
// router.put('/cart/:productId', auth, async (req, res) => {
//     try {
//         const { productId } = req.params;
//         const { quantity } = req.body;
//         const item = req.user.cart.find(c => c.product.toString() === productId);
//         if (!item) return res.status(404).json({ message: 'Cart item not found' });
//         if (quantity <= 0) {
//             req.user.cart = req.user.cart.filter(c => c.product.toString() !== productId);
//         } else {
//             item.quantity = Number(quantity);
//         }
//         await req.user.save();
//         await req.user.populate('cart.product', 'title price images sellerId');
//         res.json({ cart: req.user.cart });
//     } catch (err) { res.status(500).json({ message: err.message }); }
// });

// // Remove from cart
// router.delete('/cart/:productId', auth, async (req, res) => {
//     try {
//         const { productId } = req.params;
//         req.user.cart = req.user.cart.filter(c => c.product.toString() !== productId);
//         await req.user.save();
//         await req.user.populate('cart.product', 'title price images sellerId');
//         res.json({ cart: req.user.cart });
//     } catch (err) { res.status(500).json({ message: err.message }); }
// });

// /* WISHLIST ROUTES */
// // Get wishlist
// router.get('/wishlist', auth, async (req, res) => {
//     try {
//         await req.user.populate('wishlist.product', 'title price images sellerId');
//         res.json({ wishlist: req.user.wishlist });
//     } catch (err) { res.status(500).json({ message: err.message }); }
// });

// // Add to wishlist
// router.post('/wishlist', auth, async (req, res) => {
//     try {
//         const { productId } = req.body;
//         const product = await Product.findById(productId);
//         if (!product) return res.status(404).json({ message: 'Product not found' });
//         const exists = req.user.wishlist.find(w => w.product.toString() === productId);
//         if (!exists) req.user.wishlist.push({ product: productId, addedAt: new Date() });
//         await req.user.save();
//         await req.user.populate('wishlist.product', 'title price images sellerId');
//         res.status(201).json({ wishlist: req.user.wishlist });
//     } catch (err) { res.status(500).json({ message: err.message }); }
// });

// // Remove from wishlist
// router.delete('/wishlist/:productId', auth, async (req, res) => {
//     try {
//         const { productId } = req.params;
//         req.user.wishlist = req.user.wishlist.filter(w => w.product.toString() !== productId);
//         await req.user.save();
//         await req.user.populate('wishlist.product', 'title price images sellerId');
//         res.json({ wishlist: req.user.wishlist });
//     } catch (err) { res.status(500).json({ message: err.message }); }
// });

// // Simple checkout placeholder
// router.post('/checkout', auth, async (req, res) => {
//     try {
//         // For demonstration: compute total and clear cart
//         await req.user.populate('cart.product', 'title price');
//         const total = req.user.cart.reduce((s, c) => s + (c.product.price || 0) * c.quantity, 0);
//         // Here you'd normally create an order, charge via payment gateway etc.
//         req.user.cart = [];
//         await req.user.save();
//         res.json({ message: `Checkout successful. Total: ₹${total}` });
//     } catch (err) { res.status(500).json({ message: err.message }); }
// });

// module.exports = router;


import express from "express";
import { protect } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

export default router;
