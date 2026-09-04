import { io, Socket } from 'socket.io-client';
import * as SecureStore from 'expo-secure-store';

const SOCKET_URL = 'http://10.10.18.57:5001';

class SocketService {
  private socket: Socket | null = null;
  private readonly URL = SOCKET_URL;

  async connect() {
    if (this.socket?.connected) return;

    try {
      const token = await SecureStore.getItemAsync('token');
      if (!token) return;

      this.socket = io(this.URL, {
        auth: {
          token
        }
      });

      this.socket.on('connect', () => {
        console.log('Socket connected:', this.socket?.id);
        this.joinUserRoom();
      });

      this.socket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

    } catch (error) {
      console.error('Error initializing socket connection', error);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinUserRoom() {
    this.socket?.emit('join_user');
  }

  joinTracking(orderId: string) {
    this.socket?.emit('join_tracking', orderId);
  }

  leaveTracking(orderId: string) {
    // Optionally implement leave room on backend
  }

  onReceiveLocation(callback: (data: any) => void) {
    this.socket?.on('receive_location', callback);
  }

  offReceiveLocation(callback?: (data: any) => void) {
    if (callback) {
      this.socket?.off('receive_location', callback);
    } else {
      this.socket?.off('receive_location');
    }
  }

  getSocket() {
    return this.socket;
  }
}

export const socketService = new SocketService();
