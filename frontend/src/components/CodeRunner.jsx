// import { useEffect } from "react";
// import Editor from "@monaco-editor/react";
// import { useRoomStore } from "../store/useRoomStore";
// import { useCodeStore } from "../store/useCodeRunnerStore";

// const CodeRunner = ({ question, roomId, authUser }) => {
//   const socket = useRoomStore((state) => state.socket);

//   const {
//     code,
//     setCode,
//     isRunning,
//     results,
//     customInput,
//     setCustomInput,
//     customResult,
//     handleRun,
//     handleRunCustomTest,
//     handleSubmit,
//     submissionMessage,
//   } = useCodeStore();

//   // Listen for declare-winner event from socket
//   useEffect(() => {
//     if (!socket || !authUser) return;

//     const handleDeclareWinner = ({ winnerId }) => {
//       if (winnerId === authUser._id) {
//         alert("🎉 You won!");
//       } else {
//         alert("👎 You lost!");
//       }
//     };

//     socket.on("declare-winner", handleDeclareWinner);

//     return () => {
//       socket.off("declare-winner", handleDeclareWinner);
//     };
//   }, [socket, authUser]);

//   return (
//     <div className="max-w-4xl mx-auto mt-8 p-4">
//       <h2 className="text-xl font-bold mb-2">Code Editor</h2>

//       <Editor
//         height="300px"
//         defaultLanguage="cpp"
//         value={code}
//         onChange={(value) => setCode(value)}
//       />

//       <div className="flex gap-4 mt-4">
//         <button
//           className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-60"
//           onClick={() => handleRun(question)}
//           disabled={isRunning}
//         >
//           {isRunning ? "Running..." : "Run Tests"}
//         </button>
//         <button
//           className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-60"
//           onClick={() => handleSubmit({ question, roomId, authUser })}
//           disabled={isRunning}
//         >
//           {isRunning ? "Submitting..." : "Submit Code"}
//         </button>
//       </div>
//       {submissionMessage && (
//         <div
//           className={`mt-4 p-3 rounded ${
//             submissionMessage.startsWith("✅")
//               ? "bg-green-100 text-green-800 border border-green-300"
//               : "bg-red-100 text-red-800 border border-red-300"
//           }`}
//         >
//           {submissionMessage}
//         </div>
//       )}

//       {results.length > 0 && (
//         <div className="mt-6">
//           <h3 className="font-bold text-lg mb-2">Test Results:</h3>
//           {results.map((r, idx) => (
//             <div
//               key={idx}
//               className="bg-gray-100 p-3 rounded mb-3 border border-gray-300"
//             >
//               <p>
//                 <strong>Test Case {r.index}:</strong>{" "}
//                 <span
//                   className={
//                     r.status.startsWith("✅")
//                       ? "text-green-600"
//                       : "text-red-600"
//                   }
//                 >
//                   {r.status}
//                 </span>
//               </p>
//               <pre className="text-sm whitespace-pre-wrap">
//                 <strong>Input:</strong> {r.input}
//                 {"\n"}
//                 <strong>Expected:</strong> {r.expected}
//                 {"\n"}
//                 <strong>Output:</strong> {r.actual}
//               </pre>
//             </div>
//           ))}
//         </div>
//       )}

//       {/* Custom Test Case Runner */}
//       <div className="mt-8 border p-4 rounded shadow">
//         <h3 className="font-bold mb-2">Run Custom Test Case</h3>
//         <textarea
//           className="w-full p-2 border rounded mb-2 font-mono"
//           rows={3}
//           placeholder="Enter custom input"
//           value={customInput}
//           onChange={(e) => setCustomInput(e.target.value)}
//           disabled={isRunning}
//         />
//         <button
//           className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-60"
//           onClick={handleRunCustomTest}
//           disabled={isRunning}
//         >
//           {isRunning ? "Running..." : "Run Custom Test"}
//         </button>

//         {customResult && (
//           <div className="mt-4 p-3 border rounded bg-gray-100">
//             <p>
//               <strong>Output:</strong>
//             </p>
//             <pre className="whitespace-pre-wrap text-sm font-mono">
//               {customResult}
//             </pre>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default CodeRunner;

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

  const buttonBaseStyles =
    "flex items-center justify-center px-4 py-2 rounded text-white font-semibold transition-colors duration-200 disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="max-w-4xl mx-auto  p-2 bg-[#1a1c23] rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-pink-400">Code Editor</h2>

      <Editor
        height="320px"
        defaultLanguage="cpp"
        value={code}
        onChange={(value) => setCode(value)}
        options={{
          minimap: { enabled: false },
          fontSize: 16,
          fontFamily: "'Fira Code', monospace",
          automaticLayout: true,
        }}
      />

      <div className="flex flex-wrap gap-4 mt-5">
        <button
          className={`${buttonBaseStyles} bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500/40`}
          onClick={() => handleRun(question)}
          disabled={isRunning}
          aria-label="Run tests"
        >
          {isRunning ? (
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
          className={`${buttonBaseStyles} bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-500/40`}
          onClick={() => handleSubmit({ question, roomId, authUser })}
          disabled={isRunning}
          aria-label="Submit code"
        >
          {isRunning ? (
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
              role="region"
              aria-label={`Test case ${r.index}`}
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
          disabled={isRunning}
          aria-label="Custom test case input"
        />
        <button
          className={`${buttonBaseStyles} bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-500/40 mt-2`}
          onClick={handleRunCustomTest}
          disabled={isRunning}
          aria-label="Run custom test"
        >
          {isRunning ? (
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
          <div
            className="mt-5 p-3 border border-gray-600 rounded bg-gray-900 text-white whitespace-pre-wrap font-mono"
            role="region"
            aria-live="polite"
            aria-atomic="true"
          >
            <p className="font-semibold mb-1">Output:</p>
            <pre>{customResult}</pre>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeRunner;
