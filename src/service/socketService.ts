import io from "socket.io-client";

class SocketService {
  socket;

  constructor() {
    const backendUrl = import.meta.env.VITE_BACKEND_URL as string;
    this.socket = io(backendUrl, {
      withCredentials: true,
      transports: ["websocket", "polling"],
    });
  }
}

const socketService = new SocketService();
export default socketService;
