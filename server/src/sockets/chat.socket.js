import mongoose from "mongoose";
import Message from "../models/Message.js";
import { buildRoomId, extractSocketToken, isAuthorizedRoomJoin, verifySocketToken } from "./chat.helpers.js";

// Track user socket IDs for direct user-level messaging
const userSocketMap = new Map(); // userId -> socket.id

export const initChatSocket = (io) => {
  io.use((socket, next) => {
    try {
      const token = extractSocketToken(socket);
      const secret = process.env.JWT_SECRET;
      const userId = verifySocketToken({ token, secret });
      socket.data.userId = userId;
      next();
    } catch {
      next(new Error("Unauthorized socket connection"));
    }
  });

  io.on("connection", (socket) => {
    const userId = socket.data.userId;
    console.log(`✅ User ${userId} connected (socket: ${socket.id})`);
    
    // Track user socket
    userSocketMap.set(userId, socket.id);

    socket.on("join", ({ otherUserId }) => {
      const authUserId = String(socket.data?.userId || "");
      if (!isAuthorizedRoomJoin({ authUserId, otherUserId, claimedUserId: authUserId })) {
        socket.emit("chatError", { message: "Unauthorized room join" });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(otherUserId)) {
        socket.emit("chatError", { message: "Invalid room participant" });
        return;
      }

      const room = buildRoomId(authUserId, String(otherUserId));
      socket.join(room);
      console.log(`👤 User ${authUserId} joined room ${room}`);
    });

    socket.on("leave", ({ otherUserId }) => {
      const authUserId = String(socket.data?.userId || "");
      if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
        return;
      }

      const room = buildRoomId(authUserId, String(otherUserId));
      socket.leave(room);
      console.log(`👥 User ${authUserId} left room ${room}`);
    });

    // REST /api/chat/messages is the authoritative send path.
    socket.on("sendMessage", () => {
      socket.emit("chatError", {
        code: "CHAT_SEND_REST_ONLY",
        message: "Use REST /api/chat/messages to send messages",
      });
    });

    socket.on("messageDelivered", async ({ messageId }) => {
      try {
        if (!messageId) return;
        const authUserId = String(socket.data?.userId || "");
        const msg = await Message.findOneAndUpdate(
          { _id: messageId, receiver: authUserId },
          { deliveredAt: new Date() },
          { new: true }
        ).populate([
          { path: "sender", select: "name email rollNo" },
          { path: "receiver", select: "name email rollNo" },
          { path: "product", select: "title price" }
        ]);
        
        if (msg) {
          const room = buildRoomId(msg.sender._id.toString(), msg.receiver._id.toString());
          io.to(room).emit("messageStatusUpdate", { messageId, status: "delivered" });
        }
      } catch (err) {
        console.error("Delivery update error:", err);
      }
    });

    socket.on("messagesRead", async ({ otherUserId }) => {
      try {
        const authUserId = String(socket.data?.userId || "");
        
        if (!otherUserId || !mongoose.Types.ObjectId.isValid(otherUserId)) {
          socket.emit("chatError", { message: "Invalid read receipt" });
          return;
        }

        if (!isAuthorizedRoomJoin({ authUserId, otherUserId, claimedUserId: authUserId })) {
          socket.emit("chatError", { message: "Unauthorized read receipt" });
          return;
        }

        // Update messages as read
        const query = {
          sender: otherUserId,
          receiver: authUserId,
          readAt: null
        };

        await Message.updateMany(query, { 
          readAt: new Date(),
          deliveredAt: new Date()
        });

        // Emit to room (both users in the conversation)
        const room = buildRoomId(authUserId, otherUserId);
        io.to(room).emit("messagesReadUpdate", { userId: authUserId, otherUserId });

        // Also emit directly to sender if they're not in the room
        const senderSocketId = userSocketMap.get(String(otherUserId));
        if (senderSocketId) {
          io.to(senderSocketId).emit("messagesReadUpdate", { userId: authUserId, otherUserId });
        }

        console.log(`✓ Messages read: ${authUserId} read messages from ${otherUserId}`);
      } catch (err) {
        console.error("Read update error:", err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`❌ User ${userId} disconnected (socket: ${socket.id})`);
      userSocketMap.delete(userId);
    });
  });
};

/**
 * Emit a new message event to both users
 * Called from the REST API after message is created
 */
export const emitNewMessageEvent = (io, message) => {
  const senderId = message?.sender?._id || message?.sender;
  const receiverId = message?.receiver?._id || message?.receiver;
  const room = buildRoomId(String(senderId), String(receiverId));

  // Emit to conversation room (both participants if they're viewing)
  io.to(room).emit("newMessage", message);

  // Also emit directly to receiver even if not in room
  const receiverSocketId = userSocketMap.get(String(receiverId));
  if (receiverSocketId && receiverSocketId !== userSocketMap.get(String(senderId))) {
    io.to(receiverSocketId).emit("newMessage", message);
  }

  console.log(`📨 New message emitted: ${senderId} → ${receiverId}`);
};