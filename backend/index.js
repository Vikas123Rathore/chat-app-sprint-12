require("dotenv").config();

const express = require("express");
const http = require("http");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const { Server } = require("socket.io");

const connectDB = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const roomRoutes = require("./routes/roomRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();

// ==========================================
// DATABASE
// ==========================================

connectDB();

// ==========================================
// MIDDLEWARE
// ==========================================

app.use(express.json());

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(cookieParser());

// Static uploads
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ==========================================
// CORS
// ==========================================

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

console.log("Allowed CORS origins:", allowedOrigins);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an origin
      // Example: Postman/server-to-server
      if (!origin) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.log("Blocked CORS origin:", origin);

      return callback(
        new Error("CORS: Origin not allowed")
      );
    },

    credentials: true,
  })
);

// ==========================================
// API ROUTES
// ==========================================

app.use("/api/auth", authRoutes);

app.use("/api/user", userRoutes);

app.use("/api/room", roomRoutes);

app.use("/api/message", messageRoutes);

// ==========================================
// HOME / TEST ROUTE
// ==========================================

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "ChatFlow API running",
  });
});

// ==========================================
// SOCKET.IO
// ==========================================

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("Socket connected:", socket.id);

  socket.on("joinRoom", (roomId) => {
    socket.join(roomId);

    console.log(
      `Socket ${socket.id} joined room ${roomId}`
    );
  });

  socket.on("leaveRoom", (roomId) => {
    socket.leave(roomId);
  });

  socket.on("disconnect", () => {
    console.log(
      "Socket disconnected:",
      socket.id
    );
  });
});

// ==========================================
// SERVER
// ==========================================

const PORT = process.env.PORT || 8000;

server.listen(PORT, () => {
  console.log(
    `ChatFlow server running on port ${PORT}`
  );
});
