import mongoose from "mongoose";
import Message from "../models/Message.js";

const buildRoomId = (userA, userB) => {
  const [u1, u2] = [userA, userB].sort();
  return `${u1}_${u2}`;
};

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join", ({ userId, otherUserId }) => {
      if (!userId || !otherUserId) return;
      const room = buildRoomId(userId, otherUserId);
      socket.join(room);
    });

    socket.on("sendMessage", async (payload) => {
      try {
        const { senderId, receiverId, productId, message } = payload;
        if (!senderId || !receiverId || !message) return;
        if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) return;

        const doc = await Message.create({
          sender: senderId,
          receiver: receiverId,
          product: productId && mongoose.Types.ObjectId.isValid(productId) ? productId : undefined,
          message
        });

      const populated = await doc.populate([
  { path: "sender", select: "name email rollNo" },
  { path: "receiver", select: "name email rollNo" },
  { path: "product", select: "title price" }
]);
        const room = buildRoomId(senderId, receiverId);
        io.to(room).emit("newMessage", populated);
      } catch (err) {
        // optionally emit error
      }
    });

    socket.on("messageDelivered", async ({ messageId, userId }) => {
      try {
        if (!messageId) return;
        const msg = await Message.findByIdAndUpdate(
          messageId,
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

    socket.on("messagesRead", async ({ userId, otherUserId }) => {
      try {
        if (!userId || !otherUserId) return;
        
        const query = {
          sender: otherUserId,
          receiver: userId,
          readAt: null
        };

        await Message.updateMany(query, { 
          readAt: new Date(),
          deliveredAt: new Date()
        });

        const room = buildRoomId(userId, otherUserId);
        io.to(room).emit("messagesReadUpdate", { userId, otherUserId });
      } catch (err) {
        console.error("Read update error:", err);
      }
    });
  });
};