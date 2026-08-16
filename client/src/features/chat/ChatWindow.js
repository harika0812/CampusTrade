// import React, { useEffect, useMemo, useState } from "react";
// import { io } from "socket.io-client";
// import { getMessages } from "../../api/chat.api";

// const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
//   autoConnect: false
// });

// const ChatWindow = ({ userId, otherUserId, productId }) => {
//   const [messages, setMessages] = useState([]);
//   const [text, setText] = useState("");

//   const ready = useMemo(() => userId && otherUserId, [userId, otherUserId]);

//   useEffect(() => {
//     if (!ready) return;

//     getMessages(userId, otherUserId, productId).then(setMessages);

//     if (!socket.connected) socket.connect();
//     socket.emit("join", { userId, otherUserId, productId });

//     const onNewMessage = (msg) => {
//       setMessages((prev) => [...prev, msg]);
//     };

//     socket.on("newMessage", onNewMessage);
//     return () => {
//       socket.off("newMessage", onNewMessage);
//     };
//   }, [ready, userId, otherUserId, productId]);

//   const handleSend = async () => {
//     if (!text.trim() || !ready) return;
//     const payload = {
//       senderId: userId,
//       receiverId: otherUserId,
//       productId,
//       message: text.trim()
//     };

//     // send via socket for realtime + DB write
//     socket.emit("sendMessage", payload);
//     setText("");
//   };

//   if (!ready) return <div className="chat-empty">Select a chat</div>;

//   return (
    
//     <div className="chat-window">
//       <div className="chat-messages">
//         {messages.map((m) => (
//           <div
//             key={m._id}
//             className={`chat-bubble ${m.sender?._id === userId ? "me" : "them"}`}
//           >
//             {m.message}
//             <div className="chat-time">
//               {new Date(m.createdAt).toLocaleString()}
//             </div>
//           </div>
//         ))}
//       </div>
//       <div className="chat-input">
//         <input
//           value={text}
//           onChange={(e) => setText(e.target.value)}
//           placeholder="Type a message…"
//         />
//         <button onClick={handleSend}>Send</button>
//       </div>
//     </div>
//   );
// };

// export default ChatWindow;
import React, { useContext, useEffect, useMemo, useState } from "react";
import { getMessages, sendMessage, markAsRead } from "../../api/chat.api";
import chatSocket, {
  registerSocketListener,
  unregisterSocketListener,
  joinConversationRoom,
  leaveConversationRoom,
} from "./socket";
import { ChatContext } from "./ChatContext";
import {
  applyDeliveredReceiptToMessages,
  applyReadReceiptToMessages,
  buildConversationKey,
  getLastSeen,
  getLatestMessageTimestamp,
  mergeMessagesById,
  setLastSeen,
} from "./chatSync";

const createClientMessageId = () => {
  const cryptoApi = typeof window !== "undefined" ? window.crypto : null;
  if (cryptoApi?.randomUUID) return cryptoApi.randomUUID();
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
};

// Tick mark component
const MessageStatus = ({ status, isMyMessage }) => {
  if (!isMyMessage) return null;
  
  const getTickMark = () => {
    switch (status) {
      case 'read':
        return <span className="chat-status chat-status-read">✓✓</span>;
      case 'delivered':
        return <span className="chat-status chat-status-delivered">✓✓</span>;
      default:
        return <span className="chat-status chat-status-sent">✓</span>;
    }
  };

  return <span className="chat-status-wrap">{getTickMark()}</span>;
};

const ChatWindow = ({ userId, otherUserId, name }) => {
  const chatContext = useContext(ChatContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const ready = useMemo(() => userId && otherUserId, [userId, otherUserId]);

  useEffect(() => {
    if (!ready) return;
    chatContext?.setActiveConversationId(otherUserId);
    return () => chatContext?.setActiveConversationId(null);
  }, [ready, otherUserId, chatContext]);

  useEffect(() => {
    if (!ready || !chatSocket.connected) return;

    const conversationKey = buildConversationKey(userId, otherUserId);

    const persistLastSeen = (items) => {
      const latest = getLatestMessageTimestamp(items);
      if (!latest) return;
      setLastSeen(window.localStorage, conversationKey, latest);
    };

    const mergeAndPersist = (incoming) => {
      setMessages((prev) => {
        const next = mergeMessagesById(prev, incoming);
        persistLastSeen(next);
        return next;
      });
    };

    const syncMissedMessages = async () => {
      const since = getLastSeen(window.localStorage, conversationKey);
      const newer = await getMessages(userId, otherUserId, since ? { since } : {});
      if (newer.length > 0) {
        mergeAndPersist(newer);
      }
    };

    // Join room and load messages
    joinConversationRoom(otherUserId);

    getMessages(userId, otherUserId)
      .then((msgs) => {
        setMessages(msgs);
        persistLastSeen(msgs);
        setErrorMessage("");
      })
      .catch(() => {
        setErrorMessage("Unable to connect to the CampusTrade network right now. Please check your connection and try again.");
      });

    // Define event handlers
    const onConnect = () => {
      joinConversationRoom(otherUserId);
      syncMissedMessages().catch(() => {
        setErrorMessage("Unable to sync recent messages. Please try again.");
      });
    };

    const onNewMessage = (msg) => {
      const receiverId = msg?.receiver?._id || msg?.receiver;
      const senderId = msg?.sender?._id || msg?.sender;
      const matchesActiveThread = String(senderId || "") === String(otherUserId || "");

      if (matchesActiveThread) {
        mergeAndPersist([msg]);
      }

      if (String(receiverId || "") === String(userId || "") && matchesActiveThread) {
        chatSocket.emit("messageDelivered", { messageId: msg._id });
        markAsRead({ userId, otherUserId })
          .then(() => {
            if (chatContext) {
              chatContext.markConversationAsRead(otherUserId);
            }
            chatSocket.emit("messagesRead", { otherUserId });
          })
          .catch(() => {
            setErrorMessage("Unable to connect to the CampusTrade network right now. Please check your connection and try again.");
          });
      }
    };

    const onMessageStatusUpdate = ({ messageId, status }) => {
      if (status === "delivered") {
        setMessages((prev) => applyDeliveredReceiptToMessages(prev, messageId));
      }
      if (status === "read") {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === messageId
              ? { ...m, deliveredAt: m.deliveredAt || new Date().toISOString(), readAt: m.readAt || new Date().toISOString() }
              : m
          )
        );
      }
    };

    const onMessagesReadUpdate = ({ userId: readByUserId }) => {
      setMessages((prev) => applyReadReceiptToMessages(prev, readByUserId, userId, otherUserId));
    };

    const onChatError = () => {
      setErrorMessage("Unable to connect to the CampusTrade network right now. Please check your connection and try again.");
    };

    // Register socket listeners
    registerSocketListener("connect", onConnect);
    registerSocketListener("newMessage", onNewMessage);
    registerSocketListener("messageStatusUpdate", onMessageStatusUpdate);
    registerSocketListener("messagesReadUpdate", onMessagesReadUpdate);
    registerSocketListener("chatError", onChatError);

    // Cleanup
    return () => {
      leaveConversationRoom(otherUserId);
      unregisterSocketListener("connect", onConnect);
      unregisterSocketListener("newMessage", onNewMessage);
      unregisterSocketListener("messageStatusUpdate", onMessageStatusUpdate);
      unregisterSocketListener("messagesReadUpdate", onMessagesReadUpdate);
      unregisterSocketListener("chatError", onChatError);
    };
  }, [ready, userId, otherUserId, chatContext]);

  const handleSend = async () => {
    if (!text.trim() || !ready) return;

    const saved = await sendMessage({
      senderId: userId,
      receiverId: otherUserId,
      message: text.trim(),
      clientMessageId: createClientMessageId(),
    });

    setMessages((prev) => mergeMessagesById(prev, [saved]));
    setText("");
  };

  if (!ready) return <div className="chat-empty">Select a chat</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        {name || "User"}
      </div>

      {errorMessage ? <div className="chat-error-banner">{errorMessage}</div> : null}

      <div className="chat-messages">
        {messages.map((m) => {
          const isMyMessage = m.sender?._id === userId;
          const status = m.readAt ? 'read' : m.deliveredAt ? 'delivered' : 'sent';
          
          return (
            <div
              key={m._id}
              className={`chat-bubble ${isMyMessage ? "me" : "them"}`}
            >
              {m.product && (
                <div className="chat-product-ref">
                  Re: {m.product.title}
                </div>
              )}
              {m.message}
              <div className="chat-time">
                {new Date(m.createdAt).toLocaleString()}
                <MessageStatus status={status} isMyMessage={isMyMessage} />
              </div>
            </div>
          );
        })}
      </div>
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Type a message…"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;