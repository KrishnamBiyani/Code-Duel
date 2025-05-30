import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useRoomStore } from "../store/useRoomStore";
import { useAuthStore } from "../store/useAuthStore";

const Room = () => {
  const { roomId } = useParams();
  const { authUser } = useAuthStore();
  const { connectSocket, roomUsers } = useRoomStore();

  useEffect(() => {
    if (authUser && roomId) {
      connectSocket(authUser, roomId);
    }
    console.log("roomUsers updated:", roomUsers);
  }, [authUser, roomId]);

  const uniqueRoomUsers = Array.from(
    new Map(roomUsers.map((u) => [u.user._id, u])).values()
  );

  return (
    <div>
      <h1>Room ID: {roomId}</h1>
      <h2>Participants:</h2>
      <ul>
        {uniqueRoomUsers.map((user) => (
          <li key={user.user._id}>{user.user.fullName}</li>
        ))}
      </ul>
    </div>
  );
};

export default Room;
