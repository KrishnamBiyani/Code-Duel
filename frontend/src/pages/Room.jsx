import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRoomStore } from "../store/useRoomStore";
import { useAuthStore } from "../store/useAuthStore";
import CodeRunner from "../components/CodeRunner";

const formatTime = (ms) => {
  if (ms < 0) ms = 0;
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
};

const Room = () => {
  const { roomId } = useParams();
  const { authUser } = useAuthStore();
  const { connectSocket, roomUsers, question, timeLeftMs, resetRoom } =
    useRoomStore();

  useEffect(() => {
    if (authUser && roomId) {
      connectSocket(authUser, roomId);
    }
    return () => resetRoom();
  }, [authUser, roomId, connectSocket, resetRoom]);

  const uniqueRoomUsers = Array.from(
    new Map(roomUsers.map((u) => [u.user._id, u])).values()
  );

  return (
    <div className="bg-[#0f1117] min-h-screen text-white px-6 py-8 max-w-screen-2xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 flex-wrap mb-8">
        {/* Room ID Box */}
        <div
          className="
            flex items-center gap-6
            bg-gradient-to-r from-blue-700 to-blue-600
            border border-blue-500
            rounded-xl
            px-6 py-3
            max-w-full md:max-w-[400px]
            shadow-sm
            select-none
          "
          title="Room ID"
        >
          <span className="font-mono font-semibold text-sm text-blue-200 uppercase tracking-wide select-none">
            ROOM ID
          </span>

          <span
            className="
              font-mono 
              font-bold 
              text-lg 
              text-white 
              bg-blue-800 bg-opacity-60 
              px-4 py-1 
              rounded-md 
              truncate
              max-w-[220px]
              select-text
              drop-shadow
            "
          >
            {roomId}
          </span>

          <button
            onClick={() => navigator.clipboard.writeText(roomId)}
            aria-label="Copy Room ID"
            className="
              bg-blue-500 hover:bg-blue-600 active:bg-blue-700 
              transition 
              rounded-md 
              p-2
              flex items-center justify-center
              shadow
              text-white
              focus:outline-none
              focus:ring-2 focus:ring-blue-400
              cursor-pointer
              text-sm
              select-none
            "
            title="Copy Room ID"
          >
            {/* Clipboard SVG Icon */}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12h6m-6 4h6m2 4H7a2 2 0 01-2-2V7a2 2 0 012-2h3l2-2h4a2 2 0 012 2v2"
              />
            </svg>
          </button>
        </div>

        {/* Grouped Participants + Timer */}
        {/* Grouped Participants + Timer */}
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          {/* Participants Box */}
          <div className="bg-gradient-to-br from-emerald-900 to-emerald-700 border border-emerald-600 rounded-xl px-6 py-4 flex flex-wrap min-w-0 shadow-lg">
            <h2 className="w-full text-sm font-semibold uppercase tracking-wide mb-3 text-emerald-200">
              Participants
            </h2>
            <div className="flex flex-wrap gap-2">
              {uniqueRoomUsers.map((user) => (
                <span
                  key={user.user._id}
                  className="bg-emerald-600 text-white px-3 py-1 rounded-full text-xs font-medium truncate max-w-[120px]"
                  title={user.user.fullName}
                >
                  👤 {user.user.fullName}
                </span>
              ))}
              {uniqueRoomUsers.length === 0 && (
                <span className="text-emerald-300 text-xs italic">
                  No participants yet
                </span>
              )}
            </div>
          </div>

          {/* Timer Box */}
          <div className="bg-gradient-to-br from-yellow-900 to-yellow-700 border border-yellow-600 rounded-xl px-6 py-4 flex flex-col items-center justify-center min-w-0 shadow-lg">
            <h2 className="text-sm font-semibold uppercase tracking-wide mb-2 text-yellow-300">
              Time Left
            </h2>
            <div className="font-mono font-extrabold text-yellow-400 text-3xl select-none">
              ⏳ {formatTime(timeLeftMs)}
            </div>
          </div>
        </div>
      </div>

      {question ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left: Question Section */}
          <div className="bg-[#1a1c23] border border-gray-700 rounded-xl p-6 shadow-lg">
            <h3 className="text-2xl font-bold text-pink-400 mb-2">
              {question.title}
            </h3>
            <p className="text-gray-300 mb-4">{question.description}</p>

            <div className="mb-4 space-y-1 text-gray-400">
              <p>
                <span className="font-semibold text-white">Input:</span>{" "}
                {question.inputFormat}
              </p>
              <p>
                <span className="font-semibold text-white">Output:</span>{" "}
                {question.outputFormat}
              </p>
              <p>
                <span className="font-semibold text-white">Constraints:</span>{" "}
                Min {question.constraints?.nMin}, Max{" "}
                {question.constraints?.nMax}
              </p>
            </div>

            {question.examples?.length > 0 && (
              <div className="mt-6 bg-[#23252e] border border-gray-700 p-4 rounded-lg">
                <p className="text-white font-semibold mb-1">Example:</p>
                <pre className="whitespace-pre-wrap text-sm text-gray-300 font-mono">
                  Input: {question.examples[0].input.join("\n")}
                  {"\n"}Output: {question.examples[0].output}
                </pre>
              </div>
            )}
          </div>

          {/* Right: Code Editor */}
          <div className="bg-[#1a1c23] border border-gray-700 rounded-xl p-4 shadow-lg">
            <CodeRunner
              question={question}
              roomId={roomId}
              authUser={authUser}
            />
          </div>
        </div>
      ) : (
        <p className="text-gray-400 text-lg mt-10 animate-pulse">
          Waiting for question...
        </p>
      )}
    </div>
  );
};

export default Room;
