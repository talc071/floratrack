/**
 * Quick integration checks against a running FloraTrack API.
 * Usage: node scripts/verify-api.js
 */
const BASE = process.env.API_BASE || 'http://localhost:3000';

const tests = [];
const assert = (name, condition, detail = '') => {
  tests.push({ name, pass: !!condition, detail });
};

async function request(method, path, { headers = {}, body } = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined
  });
  const data = await res.json();
  return { status: res.status, data };
}

async function run() {
  try {
    const health = await request('GET', '/health');
    assert('GET /health returns 200', health.status === 200 && health.data.success);

    const users = await request('GET', '/users');
    assert('GET /users returns seeded users', users.data.success && users.data.data.length >= 5);

    const plants = await request('GET', '/plants');
    assert('GET /plants returns seeded plants', plants.data.success && plants.data.data.length >= 6);

    const history = await request('GET', '/plants/1/history');
    assert('GET /plants/1/history JOIN query', history.data.success && history.data.data.plant && history.data.data.careLogs);
    assert('History includes owner', !!history.data.data.owner);
    assert('History includes shared users', Array.isArray(history.data.data.sharedUsers));

    const login = await request('POST', '/api/auth/login', {
      body: { email: 'alice@floratrack.com', password: 'admin123' }
    });
    assert('POST /api/auth/login', login.data.success && login.data.data.userRole === 'admin');

    const create = await request('POST', '/plants', {
      headers: { 'x-user-role': 'admin', 'x-user-id': '1' },
      body: {
        userId: 1,
        name: 'Test Plant',
        species: 'Test species',
        location: 'Office'
      }
    });
    assert('POST /plants creates plant', create.status === 201 && create.data.success);

    const plantId = create.data.data.plantId;
    const update = await request('PUT', `/plants/${plantId}`, {
      headers: { 'x-user-role': 'admin', 'x-user-id': '1' },
      body: {
        name: 'Test Plant Updated',
        species: 'Test species',
        location: 'Office',
        healthStatus: 'healthy'
      }
    });
    assert('PUT /plants/:id updates plant', update.data.success);

    const del = await request('DELETE', `/plants/${plantId}`, {
      headers: { 'x-user-role': 'admin', 'x-user-id': '1' }
    });
    assert('DELETE /plants/:id removes plant', del.data.success);

    const ai = await request('POST', '/api/ai/identify', {
      headers: { 'x-user-role': 'user', 'x-user-id': '3' }
    });
    assert('POST /api/ai/identify without image returns 400', ai.status === 400 || !ai.data.success);

  } catch (err) {
    assert('API reachable', false, err.message);
  }

  const passed = tests.filter((t) => t.pass).length;
  const failed = tests.filter((t) => !t.pass);

  console.log(`\nAPI Verification: ${passed}/${tests.length} passed\n`);
  tests.forEach((t) => console.log(`${t.pass ? 'PASS' : 'FAIL'} - ${t.name}${t.detail ? ` (${t.detail})` : ''}`));

  if (failed.length) process.exit(1);
}

run();
