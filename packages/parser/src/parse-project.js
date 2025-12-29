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
    const parts = projectPath.split('/');
    currentLanguage = parts[parts.length - 1] || parts[parts.length - 2] || 'en';
  }

  // Read meta.yml
  const metaPath = join(actualPath, 'meta.yml');
  const meta = parseMeta(metaPath);
  
  // Determine base path for transclusions (go up to snapshots directory)
  const parts = actualPath.split('/');
  const snapshotsIndex = parts.indexOf('snapshots');
  const basePath = snapshotsIndex !== -1 
    ? parts.slice(0, snapshotsIndex + 1).join('/')
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
      
      let content = await parseTutorial(markdown, {
        basePath,
        transclusionCache,
        languages: preferredLanguages
      });
      
      // If step has a quiz, parse and embed it
      let knowledgeQuiz = metaStep.knowledgeQuiz;
      if (metaStep.quiz && metaStep.knowledgeQuiz) {
        // knowledgeQuiz can be either a string (path) or an object with path property
        const quizPathValue = typeof metaStep.knowledgeQuiz === 'string' 
          ? metaStep.knowledgeQuiz 
          : metaStep.knowledgeQuiz.path;
        const quizPath = join(actualPath, quizPathValue);
        try {
          const quizData = await parseQuiz(quizPath, {
            basePath,
            transclusionCache,
            languages: preferredLanguages
          });
          // Embed quiz HTML into step content
          // Find where to insert (usually after the main content)
          // For now, append at the end
          content += '\n' + quizData.html;
        } catch (error) {
          console.warn(`Failed to parse quiz at ${quizPath}:`, error.message);
          // Continue without quiz
        }
      }
      
      // Determine quiz flag: true if knowledgeQuiz exists, otherwise use metaStep.quiz
      const hasQuiz = !!knowledgeQuiz;
      const quizFlag = hasQuiz || metaStep.quiz || false;
      
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
        // Convert knowledgeQuiz object to string for API compatibility
        // Original API uses string (e.g., "quiz1"), not object
        // If empty, return {} (empty object) instead of null to match API
        knowledgeQuiz: knowledgeQuiz ? (typeof knowledgeQuiz === 'string' ? knowledgeQuiz : knowledgeQuiz.path) : {}
      };
    })
  );
  
  // Build API-compatible structure
  return {
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
          steps
        }
      }
    },
    included: [] // TODO: Add pathways etc.
  };
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

