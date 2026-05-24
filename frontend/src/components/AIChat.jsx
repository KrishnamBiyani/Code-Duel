import { useEffect, useRef, useState } from "react";
import { axiosInstance } from "../lib/axios";

const getAIText = (data) => {
  if (typeof data === "string") return data;

  return (
    data?.response ||
    data?.answer ||
    data?.message ||
    data?.reply ||
    "I could not parse the AI response."
  );
};

const parseInlineMarkdown = (text) => {
  const parts = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return parts
    .filter(Boolean)
    .map((part, index) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={index} className="font-semibold text-white">{part.slice(2, -2)}</strong>;
      }

      if (part.startsWith("*") && part.endsWith("*")) {
        return <em key={index} className="italic text-white">{part.slice(1, -1)}</em>;
      }

      if (part.startsWith("`") && part.endsWith("`")) {
        return (
          <code
            key={index}
            className="rounded bg-black px-1.5 py-0.5 font-mono text-[13px] text-red-600"
          >
            {part.slice(1, -1)}
          </code>
        );
      }

      return <span key={index}>{part}</span>;
    });
};

const renderMarkdownBlock = (content) => {
  const blocks = content.split(/```([\s\S]*?)```/g);

  return blocks.map((block, index) => {
    if (index % 2 === 1) {
      return (
        <pre
          key={index}
          className="my-3 overflow-x-auto rounded-lg border border-gray-700 bg-black p-4 text-[13px] text-white/90"
        >
          <code>{block.trim()}</code>
        </pre>
      );
    }

    const lines = block.split("\n");
    const elements = [];
    let listItems = [];

    const flushList = (listKey) => {
      if (!listItems.length) return;

      elements.push(
        <ul key={listKey} className="mb-3 list-disc space-y-1 pl-5">
          {listItems.map((item, itemIndex) => (
            <li key={itemIndex}>{parseInlineMarkdown(item)}</li>
          ))}
        </ul>
      );

      listItems = [];
    };

    lines.forEach((line, lineIndex) => {
      const trimmedLine = line.trim();

      if (!trimmedLine) {
        flushList(`list-${index}-${lineIndex}`);
        return;
      }

      if (trimmedLine.startsWith("- ") || trimmedLine.startsWith("* ")) {
        listItems.push(trimmedLine.slice(2));
        return;
      }

      flushList(`list-${index}-${lineIndex}`);

      if (trimmedLine.startsWith("### ")) {
        elements.push(
          <h5
            key={`h3-${index}-${lineIndex}`}
            className="mb-2 mt-3 font-serif text-lg font-semibold text-white"
          >
            {parseInlineMarkdown(trimmedLine.slice(4))}
          </h5>
        );
        return;
      }

      if (trimmedLine.startsWith("## ")) {
        elements.push(
          <h4
            key={`h2-${index}-${lineIndex}`}
            className="mb-2 mt-3 font-serif text-xl font-semibold text-white"
          >
            {parseInlineMarkdown(trimmedLine.slice(3))}
          </h4>
        );
        return;
      }

      if (trimmedLine.startsWith("# ")) {
        elements.push(
          <h3
            key={`h1-${index}-${lineIndex}`}
            className="mb-2 mt-3 font-serif text-2xl font-bold text-white"
          >
            {parseInlineMarkdown(trimmedLine.slice(2))}
          </h3>
        );
        return;
      }

      elements.push(
        <p
          key={`p-${index}-${lineIndex}`}
          className="mb-2 whitespace-pre-wrap leading-7"
        >
          {parseInlineMarkdown(trimmedLine)}
        </p>
      );
    });

    flushList(`list-end-${index}`);

    return <div key={index}>{elements}</div>;
  });
};

const AIChat = ({
  questionTitle = "General",
  questionDescription = "DSA prep",
  title = "AI Assistant",
  subtitle = "Ask for hints, patterns, and DSA explanations",
  emptyMessage = "Ask me anything about DSA concepts",
  buttonLabel = "Open AI Assistant",
  overlayMode = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  useEffect(() => {
    if (!overlayMode || !isOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [overlayMode, isOpen]);

  const handleSend = async () => {
    const trimmedMessage = input.trim();

    if (!trimmedMessage || isLoading) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmedMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await axiosInstance.post("/ai/chat", {
        message: trimmedMessage,
        questionTitle,
        questionDescription,
      });

      setMessages((prev) => [
        ...prev,
        { role: "ai", content: getAIText(response.data) },
      ]);
    } catch (error) {
      const errorMessage =
        error?.response?.data?.message ||
        "The AI assistant is unavailable right now.";

      setMessages((prev) => [...prev, { role: "ai", content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const panel = (
    <div className="w-full rounded-xl border border-zinc-700 bg-[#1a1c23] shadow-[0_0_10px_#dc2626]">
      <div className="flex items-center justify-between border-b border-zinc-700 px-5 py-4">
        <div>
          <h3 className="font-serif text-2xl font-bold text-white">{title}</h3>
          <p className="text-sm text-white/80">{subtitle}</p>
        </div>
        {overlayMode && (
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="rounded-md border border-zinc-700 px-3 py-1 text-white transition-colors hover:bg-[#0f1117] cursor-pointer"
          >
            Close
          </button>
        )}
      </div>

      <div className="p-4">
        <div className="overflow-hidden rounded-lg border border-gray-700 bg-[#0f1117]">
          <div
            className={`overflow-y-auto p-4 ${
              overlayMode ? "h-[50vh]" : "h-[22rem]"
            }`}
          >
            {messages.length === 0 && !isLoading ? (
              <div className="flex h-full items-center justify-center text-center text-white/80">
                {emptyMessage}
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message, index) => (
                  <div
                    key={`${message.role}-${index}`}
                    className={`flex ${
                      message.role === "user" ? "justify-end" : "justify-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg border px-4 py-3 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "border-red-700 bg-red-700 text-white"
                          : "border-gray-700 bg-[#1a1c23] text-white/80"
                      }`}
                    >
                      {message.role === "ai" ? (
                        <div>{renderMarkdownBlock(message.content)}</div>
                      ) : (
                        <div className="whitespace-pre-wrap">{message.content}</div>
                      )}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="flex items-center gap-3 rounded-lg border border-gray-700 bg-[#1a1c23] px-4 py-3 text-sm text-white/80">
                      <svg
                        className="h-5 w-5 animate-spin text-red-600"
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
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>

        <div className="mt-4 flex gap-3">
          <textarea
            rows={overlayMode ? 3 : 2}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about time complexity, recursion, DP..."
            disabled={isLoading}
            className="flex-1 resize-none rounded-lg border border-zinc-700 bg-black px-4 py-3 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          />
          <button
            type="button"
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="self-end rounded-lg bg-red-700 px-5 py-3 font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:bg-red-800 cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );

  if (!overlayMode) {
    return panel;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full rounded-lg bg-red-700 px-6 py-3 font-semibold text-white transition-all hover:bg-red-600 shadow-[0_0_10px_#dc2626] cursor-pointer"
      >
        {buttonLabel}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4">
          <div className="w-full lg:w-[70vw] max-w-5xl">{panel}</div>
        </div>
      )}
    </>
  );
};

export default AIChat;
