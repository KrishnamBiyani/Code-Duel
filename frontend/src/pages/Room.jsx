import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRoomStore } from "../store/useRoomStore";
import { useAuthStore } from "../store/useAuthStore";

const Room = () => {
  const { roomId } = useParams();
  const { authUser } = useAuthStore();
  const { connectSocket, roomUsers, question } = useRoomStore();

  useEffect(() => {
    if (authUser && roomId) {
      connectSocket(authUser, roomId);
    }
  }, [authUser, roomId]);

  const uniqueRoomUsers = Array.from(
    new Map(roomUsers.map((u) => [u.user._id, u])).values()
  );

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Room ID: {roomId}</h1>

      <h2 className="text-xl font-semibold mb-2">Participants:</h2>
      <ul className="list-disc list-inside mb-4">
        {uniqueRoomUsers.map((user) => (
          <li key={user.user._id}>{user.user.fullName}</li>
        ))}
      </ul>

      <div className="mt-6">
        {question ? (
          <div className="border p-4 rounded shadow">
            <h3 className="text-xl font-bold mb-2">{question.title}</h3>
            <p className="mb-4">{question.description}</p>

            <div className="mb-2">
              <p>
                <strong>Input:</strong> {question.inputFormat}
              </p>
              <p>
                <strong>Output:</strong> {question.outputFormat}
              </p>
              <p>
                <strong>Constraints:</strong> Min {question.constraints?.nMin},
                Max {question.constraints?.nMax}
              </p>
            </div>

            {question.examples?.length > 0 && (
              <div className="mt-4 bg-gray-100 p-3 rounded">
                <p>
                  <strong>Example:</strong>
                </p>
                <pre className="whitespace-pre-wrap">
                  Input: {question.examples[0].input.join("\n")}
                  {"\n"}Output: {question.examples[0].output}
                </pre>
              </div>
            )}
          </div>
        ) : (
          <p className="text-gray-500">Waiting for question...</p>
        )}
      </div>
    </div>
  );
};

export default Room;
