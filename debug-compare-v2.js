import { parseProject } from './packages/parser/src/parse-project.js';
import { loadApiData, compareHtmlContent, extractHtmlStructure } from './packages/parser/test/test-utils.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { parse } from 'node-html-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = join(__dirname, 'test/snapshots');
const projectSlug = 'silly-eyes';
const language = 'de-DE';

async function debug() {
  const apiData = loadApiData(snapshotsDir, projectSlug, language);
  const projectPath = join(snapshotsDir, projectSlug, 'repo', language);
  
  const parsedData = await parseProject(projectPath, { 
    languages: [language]
  });
  
  const apiSteps = apiData.data.attributes.content.steps;
  const parsedSteps = parsedData.data.attributes.content.steps;
  
  for (let i = 0; i < apiSteps.length; i++) {
    const apiHtml = apiSteps[i].content;
    const parsedHtml = parsedSteps[i].content;
    
    const analysis = compareHtmlContent(apiHtml, parsedHtml);
    console.log(`Differences in Step ${i}:`, analysis.structuralDifferences.length);
    if (analysis.structuralDifferences.length > 0) {
      analysis.structuralDifferences.slice(0, 5).forEach(d => {
        console.log(`  - ${d.type}: ${d.message}`);
        if (d.expectedElement) console.log(`    Expected: <${d.expectedElement.selector}>`);
        if (d.actualElement) console.log(`    Actual:   <${d.actualElement.selector}>`);
      });
    }
    fs.writeFileSync(`debug-api-step${i}.html`, apiHtml);
    fs.writeFileSync(`debug-parsed-step${i}.html`, parsedHtml);
  }
}

debug();
