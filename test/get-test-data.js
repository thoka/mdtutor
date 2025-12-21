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
const LANGUAGES = ['en'];

// Test tutorials to fetch
const TEST_TUTORIALS = [
  'silly-eyes',
  'scratchpc-interactive-book',
  'getting-started-with-minecraft-pi'
];

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
 * Detect pathway slugs from tutorial markdown files
 * Parses step_8.md and step_9.md for pathway references
 * Returns array of unique pathway slugs
 */
function detectPathwaySlugs(tutorialSlug) {
  const pathways = new Set();
  const repoDir = join(SNAPSHOTS_DIR, tutorialSlug, 'repo', 'en');
  const stepFiles = ['step_8.md', 'step_9.md'];
  
  // Regex to match: projects.raspberrypi.org/*/pathways/{pathway-slug}
  const pathwayRegex = /projects\.raspberrypi\.org\/[^/]+\/pathways\/([a-z0-9-]+)/g;
  
  for (const stepFile of stepFiles) {
    const filePath = join(repoDir, stepFile);
    
    if (!existsSync(filePath)) {
      continue;
    }
    
    try {
      const content = readFileSync(filePath, 'utf-8');
      let match;
      
      while ((match = pathwayRegex.exec(content)) !== null) {
        pathways.add(match[1]);
      }
    } catch (error) {
      console.warn(`  ⚠ Could not read ${stepFile}: ${error.message}`);
    }
  }
  
  const result = Array.from(pathways);
  
  if (result.length > 0) {
    console.log(`  ✓ Detected pathways: ${result.join(', ')}`);
  } else {
    console.log(`  ℹ No pathways detected`);
  }
  
  return result;
}

/**
 * Fetch Projects API response
 */
async function fetchProjectApi(tutorialSlug, language = 'en') {
  const apiUrl = `${API_BASE}/${language}/projects/${tutorialSlug}`;
  const targetFile = join(SNAPSHOTS_DIR, tutorialSlug, `api-project-${language}.json`);
  
  console.log(`  Fetching Projects API (${language})...`);
  
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
    
    // Step 2: Detect pathways from markdown
    const pathwaySlugs = detectPathwaySlugs(tutorial);
    
    // Step 3: Fetch API data for all languages
    const apiPaths = {};
    const pathwayInfo = [];
    let hasRequiredData = false;
    
    for (const language of LANGUAGES) {
      console.log(`\nFetching API data for language: ${language}`);
      
      // Required: Projects API
      const projectPath = await fetchProjectApi(tutorial, language);
      if (!projectPath) {
        console.error(`  ✗ Projects API failed (required) - skipping ${language}`);
        continue;
      }
      
      hasRequiredData = true;
      
      // Optional: Progress API
      const progressPath = await fetchProgressApi(tutorial, language);
      
      // Optional: Pathways API (for each detected pathway)
      const pathways = {};
      for (const pathwaySlug of pathwaySlugs) {
        const pathwayResult = await fetchPathwayApi(pathwaySlug, tutorial, language);
        if (pathwayResult.file) {
          pathways[pathwaySlug] = pathwayResult.file;
        }
        
        // Add to pathwayInfo only once (from first language)
        if (language === LANGUAGES[0]) {
          pathwayInfo.push({
            slug: pathwaySlug,
            detected_from: 'en/step_8.md or en/step_9.md',
            available: pathwayResult.available
          });
        }
      }
      
      // Store paths for this language
      apiPaths[language] = {
        project: projectPath,
        progress: progressPath,
        pathways: pathways
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
      pathways: pathwaySlugs
    });
    
    console.log(`\n✓ Snapshot complete for ${tutorial}`);
  }
  
  // Summary
  console.log('\n=== Summary ===');
  const successful = results.filter(r => r.success).length;
  console.log(`${successful}/${TEST_TUTORIALS.length} tutorials fetched successfully`);
  
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

export { runMetaTest, cloneRepository, fetchProjectApi, fetchProgressApi, fetchPathwayApi, detectPathwaySlugs };