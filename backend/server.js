const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const http = require("http");
const { Server } = require("socket.io");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const messageRoutes = require("./routes/messageRoutes");

dotenv.config();
connectDB();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: "*" },
});

io.on("connection", (socket) => {
  socket.on("join", (userId) => {
    socket.join(userId);
  });
  socket.on("sendMessage", (data) => {
    io.to(data.receiverId).emit("receiveMessage", data);
  });
  socket.on("disconnect", () => {});
});

app.use(cors());
app.use(express.json({ limit: "10mb" }));        // ← FIXED: 100kb → 10mb
app.use(express.urlencoded({ limit: "10mb", extended: true })); // ← NEW

app.get("/", (req, res) => {
  res.send("Dating app backend is running...");
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});