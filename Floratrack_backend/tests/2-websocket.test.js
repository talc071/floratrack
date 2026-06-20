require('dotenv').config();

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { io: ioClient } = require('socket.io-client');
const { sequelize } = require('../models');
const { createTestServer } = require('./helpers/server');

const CUSTOM_EVENTS = [
  'dashboard:subscribe',
  'dashboard:subscribed',
  'plant:subscribe',
  'plant:subscribed',
  'plant:created',
  'plant:updated',
  'plant:deleted',
  'careLog:created',
];

describe('2. WebSocket Real-Time (Socket.IO)', () => {
  let testServer;

  before(async () => {
    await sequelize.authenticate();
    testServer = await createTestServer();
  });

  after(async () => {
    if (testServer) await testServer.close();
    await sequelize.close();
  });

  it('Custom Events Integrity – at least 3 custom events defined in backend socket code', () => {
    const socketCode = fs.readFileSync(
      path.join(__dirname, '../src/socket/index.js'),
      'utf8'
    );
    const emitterCode = fs.readFileSync(
      path.join(__dirname, '../controllers/plants.controller.js'),
      'utf8'
    );

    const found = CUSTOM_EVENTS.filter(
      (evt) => socketCode.includes(evt) || emitterCode.includes(evt)
    );
    assert.ok(found.length >= 3, `Expected >= 3 custom events, found: ${found.join(', ')}`);
  });

  it('Multi-Client Synchronization – two clients receive dashboard broadcast', async () => {
    const url = testServer.baseUrl;

    const clientA = ioClient(url, { transports: ['websocket'], forceNew: true });
    const clientB = ioClient(url, { transports: ['websocket'], forceNew: true });

    const waitFor = (socket, event, timeoutMs = 5000) =>
      new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error(`Timeout waiting for ${event}`)), timeoutMs);
        socket.once(event, (payload) => {
          clearTimeout(timer);
          resolve(payload);
        });
      });

    await Promise.all([
      new Promise((r) => clientA.on('connect', r)),
      new Promise((r) => clientB.on('connect', r)),
    ]);

    clientA.emit('dashboard:subscribe');
    clientB.emit('dashboard:subscribe');

    await waitFor(clientA, 'dashboard:subscribed');
    await waitFor(clientB, 'dashboard:subscribed');

    const payloadPromiseA = waitFor(clientA, 'plant:updated');
    const payloadPromiseB = waitFor(clientB, 'plant:updated');

    testServer.emitToDashboard('plant:updated', {
      plant: { plantId: 1, name: 'Monstera' },
      message: 'Test broadcast',
    });

    const [msgA, msgB] = await Promise.all([payloadPromiseA, payloadPromiseB]);
    assert.equal(msgA.message, 'Test broadcast');
    assert.equal(msgB.message, 'Test broadcast');

    clientA.disconnect();
    clientB.disconnect();
  });
});
