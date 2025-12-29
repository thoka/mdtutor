#!/usr/bin/env node
/**
 * HTML Structure Comparison Tool
 * 
 * AGENT USE: Identifies structural HTML differences between reference and local.
 * 
 * USAGE:
 *   node tools/compare-structure.js <ref-url> <local-url> [options]
 * 
 * OPTIONS:
 *   --help     Show this help
 *   --json     Output results as JSON for machine parsing
 * 
 * EXAMPLES:
 *   node tools/compare-structure.js https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1 http://localhost:5173/#/cats-vs-dogs/1
 *   node tools/compare-structure.js https://... http://localhost... --json
 */

import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';

/**
 * Show help message
 */
function showHelp() {
  console.log(`
HTML Structure Comparison Tool
------------------------------
Compares the HTML structure between the reference RPL site and local renderer.
Filters out content, scripts, styles, and Svelte-specific classes.

Usage:
  node tools/compare-structure.js <reference-url> <local-url> [options]

Options:
  --help     Show this help
  --json     Output results as JSON for machine parsing

Examples:
  node tools/compare-structure.js https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1 http://localhost:5173/#/cats-vs-dogs/1
  node tools/compare-structure.js https://... http://localhost... --json
  `);
}

/**
 * Normalize HTML by removing content and Svelte classes
 */
function normalizeHTML(html) {
  const root = parse(html);
  
  // Remove script and style tags
  root.querySelectorAll('script, style').forEach(el => el.remove());
  
  // Remove all text content (keep structure only)
  function removeTextNodes(node) {
    if (!node) return;
    
    // Remove text nodes
    if (node.nodeType === 3) {
      node.remove();
      return;
    }
    
    // Remove Svelte scoped classes (s-*)
    if (node.getAttribute) {
      const classes = node.getAttribute('class');
      if (classes) {
        const filteredClasses = classes
          .split(' ')
          .filter(c => c.trim() && !c.startsWith('s-'))
          .join(' ');
        
        if (filteredClasses) {
          node.setAttribute('class', filteredClasses);
        } else {
          node.removeAttribute('class');
        }
      }
    }
    
    // Remove attributes that are content-related
    const contentAttrs = ['alt', 'title', 'aria-label', 'data-testid', 'href', 'src'];
    contentAttrs.forEach(attr => {
      if (node.getAttribute(attr)) {
        // Keep structure but remove content
        if (attr === 'href' || attr === 'src') {
          node.setAttribute(attr, '');
        } else {
          node.removeAttribute(attr);
        }
      }
    });
    
    // Recursively process children
    const children = [...(node.childNodes || [])];
    children.forEach(child => removeTextNodes(child));
  }
  
  // Process the entire tree
  removeTextNodes(root);
  
  return root.toString();
}

/**
 * Extract hierarchical structure from normalized HTML
 */
function extractHierarchicalStructure(html) {
  const root = parse(html);
  const structure = [];
  
  // Find root container (#root or body)
  let startNode = root.querySelector('#root') || root.querySelector('body');
  if (!startNode) {
    startNode = root;
  }
  
  function traverse(node, depth = 0, parentPath = []) {
    if (!node) return;
    
    // Skip text nodes, comments, script/style
    if (node.nodeType === 3 || node.nodeType === 8) return;
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    
    const tagName = (node.tagName || '').toLowerCase();
    if (!tagName) return;
    
    // Skip cookie dialogs and other non-content
    const classes = (node.getAttribute('class') || '').toLowerCase();
    if (classes.includes('cookie') || classes.includes('cookiebot') || classes.includes('cybot')) {
      return;
    }
    
    const classList = (node.getAttribute('class') || '').split(' ').filter(c => c.trim());
    const id = node.getAttribute('id') || '';
    
    // Build hierarchical path
    const currentPath = [...parentPath, {
      tag: tagName,
      id: id,
      classes: classList,
      index: 0 // Will be set during comparison
    }];
    
    const nodeInfo = {
      tag: tagName,
      classes: classList,
      id: id,
      depth: depth,
      path: currentPath,
      selector: tagName + (id ? `#${id}` : '') + (classList.length > 0 ? `.${classList.join('.')}` : ''),
      children: []
    };
    
    structure.push(nodeInfo);
    
    // Traverse children
    const children = node.childNodes || [];
    children.forEach((child) => {
      const childInfo = traverse(child, depth + 1, currentPath);
      if (childInfo) {
        nodeInfo.children.push(childInfo);
      }
    });
    
    return nodeInfo;
  }
  
  if (startNode) {
    traverse(startNode, 0, []);
  }
  
  return structure;
}

/**
 * Compare two hierarchical structures
 */
function compareStructures(refStructure, localStructure) {
  const differences = [];
  
  function compareNodes(refNode, localNode, path = []) {
    if (!refNode && !localNode) return;
    
    const currentPath = [...path, refNode?.tag || localNode?.tag || 'unknown'];
    
    if (!refNode && localNode) {
      differences.push({
        type: 'extra',
        path: currentPath,
        depth: localNode.depth,
        local: {
          tag: localNode.tag,
          classes: localNode.classes,
          id: localNode.id,
          selector: localNode.selector
        },
        message: `Extra element: <${localNode.tag}${localNode.id ? `#${localNode.id}` : ''}${localNode.classes.length > 0 ? `.${localNode.classes.join('.')}` : ''}>`
      });
      return;
    }
    
    if (refNode && !localNode) {
      differences.push({
        type: 'missing',
        path: currentPath,
        depth: refNode.depth,
        ref: {
          tag: refNode.tag,
          classes: refNode.classes,
          id: refNode.id,
          selector: refNode.selector
        },
        message: `Missing element: <${refNode.tag}${refNode.id ? `#${refNode.id}` : ''}${refNode.classes.length > 0 ? `.${refNode.classes.join('.')}` : ''}>`
      });
      return;
    }
    
    // Compare tags
    if (refNode.tag !== localNode.tag) {
      differences.push({
        type: 'tag_mismatch',
        path: currentPath,
        depth: refNode.depth,
        ref: { tag: refNode.tag, classes: refNode.classes, id: refNode.id },
        local: { tag: localNode.tag, classes: localNode.classes, id: localNode.id },
        message: `Tag mismatch: expected <${refNode.tag}>, found <${localNode.tag}>`
      });
    }
    
    // Compare classes
    const refClasses = new Set(refNode.classes);
    const localClasses = new Set(localNode.classes);
    const missingClasses = [...refClasses].filter(c => !localClasses.has(c));
    const extraClasses = [...localClasses].filter(c => !refClasses.has(c));
    
    if (missingClasses.length > 0 || extraClasses.length > 0) {
      differences.push({
        type: 'class_mismatch',
        path: currentPath,
        depth: refNode.depth,
        tag: refNode.tag,
        missingClasses,
        extraClasses,
        refClasses: refNode.classes,
        localClasses: localNode.classes,
        message: `Class mismatch on <${refNode.tag}>: missing [${missingClasses.join(', ')}], extra [${extraClasses.join(', ')}]`
      });
    }
    
    // Compare IDs
    if (refNode.id !== localNode.id) {
      differences.push({
        type: 'id_mismatch',
        path: currentPath,
        depth: refNode.depth,
        ref: { id: refNode.id },
        local: { id: localNode.id },
        message: `ID mismatch: expected #${refNode.id || '(none)'}, found #${localNode.id || '(none)'}`
      });
    }
    
    // Compare children (match by position and tag)
    const maxChildren = Math.max(refNode.children.length, localNode.children.length);
    for (let i = 0; i < maxChildren; i++) {
      const refChild = refNode.children[i];
      const localChild = localNode.children[i];
      compareNodes(refChild, localChild, currentPath);
    }
  }
  
  // Start comparison from root
  if (refStructure.length > 0 && localStructure.length > 0) {
    compareNodes(refStructure[0], localStructure[0], []);
  }
  
  return differences;
}

async function fetchHTML(url) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for main content
    try {
      await page.waitForSelector('#root, .c-project, main, [role="main"]', { timeout: 5000 });
    } catch (e) {
      // Continue
    }
    
    // Wait for dynamic content
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const html = await page.content();
    await browser.close();
    return html;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

function printDifferences(differences) {
  console.log(`\n${'='.repeat(80)}`);
  console.log('Structural Differences Found:');
  console.log('='.repeat(80));
  
  if (differences.length === 0) {
    console.log('✓ No structural differences found!');
    return;
  }
  
  // Group by type
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
    
    diffs.slice(0, 20).forEach((diff, index) => {
      console.log(`\n  ${index + 1}. ${diff.message}`);
      console.log(`     Path: ${diff.path.map(p => typeof p === 'object' ? p.tag : p).join(' > ')}`);
      console.log(`     Depth: ${diff.depth}`);
      
      if (diff.type === 'tag_mismatch') {
        console.log(`     Expected: <${diff.ref.tag}>`);
        console.log(`     Found: <${diff.local.tag}>`);
      } else if (diff.type === 'class_mismatch') {
        if (diff.missingClasses.length > 0) {
          console.log(`     Missing classes: ${diff.missingClasses.join(', ')}`);
        }
        if (diff.extraClasses.length > 0) {
          console.log(`     Extra classes: ${diff.extraClasses.join(', ')}`);
        }
      } else if (diff.type === 'missing') {
        console.log(`     Missing: ${diff.ref.selector}`);
      } else if (diff.type === 'extra') {
        console.log(`     Extra: ${diff.local.selector}`);
      }
    });
    
    if (diffs.length > 20) {
      console.log(`\n  ... and ${diffs.length - 20} more`);
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const isHelp = args.includes('--help');

  if (isHelp) {
    showHelp();
    process.exit(0);
  }
  
  const urls = args.filter(arg => !arg.startsWith('--'));
  
  if (urls.length < 2) {
    if (isJson) {
      console.log(JSON.stringify({ error: 'Missing URLs', usage: 'node compare-structure.js <ref-url> <local-url>' }));
    } else {
      showHelp();
    }
    process.exit(1);
  }
  
  const [refUrl, localUrl] = urls;
  
  if (!isJson) {
    console.log('HTML Structure Comparison Tool');
    console.log('='.repeat(80));
    console.log('\nStep 1: Fetching rendered HTML...');
    console.log(`  Reference: ${refUrl}`);
    console.log(`  Local: ${localUrl}`);
  }
  
  try {
    const [refHTML, localHTML] = await Promise.all([
      fetchHTML(refUrl),
      fetchHTML(localUrl)
    ]);
    
    if (!isJson) {
      console.log(`  ✓ Reference: ${refHTML.length} bytes`);
      console.log(`  ✓ Local: ${localHTML.length} bytes`);
      console.log('\nStep 2: Normalizing HTML (removing content, Svelte classes)...');
    }

    const refNormalized = normalizeHTML(refHTML);
    const localNormalized = normalizeHTML(localHTML);
    
    if (!isJson) {
      console.log(`  ✓ Normalized reference: ${refNormalized.length} bytes`);
      console.log(`  ✓ Normalized local: ${localNormalized.length} bytes`);
      console.log('\nStep 3: Extracting hierarchical structure...');
    }

    const refStructure = extractHierarchicalStructure(refNormalized);
    const localStructure = extractHierarchicalStructure(localNormalized);
    
    if (!isJson) {
      console.log(`  ✓ Reference: ${refStructure.length} nodes`);
      console.log(`  ✓ Local: ${localStructure.length} nodes`);
      console.log('\nStep 4: Comparing structures...');
    }

    const differences = compareStructures(refStructure, localStructure);
    
    if (isJson) {
      console.log(JSON.stringify({
        refUrl,
        localUrl,
        differences,
        summary: {
          total: differences.length,
          byType: differences.reduce((acc, d) => {
            acc[d.type] = (acc[d.type] || 0) + 1;
            return acc;
          }, {})
        }
      }, null, 2));
    } else {
      printDifferences(differences);
      
      // Summary
      console.log(`\n${'='.repeat(80)}`);
      console.log('Summary:');
      console.log(`  Total differences: ${differences.length}`);
      const byType = differences.reduce((acc, d) => {
        acc[d.type] = (acc[d.type] || 0) + 1;
        return acc;
      }, {});
      Object.entries(byType).forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    }
    
    // Exit with error code if differences found
    if (differences.length > 0) {
      process.exit(1);
    }
    
  } catch (error) {
    if (isJson) {
      console.log(JSON.stringify({ error: error.message, stack: error.stack }));
    } else {
      console.error('Error:', error.message);
      if (error.stack) {
        console.error(error.stack);
      }
    }
    process.exit(1);
  }
}

main();
