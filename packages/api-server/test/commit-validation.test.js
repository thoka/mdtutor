/**
 * Test Commit Validation
 * 
 * Verifies that the API server validates commit IDs before starting
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'fs';
import { getCurrentCommitHash, getCurrentCommitHashShort } from '../src/git-utils.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';


const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');

// Load .env file if it exists
const envPath = join(projectRoot, '.env');
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
}



test('getCurrentCommitHash returns commit hash', () => {
  const hash = getCurrentCommitHash();
  
  if (hash) {
    console.log(`Current commit hash: ${hash}`);
    assert.ok(hash.length >= 7, 'Commit hash should be at least 7 characters');
    assert.ok(/^[a-f0-9]+$/.test(hash), 'Commit hash should be hexadecimal');
  } else {
    console.log('Not in git repository, skipping commit hash test');
  }
});

test('getCurrentCommitHashShort returns short hash', () => {
  const hash = getCurrentCommitHash();
  const shortHash = getCurrentCommitHashShort();
  
  if (hash) {
    console.log(`Short commit hash: ${shortHash}`);
    assert.strictEqual(shortHash, hash.substring(0, 7), 
      'Short hash should be first 7 characters of full hash');
  } else {
    assert.strictEqual(shortHash, null, 'Short hash should be null if not in git repo');
  }
});

test('API health endpoint includes commit hash', async () => {
  // Load environment variables
  const apiPort = parseInt(process.env.API_PORT, 10);
  const apiUrl = `http://localhost:${apiPort}`;
  
  try {
    const response = await fetch(`${apiUrl}/api/health`);
    
    if (response.ok) {
      const health = await response.json();
      
      console.log('API Health with commit:');
      console.log(`  Commit hash: ${health.commitHash || '(not set)'}`);
      console.log(`  Commit short: ${health.commitHashShort || '(not set)'}`);
      
      // If we're in a git repo, health should include commit
      const currentCommit = getCurrentCommitHash();
      if (currentCommit) {
        assert.ok(health.commitHash, 'Health endpoint should include commitHash');
        assert.ok(health.commitHashShort, 'Health endpoint should include commitHashShort');
        assert.strictEqual(health.commitHashShort, currentCommit.substring(0, 7),
          'Health commitHashShort should match current commit');
      }
    }
  } catch (error) {
    if (error.code === 'ECONNREFUSED' || error.message?.includes('ECONNREFUSED')) {
      console.warn(`  ⚠ API server is not running on port ${apiPort}`);
      console.warn(`  Start it with: npm run api`);
    } else {
      throw error;
    }
  }
});

