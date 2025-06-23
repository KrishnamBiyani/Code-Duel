import { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useRoomStore } from "../store/useRoomStore";
import { useCodeStore } from "../store/useCodeRunnerStore";
import { ChevronDown } from "lucide-react";

const CodeRunner = ({ question, roomId, authUser }) => {
  const { socket, timeLeftMs } = useRoomStore();

  const {
    code,
    setCode,
    isRunningTests,
    setIsRunningTests,
    isSubmitting,
    setIsSubmitting,
    isRunningCustomTest,
    setIsRunningCustomTest,
    results,
    customInput,
    setCustomInput,
    customResult,
    handleRun,
    handleRunCustomTest,
    handleSubmit,
    submissionMessage,
    setWinnerId,
    winnerId,
    language,
    setLanguage,
  } = useCodeStore();

  useEffect(() => {
    if (!socket || !authUser) return;

    const handleDeclareWinner = ({ winnerId }) => {
      setWinnerId(winnerId);
    };

    socket.on("declare-winner", handleDeclareWinner);

    return () => {
      socket.off("declare-winner", handleDeclareWinner);
    };
  }, [socket, authUser, setWinnerId]);

  useEffect(() => {
    if (timeLeftMs === 0 && !winnerId) {
      setWinnerId("draw");
    }
  }, [timeLeftMs, winnerId, setWinnerId]);

  const buttonBaseStyles =
    "flex items-center justify-center px-4 py-2 rounded text-white font-semibold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <>
      {winnerId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">
              {winnerId === "draw"
                ? "⏰ Time’s Up! It’s a Draw!"
                : winnerId === authUser._id
                ? "🎉 You Won!"
                : "👎 You Lost!"}
            </h1>
            <p className="text-lg text-gray-300">The match has ended.</p>
            <a
              href="/"
              className="inline-block mt-4 px-6 py-2 bg-pink-600 text-white font-semibold rounded hover:bg-pink-700 transition"
            >
              Go Back to Home
            </a>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-2 bg-[#1a1c23] rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-2xl font-bold text-pink-400">Code Editor</h2>

          <div className="relative w-32">
            <select
              className="appearance-none w-full bg-gray-800 text-white px-3 py-2 pr-10 rounded-md border border-gray-600 focus:outline-none focus:ring-2 focus:ring-pink-400 transition duration-150"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={18}
            />
          </div>
        </div>

        <Editor
          height="320px"
          language={language}
          value={code}
          onChange={(value) => {
            if (!winnerId) setCode(value);
          }}
          options={{
            minimap: { enabled: false },
            fontSize: 16,
            fontFamily: "'Fira Code', monospace",
            automaticLayout: true,
            theme: "vs-dark",
          }}
        />

        <div className="flex flex-wrap gap-4 mt-5">
          <button
            className={`${buttonBaseStyles} bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/40 cursor-pointer`}
            onClick={() => {
              setIsRunningTests(true);
              handleRun(question, language).finally(() =>
                setIsRunningTests(false)
              );
            }}
            disabled={isRunningTests}
          >
            {isRunningTests ? (
              <>
                <svg
                  className="animate-spin mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3-3 3h4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  />
                </svg>
                Running...
              </>
            ) : (
              "Run Tests"
            )}
          </button>

          <button
            className={`${buttonBaseStyles} bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-500/40 cursor-pointer`}
            onClick={() => {
              setIsSubmitting(true);
              handleSubmit({ question, roomId, authUser, language }).finally(
                () => setIsSubmitting(false)
              );
            }}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <svg
                  className="animate-spin mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3-3 3h4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  />
                </svg>
                Submitting...
              </>
            ) : (
              "Submit Code"
            )}
          </button>
        </div>

        {submissionMessage && (
          <div
            role="alert"
            className={`mt-6 p-4 rounded border ${
              submissionMessage.startsWith("✅")
                ? "bg-green-100 text-green-800 border-green-300"
                : "bg-red-100 text-red-800 border-red-300"
            } flex items-center gap-2`}
          >
            {submissionMessage.startsWith("✅") ? (
              <svg
                className="h-6 w-6 text-green-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6 text-red-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
            <span>{submissionMessage}</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold text-xl mb-4 text-pink-400">
              Test Results:
            </h3>
            {results.map((r, idx) => (
              <div
                key={idx}
                className="bg-gray-900 p-4 rounded mb-4 border border-gray-700"
              >
                <p className="mb-2">
                  <strong>Test Case {r.index}:</strong>{" "}
                  <span
                    className={
                      r.status.startsWith("✅")
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >
                    {r.status}
                  </span>
                </p>
                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed">
                  <strong>Input:</strong> {r.input}
                  {"\n"}
                  <strong>Expected:</strong> {r.expected}
                  {"\n"}
                  <strong>Output:</strong> {r.actual}
                </pre>
              </div>
            ))}
          </div>
        )}

        {/* Custom Test Case Runner */}
        <div className="mt-10 border border-gray-700 p-5 rounded shadow-lg bg-[#111214]">
          <h3 className="font-bold mb-3 text-pink-400 text-lg">
            Run Custom Test Case
          </h3>
          <textarea
            className="w-full p-3 border border-gray-600 rounded text-sm font-mono resize-none bg-[#1e2128] text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-400"
            rows={4}
            placeholder="Enter custom input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={isRunningCustomTest}
          />
          <button
            className={`${buttonBaseStyles} bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-500/40 mt-2 cursor-pointer`}
            onClick={() => {
              setIsRunningCustomTest(true);
              handleRunCustomTest().finally(() =>
                setIsRunningCustomTest(false)
              );
            }}
            disabled={isRunningCustomTest}
          >
            {isRunningCustomTest ? (
              <>
                <svg
                  className="animate-spin mr-2 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 018 8h-4l3 3-3 3h4a8 8 0 01-8 8v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
                  />
                </svg>
                Running...
              </>
            ) : (
              "Run Custom Test"
            )}
          </button>

          {customResult && (
            <div className="mt-5 p-3 border border-gray-600 rounded bg-gray-900 text-white whitespace-pre-wrap font-mono">
              <p className="font-semibold mb-1">Output:</p>
              <pre>{customResult}</pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CodeRunner;
