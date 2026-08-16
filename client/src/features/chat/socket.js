import { io } from "socket.io-client";
import { SOCKET_URL } from "../../utils/runtimeConfig";

const chatSocket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket", "polling"],
  reconnection: true,
  reconnectionAttempts: 8,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 8000,
});

// Track registered listeners to prevent duplicates
let registeredListeners = new Set();

/**
 * Initialize and connect the chat socket
 * Call ONCE when user logs in (e.g., in AuthContext or App)
 * Do NOT call this repeatedly
 */
export const initChatSocket = () => {
  const token = localStorage.getItem("token") || "";
  if (!token) {
    console.warn("No auth token available for socket connection");
    return null;
  }

  chatSocket.auth = { token };

  if (!chatSocket.connected && !chatSocket.connecting) {
    chatSocket.connect();
    console.log("🔌 Chat socket connecting...");
  }

  return chatSocket;
};

/**
 * Disconnect and cleanup the chat socket
 * Call ONCE when user logs out (e.g., in AuthContext or Navbar)
 */
export const disconnectChatSocket = () => {
  registeredListeners.clear();
  
  if (chatSocket.connected) {
    chatSocket.disconnect();
    console.log("🔌 Chat socket disconnected");
  }
};

/**
 * Register an event listener
 * Prevents duplicate listeners from being registered
 */
export const registerSocketListener = (eventName, handler) => {
  const key = `${eventName}:${handler.name || "anonymous"}`;
  
  // If already registered, don't add again
  if (registeredListeners.has(key)) {
    console.log(`⚠️  Listener ${key} already registered, skipping`);
    return;
  }

  chatSocket.on(eventName, handler);
  registeredListeners.add(key);
};

/**
 * Unregister an event listener
 */
export const unregisterSocketListener = (eventName, handler) => {
  const key = `${eventName}:${handler.name || "anonymous"}`;
  chatSocket.off(eventName, handler);
  registeredListeners.delete(key);
};

/**
 * Leave a conversation room
 */
export const leaveConversationRoom = (otherUserId) => {
  if (chatSocket.connected) {
    chatSocket.emit("leave", { otherUserId });
  }
};

/**
 * Join a conversation room
 */
export const joinConversationRoom = (otherUserId) => {
  if (chatSocket.connected) {
    chatSocket.emit("join", { otherUserId });
  } else {
    console.warn("Socket not connected, queueing join");
  }
};

export default chatSocket;
