/**
 * Mock API Server
 * 
 * Serves tutorial data from local snapshots
 * Mimics Raspberry Pi Learning API structure
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { existsSync } from 'fs';
import { readFile as readFileAsync } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load root .env if it exists
dotenv.config({ path: join(__dirname, '../../../.env') });

import { parseProject } from '../../parser/src/parse-project.js';
import { getCurrentCommitHash, getCurrentCommitHashShort } from './git-utils.js';

const SNAPSHOTS_DIR = join(__dirname, '../../../test/snapshots');

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 3201;

// Check for --force flag
const FORCE_FLAG = process.argv.includes('--force');

app.use(cors());
app.use(express.json());

/**
 * Helper to find project data with language fallback
 * @param {string} slug 
 * @param {string} requestedLang 
 * @returns {Promise<Object|null>}
 */
async function getProjectData(slug, requestedLang) {
  const languages = requestedLang === 'de' || requestedLang === 'de-DE' 
    ? ['de-DE', 'en'] 
    : [requestedLang, 'de-DE', 'en'];
  
  // Unique languages only
  const uniqueLangs = [...new Set(languages)];

  // First try to parse from repository (for quiz support)
  for (const lang of uniqueLangs) {
    try {
      const repoPath = join(SNAPSHOTS_DIR, slug, 'repo', lang);
      if (existsSync(repoPath) && existsSync(join(repoPath, 'meta.yml'))) {
        const parsed = await parseProject(repoPath, { languages: [lang] });
        if (parsed && parsed.data) {
          // Convert relative image URLs to absolute URLs pointing to Vite's static file server
          // Images are served from /snapshots/:slug/repo/:lang/images/...
          const imageUrlPattern = /src="(images\/[^"]+)"/g;
          
          // Replace image URLs in all step content
          if (parsed.data.attributes?.content?.steps) {
            parsed.data.attributes.content.steps.forEach(step => {
              if (step.content) {
                step.content = step.content.replace(imageUrlPattern, (match, imagePath) => {
                  const absoluteUrl = `/snapshots/${slug}/repo/${lang}/${imagePath}`;
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
              parsed.data.attributes.content.heroImage = `/snapshots/${slug}/repo/${lang}/${heroImagePath}`;
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

  // Fallback to static JSON files
  for (const lang of uniqueLangs) {
    try {
      const filePath = join(SNAPSHOTS_DIR, slug, `api-project-${lang}.json`);
      const data = await readFileAsync(filePath, 'utf-8');
      return JSON.parse(data);
    } catch {
      // Continue to next language
    }
  }
  return null;
}

// Health check endpoint with port and commit information
app.get('/api/health', (req, res) => {
  const commitHash = getCurrentCommitHash();
  const commitHashShort = getCurrentCommitHashShort();
  
  res.json({
    status: 'ok',
    port: PORT,
    apiPort: process.env.API_PORT || null,
    portEnv: process.env.PORT || null,
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
    const summaryPath = join(SNAPSHOTS_DIR, 'summary.json');
    const data = await readFileAsync(summaryPath, 'utf-8');
    const summary = JSON.parse(data);
    
    // summary.json uses "results" array with "tutorial" as slug
    const projects = await Promise.all((summary.results || []).map(async r => {
      const slug = r.tutorial;
      
      // Try to get German data first for the overview
      const projectData = await getProjectData(slug, 'de-DE');
      
      let heroImage = projectData?.data?.attributes?.content?.heroImage || null;
      let description = projectData?.data?.attributes?.content?.description || null;
      let title = projectData?.data?.attributes?.content?.title || 
                  slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');

      return {
        slug,
        title,
        description,
        languages: r.languages,
        heroImage
      };
    }));
    
    res.json({ projects });
  } catch (error) {
    console.error('Error reading summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Check if another API server is running on this port with different commit
 * @returns {Promise<boolean>} True if commit matches or no server running
 */
async function validateCommitBeforeStart() {
  if (FORCE_FLAG) {
    console.log('⚠ --force flag set, skipping commit validation');
    return true;
  }
  
  const currentCommit = getCurrentCommitHash();
  if (!currentCommit) {
    // Not in git repo, allow start
    return true;
  }
  
  try {
    const response = await fetch(`http://localhost:${PORT}/api/health`);
    if (response.ok) {
      const health = await response.json();
      const runningCommit = health.commitHash;
      
      if (runningCommit && runningCommit !== currentCommit) {
        console.error('\n❌ Commit mismatch detected!');
        console.error(`  Running API commit: ${health.commitHashShort || runningCommit.substring(0, 7)}`);
        console.error(`  Current commit:     ${currentCommit.substring(0, 7)}`);
        console.error(`\n  The API server is running with a different commit.`);
        console.error(`  Use --force to start anyway: npm run api -- --force`);
        return false;
      }
      
      console.log(`✓ Commit matches: ${currentCommit.substring(0, 7)}`);
    }
  } catch (error) {
    // No server running on this port, that's fine
    if (error.code === 'ECONNREFUSED') {
      return true;
    }
    // Other errors, allow start but warn
    console.warn('⚠ Could not check running API server:', error.message);
  }
  
  return true;
}

// Validate commit before starting
validateCommitBeforeStart().then(canStart => {
  if (!canStart) {
    process.exit(1);
  }
  
  app.listen(PORT, () => {
    const commitHash = getCurrentCommitHashShort();
    console.log(`API Server running on http://localhost:${PORT}`);
    console.log(`Serving snapshots from: ${SNAPSHOTS_DIR}`);
    console.log(`Health check: http://localhost:${PORT}/api/health`);
    if (commitHash) {
      console.log(`Commit: ${commitHash}`);
    }
  });
}).catch(error => {
  console.error('Failed to validate commit:', error);
  process.exit(1);
});
