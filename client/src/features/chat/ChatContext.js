import React, { createContext, useCallback, useEffect, useRef, useState } from "react";
import { getConversations } from "../../api/chat.api";
import { registerSocketListener, unregisterSocketListener } from "./socket";

export const ChatContext = createContext();

/**
 * Global Chat Context
 * Manages:
 * - List of all conversations
 * - Unread counts at app level
 * - Real-time updates from socket
 */
export const ChatProvider = ({ children, userId }) => {
  const [conversations, setConversations] = useState([]);
  const [unreadTotalCount, setUnreadTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastError, setLastError] = useState("");
  const [activeConversationId, setActiveConversationId] = useState(null);
  const syncVersionRef = useRef(0);

  const computeTotalUnread = useCallback((items) => {
    return (items || []).reduce((sum, c) => sum + Number(c?.unreadCount || 0), 0);
  }, []);

  const mergeConversationList = useCallback((incoming = []) => {
    setConversations((prev) => {
      const map = new Map();
      prev.forEach((item) => map.set(String(item._id), item));

      incoming.forEach((item) => {
        const key = String(item._id);
        const existing = map.get(key);
        map.set(key, {
          ...(existing || {}),
          ...item,
          unreadCount: Number(item?.unreadCount || existing?.unreadCount || 0),
          lastMessage: item?.lastMessage || existing?.lastMessage || null,
        });
      });

      const next = Array.from(map.values());
      setUnreadTotalCount(computeTotalUnread(next));
      return next;
    });
  }, [computeTotalUnread]);

  const loadConversations = useCallback(async ({ replace = false } = {}) => {
    if (!userId) return;
    const requestVersion = ++syncVersionRef.current;
    setLoading(true);

    try {
      const data = await getConversations(userId);
      if (requestVersion !== syncVersionRef.current) return;

      if (replace) {
        setConversations(data);
        setUnreadTotalCount(computeTotalUnread(data));
      } else {
        mergeConversationList(data);
      }
      setLastError("");
    } catch (error) {
      console.error("Failed to load conversations:", error);
      if (requestVersion === syncVersionRef.current) {
        setLastError("Failed to load conversations");
      }
    } finally {
      if (requestVersion === syncVersionRef.current) {
        setLoading(false);
      }
    }
  }, [userId, mergeConversationList, computeTotalUnread]);

  // Initial sync
  useEffect(() => {
    loadConversations({ replace: true });
  }, [loadConversations]);

  // Socket-driven global updates; single listener registration in provider
  useEffect(() => {
    if (!userId) return;

    const onNewMessage = (message) => {
      const senderId = message?.sender?._id || message?.sender;
      const receiverId = message?.receiver?._id || message?.receiver;
      const conversationUserId = String(senderId) === String(userId) ? String(receiverId) : String(senderId);
      const isActiveConversation = String(activeConversationId || "") === String(conversationUserId);

      setConversations((prev) => {
        const updated = [...prev];
        const index = updated.findIndex((c) => String(c._id) === String(conversationUserId));
        const currentUnread = index >= 0 ? Number(updated[index].unreadCount || 0) : 0;

        if (index >= 0) {
          updated[index] = { ...updated[index], lastMessage: message, unreadCount: String(receiverId) === String(userId) && !isActiveConversation ? currentUnread + 1 : currentUnread };
        } else {
          updated.push({ _id: conversationUserId, lastMessage: message, unreadCount: String(receiverId) === String(userId) && !isActiveConversation ? 1 : 0, otherUser: null });
        }

        const total = updated.reduce((sum, c) => sum + Number(c.unreadCount || 0), 0);
        setUnreadTotalCount(total);
        return updated;
      });
    };

    const onMessagesReadUpdate = ({ otherUserId }) => {
      if (!otherUserId) return;
      setConversations((prev) => {
        const updated = prev.map((c) => String(c._id) === String(otherUserId) ? { ...c, unreadCount: 0 } : c);
        setUnreadTotalCount(computeTotalUnread(updated));
        return updated;
      });
    };

    registerSocketListener("newMessage", onNewMessage);
    registerSocketListener("messagesReadUpdate", onMessagesReadUpdate);

    return () => {
      unregisterSocketListener("newMessage", onNewMessage);
      unregisterSocketListener("messagesReadUpdate", onMessagesReadUpdate);
    };
  }, [userId, activeConversationId, computeTotalUnread]);

  const receiveNewMessage = useCallback((message, options = {}) => {
    const senderId = message?.sender?._id || message?.sender;
    const receiverId = message?.receiver?._id || message?.receiver;
    const conversationUserId = String(senderId) === String(userId) ? String(receiverId) : String(senderId);
    const isActiveConversation = String(options?.activeOtherUserId || "") === String(conversationUserId);

    setConversations((prev) => {
      const updated = [...prev];
      const index = updated.findIndex((c) => String(c._id) === String(conversationUserId));
      const nextUnread = String(receiverId) === String(userId) && !isActiveConversation ? 1 : 0;

      if (index >= 0) {
        const currentUnread = Number(updated[index].unreadCount || 0);
        updated[index] = {
          ...updated[index],
          lastMessage: message,
          unreadCount: String(receiverId) === String(userId) && !isActiveConversation ? currentUnread + 1 : currentUnread,
        };
      } else {
        updated.push({ _id: conversationUserId, lastMessage: message, unreadCount: nextUnread, otherUser: null });
      }

      const total = updated.reduce((sum, c) => sum + Number(c.unreadCount || 0), 0);
      setUnreadTotalCount(total);
      return updated;
    });
  }, [userId]);

  const markConversationAsRead = useCallback((otherUserId) => {
    if (!otherUserId) return;
    setConversations((prev) => {
      const updated = prev.map((c) =>
        String(c._id) === String(otherUserId) ? { ...c, unreadCount: 0 } : c
      );
      setUnreadTotalCount(computeTotalUnread(updated));
      return updated;
    });
  }, [computeTotalUnread]);

  const updateConversationLastMessage = useCallback((otherUserId, lastMessage, incrementUnread = false) => {
    setConversations((prev) => {
      const updated = prev.map((c) => {
        if (String(c._id) !== String(otherUserId)) return c;
        const currentUnread = Number(c.unreadCount || 0);
        return {
          ...c,
          lastMessage,
          unreadCount: incrementUnread ? currentUnread + 1 : currentUnread,
        };
      });
      setUnreadTotalCount(computeTotalUnread(updated));
      return updated;
    });
  }, [computeTotalUnread]);

  const removeConversation = useCallback((otherUserId) => {
    setConversations((prev) => {
      const updated = prev.filter((c) => String(c._id) !== String(otherUserId));
      setUnreadTotalCount(computeTotalUnread(updated));
      return updated;
    });
  }, [computeTotalUnread]);

  const value = {
    conversations,
    unreadTotalCount,
    loading,
    lastError,
    activeConversationId,
    setActiveConversationId,
    loadConversations,
    receiveNewMessage,
    markConversationAsRead,
    updateConversationLastMessage,
    removeConversation,
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};
