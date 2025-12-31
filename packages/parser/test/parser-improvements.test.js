import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseTutorial } from '../src/parse-tutorial.js';
import { normalizeText } from './test-utils.js';

test('Parser Improvements: Heading IDs with emojis', async () => {
  const markdown = '### Spielen ▶️';
  const { html } = await parseTutorial(markdown);
  
  // Should include variation selector \ufe0f and handle sequences correctly
  assert.ok(html.includes('id="spielen-️"'), `Expected id="spielen-️", got: ${html}`);
});

test('Parser Improvements: Robust <p> wrapping inside <div>', async () => {
  const markdown = `
<div class="custom">
Text that should be a paragraph.
More text in same paragraph? No, usually separate if newline.
</div>
`;
  const { html } = await parseTutorial(markdown);
  
  // Normalize both for comparison
  const normalized = normalizeText(html);
  assert.ok(normalized.includes('<div class="custom"><p>Text that should be a paragraph.'), `Should wrap text in <p>. Got: ${html}`);
});

test('Parser Improvements: Links inside raw HTML', async () => {
  const markdown = `
<div style="display: flex">
[See inside](https://scratch.mit.edu/projects/123/editor){:target="_blank"}
</div>
`;
  const { html } = await parseTutorial(markdown);
  
  assert.ok(html.includes('<a href="https://scratch.mit.edu/projects/123/editor" target="_blank">See inside</a>'), `Should parse link inside raw HTML. Got: ${html}`);
});

test('Parser Improvements: Mixed inline content in <div>', async () => {
  const markdown = `
<div>
**Bold text** and [a link](url) and \`code\`.
</div>
`;
  const { html } = await parseTutorial(markdown);
  
  const normalized = normalizeText(html);
  assert.ok(normalized.includes('<div><p><strong>Bold text</strong> and <a href="url">a link</a> and <code>code</code>.</p></div>'), `Should handle mixed inline content in <div>. Got: ${html}`);
});

test('Parser Improvements: Block delimiters with whitespace', async () => {
  // Test if delimiters are recognized even with leading/trailing spaces
  const markdown = `
  --- task ---
Content
  --- /task ---  
`;
  const { html } = await parseTutorial(markdown);
  
  assert.ok(html.includes('<div class="c-project-task">'), 'Should recognize delimiter with leading spaces');
  assert.ok(html.includes('Content'), 'Should include content');
});

test('Parser Improvements: Block delimiters inside <div> (no blank lines)', async () => {
  const markdown = `
<div>
--- task ---
Content
--- /task ---
</div>
`;
  const { html } = await parseTutorial(markdown);
  
  assert.ok(html.includes('<div>'), 'Should include outer <div>');
  assert.ok(html.includes('<div class="c-project-task">'), 'Should recognize delimiter inside HTML block');
  assert.ok(html.includes('Content'), 'Should include content');
});

test('Parser Improvements: Block delimiters nesting in no-print', async () => {
  const markdown = `
--- no-print ---

--- task ---
Task 1
--- /task ---

### Heading

--- task ---
Task 2
--- /task ---

--- /no-print ---
`;
  const { html } = await parseTutorial(markdown);
  
  // Count task divs
  const taskCount = (html.match(/class="c-project-task"/g) || []).length;
  assert.strictEqual(taskCount, 2, 'Should have exactly 2 tasks');
  
  // Check that they are not nested
  assert.ok(!html.includes('class="c-project-task"><input type="checkbox" class="c-project-task__checkbox" aria-label="Mark this task as complete"><div class="c-project-task__body"><div class="c-project-task">'), 'Tasks should not be nested');
});

