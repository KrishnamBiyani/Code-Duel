import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useRoomStore } from "../store/useRoomStore";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const { authUser } = useAuthStore();
  const { createRoom, joinRoom, isLoading, error } = useRoomStore();
  const [joinRoomId, setJoinRoomId] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!authUser) return;
    const newRoomId = await createRoom(authUser._id);
    console.log(newRoomId);
    if (newRoomId) navigate(`/room/${newRoomId}`);
  };

  const handleJoinRoom = async () => {
    if (!authUser || !joinRoomId.trim()) return;
    const success = await joinRoom(joinRoomId.trim(), authUser._id);
    if (success) navigate(`/room/${joinRoomId.trim()}`);
  };

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-2xl font-bold mb-4">Welcome, {authUser.fullName}</h1>

      <div className="mb-6">
        <button
          className="btn btn-primary border"
          onClick={handleCreateRoom}
          disabled={isLoading}
        >
          {isLoading ? "Creating Room..." : "Create Room"}
        </button>
      </div>

      <div>
        <input
          type="text"
          placeholder="Enter Room ID to join"
          value={joinRoomId}
          onChange={(e) => setJoinRoomId(e.target.value)}
          className="input input-bordered mr-2 border"
        />
        <button
          className="btn btn-secondary border"
          onClick={handleJoinRoom}
          disabled={isLoading}
        >
          {isLoading ? "Joining Room..." : "Join Room"}
        </button>
      </div>

      {error && <p className="mt-4 text-red-600">{error}</p>}
    </div>
  );
}
