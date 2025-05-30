import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { io } from "socket.io-client";

const BASE_URL = "http://localhost:5050";

export const useRoomStore = create((set, get) => ({
  roomId: "",
  isLoading: false,
  error: null,
  roomUsers: [],
  socket: null,

  createRoom: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axiosInstance.post("/room/create", { userId });
      set({ roomId: res.data.roomId, isLoading: false });
      return res.data.roomId;
    } catch (error) {
      set({
        error: error.message || "Failed to create room",
        isLoading: false,
      });
      return null;
    }
  },

  joinRoom: async (roomId, userId) => {
    set({ isLoading: true, error: null });
    try {
      await axiosInstance.post("/room/join", { roomId, userId });
      set({ roomId, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.message || "Failed to join room", isLoading: false });
      return false;
    }
  },

  connectSocket: (user, roomId) => {
    const socket = io(BASE_URL, {
      query: { userId: user._id },
    });

    socket.emit("join-room", { roomId, user });

    socket.on("room-users", (users) => {
      console.log("Received room users:", users);
      set({ roomUsers: users });
    });

    set({ socket });
  },

  resetRoom: () => set({ roomId: "", error: null }),
}));
