import express from "express";
import cors from "cors";
import { createServer } from "http";
import { Server } from "socket.io";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import jobRoutes from "./routes/jobs.js";
import referralRoutes from "./routes/referrals.js";
import chatRoutes from "./routes/chat.js";
import adminRoutes from "./routes/admin.js";
import resumeRoutes from "./routes/resume.js";
import notificationRoutes from "./routes/notifications.js";
import { connectDB } from "./config/db.js";

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));

// Parse incoming request bodies as plain text so we can normalize/parse JSON ourselves.
app.use(express.text({ type: "*/*", limit: "10mb" }));

// Try to parse JSON from any incoming body (handles both proper JSON and common PowerShell quoting issues).
app.use((req, res, next) => {
  if (!req.body || typeof req.body !== "string") return next();

  const raw = req.body.trim();
  if (!raw) return next();

  const tryParse = (text) => {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  };

  // First, try normal JSON
  let parsed = tryParse(raw);
  if (parsed) {
    req.body = parsed;
    return next();
  }

  // Common PowerShell issue: single quotes for JSON keys/values.
  const normalized = raw
    .replace(/(['"])?([a-zA-Z0-9_]+)\1\s*:/g, '"$2":') // ensure keys are in double quotes
    .replace(/'/g, '"');

  parsed = tryParse(normalized);
  if (parsed) {
    req.body = parsed;
    return next();
  }

  res.status(400).json({ error: "Malformed JSON in request body" });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/jobs", jobRoutes);
app.use("/referrals", referralRoutes);
app.use("/chat", chatRoutes);
app.use("/admin", adminRoutes);
app.use("/resume", resumeRoutes);
app.use("/notifications", notificationRoutes);

app.get("/health", (_, res) => res.json({ status: "ok", version: "1.0.0" }));

// Socket.io for real-time chat
const onlineUsers = new Map();

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("user:online", (userId) => {
    onlineUsers.set(userId, socket.id);
    io.emit("users:online", Array.from(onlineUsers.keys()));
  });

  socket.on("chat:message", (data) => {
    const receiverSocket = onlineUsers.get(data.receiver_id);
    if (receiverSocket) {
      io.to(receiverSocket).emit("chat:message", data);
    }
  });

  socket.on("chat:typing", (data) => {
    const receiverSocket = onlineUsers.get(data.receiver_id);
    if (receiverSocket) io.to(receiverSocket).emit("chat:typing", data);
  });

  socket.on("disconnect", () => {
    for (const [userId, socketId] of onlineUsers) {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        break;
      }
    }
    io.emit("users:online", Array.from(onlineUsers.keys()));
  });
});

const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  httpServer.listen(PORT, () =>
    console.log(`🚀 ReferX Backend running on port ${PORT}`),
  );
}).catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
