const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();

// Enable CORS
app.use(cors());

// Parse JSON bodies
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*", // for development
    methods: ["GET", "POST"],
  },
});

const userSocketMap = {};
const roomStates = new Map(); // Track code state per room

// JDoodle API proxy endpoint
app.post("/api/execute", async (req, res) => {
  try {
    const { script, language, stdin } = req.body;
    
    // Validate required fields
    if (!script || !language) {
      return res.status(400).json({ error: "Script and language are required" });
    }

    // JDoodle API configuration
    const jdoodleConfig = {
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET,
    };

    // Check if credentials are configured
    if (!jdoodleConfig.clientId || !jdoodleConfig.clientSecret) {
      return res.status(500).json({ 
        error: "JDoodle API credentials not configured on server" 
      });
    }

    // Make request to JDoodle API
    console.log(`Executing ${language} code...`);
    const response = await axios.post("https://api.jdoodle.com/v1/execute", {
      clientId: jdoodleConfig.clientId,
      clientSecret: jdoodleConfig.clientSecret,
      script: script,
      language: language,
      stdin: stdin || "",
      versionIndex: "0",
    });

    console.log("JDoodle response:", response.data);
    res.json(response.data);
    
  } catch (error) {
    console.error("JDoodle API error:", error.response?.data || error.message);
    res.status(500).json({ 
      error: error.response?.data?.error || "Failed to execute code",
      details: error.message 
    });
  }
});

const getAllConnectedClients = (roomId) => {
  return Array.from(io.sockets.adapter.rooms.get(roomId) || []).map(
    (socketId) => {
      return {
        socketId,
        username: userSocketMap[socketId],
      };
    }
  );
};

io.on("connection", (socket) => {
  console.log(`user connected : ${socket.id}`);

  socket.on("join", ({ roomId, username }) => {
    userSocketMap[socket.id] = username;
    socket.join(roomId);

    const clients = getAllConnectedClients(roomId);

    // Send current room state if it exists
    const currentCode = roomStates.get(roomId);
    if (currentCode) {
      socket.emit("sync-code", { code: currentCode });
    }

    clients.forEach(({ socketId }) => {
      io.to(socketId).emit("joined", {
        clients,
        username,
        socketId: socket.id,
      });
    });
  });

  socket.on("code-change", ({ roomId, code }) => {
    roomStates.set(roomId, code); // Update room state
    socket.in(roomId).emit("code-change", { code });
  });

  socket.on("sync-code", ({ code, socketId }) => {
    io.to(socketId).emit("sync-code", { code });
  });

  socket.on("request-sync", ({ roomId }) => {
    const currentCode = roomStates.get(roomId);
    if (currentCode) {
      socket.emit("sync-code", { code: currentCode });
    }
  });

  // Handle code execution broadcast
  socket.on("code-executed", ({ roomId, language, output, executionTime }) => {
    // Broadcast execution result to other users in the room
    socket.in(roomId).emit("code-executed", {
      language,
      output,
      executionTime,
      username: userSocketMap[socket.id],
    });
    
    console.log(`Code executed in room ${roomId} by ${userSocketMap[socket.id]} (${language})`);
  });

  socket.on("disconnecting", () => {
    const rooms = [...socket.rooms];
    rooms.forEach((roomId) => {
      socket.in(roomId).emit("disconnected", {
        socketId: socket.id,
        username: userSocketMap[socket.id],
      });
    });
    delete userSocketMap[socket.id];
  });
});

const PORT = 5000;

server.listen(PORT, () => {
  console.log(`Server Is Running on Port ${PORT}`);
});