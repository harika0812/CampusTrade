// import express from "express";
// import cors from "cors";
// import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./routes/user.routes.js";
// const app = express();

// app.use(cors());
// // Middlewares
// import productRoutes from "./routes/product.routes.js";
// app.use(express.json());
// app.use("/api/users", userRoutes);

// app.use("/api/auth", authRoutes);

// app.use("/api/products", productRoutes);

// // Health check
// app.get("/", (req, res) => {
//   res.json({ message: "CampusTrade API is running 🚀" });
// });

// export default app;
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { generalLimiter } from "./middlewares/rateLimit.middleware.js";
import { securityMiddleware } from "./middlewares/validate.js";

const app = express();

// Render/hosting platforms sit behind reverse proxies. Trust the first proxy
// so req.ip is the real client IP for rate limiting.
app.set("trust proxy", 1);

// CORS configuration - restrict to frontend only
const corsOptions = {
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Security middleware - sanitize inputs
app.use(securityMiddleware);

// Rate limiting
app.use(generalLimiter);

app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/payment", paymentRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CampusTrade API is running 🚀" });
});

export default app;