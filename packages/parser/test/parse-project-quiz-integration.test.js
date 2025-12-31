/**
 * Integration tests for quiz parsing in parseProject
 * Based on quiz-parsing-spec.md
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

test('parseProject - detects quiz step from meta.yml', async () => {
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const result = await parseProject(projectPath, { languages: ['en'], includeQuizData: true });
  
  const content = result.data.attributes.content;
  const quizStep = content.steps.find(step => step.knowledgeQuiz);
  
  assert.ok(quizStep, 'Should find a quiz step');
  assert.strictEqual(quizStep.knowledgeQuiz, 'quiz1', 'KnowledgeQuiz should match path from meta.yml');
});

test('parseProject - embeds quiz HTML in step content', async () => {
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const result = await parseProject(projectPath, { languages: ['en'], includeQuizData: true });
  
  const content = result.data.attributes.content;
  const quizStep = content.steps.find(step => step.knowledgeQuiz);
  
  assert.ok(quizStep, 'Should find a quiz step');
  assert.ok(quizStep.content, 'Quiz step should have content');
  assert.ok(quizStep.content.length > 0, 'Quiz step content should not be empty');
  assert.ok(quizStep.content.includes('knowledge-quiz-question'), 
    'Content should contain quiz HTML');
});

test('parseProject - quiz step has correct structure', async () => {
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const result = await parseProject(projectPath, { languages: ['en'], includeQuizData: true });
  
  const content = result.data.attributes.content;
  const quizStep = content.steps.find(step => step.knowledgeQuiz);
  
  assert.ok(quizStep, 'Should find a quiz step');
  assert.strictEqual(typeof quizStep.title, 'string', 'Title should be a string');
  assert.strictEqual(typeof quizStep.position, 'number', 'Position should be a number');
  assert.strictEqual(typeof quizStep.knowledgeQuiz, 'string', 'KnowledgeQuiz should be a string');
  assert.ok(Array.isArray(quizStep.completion), 'Completion should be an array');
});

test('parseProject - quiz HTML contains all questions', async () => {
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const result = await parseProject(projectPath, { languages: ['en'], includeQuizData: true });
  
  const content = result.data.attributes.content;
  const quizStep = content.steps.find(step => step.knowledgeQuiz);
  
  const parsed = parse(quizStep.content);
  // Original API uses <form> container
  const questions = parsed.querySelectorAll('form.knowledge-quiz-question');
  
  assert.strictEqual(questions.length, 3, 'Should have 3 questions in HTML');
});

test('parseProject - quiz HTML structure matches spec', async () => {
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const result = await parseProject(projectPath, { languages: ['en'], includeQuizData: true });
  
  const content = result.data.attributes.content;
  const quizStep = content.steps.find(step => step.knowledgeQuiz);
  
  const parsed = parse(quizStep.content);
  
  // Check for required CSS classes from spec
  // Original API structure: <form> container, direct <ul> with <li> items (no nested div)
  const requiredClasses = [
    'knowledge-quiz-question',
    'knowledge-quiz-question__blurb',
    'knowledge-quiz-question__answers',
    'knowledge-quiz-question__answer',
    'knowledge-quiz-question__feedback',
    'knowledge-quiz-question__feedback-item'
  ];
  
  requiredClasses.forEach(className => {
    const elements = parsed.querySelectorAll(`.${className}`);
    assert.ok(elements.length > 0, `Should have elements with class ${className}`);
  });
});

test('parseProject - quiz step maintains other step properties', async () => {
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const result = await parseProject(projectPath, { languages: ['en'], includeQuizData: true });
  
  const content = result.data.attributes.content;
  const quizStep = content.steps.find(step => step.knowledgeQuiz);
  
  // Check that quiz step has all standard step properties
  assert.ok(quizStep.title, 'Should have title');
  assert.ok(typeof quizStep.position === 'number', 'Should have position');
  assert.ok(Array.isArray(quizStep.completion), 'Should have completion array');
  assert.ok(Array.isArray(quizStep.ingredients), 'Should have ingredients array');
});

test('parseProject - non-quiz steps are not affected', async () => {
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const result = await parseProject(projectPath, { languages: ['en'], includeQuizData: true });
  
  const content = result.data.attributes.content;
  const nonQuizSteps = content.steps.filter(step => !step.knowledgeQuiz);
  
  assert.ok(nonQuizSteps.length > 0, 'Should have non-quiz steps');
  
  nonQuizSteps.forEach(step => {
    assert.strictEqual(step.quiz, false, 'Non-quiz step should have quiz: false');
    // knowledgeQuiz can be null or undefined for non-quiz steps
    assert.ok(step.knowledgeQuiz === null || step.knowledgeQuiz === undefined, 
      'Non-quiz step should have knowledgeQuiz: null or undefined');
  });
});

test('parseProject - quiz step content includes check buttons', async () => {
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const result = await parseProject(projectPath, { languages: ['en'], includeQuizData: true });
  
  const content = result.data.attributes.content;
  const quizStep = content.steps.find(step => step.knowledgeQuiz);
  
  const parsed = parse(quizStep.content);
  const checkButtons = parsed.querySelectorAll('input[type="button"]');
  
  assert.strictEqual(checkButtons.length, 3, 'Should have 3 check buttons');
  
  checkButtons.forEach((button, index) => {
    // Original API uses "submit" button value
    assert.strictEqual(button.getAttribute('value'), 'submit', 
      `Button ${index + 1} should have value "submit"`);
    assert.strictEqual(button.getAttribute('name'), 'Submit', 
      `Button ${index + 1} should have name "Submit"`);
  });
});

test('parseProject - quiz HTML preserves question order', async () => {
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const result = await parseProject(projectPath, { languages: ['en'], includeQuizData: true });
  
  const content = result.data.attributes.content;
  const quizStep = content.steps.find(step => step.knowledgeQuiz);
  
  const parsed = parse(quizStep.content);
  const questions = parsed.querySelectorAll('.knowledge-quiz-question');
  
  questions.forEach((question, index) => {
    const legend = question.querySelector('legend');
    const expectedNumber = index + 1;
    assert.ok(legend?.textContent?.includes(`Question ${expectedNumber}`), 
      `Question ${index + 1} should be in correct order`);
  });
});

test('parseProject - quiz step matches original API structure', async () => {
  const projectPath = join(projectRoot, 'content/RPL/projects/silly-eyes/repo/en');
  const result = await parseProject(projectPath, { languages: ['en'], includeQuizData: true });
  
  // Load original API for comparison
  const originalApiPath = join(projectRoot, 'test/snapshots/silly-eyes/api-project-en.json');
  if (!existsSync(originalApiPath)) {
    console.log('Skipping test - original API file not found');
    return;
  }
  
  const originalApi = JSON.parse(readFileSync(originalApiPath, 'utf-8'));
  const originalQuizStep = originalApi.data.attributes.content.steps.find(step => 
    step.knowledgeQuiz && typeof step.knowledgeQuiz === 'string'
  );
  
  const ourQuizStep = result.data.attributes.content.steps.find(step => step.knowledgeQuiz);
  
  // Compare structure
  assert.ok(originalQuizStep, 'Original API should have a quiz step');
  assert.ok(ourQuizStep, 'We should have a quiz step');
  
  assert.strictEqual(ourQuizStep.title, originalQuizStep.title, 'Title should match');
  assert.strictEqual(ourQuizStep.knowledgeQuiz, originalQuizStep.knowledgeQuiz, 
    'KnowledgeQuiz should match');
  // Note: Original API has quiz: false
  assert.strictEqual(ourQuizStep.quiz, false, 'We match original API quiz: false');
  // Original API has empty content, but we generate quiz HTML when includeQuizData is true
  assert.ok(ourQuizStep.content.length > 0, 'Our content should contain quiz HTML');
});

