export const buildConversationKey = (userId, otherUserId) =>
  `chat:lastSeen:${String(userId || "")}:${String(otherUserId || "")}`;

export const getLastSeen = (storageLike, conversationKey) => {
  if (!storageLike || !conversationKey) return "";
  const value = storageLike.getItem(conversationKey);
  return typeof value === "string" ? value : "";
};

export const setLastSeen = (storageLike, conversationKey, timestamp) => {
  if (!storageLike || !conversationKey || !timestamp) return;
  storageLike.setItem(conversationKey, timestamp);
};

export const mergeMessagesById = (existingMessages = [], incomingMessages = []) => {
  const byId = new Map();

  for (const msg of existingMessages) {
    if (!msg?._id) continue;
    byId.set(String(msg._id), msg);
  }

  for (const msg of incomingMessages) {
    if (!msg?._id) continue;
    byId.set(String(msg._id), msg);
  }

  return Array.from(byId.values()).sort(
    (left, right) => new Date(left?.createdAt || 0).getTime() - new Date(right?.createdAt || 0).getTime()
  );
};

export const getLatestMessageTimestamp = (messages = []) => {
  let latest = "";

  for (const msg of messages) {
    const createdAt = msg?.createdAt ? new Date(msg.createdAt) : null;
    if (!createdAt || Number.isNaN(createdAt.getTime())) continue;

    if (!latest || createdAt.getTime() > new Date(latest).getTime()) {
      latest = createdAt.toISOString();
    }
  }

  return latest;
};

export const filterMessagesSince = (messages = [], sinceTimestamp = "") => {
  if (!sinceTimestamp) return messages;
  const since = new Date(sinceTimestamp);
  if (Number.isNaN(since.getTime())) return messages;

  return messages.filter((msg) => {
    const createdAt = new Date(msg?.createdAt || 0);
    return !Number.isNaN(createdAt.getTime()) && createdAt.getTime() > since.getTime();
  });
};

export const applyDeliveredReceiptToMessages = (messages = [], messageId) =>
  messages.map((msg) =>
    String(msg?._id) === String(messageId)
      ? { ...msg, deliveredAt: msg?.deliveredAt || new Date().toISOString() }
      : msg
  );

export const applyReadReceiptToMessages = (messages = [], readByUserId, myUserId, otherUserId) => {
  if (String(readByUserId || "") !== String(otherUserId || "")) {
    return messages;
  }

  return messages.map((msg) => {
    const senderId = msg?.sender?._id || msg?.sender;
    const receiverId = msg?.receiver?._id || msg?.receiver;

    if (String(senderId || "") === String(myUserId || "") && String(receiverId || "") === String(otherUserId || "")) {
      return {
        ...msg,
        deliveredAt: msg?.deliveredAt || new Date().toISOString(),
        readAt: msg?.readAt || new Date().toISOString(),
      };
    }

    return msg;
  });
};
