/**
 * Integration test - compare parser output with API snapshot
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { parseProject } from '../src/parse-project.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '../../..');

test('integration - silly-eyes matches API snapshot structure', async () => {
  // Parse with our parser
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const parsed = await parseProject(projectPath);
  
  // Load API snapshot
  const apiPath = join(projectRoot, 'test/snapshots/silly-eyes-api-project-en.json');
  const apiData = JSON.parse(await readFile(apiPath, 'utf-8'));
  
  // Compare basic structure
  assert.strictEqual(parsed.data.type, apiData.data.type);
  assert.strictEqual(parsed.data.attributes.content.title, apiData.data.attributes.content.title);
  assert.strictEqual(parsed.data.attributes.content.description, apiData.data.attributes.content.description);
  
  // Compare steps count
  assert.strictEqual(parsed.data.attributes.content.steps.length, apiData.data.attributes.content.steps.length);
  
  // Compare first step title
  assert.strictEqual(
    parsed.data.attributes.content.steps[0].title,
    apiData.data.attributes.content.steps[0].title
  );
  
  // Verify HTML content includes expected elements
  const firstStepContent = parsed.data.attributes.content.steps[0].content;
  assert.ok(firstStepContent.includes('<div class="u-no-print">'));
  assert.ok(firstStepContent.includes('<div class="c-project-task">'));
  
  // Verify link attributes
  const secondStepContent = parsed.data.attributes.content.steps[1].content;
  assert.ok(secondStepContent.includes('target="_blank"'));
  assert.ok(secondStepContent.includes('width="300px"'));
});
