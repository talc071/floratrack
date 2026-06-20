import { io } from 'socket.io-client';
import { getSocketUrl } from './api';

let socket = null;

export const connectSocket = () => {
  if (socket?.connected) return socket;

  socket = io(getSocketUrl(), {
    transports: ['websocket', 'polling'],
    autoConnect: true,
  });

  socket.on('connect', () => {
    socket.emit('dashboard:subscribe');
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const getSocket = () => socket;

export const subscribeToPlant = (plantId) => {
  if (socket?.connected) {
    socket.emit('plant:subscribe', { plantId });
  }
};

export const onSocketEvent = (event, handler) => {
  const s = connectSocket();
  s.on(event, handler);
  return () => s.off(event, handler);
};
