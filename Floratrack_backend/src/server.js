require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('./app');
const { sequelize } = require('../models');
const { initSocket } = require('./socket');
const { setIo } = require('./socket/emitter');

const PORT = parseInt(process.env.PORT || '3000', 10);

async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('MySQL database connected successfully.');

    if (process.env.DB_SYNC === 'true') {
      await sequelize.sync({ alter: true });
      console.log('Database schema synced.');
    }

    const app = createApp();
    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
      }
    });

    setIo(io);
    initSocket(io);

    server.listen(PORT, () => {
      console.log(`FloraTrack API running at http://localhost:${PORT}`);
      console.log(`Socket.IO enabled on ws://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
}

module.exports = { startServer };
