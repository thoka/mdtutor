import { test } from 'node:test';
import assert from 'node:assert';
import { parseMeta } from '../src/utils/parse-meta.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');

test('parseMeta - silly-eyes', () => {
  const metaPath = join(projectRoot, 'test/snapshots/silly-eyes/repo/en/meta.yml');
  const result = parseMeta(metaPath);
  
  assert.strictEqual(result.title, 'Silly eyes');
  assert.strictEqual(result.version, 4);
  assert.strictEqual(result.listed, true);
  assert.strictEqual(Array.isArray(result.steps), true);
  assert.strictEqual(result.steps.length, 7);
  assert.strictEqual(result.steps[0].title, 'You will make');
  assert.strictEqual(result.steps[0].position, 0);
  assert.strictEqual(result.steps[4].quiz, false); // Quiz step
  assert.deepStrictEqual(result.steps[4].knowledgeQuiz, {
    path: 'quiz1',
    version: 1,
    questions: 3,
    passing_score: 3
  });
});
