import { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useRoomStore } from "../store/useRoomStore";
import { useCodeStore } from "../store/useCodeRunnerStore";
import {
  ArrowLeft,
  Brain,
  ChevronDown,
  CircleCheck,
  Crown,
  Swords,
} from "lucide-react";
import AIChat from "./AIChat";

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

    const handleDeclareWinner = ({ winnerId: declaredWinnerId }) => {
      setWinnerId(declaredWinnerId);
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

  const duelOutcome =
    winnerId === "draw"
      ? {
          title: "Draw",
          headline: "Time's up. Nobody finished in time.",
          icon: Swords,
        }
      : winnerId === authUser._id
      ? {
          title: "Victory",
          headline: "You solved it first. Now analyze what made the solution work.",
          icon: Crown,
        }
      : {
          title: "Defeat",
          headline: "The duel is over. Use the assistant to understand the better path.",
          icon: Brain,
        };

  const OutcomeIcon = duelOutcome.icon;
  const isSubmissionSuccess =
    submissionMessage?.includes("All test cases passed") ||
    submissionMessage?.includes("successful");

  return (
    <>
      {winnerId && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 px-4 py-8">
          <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[0.85fr_1.35fr]">
            <div className="rounded-2xl border border-gray-700 bg-[#1a1c23] p-6 shadow-[0_0_10px_#dc2626]">
              <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-red-700 bg-black shadow-[0_0_10px_#dc2626]">
                <OutcomeIcon className="h-8 w-8 text-red-600" />
              </div>

              <p className="mb-2 text-sm uppercase tracking-[0.2em] text-white/60">
                Duel Result
              </p>
              <h1 className="mb-3 font-serif text-5xl font-bold text-white">
                {duelOutcome.title}
              </h1>
              <p className="mb-6 text-base leading-7 text-white/80">
                {duelOutcome.headline}
              </p>

              <div className="mb-6 rounded-2xl border border-gray-700 bg-[#0f1117] p-5">
                <p className="mb-2 text-sm uppercase tracking-[0.18em] text-white/60">
                  Problem Recap
                </p>
                <h2 className="font-serif text-2xl font-semibold text-white">
                  {question?.title || "DSA Problem"}
                </h2>
                <p className="mt-3 text-sm leading-6 text-white/80">
                  {question?.description ||
                    "Open the analysis assistant to review the problem and discuss the solution strategy."}
                </p>
              </div>

              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-3 rounded-xl border border-gray-700 bg-black p-4">
                  <CircleCheck className="mt-0.5 h-5 w-5 text-red-600" />
                  <div>
                    <p className="font-semibold text-white">
                      Post-match analysis unlocked
                    </p>
                    <p className="text-sm leading-6 text-white/70">
                      Ask for brute force vs optimal approaches, dry runs, edge
                      cases, or time complexity.
                    </p>
                  </div>
                </div>
              </div>

              <a
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-red-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-600 shadow-[0_0_10px_#dc2626]"
              >
                <ArrowLeft className="h-4 w-4" />
                Go Back to Home
              </a>
            </div>

            <div className="rounded-2xl border border-gray-700 bg-[#1a1c23] p-4 shadow-[0_0_10px_#dc2626]">
              <div className="mb-4 flex items-center gap-3 border-b border-gray-700 px-2 pb-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-red-700 bg-black">
                  <Brain className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h3 className="font-serif text-2xl font-bold text-white">
                    Let's analyze the problem
                  </h3>
                  <p className="text-sm text-white/80">
                    Review the solution, tradeoffs, and better approaches
                  </p>
                </div>
              </div>

              <AIChat
                questionTitle={question?.title || "General"}
                questionDescription={question?.description || "DSA prep"}
                title="Analysis Assistant"
                subtitle="Ask why the solution worked, where it failed, or how to optimize it"
                emptyMessage="Ask why the solution worked, where it failed, or how to optimize it"
              />
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto p-2 bg-[#1a1c23] rounded-lg shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
          <h2 className="text-2xl font-bold text-red-600 font-serif">
            Code Editor
          </h2>

          <div className="relative w-32">
            <select
              className="appearance-none w-full bg-black text-white px-3 py-2 pr-10 rounded-md border border-gray-700 focus:outline-none focus:ring-2 focus:ring-red-600 transition duration-150"
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
            >
              <option value="cpp">C++</option>
              <option value="python">Python</option>
              <option value="javascript">JavaScript</option>
            </select>
            <ChevronDown
              className="pointer-events-none absolute right-3 top-1/2 transform -translate-y-1/2 text-white/80"
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
            className={`${buttonBaseStyles} bg-red-700 hover:bg-red-600 shadow-[0_0_10px_#dc2626] cursor-pointer`}
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
            className={`${buttonBaseStyles} bg-red-700 hover:bg-red-600 shadow-[0_0_10px_#dc2626] cursor-pointer`}
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
            className={`mt-6 flex items-center gap-2 rounded border p-4 ${
              isSubmissionSuccess
                ? "border-red-700 bg-[#0f1117] text-white"
                : "border-gray-700 bg-[#0f1117] text-white"
            }`}
          >
            <span>{submissionMessage}</span>
          </div>
        )}

        {results.length > 0 && (
          <div className="mt-8">
            <h3 className="font-bold text-xl mb-4 text-red-600 font-serif">
              Test Results:
            </h3>
            {results.map((r, idx) => (
              <div
                key={idx}
                className="bg-black p-4 rounded mb-4 border border-gray-700"
              >
                <p className="mb-2">
                  <strong>Test Case {r.index}:</strong>{" "}
                  <span
                    className={
                      r.status.includes("Passed") ? "text-white" : "text-red-600"
                    }
                  >
                    {r.status}
                  </span>
                </p>
                <pre className="text-sm whitespace-pre-wrap font-mono leading-relaxed text-white/80">
                  <strong className="text-white">Input:</strong> {r.input}
                  {"\n"}
                  <strong className="text-white">Expected:</strong> {r.expected}
                  {"\n"}
                  <strong className="text-white">Output:</strong> {r.actual}
                </pre>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 border border-gray-700 p-5 rounded shadow-lg bg-[#111214]">
          <h3 className="font-bold mb-3 text-red-600 text-lg font-serif">
            Run Custom Test Case
          </h3>
          <textarea
            className="w-full p-3 border border-gray-700 rounded text-sm font-mono resize-none bg-black text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600"
            rows={4}
            placeholder="Enter custom input"
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            disabled={isRunningCustomTest}
          />
          <button
            className={`${buttonBaseStyles} bg-red-700 hover:bg-red-600 shadow-[0_0_10px_#dc2626] mt-2 cursor-pointer`}
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
            <div className="mt-5 p-3 border border-gray-700 rounded bg-black text-white whitespace-pre-wrap font-mono">
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
