/**
 * Mock API Server
 * 
 * Serves tutorial data from local snapshots
 * Mimics Raspberry Pi Learning API structure
 */

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { readFile, existsSync } from 'fs';
import { readFile as readFileAsync } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseProject } from '../../parser/src/parse-project.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS_DIR = join(__dirname, '../../../test/snapshots');

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 3001;

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
    const data = await readFile(summaryPath, 'utf-8');
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

app.listen(PORT, () => {
  console.log(`API Server running on http://localhost:${PORT}`);
  console.log(`Serving snapshots from: ${SNAPSHOTS_DIR}`);
});
