import express from "express";
import { chatWithAI } from "../controllers/ai.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/chat", protectRoute, chatWithAI);

export default router;
