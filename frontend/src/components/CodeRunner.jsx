import { useEffect } from "react";
import Editor from "@monaco-editor/react";
import { useRoomStore } from "../store/useRoomStore";
import { useCodeStore } from "../store/useCodeRunnerStore";

const CodeRunner = ({ question, roomId, authUser }) => {
  const socket = useRoomStore((state) => state.socket);

  const {
    code,
    setCode,
    isRunning,
    results,
    customInput,
    setCustomInput,
    customResult,
    handleRun,
    handleRunCustomTest,
    handleSubmit,
    submissionMessage,
  } = useCodeStore();

  // Listen for declare-winner event from socket
  useEffect(() => {
    if (!socket || !authUser) return;

    const handleDeclareWinner = ({ winnerId }) => {
      if (winnerId === authUser._id) {
        alert("🎉 You won!");
      } else {
        alert("👎 You lost!");
      }
    };

    socket.on("declare-winner", handleDeclareWinner);

    return () => {
      socket.off("declare-winner", handleDeclareWinner);
    };
  }, [socket, authUser]);

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h2 className="text-xl font-bold mb-2">Code Editor</h2>

      <Editor
        height="300px"
        defaultLanguage="cpp"
        value={code}
        onChange={(value) => setCode(value)}
      />

      <div className="flex gap-4 mt-4">
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
          onClick={() => handleRun(question)}
          disabled={isRunning}
        >
          {isRunning ? "Running..." : "Run Tests"}
        </button>
        <button
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
          onClick={() => handleSubmit({ question, roomId, authUser })}
          disabled={isRunning}
        >
          {isRunning ? "Submitting..." : "Submit Code"}
        </button>
      </div>
      {submissionMessage && (
        <div
          className={`mt-4 p-3 rounded ${
            submissionMessage.startsWith("✅")
              ? "bg-green-100 text-green-800 border border-green-300"
              : "bg-red-100 text-red-800 border border-red-300"
          }`}
        >
          {submissionMessage}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold text-lg mb-2">Test Results:</h3>
          {results.map((r, idx) => (
            <div
              key={idx}
              className="bg-gray-100 p-3 rounded mb-3 border border-gray-300"
            >
              <p>
                <strong>Test Case {r.index}:</strong>{" "}
                <span
                  className={
                    r.status.startsWith("✅")
                      ? "text-green-600"
                      : "text-red-600"
                  }
                >
                  {r.status}
                </span>
              </p>
              <pre className="text-sm whitespace-pre-wrap">
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
      <div className="mt-8 border p-4 rounded shadow">
        <h3 className="font-bold mb-2">Run Custom Test Case</h3>
        <textarea
          className="w-full p-2 border rounded mb-2 font-mono"
          rows={3}
          placeholder="Enter custom input"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          disabled={isRunning}
        />
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-60"
          onClick={handleRunCustomTest}
          disabled={isRunning}
        >
          {isRunning ? "Running..." : "Run Custom Test"}
        </button>

        {customResult && (
          <div className="mt-4 p-3 border rounded bg-gray-100">
            <p>
              <strong>Output:</strong>
            </p>
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {customResult}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeRunner;
