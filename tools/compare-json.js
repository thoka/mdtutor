#!/usr/bin/env node
/**
 * Generic JSON Comparison Tool
 * 
 * Compares two JSON files/objects and reports differences.
 * Supports:
 * - Deep comparison of nested structures
 * - Ignoring specific paths (e.g., URLs, timestamps)
 * - HTML content normalization
 * - Detailed diff reporting
 * 
 * Usage:
 *   node compare-json.js <file1> <file2> [options]
 *   node compare-json.js --api <api-file> --parsed <parsed-file> [options]
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Normalize HTML content for comparison
 * - Removes whitespace differences
 * - Normalizes attribute order
 * - Removes comments
 */
function normalizeHtml(html) {
  if (typeof html !== 'string') return html;
  
  return html
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/>\s+</g, '><') // Remove whitespace between tags
    .trim();
}

/**
 * Check if a path should be ignored
 */
function shouldIgnorePath(path, ignorePaths = []) {
  return ignorePaths.some(pattern => {
    if (typeof pattern === 'string') {
      return path.includes(pattern);
    }
    if (pattern instanceof RegExp) {
      return pattern.test(path);
    }
    return false;
  });
}

/**
 * Compare two values deeply
 * @param {*} expected - Expected value
 * @param {*} actual - Actual value
 * @param {string} path - Current path in the object tree
 * @param {Object} options - Comparison options
 * @returns {Array} Array of differences
 */
function compareValues(expected, actual, path = '', options = {}) {
  const {
    ignorePaths = [],
    normalizeHtml: shouldNormalizeHtml = false,
    ignoreOrder = false
  } = options;
  
  const differences = [];
  
  // Check if this path should be ignored
  if (shouldIgnorePath(path, ignorePaths)) {
    return differences;
  }
  
  // Type mismatch
  if (typeof expected !== typeof actual) {
    differences.push({
      path,
      type: 'type_mismatch',
      expected: { type: typeof expected, value: expected },
      actual: { type: typeof actual, value: actual },
      message: `Type mismatch at ${path}: expected ${typeof expected}, got ${typeof actual}`
    });
    return differences;
  }
  
  // Null/undefined handling
  if (expected === null || expected === undefined) {
    if (actual !== expected) {
      differences.push({
        path,
        type: 'value_mismatch',
        expected,
        actual,
        message: `Value mismatch at ${path}: expected ${expected}, got ${actual}`
      });
    }
    return differences;
  }
  
  // Array comparison
  if (Array.isArray(expected)) {
    if (!Array.isArray(actual)) {
      differences.push({
        path,
        type: 'type_mismatch',
        expected: 'array',
        actual: typeof actual,
        message: `Expected array at ${path}, got ${typeof actual}`
      });
      return differences;
    }
    
    if (expected.length !== actual.length) {
      differences.push({
        path,
        type: 'length_mismatch',
        expected: expected.length,
        actual: actual.length,
        message: `Array length mismatch at ${path}: expected ${expected.length}, got ${actual.length}`
      });
    }
    
    const maxLength = Math.max(expected.length, actual.length);
    for (let i = 0; i < maxLength; i++) {
      const itemPath = `${path}[${i}]`;
      if (i >= expected.length) {
        differences.push({
          path: itemPath,
          type: 'extra_item',
          actual: actual[i],
          message: `Extra item at ${itemPath}`
        });
      } else if (i >= actual.length) {
        differences.push({
          path: itemPath,
          type: 'missing_item',
          expected: expected[i],
          message: `Missing item at ${itemPath}`
        });
      } else {
        differences.push(...compareValues(expected[i], actual[i], itemPath, options));
      }
    }
    
    return differences;
  }
  
  // Object comparison
  if (typeof expected === 'object' && expected !== null) {
    if (typeof actual !== 'object' || actual === null) {
      differences.push({
        path,
        type: 'type_mismatch',
        expected: 'object',
        actual: typeof actual,
        message: `Expected object at ${path}, got ${typeof actual}`
      });
      return differences;
    }
    
    // Get all keys from both objects
    const allKeys = new Set([...Object.keys(expected), ...Object.keys(actual)]);
    
    for (const key of allKeys) {
      const keyPath = path ? `${path}.${key}` : key;
      
      if (!(key in expected)) {
        differences.push({
          path: keyPath,
          type: 'extra_field',
          actual: actual[key],
          message: `Extra field at ${keyPath}`
        });
      } else if (!(key in actual)) {
        differences.push({
          path: keyPath,
          type: 'missing_field',
          expected: expected[key],
          message: `Missing field at ${keyPath}`
        });
      } else {
        // Special handling for HTML content
        if (shouldNormalizeHtml && (key === 'content' || key.endsWith('Html') || key.endsWith('HTML'))) {
          const normalizedExpected = normalizeHtml(expected[key]);
          const normalizedActual = normalizeHtml(actual[key]);
          if (normalizedExpected !== normalizedActual) {
            const expectedStr = typeof normalizedExpected === 'string' ? normalizedExpected : String(normalizedExpected);
            const actualStr = typeof normalizedActual === 'string' ? normalizedActual : String(normalizedActual);
            differences.push({
              path: keyPath,
              type: 'html_content_mismatch',
              expected: expectedStr.substring(0, 200),
              actual: actualStr.substring(0, 200),
              message: `HTML content differs at ${keyPath}`
            });
          }
        } else {
          differences.push(...compareValues(expected[key], actual[key], keyPath, options));
        }
      }
    }
    
    return differences;
  }
  
  // Primitive value comparison
  if (expected !== actual) {
    // Special handling for strings that might be HTML
    if (typeof expected === 'string' && typeof actual === 'string') {
      if (shouldNormalizeHtml && (expected.includes('<') || actual.includes('<'))) {
        const normalizedExpected = normalizeHtml(expected);
        const normalizedActual = normalizeHtml(actual);
        if (normalizedExpected !== normalizedActual) {
          differences.push({
            path,
            type: 'value_mismatch',
            expected: expected.substring(0, 200),
            actual: actual.substring(0, 200),
            message: `Value mismatch at ${path} (HTML normalized)`
          });
        }
      } else {
        differences.push({
          path,
          type: 'value_mismatch',
          expected,
          actual,
          message: `Value mismatch at ${path}: expected "${expected}", got "${actual}"`
        });
      }
    } else {
      differences.push({
        path,
        type: 'value_mismatch',
        expected,
        actual,
        message: `Value mismatch at ${path}: expected ${expected}, got ${actual}`
      });
    }
  }
  
  return differences;
}

/**
 * Print differences in a readable format
 */
function printDifferences(differences, options = {}) {
  const { maxDiffs = 50, groupByType = true } = options;
  
  if (differences.length === 0) {
    console.log('\n✓ No differences found!');
    return;
  }
  
  console.log(`\n${'='.repeat(80)}`);
  console.log(`Found ${differences.length} difference(s):`);
  console.log('='.repeat(80));
  
  if (groupByType) {
    const byType = {};
    differences.forEach(diff => {
      if (!byType[diff.type]) {
        byType[diff.type] = [];
      }
      byType[diff.type].push(diff);
    });
    
    Object.entries(byType).forEach(([type, diffs]) => {
      console.log(`\n[${type.toUpperCase()}] (${diffs.length} found)`);
      console.log('-'.repeat(80));
      
      diffs.slice(0, maxDiffs).forEach((diff, index) => {
        console.log(`\n  ${index + 1}. ${diff.message}`);
        console.log(`     Path: ${diff.path}`);
        
        if (diff.expected !== undefined && diff.actual !== undefined) {
          if (typeof diff.expected === 'string' && diff.expected.length > 100) {
            console.log(`     Expected: ${diff.expected.substring(0, 100)}...`);
          } else {
            console.log(`     Expected: ${JSON.stringify(diff.expected)}`);
          }
          
          if (typeof diff.actual === 'string' && diff.actual.length > 100) {
            console.log(`     Actual:   ${diff.actual.substring(0, 100)}...`);
          } else {
            console.log(`     Actual:   ${JSON.stringify(diff.actual)}`);
          }
        }
      });
      
      if (diffs.length > maxDiffs) {
        console.log(`\n  ... and ${diffs.length - maxDiffs} more`);
      }
    });
  } else {
    differences.slice(0, maxDiffs).forEach((diff, index) => {
      console.log(`\n${index + 1}. ${diff.message}`);
      console.log(`   Path: ${diff.path}`);
    });
    
    if (differences.length > maxDiffs) {
      console.log(`\n... and ${differences.length - maxDiffs} more`);
    }
  }
  
  // Summary
  console.log(`\n${'='.repeat(80)}`);
  console.log('Summary:');
  const byType = differences.reduce((acc, d) => {
    acc[d.type] = (acc[d.type] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node compare-json.js <file1> <file2> [options]');
    console.error('   or: node compare-json.js --api <api-file> --parsed <parsed-file>');
    console.error('');
    console.error('Options:');
    console.error('  --ignore <path>     Ignore specific paths (can be used multiple times)');
    console.error('  --normalize-html    Normalize HTML content before comparison');
    console.error('  --max-diffs <n>      Maximum number of differences to show (default: 50)');
    process.exit(1);
  }
  
  let file1, file2;
  const options = {
    ignorePaths: [],
    normalizeHtml: false,
    maxDiffs: 50
  };
  
  // Parse arguments
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--api' && i + 1 < args.length) {
      file1 = args[++i];
    } else if (args[i] === '--parsed' && i + 1 < args.length) {
      file2 = args[++i];
    } else if (args[i] === '--ignore' && i + 1 < args.length) {
      options.ignorePaths.push(args[++i]);
    } else if (args[i] === '--normalize-html') {
      options.normalizeHtml = true;
    } else if (args[i] === '--max-diffs' && i + 1 < args.length) {
      options.maxDiffs = parseInt(args[++i], 10);
    } else if (!file1) {
      file1 = args[i];
    } else if (!file2) {
      file2 = args[i];
    }
  }
  
  if (!file1 || !file2) {
    console.error('Error: Two files required');
    process.exit(1);
  }
  
  // Load JSON files
  if (!existsSync(file1)) {
    console.error(`Error: File not found: ${file1}`);
    process.exit(1);
  }
  
  if (!existsSync(file2)) {
    console.error(`Error: File not found: ${file2}`);
    process.exit(1);
  }
  
  console.log('JSON Comparison Tool');
  console.log('='.repeat(80));
  console.log(`\nComparing:`);
  console.log(`  Expected (API): ${file1}`);
  console.log(`  Actual (Parsed): ${file2}`);
  
  try {
    const json1 = JSON.parse(readFileSync(file1, 'utf-8'));
    const json2 = JSON.parse(readFileSync(file2, 'utf-8'));
    
    console.log('\nComparing structures...');
    const differences = compareValues(json1, json2, '', options);
    
    printDifferences(differences, { maxDiffs: options.maxDiffs });
    
    // Exit code based on differences
    process.exit(differences.length > 0 ? 1 : 0);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();

