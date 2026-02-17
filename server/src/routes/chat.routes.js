import express from "express";
import { sendMessage, getMessages, getConversations, getRoomId } from "../controllers/chat.controller.js";

const router = express.Router();

router.get("/conversations", getConversations);
router.get("/messages", getMessages);
router.get("/room", getRoomId);
router.post("/messages", sendMessage);

export default router;