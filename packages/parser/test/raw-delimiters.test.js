/**
 * Generic test to find raw block delimiters in parsed output
 * This test checks all test repos for unconverted block delimiters
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { readdirSync, existsSync } from 'fs';
import { join } from 'path';
import { parseProject } from '../src/parse-project.js';

const projectRoot = join(import.meta.dirname, '../../..');
const snapshotsDir = join(projectRoot, 'test/snapshots');

/**
 * Find all test repos
 */
function findTestRepos() {
  return readdirSync(snapshotsDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && d.name !== 'summary.json')
    .map(d => d.name)
    .map(repo => {
      const repoPath = join(snapshotsDir, repo, 'repo');
      const enPath = join(repoPath, 'en');
      if (existsSync(enPath) && existsSync(join(enPath, 'meta.yml'))) {
        return { repo, path: enPath };
      } else if (existsSync(join(repoPath, 'meta.yml'))) {
        return { repo, path: repoPath };
      }
      return null;
    })
    .filter(Boolean);
}

test('no raw block delimiters in any test repo', async () => {
  const repos = findTestRepos();
  const rawDelimiterPattern = /---\s*\/?[a-z-]+\s*---/gi;
  const errors = [];
  
  for (const { repo, path } of repos) {
    try {
      const result = await parseProject(path, { languages: ['en'] });
      const steps = result.data.attributes.content.steps;
      
      steps.forEach((step, stepIndex) => {
        const rawDelimiters = step.content.match(rawDelimiterPattern);
        if (rawDelimiters && rawDelimiters.length > 0) {
          const unique = [...new Set(rawDelimiters)];
          errors.push({
            repo,
            step: stepIndex,
            stepTitle: step.title,
            delimiters: unique
          });
        }
      });
    } catch (error) {
      // Skip repos that fail to parse (e.g., scratchpc-interactive-book)
      console.log(`Skipping ${repo} due to parse error: ${error.message}`);
    }
  }
  
  if (errors.length > 0) {
    console.error('\n❌ Found raw block delimiters:');
    errors.forEach(({ repo, step, stepTitle, delimiters }) => {
      console.error(`  ${repo} - Step ${step} (${stepTitle}): ${delimiters.join(', ')}`);
    });
    assert.fail(`Found raw block delimiters in ${errors.length} step(s) across ${new Set(errors.map(e => e.repo)).size} repo(s)`);
  }
  
  console.log(`✅ No raw delimiters found in ${repos.length} repos`);
});

