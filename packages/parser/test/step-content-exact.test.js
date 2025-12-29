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
import { readFileSync, existsSync, readdirSync, statSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { parseProject } from '../src/parse-project.js';
import { parse } from 'node-html-parser';

const __dirname = dirname(fileURLToPath(import.meta.url));
const projectRoot = join(__dirname, '../../..');
const snapshotsDir = join(projectRoot, 'test/snapshots');

/**
 * Extrahiert vollständige hierarchische HTML-Struktur
 * @param {string} html - HTML-String
 * @returns {Object} Struktur-Baum mit allen Element-Informationen
 */
function extractHtmlStructure(html) {
  const root = parse(html);
  const statistics = {
    totalElements: 0,
    totalTextNodes: 0,
    maxDepth: 0,
    elementCountByTag: {}
  };

  function traverse(node, depth = 0, parentPath = []) {
    if (!node) return null;

    // Skip text nodes, comments, script/style
    if (node.nodeType === 3) {
      // Text node
      statistics.totalTextNodes++;
      return null;
    }
    if (node.nodeType === 8) return null; // Comment
    if (node.tagName === 'SCRIPT' || node.tagName === 'STYLE') return null;

    const tagName = (node.tagName || '').toLowerCase();
    if (!tagName) return null;

    statistics.totalElements++;
    statistics.maxDepth = Math.max(statistics.maxDepth, depth);
    statistics.elementCountByTag[tagName] = (statistics.elementCountByTag[tagName] || 0) + 1;

    const classList = (node.getAttribute('class') || '').split(' ').filter(c => c.trim());
    const id = node.getAttribute('id') || '';
    
    // Collect all attributes
    const attributes = {};
    if (node.attributes) {
      for (const attr of node.attributes) {
        attributes[attr.name] = attr.value;
      }
    }

    // Get text content (direct text, not from children)
    const textContent = node.childNodes
      .filter(n => n.nodeType === 3)
      .map(n => n.textContent.trim())
      .filter(t => t.length > 0)
      .join(' ');

    // Build hierarchical path
    const pathSegment = tagName + (id ? `#${id}` : '') + (classList.length > 0 ? `.${classList.join('.')}` : '');
    const currentPath = [...parentPath, pathSegment];

    const selector = tagName + (id ? `#${id}` : '') + (classList.length > 0 ? `.${classList.join('.')}` : '');

    const nodeInfo = {
      tag: tagName,
      classes: classList,
      id: id,
      attributes: attributes,
      textContent: textContent,
      depth: depth,
      path: currentPath,
      selector: selector,
      children: []
    };

    // Traverse children
    const children = node.childNodes || [];
    children.forEach((child) => {
      const childInfo = traverse(child, depth + 1, currentPath);
      if (childInfo) {
        nodeInfo.children.push(childInfo);
      }
    });

    return nodeInfo;
  }

  // Start from root (or body if available)
  // For step content, HTML might not have body tag, so use root directly
  let startNode = root.querySelector('body');
  if (!startNode) {
    // If no body, check if root has direct children
    const children = root.childNodes || [];
    const elementChildren = children.filter(c => {
      if (c.nodeType === 3 || c.nodeType === 8) return false; // Skip text/comment nodes
      const tag = (c.tagName || '').toLowerCase();
      return tag && tag !== 'script' && tag !== 'style';
    });
    
    if (elementChildren.length > 0) {
      // Create a virtual root node
      const structure = {
        tag: 'root',
        classes: [],
        id: null,
        attributes: {},
        textContent: '',
        depth: -1,
        path: ['root'],
        selector: 'root',
        children: []
      };
      
      elementChildren.forEach(child => {
        const childInfo = traverse(child, 0, ['root']);
        if (childInfo) {
          structure.children.push(childInfo);
        }
      });
      
      return {
        root: structure,
        statistics: statistics
      };
    }
    startNode = root;
  }
  const structure = traverse(startNode, 0, []);

  return {
    root: structure,
    statistics: statistics
  };
}

/**
 * Vergleicht zwei HTML-Strukturen und identifiziert Unterschiede
 * @param {Object} expectedStructure - Erwartete Struktur
 * @param {Object} actualStructure - Tatsächliche Struktur
 * @returns {Array} Array von Unterschieden
 */
function compareHtmlStructures(expectedStructure, actualStructure) {
  const differences = [];

  function compareNodes(expectedNode, actualNode, path = []) {
    if (!expectedNode && !actualNode) return;
    
    const currentPath = [...path, expectedNode?.tag || actualNode?.tag || 'unknown'];

    if (!expectedNode && actualNode) {
      differences.push({
        type: 'extra_element',
        path: currentPath,
        depth: actualNode.depth,
        actualElement: {
          tag: actualNode.tag,
          classes: actualNode.classes,
          id: actualNode.id,
          selector: actualNode.selector,
          fullStructure: actualNode
        },
        message: `Extra element: <${actualNode.tag}${actualNode.id ? `#${actualNode.id}` : ''}${actualNode.classes.length > 0 ? `.${actualNode.classes.join('.')}` : ''}>`
      });
      // Continue comparing children if any
      if (actualNode.children) {
        actualNode.children.forEach(child => {
          compareNodes(null, child, currentPath);
        });
      }
      return;
    }

    if (expectedNode && !actualNode) {
      differences.push({
        type: 'missing_element',
        path: currentPath,
        depth: expectedNode.depth,
        expectedElement: {
          tag: expectedNode.tag,
          classes: expectedNode.classes,
          id: expectedNode.id,
          selector: expectedNode.selector,
          fullStructure: expectedNode
        },
        message: `Missing element: <${expectedNode.tag}${expectedNode.id ? `#${expectedNode.id}` : ''}${expectedNode.classes.length > 0 ? `.${expectedNode.classes.join('.')}` : ''}>`
      });
      // Continue comparing children if any
      if (expectedNode.children) {
        expectedNode.children.forEach(child => {
          compareNodes(child, null, currentPath);
        });
      }
      return;
    }

    // Both nodes exist - compare them
    // Compare tags
    if (expectedNode.tag !== actualNode.tag) {
      differences.push({
        type: 'tag_mismatch',
        path: currentPath,
        depth: expectedNode.depth,
        expectedElement: {
          tag: expectedNode.tag,
          classes: expectedNode.classes,
          id: expectedNode.id,
          selector: expectedNode.selector,
          fullStructure: expectedNode
        },
        actualElement: {
          tag: actualNode.tag,
          classes: actualNode.classes,
          id: actualNode.id,
          selector: actualNode.selector,
          fullStructure: actualNode
        },
        message: `Tag mismatch: expected <${expectedNode.tag}>, found <${actualNode.tag}>`
      });
    }

    // Compare classes
    const expectedClasses = new Set(expectedNode.classes);
    const actualClasses = new Set(actualNode.classes);
    const missingClasses = [...expectedClasses].filter(c => !actualClasses.has(c));
    const extraClasses = [...actualClasses].filter(c => !expectedClasses.has(c));

    if (missingClasses.length > 0 || extraClasses.length > 0) {
      differences.push({
        type: 'class_mismatch',
        path: currentPath,
        depth: expectedNode.depth,
        tag: expectedNode.tag,
        expectedElement: {
          tag: expectedNode.tag,
          classes: expectedNode.classes,
          id: expectedNode.id,
          selector: expectedNode.selector,
          fullStructure: expectedNode
        },
        actualElement: {
          tag: actualNode.tag,
          classes: actualNode.classes,
          id: actualNode.id,
          selector: actualNode.selector,
          fullStructure: actualNode
        },
        missingClasses: missingClasses,
        extraClasses: extraClasses,
        message: `Class mismatch on <${expectedNode.tag}>: missing [${missingClasses.join(', ')}], extra [${extraClasses.join(', ')}]`
      });
    }

    // Compare IDs
    if (expectedNode.id !== actualNode.id) {
      differences.push({
        type: 'id_mismatch',
        path: currentPath,
        depth: expectedNode.depth,
        expectedElement: {
          tag: expectedNode.tag,
          id: expectedNode.id,
          selector: expectedNode.selector,
          fullStructure: expectedNode
        },
        actualElement: {
          tag: actualNode.tag,
          id: actualNode.id,
          selector: actualNode.selector,
          fullStructure: actualNode
        },
        message: `ID mismatch: expected #${expectedNode.id || '(none)'}, found #${actualNode.id || '(none)'}`
      });
    }

    // Compare text content (if significant)
    if (expectedNode.textContent && actualNode.textContent && 
        expectedNode.textContent.trim() !== actualNode.textContent.trim()) {
      differences.push({
        type: 'text_content_mismatch',
        path: currentPath,
        depth: expectedNode.depth,
        expectedText: expectedNode.textContent,
        actualText: actualNode.textContent,
        message: `Text content mismatch on <${expectedNode.tag}>`
      });
    }

    // Compare children (match by position)
    const maxChildren = Math.max(
      expectedNode.children?.length || 0,
      actualNode.children?.length || 0
    );
    for (let i = 0; i < maxChildren; i++) {
      const expectedChild = expectedNode.children?.[i];
      const actualChild = actualNode.children?.[i];
      compareNodes(expectedChild, actualChild, currentPath);
    }
  }

  // Start comparison from root
  if (expectedStructure?.root && actualStructure?.root) {
    compareNodes(expectedStructure.root, actualStructure.root, []);
  } else if (expectedStructure?.root && !actualStructure?.root) {
    differences.push({
      type: 'missing_structure',
      message: 'Actual structure has no root element'
    });
  } else if (!expectedStructure?.root && actualStructure?.root) {
    differences.push({
      type: 'extra_structure',
      message: 'Actual structure has unexpected root element'
    });
  }

  return differences;
}

/**
 * Erkennt Pipeline-spezifische Fehler im HTML
 * @param {string} html - HTML-String
 * @returns {Array} Array von Pipeline-Fehler-Hinweisen
 */
function detectPipelineErrors(html) {
  const errors = [];

  // Check for raw block delimiters
  const rawDelimiterPattern = /---\s*\/?[a-z-]+\s*---/gi;
  const rawDelimiters = html.match(rawDelimiterPattern);
  if (rawDelimiters && rawDelimiters.length > 0) {
    errors.push({
      type: 'raw_block_delimiter',
      found: rawDelimiters,
      suggestion: 'Block delimiter was not converted to HTML structure'
    });
  }

  // Check for missing panel classes (common issue)
  const root = parse(html);
  const panels = root.querySelectorAll('.c-project-panel');
  panels.forEach((panel, index) => {
    const classes = panel.getAttribute('class') || '';
    if (!classes.includes('c-project-panel--ingredient') && 
        !classes.includes('c-project-panel--save') &&
        !classes.includes('c-project-panel--warning')) {
      // Might be missing a modifier class
      const heading = panel.querySelector('.c-project-panel__heading');
      if (heading) {
        errors.push({
          type: 'missing_panel_class',
          element: `panel[${index}]`,
          suggestion: 'Panel may be missing a modifier class (--ingredient, --save, etc.)'
        });
      }
    }
  });

  return errors;
}

/**
 * Generiert Zeilen-basierten Diff
 * @param {string} expected - Erwarteter HTML-String
 * @param {string} actual - Tatsächlicher HTML-String
 * @returns {Object} Diff-Informationen
 */
function generateLineBasedDiff(expected, actual) {
  const expectedLines = expected.split('\n');
  const actualLines = actual.split('\n');
  
  const maxLines = Math.max(expectedLines.length, actualLines.length);
  let firstDifferenceLine = -1;
  const unifiedDiff = ['--- Expected', '+++ Actual'];

  for (let i = 0; i < maxLines; i++) {
    const expectedLine = expectedLines[i] || '';
    const actualLine = actualLines[i] || '';

    if (expectedLine !== actualLine) {
      if (firstDifferenceLine === -1) {
        firstDifferenceLine = i + 1;
      }
      
      // Add context lines
      const contextStart = Math.max(0, i - 2);
      const contextEnd = Math.min(maxLines, i + 3);
      
      if (i === contextStart) {
        unifiedDiff.push(`@@ -${contextStart + 1},${contextEnd - contextStart} +${contextStart + 1},${contextEnd - contextStart} @@`);
      }
      
      if (expectedLine) {
        unifiedDiff.push(`-${expectedLine}`);
      }
      if (actualLine) {
        unifiedDiff.push(`+${actualLine}`);
      }
    } else if (firstDifferenceLine !== -1 && i < firstDifferenceLine + 5) {
      // Add context after difference
      unifiedDiff.push(` ${expectedLine}`);
    }
  }

  return {
    firstDifferenceLine: firstDifferenceLine,
    unifiedDiff: unifiedDiff.slice(0, 50) // Limit to first 50 lines
  };
}

/**
 * Vergleicht HTML-Content detailliert
 * @param {string} expectedHtml - Erwarteter HTML-String
 * @param {string} actualHtml - Tatsächlicher HTML-String
 * @returns {Object} Vollständige Diff-Analyse
 */
function compareHtmlContent(expectedHtml, actualHtml) {
  // Extract structures
  const expectedStructure = extractHtmlStructure(expectedHtml);
  const actualStructure = extractHtmlStructure(actualHtml);

  // Compare structures
  const structuralDifferences = compareHtmlStructures(expectedStructure, actualStructure);

  // Detect pipeline errors
  const pipelineErrors = detectPipelineErrors(actualHtml);

  // Generate line-based diff
  const lineBasedDiff = generateLineBasedDiff(expectedHtml, actualHtml);

  // Find first text content difference
  const expectedText = expectedStructure.root ? 
    extractTextContent(expectedStructure.root) : '';
  const actualText = actualStructure.root ? 
    extractTextContent(actualStructure.root) : '';
  
  let firstTextDifference = null;
  if (expectedText !== actualText) {
    const expectedLines = expectedText.split('\n');
    const actualLines = actualText.split('\n');
    for (let i = 0; i < Math.max(expectedLines.length, actualLines.length); i++) {
      if (expectedLines[i] !== actualLines[i]) {
        firstTextDifference = {
          line: i + 1,
          expectedText: expectedLines[i] || '',
          actualText: actualLines[i] || ''
        };
        break;
      }
    }
  }

  return {
    expectedStructure: expectedStructure,
    actualStructure: actualStructure,
    structuralDifferences: structuralDifferences,
    textContentDifferences: {
      firstDifference: firstTextDifference
    },
    lineBasedDiff: lineBasedDiff,
    pipelineErrorHints: pipelineErrors,
    statistics: {
      expectedLength: expectedHtml.length,
      actualLength: actualHtml.length,
      expectedElementCount: expectedStructure.statistics.totalElements,
      actualElementCount: actualStructure.statistics.totalElements,
      expectedTextLength: expectedText.length,
      actualTextLength: actualText.length,
      structuralDifferenceCount: structuralDifferences.length,
      textDifferenceCount: firstTextDifference ? 1 : 0
    }
  };
}

/**
 * Extrahiert Text-Inhalt aus Struktur-Baum
 */
function extractTextContent(node) {
  if (!node) return '';
  
  let text = node.textContent || '';
  if (node.children) {
    node.children.forEach(child => {
      text += ' ' + extractTextContent(child);
    });
  }
  return text.trim();
}

/**
 * Findet alle Projekte in test/snapshots mit repo/ Verzeichnis
 * @returns {Array} Array von Projekt-Informationen
 */
function findProjects() {
  const projects = [];
  
  if (!existsSync(snapshotsDir)) {
    return projects;
  }

  const entries = readdirSync(snapshotsDir);
  for (const entry of entries) {
    const entryPath = join(snapshotsDir, entry);
    const stat = statSync(entryPath);
    
    if (stat.isDirectory() && entry !== 'summary.json') {
      const repoPath = join(entryPath, 'repo');
      if (existsSync(repoPath)) {
        // Find available languages
        const languages = [];
        const repoEntries = readdirSync(repoPath);
        for (const langEntry of repoEntries) {
          const langPath = join(repoPath, langEntry);
          if (statSync(langPath).isDirectory()) {
            const metaPath = join(langPath, 'meta.yml');
            if (existsSync(metaPath)) {
              languages.push(langEntry);
            }
          }
        }
        
        if (languages.length > 0) {
          projects.push({
            slug: entry,
            languages: languages
          });
        }
      }
    }
  }
  
  return projects;
}

/**
 * Lädt Original-API-Daten
 */
function loadApiData(projectSlug, language) {
  const apiPath = join(snapshotsDir, projectSlug, `api-project-${language}.json`);
  if (!existsSync(apiPath)) {
    return null;
  }
  const data = JSON.parse(readFileSync(apiPath, 'utf-8'));
  return data;
}

/**
 * Vergleicht Step-Attribute (außer content)
 */
function compareStepAttributes(expectedStep, actualStep, stepIndex) {
  const differences = [];

  // Compare title
  if (expectedStep.title !== actualStep.title) {
    differences.push({
      path: `steps[${stepIndex}].title`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/title`,
      type: 'value_mismatch',
      expected: expectedStep.title,
      actual: actualStep.title
    });
  }

  // Compare position
  if (expectedStep.position !== actualStep.position) {
    differences.push({
      path: `steps[${stepIndex}].position`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/position`,
      type: 'value_mismatch',
      expected: expectedStep.position,
      actual: actualStep.position
    });
  }

  // Compare quiz
  if (expectedStep.quiz !== actualStep.quiz) {
    differences.push({
      path: `steps[${stepIndex}].quiz`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/quiz`,
      type: 'value_mismatch',
      expected: expectedStep.quiz,
      actual: actualStep.quiz
    });
  }

  // Compare challenge
  if (expectedStep.challenge !== actualStep.challenge) {
    differences.push({
      path: `steps[${stepIndex}].challenge`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/challenge`,
      type: 'value_mismatch',
      expected: expectedStep.challenge,
      actual: actualStep.challenge
    });
  }

  // Compare completion arrays
  if (JSON.stringify(expectedStep.completion) !== JSON.stringify(actualStep.completion)) {
    differences.push({
      path: `steps[${stepIndex}].completion`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/completion`,
      type: 'array_mismatch',
      expected: expectedStep.completion,
      actual: actualStep.completion
    });
  }

  // Compare ingredients arrays
  if (JSON.stringify(expectedStep.ingredients) !== JSON.stringify(actualStep.ingredients)) {
    differences.push({
      path: `steps[${stepIndex}].ingredients`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/ingredients`,
      type: 'array_mismatch',
      expected: expectedStep.ingredients,
      actual: actualStep.ingredients
    });
  }

  // Compare knowledgeQuiz
  const expectedQuiz = expectedStep.knowledgeQuiz || (expectedStep.knowledgeQuiz === null ? null : {});
  const actualQuiz = actualStep.knowledgeQuiz || (actualStep.knowledgeQuiz === null ? null : {});
  if (JSON.stringify(expectedQuiz) !== JSON.stringify(actualQuiz)) {
    differences.push({
      path: `steps[${stepIndex}].knowledgeQuiz`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/knowledgeQuiz`,
      type: 'value_mismatch',
      expected: expectedQuiz,
      actual: actualQuiz
    });
  }

  return differences;
}

/**
 * Haupttest: Vergleicht alle Projekte
 */
test('step-content-exact - all projects', async () => {
  const projects = findProjects();
  
  if (projects.length === 0) {
    console.log('No projects found in test/snapshots/');
    return;
  }

  const allDifferences = [];

  for (const project of projects) {
    for (const language of project.languages) {
      // Load API data
      const apiData = loadApiData(project.slug, language);
      if (!apiData) {
        console.log(`Skipping ${project.slug}/${language} - API file not found`);
        continue;
      }

      // Parse project
      const projectPath = join(snapshotsDir, project.slug, 'repo', language);
      let parsedData;
      try {
        parsedData = await parseProject(projectPath, { languages: [language] });
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

  // Output results
  if (allDifferences.length > 0) {
    console.log('\n' + '='.repeat(80));
    console.log(`Found ${allDifferences.length} difference(s) across all projects`);
    console.log('='.repeat(80));

    // Group by project
    const byProject = {};
    allDifferences.forEach(diff => {
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
    assert.fail(`Found ${allDifferences.length} difference(s). See output above and ${exportPath} for details.`);
  } else {
    console.log('\n✓ All step content attributes match exactly!');
  }
});

