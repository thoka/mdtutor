/**
 * Meta-Test: Fetch and store tutorial repository + API output
 * 
 * Purpose: Create local snapshots for iterative testing
 * - Clone tutorial repository
 * - Fetch API responses (Projects, Progress, Pathways)
 * - Store all data for comparison tests
 * 
 * Requirements: Node.js >= 18 (for native fetch API)
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

const SNAPSHOTS_DIR = 'test/snapshots';
const API_BASE = 'https://learning-admin.raspberrypi.org/api/v1';

// Configurable languages (extend with 'de' etc. as needed)
const LANGUAGES = ['en', 'de-DE'];

// Test tutorials to fetch
const TEST_TUTORIALS = [
  'silly-eyes',
  'scratchpc-interactive-book',
  'getting-started-with-minecraft-pi',
  'cats-vs-dogs'
];

/**
 * Extract unique ingredients (transclusions) from project API data
 */
function extractIngredientsFromProject(projectData) {
  const ingredients = new Set();
  
  if (!projectData?.data?.attributes?.content?.steps) {
    return ingredients;
  }
  
  projectData.data.attributes.content.steps.forEach(step => {
    if (step.ingredients && Array.isArray(step.ingredients)) {
      step.ingredients.forEach(ing => ingredients.add(ing));
    }
  });
  
  return ingredients;
}

/**
 * Fetch tutorial from GitHub
 */
async function cloneRepository(tutorialSlug) {
  const repoUrl = `https://github.com/raspberrypilearning/${tutorialSlug}.git`;
  const targetDir = join(SNAPSHOTS_DIR, tutorialSlug, 'repo');
  
  console.log(`Cloning ${tutorialSlug}...`);
  
  if (existsSync(targetDir)) {
    console.log(`  → Already exists, skipping`);
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
 * Pathways are in the 'included' array with type='pathways'
 * Returns array of pathway objects {slug, id, title}
 */
function extractPathwaysFromProject(projectData) {
  if (!projectData || !projectData.included) {
    return [];
  }
  
  const pathways = projectData.included
    .filter(item => item.type === 'pathways')
    .map(pathway => ({
      slug: pathway.attributes.slug,
      id: pathway.id,
      title: pathway.attributes.title
    }));
  
  if (pathways.length > 0) {
    console.log(`  ✓ Found pathways: ${pathways.map(p => p.slug).join(', ')}`);
  } else {
    console.log(`  ℹ No pathways in project`);
  }
  
  return pathways;
}

/**
 * Fetch Projects API response
 * Returns both the file path and the parsed data
 */
async function fetchProjectApi(tutorialSlug, language = 'en') {
  const apiUrl = `${API_BASE}/${language}/projects/${tutorialSlug}`;
  const targetFile = join(SNAPSHOTS_DIR, tutorialSlug, `api-project-${language}.json`);
  
  console.log(`  Fetching Projects API (${language})...`);
  
  // Check if already exists
  if (existsSync(targetFile)) {
    console.log(`    → Already exists, reading from cache`);
    try {
      const data = JSON.parse(readFileSync(targetFile, 'utf-8'));
      return { file: targetFile, data };
    } catch (error) {
      console.warn(`    ⚠ Cache read failed, re-fetching: ${error.message}`);
    }
  }
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    mkdirSync(join(SNAPSHOTS_DIR, tutorialSlug), { recursive: true });
    writeFileSync(targetFile, JSON.stringify(data, null, 2));
    
    console.log(`    ✓ Saved`);
    return { file: targetFile, data };
  } catch (error) {
    console.error(`    ✗ Failed: ${error.message}`);
    return null;
  }
}

/**
 * Fetch Progress API response (optional endpoint)
 */
async function fetchProgressApi(tutorialSlug, language = 'en') {
  const apiUrl = `${API_BASE}/${language}/progress/${tutorialSlug}`;
  const targetFile = join(SNAPSHOTS_DIR, tutorialSlug, `api-progress-${language}.json`);
  
  console.log(`  Fetching Progress API (${language})...`);
  
  if (existsSync(targetFile)) {
    console.log(`    → Already exists, skipping`);
    return targetFile;
  }
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    mkdirSync(join(SNAPSHOTS_DIR, tutorialSlug), { recursive: true });
    writeFileSync(targetFile, JSON.stringify(data, null, 2));
    
    console.log(`    ✓ Saved`);
    return targetFile;
  } catch (error) {
    console.warn(`    ⚠ Failed (optional): ${error.message}`);
    return null;
  }
}

/**
 * Fetch Pathways API response (optional endpoint)
 */
async function fetchPathwayApi(pathwaySlug, tutorialSlug, language = 'en') {
  const apiUrl = `${API_BASE}/${language}/pathways/${pathwaySlug}/projects`;
  const targetFile = join(SNAPSHOTS_DIR, tutorialSlug, `api-pathway-${pathwaySlug}-${language}.json`);
  
  console.log(`  Fetching Pathway API: ${pathwaySlug} (${language})...`);
  
  if (existsSync(targetFile)) {
    console.log(`    → Already exists, skipping`);
    return { slug: pathwaySlug, file: targetFile, available: true };
  }
  
  try {
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    mkdirSync(join(SNAPSHOTS_DIR, tutorialSlug), { recursive: true });
    writeFileSync(targetFile, JSON.stringify(data, null, 2));
    
    console.log(`    ✓ Saved`);
    return { slug: pathwaySlug, file: targetFile, available: true };
  } catch (error) {
    console.warn(`    ⚠ Failed (optional): ${error.message}`);
    return { slug: pathwaySlug, file: null, available: false };
  }
}

/**
 * Create snapshot metadata with all API paths and pathway info
 */
function createSnapshotMetadata(tutorialSlug, repoPath, apiPaths, pathwayInfo) {
  const metadata = {
    tutorial: tutorialSlug,
    timestamp: new Date().toISOString(),
    languages: LANGUAGES,
    paths: {
      repository: repoPath,
      api: apiPaths
    },
    pathways: pathwayInfo
  };
  
  const metaFile = join(SNAPSHOTS_DIR, tutorialSlug, 'snapshot-meta.json');
  writeFileSync(metaFile, JSON.stringify(metadata, null, 2));
  
  return metaFile;
}

/**
 * Main meta-test runner
 */
async function runMetaTest() {
  console.log('=== Meta-Test: Creating Tutorial Snapshots ===\n');
  
  mkdirSync(SNAPSHOTS_DIR, { recursive: true });
  
  const results = [];
  
  for (const tutorial of TEST_TUTORIALS) {
    console.log(`\n--- Processing: ${tutorial} ---`);
    
    // Step 1: Clone repository
    const repoPath = await cloneRepository(tutorial);
    if (!repoPath) {
      results.push({
        tutorial,
        success: false,
        error: 'Failed to clone repository'
      });
      console.log(`✗ Snapshot failed for ${tutorial}`);
      continue;
    }
    
    // Step 2: Fetch project data and extract pathways
    let pathways = [];
    
    // Step 3: Fetch API data for all languages
    const apiPaths = {};
    const pathwayInfo = [];
    let hasRequiredData = false;
    
    for (const language of LANGUAGES) {
      console.log(`\nFetching API data for language: ${language}`);
      
      // Required: Projects API
      const projectResult = await fetchProjectApi(tutorial, language);
      if (!projectResult) {
        console.error(`  ✗ Projects API failed (required) - skipping ${language}`);
        continue;
      }
      
      hasRequiredData = true;
      
      // Extract pathways from project data (only once from first language)
      if (language === LANGUAGES[0]) {
        pathways = extractPathwaysFromProject(projectResult.data);
      }
      
      // Optional: Progress API
      const progressPath = await fetchProgressApi(tutorial, language);
      
      // Optional: Pathways API (for each pathway from project data)
      const pathwayFiles = {};
      for (const pathway of pathways) {
        const pathwayResult = await fetchPathwayApi(pathway.slug, tutorial, language);
        if (pathwayResult.file) {
          pathwayFiles[pathway.slug] = pathwayResult.file;
        }
        
        // Add to pathwayInfo only once (from first language)
        if (language === LANGUAGES[0]) {
          pathwayInfo.push({
            slug: pathway.slug,
            id: pathway.id,
            title: pathway.title,
            source: 'projects API included field',
            available: pathwayResult.available
          });
        }
      }
      
      // Store paths for this language
      apiPaths[language] = {
        project: projectResult.file,
        progress: progressPath,
        pathways: pathwayFiles
      };
    }
    
    if (!hasRequiredData) {
      results.push({
        tutorial,
        success: false,
        error: 'Failed to fetch required Projects API'
      });
      console.log(`✗ Snapshot failed for ${tutorial}`);
      continue;
    }
    
    // Step 4: Create metadata file
    const metaPath = createSnapshotMetadata(tutorial, repoPath, apiPaths, pathwayInfo);
    
    results.push({
      tutorial,
      success: true,
      paths: { repo: repoPath, meta: metaPath },
      languages: LANGUAGES,
      pathways: pathways.map(p => p.slug)
    });
    
    console.log(`\n✓ Snapshot complete for ${tutorial}`);
  }
  
  // Collect all unique ingredients from fetched tutorials
  console.log('\n\n=== Collecting Transclusion Requirements ===\n');
  const allIngredients = new Set();
  
  for (const result of results.filter(r => r.success && TEST_TUTORIALS.includes(r.tutorial))) {
    const apiPath = join(SNAPSHOTS_DIR, result.tutorial, 'api-project-en.json');
    if (existsSync(apiPath)) {
      const projectData = JSON.parse(readFileSync(apiPath, 'utf-8'));
      const ingredients = extractIngredientsFromProject(projectData);
      ingredients.forEach(ing => allIngredients.add(ing));
    }
  }
  
  console.log(`Found ${allIngredients.size} unique transclusion projects needed`);
  if (allIngredients.size > 0) {
    console.log('Projects:', Array.from(allIngredients).sort().join(', '));
  }
  
  // Fetch transclusion projects
  if (allIngredients.size > 0) {
    console.log('\n=== Fetching Transclusion Projects ===\n');
    
    for (const project of Array.from(allIngredients).sort()) {
      console.log(`\n>>> Processing: ${project}`);
      
      try {
        // Clone repository
        const repoPath = await cloneRepository(project);
        
        // Fetch API data (only project endpoint needed)
        const apiPaths = {};
        for (const lang of LANGUAGES) {
          const projectData = await fetchProjectApi(project, lang);
          apiPaths[lang] = { projects: projectData };
        }
        
        // Create simple metadata
        const metaPath = createSnapshotMetadata(project, repoPath, apiPaths, null);
        
        results.push({
          tutorial: project,
          success: true,
          paths: { repo: repoPath, meta: metaPath },
          languages: LANGUAGES,
          pathways: []
        });
        
        console.log(`✓ Transclusion project fetched: ${project}`);
      } catch (error) {
        console.error(`✗ Failed to fetch ${project}:`, error.message);
        results.push({
          tutorial: project,
          success: false,
          error: error.message
        });
      }
    }
  }
  
  // Summary
  console.log('\n=== Summary ===');
  const successful = results.filter(r => r.success).length;
  const total = TEST_TUTORIALS.length + allIngredients.size;
  console.log(`${successful}/${total} projects fetched successfully`);
  console.log(`  - Main tutorials: ${results.filter(r => TEST_TUTORIALS.includes(r.tutorial) && r.success).length}/${TEST_TUTORIALS.length}`);
  console.log(`  - Transclusions: ${results.filter(r => allIngredients.has(r.tutorial) && r.success).length}/${allIngredients.size}`);
  
  // Write summary file
  const summaryFile = join(SNAPSHOTS_DIR, 'summary.json');
  writeFileSync(summaryFile, JSON.stringify({
    timestamp: new Date().toISOString(),
    languages: LANGUAGES,
    results
  }, null, 2));
  
  console.log(`\nSummary written to: ${summaryFile}`);
  
  return results;
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMetaTest()
    .then(() => process.exit(0))
    .catch(error => {
      console.error('Meta-test failed:', error);
      process.exit(1);
    });
}

export { runMetaTest, cloneRepository, fetchProjectApi, fetchProgressApi, fetchPathwayApi, extractPathwaysFromProject };