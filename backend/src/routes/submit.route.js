import express from "express";
import { submitCode } from "../controllers/submit.controller.js";

const router = express.Router();

router.post("/", submitCode);

export default router;
