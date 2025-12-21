/**
 * Parse complete project directory
 */

import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { parseMeta } from './utils/parse-meta.js';
import { parseTutorial } from './parse-tutorial.js';

/**
 * Parse complete project directory
 * Reads meta.yml and all step files
 * 
 * @param {string} projectPath - Path to tutorial directory (e.g., silly-eyes/repo/en/)
 * @returns {Promise<Object>} JSON structure matching RPL API format
 */
export async function parseProject(projectPath) {
  // Read meta.yml
  const metaPath = join(projectPath, 'meta.yml');
  const meta = parseMeta(metaPath);
  
  // Parse steps defined in meta.yml
  const steps = await Promise.all(
    meta.steps.map(async (metaStep, index) => {
      const file = `step_${index + 1}.md`;
      const filePath = join(projectPath, file);
      const markdown = readFileSync(filePath, 'utf-8');
      const content = await parseTutorial(markdown);
      
      return {
        title: metaStep.title || extractTitle(markdown),
        content,
        position: index,
        quiz: metaStep.quiz || false,
        challenge: false, // TODO: Detect from content
        completion: metaStep.completion || [],
        ingredients: metaStep.ingredients || [],
        knowledgeQuiz: metaStep.knowledgeQuiz || {}
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
          metaTitle: meta.metaTitle,
          metaDescription: meta.metaDescription,
          pdf: meta.pdf,
          steps
        },
        version: meta.version,
        listed: meta.listed,
        copyedit: meta.copyedit,
        lastTested: meta.lastTested
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

