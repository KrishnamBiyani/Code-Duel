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
  timeLeftMs: null,
  timerIntervalId: null,
  authUser: null,

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
    const oldSocket = get().socket;
    if (oldSocket) {
      oldSocket.disconnect();
    }

    const socket = io(BASE_URL, {
      query: { userId: user._id },
    });

    set({ socket, authUser: user });

    socket.emit("join-room", { roomId, user });

    socket.on("room-users", (users) => {
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

    socket.on("question:send", (questionPayload) => {
      set({ question: questionPayload.question });
      // Calculate timer start
      get().startTimer(questionPayload.startTime, questionPayload.duration);
    });
  },

  startTimer: (startTime, duration) => {
    if (get().timerIntervalId) {
      clearInterval(get().timerIntervalId);
    }

    const updateTimer = () => {
      const elapsed = Date.now() - startTime;
      const remaining = duration - elapsed;
      if (remaining <= 0) {
        clearInterval(get().timerIntervalId);
        set({ timeLeftMs: 0, timerIntervalId: null });
      } else {
        set({ timeLeftMs: remaining });
      }
    };

    updateTimer(); // update immediately

    const intervalId = setInterval(updateTimer, 1000);
    set({ timerIntervalId: intervalId });
  },

  resetRoom: () => {
    get().disconnectSocket();
    if (get().timerIntervalId) {
      clearInterval(get().timerIntervalId);
    }
    set({
      roomId: "",
      error: null,
      question: null,
      roomUsers: [],
      authUser: null,
      timeLeftMs: null,
      timerIntervalId: null,
    });
  },

  disconnectSocket: () => {
    const socket = get().socket;
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  fetchAndBroadcastQuestion: async () => {
    const socket = get().socket;
    if (!socket) return;

    try {
      const res = await axiosInstance.get("/question/random");
      const questionPayload = res.data; // should include startTime & duration
      set({ question: questionPayload.question });
      socket.emit("question:send", questionPayload);
      get().startTimer(questionPayload.startTime, questionPayload.duration);
    } catch (error) {
      console.error("Failed to fetch question:", error.message);
    }
  },
}));
