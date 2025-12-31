
import { test } from 'node:test';
import assert from 'node:assert';
import { parseQuiz } from '../src/parse-quiz.js';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parse } from 'node-html-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');

test('space-talk quiz parsing', async () => {
  const quizPath = join(projectRoot, 'content/RPL/projects/space-talk/repo/de-DE/quiz1');
  const result = await parseQuiz(quizPath);
  
  assert.strictEqual(result.questions.length, 3, 'Should have 3 questions');
  
  // Check that correct answers are checked by default (API compatibility)
  const html = result.html;
  assert.ok(html.includes('checked'), 'HTML should contain "checked" attribute for correct answers');
  
  // Check for unique IDs across questions
  const allIds = [];
  const parsed = parse(html);
  parsed.querySelectorAll('[id]').forEach(el => {
    const id = el.getAttribute('id');
    if (allIds.includes(id)) {
      assert.fail(`Duplicate ID found: ${id}`);
    }
    allIds.push(id);
  });
  
  // Verify ID format (e.g., q1-choice-1)
  const firstInput = parsed.querySelector('input[type="radio"]');
  assert.ok(firstInput?.getAttribute('id')?.startsWith('q1-choice-'), 'ID should start with q1-choice-');
});

