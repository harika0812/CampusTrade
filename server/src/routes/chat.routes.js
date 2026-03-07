import express from "express";
import { sendMessage, getMessages, getConversations, getRoomId, markAsDelivered, markAsRead, getUnreadCount, deleteConversation } from "../controllers/chat.controller.js";
import { validateMessage, validateUserIdsQuery, validateUserIdQuery, validateUserIdsBody } from "../middlewares/validate.js";
import { chatLimiter } from "../middlewares/rateLimit.middleware.js";

const router = express.Router();

router.get("/conversations", validateUserIdQuery, getConversations);
router.get("/messages", validateUserIdsQuery, getMessages);
router.get("/room", validateUserIdsQuery, getRoomId);
router.get("/unread-count", validateUserIdQuery, getUnreadCount);
router.post("/messages", chatLimiter, validateMessage, sendMessage);
router.post("/mark-delivered", markAsDelivered);
router.post("/mark-read", validateUserIdsBody, markAsRead);
router.delete("/conversation", validateUserIdsBody, deleteConversation);

export default router;