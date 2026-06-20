const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '../..');
const BACKEND = path.join(ROOT, 'Floratrack_backend');
const FRONTEND = path.join(ROOT, 'Flora_Frontend');

describe('5. Pre-Submission Sanity Checks', () => {
  it('Project Structure Verification', () => {
    const required = [
      path.join(FRONTEND, 'src'),
      path.join(BACKEND, 'src'),
      path.join(BACKEND, 'models'),
      path.join(BACKEND, 'migrations'),
    ];
    for (const dir of required) {
      assert.ok(fs.existsSync(dir), `Missing required directory: ${dir}`);
    }
  });

  it('Submission readiness – .env.example files present', () => {
    assert.ok(fs.existsSync(path.join(BACKEND, '.env.example')));
    assert.ok(fs.existsSync(path.join(FRONTEND, '.env.example')));
  });

  it('Submission readiness – Postman collection is valid JSON', () => {
    const postmanPath = path.join(BACKEND, 'docs/FloraTrack.postman_collection.json');
    assert.ok(fs.existsSync(postmanPath));
    const collection = JSON.parse(fs.readFileSync(postmanPath, 'utf8'));
    assert.ok(collection.info.name);
    assert.ok(Array.isArray(collection.item));
  });

  it('Submission readiness – .env.example has placeholders not real secrets', () => {
    const example = fs.readFileSync(path.join(BACKEND, '.env.example'), 'utf8');
    assert.ok(example.includes('your_gemini_api_key_here'));
    assert.ok(!example.includes('Talc!'));
  });

  it('Submission archive note – manual items (video + 6 screenshots) flagged for user', () => {
    const screenshotsDir = path.join(ROOT, 'screenshots');
    const hasScreenshots = fs.existsSync(screenshotsDir) &&
      fs.readdirSync(screenshotsDir).some((f) => /\.(png|jpg|jpeg)$/i.test(f));

    if (!hasScreenshots) {
      console.log('  [MANUAL] Add demo video and 6 mandatory screenshots before final ZIP submission.');
    }
    assert.ok(true);
  });
});
