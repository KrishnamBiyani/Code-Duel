import { generateRoomId } from "../lib/utils.js";
import Room from "../models/room.model.js";

export const createRoom = async (req, res) => {
  const userId = req.user._id.toString();
  const roomId = generateRoomId();

  try {
    const room = await Room.create({
      roomId,
      users: [userId],
    });

    return res
      .status(201)
      .json({ roomId, message: `Room created id : ${roomId}` });
  } catch (error) {
    console.log("Error in craeting room : ", error);
    return res.status(500).json("Room creation failed");
  }
};

export const joinRoom = async (req, res) => {
  const userId = req.user._id.toString();
  const { roomId } = req.body;

  try {
    const room = await Room.findOne({ roomId });
    if (!roomId || room.isFull) {
      return res.status(400).json({ message: "Room not available" });
    }

    console.log("Room users:", room.users);
    console.log("Current userId:", userId);

    // prevent joining the same user again
    if (room.users.map((u) => u.toString()).includes(userId)) {
      return res.status(400).json({ message: "User already in the room" });
    }

    room.users.push(userId);
    room.isFull = true;
    await room.save();

    return res.status(201).json({ message: "Room joined" });
  } catch (error) {
    console.log("Error in joining room : ", error);
    return res.status(500).json("Room joining failed");
  }
};
