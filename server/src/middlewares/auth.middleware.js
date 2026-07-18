import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
export const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, env.jwtSecret);

    req.user = {
      userId: decoded.userId
    };

    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Session expired" });
    }
    console.error("AUTH ERROR:", error.message);
    return res.status(401).json({ message: "Invalid token" });
  }
};
