/**
 * Parse meta.yml file and map to API structure
 */

import { readFileSync } from 'fs';
import yaml from 'js-yaml';

/**
 * Parse meta.yml file
 * @param {string} filePath - Path to meta.yml
 * @returns {Object} Parsed metadata matching API structure
 */
export function parseMeta(filePath) {
  const content = readFileSync(filePath, 'utf-8');
  const data = yaml.load(content);
  
  // Map to API attributes structure
  return {
    title: data.title,
    description: data.description,
    heroImage: data.hero_image,
    metaTitle: data.meta_title,
    metaDescription: data.meta_description,
    pdf: data.pdf,
    version: data.version,
    listed: data.listed ?? true,
    copyedit: data.copyedit ?? false,
    lastTested: data.last_tested,
    steps: (data.steps || []).map((step, index) => ({
      title: step.title,
      position: index,
      quiz: !!step.knowledge_quiz,
      challenge: false, // Will be determined from markdown content
      completion: step.completion || [],
      ingredients: step.ingredients || [],
      knowledgeQuiz: step.knowledge_quiz?.path || (step.knowledge_quiz ? step.knowledge_quiz.path || 'quiz1' : null)
    }))
  };
}
