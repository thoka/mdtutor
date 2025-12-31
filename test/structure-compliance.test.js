import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');

test('Structure Compliance: Providers and Metadata', () => {
  const rplMetaPath = join(rootDir, 'content/RPL/meta.yml');
  assert.ok(existsSync(rplMetaPath), 'content/RPL/meta.yml should exist');
  
  const rplMeta = yaml.load(readFileSync(rplMetaPath, 'utf8'));
  assert.strictEqual(rplMeta.namespace, 'rpl', 'RPL namespace should be "rpl"');
  
  const tagMetaPath = join(rootDir, 'content/TAG/meta.yml');
  assert.ok(existsSync(tagMetaPath), 'content/TAG/meta.yml should exist');
  
  const tagMeta = yaml.load(readFileSync(tagMetaPath, 'utf8'));
  assert.strictEqual(tagMeta.namespace, 'tag', 'TAG namespace should be "tag"');
});

test('Structure Compliance: Pathways', () => {
  const rplPathwaysPath = join(rootDir, 'content/RPL/pathways/rpl-pathways.yaml');
  assert.ok(existsSync(rplPathwaysPath), 'content/RPL/pathways/rpl-pathways.yaml should exist');
});

test('Structure Compliance: Cloned Repositories', () => {
  const projectsDir = join(rootDir, 'content/RPL/projects');
  assert.ok(existsSync(projectsDir), 'content/RPL/projects should exist');
  
  // Check for at least one project (e.g., silly-eyes)
  const sillyEyesRepo = join(projectsDir, 'silly-eyes/repo');
  assert.ok(existsSync(sillyEyesRepo), 'silly-eyes repo should be cloned in content/RPL/projects/silly-eyes/repo');
});

test('Structure Compliance: API Snapshots (Flat)', async () => {
  const snapshotsDir = join(rootDir, 'test/snapshots');
  assert.ok(existsSync(snapshotsDir), 'test/snapshots should exist');
  
  // Check for flat API JSON files
  const sillyEyesApi = join(snapshotsDir, 'silly-eyes-api-project-en.json');
  assert.ok(existsSync(sillyEyesApi), 'silly-eyes API JSON should exist in test/snapshots/silly-eyes-api-project-en.json');
  
  // Ensure no subdirectories in snapshots (except maybe .gitkeep if it existed)
  const { readdirSync, statSync } = await import('node:fs');
  const items = readdirSync(snapshotsDir);
  const dirs = items.filter(item => statSync(join(snapshotsDir, item)).isDirectory());
  assert.strictEqual(dirs.length, 0, 'test/snapshots should not contain subdirectories');
});
