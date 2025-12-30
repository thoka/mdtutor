/**
 * Tests for remark-yaml-blocks plugin
 * Tests that YAML blocks are recognized anywhere in the document
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkYamlBlocks from '../src/plugins/remark-yaml-blocks.js';
import { preprocessYamlBlocks } from '../src/parse-tutorial.js';

/**
 * Parse markdown and return AST
 */
async function parseToAST(markdown) {
  const preprocessed = preprocessYamlBlocks(markdown);
  const processor = unified()
    .use(remarkParse)
    .use(remarkYamlBlocks);
  
  const ast = processor.parse(preprocessed);
  return await processor.run(ast);
}

test('remark-yaml-blocks - recognizes YAML block in middle of document', async () => {
  const markdown = `## Heading

---
title: Test Title
---

Content here
`;

  const ast = await parseToAST(markdown);
  
  // Find yaml node
  let yamlNode = null;
  function findYaml(node) {
    if (node.type === 'yaml') {
      yamlNode = node;
      return;
    }
    if (node.children) {
      node.children.forEach(findYaml);
    }
  }
  findYaml(ast);
  
  assert.ok(yamlNode, 'Should find yaml node');
  assert.strictEqual(yamlNode.value.trim(), 'title: Test Title');
});

test('remark-yaml-blocks - recognizes YAML block after block delimiter', async () => {
  const markdown = `--- collapse ---
---
title: What you should already know
---
Content here
--- /collapse ---
`;

  const ast = await parseToAST(markdown);
  
  // Find yaml nodes
  const yamlNodes = [];
  function findYaml(node) {
    if (node.type === 'yaml') {
      yamlNodes.push(node);
    }
    if (node.children) {
      node.children.forEach(findYaml);
    }
  }
  findYaml(ast);
  
  assert.strictEqual(yamlNodes.length, 1, 'Should find one yaml node');
  assert.strictEqual(yamlNodes[0].value.trim(), 'title: What you should already know');
});

test('remark-yaml-blocks - handles empty YAML block', async () => {
  const markdown = `## Heading

---
---

Content here
`;

  const ast = await parseToAST(markdown);
  
  // Find yaml nodes
  const yamlNodes = [];
  function findYaml(node) {
    if (node.type === 'yaml') {
      yamlNodes.push(node);
    }
    if (node.children) {
      node.children.forEach(findYaml);
    }
  }
  findYaml(ast);
  
  assert.strictEqual(yamlNodes.length, 1, 'Should find one yaml node');
  assert.strictEqual(yamlNodes[0].value, '');
});

test('remark-yaml-blocks - handles multiple YAML blocks', async () => {
  const markdown = `## Heading

---
title: First
---

Content

---
title: Second
---

More content
`;

  const ast = await parseToAST(markdown);
  
  // Find yaml nodes
  const yamlNodes = [];
  function findYaml(node) {
    if (node.type === 'yaml') {
      yamlNodes.push(node);
    }
    if (node.children) {
      node.children.forEach(findYaml);
    }
  }
  findYaml(ast);
  
  assert.strictEqual(yamlNodes.length, 2, 'Should find two yaml nodes');
  assert.strictEqual(yamlNodes[0].value.trim(), 'title: First');
  assert.strictEqual(yamlNodes[1].value.trim(), 'title: Second');
});

test('remark-yaml-blocks - does not break block delimiters', async () => {
  const markdown = `--- task ---

This is a task.

--- /task ---
`;

  const ast = await parseToAST(markdown);
  
  // Should not create yaml nodes from block delimiters
  const yamlNodes = [];
  function findYaml(node) {
    if (node.type === 'yaml') {
      yamlNodes.push(node);
    }
    if (node.children) {
      node.children.forEach(findYaml);
    }
  }
  findYaml(ast);
  
  // Block delimiters have text between dashes, so they should not be recognized as YAML
  assert.strictEqual(yamlNodes.length, 0, 'Should not create yaml nodes from block delimiters');
});

