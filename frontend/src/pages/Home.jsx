import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { useRoomStore } from "../store/useRoomStore";
import { useNavigate } from "react-router-dom";
import samurai from "../assets/samurai.png";

export default function Home() {
  const { authUser, logout } = useAuthStore();
  const { createRoom, joinRoom, isLoading, error } = useRoomStore();
  const [joinRoomId, setJoinRoomId] = useState("");
  const navigate = useNavigate();

  const handleCreateRoom = async () => {
    if (!authUser) return;
    const newRoomId = await createRoom(authUser._id);
    if (newRoomId) navigate(`/room/${newRoomId}`);
  };

  const handleJoinRoom = async () => {
    if (!authUser || !joinRoomId.trim()) return;
    const success = await joinRoom(joinRoomId.trim(), authUser._id);
    if (success) navigate(`/room/${joinRoomId.trim()}`);
  };

  const handleLogout = () => {
    logout();
    navigate("/signin");
  };

  return (
    <div className="min-h-screen flex bg-black text-white relative">
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-6 left-12 px-4 py-2 text-sm font-semibold text-white border border-red-700 rounded-md hover:bg-red-700 hover:text-white transition-all shadow-[0_0_10px_#dc2626] z-20 cursor-pointer"
      >
        Logout
      </button>

      {/* Left Side */}
      <div className="flex flex-col justify-center flex-1 px-12 max-w-lg">
        <h1 className="text-5xl font-extrabold mb-4 font-serif text-white drop-shadow-[0_0_10px_#dc2626]">
          Welcome, <span className="text-red-600">{authUser.fullName}</span>
        </h1>

        <p className="mb-8 text-white/80 text-lg leading-relaxed">
          Enter the arena of minds. <br />
          Create a duel room or join an ongoing battle. <br />
          Let there be bloodbath.
        </p>

        <button
          onClick={handleCreateRoom}
          disabled={isLoading}
          className="w-full py-3 mb-6 bg-red-700 hover:bg-red-600 disabled:bg-red-800 rounded-lg font-semibold transition-all shadow-[0_0_5px_#dc2626] cursor-pointer"
        >
          {isLoading ? "Creating Room..." : "⚔️ Create Duel Room"}
        </button>

        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Enter Room ID"
            value={joinRoomId}
            onChange={(e) => setJoinRoomId(e.target.value)}
            className="flex-grow px-4 py-3 rounded-lg bg-zinc-900 border border-zinc-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-600 shadow-inner shadow-black"
          />
          <button
            onClick={handleJoinRoom}
            disabled={isLoading}
            className="px-6 py-3 bg-red-600 hover:bg-red-500 disabled:bg-red-800 rounded-lg font-semibold transition-all shadow-[0_0_5px_#dc2626] cursor-pointer"
          >
            {isLoading ? "Joining..." : "Join"}
          </button>
        </div>

        {error && <p className="mt-4 text-red-400 font-medium">{error}</p>}
      </div>

      {/* Right Side - Samurai Image */}
      <div className="flex-1 hidden md:flex items-center justify-center bg-black">
        <img
          src={samurai}
          alt="Samurai"
          className="max-h-screen object-contain drop-shadow-[0_0_60px_#dc2626]"
          draggable={false}
          style={{ userSelect: "none" }}
        />
      </div>
    </div>
  );
}
