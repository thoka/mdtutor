import { test } from 'node:test';
import assert from 'node:assert';
import { parseProject } from '../src/parse-project.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');

test('parseProject - German content', async () => {
  const projectPath = join(projectRoot, 'test/snapshots/silly-eyes/repo/de-DE');
  const result = await parseProject(projectPath);
  
  assert.strictEqual(result.data.attributes.content.title, 'Alberne Augen');
  assert.ok(result.data.attributes.content.steps.length > 0);
});

test('parseProject - Fallback logic', async () => {
  const repoPath = join(projectRoot, 'test/snapshots/silly-eyes/repo');
  
  // Prefer German
  const resultDe = await parseProject(repoPath, { languages: ['de-DE', 'en'] });
  assert.strictEqual(resultDe.data.attributes.content.title, 'Alberne Augen');
  
  // Prefer English
  const resultEn = await parseProject(repoPath, { languages: ['en', 'de-DE'] });
  assert.strictEqual(resultEn.data.attributes.content.title, 'Silly eyes');
  
  // Fallback to English if German not available (using a project that only has en)
  const repoPathEnOnly = join(projectRoot, 'test/snapshots/scratchpc-interactive-book/repo');
  const resultFallback = await parseProject(repoPathEnOnly, { languages: ['de-DE', 'en'] });
  assert.strictEqual(resultFallback.data.attributes.content.title, 'Make an interactive book');
});

test('Transclusion - Language fallback', async () => {
  const repoPath = join(projectRoot, 'test/snapshots/silly-eyes/repo');
  
  // Parse German project, should have German transclusions
  const resultDe = await parseProject(repoPath, { languages: ['de-DE', 'en'] });
  const step2 = resultDe.data.attributes.content.steps[1];
  
  // "working-offline" in German is "Offline arbeiten"
  assert.ok(step2.content.includes('Offline arbeiten'), 'Should contain German transclusion content');
  
  // Parse English project, should have English transclusions
  const resultEn = await parseProject(repoPath, { languages: ['en', 'de-DE'] });
  const step2En = resultEn.data.attributes.content.steps[1];
  assert.ok(step2En.content.includes('Working offline'), 'Should contain English transclusion content');
});
