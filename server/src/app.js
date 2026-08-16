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
import path from "path";
import { fileURLToPath } from "url";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import productRoutes from "./routes/product.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import cartRoutes from "./routes/cart.routes.js";
import paymentRoutes from "./routes/payment.routes.js";
import { generalLimiter } from "./middlewares/rateLimit.middleware.js";
import { securityMiddleware } from "./middlewares/validate.js";

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientBuildPath = path.resolve(__dirname, "../../client/build");

const buildAllowedOrigins = () => {
  const configuredOrigins = new Set([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
    "http://localhost:5000",
    "https://campus-trade-mu.vercel.app"
  ]);

  [
    process.env.CLIENT_URL,
    process.env.REACT_APP_CLIENT_URL,
    process.env.VERCEL_URL,
    process.env.FRONTEND_URL,
  ].forEach((value) => {
    if (!value) return;
    const normalized = String(value).trim().replace(/\/+$/, "");
    if (normalized) {
      configuredOrigins.add(normalized.startsWith("http") ? normalized : `https://${normalized}`);
    }
  });

  return Array.from(configuredOrigins);
};

const allowedOrigins = buildAllowedOrigins();

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
        imgSrc: ["'self'", "data:", "blob:", ...allowedOrigins, "https://res.cloudinary.com"],
        fontSrc: ["'self'", "fonts.gstatic.com", "data:"],
        connectSrc: ["'self'", ...allowedOrigins, "wss://*", "https://api.razorpay.com"],
        frameSrc: ["'self'", "https://checkout.razorpay.com"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false,
  })
);

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin);
    if (isAllowed) {
      return callback(null, true);
    }

    return callback(new Error(`Not allowed by CORS: ${origin}`));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "x-requested-with"],
  maxAge: 3600,
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
app.get("/api/health", (req, res) => {
  res.json({ message: "CampusTrade API is running 🚀" });
});

// Serve the React production build from the same server in production.
if (process.env.NODE_ENV === "production") {
  app.use(express.static(clientBuildPath));

  app.get(/^(?!\/api|\/uploads).*/, (req, res) => {
    res.sendFile(path.join(clientBuildPath, "index.html"));
  });
}

export default app;