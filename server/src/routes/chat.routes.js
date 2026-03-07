import express from "express";
import { sendMessage, getMessages, getConversations, getRoomId, markAsDelivered, markAsRead, getUnreadCount, deleteConversation } from "../controllers/chat.controller.js";
import { validateMessage, validateUserIdsQuery, validateUserIdQuery, validateUserIdsBody } from "../middlewares/validate.js";
import { chatLimiter, chatReadLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.get("/conversations", chatReadLimiter, validateUserIdQuery, getConversations);
router.get("/messages", chatReadLimiter, validateUserIdsQuery, getMessages);
router.get("/room", chatReadLimiter, validateUserIdsQuery, getRoomId);
router.get("/unread-count", chatReadLimiter, validateUserIdQuery, getUnreadCount);
router.post("/messages", chatLimiter, validateMessage, sendMessage);
router.post("/mark-delivered", chatReadLimiter, markAsDelivered);
router.post("/mark-read", chatReadLimiter, validateUserIdsBody, markAsRead);
router.delete("/conversation", validateUserIdsBody, deleteConversation);

export default router;