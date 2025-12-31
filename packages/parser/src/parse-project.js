/**
 * Parse complete project directory
 */

import { readdirSync, readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { parseMeta } from './utils/parse-meta.js';
import { parseTutorial } from './parse-tutorial.js';
import { parseQuiz } from './parse-quiz.js';

/**
 * Parse complete project directory
 * Reads meta.yml and all step files
 * 
 * @param {string} projectPath - Path to tutorial directory (e.g., silly-eyes/repo/en/ or silly-eyes/repo/)
 * @param {Object} options - Parser options
 * @param {string[]} options.languages - Preferred languages (e.g., ['de-DE', 'en'])
 * @returns {Promise<Object>} JSON structure matching RPL API format
 */
export async function parseProject(projectPath, options = {}) {
  const preferredLanguages = options.languages || ['en'];
  const depth = options.depth || 0;
  
  // Determine actual project path (handle language fallback)
  let actualPath = projectPath;
  let currentLanguage = 'en';

  if (!existsSync(join(projectPath, 'meta.yml'))) {
    for (const lang of preferredLanguages) {
      const langPath = join(projectPath, lang);
      if (existsSync(join(langPath, 'meta.yml'))) {
        actualPath = langPath;
        currentLanguage = lang;
        break;
      }
    }
  } else {
    // If meta.yml exists directly, try to infer language from path
    const pathParts = projectPath.split('/');
    currentLanguage = pathParts[pathParts.length - 1] || pathParts[pathParts.length - 2] || 'en';
  }

  // Read meta.yml
  const metaPath = join(actualPath, 'meta.yml');
  const meta = parseMeta(metaPath);
  
  // Determine base path for transclusions (go up to projects directory within content)
  const parts = actualPath.split('/');
  const projectsIndex = parts.lastIndexOf('projects');
  const basePath = projectsIndex !== -1 
    ? parts.slice(0, projectsIndex + 1).join('/')
    : null;
  
  // Shared transclusion cache for all steps
  const transclusionCache = new Map();
  
  // Parse steps defined in meta.yml
  const steps = await Promise.all(
    meta.steps.map(async (metaStep, index) => {
      const file = `step_${index + 1}.md`;
      const filePath = join(actualPath, file);
      const markdown = readFileSync(filePath, 'utf-8');
      
      // Extract ingredients from transclusions in markdown
      // Transclusions are in the format: [[[project-name]]]
      const transclusionMatches = markdown.match(/\[\[\[([a-z0-9-]+)\]\]\]/g);
      const ingredients = metaStep.ingredients || [];
      if (transclusionMatches) {
        transclusionMatches.forEach(match => {
          const projectName = match.match(/\[\[\[([a-z0-9-]+)\]\]\]/)[1];
          if (!ingredients.includes(projectName)) {
            ingredients.push(projectName);
          }
        });
      }
      
      const parseResult = await parseTutorial(markdown, {
        basePath,
        transclusionCache,
        languages: preferredLanguages,
        assetBaseUrl: options.assetBaseUrl,
        stepIndex: index,
        depth
      });
      let content = parseResult.html || parseResult; // Support both old and new return format
      const stepWarnings = parseResult.warnings || [];
      
      // If step has a quiz, parse and embed it
      let quizData = null;
      if (metaStep.knowledgeQuiz) {
        // knowledgeQuiz can be either a string (path) or an object with path property
        const quizPathValue = typeof metaStep.knowledgeQuiz === 'string' 
          ? metaStep.knowledgeQuiz 
          : metaStep.knowledgeQuiz.path;
        const quizPath = join(actualPath, quizPathValue);
        try {
          quizData = await parseQuiz(quizPath, {
            basePath,
            transclusionCache,
            languages: preferredLanguages
          });
        } catch (error) {
          console.warn(`Failed to parse quiz at ${quizPath}:`, error.message);
          // Continue without quiz
        }
      }
      
      // Determine content (embed quiz HTML if requested and available)
      if (metaStep.knowledgeQuiz && !options.includeQuizData) {
        content = '';
      } else if (quizData && options.includeQuizData) {
        content = quizData.html || '';
      }
      
      // Determine quiz flag: only use metaStep.quiz (legacy behavior)
      const quizFlag = metaStep.quiz || false;
      
      // Normalize completion: ensure it's always an array (API sometimes has undefined or "")
      let completion = metaStep.completion || [];
      if (!Array.isArray(completion)) {
        completion = [];
      }
      
      return {
        title: metaStep.title || extractTitle(markdown),
        content,
        position: index,
        quiz: quizFlag,
        challenge: false, // TODO: Detect from content
        completion: completion,
        ingredients: ingredients,
        // Match original API format: string path for knowledgeQuiz
        knowledgeQuiz: metaStep.knowledgeQuiz 
          ? (typeof metaStep.knowledgeQuiz === 'string' ? metaStep.knowledgeQuiz : metaStep.knowledgeQuiz.path)
          : null,
        // Include full quiz data if requested (for integration tests/web app)
        quizData: options.includeQuizData ? quizData : undefined,
        // Include parsing warnings if any
        warnings: stepWarnings.length > 0 ? stepWarnings : undefined
      };
    })
  );
  
  // Collect all warnings from steps BEFORE removing them
    const allWarnings = steps
    .flatMap((step, index) => {
      const stepWarnings = step.warnings || [];
      return stepWarnings.map(w => ({ 
        ...w, 
        stepIndex: index, 
        stepTitle: step.title,
        stepPosition: step.position
      }));
    })
    .filter(w => w); // Remove undefined/null
  
  // Build API-compatible structure
  const result = {
    data: {
      type: 'projects',
      attributes: {
        content: {
          title: meta.title,
          description: meta.description,
          heroImage: meta.heroImage,
          version: meta.version,
          listed: meta.listed,
          copyedit: meta.copyedit,
          lastTested: meta.lastTested,
          metaTitle: meta.metaTitle,
          metaDescription: meta.metaDescription,
          pdf: meta.pdf,
          steps: steps.map(({ warnings, quizData, ...step }) => step)
        }
      }
    },
    included: [] // TODO: Add pathways etc.
  };
  
  // Add warnings at root level if any
  if (allWarnings.length > 0) {
    result.warnings = allWarnings;
  }
  
  return result;
}

/**
 * Extract title from markdown (first heading)
 * @param {string} markdown 
 * @returns {string}
 */
function extractTitle(markdown) {
  const match = markdown.match(/^##?\s+(.+)$/m);
  return match ? match[1] : 'Untitled';
}

