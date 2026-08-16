import mongoose from "mongoose";
import Message from "../models/Message.js";
import { buildRoomId } from "../sockets/chat.helpers.js";
import { emitNewMessageEvent } from "../sockets/chat.socket.js";

const ensureAuthenticatedUserClaim = (authUserId, claimedUserId) => {
  if (!authUserId) {
    throw Object.assign(new Error("Unauthorized"), { statusCode: 401 });
  }

  if (claimedUserId && String(claimedUserId) !== String(authUserId)) {
    throw Object.assign(new Error("Sender identity mismatch"), { statusCode: 403 });
  }

  return String(authUserId);
};

const populateMessage = (query) =>
  query
    .populate("sender", "name email rollNo")
    .populate("receiver", "name email rollNo")
    .populate("product", "title price");

export const persistMessageIdempotent = async ({
  MessageModel = Message,
  senderId,
  receiverId,
  productId,
  message,
  clientMessageId,
}) => {
  const existing = await MessageModel.findOne({ sender: senderId, clientMessageId });
  if (existing) {
    return { duplicate: true, document: existing };
  }

  const created = await MessageModel.create({
    sender: senderId,
    receiver: receiverId,
    product: productId,
    message,
    clientMessageId,
  });

  return { duplicate: false, document: created };
};

const parseSinceFilter = (query) => {
  const { since, sinceMessageId } = query || {};

  if (sinceMessageId && mongoose.Types.ObjectId.isValid(sinceMessageId)) {
    return { _id: { $gt: new mongoose.Types.ObjectId(sinceMessageId) } };
  }

  if (since) {
    const parsed = new Date(since);
    if (!Number.isNaN(parsed.getTime())) {
      return { createdAt: { $gt: parsed } };
    }
  }

  return {};
};

export const sendMessage = async (req, res) => {
  try {
    const authUserId = String(req.user?.userId || "");
    const { senderId, receiverId, productId, message, clientMessageId } = req.body;

    const safeSenderId = ensureAuthenticatedUserClaim(authUserId, senderId);

    if (!receiverId || !message || !clientMessageId) {
      return res.status(400).json({ message: "receiverId, message, and clientMessageId are required" });
    }

    if (!mongoose.Types.ObjectId.isValid(safeSenderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid senderId or receiverId" });
    }
    const safeProductId =
      productId && mongoose.Types.ObjectId.isValid(productId) ? productId : undefined;

    const normalizedClientMessageId = String(clientMessageId || "").trim();
    const persisted = await persistMessageIdempotent({
      MessageModel: Message,
      senderId: safeSenderId,
      receiverId,
      productId: safeProductId,
      message,
      clientMessageId: normalizedClientMessageId,
    });

    const populated = await populateMessage(Message.findById(persisted.document._id));

    if (persisted.duplicate) {
      return res.status(200).json({
        message: "Message already processed",
        data: populated,
        duplicate: true,
      });
    }

    const io = req.app.get("io");
    if (io && populated) {
      emitNewMessageEvent(io, populated);
    }

    return res.status(201).json({ message: "Message sent", data: populated });
  } catch (err) {
    if (err?.code === 11000) {
      const authUserId = String(req.user?.userId || "");
      const normalizedClientMessageId = String(req.body?.clientMessageId || "").trim();
      const existing = await populateMessage(
        Message.findOne({ sender: authUserId, clientMessageId: normalizedClientMessageId })
      );
      if (existing) {
        return res.status(200).json({
          message: "Message already processed",
          data: existing,
          duplicate: true,
        });
      }
    }
    console.error("CHAT SEND ERROR:", err);
    const statusCode = err?.statusCode || 500;
    return res.status(statusCode).json({ message: err.message || "Failed to send message" });
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { userId, otherUserId } = req.query;
    const authUserId = ensureAuthenticatedUserClaim(req.user?.userId, userId);

    if (!userId || !otherUserId) {
      return res.status(400).json({ message: "userId and otherUserId required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid userId or otherUserId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const query = {
      $or: [
        { sender: authUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: authUserId }
      ],
      deletedFor: { $ne: userObjectId },
      ...parseSinceFilter(req.query),
    };

    const msgs = await Message.find(query)
      .sort({ createdAt: 1 })
      .populate("sender", "name email rollNo")
      .populate("receiver", "name email rollNo")
      .populate("product", "title price");

    return res.json({ data: msgs });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const authUserId = ensureAuthenticatedUserClaim(req.user?.userId, userId);
    if (!userId) return res.status(400).json({ message: "userId required" });
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(authUserId);

    const convos = await Message.aggregate([
      {
        $match: {
          $or: [{ sender: userObjectId }, { receiver: userObjectId }],
          deletedFor: { $ne: userObjectId }
        }
      },
      {
        $addFields: {
          otherUser: {
            $cond: [{ $eq: ["$sender", userObjectId] }, "$receiver", "$sender"]
          }
        }
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$otherUser",
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$receiver", userObjectId] },
                    { $eq: ["$readAt", null] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "otherUser"
        }
      },
      {
        $addFields: {
          otherUser: { $arrayElemAt: ["$otherUser", 0] }
        }
      },
      {
        $project: {
          _id: 1,
          unreadCount: 1,
          lastMessage: 1,
          otherUser: {
            _id: "$otherUser._id",
            name: "$otherUser.name",
            email: "$otherUser.email",
            rollNo: "$otherUser.rollNo"
          }
        }
      },
      { $sort: { "lastMessage.createdAt": -1 } }
    ]);

    return res.json({ data: convos });
  } catch (err) {
    if (err?.statusCode) {
      return res.status(err.statusCode).json({ message: err.message });
    }
    next(err);
  }
};

export const getRoomId = (req, res) => {
  try {
    const { userId, otherUserId } = req.query;
    ensureAuthenticatedUserClaim(req.user?.userId, userId);
    if (!userId || !otherUserId) {
      return res.status(400).json({ message: "userId and otherUserId required" });
    }
    return res.json({ roomId: buildRoomId(userId, otherUserId) });
  } catch (err) {
    const statusCode = err?.statusCode || 500;
    return res.status(statusCode).json({ message: err.message || "Failed to build room" });
  }
};

export const markAsDelivered = async (req, res) => {
  try {
    const authUserId = String(req.user?.userId || "");
    const { messageIds } = req.body;
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: "messageIds array required" });
    }

    await Message.updateMany(
      { _id: { $in: messageIds }, receiver: authUserId, deliveredAt: null },
      { deliveredAt: new Date() }
    );

    return res.json({ message: "Messages marked as delivered" });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const markAsRead = async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;
    const authUserId = ensureAuthenticatedUserClaim(req.user?.userId, userId);
    if (!userId || !otherUserId) {
      return res.status(400).json({ message: "userId and otherUserId required" });
    }

    const query = {
      sender: otherUserId,
      receiver: authUserId,
      readAt: null,
      deletedFor: { $ne: authUserId }
    };

    const updated = await Message.updateMany(query, { 
      readAt: new Date(),
      deliveredAt: new Date() // Also mark as delivered if not already
    });

    return res.json({ 
      message: "Messages marked as read",
      count: updated.modifiedCount 
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getUnreadCount = async (req, res) => {
  try {
    const { userId } = req.query;
    const authUserId = ensureAuthenticatedUserClaim(req.user?.userId, userId);
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const count = await Message.countDocuments({
      receiver: authUserId,
      readAt: null,
      deletedFor: { $ne: authUserId }
    });

    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;
    const authUserId = ensureAuthenticatedUserClaim(req.user?.userId, userId);
    if (!userId || !otherUserId) {
      return res.status(400).json({ message: "userId and otherUserId required" });
    }

    const result = await Message.updateMany({
      $or: [
        { sender: authUserId, receiver: otherUserId },
        { sender: otherUserId, receiver: authUserId }
      ],
      deletedFor: { $ne: authUserId }
    }, {
      $addToSet: { deletedFor: authUserId }
    });

    return res.json({
      message: "Conversation hidden successfully",
      deletedCount: result.modifiedCount || 0
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to delete conversation" });
  }
};