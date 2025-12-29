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

test('parseTutorial - block delimiters', async () => {
  const markdown = `
--- task ---

This is a task.

--- /task ---

--- no-print ---

Hidden content.

--- /no-print ---
`;

  const html = await parseTutorial(markdown);
  assert.ok(html.includes('<div class="c-project-task">'));
  assert.ok(html.includes('checkbox'));
  assert.ok(html.includes('<div class="u-no-print">'));
  assert.strictEqual(html.match(/<\/div>/g).length, 2);
});

test('parseTutorial - link attributes', async () => {
  const markdown = `
[See inside](https://scratch.mit.edu){:target="_blank"}

![Character](images/char.png){:width="300px"}

[Button](link){.button .primary}
`;

  const html = await parseTutorial(markdown);
  assert.ok(html.includes('target="_blank"'));
  assert.ok(html.includes('width="300px"'));
  assert.ok(html.includes('class="button primary"'));
});

test('parseTutorial - link attributes on separate line', async () => {
  const markdown = `
![Image](test.png)
{:width="300px"}
`;

  const html = await parseTutorial(markdown);
  assert.ok(html.includes('width="300px"'), 'Should have width attribute on img tag');
  assert.ok(!html.includes('{:width='), 'Should not have raw attribute syntax in output');
});
