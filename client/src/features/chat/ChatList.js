import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { getConversations } from "../../api/chat.api";

const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
  autoConnect: false
});

const ChatList = ({ userId, onSelect }) => {
  const [convos, setConvos] = useState([]);

  useEffect(() => {
    if (!userId) return;
    const load = () => getConversations(userId).then(setConvos);
    load();
    if (!socket.connected) socket.connect();
    const onNewMessage = () => load();
    socket.on("newMessage", onNewMessage);

    const t = setInterval(load, 5000);
    return () => {
      clearInterval(t);
      socket.off("newMessage", onNewMessage);
    };
  }, [userId]);

  return (
    <div className="chat-list">
      <h3>Chats</h3>
      {convos.length === 0 && <div className="muted">No conversations yet</div>}
      {convos.map((c) => {
        const msg = c.lastMessage;
        const otherUserId = c._id.otherUser;
        const productId = c._id.product;
        const otherUserName = c.otherUser?.name || "User";
        const productTitle = msg?.product?.title || c.product?.title || "";

        return (
          <button
            key={`${otherUserId}_${productId || "none"}`}
            className="chat-list-item"
            onClick={() =>
              onSelect({ otherUserId, productId, name: otherUserName, productTitle })
            }
          >
            <div className="chat-title">
              {otherUserName}
            </div>
            <div className="chat-preview">
              {msg?.product?.title ? `Item: ${msg.product.title} • ${msg.message}` : msg?.message}
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ChatList;