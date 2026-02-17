import mongoose from "mongoose";
import Message from "../models/Message.js";

const buildRoomId = (userA, userB, productId) => {
  const [u1, u2] = [userA, userB].sort();
  return productId ? `${u1}_${u2}_${productId}` : `${u1}_${u2}`;
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
  { path: "sender", select: "name email" },
  { path: "receiver", select: "name email" },
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

    const query = {
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    };

    if (productId) query.product = productId;

    const msgs = await Message.find(query)
      .sort({ createdAt: 1 })
      .populate("sender", "name email")
      .populate("receiver", "name email")
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
          $or: [{ sender: userObjectId }, { receiver: userObjectId }]
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
          _id: { otherUser: "$otherUser", product: "$product" },
          lastMessage: { $first: "$$ROOT" }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id.otherUser",
          foreignField: "_id",
          as: "otherUser"
        }
      },
      {
        $lookup: {
          from: "products",
          localField: "_id.product",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $addFields: {
          otherUser: { $arrayElemAt: ["$otherUser", 0] },
          product: { $arrayElemAt: ["$product", 0] }
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
  const { userId, otherUserId, productId } = req.query;
  if (!userId || !otherUserId) {
    return res.status(400).json({ message: "userId and otherUserId required" });
  }
  return res.json({ roomId: buildRoomId(userId, otherUserId, productId) });
};