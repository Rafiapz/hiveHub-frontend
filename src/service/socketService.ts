import io from 'socket.io-client';

class SocketService {
    socket;
    constructor() {
        this.socket = io("www.https://hivehub-backend.onrender.com/api");
    }
}

const socketService = new SocketService();
export default socketService;