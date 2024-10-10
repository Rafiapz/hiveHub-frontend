import io from 'socket.io-client';

class SocketService {
    socket;
    constructor() {
        this.socket = io("http://localhost:7700");
    }
}

const socketService = new SocketService();
export default socketService;