import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

const roomUsers = {};
const roomQuestions = {};
const QUESTION_DURATION_MS = 10 * 60 * 1000; // 10 minutes in ms

io.on("connection", (socket) => {
  console.log("New connection: ", socket.id);

  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);

    if (!roomUsers[roomId]) roomUsers[roomId] = [];

    roomUsers[roomId].push({ socketId: socket.id, user });
    console.log(`${user.fullName} joined room ${roomId}`);

    io.to(roomId).emit("room-users", roomUsers[roomId]);

    // If question exists, send question + start info only to this socket
    if (roomQuestions[roomId]) {
      socket.emit("question:send", roomQuestions[roomId]);
    }
  });

  socket.on("question:send", (question) => {
    for (const roomId in roomUsers) {
      const found = roomUsers[roomId].find((u) => u.socketId === socket.id);
      if (found) {
        const startTime = Date.now();
        const payload = {
          question,
          startTime,
          duration: QUESTION_DURATION_MS,
        };
        roomQuestions[roomId] = payload;
        io.to(roomId).emit("question:send", payload);
        break;
      }
    }
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);
    for (const roomId in roomUsers) {
      const beforeCount = roomUsers[roomId].length;

      roomUsers[roomId] = roomUsers[roomId].filter(
        (entry) => entry.socketId !== socket.id
      );

      const afterCount = roomUsers[roomId].length;

      if (afterCount !== beforeCount) {
        if (afterCount === 0) {
          delete roomUsers[roomId];
          delete roomQuestions[roomId];
          console.log(`Room ${roomId} is empty and removed.`);
        } else {
          io.to(roomId).emit("room-users", roomUsers[roomId]);
        }
        break;
      }
    }
  });
});

export { io, app, server };
