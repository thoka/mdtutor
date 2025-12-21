/**
 * Mock API Server
 * 
 * Serves tutorial data from local snapshots
 * Mimics Raspberry Pi Learning API structure
 */

import express from 'express';
import cors from 'cors';
import { readFile } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SNAPSHOTS_DIR = join(__dirname, '../../../test/snapshots');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// GET /api/projects/:slug
// Returns cached API project data
app.get('/api/projects/:slug', async (req, res) => {
  const { slug } = req.params;
  const lang = req.query.lang || 'en';
  
  try {
    const filePath = join(SNAPSHOTS_DIR, slug, `api-project-${lang}.json`);
    const data = await readFile(filePath, 'utf-8');
    res.json(JSON.parse(data));
  } catch (error) {
    if (error.code === 'ENOENT') {
      res.status(404).json({ error: 'Project not found' });
    } else {
      console.error('Error reading project:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// GET /api/projects
// Lists available projects
app.get('/api/projects', async (req, res) => {
  try {
    const summaryPath = join(SNAPSHOTS_DIR, 'summary.json');
    const data = await readFile(summaryPath, 'utf-8');
    const summary = JSON.parse(data);
    
    const projects = summary.projects.map(p => ({
      slug: p.slug,
      title: p.title,
      languages: p.languages
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
