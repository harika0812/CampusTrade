import mongoose from "mongoose";
import Message from "../models/Message.js";

const buildRoomId = (userA, userB, productId) => {
  const [u1, u2] = [userA, userB].sort();
  return productId ? `${u1}_${u2}_${productId}` : `${u1}_${u2}`;
};

export const initChatSocket = (io) => {
  io.on("connection", (socket) => {
    socket.on("join", ({ userId, otherUserId, productId }) => {
      if (!userId || !otherUserId) return;
      const room = buildRoomId(userId, otherUserId, productId);
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
  { path: "sender", select: "name email" },
  { path: "receiver", select: "name email" },
  { path: "product", select: "title price" }
]);
        const room = buildRoomId(senderId, receiverId, productId);
        io.to(room).emit("newMessage", populated);
      } catch (err) {
        // optionally emit error
      }
    });
  });
};