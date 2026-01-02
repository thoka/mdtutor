import { test } from 'node:test';
import assert from 'node:assert';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));

test('Topic Spaces and Visibility Filtering', async (t) => {
  const serverProcess = spawn('node', [join(__dirname, '../src/server.js')], {
    env: { ...process.env, API_PORT: '3104' }
  });

  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    await t.test('GET /api/v1/en/topics returns hierarchy', async () => {
      const res = await fetch('http://localhost:3104/api/v1/en/topics');
      const data = await res.json();
      assert.ok(data.technologies.programming, 'Should have programming technology');
      assert.ok(data.technologies.scratch, 'Should have scratch technology');
      assert.strictEqual(data.technologies.programming.color, '#4CAF50', 'Should have color');
    });

    await t.test('Visibility: Hidden for unauthorized user', async () => {
      // Mock a request without proper group/achievement
      const res = await fetch('http://localhost:3104/api/v1/en/pathways');
      const data = await res.json();
      // Assuming we have a restricted pathway in test data
      const restricted = data.data.find(p => p.attributes.slug === 'restricted-path');
      assert.strictEqual(restricted, undefined, 'Restricted pathway should be hidden');
    });

    await t.test('Visibility: Visible but locked for user with group but missing achievement', async () => {
      // Mock JWT with group 'students' but no achievements
      const res = await fetch('http://localhost:3104/api/v1/en/pathways', {
        headers: { 'Authorization': 'Bearer MOCK_STUDENT_TOKEN' }
      });
      const data = await res.json();
      const locked = data.data.find(p => p.attributes.slug === 'RPL:locked-path');
      assert.ok(locked, 'Locked pathway should be visible');
      assert.strictEqual(locked.attributes.locked, true, 'Pathway should be marked as locked');
    });

  } finally {
    serverProcess.kill();
  }
});
