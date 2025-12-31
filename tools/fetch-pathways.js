import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import { cloneRepository, fetchProjectApi } from '../test/get-test-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PATHWAYS_DIR = join(__dirname, '../content/RPL/pathways');
const CONFIG_FILE = join(PATHWAYS_DIR, 'config.yaml');
const API_BASE = 'https://learning-admin.raspberrypi.org/api/v1';

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

async function fetchPathwayData(slug, lang = 'en') {
  const url = `${API_BASE}/${lang}/pathways/${slug}`;
  console.log(`Fetching pathway metadata: ${url}`);
  return fetchWithCurl(url);
}

async function fetchPathwayProjects(slug, lang = 'en') {
  const url = `${API_BASE}/${lang}/pathways/${slug}/projects`;
  console.log(`Fetching pathway projects: ${url}`);
  return fetchWithCurl(url);
}

async function syncPathway(slug) {
  console.log(`\n=== Syncing Pathway: ${slug} ===`);

  // Fetch metadata and projects (try German first, fallback to English for structure)
  let metaData;
  try {
    metaData = await fetchPathwayData(slug, 'de-DE');
  } catch (e) {
    console.log(`  ℹ German metadata not found, falling back to English`);
    metaData = await fetchPathwayData(slug, 'en');
  }

  const projectsData = await fetchPathwayProjects(slug, 'en');

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
    header: attributes.header.map(h => ({
      title: h.title,
      content: h.content
    }))
  };

  // Save the pathway YAML
  const outputFile = join(PATHWAYS_DIR, `${slug}.yaml`);
  writeFileSync(outputFile, yaml.dump(pathwayConfig, { noRefs: true }));
  console.log(`✓ Saved pathway config to ${outputFile}`);

  // Sync projects
  console.log(`Syncing ${projects.length} projects...`);
  for (const p of pathwayConfig.projects) {
    const projectSlug = p.slug;
    console.log(`  - ${projectSlug}`);
    await cloneRepository(projectSlug);
    await fetchProjectApi(projectSlug, 'en');
    await fetchProjectApi(projectSlug, 'de-DE');
  }
}

async function main() {
  const args = process.argv.slice(2);
  let slugs = [];

  if (args.length > 0) {
    slugs = args;
  } else if (existsSync(CONFIG_FILE)) {
    const config = yaml.load(readFileSync(CONFIG_FILE, 'utf8'));
    slugs = config.pathways || [];
  }

  if (slugs.length === 0) {
    console.log('No pathways configured. Add them to content/RPL/pathways/config.yaml or pass as arguments.');
    return;
  }

  for (const slug of slugs) {
    try {
      await syncPathway(slug);
    } catch (e) {
      console.error(`✗ Error syncing pathway ${slug}:`, e.message);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
