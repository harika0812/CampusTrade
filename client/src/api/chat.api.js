import api from "./axios";

export const getConversations = async (userId) => {
  const { data } = await api.get(`/chat/conversations?userId=${userId}`);
  return data.data || [];
};

export const getMessages = async (userId, otherUserId) => {
  const params = new URLSearchParams({ userId, otherUserId });
  const { data } = await api.get(`/chat/messages?${params.toString()}`);
  return data.data || [];
};

export const sendMessage = async ({ senderId, receiverId, productId, message }) => {
  const { data } = await api.post("/chat/messages", {
    senderId,
    receiverId,
    productId, // Optional - kept for context in messages
    message
  });
  return data.data;
};

export const markAsRead = async ({ userId, otherUserId }) => {
  await api.post("/chat/mark-read", { userId, otherUserId });
};

export const markAsDelivered = async ({ messageIds }) => {
  await api.post("/chat/mark-delivered", { messageIds });
};

export const deleteConversation = async ({ userId, otherUserId }) => {
  const { data } = await api.delete("/chat/conversation", { data: { userId, otherUserId } });
  return data;
};