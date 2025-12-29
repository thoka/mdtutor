#!/usr/bin/env node
/**
 * Extract HTML Structure Tool
 * 
 * AGENT USE: Dumps HTML tag/class hierarchy.
 * 
 * USAGE:
 *   node tools/extract-structure.js <url> [options]
 * 
 * OPTIONS:
 *   --help       Show this help
 *   --json       Output results as JSON for machine parsing
 *   --puppeteer  Force use of Puppeteer (required for client-side rendering)
 * 
 * EXAMPLES:
 *   node tools/extract-structure.js https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1 --puppeteer
 *   node tools/extract-structure.js http://localhost:5173/#/cats-vs-dogs/1 --json
 */

import { parse } from 'node-html-parser';
import puppeteer from 'puppeteer';
import https from 'https';
import http from 'http';

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Extract HTML Structure Tool
---------------------------
Extracts and prints the HTML structure from a single page.
Useful for inspecting the structure of reference or local pages.

Usage:
  node tools/extract-structure.js <url> [options]

Options:
  --help       Show this help
  --json       Output results as JSON for machine parsing
  --puppeteer  Force use of Puppeteer (required for client-side rendering)

Examples:
  node tools/extract-structure.js https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1 --puppeteer
  node tools/extract-structure.js http://localhost:5173/#/cats-vs-dogs/1 --json
  `);
}

async function fetchHTML(url, usePuppeteer = false) {
  if (usePuppeteer) {
    const browser = await puppeteer.launch({ headless: true });
    try {
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      
      // Wait for main content to load (look for common content selectors)
      try {
        await page.waitForSelector('main, article, [role="main"], .content, [class*="project"]', { timeout: 5000 });
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
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => { resolve(data); });
    }).on('error', (err) => { reject(err); });
  });
}

function extractStructure(html) {
  const root = parse(html);
  const structure = [];
  
  // Try to find main content container - check multiple possible selectors
  let projectContainer = root.querySelector('.c-project');
  if (!projectContainer) {
    projectContainer = root.querySelector('main');
  }
  if (!projectContainer) {
    projectContainer = root.querySelector('article');
  }
  if (!projectContainer) {
    projectContainer = root.querySelector('[role="main"]');
  }
  if (!projectContainer) {
    // Look for any div with "project" in class
    const allDivs = root.querySelectorAll('div');
    for (const div of allDivs) {
      const classes = div.getAttribute('class') || '';
      if (classes.includes('project') || classes.includes('tutorial') || classes.includes('content')) {
        projectContainer = div;
        break;
      }
    }
  }
  if (!projectContainer) {
    projectContainer = root.querySelector('body');
  }
  
  function traverse(node, depth = 0, path = [], maxDepth = 20) {
    if (!node || depth > maxDepth) return;
    
    // Skip text nodes, comments, and script/style tags
    if (node.nodeType === 3 || node.nodeType === 8) return;
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return;
    
    const tagName = (node.tagName || '').toLowerCase();
    if (!tagName) return;
    
    // Skip cookie dialogs and other non-content elements
    const classes = (node.getAttribute('class') || '').toLowerCase();
    if (classes.includes('cookie') || classes.includes('cookiebot') || classes.includes('cybot')) {
      return;
    }
    
    const classList = (node.getAttribute('class') || '').split(' ').filter(c => c.trim());
    const id = node.getAttribute('id') || '';
    
    structure.push({
      tag: tagName,
      classes: classList,
      id: id,
      depth: depth,
      selector: tagName + (id ? `#${id}` : '') + (classList.length > 0 ? `.${classList.join('.')}` : '')
    });
    
    // Traverse children
    const children = node.childNodes || [];
    children.forEach((child) => {
      traverse(child, depth + 1, [...path, tagName], maxDepth);
    });
  }
  
  if (projectContainer) {
    const containerClass = projectContainer.getAttribute('class') || 'container';
    traverse(projectContainer, 0, [containerClass]);
  } else {
    const body = root.querySelector('body');
    if (body) {
      traverse(body, 0, ['body']);
    }
  }
  
  return structure;
}

function printStructure(structure, label) {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`${label}`);
  console.log('='.repeat(80));
  
  structure.forEach(node => {
    const indent = '  '.repeat(node.depth);
    const classStr = node.classes.length > 0 ? `.${node.classes.join('.')}` : '';
    const idStr = node.id ? `#${node.id}` : '';
    console.log(`${indent}<${node.tag}${classStr}${idStr}>`);
  });
  
  console.log(`\nTotal nodes: ${structure.length}`);
}

async function main() {
  const args = process.argv.slice(2);
  const isJson = args.includes('--json');
  const isHelp = args.includes('--help');

  if (isHelp) {
    showHelp();
    process.exit(0);
  }
  
  const params = args.filter(arg => !arg.startsWith('--'));
  
  if (params.length < 1) {
    if (isJson) {
      console.log(JSON.stringify({ error: 'Missing URL', usage: 'node extract-structure.js <url> [options]' }));
    } else {
      showHelp();
    }
    process.exit(1);
  }
  
  const url = params[0];
  const forcePuppeteer = args.includes('--puppeteer');
  const usePuppeteer = forcePuppeteer || url.includes('localhost') || url.includes('#');
  
  if (!isJson) {
    console.log(`Fetching HTML from: ${url}`);
    if (usePuppeteer) {
      console.log('(Using Puppeteer for client-side rendering)');
    }
  }
  
  try {
    const html = await fetchHTML(url, usePuppeteer);
    
    if (!isJson) {
      console.log(`✓ Fetched ${html.length} bytes`);
      
      // Debug: check if .c-project exists
      const root = parse(html);
      const projectContainer = root.querySelector('.c-project');
      if (!projectContainer) {
        console.log('\n⚠ Warning: .c-project container not found in HTML');
        console.log('Looking for alternative containers...');
      }
    }
    
    const structure = extractStructure(html);
    
    if (isJson) {
      console.log(JSON.stringify({
        url,
        usePuppeteer,
        totalNodes: structure.length,
        structure
      }, null, 2));
    } else {
      printStructure(structure, `Structure from ${url}`);
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

