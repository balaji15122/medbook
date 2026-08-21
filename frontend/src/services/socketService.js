import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "";

class SocketService {
  socket = null;

  connect(token) {
    if (!this.socket) {
      const authToken = token || localStorage.getItem("token");
      this.socket = io(SOCKET_URL, {
        auth: { token: authToken },
        autoConnect: false,
      });
    }
    
    if (!this.socket.connected) {
      this.socket.connect();
    }
    
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
