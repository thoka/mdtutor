/**
 * Mock API Server
 * 
 * Serves tutorial data from local snapshots
 * Mimics Raspberry Pi Learning API structure
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync, readdirSync } from 'fs';
import { readFile as readFileAsync, readdir as readdirAsync } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import yaml from 'js-yaml';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load root .env if it exists
dotenv.config({ path: join(__dirname, '../../../.env') });

import { parseProject } from '../../parser/src/parse-project.js';
import { getCurrentCommitHash, getCurrentCommitHashShort } from './git-utils.js';

const CONTENT_DIR = join(__dirname, '../../../content');

/**
 * Get all content providers and their metadata
 * @returns {Promise<Object>} Map of provider name to metadata
 */
async function getProviders() {
  const providers = {};
  if (!existsSync(CONTENT_DIR)) return providers;

  const dirs = await readdirAsync(CONTENT_DIR, { withFileTypes: true });
  for (const dir of dirs) {
    if (dir.isDirectory()) {
      const metaPath = join(CONTENT_DIR, dir.name, 'meta.yml');
      if (existsSync(metaPath)) {
        const metaContent = await readFileAsync(metaPath, 'utf-8');
        providers[dir.name] = yaml.load(metaContent);
      }
    }
  }
  return providers;
}

/**
 * Resolve a namespaced slug to a file path
 * @param {string} namespacedSlug e.g. "rpl:silly-eyes"
 * @returns {Promise<{path: string, provider: string, slug: string, namespace: string}|null>}
 */
async function resolveSlug(namespacedSlug) {
  const providers = await getProviders();
  
  // If no namespace, try to find it in any provider (fallback for legacy)
  if (!namespacedSlug.includes(':')) {
    for (const [name, meta] of Object.entries(providers)) {
      const projectPath = join(CONTENT_DIR, name, 'projects', namespacedSlug);
      if (existsSync(projectPath)) {
        return {
          path: projectPath,
          provider: name,
          slug: namespacedSlug,
          namespace: meta.namespace
        };
      }
    }
    return null;
  }

  const [namespace, slug] = namespacedSlug.split(':');
  for (const [name, meta] of Object.entries(providers)) {
    if (meta.namespace === namespace) {
      const projectPath = join(CONTENT_DIR, name, 'projects', slug);
      if (existsSync(projectPath)) {
        return {
          path: projectPath,
          provider: name,
          slug: slug,
          namespace: namespace
        };
      }
    }
  }
  return null;
}

const app = express();
// Port MUST be set in .env file - no default fallback
const PORT = process.env.API_PORT;
if (!PORT) {
  console.error('ERROR: API_PORT or PORT must be set in .env file');
  process.exit(1);
}

app.use(cors());
app.use(express.json());

/**
 * Helper to find project data with language fallback
 * @param {string} namespacedSlug 
 * @param {string} requestedLang 
 * @returns {Promise<Object|null>}
 */
async function getProjectData(namespacedSlug, requestedLang) {
  const resolved = await resolveSlug(namespacedSlug);
  if (!resolved) return null;

  const { path: projectPath, slug, namespace } = resolved;

  const languages = requestedLang === 'de' || requestedLang === 'de-DE' 
    ? ['de-DE', 'en'] 
    : [requestedLang, 'de-DE', 'en'];
  
  // Unique languages only
  const uniqueLangs = [...new Set(languages)];

  // First try to parse from repository (for quiz support)
  for (const lang of uniqueLangs) {
    try {
      const repoPath = join(projectPath, 'repo', lang);
      if (existsSync(repoPath) && existsSync(join(repoPath, 'meta.yml'))) {
        const parsed = await parseProject(repoPath, { 
          languages: [lang],
          includeQuizData: true
        });
        if (parsed && parsed.data) {
          // Prepend namespace to ID
          parsed.data.id = `${namespace}:${slug}`;

          // Convert relative image URLs to absolute URLs pointing to Vite's static file server
          // Images are served from /content/:provider/projects/:slug/repo/:lang/images/...
          const imageUrlPattern = /src="(images\/[^"]+)"/g;
          
          // Replace image URLs in all step content
          if (parsed.data.attributes?.content?.steps) {
            parsed.data.attributes.content.steps.forEach(step => {
              if (step.content) {
                step.content = step.content.replace(imageUrlPattern, (match, imagePath) => {
                  const absoluteUrl = `/content/${resolved.provider}/projects/${slug}/repo/${lang}/${imagePath}`;
                  return `src="${absoluteUrl}"`;
                });
              }
            });
          }
          
          // Transform heroImage URL from relative to absolute
          if (parsed.data.attributes?.content?.heroImage) {
            const heroImagePath = parsed.data.attributes.content.heroImage;
            // If it's a relative path (starts with "images/"), convert to absolute
            if (heroImagePath.startsWith('images/')) {
              parsed.data.attributes.content.heroImage = `/content/${resolved.provider}/projects/${slug}/repo/${lang}/${heroImagePath}`;
            }
          }
          
          return parsed;
        }
      }
    } catch (error) {
      // Continue to try static JSON files
      console.warn(`Failed to parse ${slug} from repo (${lang}):`, error.message);
    }
  }

  // legacy Fallback to static JSON files
  for (const lang of uniqueLangs) {
    try {
      const filePath = join(projectPath, `api-project-${lang}.json`);
      const data = await readFileAsync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      
      // Prepend namespace to ID
      parsed.data.id = `${namespace}:${slug}`;
      
      return parsed;
    } catch {
      // Continue to next language
    }
  }

  throw new Error(`Failed to parse project ${namespacedSlug} from repository or snapshots for languages: ${uniqueLangs.join(', ')}`);
}

// Health check endpoint with port and commit information
app.get('/api/health', (req, res) => {
  const commitHash = getCurrentCommitHash();
  const commitHashShort = getCurrentCommitHashShort();
  
  res.json({
    status: 'ok',
    port: PORT,
    apiPort: process.env.API_PORT || null,
    usingParser: true, // Indicates this server uses parseProject
    commitHash: commitHash,
    commitHashShort: commitHashShort,
    timestamp: new Date().toISOString()
  });
});

// GET /api/projects/:slug
// Returns cached API project data
app.get('/api/projects/:slug', async (req, res) => {
  const { slug } = req.params;
  const lang = req.query.lang || 'de-DE'; // Default to German as requested
  
  const projectData = await getProjectData(slug, lang);
  if (projectData) {
    res.json(projectData);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

// GET /api/projects
// Lists available projects
app.get('/api/projects', async (req, res) => {
  try {
    const lang = req.query.lang || 'de-DE';
    const providers = await getProviders();
    const allProjects = [];

    for (const [providerName, meta] of Object.entries(providers)) {
      const projectsDir = join(CONTENT_DIR, providerName, 'projects');
      if (!existsSync(projectsDir)) continue;

      const projectDirs = await readdirAsync(projectsDir, { withFileTypes: true });
      
      for (const dir of projectDirs) {
        if (dir.isDirectory()) {
          const slug = dir.name;
          const namespacedSlug = `${meta.namespace}:${slug}`;
          
          // Try to get requested language data first for the overview
          try {
            const projectData = await getProjectData(namespacedSlug, lang);
            
            let heroImage = projectData?.data?.attributes?.content?.heroImage || null;
            let description = projectData?.data?.attributes?.content?.description || null;
            let title = projectData?.data?.attributes?.content?.title || 
                        slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

            allProjects.push({
              slug: namespacedSlug,
              title,
              description,
              languages: ['de-DE', 'en'], // Default for now, could be improved
              heroImage
            });
          } catch (e) {
            console.warn(`Failed to load project ${namespacedSlug}:`, e.message);
          }
        }
      }
    }
    
    res.json({ projects: allProjects });
  } catch (error) {
    console.error('Error listing projects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  const commitHash = getCurrentCommitHashShort();
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log(`Serving content from: ${CONTENT_DIR}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  if (commitHash) {
    console.log(`Commit: ${commitHash}`);
  }
});
