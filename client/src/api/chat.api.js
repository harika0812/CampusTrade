import api from "./axios";

export const getConversations = async (userId) => {
  const { data } = await api.get(`/chat/conversations?userId=${userId}`);
  return data.data || [];
};

export const getMessages = async (userId, otherUserId, productId) => {
  const params = new URLSearchParams({ userId, otherUserId });
  if (productId) params.append("productId", productId);
  const { data } = await api.get(`/chat/messages?${params.toString()}`);
  return data.data || [];
};

export const sendMessage = async ({ senderId, receiverId, productId, message }) => {
  const { data } = await api.post("/chat/messages", {
    senderId,
    receiverId,
    productId,
    message
  });
  return data.data;
};