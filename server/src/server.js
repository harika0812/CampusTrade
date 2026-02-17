// // // import express from "express";
// // // import mongoose from "mongoose";
// // // import cors from "cors";

// // // import authRoutes from "./routes/auth.routes.js";
// // // import userRoutes from "./routes/user.routes.js";
// // // import productRoutes from "./routes/product.routes.js";
// // // import { env } from "./config/env.js";

// // // const app = express();

// // // // Middleware
// // // app.use(cors());
// // // app.use(express.json());

// // // // Routes
// // // app.use("/api/auth", authRoutes);
// // // app.use("/api/users", userRoutes);
// // // app.use("/api/products", productRoutes);

// // // // DB Connection
// // // mongoose
// // //   .connect(env.mongoUri)
// // //   .then(() => console.log("MongoDB connected"))
// // //   .catch((err) => console.error(err));

// // // const PORT = env.port || 5000;
// // // app.listen(PORT, () => {
// // //   console.log(`Server running on port ${PORT}`);
// // // });
// // import express from "express";
// // import mongoose from "mongoose";
// // import cors from "cors";
// // import dotenv from "dotenv";

// // import authRoutes from "./routes/auth.routes.js";
// // import userRoutes from "./routes/user.routes.js";
// // import productRoutes from "./routes/product.routes.js";

// // dotenv.config();

// // const app = express();

// // app.use(cors());
// // app.use(express.json());

// // app.use("/api/auth", authRoutes);
// // app.use("/api/users", userRoutes);
// // app.use("/api/products", productRoutes);

// // mongoose
// //   .connect(process.env.MONGO_URI)
// //   .then(() => console.log("MongoDB connected"))
// //   .catch((err) => console.log(err));

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// import express from "express";
// import mongoose from "mongoose";
// import cors from "cors";
// import dotenv from "dotenv";
// import http from "http";
// import { Server } from "socket.io";
// import app from "./app.js";
// import { initChatSocket } from "./sockets/chat.socket.js";

// const server = http.createServer(app);
// const io = new Server(server, { cors: { origin: "*" } });

// initChatSocket(io);

// server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
// import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import productRoutes from "./routes/product.routes.js";
// import chatRoutes from "./routes/chat.routes.js";
// dotenv.config();

// const app = express();

// app.use(cors());
// app.use(express.json());
// app.use("/uploads", express.static("uploads")); // Add this to serve images

// app.use("/api/auth", authRoutes);
// app.use("/api/users", userRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/chat", chatRoutes);
// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log(err));

// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
import http from "http";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { Server } from "socket.io";
import app from "./app.js";
import { initChatSocket } from "./sockets/chat.socket.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

initChatSocket(io);

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));