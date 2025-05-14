import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import http from "http";
import { Server } from "socket.io";

import authRoutes from "./src/routes/auth.route.js";
import { connectDB } from "./src/lib/db.js";

dotenv.config();

const app = express();
const server = http.createServer(app);

const PORT = process.env.PORT;

app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);

server.listen(PORT, () => {
  console.log(`server started: ${PORT}`);
  connectDB();
});
