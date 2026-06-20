import fs from 'fs';
import path from 'path';

const FRONTEND_SRC = path.join(__dirname, '..');

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
    else if (/\.(js|jsx)$/.test(entry.name)) files.push(full);
  }
  return files;
}

describe('Checklist – AI security (frontend)', () => {
  it('identifyPlant routes through backend /api/ai/identify', () => {
    const content = fs.readFileSync(path.join(FRONTEND_SRC, 'services/careLogsService.js'), 'utf8');
    expect(content).toContain("postForm('/api/ai/identify'");
    expect(content).not.toContain('generativelanguage.googleapis.com');
    expect(content).not.toContain('api.openai.com');
    expect(content).not.toMatch(/localhost:3000/);
  });

  it('no AI provider secrets in frontend source', () => {
    const files = walkDir(FRONTEND_SRC);
    const violations = [];
    for (const file of files) {
      const content = fs.readFileSync(file, 'utf8');
      for (const pattern of SECRET_PATTERNS) {
        if (pattern.re.test(content)) {
          violations.push(`${path.relative(FRONTEND_SRC, file)}: ${pattern.name}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});

describe('Checklist – API client', () => {
  it('api.js uses env-based backend URL', () => {
    const content = fs.readFileSync(path.join(FRONTEND_SRC, 'services/api.js'), 'utf8');
    expect(content).toContain('REACT_APP_API_BASE_URL');
    expect(content).toContain('REACT_APP_SOCKET_URL');
  });
});
