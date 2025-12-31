import { readFileSync, existsSync, readdirSync, statSync } from 'fs';
import { join } from 'path';
import { parse } from 'node-html-parser';

/**
 * Normalisiert Text für den Vergleich (Whitespace, Smart Quotes)
 */
export function normalizeText(text) {
  if (typeof text !== 'string') return text;
  return text
    .replace(/[\u201C\u201D\u201E\u201F\u201C\u201D]/g, '"') // Double smart quotes
    .replace(/[\u2018\u2019\u201A\u201B]/g, "'") // Single smart quotes
    .replace(/\s+/g, ' ') // Collapse whitespace
    .trim();
}

/**
 * Extrahiert vollständige hierarchische HTML-Struktur
 * @param {string} html - HTML-String
 * @returns {Object} Struktur-Baum mit allen Element-Informationen
 */
export function extractHtmlStructure(html) {
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
    let id = node.getAttribute('id') || '';
    if (id) id = id.replace(/-+$/, ''); // Normalize ID (remove trailing hyphens)
    
    // Collect all attributes
    const attributes = {};
    if (node.attributes) {
      const attrEntries = Array.isArray(node.attributes) 
        ? node.attributes.map(a => [a.name, a.value])
        : Object.entries(node.attributes);
        
      for (const [name, value] of attrEntries) {
        let normalizedValue = value;
        
        // Normalize image src: only keep the filename
        if (tagName === 'img' && name === 'src') {
          normalizedValue = value.split('/').pop();
        }
        
        // Normalize link href: if relative, keep only the filename
        if (tagName === 'a' && name === 'href') {
          if (value && !value.startsWith('http') && !value.startsWith('#')) {
            normalizedValue = value.split('/').pop();
          }
        }
        
        // Normalize id attribute
        if (name === 'id') {
          normalizedValue = value.replace(/-+$/, '');
        }

        // Normalize text-like attributes
        if (['alt', 'title', 'aria-label'].includes(name)) {
          normalizedValue = normalizeText(value);
        }
        
        attributes[name] = normalizedValue;
      }
    }

    // Get text content (direct text, not from children)
    const textContent = normalizeText(
      node.childNodes
        .filter(n => n.nodeType === 3)
        .map(n => n.textContent)
        .join(' ')
    );

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

  let startNode = root.querySelector('body');
  if (!startNode) {
    const children = root.childNodes || [];
    const elementChildren = children.filter(c => {
      if (c.nodeType === 3 || c.nodeType === 8) return false;
      const tag = (c.tagName || '').toLowerCase();
      return tag && tag !== 'script' && tag !== 'style';
    });
    
    if (elementChildren.length > 0) {
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
 */
export function compareHtmlStructures(expectedStructure, actualStructure) {
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
      if (expectedNode.children) {
        expectedNode.children.forEach(child => {
          compareNodes(child, null, currentPath);
        });
      }
      return;
    }

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
 */
export function detectPipelineErrors(html) {
  const errors = [];
  const rawDelimiterPattern = /---\s*\/?[a-z-]+\s*---/gi;
  const rawDelimiters = html.match(rawDelimiterPattern);
  if (rawDelimiters && rawDelimiters.length > 0) {
    errors.push({
      type: 'raw_block_delimiter',
      found: rawDelimiters,
      suggestion: 'Block delimiter was not converted to HTML structure'
    });
  }

  const root = parse(html);
  const panels = root.querySelectorAll('.c-project-panel');
  panels.forEach((panel, index) => {
    const classes = panel.getAttribute('class') || '';
    if (!classes.includes('c-project-panel--ingredient') && 
        !classes.includes('c-project-panel--save') &&
        !classes.includes('c-project-panel--warning')) {
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
 */
export function generateLineBasedDiff(expected, actual) {
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
      unifiedDiff.push(` ${expectedLine}`);
    }
  }

  return {
    firstDifferenceLine: firstDifferenceLine,
    unifiedDiff: unifiedDiff.slice(0, 50)
  };
}

/**
 * Extrahiert Text-Inhalt aus Struktur-Baum
 */
export function extractTextContent(node) {
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
 * Vergleicht HTML-Content detailliert
 */
export function compareHtmlContent(expectedHtml, actualHtml) {
  const expectedStructure = extractHtmlStructure(expectedHtml);
  const actualStructure = extractHtmlStructure(actualHtml);
  const structuralDifferences = compareHtmlStructures(expectedStructure, actualStructure);
  const pipelineErrors = detectPipelineErrors(actualHtml);
  const lineBasedDiff = generateLineBasedDiff(expectedHtml, actualHtml);

  const expectedText = expectedStructure.root ? extractTextContent(expectedStructure.root) : '';
  const actualText = actualStructure.root ? extractTextContent(actualStructure.root) : '';
  
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
    expectedStructure,
    actualStructure,
    structuralDifferences,
    textContentDifferences: {
      firstDifference: firstTextDifference
    },
    lineBasedDiff,
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
 * Findet alle Projekte in test/snapshots mit repo/ Verzeichnis
 */
export function findProjects(snapshotsDir) {
  const projects = [];
  if (!existsSync(snapshotsDir)) return projects;

  const entries = readdirSync(snapshotsDir);
  for (const entry of entries) {
    const entryPath = join(snapshotsDir, entry);
    const stat = statSync(entryPath);
    
    if (stat.isDirectory() && entry !== 'summary.json') {
      const repoPath = join(entryPath, 'repo');
      if (existsSync(repoPath)) {
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
export function loadApiData(snapshotsDir, projectSlug, language) {
  const apiPath = join(snapshotsDir, projectSlug, `api-project-${language}.json`);
  if (!existsSync(apiPath)) return null;
  return JSON.parse(readFileSync(apiPath, 'utf-8'));
}

/**
 * Lädt Original-Quiz-API-Daten
 */
export function loadQuizApiData(snapshotsDir, projectSlug, quizSlug, language) {
  const apiPath = join(snapshotsDir, projectSlug, `api-quiz-${quizSlug}-${language}.json`);
  if (!existsSync(apiPath)) return null;
  return JSON.parse(readFileSync(apiPath, 'utf-8'));
}

/**
 * Vergleicht Step-Attribute (außer content)
 */
export function compareStepAttributes(expectedStep, actualStep, stepIndex) {
  const differences = [];

  const expectedTitle = normalizeText(expectedStep.title);
  const actualTitle = normalizeText(actualStep.title);

  if (expectedTitle !== actualTitle) {
    differences.push({
      path: `steps[${stepIndex}].title`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/title`,
      type: 'value_mismatch',
      expected: expectedTitle,
      actual: actualTitle
    });
  }

  if (expectedStep.position !== actualStep.position) {
    differences.push({
      path: `steps[${stepIndex}].position`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/position`,
      type: 'value_mismatch',
      expected: expectedStep.position,
      actual: actualStep.position
    });
  }

  if (expectedStep.quiz !== actualStep.quiz) {
    if (!expectedStep.knowledgeQuiz || 
        (typeof expectedStep.knowledgeQuiz === 'object' && Object.keys(expectedStep.knowledgeQuiz).length === 0) || 
        expectedStep.knowledgeQuiz === '{}') {
      differences.push({
        path: `steps[${stepIndex}].quiz`,
        jsonPath: `/data/attributes/content/steps/${stepIndex}/quiz`,
        type: 'value_mismatch',
        field: 'quiz',
        expected: expectedStep.quiz,
        actual: actualStep.quiz
      });
    }
  }

  if (expectedStep.challenge !== actualStep.challenge) {
    differences.push({
      path: `steps[${stepIndex}].challenge`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/challenge`,
      type: 'value_mismatch',
      expected: expectedStep.challenge,
      actual: actualStep.challenge
    });
  }

  const expectedCompletion = Array.isArray(expectedStep.completion) ? expectedStep.completion : [];
  const actualCompletion = Array.isArray(actualStep.completion) ? actualStep.completion : [];
  if (JSON.stringify(expectedCompletion) !== JSON.stringify(actualCompletion)) {
    differences.push({
      path: `steps[${stepIndex}].completion`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/completion`,
      type: 'array_mismatch',
      field: 'completion',
      expected: expectedCompletion,
      actual: actualCompletion
    });
  }

  if (JSON.stringify(expectedStep.ingredients) !== JSON.stringify(actualStep.ingredients)) {
    differences.push({
      path: `steps[${stepIndex}].ingredients`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/ingredients`,
      type: 'array_mismatch',
      field: 'ingredients',
      expected: expectedStep.ingredients,
      actual: actualStep.ingredients
    });
  }

  const normalizeQuiz = (q) => {
    if (typeof q === 'string') return q;
    if (q && typeof q === 'object' && Object.keys(q).length > 0) return q;
    return {};
  };
  const expectedQuiz = normalizeQuiz(expectedStep.knowledgeQuiz);
  const actualQuiz = normalizeQuiz(actualStep.knowledgeQuiz);
  
  if (JSON.stringify(expectedQuiz) !== JSON.stringify(actualQuiz)) {
    differences.push({
      path: `steps[${stepIndex}].knowledgeQuiz`,
      jsonPath: `/data/attributes/content/steps/${stepIndex}/knowledgeQuiz`,
      type: 'value_mismatch',
      field: 'knowledgeQuiz',
      expected: expectedQuiz,
      actual: actualQuiz
    });
  }

  return differences;
}

/**
 * Extrahiert Strukturen aller Quiz-Fragen aus HTML
 */
export function extractQuizStructures(htmlString) {
  const root = parse(htmlString);
  const containers = root.querySelectorAll('form.knowledge-quiz-question, div.knowledge-quiz-question');
  
  return containers.map(container => {
    const fieldset = container.querySelector('fieldset');
    const legend = normalizeText(fieldset?.querySelector('legend')?.textContent || '');
    const blurb = container.querySelector('.knowledge-quiz-question__blurb')?.innerHTML || '';
    
    const answers = container.querySelectorAll('.knowledge-quiz-question__answer').map((answer, index) => {
      const input = answer.querySelector('input[type="radio"]');
      const label = answer.querySelector('label');
      
      return {
        index: index + 1,
        id: input?.getAttribute('id') || '',
        name: input?.getAttribute('name') || '',
        value: input?.getAttribute('value') || '',
        checked: input?.hasAttribute('checked'),
        dataCorrect: input?.getAttribute('data-correct') || '',
        labelHtml: label?.innerHTML || '',
        labelText: normalizeText(label?.textContent || '')
      };
    });
    
    const feedbacks = container.querySelectorAll('.knowledge-quiz-question__feedback-item').map((item, index) => {
      return {
        index: index + 1,
        id: item.getAttribute('id') || '',
        html: item.innerHTML || '',
        text: normalizeText(item.textContent || '')
      };
    });
    
    const button = container.querySelector('input[type="button"]');
    
    return {
      tag: container.tagName.toLowerCase(),
      className: container.getAttribute('class') || '',
      legend,
      answersCount: answers.length,
      answers,
      feedbacksCount: feedbacks.length,
      feedbacks,
      buttonValue: button?.getAttribute('value') || '',
      buttonName: button?.getAttribute('name') || ''
    };
  });
}
