import { useState } from "react";
import Editor from "@monaco-editor/react";
import axios from "axios";

const CodeRunner = ({ question }) => {
  const [code, setCode] = useState("// Write your code here");
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState([]);

  const handleRun = async () => {
    setIsRunning(true);
    setResults([]);

    const testCases = question.testCases || [];

    const newResults = [];

    for (const [i, test] of testCases.entries()) {
      try {
        const res = await axios.post("http://localhost:5050/api/judge/run", {
          language_id: 54,
          source_code: code,
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

    setResults(newResults);
    setIsRunning(false);
  };

  return (
    <div className="max-w-4xl mx-auto mt-8 p-4">
      <h2 className="text-xl font-bold mb-2">Code Editor</h2>

      <Editor
        height="300px"
        defaultLanguage="cpp"
        defaultValue={code}
        onChange={(value) => setCode(value)}
      />

      <button
        className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={handleRun}
        disabled={isRunning}
      >
        {isRunning ? "Running..." : "Run Code"}
      </button>

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
              <pre className="text-sm">
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
    </div>
  );
};

export default CodeRunner;
