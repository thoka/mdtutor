import { parseTutorial } from './packages/parser/src/parse-tutorial.js';

const markdown = `
--- collapse ---
---
title: My Title
---
Content
--- /collapse ---
`;

const result = await parseTutorial(markdown);
console.log(result.html);
