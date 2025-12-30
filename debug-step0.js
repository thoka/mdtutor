
import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseProject } from './packages/parser/src/parse-project.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const snapshotsDir = join(__dirname, 'test/snapshots');
const projectSlug = 'silly-eyes';
const language = 'de-DE';

const apiDataPath = join(snapshotsDir, projectSlug, `api-project-${language}.json`);
const apiData = JSON.parse(readFileSync(apiDataPath, 'utf-8'));

const projectPath = join(snapshotsDir, projectSlug, 'repo', language);
const parsedData = await parseProject(projectPath, { languages: [language] });

import { extractHtmlStructure } from './packages/parser/test/test-utils.js';

const apiStep0 = apiData.data.attributes.content.steps[0];
const apiStructure = extractHtmlStructure(apiStep0.content);

function dumpStructure(node, indent = '') {
  console.log(`${indent}${node.tag}${node.id ? '#' + node.id : ''}${node.classes.length > 0 ? '.' + node.classes.join('.') : ''}`);
  node.children.forEach(c => dumpStructure(c, indent + '  '));
}

console.log('--- API STEP 0 STRUCTURE ---');
dumpStructure(apiStructure.root);

