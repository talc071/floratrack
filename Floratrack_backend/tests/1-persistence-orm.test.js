require('dotenv').config();

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const { Sequelize } = require('sequelize');
const { sequelize, Plant, User, Admin, UserPlant, CareLog } = require('../models');
const { createTestServer } = require('./helpers/server');

function createFreshConnection() {
  return new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '3306', 10),
      dialect: 'mysql',
      logging: false,
    }
  );
}

describe('1. Persistence & ORM Integration', () => {
  let testServer;

  before(async () => {
    await sequelize.authenticate();
    testServer = await createTestServer();
  });

  after(async () => {
    if (testServer) await testServer.close();
    await sequelize.close();
  });

  it('Server Restart Test – data persists after reconnect', async () => {
    const createRes = await request(testServer.app)
      .post('/plants')
      .set('x-user-role', 'admin')
      .set('x-user-id', '1')
      .send({
        userId: 1,
        name: 'Persistence Test Plant',
        species: 'Testus persistus',
        location: 'Office',
      });

    assert.equal(createRes.status, 201);
    const plantId = createRes.body.data.plantId;

    // Simulate server restart with a fresh DB connection (ORM pool re-init)
    const freshDb = createFreshConnection();
    await freshDb.authenticate();
    const [rows] = await freshDb.query('SELECT name FROM plants WHERE plantId = ?', {
      replacements: [plantId],
    });
    await freshDb.close();

    assert.equal(rows.length, 1);
    assert.equal(rows[0].name, 'Persistence Test Plant');

    await Plant.destroy({ where: { plantId } });
  });

  it('Complete CRUD Validation', async () => {
    const createRes = await request(testServer.app)
      .post('/plants')
      .set('x-user-role', 'admin')
      .set('x-user-id', '1')
      .send({
        userId: 1,
        name: 'CRUD Test',
        species: 'Crudia testia',
        location: 'Kitchen',
      });
    assert.equal(createRes.status, 201);
    const plantId = createRes.body.data.plantId;

    const row = await Plant.findByPk(plantId);
    assert.ok(row);

    const readRes = await request(testServer.app).get(`/plants/${plantId}`);
    assert.equal(readRes.status, 200);
    assert.equal(readRes.body.data.name, 'CRUD Test');

    const updateRes = await request(testServer.app)
      .put(`/plants/${plantId}`)
      .set('x-user-role', 'admin')
      .set('x-user-id', '1')
      .send({
        name: 'CRUD Updated',
        species: 'Crudia testia',
        location: 'Kitchen',
        healthStatus: 'healthy',
      });
    assert.equal(updateRes.status, 200);

    await row.reload();
    assert.equal(row.name, 'CRUD Updated');

    const deleteRes = await request(testServer.app)
      .delete(`/plants/${plantId}`)
      .set('x-user-role', 'admin')
      .set('x-user-id', '1');
    assert.equal(deleteRes.status, 200);

    const gone = await Plant.findByPk(plantId);
    assert.equal(gone, null);
  });

  it('ORM Schema Relationship Test – 1:N owner, M:N shares, care logs', async () => {
    const historyRes = await request(testServer.app).get('/plants/1/history');
    assert.equal(historyRes.status, 200);

    const { plant, owner, sharedUsers, careLogs } = historyRes.body.data;
    assert.ok(plant.plantId);
    assert.ok(owner.userId);
    assert.ok(Array.isArray(sharedUsers));
    assert.ok(sharedUsers.length >= 1);
    assert.ok(Array.isArray(careLogs));

    const admin = await Admin.findOne({ where: { userId: 1 } });
    assert.ok(admin);

    const share = await UserPlant.findOne({ where: { plantId: 1 } });
    assert.ok(share);

    const ownerPlants = await Plant.findAll({ where: { userId: plant.userId } });
    assert.ok(ownerPlants.length >= 1);

    const logs = await CareLog.findAll({ where: { plantId: 1 } });
    assert.ok(logs.length >= 1);
  });
});
