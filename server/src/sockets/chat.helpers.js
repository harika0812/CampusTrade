import jwt from "jsonwebtoken";

export const buildRoomId = (userA, userB) => {
  const [u1, u2] = [String(userA), String(userB)].sort();
  return `${u1}_${u2}`;
};

export const isAuthorizedRoomJoin = ({ authUserId, otherUserId, claimedUserId }) => {
  if (!authUserId || !otherUserId) return false;
  if (claimedUserId && String(claimedUserId) !== String(authUserId)) return false;
  return true;
};

export const extractSocketToken = (socket) => {
  const authToken = socket?.handshake?.auth?.token;
  if (authToken && typeof authToken === "string") {
    return authToken.startsWith("Bearer ") ? authToken.slice(7) : authToken;
  }

  const authHeader = socket?.handshake?.headers?.authorization;
  if (authHeader && typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  return "";
};

export const verifySocketToken = ({ token, secret }) => {
  if (!token || !secret) {
    throw new Error("Missing token or secret");
  }

  const decoded = jwt.verify(token, secret);
  const userId = decoded?.userId || decoded?.id;
  if (!userId) {
    throw new Error("Token missing user identity");
  }

  return String(userId);
};
