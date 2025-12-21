#!/usr/bin/env node
/**
 * Extract CSS Tool
 * 
 * Extracts all CSS from a reference page (including inline styles and stylesheets)
 * and saves it for cloning to the local renderer.
 */

import puppeteer from 'puppeteer';
import { writeFileSync, existsSync, mkdirSync } from 'fs';
import https from 'https';
import http from 'http';

async function extractCSS(url) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content to load
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Extract all CSS
    const css = await page.evaluate(() => {
      const styles = [];
      
      // Get all stylesheets
      Array.from(document.styleSheets).forEach((sheet, index) => {
        try {
          if (sheet.href) {
            styles.push(`/* Stylesheet ${index + 1}: ${sheet.href} */`);
          } else {
            styles.push(`/* Inline stylesheet ${index + 1} */`);
          }
          
          // Try to get rules
          try {
            Array.from(sheet.cssRules || []).forEach(rule => {
              if (rule.cssText) {
                styles.push(rule.cssText);
              }
            });
          } catch (e) {
            // Cross-origin stylesheet, skip
            styles.push(`/* Could not access rules (cross-origin) */`);
          }
        } catch (e) {
          styles.push(`/* Error accessing stylesheet ${index + 1}: ${e.message} */`);
        }
      });
      
      // Get inline styles from elements
      const inlineStyles = [];
      const elementsWithStyle = document.querySelectorAll('[style]');
      elementsWithStyle.forEach((el, index) => {
        if (el.getAttribute('style')) {
          const selector = el.tagName.toLowerCase() + 
            (el.id ? `#${el.id}` : '') + 
            (el.className ? `.${el.className.split(' ').join('.')}` : '');
          inlineStyles.push(`/* Inline style ${index + 1} on ${selector} */`);
          inlineStyles.push(`${selector} { ${el.getAttribute('style')} }`);
        }
      });
      
      if (inlineStyles.length > 0) {
        styles.push('\n/* Inline styles from elements */');
        styles.push(...inlineStyles);
      }
      
      return styles.join('\n');
    });
    
    await browser.close();
    return css;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function extractStylesheetLinks(url) {
  const browser = await puppeteer.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
    
    // Wait for content
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const links = await page.evaluate(() => {
      const stylesheets = [];
      document.querySelectorAll('link[rel="stylesheet"]').forEach(link => {
        if (link.href) {
          stylesheets.push(link.href);
        }
      });
      return stylesheets;
    });
    
    await browser.close();
    return links;
  } catch (error) {
    await browser.close();
    throw error;
  }
}

async function downloadCSS(url, outputPath) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    client.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        writeFileSync(outputPath, data, 'utf-8');
        resolve(data.length);
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.length < 1) {
    console.error('Usage: node extract-css.js <url> [output-dir]');
    console.error('Example: node extract-css.js https://projects.raspberrypi.org/en/projects/cats-vs-dogs/1 ./css');
    process.exit(1);
  }
  
  const url = args[0];
  const outputDir = args[1] || './css';
  
  console.log(`Extracting CSS from: ${url}`);
  console.log(`Output directory: ${outputDir}`);
  
  try {
    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)) {
      mkdirSync(outputDir, { recursive: true });
    }
    
    // Extract stylesheet links
    console.log('\n1. Extracting stylesheet links...');
    const stylesheetLinks = await extractStylesheetLinks(url);
    console.log(`   Found ${stylesheetLinks.length} stylesheets`);
    
    // Download each stylesheet
    const downloaded = [];
    for (let i = 0; i < stylesheetLinks.length; i++) {
      const link = stylesheetLinks[i];
      try {
        const filename = link.split('/').pop().split('?')[0] || `stylesheet-${i + 1}.css`;
        const outputPath = `${outputDir}/${filename}`;
        console.log(`   Downloading: ${filename}`);
        const size = await downloadCSS(link, outputPath);
        downloaded.push({ link, filename, size });
        console.log(`   ✓ Saved ${size} bytes`);
      } catch (error) {
        console.log(`   ✗ Failed to download ${link}: ${error.message}`);
      }
    }
    
    // Extract computed CSS
    console.log('\n2. Extracting computed CSS...');
    const computedCSS = await extractCSS(url);
    const computedPath = `${outputDir}/computed.css`;
    writeFileSync(computedPath, computedCSS, 'utf-8');
    console.log(`   ✓ Saved computed CSS (${computedCSS.length} bytes) to ${computedPath}`);
    
    // Create index file
    const indexContent = `/* CSS extracted from ${url} */
/* Extracted on: ${new Date().toISOString()} */

/* Stylesheets found: */
${stylesheetLinks.map((link, i) => `/* ${i + 1}. ${link} */`).join('\n')}

/* Downloaded stylesheets: */
${downloaded.map(({ filename, size }) => `@import "${filename}"; /* ${size} bytes */`).join('\n')}

/* Computed CSS (all rules from page): */
@import "computed.css";
`;
    
    const indexPath = `${outputDir}/index.css`;
    writeFileSync(indexPath, indexContent, 'utf-8');
    console.log(`\n✓ Created index file: ${indexPath}`);
    console.log(`\nTotal stylesheets: ${downloaded.length}`);
    console.log(`Total CSS size: ${downloaded.reduce((sum, f) => sum + f.size, 0) + computedCSS.length} bytes`);
    
  } catch (error) {
    console.error('Error:', error.message);
    if (error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

main();

