import { generateRoomId } from "../lib/utils.js";
import Room from "../models/room.model.js";

export const createRoom = async (req, res) => {
  const { userId } = req.user;
  const roomId = generateRoomId();

  try {
    const room = await Room.create({
      roomId,
      users: [userId],
    });

    return res.status(201).json({ message: `Room created id : ${roomId}` });
  } catch (error) {
    console.log("Error in craeting room : ", error);
    return res.status(500).json("Room creation failed");
  }
};

export const joinRoom = async (req, res) => {
  const { userId } = req.user;
  const { roomId } = req.body;

  try {
    const room = await Room.findOne({ roomId });
    if (!roomId || room.isFull) {
      return res.status(400).json({ message: "Room not available" });
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
