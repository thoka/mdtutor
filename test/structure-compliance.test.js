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
  assert.ok(existsSync(projectsDir), 'RPL projects directory should exist');
  
  const rplSyncPath = join(rootDir, 'content/RPL/config/sync.yaml');
  const pathwaysDir = join(rootDir, 'content/RPL/layers/official/pathways');
  
  if (existsSync(rplSyncPath)) {
    const syncData = yaml.load(readFileSync(rplSyncPath, 'utf8'));
    const pathwaySlugs = syncData.sync?.pathways?.official || [];
    
    // Check projects from the first available pathway
    for (const pSlug of pathwaySlugs) {
      const pathwayFile = join(pathwaysDir, `${pSlug}.yaml`);
      if (existsSync(pathwayFile)) {
        const pathwayData = yaml.load(readFileSync(pathwayFile, 'utf8'));
        const firstProject = pathwayData.projects?.[0];
        const firstProjectSlug = typeof firstProject === 'string' ? firstProject : firstProject?.slug;
        
        if (firstProjectSlug) {
          const projectRepo = join(projectsDir, firstProjectSlug, 'repo');
          assert.ok(existsSync(projectRepo), `${firstProjectSlug} repo should be cloned in ${projectRepo}`);
          return; // Test passed
        }
      }
    }
  }
});

test('Structure Compliance: API Snapshots (Flat)', async () => {
  const snapshotsDir = join(rootDir, 'test/snapshots');
  assert.ok(existsSync(snapshotsDir), 'test/snapshots should exist');
  
  const rplSyncPath = join(rootDir, 'content/RPL/config/sync.yaml');
  const pathwaysDir = join(rootDir, 'content/RPL/layers/official/pathways');

  if (existsSync(rplSyncPath)) {
    const syncData = yaml.load(readFileSync(rplSyncPath, 'utf8'));
    const pathwaySlugs = syncData.sync?.pathways?.official || [];
    
    for (const pSlug of pathwaySlugs) {
      const pathwayFile = join(pathwaysDir, `${pSlug}.yaml`);
      if (existsSync(pathwayFile)) {
        const pathwayData = yaml.load(readFileSync(pathwayFile, 'utf8'));
        const firstProject = pathwayData.projects?.[0];
        const firstProjectSlug = typeof firstProject === 'string' ? firstProject : firstProject?.slug;
        
        if (firstProjectSlug) {
          const projectApi = join(snapshotsDir, `${firstProjectSlug}-api-project-en.json`);
          assert.ok(existsSync(projectApi), `${firstProjectSlug} API JSON should exist in ${projectApi}`);
          return; // Test passed
        }
      }
    }
  }
});
