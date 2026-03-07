// // 
// import React, { useEffect, useMemo, useState } from "react";
// import { useSearchParams } from "react-router-dom";
// import ChatList from "../features/chat/ChatList";
// import ChatWindow from "../features/chat/ChatWindow";
// import { useAuth } from "../app/authContext";

// const Chat = () => {
//   const { user } = useAuth();
//   const [searchParams] = useSearchParams();
//   const [active, setActive] = useState({ otherUserId: null, productId: null });
// const name = searchParams.get("name") || "Seller";
//   useEffect(() => {
//     setActive({
//       otherUserId: searchParams.get("user") || null,
//       productId: searchParams.get("product") || null
//     });
//   }, [searchParams]);

// const userId = useMemo(() => user?._id || user?.id || user?.userId, [user]);

//   return (
//     <div className="container" style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
//       <ChatList userId={userId} onSelect={setActive} />
//       <ChatWindow userId={userId} otherUserId={active.otherUserId} productId={active.productId} />
//     </div>
//   );
// };

// export default Chat;
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ChatList from "../features/chat/ChatList";
import ChatWindow from "../features/chat/ChatWindow";
import { useAuth } from "../app/authContext";
import "../styles/global.css";

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [active, setActive] = useState({
    otherUserId: null,
    name: "User"
  });

  useEffect(() => {
    setActive({
      otherUserId: searchParams.get("user") || null,
      name: searchParams.get("name") || "User"
    });
  }, [searchParams]);

  const userId = useMemo(
    () => user?._id || user?.id || user?.userId,
    [user]
  );

  if (!user) {
    return (
      <div className="auth-page page">
        <div className="auth-card auth-gate">
          <h2 className="auth-title">Connect with the seller</h2>
          <p className="auth-subtitle">
            Please log in to access seller contact and chat.
          </p>
          <button className="auth-gate-arrow" onClick={() => navigate("/marketplace")}
            aria-label="Back to marketplace"
          >
            <span className="auth-gate-arrow-icon">&larr;</span>
          </button>
          <div className="auth-gate-actions">
            <button className="btn btn-primary" onClick={() => navigate("/login")}>Log in</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container page page-shell chat-page chat-layout">
      <ChatList userId={userId} onSelect={setActive} />
      <ChatWindow
        userId={userId}
        otherUserId={active.otherUserId}
        name={active.name}
      />
    </div>
  );
};

export default Chat;