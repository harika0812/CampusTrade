import React, { useContext, useEffect, useState } from "react";
import { Trash2 } from "lucide-react";
import { deleteConversation } from "../../api/chat.api";
import { ChatContext } from "./ChatContext";

const CHAT_UNREAD_UPDATED_EVENT = "chat-unread-updated";

const formatChatName = (user) => {
  const rawName = String(user?.name || "User").trim();
  const displayName = rawName || "User";
  const rollNo = String(user?.rollNo || "").trim();
  return rollNo ? `${rollNo} - ${displayName}` : displayName;
};

const ChatList = ({ userId, onSelect }) => {
  const chatContext = useContext(ChatContext);
  const [deletingUserId, setDeletingUserId] = useState("");
  const [contextMenuUserId, setContextMenuUserId] = useState("");

  useEffect(() => {
    if (!chatContext) return;
    chatContext.setActiveConversationId(null);
  }, [chatContext]);

  useEffect(() => {
    const closeMenu = () => setContextMenuUserId("");
    const onEscape = (event) => {
      if (event.key === "Escape") setContextMenuUserId("");
    };

    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu);
    window.addEventListener("keydown", onEscape);

    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu);
      window.removeEventListener("keydown", onEscape);
    };
  }, []);

  const handleDeleteConversation = async (otherUserId, otherUserName) => {
    const confirmed = window.confirm(`Delete chat with ${otherUserName}? This cannot be undone.`);
    if (!confirmed || !userId || !otherUserId) return;

    try {
      setDeletingUserId(otherUserId);
      await deleteConversation({ userId, otherUserId });
      chatContext.removeConversation(otherUserId);
    } catch {
      alert("Failed to delete conversation.");
    } finally {
      setDeletingUserId("");
      setContextMenuUserId("");
    }
  };

  const openContextMenu = (event, otherUserId) => {
    event.preventDefault();
    setContextMenuUserId(otherUserId);
  };

  const handleSelectConversation = (otherUserId, otherUserName) => {
    chatContext.markConversationAsRead(otherUserId);
    window.dispatchEvent(new Event(CHAT_UNREAD_UPDATED_EVENT));
    onSelect({ otherUserId, name: otherUserName });
  };

  const convos = chatContext?.conversations || [];
  const lastError = chatContext?.lastError || "";

  return (
    <div className="chat-list">
      <h3>Chats</h3>
      {lastError && <div className="muted">{lastError}</div>}
      {convos.length === 0 && <div className="muted">No conversations yet</div>}
      {convos.map((c) => {
        const msg = c.lastMessage;
        const otherUserId = c._id;
        const otherUserName = formatChatName(c.otherUser);
        const unreadCount = c.unreadCount || 0;

        return (
          <div key={otherUserId} className="chat-list-row">
            <button
              className="chat-list-item"
              onContextMenu={(event) => openContextMenu(event, otherUserId)}
              onClick={() => handleSelectConversation(otherUserId, otherUserName)}
              disabled={deletingUserId === otherUserId}
            >
              <div className="chat-title">
                {otherUserName}
                {unreadCount > 0 && (
                  <span className="unread-badge">{unreadCount}</span>
                )}
              </div>
              <div className="chat-preview">
                {msg?.message || "No messages yet"}
              </div>
            </button>

            {contextMenuUserId === otherUserId && (
              <div
                role="menu"
                className="chat-context-menu"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  className="btn btn-outline chat-context-delete"
                  aria-label="Delete chat"
                  title="Delete chat"
                  onClick={() => handleDeleteConversation(otherUserId, otherUserName)}
                  disabled={deletingUserId === otherUserId}
                >
                  {deletingUserId === otherUserId ? "..." : <Trash2 size={14} strokeWidth={1.8} />}
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ChatList;