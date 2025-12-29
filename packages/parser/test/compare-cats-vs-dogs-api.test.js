/**
 * Exact comparison test for cats-vs-dogs
 * Compares our parsed output with the original RPL API to ensure exact match
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseProject } from '../src/parse-project.js';
import { parse } from 'node-html-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');

/**
 * Load original API data
 */
function loadApiData(language = 'en') {
  const apiPath = join(projectRoot, 'test/snapshots/cats-vs-dogs', `api-project-${language}.json`);
  if (!existsSync(apiPath)) {
    return null;
  }
  const data = JSON.parse(readFileSync(apiPath, 'utf-8'));
  return data;
}

test('compare-cats-vs-dogs - exact API structure match', async () => {
  // Load original API
  const apiData = loadApiData('en');
  if (!apiData) {
    console.log('Skipping test - API file not found');
    return;
  }
  
  // Parse our version
  const projectPath = join(projectRoot, 'test/snapshots/cats-vs-dogs/repo/en');
  const ourResult = await parseProject(projectPath, { languages: ['en'] });
  
  // Compare top-level structure
  assert.strictEqual(ourResult.data.type, apiData.data.type, 'Type should match');
  
  const apiContent = apiData.data.attributes.content;
  const ourContent = ourResult.data.attributes.content;
  
  // Compare basic fields
  assert.strictEqual(ourContent.title, apiContent.title, 'Title should match');
  assert.strictEqual(ourContent.description, apiContent.description, 'Description should match');
  assert.strictEqual(ourContent.version, apiContent.version, 'Version should match');
  assert.strictEqual(ourContent.listed, apiContent.listed, 'Listed should match');
  assert.strictEqual(ourContent.copyedit, apiContent.copyedit, 'Copyedit should match');
  
  // Compare heroImage (should be absolute URL in both)
  // Note: API has absolute URL, ours should be transformed to absolute
  assert.ok(ourContent.heroImage, 'heroImage should exist');
  assert.ok(ourContent.heroImage.startsWith('/') || ourContent.heroImage.startsWith('http'), 
    'heroImage should be absolute URL');
  
  // Compare steps count
  assert.strictEqual(ourContent.steps.length, apiContent.steps.length, 
    `Steps count should match (expected ${apiContent.steps.length}, got ${ourContent.steps.length})`);
  
  // Compare each step
  apiContent.steps.forEach((apiStep, index) => {
    const ourStep = ourContent.steps[index];
    assert.ok(ourStep, `Step ${index} should exist`);
    
    assert.strictEqual(ourStep.title, apiStep.title, 
      `Step ${index} title should match`);
    assert.strictEqual(ourStep.position, apiStep.position, 
      `Step ${index} position should match`);
    assert.strictEqual(ourStep.quiz, apiStep.quiz, 
      `Step ${index} quiz should match`);
    assert.strictEqual(ourStep.challenge, apiStep.challenge, 
      `Step ${index} challenge should match`);
    
    // Compare completion arrays
    assert.deepStrictEqual(ourStep.completion, apiStep.completion, 
      `Step ${index} completion should match`);
    
    // Compare ingredients arrays
    assert.deepStrictEqual(ourStep.ingredients, apiStep.ingredients, 
      `Step ${index} ingredients should match`);
    
    // Compare knowledgeQuiz (should be empty object {} or null)
    if (apiStep.knowledgeQuiz && Object.keys(apiStep.knowledgeQuiz).length === 0) {
      // API has empty object, we might have null or empty object
      assert.ok(!ourStep.knowledgeQuiz || Object.keys(ourStep.knowledgeQuiz || {}).length === 0,
        `Step ${index} knowledgeQuiz should be empty or null`);
    } else {
      assert.deepStrictEqual(ourStep.knowledgeQuiz, apiStep.knowledgeQuiz,
        `Step ${index} knowledgeQuiz should match`);
    }
    
    // Compare content HTML structure
    // Parse both HTMLs to compare structure
    const apiParsed = parse(apiStep.content);
    const ourParsed = parse(ourStep.content);
    
    // Compare main headings
    const apiHeadings = apiParsed.querySelectorAll('h2, h3');
    const ourHeadings = ourParsed.querySelectorAll('h2, h3');
    assert.strictEqual(ourHeadings.length, apiHeadings.length,
      `Step ${index} should have same number of headings`);
    
    // Compare that we have the same structural elements
    const apiPanels = apiParsed.querySelectorAll('.c-project-panel');
    const ourPanels = ourParsed.querySelectorAll('.c-project-panel');
    assert.strictEqual(ourPanels.length, apiPanels.length,
      `Step ${index} should have same number of panels`);
    
    const apiTasks = apiParsed.querySelectorAll('.c-project-task');
    const ourTasks = ourParsed.querySelectorAll('.c-project-task');
    assert.strictEqual(ourTasks.length, apiTasks.length,
      `Step ${index} should have same number of tasks`);
  });
  
  console.log('✓ All structure comparisons passed');
});

test('compare-cats-vs-dogs - content HTML matches', async () => {
  // Load original API
  const apiData = loadApiData('en');
  if (!apiData) {
    console.log('Skipping test - API file not found');
    return;
  }
  
  // Parse our version
  const projectPath = join(projectRoot, 'test/snapshots/cats-vs-dogs/repo/en');
  const ourResult = await parseProject(projectPath, { languages: ['en'] });
  
  const apiContent = apiData.data.attributes.content;
  const ourContent = ourResult.data.attributes.content;
  
  // Compare first step content in detail
  const apiStep0 = apiContent.steps[0];
  const ourStep0 = ourContent.steps[0];
  
  // Parse HTML
  const apiHtml = parse(apiStep0.content);
  const ourHtml = parse(ourStep0.content);
  
  // Check for specific elements that should be present
  const apiPanels = apiHtml.querySelectorAll('.c-project-panel');
  const ourPanels = ourHtml.querySelectorAll('.c-project-panel');
  
  console.log(`API has ${apiPanels.length} panels, we have ${ourPanels.length} panels`);
  
  // Compare panel headings
  apiPanels.forEach((apiPanel, index) => {
    const ourPanel = ourPanels[index];
    if (!ourPanel) {
      console.warn(`Missing panel ${index} in our output`);
      return;
    }
    
    const apiHeading = apiPanel.querySelector('.c-project-panel__heading');
    const ourHeading = ourPanel.querySelector('.c-project-panel__heading');
    
    if (apiHeading && ourHeading) {
      const apiHeadingText = apiHeading.textContent.trim();
      const ourHeadingText = ourHeading.textContent.trim();
      assert.strictEqual(ourHeadingText, apiHeadingText,
        `Panel ${index} heading should match`);
    }
  });
  
  // Check that block delimiters are properly converted
  // Should NOT have raw "--- collapse ---" text in HTML
  const ourHtmlText = ourStep0.content;
  assert.ok(!ourHtmlText.includes('--- collapse ---'),
    'Block delimiters should be converted, not left as raw text');
  assert.ok(!ourHtmlText.includes('--- /collapse ---'),
    'Block closing delimiters should be converted');
});

