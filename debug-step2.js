import { parseTutorial } from './packages/parser/src/parse-tutorial.js';
import fs from 'fs';

const markdown = fs.readFileSync('./test/snapshots/silly-eyes/repo/de-DE/step_2.md', 'utf8');
const result = await parseTutorial(markdown);
console.log(result.html);
