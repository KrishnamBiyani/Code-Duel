import express from "express";
import { createRoom, joinRoom } from "../controllers/room.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/create", protectRoute, createRoom);
router.post("/join", protectRoute, joinRoom);

export default router;
