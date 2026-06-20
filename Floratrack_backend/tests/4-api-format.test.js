require('dotenv').config();

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { sequelize } = require('../models');
const { createTestServer } = require('./helpers/server');
const { assertSuccessShape, assertErrorShape } = require('./helpers/assertions');

describe('4. API Communication & Standardization', () => {
  let testServer;

  before(async () => {
    await sequelize.authenticate();
    testServer = await createTestServer();
  });

  after(async () => {
    if (testServer) await testServer.close();
    await sequelize.close();
  });

  it('Success Response Layout – GET /plants', async () => {
    const res = await request(testServer.app).get('/plants');
    assert.equal(res.status, 200);
    assertSuccessShape(res.body);
    assert.ok(Array.isArray(res.body.data));
  });

  it('Success Response Layout – POST /api/auth/login', async () => {
    const res = await request(testServer.app)
      .post('/api/auth/login')
      .send({ email: 'alice@floratrack.com', password: 'admin123' });
    assert.equal(res.status, 200);
    assertSuccessShape(res.body);
    assert.equal(res.body.data.userRole, 'admin');
  });

  it('Error Response Layout – 404 NOT_FOUND', async () => {
    const res = await request(testServer.app).get('/plants/99999');
    assert.equal(res.status, 404);
    assertErrorShape(res.body);
    assert.equal(res.body.error.code, 'NOT_FOUND');
  });

  it('Error Response Layout – 400 VALIDATION_ERROR', async () => {
    const res = await request(testServer.app)
      .post('/plants')
      .set('x-user-role', 'admin')
      .set('x-user-id', '1')
      .send({ name: 'Missing fields' });
    assert.equal(res.status, 400);
    assertErrorShape(res.body);
    assert.equal(res.body.error.code, 'VALIDATION_ERROR');
  });

  it('Error Response Layout – 403 FORBIDDEN', async () => {
    const res = await request(testServer.app)
      .delete('/plants/1')
      .set('x-user-role', 'user')
      .set('x-user-id', '3');
    assert.equal(res.status, 403);
    assertErrorShape(res.body);
    assert.equal(res.body.error.code, 'FORBIDDEN');
  });

  it('Error Response Layout – unknown route 404', async () => {
    const res = await request(testServer.app).get('/does-not-exist');
    assert.equal(res.status, 404);
    assertErrorShape(res.body);
  });
});
