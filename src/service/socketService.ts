import io from "socket.io-client";

class SocketService {
  socket;

  constructor() {
    const backendUrl = import.meta.env.BACKEND_URL!;
    this.socket = io(backendUrl);
  }
}

const socketService = new SocketService();
export default socketService;
