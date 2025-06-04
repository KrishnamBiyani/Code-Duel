import express from "express";
import { randomQuestion } from "../controllers/question.controller.js";

const router = express.Router();

router.get("/random", randomQuestion);

export default router;
