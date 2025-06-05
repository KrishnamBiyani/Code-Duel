import Editor from "@monaco-editor/react";
import { useState } from "react";

const languages = ["javascript", "cpp", "python"];

const CodeEditor = () => {
  const [code, setCode] = useState("// Write your code here");
  const [language, setLanguage] = useState("javascript");

  const handleChange = (value) => {
    setCode(value);
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold">Your Solution:</h3>
        <select
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
          className="border px-2 py-1 rounded"
        >
          {languages.map((lang) => (
            <option key={lang} value={lang}>
              {lang.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      <Editor
        height="400px"
        defaultLanguage={language}
        language={language}
        theme="vs-dark"
        value={code}
        onChange={handleChange}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: "on",
          scrollBeyondLastLine: false,
        }}
      />
    </div>
  );
};

export default CodeEditor;
