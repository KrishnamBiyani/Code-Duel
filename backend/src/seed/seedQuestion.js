import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import Question from "../models/questions.model.js";
import { fileURLToPath } from "url";

// Recreate __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Path to the JSON file
const filePath = path.resolve(__dirname, "../../src/data/questions.json");

const seedQuestions = async () => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const questions = JSON.parse(data);

    await mongoose.connect(process.env.MONGODB_URI);
    await Question.deleteMany();
    await Question.insertMany(questions);

    console.log("✅ Successfully seeded all questions");
    process.exit();
  } catch (err) {
    console.error("❌ Error seeding questions:", err);
    process.exit(1);
  }
};

seedQuestions();
