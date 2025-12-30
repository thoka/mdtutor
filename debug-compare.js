import { parseTutorial } from './packages/parser/src/parse-tutorial.js';
import { compareHtmlStructures, extractHtmlStructure } from './packages/parser/test/test-utils.js';
import { readFileSync } from 'fs';

async function debug() {
  const snapshot = JSON.parse(readFileSync('./test/snapshots/silly-eyes/api-project-de-DE.json', 'utf-8'));
  const apiStep0 = snapshot.data.attributes.content.steps[0].content;
  
  const markdown = readFileSync('./test/snapshots/silly-eyes/repo/de-DE/step_1.md', 'utf-8');
  const parsed = await parseTutorial(markdown);
  const parsedStep0 = parsed.html;
  
  const expected = extractHtmlStructure(apiStep0);
  const actual = extractHtmlStructure(parsedStep0);
  
  const differences = compareHtmlStructures(expected.root, actual.root);
  console.log('Differences in Step 0:');
  console.log(JSON.stringify(differences.map(d => d.message), null, 2));
}

debug();
