import mongoose from "mongoose";

// Test case schema for internal evaluation
const testCaseSchema = new mongoose.Schema({
  input: { type: [String], required: true }, // ["2", "3"]
  expected_output: { type: String, required: true }, // "5"
});

// Schema for example shown in UI
const exampleSchema = new mongoose.Schema({
  input: { type: [String], required: true },
  output: { type: String, required: true },
});

// Main Question schema
const questionSchema = new mongoose.Schema(
  {
    questionId: { type: String, required: true, unique: true }, // e.g. "Q101"
    title: { type: String, required: true },
    description: { type: String, required: true },

    inputFormat: { type: String },
    outputFormat: { type: String },

    constraints: {
      nMin: { type: Number },
      nMax: { type: Number },
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
      default: "Easy",
    },

    tags: {
      type: [String],
      default: [],
    },

    examples: [exampleSchema], // For display in UI
    testCases: [testCaseSchema], // For backend evaluation
  },
  {
    timestamps: true,
  }
);

const Question = mongoose.model("Question", questionSchema);
export default Question;
