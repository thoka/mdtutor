/**
 * Meta-Test: Fetch and store tutorial repository + API output
 * 
 * Purpose: Create local snapshots for iterative testing
 * - Clone tutorial repository
 * - Fetch API responses (Projects, Progress, Pathways)
 * - Store all data for comparison tests
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';
import { load } from 'js-yaml';

// Default paths (relative to workspace root)
const DEFAULT_PROJECTS_DIR = 'content/RPL/layers/official/projects';
const DEFAULT_SNAPSHOTS_DIR = 'test/snapshots';
const API_BASE = 'https://learning-admin.raspberrypi.org/api/v1';

// Configurable languages
const LANGUAGES = ['en', 'de-DE'];

/**
 * Extract unique ingredients (transclusions) from project API data
 */
function extractIngredientsFromProject(projectData) {
  const ingredients = new Set();
  if (!projectData?.data?.attributes?.content?.steps) return ingredients;
  projectData.data.attributes.content.steps.forEach(step => {
    if (step.ingredients && Array.isArray(step.ingredients)) {
      step.ingredients.forEach(ing => ingredients.add(ing));
    }
  });
  return ingredients;
}

/**
 * Extract unique quiz paths from project API data
 */
function extractQuizzesFromProject(projectData) {
  const quizzes = new Set();
  if (!projectData?.data?.attributes?.content?.steps) return quizzes;
  projectData.data.attributes.content.steps.forEach(step => {
    if (step.knowledgeQuiz && typeof step.knowledgeQuiz === 'string') {
      quizzes.add(step.knowledgeQuiz);
    }
  });
  return Array.from(quizzes);
}

/**
 * Fetch tutorial from GitHub
 */
async function cloneRepository(tutorialSlug, options = {}) {
  const gitBase = options.gitBase || 'https://github.com/raspberrypilearning';
  const repoUrl = `${gitBase}/${tutorialSlug}.git`;
  const projectsDir = options.projectsDir || DEFAULT_PROJECTS_DIR;
  const targetDir = join(projectsDir, tutorialSlug, 'repo');
  
  console.log(`Cloning ${tutorialSlug}...`);
  
  if (existsSync(targetDir)) {
    console.log('  → Already exists, skipping');
    return targetDir;
  }
  
  mkdirSync(targetDir, { recursive: true });
  
  try {
    execSync(`git clone --depth 1 ${repoUrl} ${targetDir}`, {
      stdio: 'inherit'
    });
    return targetDir;
  } catch (error) {
    console.error(`  ✗ Failed to clone: ${error.message}`);
    return null;
  }
}

/**
 * Extract pathway information from projects API response
 */
function extractPathwaysFromProject(projectData) {
  if (!projectData || !projectData.included) return [];
  const pathways = projectData.included
    .filter(item => item.type === 'pathways')
    .map(pathway => ({
      slug: pathway.attributes.slug,
      id: pathway.id,
      title: pathway.attributes.title
    }));
  return pathways;
}

/**
 * Fetch Projects API response
 */
async function fetchProjectApi(tutorialSlug, language = 'en', options = {}) {
  const snapshotsDir = options.snapshotsDir || DEFAULT_SNAPSHOTS_DIR;
  const apiUrl = `${API_BASE}/${language}/projects/${tutorialSlug}`;
  const targetFile = join(snapshotsDir, `${tutorialSlug}-api-project-${language}.json`);
  
  console.log(`  Fetching Projects API (${language})...`);
  
  if (existsSync(targetFile)) {
    console.log('    → Already exists, reading from cache');
    try {
      const data = JSON.parse(readFileSync(targetFile, 'utf-8'));
      return { file: targetFile, data };
    } catch (error) {
      console.warn(`    ⚠ Cache read failed, re-fetching: ${error.message}`);
    }
  }
  
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    const data = await response.json();
    mkdirSync(snapshotsDir, { recursive: true });
    writeFileSync(targetFile, JSON.stringify(data, null, 2));
    console.log('    ✓ Saved');
    return { file: targetFile, data };
  } catch (error) {
    console.error(`    ✗ Failed: ${error.message}`);
    return null;
  }
}

async function fetchProgressApi(tutorialSlug, language = 'en', options = {}) {
  const snapshotsDir = options.snapshotsDir || DEFAULT_SNAPSHOTS_DIR;
  const apiUrl = `${API_BASE}/${language}/progress/${tutorialSlug}`;
  const targetFile = join(snapshotsDir, `${tutorialSlug}-api-progress-${language}.json`);
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    writeFileSync(targetFile, JSON.stringify(data, null, 2));
    return targetFile;
  } catch {
    return null;
  }
}

async function fetchPathwayApi(pathwaySlug, tutorialSlug, language = 'en', options = {}) {
  const snapshotsDir = options.snapshotsDir || DEFAULT_SNAPSHOTS_DIR;
  const apiUrl = `${API_BASE}/${language}/pathways/${pathwaySlug}/projects`;
  const targetFile = join(snapshotsDir, `${tutorialSlug}-api-pathway-${pathwaySlug}-${language}.json`);
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    writeFileSync(targetFile, JSON.stringify(data, null, 2));
    return { slug: pathwaySlug, file: targetFile, available: true };
  } catch {
    return { slug: pathwaySlug, file: null, available: false };
  }
}

async function fetchQuizApi(quizPath, tutorialSlug, language = 'en', options = {}) {
  const snapshotsDir = options.snapshotsDir || DEFAULT_SNAPSHOTS_DIR;
  const apiUrl = `${API_BASE}/${language}/projects/${tutorialSlug}/quizzes/${quizPath}`;
  const targetFile = join(snapshotsDir, `${tutorialSlug}-api-quiz-${quizPath}-${language}.json`);
  try {
    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    writeFileSync(targetFile, JSON.stringify(data, null, 2));
    return { path: quizPath, file: targetFile, available: true, data };
  } catch {
    return { path: quizPath, file: null, available: false, data: null };
  }
}

function createSnapshotMetadata(tutorialSlug, repoPath, apiPaths, pathwayInfo, options = {}) {
  const snapshotsDir = options.snapshotsDir || DEFAULT_SNAPSHOTS_DIR;
  const metadata = {
    tutorial: tutorialSlug,
    timestamp: new Date().toISOString(),
    languages: LANGUAGES,
    paths: { repository: repoPath, api: apiPaths },
    pathways: pathwayInfo
  };
  const metaFile = join(snapshotsDir, `${tutorialSlug}-snapshot-meta.json`);
  writeFileSync(metaFile, JSON.stringify(metadata, null, 2));
  return metaFile;
}

/**
 * Main meta-test runner
 */
async function runMetaTest() {
  console.log('=== Meta-Test: Creating Tutorial Snapshots ===\n');
  
  let tutorials = [];
  const SYNC_FILE = 'content/RPL/config/sync.yaml';
  const OLD_PATHWAYS_FILE = 'content/RPL/layers/official/pathways/rpl-pathways.yaml';

  if (existsSync(SYNC_FILE)) {
    console.log(`Reading tutorials from ${SYNC_FILE}...`);
    const syncData = load(readFileSync(SYNC_FILE, 'utf8'));
    if (syncData.sync?.pathways?.official) {
      tutorials = syncData.sync.pathways.official;
    }
  } else if (existsSync(OLD_PATHWAYS_FILE)) {
    console.log(`Reading tutorials from ${OLD_PATHWAYS_FILE}...`);
    const pathwaysData = load(readFileSync(OLD_PATHWAYS_FILE, 'utf8'));
    tutorials = Object.values(pathwaysData).flat();
  } else {
    console.error('Error: No source for tutorials found (sync.yaml or rpl-pathways.yaml).');
    return;
  }
  
  console.log(`Found ${tutorials.length} tutorials to process.`);

  mkdirSync(DEFAULT_SNAPSHOTS_DIR, { recursive: true });
  mkdirSync(DEFAULT_PROJECTS_DIR, { recursive: true });
  
  const results = [];
  for (const tutorial of tutorials) {
    console.log(`\n--- Processing: ${tutorial} ---`);
    const repoPath = await cloneRepository(tutorial);
    if (!repoPath) continue;

    const apiPaths = {};
    const pathwayInfo = [];
    let hasRequiredData = false;

    for (const language of LANGUAGES) {
      const projectResult = await fetchProjectApi(tutorial, language);
      if (!projectResult) continue;
      hasRequiredData = true;

      const pathways = extractPathwaysFromProject(projectResult.data);
      const quizzes = extractQuizzesFromProject(projectResult.data);
      const progressPath = await fetchProgressApi(tutorial, language);
      
      const pathwayFiles = {};
      for (const p of pathways) {
        const res = await fetchPathwayApi(p.slug, tutorial, language);
        if (res.file) pathwayFiles[p.slug] = res.file;
        if (language === LANGUAGES[0]) {
          pathwayInfo.push({ slug: p.slug, id: p.id, title: p.title, available: res.available });
        }
      }

      const quizFiles = {};
      for (const q of quizzes) {
        const res = await fetchQuizApi(q, tutorial, language);
        if (res.file) quizFiles[q] = res.file;
      }

      apiPaths[language] = { project: projectResult.file, progress: progressPath, pathways: pathwayFiles, quizzes: quizFiles };
    }

    if (hasRequiredData) {
      const metaPath = createSnapshotMetadata(tutorial, repoPath, apiPaths, pathwayInfo);
      results.push({ tutorial, success: true, paths: { repo: repoPath, meta: metaPath } });
    }
  }

  const summaryFile = join(DEFAULT_SNAPSHOTS_DIR, 'summary.json');
  writeFileSync(summaryFile, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));
  console.log(`\nSummary written to: ${summaryFile}`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runMetaTest().catch(console.error);
}

export { cloneRepository, fetchProjectApi };
