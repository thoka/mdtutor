#!/usr/bin/env node
/**
 * Save Rendered HTML Tool
 * 
 * Fetches and saves the fully rendered HTML from a page for manual inspection.
 */

import puppeteer from 'puppeteer';
import { writeFileSync } from 'fs';

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node save-html.js <url> [output-file]');
    console.error('Example: node save-html.js https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1 ref.html');
    process.exit(1);
  }
  
  const url = args[0];
  const outputFile = args[1] || 'output.html';
  
  console.log(`Fetching HTML from: ${url}`);
  console.log(`Output file: ${outputFile}`);
  
  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const html = await page.content();
    await browser.close();
    
    writeFileSync(outputFile, html, 'utf-8');
    console.log(`✓ Saved ${html.length} bytes to ${outputFile}`);
    console.log(`\nYou can now inspect the HTML structure manually.`);
    console.log(`Look for the main content container and compare with your local renderer.`);
    
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

main();

