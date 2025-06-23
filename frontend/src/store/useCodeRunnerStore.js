import { create } from "zustand";
import axios from "axios";
import { useRoomStore } from "./useRoomStore";
import { axiosInstance } from "../lib/axios";

const getLanguageId = (lang) => {
  switch (lang) {
    case "cpp":
      return 54; // C++ (G++)
    case "python":
      return 71; // Python 3
    case "javascript":
      return 63; // Node.js
    default:
      return 54; // fallback to C++
  }
};

const getDefaultCode = (lang) => {
  switch (lang) {
    case "cpp":
      return "// Write your C++ code here";
    case "python":
      return "# Write your Python code here";
    case "javascript":
      return "// Write your JavaScript code here";
    default:
      return "";
  }
};

export const useCodeStore = create((set, get) => ({
  code: getDefaultCode("cpp"),
  setCode: (code) => set({ code }),

  isRunning: false,
  setIsRunning: (isRunning) => set({ isRunning }),

  results: [],
  setResults: (results) => set({ results }),

  customInput: "",
  setCustomInput: (input) => set({ customInput: input }),

  customResult: null,
  setCustomResult: (result) => set({ customResult: result }),

  submissionMessage: null,
  setSubmissionMessage: (message) => set({ submissionMessage: message }),

  winnerId: null,
  setWinnerId: (id) => set({ winnerId: id }),

  language: "cpp", // default
  setLanguage: (lang) => set({ language: lang, code: getDefaultCode(lang) }),

  isRunningTests: false,
  isSubmitting: false,
  isRunningCustomTest: false,

  setIsRunningTests: (value) => set({ isRunningTests: value }),
  setIsSubmitting: (value) => set({ isSubmitting: value }),
  setIsRunningCustomTest: (value) => set({ isRunningCustomTest: value }),

  // Run predefined test cases
  handleRun: async (question) => {
    set({ isRunning: true, results: [] });
    const testCases = question.testCases || [];
    const newResults = [];

    for (const [i, test] of testCases.entries()) {
      try {
        const res = await axiosInstance.post("/judge/run", {
          language_id: getLanguageId(get().language), // C++ language id for judge0
          source_code: get().code,
          stdin: test.input.join("\n"),
        });

        const result = res.data;

        if (result.compile_output || result.stderr) {
          newResults.push({
            index: i + 1,
            status: "❌ Error",
            input: test.input.join("\n"),
            expected: test.expected_output,
            actual: result.compile_output || result.stderr,
          });
        } else {
          const actual = (result.stdout || "").trim();
          const expected = (test.expected_output || "").trim();

          newResults.push({
            index: i + 1,
            status: actual === expected ? "✅ Passed" : "❌ Failed",
            input: test.input.join("\n"),
            expected,
            actual,
          });
        }
      } catch (err) {
        newResults.push({
          index: i + 1,
          status: "❌ Error",
          input: test.input.join("\n"),
          expected: test.expected_output,
          actual: "Server Error",
        });
      }
    }

    set({ results: newResults, isRunning: false });
  },

  // Run custom test case
  handleRunCustomTest: async () => {
    if (!get().customInput) {
      alert("Please enter custom input.");
      return;
    }

    set({ isRunning: true, customResult: null });

    try {
      const res = await axiosInstance.post("/judge/run", {
        language_id: getLanguageId(get().language),
        source_code: get().code,
        stdin: get().customInput,
      });

      if (res.data.compile_output || res.data.stderr) {
        set({
          customResult:
            res.data.compile_output || res.data.stderr || "Error running code",
        });
      } else {
        set({ customResult: res.data.stdout || "(No output)" });
      }
    } catch (err) {
      set({ customResult: "Server error running code" });
    }

    set({ isRunning: false });
  },

  // Submit code, check all test cases, then emit winner
  handleSubmit: async ({ question, roomId, authUser }) => {
    const socket = useRoomStore.getState().socket;
    set({ isRunning: true, results: [] });

    const testCases = question.testCases || [];
    const newResults = [];
    let allPassed = true;

    for (const [i, test] of testCases.entries()) {
      try {
        const res = await axiosInstance.post("/judge/run", {
          language_id: getLanguageId(get().language),
          source_code: get().code,
          stdin: test.input.join("\n"),
        });

        const result = res.data;

        if (result.compile_output || result.stderr) {
          allPassed = false;
          newResults.push({
            index: i + 1,
            status: "❌ Error",
            input: test.input.join("\n"),
            expected: test.expected_output,
            actual: result.compile_output || result.stderr,
          });
          break; // stop on first failure
        } else {
          const actual = (result.stdout || "").trim();
          const expected = (test.expected_output || "").trim();

          const passed = actual === expected;
          if (!passed) allPassed = false;

          newResults.push({
            index: i + 1,
            status: passed ? "✅ Passed" : "❌ Failed",
            input: test.input.join("\n"),
            expected,
            actual,
          });

          if (!passed) break;
        }
      } catch (err) {
        allPassed = false;
        newResults.push({
          index: i + 1,
          status: "❌ Error",
          input: test.input.join("\n"),
          expected: test.expected_output,
          actual: "Server Error",
        });
        break;
      }
    }

    set({ results: newResults, isRunning: false });

    if (allPassed) {
      try {
        await axiosInstance.post("/submit", {
          code: get().code,
          questionId: question.id,
          roomId,
          userId: authUser._id,
        });

        get().setSubmissionMessage(
          "✅ All test cases passed! Submission successful."
        );

        if (socket) {
          socket.emit("declare-winner", { winnerId: authUser._id, roomId });
        }
      } catch (err) {
        get().setSubmissionMessage(
          "❌ Submission failed. Some test cases did not pass."
        );
      }
    } else {
      get().setSubmissionMessage("❌ Submission failed due to server error.");
    }
  },
}));
