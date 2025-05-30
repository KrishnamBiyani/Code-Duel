import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { app, server } from "./src/lib/socket.js";

import authRoutes from "./src/routes/auth.route.js";
import roomRoutes from "./src/routes/room.route.js";
import { connectDB } from "./src/lib/db.js";

dotenv.config();

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use("/api/auth", authRoutes);
app.use("/api/room", roomRoutes);

server.listen(PORT, () => {
  console.log(`server started: ${PORT}`);
  connectDB();
});
