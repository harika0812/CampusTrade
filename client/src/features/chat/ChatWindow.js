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
import { getMessages, sendMessage } from "../../api/chat.api";

const socket = io(process.env.REACT_APP_SOCKET_URL || "http://localhost:5000", {
  autoConnect: false
});

const ChatWindow = ({ userId, otherUserId, productId, name, productTitle }) => {
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const ready = useMemo(() => userId && otherUserId, [userId, otherUserId]);

  useEffect(() => {
    if (!ready) return;

    getMessages(userId, otherUserId, productId).then(setMessages);

    if (!socket.connected) socket.connect();
    socket.emit("join", { userId, otherUserId, productId });

   const onNewMessage = (msg) => {
  setMessages((prev) => {
    if (prev.some((m) => m._id === msg._id)) return prev;
    return [...prev, msg];
  });
};

    socket.on("newMessage", onNewMessage);
    return () => {
      socket.off("newMessage", onNewMessage);
    };
  }, [ready, userId, otherUserId, productId]);

const handleSend = async () => {
  if (!text.trim() || !ready) return;

  const saved = await sendMessage({
    senderId: userId,
    receiverId: otherUserId,
    productId,
    message: text.trim()
  });

  setMessages((prev) => [...prev, saved]);
  setText("");
};
if (!ready) return <div className="chat-empty">Select a chat</div>;

  return (
    <div className="chat-window">
      <div className="chat-header">
        Chat with {name || "Seller"}
        {productTitle ? ` • ${productTitle}` : ""}
      </div>

      <div className="chat-messages">
        {messages.map((m) => (
          <div
            key={m._id}
            className={`chat-bubble ${m.sender?._id === userId ? "me" : "them"}`}
          >
            {m.message}
            <div className="chat-time">
              {new Date(m.createdAt).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      <div className="chat-input">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message…"
        />
        <button onClick={handleSend}>Send</button>
      </div>
    </div>
  );
};

export default ChatWindow;