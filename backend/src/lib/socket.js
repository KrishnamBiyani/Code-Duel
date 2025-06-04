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
const roomQuestions = {}; // ✅ Store question for each room

io.on("connection", (socket) => {
  console.log("new connection: ", socket.id);

  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);

    if (!roomUsers[roomId]) roomUsers[roomId] = [];

    roomUsers[roomId].push({ socketId: socket.id, user });
    console.log(`${user.fullName} joined room ${roomId}`);

    // Emit all users in the room
    io.to(roomId).emit("room-users", roomUsers[roomId]);

    // ✅ If question already exists, send it to this user only
    if (roomQuestions[roomId]) {
      socket.emit("question:send", roomQuestions[roomId]);
    }
  });

  // ✅ Receive and broadcast question to everyone in the room
  socket.on("question:send", (question) => {
    for (const roomId in roomUsers) {
      const found = roomUsers[roomId].find((u) => u.socketId === socket.id);
      if (found) {
        roomQuestions[roomId] = question; // ✅ Store it
        io.to(roomId).emit("question:send", question); // ✅ Broadcast to all
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
        console.log(`Updated users in room ${roomId}:`, roomUsers[roomId]);

        if (afterCount === 0) {
          delete roomUsers[roomId];
          delete roomQuestions[roomId]; // ✅ Optionally clear the question too
          console.log(`Room ${roomId} is now empty and removed.`);
        } else {
          io.to(roomId).emit("room-users", roomUsers[roomId]);
        }

        break;
      }
    }
  });
});

export { io, app, server };
