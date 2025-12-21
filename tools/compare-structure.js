#!/usr/bin/env node
/**
 * HTML Structure Comparison Tool
 * 
 * Compares the HTML structure between the reference RPL site and local renderer
 * to identify differences in div structure and class names.
 */

import https from 'https';
import http from 'http';
import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';

// Extract structure focusing on project-related elements
function extractStructure(html, source) {
  const root = parse(html);
  const structure = [];
  
  // Find the main project container
  const projectContainer = root.querySelector('.c-project') || root.querySelector('body');
  
  function traverse(node, depth = 0, path = []) {
    if (!node) return;
    
    // Skip text nodes, comments, and script/style tags
    if (node.nodeType === 3 || node.nodeType === 8) return;
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    
    const tagName = (node.tagName || '').toLowerCase();
    if (!tagName) return;
    
    const classes = (node.getAttribute('class') || '').split(' ').filter(c => c.trim());
    const id = node.getAttribute('id') || '';
    
    const nodeInfo = {
      tag: tagName,
      classes: classes,
      id: id,
      depth: depth,
      path: [...path, tagName],
      selector: tagName + (id ? `#${id}` : '') + (classes.length > 0 ? `.${classes.join('.')}` : '')
    };
    
    structure.push(nodeInfo);
    
    // Traverse children
    const children = node.childNodes || [];
    children.forEach((child) => {
      traverse(child, depth + 1, [...path, tagName]);
    });
  }
  
  if (projectContainer) {
    traverse(projectContainer, 0, ['.c-project']);
  } else {
    // Fallback: traverse body
    const body = root.querySelector('body');
    if (body) {
      traverse(body, 0, ['body']);
    }
  }
  
  return structure;
}

async function fetchHTML(url, usePuppeteer = false) {
  if (usePuppeteer) {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for main content to load
      try {
        await page.waitForSelector('.c-project, main, article, [role="main"]', { timeout: 5000 });
      } catch (e) {
        // Continue even if selector not found
      }
      
      // Wait a bit more for dynamic content
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const html = await page.content();
      await browser.close();
      return html;
    } catch (error) {
      await browser.close();
      throw error;
    }
  }
  
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        resolve(data);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

function compareStructures(refStructure, localStructure) {
  const differences = [];
  const maxDepth = Math.max(
    ...refStructure.map(s => s.depth),
    ...localStructure.map(s => s.depth)
  );
  
  // Compare by depth and position
  for (let depth = 0; depth <= maxDepth; depth++) {
    const refAtDepth = refStructure.filter(s => s.depth === depth);
    const localAtDepth = localStructure.filter(s => s.depth === depth);
    
    // Compare structure at each depth
    const maxCount = Math.max(refAtDepth.length, localAtDepth.length);
    
    for (let i = 0; i < maxCount; i++) {
      const ref = refAtDepth[i];
      const local = localAtDepth[i];
      
      if (!ref && local) {
        differences.push({
          type: 'extra',
          depth,
          position: i,
          local: {
            tag: local.tag,
            classes: local.classes,
            id: local.id,
            path: local.path
          }
        });
      } else if (ref && !local) {
        differences.push({
          type: 'missing',
          depth,
          position: i,
          ref: {
            tag: ref.tag,
            classes: ref.classes,
            id: ref.id,
            path: ref.path
          }
        });
      } else if (ref && local) {
        // Compare tags
        if (ref.tag !== local.tag) {
          differences.push({
            type: 'tag_mismatch',
            depth,
            position: i,
            ref: { tag: ref.tag, classes: ref.classes, id: ref.id },
            local: { tag: local.tag, classes: local.classes, id: local.id },
            path: ref.path
          });
        }
        
        // Compare classes
        const refClasses = new Set(ref.classes);
        const localClasses = new Set(local.classes);
        const missingClasses = [...refClasses].filter(c => !localClasses.has(c));
        const extraClasses = [...localClasses].filter(c => !refClasses.has(c));
        
        if (missingClasses.length > 0 || extraClasses.length > 0) {
          differences.push({
            type: 'class_mismatch',
            depth,
            position: i,
            tag: ref.tag,
            missingClasses,
            extraClasses,
            refClasses: ref.classes,
            localClasses: local.classes,
            path: ref.path
          });
        }
      }
    }
  }
  
  return differences;
}

function printStructure(structure, label, maxDepth = 10) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`${label} Structure (showing first ${maxDepth} levels):`);
  console.log('='.repeat(60));
  
  const filtered = structure.filter(s => s.depth <= maxDepth);
  filtered.forEach(node => {
    const indent = '  '.repeat(node.depth);
    const classStr = node.classes.length > 0 ? `.${node.classes.join('.')}` : '';
    const idStr = node.id ? `#${node.id}` : '';
    console.log(`${indent}<${node.tag}${classStr}${idStr}>`);
  });
  
  if (structure.length > filtered.length) {
    console.log(`  ... (${structure.length - filtered.length} more nodes at deeper levels)`);
  }
}

function printDifferences(differences) {
  console.log(`\n${'='.repeat(60)}`);
  console.log('Differences Found:');
  console.log('='.repeat(60));
  
  if (differences.length === 0) {
    console.log('✓ No differences found!');
    return;
  }
  
  differences.forEach((diff, index) => {
    console.log(`\n[${index + 1}] ${diff.type.toUpperCase()}`);
    console.log(`   Depth: ${diff.depth}, Position: ${diff.position}`);
    
    if (diff.path) {
      console.log(`   Path: ${diff.path.join(' > ')}`);
    }
    
    if (diff.type === 'missing') {
      console.log(`   Missing: <${diff.ref.tag} class="${diff.ref.classes.join(' ')}">`);
    } else if (diff.type === 'extra') {
      console.log(`   Extra: <${diff.local.tag} class="${diff.local.classes.join(' ')}">`);
    } else if (diff.type === 'tag_mismatch') {
      console.log(`   Expected: <${diff.ref.tag}>`);
      console.log(`   Found: <${diff.local.tag}>`);
    } else if (diff.type === 'class_mismatch') {
      console.log(`   Tag: <${diff.tag}>`);
      if (diff.missingClasses.length > 0) {
        console.log(`   Missing classes: ${diff.missingClasses.join(', ')}`);
      }
      if (diff.extraClasses.length > 0) {
        console.log(`   Extra classes: ${diff.extraClasses.join(', ')}`);
      }
    }
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 2) {
    console.error('Usage: node compare-structure.js <reference-url> <local-url>');
    console.error('Example: node compare-structure.js https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1 http://localhost:5274/#/cats-vs-dogs/1');
    process.exit(1);
  }
  
  const [refUrl, localUrl] = args;
  
  console.log('Fetching reference HTML...');
  console.log(`  URL: ${refUrl}`);
  console.log('  (Using Puppeteer for client-side rendering)');
  
  try {
    // Use puppeteer for both - reference site also uses client-side rendering
    const refHTML = await fetchHTML(refUrl, true);
    console.log(`  ✓ Fetched ${refHTML.length} bytes`);
    
    console.log('\nFetching local HTML...');
    console.log(`  URL: ${localUrl}`);
    console.log('  (Using Puppeteer for client-side rendering)');
    
    const localHTML = await fetchHTML(localUrl, true);
    console.log(`  ✓ Fetched ${localHTML.length} bytes`);
    
    console.log('\nExtracting structures...');
    const refStructure = extractStructure(refHTML, 'reference');
    const localStructure = extractStructure(localHTML, 'local');
    
    console.log(`  Reference: ${refStructure.length} nodes`);
    console.log(`  Local: ${localStructure.length} nodes`);
    
    // Print structures
    printStructure(refStructure, 'Reference');
    printStructure(localStructure, 'Local');
    
    // Compare
    console.log('\nComparing structures...');
    const differences = compareStructures(refStructure, localStructure);
    
    printDifferences(differences);
    
    // Summary
    console.log(`\n${'='.repeat(60)}`);
    console.log('Summary:');
    console.log(`  Total differences: ${differences.length}`);
    const byType = differences.reduce((acc, d) => {
      acc[d.type] = (acc[d.type] || 0) + 1;
      return acc;
    }, {});
    Object.entries(byType).forEach(([type, count]) => {
      console.log(`  ${type}: ${count}`);
    });
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

