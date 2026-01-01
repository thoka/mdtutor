import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import { cloneRepository, fetchProjectApi } from '../test/get-test-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ECOSYSTEM_DIR = join(__dirname, '../content/RPL');
const SOURCES_FILE = join(ECOSYSTEM_DIR, 'sources.yaml');

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

async function syncPathway(slug, sourceInfo, layers) {
  const layer = layers.find(l => l.id === sourceInfo.source);
  if (!layer) throw new Error(`Layer ${sourceInfo.source} not found`);

  console.log(`\n=== Syncing Pathway: ${slug} (Source: ${layer.id}) ===`);

  const layerPath = join(ECOSYSTEM_DIR, 'layers', layer.id);
  const pathwaysDir = join(layerPath, 'pathways');
  const projectsDir = join(layerPath, 'projects');
  
  mkdirSync(pathwaysDir, { recursive: true });
  mkdirSync(projectsDir, { recursive: true });

  const apiBase = layer.api_base || 'https://learning-admin.raspberrypi.org/api/v1';

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

  // Create our internal format
  const pathwayConfig = {
    id: attributes.id?.toString() || slug,
    slug: slug,
    title: attributes.title,
    description: attributes.description,
    projects: projects.map(p => {
      const step = steps.find(s => s.attributes.projectId.toString() === p.id);
      return {
        slug: idToSlug[p.id],
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
    console.log(`  - ${projectSlug}`);
    await cloneRepository(projectSlug, { 
      gitBase: layer.git_base,
      projectsDir: projectsDir 
    });
    await fetchProjectApi(projectSlug, 'en', { snapshotsDir: 'test/snapshots' });
    await fetchProjectApi(projectSlug, 'de-DE', { snapshotsDir: 'test/snapshots' });
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (!existsSync(SOURCES_FILE)) {
    console.error(`Error: ${SOURCES_FILE} not found.`);
    return;
  }

  const sources = yaml.load(readFileSync(SOURCES_FILE, 'utf8'));
  const layers = sources.layers || [];
  let syncList = [];

  if (args.length > 0) {
    // If slugs are passed as args, try to find them in sync list or default to official
    for (const arg of args) {
      const found = sources.sync?.pathways?.find(p => p.slug === arg);
      syncList.push(found || { slug: arg, source: 'official' });
    }
  } else {
    syncList = sources.sync?.pathways || [];
  }

  if (syncList.length === 0) {
    console.log('No pathways to sync.');
    return;
  }

  for (const item of syncList) {
    try {
      await syncPathway(item.slug, item, layers);
    } catch (e) {
      console.error(`✗ Error syncing pathway ${item.slug}:`, e.message);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
