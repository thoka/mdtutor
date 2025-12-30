/**
 * Silly Eyes Parity Test
 * 
 * Spezifischer Test für das Silly Eyes Projekt.
 * Prüft erst de-DE, dann en auf exakte Übereinstimmung.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseProject } from '../src/parse-project.js';
import { 
  compareHtmlContent, 
  loadApiData, 
  compareStepAttributes 
} from './test-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');
const snapshotsDir = join(projectRoot, 'test/snapshots');
const projectSlug = 'silly-eyes';

async function runParityTest(language) {
  console.log(`\nRunning parity test for ${projectSlug} [${language}]...`);
  
  const apiData = loadApiData(snapshotsDir, projectSlug, language);
  if (!apiData) {
    throw new Error(`API snapshot not found for ${projectSlug}/${language}`);
  }

  const projectPath = join(snapshotsDir, projectSlug, 'repo', language);
  const parsedData = await parseProject(projectPath, { languages: [language] });
  
  const apiSteps = apiData.data.attributes.content.steps || [];
  const parsedSteps = parsedData.data.attributes.content.steps || [];

  const differences = [];

  // Check step count
  if (apiSteps.length !== parsedSteps.length) {
    differences.push({
      type: 'step_count_mismatch',
      expected: apiSteps.length,
      actual: parsedSteps.length
    });
  } else {
    // Compare each step
    for (let i = 0; i < apiSteps.length; i++) {
      const apiStep = apiSteps[i];
      const parsedStep = parsedSteps[i];

      // Compare non-content attributes
      const attributeDiffs = compareStepAttributes(apiStep, parsedStep, i);
      if (attributeDiffs.length > 0) {
        differences.push({
          stepIndex: i,
          stepTitle: apiStep.title,
          type: 'attribute_mismatch',
          details: attributeDiffs
        });
      }

      // Compare content (HTML)
      if (apiStep.content !== parsedStep.content) {
        const htmlAnalysis = compareHtmlContent(apiStep.content, parsedStep.content);
        differences.push({
          stepIndex: i,
          stepTitle: apiStep.title,
          type: 'html_mismatch',
          htmlAnalysis: htmlAnalysis
        });
      }
    }
  }

  if (differences.length > 0) {
    console.log(`❌ Found ${differences.length} difference(s) in ${language}`);
    differences.forEach(diff => {
      if (diff.stepIndex !== undefined) {
        console.log(`  Step ${diff.stepIndex}: ${diff.stepTitle}`);
        if (diff.type === 'html_mismatch') {
          console.log(`    Structural differences: ${diff.htmlAnalysis.structuralDifferences.length}`);
          if (diff.htmlAnalysis.pipelineErrorHints.length > 0) {
            diff.htmlAnalysis.pipelineErrorHints.forEach(hint => {
              console.log(`    Hint: ${hint.suggestion}`);
            });
          }
        }
      } else {
        console.log(`  ${diff.type}: expected ${diff.expected}, got ${diff.actual}`);
      }
    });
    return { success: false, differences };
  }

  console.log(`✅ ${language} matches exactly!`);
  return { success: true };
}

test('Silly Eyes Parity - de-DE then en', async () => {
  // 1. Test de-DE
  const deResult = await runParityTest('de-DE');
  
  // 2. Test en (only if de-DE was successful or if we want to see both)
  // The user said: "tests zuerst für de-DE laufen lassen; wenn erfolgreich, dann auch für en"
  if (deResult.success) {
    const enResult = await runParityTest('en');
    if (!enResult.success) {
      assert.fail('Silly Eyes parity failed for en. See output above.');
    }
  } else {
    assert.fail('Silly Eyes parity failed for de-DE. See output above.');
  }
});
