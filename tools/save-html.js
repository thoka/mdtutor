#!/usr/bin/env node
/**
 * Save Rendered HTML Tool
 * 
 * AGENT USE: Downloads fully rendered HTML (Puppeteer-backed).
 * 
 * USAGE:
 *   node tools/save-html.js <url> [output-file] [options]
 * 
 * OPTIONS:
 *   --help     Show this help
 *   --json     Output results as JSON for machine parsing
 * 
 * EXAMPLES:
 *   node tools/save-html.js https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1 ref.html
 *   node tools/save-html.js https://... ref.html --json
 */

import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

/**
 * Show help message
 */
function showHelp() {
  console.log(`
Save Rendered HTML Tool
-----------------------
Fetches and saves the fully rendered HTML from a page for manual inspection.
Uses Puppeteer to ensure client-side rendering is complete.

Usage:
  node tools/save-html.js <url> [output-file] [options]

Options:
  --help     Show this help
  --json     Output results as JSON for machine parsing

Examples:
  node tools/save-html.js https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1 ref.html
  node tools/save-html.js https://... ref.html --json
  `);
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
      console.log(JSON.stringify({ error: 'Missing URL', usage: 'node save-html.js <url> [output-file]' }));
    } else {
      showHelp();
    }
    process.exit(1);
  }
  
  const url = params[0];
  const outputFile = params[1] || 'output.html';
  
  if (!isJson) {
    console.log(`Fetching HTML from: ${url}`);
    console.log(`Output file: ${outputFile}`);
  }
  
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const html = await page.content();
    await browser.close();
    
    writeFileSync(outputFile, html, 'utf-8');
    
    if (isJson) {
      console.log(JSON.stringify({
        url,
        outputFile,
        size: html.length,
        status: 'success'
      }, null, 2));
    } else {
      console.log(`✓ Saved ${html.length} bytes to ${outputFile}`);
    }
    
  } catch (error) {
    if (isJson) {
      console.log(JSON.stringify({ error: error.message, stack: error.stack }));
    } else {
      console.error('Error:', error.message);
    }
    process.exit(1);
  }
}

main();

