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
import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { getMessages, sendMessage, markAsRead } from "../../api/chat.api";
import { SOCKET_URL } from "../../utils/runtimeConfig";

const CHAT_UNREAD_UPDATED_EVENT = "chat-unread-updated";

const socket = io(SOCKET_URL, {
  autoConnect: false
});

// Tick mark component
const MessageStatus = ({ status, isMyMessage }) => {
  if (!isMyMessage) return null;
  
  const getTickMark = () => {
    switch (status) {
      case 'read':
        return <span className="chat-status chat-status-read">✓✓</span>; // Blue double tick
      case 'delivered':
        return <span className="chat-status chat-status-delivered">✓✓</span>; // Gray double tick
      default:
        return <span className="chat-status chat-status-sent">✓</span>; // Gray single tick
    }
  };

  return <span className="chat-status-wrap">{getTickMark()}</span>;
};

const ChatWindow = ({ userId, otherUserId, name }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const ready = useMemo(() => userId && otherUserId, [userId, otherUserId]);

  useEffect(() => {
    if (!ready) return;

    getMessages(userId, otherUserId).then((msgs) => {
      setMessages(msgs);
      // Mark messages as read when opening chat
      markAsRead({ userId, otherUserId })
        .then(() => window.dispatchEvent(new Event(CHAT_UNREAD_UPDATED_EVENT)))
        .catch(console.error);
      // Emit read receipt via socket
      socket.emit("messagesRead", { userId, otherUserId });
    });

    if (!socket.connected) socket.connect();
    socket.emit("join", { userId, otherUserId });

    const onNewMessage = (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      
      // If it's a message for me, mark it as read immediately
      if (msg.receiver === userId) {
        markAsRead({ userId, otherUserId })
          .then(() => window.dispatchEvent(new Event(CHAT_UNREAD_UPDATED_EVENT)))
          .catch(console.error);
        socket.emit("messagesRead", { userId, otherUserId });
      }
    };

    const onMessageStatusUpdate = ({ messageId, status }) => {
      setMessages((prev) =>
        prev.map((m) =>
          m._id === messageId
            ? { ...m, status, ...(status === 'delivered' ? { deliveredAt: new Date() } : {}), ...(status === 'read' ? { readAt: new Date() } : {}) }
            : m
        )
      );
    };

    const onMessagesReadUpdate = ({ userId: readByUserId }) => {
      // If the other user read my messages, update all my sent messages to read
      if (readByUserId === otherUserId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.sender?._id === userId && m.receiver === otherUserId
              ? { ...m, status: 'read', readAt: new Date() }
              : m
          )
        );
      }
    };

    socket.on("newMessage", onNewMessage);
    socket.on("messageStatusUpdate", onMessageStatusUpdate);
    socket.on("messagesReadUpdate", onMessagesReadUpdate);

    return () => {
      socket.off("newMessage", onNewMessage);
      socket.off("messageStatusUpdate", onMessageStatusUpdate);
      socket.off("messagesReadUpdate", onMessagesReadUpdate);
    };
  }, [ready, userId, otherUserId]);

  const handleSend = async () => {
    if (!text.trim() || !ready) return;

    const saved = await sendMessage({
      senderId: userId,
      receiverId: otherUserId,
      message: text.trim()
    });

    setMessages((prev) => [...prev, saved]);
    setText("");
  };

  if (!ready) return <div className="chat-empty">Select a chat</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        {name || "User"}
      </div>

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