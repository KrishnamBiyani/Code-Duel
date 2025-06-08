const activeRooms = {}; // In-memory object to track submissions

export const submitCode = (req, res) => {
  const { userId, roomId } = req.body;

  if (!userId || !roomId) {
    return res.status(400).json({ error: "Missing userId or roomId" });
  }

  if (!activeRooms[roomId]) {
    activeRooms[roomId] = [];
  }

  // Avoid duplicate submission from same user
  if (!activeRooms[roomId].includes(userId)) {
    activeRooms[roomId].push(userId);
  }

  // Check if both users submitted
  if (activeRooms[roomId].length === 2) {
    const io = req.app.get("io");

    io.to(roomId).emit("declare-winner", {
      winnerId: userId,
      message: "We have a winner!",
    });

    // Cleanup room state
    delete activeRooms[roomId];
  }

  res.status(200).json({ message: "Submission received" });
};
