const initSocket = (io) => {
  io.on('connection', (socket) => {
    console.log(`[Socket.IO] Client connected: ${socket.id}`);

    socket.on('dashboard:subscribe', () => {
      socket.join('dashboard');
      socket.emit('dashboard:subscribed', { message: 'Subscribed to live plant activity feed.' });
      console.log(`[Socket.IO] ${socket.id} joined dashboard room`);
    });

    socket.on('plant:subscribe', ({ plantId }) => {
      if (!plantId) return;
      const room = `plant:${plantId}`;
      socket.join(room);
      socket.emit('plant:subscribed', { plantId, message: `Subscribed to plant ${plantId} updates.` });
      console.log(`[Socket.IO] ${socket.id} joined ${room}`);
    });

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
    });
  });
};

module.exports = { initSocket };
