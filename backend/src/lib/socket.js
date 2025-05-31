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
    console.log(`${user.fullName} joined room ${roomId}`);

    io.to(roomId).emit("room-users", roomUsers[roomId]);
  });

  socket.on("disconnect", () => {
    console.log("Disconnected:", socket.id);

    // Find the room the socket was in
    for (const roomId in roomUsers) {
      const beforeCount = roomUsers[roomId].length;

      roomUsers[roomId] = roomUsers[roomId].filter(
        (entry) => entry.socketId !== socket.id
      );

      const afterCount = roomUsers[roomId].length;

      // If someone was actually removed
      if (afterCount !== beforeCount) {
        console.log(`Updated users in room ${roomId}:`, roomUsers[roomId]);

        // If room is now empty, delete it
        if (afterCount === 0) {
          delete roomUsers[roomId];
          console.log(`Room ${roomId} is now empty and removed.`);
        } else {
          io.to(roomId).emit("room-users", roomUsers[roomId]);
        }

        break; // Exit early — socket can only be in one room
      }
    }
  });
});

export { io, app, server };
