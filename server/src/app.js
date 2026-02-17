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

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/chat", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ message: "CampusTrade API is running 🚀" });
});

export default app;