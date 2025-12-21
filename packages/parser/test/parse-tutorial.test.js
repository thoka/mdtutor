import { test } from 'node:test';
import assert from 'node:assert';
import { parseTutorial } from '../src/parse-tutorial.js';

test('parseTutorial - basic markdown', async () => {
  const markdown = `## Test Step

This is **bold** and this is *italic*.

- List item 1
- List item 2

\`\`\`python
print("Hello")
\`\`\`
`;

  const html = await parseTutorial(markdown);
  
  assert.ok(html.includes('<h2>Test Step</h2>'));
  assert.ok(html.includes('<strong>bold</strong>'));
  assert.ok(html.includes('<em>italic</em>'));
  assert.ok(html.includes('<li>List item 1</li>'));
  assert.ok(html.includes('<code class="language-python">'));
});

test('parseTutorial - with HTML passthrough', async () => {
  const markdown = `## Test

<div class="custom">
Content
</div>`;

  const html = await parseTutorial(markdown);
  
  assert.ok(html.includes('<div class="custom">'));
  assert.ok(html.includes('Content'));
});
