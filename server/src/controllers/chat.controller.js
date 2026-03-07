import mongoose from "mongoose";
import Message from "../models/Message.js";

const buildRoomId = (userA, userB) => {
  const [u1, u2] = [userA, userB].sort();
  return `${u1}_${u2}`;
};
export const sendMessage = async (req, res) => {
  try {
    const { senderId, receiverId, productId, message } = req.body;

    if (!senderId || !receiverId || !message) {
      return res.status(400).json({ message: "senderId, receiverId, message required" });
    }

    if (!mongoose.Types.ObjectId.isValid(senderId) || !mongoose.Types.ObjectId.isValid(receiverId)) {
      return res.status(400).json({ message: "Invalid senderId or receiverId" });
    }
    const safeProductId =
      productId && mongoose.Types.ObjectId.isValid(productId) ? productId : undefined;

    const doc = await Message.create({
      sender: senderId,
      receiver: receiverId,
      product: safeProductId,
      message
    });
   const populated = await doc.populate([
  { path: "sender", select: "name email rollNo" },
  { path: "receiver", select: "name email rollNo" },
  { path: "product", select: "title price" }
]);
    return res.status(201).json({ message: "Message sent", data: populated });
  } catch (err) {
    console.error("CHAT SEND ERROR:", err);
    return res.status(500).json({ message: err.message || "Failed to send message" });
  }
};

export const getMessages = async (req, res, next) => {
  try {
    const { userId, otherUserId, productId } = req.query;
    if (!userId || !otherUserId) {
      return res.status(400).json({ message: "userId and otherUserId required" });
    }
    if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(otherUserId)) {
      return res.status(400).json({ message: "Invalid userId or otherUserId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    const query = {
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ],
      deletedFor: { $ne: userObjectId }
    };

    // Product is kept in messages for context, but not used for filtering

    const msgs = await Message.find(query)
      .sort({ createdAt: 1 })
      .populate("sender", "name email rollNo")
      .populate("receiver", "name email rollNo")
      .populate("product", "title price");

    return res.json({ data: msgs });
  } catch (err) {
    next(err);
  }
};

export const getConversations = async (req, res, next) => {
  try {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ message: "userId required" });
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid userId" });
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

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
    next(err);
  }
};

export const getRoomId = (req, res) => {
  const { userId, otherUserId } = req.query;
  if (!userId || !otherUserId) {
    return res.status(400).json({ message: "userId and otherUserId required" });
  }
  return res.json({ roomId: buildRoomId(userId, otherUserId) });
};

export const markAsDelivered = async (req, res) => {
  try {
    const { messageIds } = req.body;
    if (!Array.isArray(messageIds) || messageIds.length === 0) {
      return res.status(400).json({ message: "messageIds array required" });
    }

    await Message.updateMany(
      { _id: { $in: messageIds }, deliveredAt: null },
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
    if (!userId || !otherUserId) {
      return res.status(400).json({ message: "userId and otherUserId required" });
    }

    const query = {
      sender: otherUserId,
      receiver: userId,
      readAt: null,
      deletedFor: { $ne: userId }
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
    if (!userId) {
      return res.status(400).json({ message: "userId required" });
    }

    const count = await Message.countDocuments({
      receiver: userId,
      readAt: null,
      deletedFor: { $ne: userId }
    });

    return res.json({ count });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const deleteConversation = async (req, res) => {
  try {
    const { userId, otherUserId } = req.body;
    if (!userId || !otherUserId) {
      return res.status(400).json({ message: "userId and otherUserId required" });
    }

    const result = await Message.updateMany({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ],
      deletedFor: { $ne: userId }
    }, {
      $addToSet: { deletedFor: userId }
    });

    return res.json({
      message: "Conversation hidden successfully",
      deletedCount: result.modifiedCount || 0
    });
  } catch (err) {
    return res.status(500).json({ message: err.message || "Failed to delete conversation" });
  }
};