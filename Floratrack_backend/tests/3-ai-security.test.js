require('dotenv').config();

const { describe, it, before, after } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const request = require('supertest');
const { sequelize } = require('../models');
const { createTestServer } = require('./helpers/server');

const FRONTEND_SRC = path.join(__dirname, '../../Flora_Frontend/src');
const SECRET_PATTERNS = [
  { name: 'GEMINI_API_KEY assignment', re: /GEMINI_API_KEY\s*=\s*['"][^'"]+['"]/ },
  { name: 'OPENAI_API_KEY assignment', re: /OPENAI_API_KEY\s*=\s*['"][^'"]+['"]/ },
  { name: 'OpenAI sk- token', re: /sk-[a-zA-Z0-9]{20,}/ },
  { name: 'Gemini API URL call', re: /fetch\s*\(\s*['"]https:\/\/generativelanguage\.googleapis\.com/ },
  { name: 'OpenAI API URL call', re: /fetch\s*\(\s*['"]https:\/\/api\.openai\.com/ },
];

function walkDir(dir, files = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === '__tests__') continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walkDir(full, files);
    else if (/\.(js|jsx|ts|tsx|env)$/.test(entry.name)) files.push(full);
  }
  return files;
}

describe('3. AI Service Integration', () => {
  let testServer;

  before(async () => {
    await sequelize.authenticate();
    testServer = await createTestServer();
  });

  after(async () => {
    if (testServer) await testServer.close();
    await sequelize.close();
  });

  it('Architecture – AI route exists on Express backend only', async () => {
    const res = await request(testServer.app)
      .post('/api/ai/identify')
      .set('x-user-role', 'user')
      .set('x-user-id', '3');
    assert.equal(res.status, 400);
    assert.equal(res.body.success, false);
  });

  it('Source Code Secret Scan – frontend has no AI provider secrets', () => {
    const files = walkDir(FRONTEND_SRC);
    const violations = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.re.test(content)) {
          violations.push(`${path.relative(FRONTEND_SRC, file)} matches ${pattern.name}`);
        }
      }
    }

    assert.equal(violations.length, 0, violations.join('\n'));
  });

  it('Frontend AI calls backend path /api/ai/identify not external provider', () => {
    const careLogs = fs.readFileSync(
      path.join(FRONTEND_SRC, 'services/careLogsService.js'),
      'utf8'
    );
    assert.ok(careLogs.includes("postForm('/api/ai/identify'"));
    assert.ok(!careLogs.includes('generativelanguage.googleapis.com'));
    assert.ok(!careLogs.includes('api.openai.com'));
  });

  it('Domain Context – AI controller returns plant identification shape', () => {
    const aiController = fs.readFileSync(
      path.join(__dirname, '../controllers/ai.controller.js'),
      'utf8'
    );
    const requiredFields = ['commonName', 'species', 'confidence', 'wateringFrequencyDays', 'careInstructions'];
    for (const field of requiredFields) {
      assert.ok(aiController.includes(field), `AI response should include ${field}`);
    }
    assert.ok(aiController.includes('plant identification') || aiController.includes('plant image'));
  });
});
