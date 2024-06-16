import io from 'socket.io-client';

class SocketService {
    socket;
    constructor() {
        this.socket = io("www.https://hivehub-backend-1.onrender.com/api");
    }
}

const socketService = new SocketService();
export default socketService;