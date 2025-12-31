import { test } from 'node:test';
import assert from 'node:assert';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../../../');
const PATHWAYS_FILE = join(PROJECT_ROOT, 'content/RPL/pathways/rpl-pathways.yaml');

test('API should only return projects from pathways', async (t) => {
  // Start the server
  const { spawn } = await import('node:child_process');
  const serverProcess = spawn('node', [join(__dirname, '../src/server.js')], {
    env: { ...process.env, API_PORT: '3103' }
  });

  // Wait for server to start
  await new Promise(resolve => setTimeout(resolve, 2000));

  try {
    const response = await fetch('http://localhost:3103/api/projects');
    const data = await response.json();
    
    const pathwayContent = readFileSync(PATHWAYS_FILE, 'utf-8');
    const pathwayData = yaml.load(pathwayContent);
    const expectedSlugs = new Set();
    for (const pathway of Object.values(pathwayData)) {
      pathway.forEach(slug => expectedSlugs.add(`rpl:${slug}`));
    }

    console.log('Expected slugs (from pathways):', Array.from(expectedSlugs));
    console.log('Actual slugs (from API):', data.projects.map(p => p.slug));

    assert.strictEqual(data.projects.length, expectedSlugs.size, `Should have exactly ${expectedSlugs.size} projects from pathways`);
    
    for (const project of data.projects) {
      assert.ok(expectedSlugs.has(project.slug), `Project ${project.slug} should be in pathways`);
    }

    // Also verify that some projects that are NOT in pathways are NOT returned
    // We know 'cats-vs-dogs' is in content/RPL/projects but NOT in pathways
    const catsVsDogs = data.projects.find(p => p.slug === 'rpl:cats-vs-dogs');
    assert.strictEqual(catsVsDogs, undefined, 'cats-vs-dogs should not be in the list');

    // Verify direct access still works
    const directRes = await fetch('http://localhost:3103/api/projects/rpl:cats-vs-dogs');
    assert.strictEqual(directRes.status, 200, 'Direct access to non-pathway project should still work');
    const directData = await directRes.json();
    assert.strictEqual(directData.data.id, 'rpl:cats-vs-dogs');
  } finally {
    serverProcess.kill();
  }
});
