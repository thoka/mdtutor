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
  // Skip meta.yml check if directory structure uses nested layers
  if (existsSync(rplMetaPath)) {
    const rplMeta = yaml.load(readFileSync(rplMetaPath, 'utf8'));
    assert.strictEqual(rplMeta.namespace, 'rpl', 'RPL namespace should be "rpl"');
  }
  
  const tagMetaPath = join(rootDir, 'content/TAG/meta.yml');
  if (existsSync(tagMetaPath)) {
    const tagMeta = yaml.load(readFileSync(tagMetaPath, 'utf8'));
    assert.strictEqual(tagMeta.namespace, 'tag', 'TAG namespace should be "tag"');
  }
});

test('Structure Compliance: Pathways', () => {
  const rplSyncPath = join(rootDir, 'content/RPL/config/sync.yaml');
  const rplPathwaysPath = join(rootDir, 'content/RPL/layers/official/pathways/rpl-pathways.yaml');
  const fallbackPath = join(rootDir, 'content/RPL/pathways/rpl-pathways.yaml');
  
  assert.ok(
    existsSync(rplSyncPath) || existsSync(rplPathwaysPath) || existsSync(fallbackPath), 
    'RPL pathways configuration should exist (sync.yaml or rpl-pathways.yaml)'
  );
});

test('Structure Compliance: Cloned Repositories', () => {
  const projectsDir = join(rootDir, 'content/RPL/layers/official/projects');
  const fallbackDir = join(rootDir, 'content/RPL/projects');
  const activeDir = existsSync(projectsDir) ? projectsDir : fallbackDir;
  
  assert.ok(existsSync(activeDir), 'RPL projects directory should exist');
  
  // We check if at least one project from sync.yaml is cloned
  const rplSyncPath = join(rootDir, 'content/RPL/config/sync.yaml');
  if (existsSync(rplSyncPath)) {
    const syncData = yaml.load(readFileSync(rplSyncPath, 'utf8'));
    const firstProject = syncData.sync?.pathways?.official?.[0];
    if (firstProject) {
      const projectRepo = join(activeDir, firstProject, 'repo');
      assert.ok(existsSync(projectRepo), `${firstProject} repo should be cloned in ${projectRepo}`);
    }
  }
});

test('Structure Compliance: API Snapshots (Flat)', async () => {
  const snapshotsDir = join(rootDir, 'test/snapshots');
  assert.ok(existsSync(snapshotsDir), 'test/snapshots should exist');
  
  // Check for flat API JSON files
  const rplSyncPath = join(rootDir, 'content/RPL/config/sync.yaml');
  if (existsSync(rplSyncPath)) {
    const syncData = yaml.load(readFileSync(rplSyncPath, 'utf8'));
    const firstProject = syncData.sync?.pathways?.official?.[0];
    if (firstProject) {
      const projectApi = join(snapshotsDir, `${firstProject}-api-project-en.json`);
      assert.ok(existsSync(projectApi), `${firstProject} API JSON should exist in ${projectApi}`);
    }
  }
});
