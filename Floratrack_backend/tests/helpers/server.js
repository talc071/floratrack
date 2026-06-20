require('dotenv').config();

const http = require('http');
const { Server } = require('socket.io');
const { createApp } = require('../../src/app');
const { initSocket } = require('../../src/socket');
const { setIo, emitToDashboard } = require('../../src/socket/emitter');

async function createTestServer() {
  const app = createApp();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  setIo(io);
  initSocket(io);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;

  return {
    app,
    server,
    io,
    port,
    baseUrl: `http://127.0.0.1:${port}`,
    emitToDashboard,
    async close() {
      await new Promise((resolve) => server.close(resolve));
      setIo(null);
    },
  };
}

module.exports = { createTestServer };
