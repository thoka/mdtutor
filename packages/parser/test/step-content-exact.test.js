/**
 * Step Content-Attribute Exaktvergleichstest
 * 
 * Testet alle content-attribute der Steps in data.attributes.content.steps[]
 * gegen die gecachten Original-API-Ergebnisse auf exakte Übereinstimmung.
 * 
 * Für das content-Feld (HTML) wird eine vollständige HTML-Struktur-Analyse
 * durchgeführt, die beide HTML-Strukturen und deren Unterschiede enthält.
 */

import { test } from 'node:test';
import assert from 'node:assert';
import { writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseProject } from '../src/parse-project.js';
import { 
  compareHtmlContent, 
  findProjects, 
  loadApiData, 
  compareStepAttributes 
} from './test-utils.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');
const projectsDir = join(projectRoot, 'content/RPL/projects');
const apiSnapshotsDir = join(projectRoot, 'test/snapshots');

/**
 * Haupttest: Vergleicht alle Projekte
 */
test('step-content-exact - all projects', async () => {
  let projects = findProjects(projectsDir);
  
  // Filter by PROJECT environment variable if set
  if (process.env.PROJECT) {
    projects = projects.filter(p => p.slug === process.env.PROJECT);
  }

  if (projects.length === 0) {
    console.log('No projects found in content/RPL/projects/' + (process.env.PROJECT ? ` matching ${process.env.PROJECT}` : ''));
    return;
  }

  const allDifferences = [];

  for (const project of projects) {
    // Filter by LANG environment variable if set
    let languages = project.languages;
    if (process.env.LANG) {
      languages = languages.filter(l => l === process.env.LANG);
    }

    for (const language of languages) {
      // Load API data
      const apiData = loadApiData(apiSnapshotsDir, project.slug, language);
      if (!apiData) {
        console.log(`Skipping ${project.slug}/${language} - API file not found`);
        continue;
      }

      // Parse project
      const projectPath = join(projectsDir, project.slug, 'repo', language);
      let parsedData;
      try {
        parsedData = await parseProject(projectPath, { languages: [language] });
        
        // Check for parsing warnings
        if (parsedData.warnings && parsedData.warnings.length > 0) {
          allDifferences.push({
            project: project.slug,
            language: language,
            type: 'parsing_warnings',
            warnings: parsedData.warnings,
            warningCount: parsedData.warnings.length
          });
        }
      } catch (error) {
        console.error(`Failed to parse ${project.slug}/${language}:`, error.message);
        continue;
      }

      const apiSteps = apiData.data.attributes.content.steps || [];
      const parsedSteps = parsedData.data.attributes.content.steps || [];

      // Check step count
      if (apiSteps.length !== parsedSteps.length) {
        allDifferences.push({
          project: project.slug,
          language: language,
          type: 'step_count_mismatch',
          expected: apiSteps.length,
          actual: parsedSteps.length
        });
        continue;
      }

      // Compare each step
      for (let i = 0; i < apiSteps.length; i++) {
        const apiStep = apiSteps[i];
        const parsedStep = parsedSteps[i];

        // Compare non-content attributes
        const attributeDiffs = compareStepAttributes(apiStep, parsedStep, i);
        if (attributeDiffs.length > 0) {
          allDifferences.push({
            project: project.slug,
            language: language,
            stepIndex: i,
            stepTitle: apiStep.title,
            differences: attributeDiffs
          });
        }

        // Compare content (HTML) with full structure analysis
        if (apiStep.content !== parsedStep.content) {
          const htmlAnalysis = compareHtmlContent(apiStep.content, parsedStep.content);
          
          allDifferences.push({
            project: project.slug,
            language: language,
            stepIndex: i,
            stepTitle: apiStep.title,
            differences: [{
              path: `steps[${i}].content`,
              jsonPath: `/data/attributes/content/steps/${i}/content`,
              type: 'html_content_mismatch',
              htmlAnalysis: htmlAnalysis
            }]
          });
        }
      }
    }
  }

  // Separate warnings from other differences
  const warnings = allDifferences.filter(d => d.type === 'parsing_warnings');
  const otherDifferences = allDifferences.filter(d => d.type !== 'parsing_warnings');
  
  // Output results
  if (warnings.length > 0 || otherDifferences.length > 0) {
    console.log('\n' + '='.repeat(80));
    
    // Report warnings
    if (warnings.length > 0) {
      const totalWarnings = warnings.reduce((sum, w) => sum + (w.warningCount || 0), 0);
      console.log(`⚠️  Found ${warnings.length} project(s) with parsing warnings (${totalWarnings} total warnings):`);
      warnings.forEach(w => {
        console.log(`  [${w.project}/${w.language}] ${w.warningCount} warning(s):`);
        w.warnings.forEach(warning => {
          console.log(`    - ${warning.type}: ${warning.message}`);
          if (warning.stepTitle) {
            console.log(`      Step: ${warning.stepTitle} (index ${warning.stepIndex})`);
          }
        });
      });
      console.log('');
    }
    
    if (otherDifferences.length > 0) {
      console.log(`Found ${otherDifferences.length} difference(s) across all projects`);
    }
    console.log('='.repeat(80));

    // Group by project (only non-warning differences)
    const byProject = {};
    otherDifferences.forEach(diff => {
      const key = `${diff.project}/${diff.language}`;
      if (!byProject[key]) {
        byProject[key] = [];
      }
      byProject[key].push(diff);
    });

    Object.entries(byProject).forEach(([key, diffs]) => {
      console.log(`\n[${key}] (${diffs.length} difference(s))`);
      console.log('-'.repeat(80));
      
      diffs.forEach((diff, index) => {
        if (diff.stepIndex !== undefined) {
          console.log(`\n  Step ${diff.stepIndex}: ${diff.stepTitle}`);
        }
        
        if (diff.differences) {
          diff.differences.forEach(d => {
            console.log(`    ${d.path}: ${d.type}`);
            if (d.htmlAnalysis) {
              console.log(`      Structural differences: ${d.htmlAnalysis.structuralDifferences.length}`);
              console.log(`      Pipeline errors: ${d.htmlAnalysis.pipelineErrorHints.length}`);
              if (d.htmlAnalysis.pipelineErrorHints.length > 0) {
                d.htmlAnalysis.pipelineErrorHints.forEach(err => {
                  console.log(`        - ${err.type}: ${err.suggestion}`);
                });
              }
            }
          });
        } else {
          console.log(`    ${diff.type}: expected ${diff.expected}, got ${diff.actual}`);
        }
      });
    });

    // Export to JSON for automatic processing
    const exportPath = join(projectRoot, 'test-differences.json');
    writeFileSync(exportPath, JSON.stringify(allDifferences, null, 2));
    console.log(`\n✓ Full differences exported to: ${exportPath}`);

    // Fail the test
    const totalIssues = otherDifferences.length + (warnings.length > 0 ? 1 : 0);
    const message = warnings.length > 0 
      ? `Found ${otherDifferences.length} difference(s) and ${warnings.length} project(s) with parsing warnings. See output above and ${exportPath} for details.`
      : `Found ${otherDifferences.length} difference(s). See output above and ${exportPath} for details.`;
    assert.fail(message);
  } else {
    console.log('\n✓ All step content attributes match exactly!');
  }
});

