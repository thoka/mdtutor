/**
 * Mock API Server
 * 
 * Serves tutorial data from local layers
 * Mimics Raspberry Pi Learning API structure
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync, readdirSync, statSync } from 'fs';
import { readFile as readFileAsync, readdir as readdirAsync } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load root .env if it exists
dotenv.config({ path: join(__dirname, '../../../.env') });

import { parseProject, simpleParse } from '../../parser/src/index.js';
import { getCurrentCommitHash, getCurrentCommitHashShort } from './git-utils.js';
import { loadContentConfig, resolveProjectLayer, resolvePathwayLayer } from './content-resolver.js';

const CONTENT_DIR = join(__dirname, '../../../content');
const SNAPSHOTS_DIR = join(__dirname, '../../../test/snapshots');

// Initialize ecosystems
let ecosystems = loadContentConfig(CONTENT_DIR);
// Trigger restart

/**
 * Resolve a local image path by checking multiple possible locations
 */
function resolveLocalImagePath(ecosystem, layer, pSlug, pLang, imagePath) {
  const repoPath = join(layer.path, 'projects', pSlug, 'repo');
  
  const candidates = [
    join(repoPath, pLang, 'images', imagePath),
    join(repoPath, 'en', 'images', imagePath),
    join(repoPath, imagePath),
    join(repoPath, 'images', imagePath)
  ];
  
  for (const candidate of candidates) {
    if (existsSync(candidate) && statSync(candidate).isFile()) {
      return `/content/${ecosystem.id}/layers/${layer.id}/projects/${pSlug}/repo${candidate.split('/repo')[1]}`;
    }
  }
  
  // Fallback
  return `/content/${ecosystem.id}/layers/${layer.id}/projects/${pSlug}/repo/${pLang}/images/${imagePath}`;
}

/**
 * Helper to find project data with language fallback
 */
async function getProjectData(namespacedSlug, requestedLang) {
  const resolved = resolveProjectLayer(ecosystems, namespacedSlug);
  if (!resolved) return null;

  const { path: projectPath, ecosystem, layer, slug, namespace } = resolved;

  const languages = requestedLang === 'de' || requestedLang === 'de-DE' 
    ? ['de-DE', 'en'] 
    : [requestedLang, 'de-DE', 'en'];
  
  const uniqueLangs = [...new Set(languages)];

  for (const lang of uniqueLangs) {
    try {
      const repoPath = join(projectPath, 'repo', lang);
      if (existsSync(repoPath) && existsSync(join(repoPath, 'meta.yml'))) {
        const parsed = await parseProject(repoPath, { 
          languages: [lang],
          includeQuizData: true
        });
        if (parsed && parsed.data) {
          // GID is already set by the parser

          const imageUrlPattern = /src="(images\/[^"]+)"/g;
          if (parsed.data.attributes?.content?.steps) {
            parsed.data.attributes.content.steps.forEach(step => {
              if (step.content) {
                step.content = step.content.replace(imageUrlPattern, (match, imagePath) => {
                  const absoluteUrl = `/content/${ecosystem.id}/layers/${layer.id}/projects/${slug}/repo/${lang}/${imagePath}`;
                  return `src="${absoluteUrl}"`;
                });
              }
            });
          }
          
          if (parsed.data.attributes?.content?.heroImage) {
            const heroImagePath = parsed.data.attributes.content.heroImage;
            if (heroImagePath.startsWith('images/')) {
              parsed.data.attributes.content.heroImage = `/content/${ecosystem.id}/layers/${layer.id}/projects/${slug}/repo/${lang}/${heroImagePath}`;
            }
          }
          
          const repoDir = join(projectPath, 'repo');
          parsed.languages = existsSync(repoDir) 
            ? readdirSync(repoDir).filter(f => existsSync(join(repoDir, f, 'meta.yml')))
            : [];
          
          return parsed;
        }
      }
    } catch (error) {
      console.warn(`Failed to parse ${slug} from repo (${lang}):`, error.message);
    }
  }

  // legacy Fallback to static JSON files
  for (const lang of uniqueLangs) {
    try {
      let filePath = join(projectPath, `api-project-${lang}.json`);
      if (!existsSync(filePath)) {
        filePath = join(SNAPSHOTS_DIR, `${slug}-api-project-${lang}.json`);
      }

      if (existsSync(filePath)) {
        const data = await readFileAsync(filePath, 'utf-8');
        const parsed = JSON.parse(data);
        const prefix = ecosystem.semantic_prefix || ecosystem.id.toUpperCase();
        parsed.data.id = parsed.data.attributes.gid || `${prefix}:PROJ:${slug}`;

        const rplUrlPattern = /https:\/\/projects-static\.raspberrypi\.org\/projects\/([^/]+)\/[^/]+\/([^/]+)\/images\/([^"]+)/g;
        
        if (parsed.data.attributes?.content?.steps) {
          parsed.data.attributes.content.steps.forEach(step => {
            if (step.content) {
              step.content = step.content.replace(rplUrlPattern, (match, pSlug, pLang, imagePath) => {
                return resolveLocalImagePath(ecosystem, layer, pSlug, pLang, imagePath);
              });
            }
          });
        }

        if (parsed.data.attributes?.content?.heroImage) {
          const heroImage = parsed.data.attributes.content.heroImage;
          const match = rplUrlPattern.exec(heroImage);
          if (match) {
            const [, pSlug, pLang, imagePath] = match;
            parsed.data.attributes.content.heroImage = resolveLocalImagePath(ecosystem, layer, pSlug, pLang, imagePath);
          }
        }
        
        const repoDir = join(projectPath, 'repo');
        parsed.languages = existsSync(repoDir) 
          ? readdirSync(repoDir).filter(f => existsSync(join(repoDir, f, 'meta.yml')))
          : [];

        return parsed;
      }
    } catch {
      // Continue
    }
  }

  throw new Error(`Failed to parse project ${namespacedSlug} from repository or snapshots`);
}

const app = express();
const PORT = process.env.API_PORT;
if (!PORT) process.exit(1);

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
  next();
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    port: PORT,
    commitHash: getCurrentCommitHash(),
    commitHashShort: getCurrentCommitHashShort(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/projects/:slug', async (req, res) => {
  try {
    const projectData = await getProjectData(req.params.slug, req.query.lang || 'de-DE');
    if (projectData) res.json(projectData);
    else res.status(404).json({ error: 'Project not found' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/projects', async (req, res) => {
  try {
    const lang = req.query.lang || 'de-DE';
    const allProjects = [];
    const allLanguages = new Set(['de-DE', 'en']);

    // 1. Find all projects referenced in any pathway
    const pathwayProjects = new Set();
    console.log(`Searching pathways in ${Object.keys(ecosystems).length} ecosystems...`);
    
    for (const ecosystem of Object.values(ecosystems)) {
      for (const layer of ecosystem.layers) {
        const pathwaysDir = join(layer.path, 'pathways');
        if (existsSync(pathwaysDir)) {
          const files = readdirSync(pathwaysDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
          console.log(`  Found ${files.length} pathway files in ${pathwaysDir}`);
          for (const file of files) {
            try {
              const content = await readFileAsync(join(pathwaysDir, file), 'utf-8');
              const data = yaml.load(content);
              if (data.projects) {
                data.projects.forEach(p => {
                  const pSlug = typeof p === 'string' ? p : p.slug;
                  pathwayProjects.add(`${ecosystem.id}:${pSlug}`);
                });
              }
            } catch (e) {
              console.warn(`Failed to read pathway ${file}:`, e.message);
            }
          }
        }
      }
    }

    console.log(`Total projects found in pathways: ${pathwayProjects.size}`);

    // 2. Load project details only for pathway projects
    for (const namespacedSlug of pathwayProjects) {
      try {
        const projectData = await getProjectData(namespacedSlug, lang);
        if (projectData) {
          allProjects.push({
            slug: namespacedSlug,
            title: projectData.data.attributes.content.title,
            description: projectData.data.attributes.content.description,
            languages: projectData.languages,
            heroImage: projectData.data.attributes.content.heroImage
          });
          projectData.languages.forEach(l => allLanguages.add(l));
        }
      } catch (e) {
        console.warn(`Failed to load project ${namespacedSlug}:`, e.message);
      }
    }
    
    res.json({ projects: allProjects, languages: Array.from(allLanguages) });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/pathways', async (req, res) => {
  try {
    const lang = req.query.lang || 'de-DE';
    const requestedLang = lang === 'de' ? 'de-DE' : lang;
    const allPathways = [];

    for (const ecosystem of Object.values(ecosystems)) {
      const seenSlugs = new Set();
      for (const layer of ecosystem.layers) {
        const pathwaysDir = join(layer.path, 'pathways');
        if (existsSync(pathwaysDir)) {
          const files = readdirSync(pathwaysDir).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
          for (const file of files) {
            const slug = file.replace(/\.ya?ml$/, '');
            if (seenSlugs.has(slug)) continue;
            seenSlugs.add(slug);

            try {
              const content = await readFileAsync(join(pathwaysDir, file), 'utf-8');
              const data = yaml.load(content);
              const title = typeof data.title === 'object' 
                ? (data.title[requestedLang] || data.title['en'] || slug)
                : (data.title || slug);
              
              let description = '';
              if (data.description && typeof data.description === 'object') {
                description = data.description.summary?.[requestedLang] || data.description.summary?.['en'] || '';
              } else {
                description = data.description || '';
              }

              let banner = null;
              if (data.banner) {
                banner = `/content/${ecosystem.id}/layers/${layer.id}/pathways/${data.banner}`;
              }

              allPathways.push({
                slug: `${ecosystem.id}:${slug}`,
                title,
                description,
                banner
              });
            } catch (e) {
              console.warn(`Failed to read pathway ${file}:`, e.message);
            }
          }
        }
      }
    }

    res.json({ pathways: allPathways });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/api/v1/:lang/pathways/:pathwayId', async (req, res) => {
  const requestedLang = req.params.lang === 'de' ? 'de-DE' : req.params.lang;
  const resolved = resolvePathwayLayer(ecosystems, req.params.pathwayId);
  if (!resolved) return res.status(404).json({ error: 'Pathway not found' });

  try {
    const content = await readFileAsync(resolved.path, 'utf-8');
    const data = yaml.load(content);
    const prefix = resolved.ecosystem.semantic_prefix || resolved.ecosystem.id.toUpperCase();
    const pathwayGid = data.gid || `${prefix}:PATH:${resolved.slug}`;
    
    // Normalize multi-language fields
    const title = typeof data.title === 'object' ? (data.title[requestedLang] || data.title['en']) : data.title;
    
    let description = '';
    const header = [];

    if (data.description && typeof data.description === 'object') {
      // Map 'summary' to main description
      const summaryMd = data.description.summary?.[requestedLang] || data.description.summary?.['en'] || '';
      description = await simpleParse(summaryMd);
      
      // Map other keys to header sections
      const sections = {
        overview: 'Was werde ich erschaffen?',
        know: 'Was muss ich wissen?',
        need: 'Was benötige ich?',
        mentor: 'Informationen für den Mentor'
      };

      for (const [key, titles] of Object.entries(sections)) {
        if (data.description[key]) {
          const contentMd = data.description[key][requestedLang] || data.description[key]['en'] || '';
          header.push({
            title: requestedLang === 'de-DE' ? titles : key.charAt(0).toUpperCase() + key.slice(1),
            content: await simpleParse(contentMd)
          });
        }
      }
    } else {
      description = data.description;
      if (data.header) header.push(...data.header);
    }

    // Resolve banner path
    let banner = data.banner;
    if (banner && !banner.startsWith('http')) {
      banner = `/content/${resolved.ecosystem.id}/layers/${resolved.layer.id}/pathways/${banner}`;
    }

    res.json({
      data: {
        id: pathwayGid,
        type: 'pathways',
        attributes: { 
          ...data, 
          gid: pathwayGid,
          title,
          description,
          header,
          banner // Add the resolved banner
        },
        relationships: {
          projects: {
            data: data.projects?.map(p => {
              const pSlug = typeof p === 'string' ? p : p.slug;
              return { 
                id: p.gid || `${prefix}:PROJ:${pSlug}`, 
                type: 'projects' 
              };
            }) || []
          }
        }
      }
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load pathway' });
  }
});

app.get('/api/v1/:lang/pathways/:pathwayId/projects', async (req, res) => {
  const requestedLang = req.params.lang === 'de' ? 'de-DE' : req.params.lang;
  const resolved = resolvePathwayLayer(ecosystems, req.params.pathwayId);
  if (!resolved) return res.status(404).json({ error: 'Pathway not found' });

  try {
    const content = await readFileAsync(resolved.path, 'utf-8');
    const data = yaml.load(content);
    
    const pathwayTitle = typeof data.title === 'object' 
      ? (data.title[requestedLang] || data.title['en'] || '')
      : (data.title || '');

    const projectsData = [];
    for (const p of data.projects || []) {
      const slug = typeof p === 'string' ? p : p.slug;
      try {
        const project = await getProjectData(`${resolved.ecosystem.id}:${slug}`, req.params.lang);
        projectsData.push({
          ...project.data,
          attributes: {
            ...project.data.attributes,
            pathways: [{ slug: resolved.slug, title: pathwayTitle }]
          }
        });
      } catch { /* skip */ }
    }
    res.json({ data: projectsData });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to load pathway projects' });
  }
});

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
});
