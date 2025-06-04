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
  question: null,
  authUser: null, // Store authUser locally

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

    set({ socket, authUser: user });

    socket.emit("join-room", { roomId, user });

    socket.on("room-users", (users) => {
      console.log("Received room users:", users);
      set({ roomUsers: users });

      const currentQuestion = get().question;
      const authUser = get().authUser;

      if (users.length === 2 && !currentQuestion) {
        const isFirstUser = users[0].user._id === authUser?._id;
        if (isFirstUser) {
          get().fetchAndBroadcastQuestion();
        }
      }
    });

    socket.on("question:send", (question) => {
      console.log("Received question from other user:", question);
      set({ question });
    });
  },

  resetRoom: () => set({ roomId: "", error: null }),

  setQuestion: (question) => {
    set({ question });
  },

  fetchAndBroadcastQuestion: async () => {
    const socket = get().socket;
    if (!socket) return;

    try {
      const res = await axiosInstance.get("/question/random");
      const question = res.data;
      set({ question });
      socket.emit("question:send", question);
    } catch (error) {
      console.error("Failed to fetch question:", error.message);
    }
  },
}));
