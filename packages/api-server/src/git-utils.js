/**
 * Git utilities for commit ID management
 */

import { execSync } from 'child_process';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../../');

/**
 * Get current git commit hash
 * @returns {string|null} Commit hash or null if not in git repo
 */
export function getCurrentCommitHash() {
  if (process.env.COMMIT_HASH) {
    return process.env.COMMIT_HASH;
  }
  try {
    const hash = execSync('git rev-parse HEAD', {
      cwd: projectRoot,
      encoding: 'utf-8',
      stdio: ['ignore', 'pipe', 'ignore']
    }).trim();
    return hash;
  } catch (error) {
    // Not a git repo or git not available
    return null;
  }
}

/**
 * Get short commit hash (first 7 characters)
 * @returns {string|null} Short commit hash or null
 */
export function getCurrentCommitHashShort() {
  const hash = getCurrentCommitHash();
  return hash ? hash.substring(0, 7) : null;
}

/**
 * Check if working directory is clean (no uncommitted changes)
 * @returns {boolean} True if working directory is clean
 */
export function isWorkingDirectoryClean() {
  try {
    execSync('git diff-index --quiet HEAD --', {
      cwd: projectRoot,
      stdio: 'ignore'
    });
    return true;
  } catch (error) {
    return false;
  }
}

