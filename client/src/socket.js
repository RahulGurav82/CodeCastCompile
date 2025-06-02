import { io } from "socket.io-client";

let socket = null;

export const initSocket = async () => {
  if (!socket) {
    const option = {
      reconnectionAttempts: Infinity,
      timeout: 1000,
      transports: ["websocket"],
    };
    socket = io(import.meta.env.VITE_BACKEND_URL, option);
  }
  return socket;
};
