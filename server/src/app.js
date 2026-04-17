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
import helmet from "helmet";
import cookieParser from "cookie-parser";
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

// Security: Set secure HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://checkout.razorpay.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com"],
        imgSrc: ["'self'", 'data:', 'blob:', process.env.CLIENT_URL || "http://localhost:3000", "https://res.cloudinary.com"],
        fontSrc: ["'self'", "fonts.gstatic.com", 'data:'],
        connectSrc: ["'self'", process.env.CLIENT_URL || "http://localhost:3000", "wss://*", "https://api.razorpay.com"],
        frameSrc: ["'self'", "https://checkout.razorpay.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // For compatibility with some 3rd party scripts
  })
);

// CORS configuration - restrict to frontend only
const allowedOrigins = [
  "http://localhost:3000",
  "https://campus-trade-mu.vercel.app"
];
if (process.env.CLIENT_URL && !allowedOrigins.includes(process.env.CLIENT_URL)) {
  allowedOrigins.push(process.env.CLIENT_URL);
}
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS: ' + origin));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 3600
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' })); // Limit JSON payload size
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());

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