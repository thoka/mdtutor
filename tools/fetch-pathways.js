import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import { cloneRepository, fetchProjectApi } from '../test/get-test-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const ECOSYSTEM_ID = 'RPL'; // Hardcoded for now, could be an arg
const ECOSYSTEM_DIR = join(PROJECT_ROOT, 'content', ECOSYSTEM_ID);
const CONFIG_DIR = join(ECOSYSTEM_DIR, 'config');
const SYNC_FILE = join(CONFIG_DIR, 'sync.yaml');
const ECO_FILE = join(ECOSYSTEM_DIR, 'ecosystem.yaml');

async function fetchWithCurl(url) {
  try {
    const output = execSync(`curl -s -L "${url}"`, { encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
    if (!output.trim()) {
      throw new Error('Empty response from curl');
    }
    return JSON.parse(output);
  } catch (e) {
    throw new Error(`Curl failed for ${url}: ${e.message}`);
  }
}

async function fetchPathwayData(slug, lang = 'en', apiBase) {
  const url = `${apiBase}/${lang}/pathways/${slug}`;
  console.log(`Fetching pathway metadata: ${url}`);
  return fetchWithCurl(url);
}

async function fetchPathwayProjects(slug, lang = 'en', apiBase) {
  const url = `${apiBase}/${lang}/pathways/${slug}/projects`;
  console.log(`Fetching pathway projects: ${url}`);
  return fetchWithCurl(url);
}

async function syncPathway(slug, layerId, layers, ecoConfig) {
  const layer = layers[layerId];
  if (!layer) throw new Error(`Layer ${layerId} not found in sync.yaml`);

  console.log(`\n=== Syncing Pathway: ${slug} (Source: ${layerId}) ===`);

  const layerPath = join(ECOSYSTEM_DIR, 'layers', layerId);
  const pathwaysDir = join(layerPath, 'pathways');
  const projectsDir = join(layerPath, 'projects');
  
  mkdirSync(pathwaysDir, { recursive: true });
  mkdirSync(projectsDir, { recursive: true });

  const apiBase = layer.api_base || 'https://learning-admin.raspberrypi.org/api/v1';
  const prefix = ecoConfig.semantic_prefix || ECOSYSTEM_ID;

  // Fetch metadata and projects (try German first, fallback to English for structure)
  let metaData;
  try {
    metaData = await fetchPathwayData(slug, 'de-DE', apiBase);
  } catch (e) {
    console.log(`  ℹ German metadata not found or failed, falling back to English`);
    metaData = await fetchPathwayData(slug, 'en', apiBase);
  }

  const projectsData = await fetchPathwayProjects(slug, 'en', apiBase);

  const attributes = metaData.data.attributes;
  const steps = metaData.included || [];
  const projects = projectsData.data || [];

  // Map project IDs to slugs
  const idToSlug = {};
  projects.forEach(p => {
    idToSlug[p.id] = p.attributes.repositoryName || p.id;
  });

  // Create our internal format (minimalist, GIDs inferred from path/config)
  const pathwayConfig = {
    title: attributes.title,
    description: attributes.description,
    projects: projects.map(p => {
      const step = steps.find(s => s.attributes.projectId.toString() === p.id);
      const projectSlug = idToSlug[p.id];
      return {
        slug: projectSlug,
        category: step?.attributes.category || 'explore'
      };
    }),
    header: attributes.header?.map(h => ({
      title: h.title,
      content: h.content
    })) || []
  };

  // Save the pathway YAML
  const outputFile = join(pathwaysDir, `${slug}.yaml`);
  writeFileSync(outputFile, yaml.dump(pathwayConfig, { noRefs: true }));
  console.log(`✓ Saved pathway config to ${outputFile}`);

  // Sync projects
  console.log(`Syncing ${projects.length} projects to ${projectsDir}...`);
  for (const p of pathwayConfig.projects) {
    const projectSlug = p.slug;
    const projectGid = `${prefix}:PROJ:${projectSlug}`;
    console.log(`  - ${projectSlug} (${projectGid})`);
    await cloneRepository(projectSlug, { 
      gitBase: layer.git_base,
      projectsDir: projectsDir 
    });
    // Snapshots are still kept in a flat structure for now as per SPEC
    await fetchProjectApi(projectSlug, 'en', { snapshotsDir: 'test/snapshots' });
    await fetchProjectApi(projectSlug, 'de-DE', { snapshotsDir: 'test/snapshots' });
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (!existsSync(SYNC_FILE)) {
    console.error(`Error: ${SYNC_FILE} not found.`);
    return;
  }

  const syncConfig = yaml.load(readFileSync(SYNC_FILE, 'utf8'));
  const ecoConfig = existsSync(ECO_FILE) ? yaml.load(readFileSync(ECO_FILE, 'utf8')) : {};
  const layers = syncConfig.layers || {};
  const syncPathways = syncConfig.sync?.pathways || {};
  
  let syncList = [];

  if (args.length > 0) {
    for (const arg of args) {
      // Find which layer this slug belongs to in the config
      let layerId = 'official'; // default
      for (const [lId, slugs] of Object.entries(syncPathways)) {
        if (slugs.includes(arg)) {
          layerId = lId;
          break;
        }
      }
      syncList.push({ slug: arg, layerId });
    }
  } else {
    for (const [layerId, slugs] of Object.entries(syncPathways)) {
      for (const slug of slugs) {
        syncList.push({ slug, layerId });
      }
    }
  }

  if (syncList.length === 0) {
    console.log('No pathways to sync.');
    return;
  }

  for (const item of syncList) {
    try {
      await syncPathway(item.slug, item.layerId, layers, ecoConfig);
    } catch (e) {
      console.error(`✗ Error syncing pathway ${item.slug}:`, e.message);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
