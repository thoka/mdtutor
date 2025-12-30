import { test } from 'node:test';
import assert from 'node:assert';
import { parseProject } from '../src/parse-project.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');

test('parseProject - silly-eyes structure', async () => {
  const projectPath = join(projectRoot, 'test/snapshots/silly-eyes/repo/en');
  const result = await parseProject(projectPath);
  
  // Check top-level structure
  assert.strictEqual(result.data.type, 'projects');
  assert.ok(result.data.attributes);
  assert.ok(result.data.attributes.content);
  
  // Check metadata
  const content = result.data.attributes.content;
  assert.strictEqual(content.title, 'Silly eyes');
  assert.strictEqual(content.description.includes('whose eyes follow the mouse pointer'), true);
  
  // Check steps
  assert.ok(Array.isArray(content.steps));
  assert.strictEqual(content.steps.length, 7);
  
  // Check first step
  const firstStep = content.steps[0];
  assert.strictEqual(firstStep.title, 'You will make');
  assert.strictEqual(firstStep.position, 0);
  // Check for h2 tag (with or without attributes like id)
  assert.ok(firstStep.content.includes('<h2'), 'First step should contain h2 tag');
  
  // Check quiz step (step 5)
  const quizStep = content.steps[4];
  // Note: Original API has quiz: false but knowledgeQuiz: "quiz1" (string)
  // We set quiz: true when knowledge_quiz exists in meta.yml
  assert.strictEqual(quizStep.quiz, true);
  assert.strictEqual(quizStep.knowledgeQuiz, 'quiz1');
});
