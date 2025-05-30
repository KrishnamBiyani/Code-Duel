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

io.on("connection", (socket) => {
  console.log("new connection: ", socket.id);

  socket.on("join-room", ({ roomId, user }) => {
    socket.join(roomId);

    if (!roomUsers[roomId]) roomUsers[roomId] = [];

    roomUsers[roomId].push({ socketId: socket.id, user });
    console.log(`${user.name} joined room ${roomId}`);

    io.to(roomId).emit("room-users", roomUsers[roomId]);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected: ", socket.id);

    for (const roomId in roomUsers) {
      roomUsers[roomId] = roomUsers[roomId].filter(
        (entry) => entry.socketId !== socket.id
      );
      io.to(roomId).emit("room-users", roomUsers[roomId]);
    }
  });
});

export { io, app, server };
