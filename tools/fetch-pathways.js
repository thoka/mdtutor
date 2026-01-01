import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';
import yaml from 'js-yaml';
import { parse as parseHtml } from 'node-html-parser';
import { cloneRepository, fetchProjectApi } from '../test/get-test-data.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '..');
const ECOSYSTEM_ID = 'RPL'; // Hardcoded for now, could be an arg
const ECOSYSTEM_DIR = join(PROJECT_ROOT, 'content', ECOSYSTEM_ID);
const CONFIG_DIR = join(ECOSYSTEM_DIR, 'config');
const SYNC_FILE = join(CONFIG_DIR, 'sync.yaml');
const ECO_FILE = join(ECOSYSTEM_DIR, 'ecosystem.yaml');

const LANGUAGES = ['en', 'de-DE'];

function htmlToMarkdown(html) {
  if (!html) return '';
  const root = parseHtml(html);
  
  function convertNode(node) {
    if (node.nodeType === 3) { // Text node
      return node.text;
    }
    
    const tagName = node.tagName?.toLowerCase();
    const children = node.childNodes.map(convertNode).join('');
    
    switch (tagName) {
      case 'h1':
      case 'h2':
      case 'h3':
        const level = tagName.slice(1);
        return `${'#'.repeat(parseInt(level))} ${children}\n\n`;
      case 'p':
        return `${children}\n\n`;
      case 'ul':
        return `${children}\n`;
      case 'ol':
        return `${children}\n`;
      case 'li':
        return `* ${children.trim()}\n`;
      case 'strong':
      case 'b':
        return `**${children}**`;
      case 'em':
      case 'i':
        return `*${children}*`;
      case 'a':
        const href = node.getAttribute('href');
        return `[${children}](${href})`;
      case 'br':
        return '\n';
      default:
        return children;
    }
  }
  
  return convertNode(root)
    .replace(/&ndash;/g, '–')
    .replace(/&mdash;/g, '—')
    .replace(/&hellip;/g, '...')
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const HEADER_KEY_MAP = {
  'What will I create?': 'overview',
  'Was werde ich erschaffen?': 'overview',
  'What do I need to know?': 'know',
  'Was muss ich wissen?': 'know',
  'What do I need?': 'need',
  'Was benötige ich?': 'need',
  'Mentor information': 'mentor',
  'Informationen für den Mentor': 'mentor'
};

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
  console.log(`Fetching pathway metadata (${lang}): ${url}`);
  return fetchWithCurl(url);
}

async function fetchPathwayProjects(slug, lang = 'en', apiBase) {
  const url = `${apiBase}/${lang}/pathways/${slug}/projects`;
  console.log(`Fetching pathway projects (${lang}): ${url}`);
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

  const pathwayConfig = {
    title: {},
    description: {
      summary: {}
    },
    projects: []
  };

  // 1. Fetch metadata for all languages to build the unified config
  for (const lang of LANGUAGES) {
    try {
      const metaData = await fetchPathwayData(slug, lang, apiBase);
      const attr = metaData.data.attributes;
      
      pathwayConfig.title[lang] = attr.title;
      pathwayConfig.description.summary[lang] = attr.description;

      // Map headers to semantic keys
      if (attr.header) {
        for (const h of attr.header) {
          const key = HEADER_KEY_MAP[h.title] || h.title.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
          if (!pathwayConfig.description[key]) pathwayConfig.description[key] = {};
          pathwayConfig.description[key][lang] = htmlToMarkdown(h.content);
        }
      }

      // If this is the primary language (en), also fetch projects list
      if (lang === 'en' || pathwayConfig.projects.length === 0) {
        const projectsData = await fetchPathwayProjects(slug, lang, apiBase);
        const projects = projectsData.data || [];
        const steps = metaData.included || [];

        pathwayConfig.projects = projects.map(p => {
          const step = steps.find(s => s.attributes.projectId.toString() === p.id);
          const projectSlug = p.attributes.repositoryName || p.id;
          return {
            slug: projectSlug,
            category: step?.attributes.category || 'explore'
          };
        });
      }
    } catch (e) {
      console.warn(`  ⚠️ Could not fetch ${lang} metadata: ${e.message}`);
    }
  }

  // Save the pathway YAML
  const outputFile = join(pathwaysDir, `${slug}.yaml`);
  writeFileSync(outputFile, yaml.dump(pathwayConfig, { noRefs: true }));
  console.log(`✓ Saved pathway config to ${outputFile}`);

  // 2. Sync projects (repositories and snapshots)
  console.log(`Syncing ${pathwayConfig.projects.length} projects to ${projectsDir}...`);
  for (const p of pathwayConfig.projects) {
    const projectSlug = p.slug;
    const projectGid = `${prefix}:PROJ:${projectSlug}`;
    console.log(`  - ${projectSlug} (${projectGid})`);
    
    await cloneRepository(projectSlug, { 
      gitBase: layer.git_base,
      projectsDir: projectsDir 
    });

    for (const lang of LANGUAGES) {
      await fetchProjectApi(projectSlug, lang, { snapshotsDir: 'test/snapshots' });
    }
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
      let layerId = 'official';
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
