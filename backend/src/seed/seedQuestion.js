import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import Question from "../models/questions.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const filePath = path.resolve(__dirname, "../../src/data/questions.json");

const isValidQuestionRecord = (question) =>
  question &&
  typeof question.questionId === "string" &&
  typeof question.title === "string" &&
  typeof question.description === "string" &&
  Array.isArray(question.examples) &&
  Array.isArray(question.testCases);

const normalizeRequiredString = (value) => (value === "" ? " " : value);

const normalizeQuestionRecord = (question) => ({
  ...question,
  examples: (question.examples || []).map((example) => ({
    ...example,
    output: normalizeRequiredString(example.output),
  })),
  testCases: (question.testCases || []).map((testCase) => ({
    ...testCase,
    expected_output: normalizeRequiredString(testCase.expected_output),
  })),
});

const seedQuestions = async () => {
  try {
    const data = fs.readFileSync(filePath, "utf-8");
    const questions = JSON.parse(data);

    if (!Array.isArray(questions) || questions.length === 0) {
      throw new Error("questions.json must contain a non-empty array");
    }

    const invalidQuestions = questions.filter(
      (question) => !isValidQuestionRecord(question)
    );

    if (invalidQuestions.length > 0) {
      throw new Error(
        `questions.json contains invalid question records: ${invalidQuestions
          .map((question) => question?.questionId || question?.title || "unknown")
          .join(", ")}`
      );
    }

    const normalizedQuestions = questions.map(normalizeQuestionRecord);

    await mongoose.connect(process.env.MONGODB_URI);
    await Question.deleteMany({});
    await Question.insertMany(normalizedQuestions);

    console.log(`Seeded ${normalizedQuestions.length} questions successfully.`);
  } catch (error) {
    console.error("Error seeding questions:", error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
  }
};

seedQuestions();
